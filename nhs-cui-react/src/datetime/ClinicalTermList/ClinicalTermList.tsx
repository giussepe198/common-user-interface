import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cx, useId, useControllableState, Icon, VisuallyHidden } from '../../core';
import { TextMeasure, findIdenticalTruncations, truncateEnd, truncationAtoms } from '../utils/truncation';

/** A coded clinical term in a selection list, e.g. a SNOMED CT preferred term. */
export interface ClinicalTerm {
  id: string;
  /** Full term text (never pre-truncated by the host). */
  term: string;
}

export interface ClinicalTermListProps {
  /** Visible label for the list. */
  label: string;
  items: ClinicalTerm[];
  /** Selected item id (controlled). */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (id: string | null) => void;
  /**
   * The user chose to act on an item (Enter or double-click). When the item is shortened on screen,
   * the first Enter shows the full term and only a second Enter acts (T7: full text displayed and
   * acknowledged before any action).
   */
  onActivate?: (item: ClinicalTerm) => void;
  /**
   * "none" (default): terms wrap in full and the list scrolls vertically (T1: avoid truncation).
   * "end": long terms are cut at the end between whole words, never inside numbers or units, with an
   * ellipsis and a truncation symbol (T2, T3, T5); used only as a last resort.
   */
  truncation?: 'none' | 'end';
  /** Show the "Show all terms in full" control when truncation is on (T7). Default true. */
  showFullTextToggle?: boolean;
  /** The user can drag the list wider (T1, T7). Default true. */
  resizable?: boolean;
  /** Require the full text to be shown before `onActivate` for a shortened term (T7). Default true. */
  requireFullTextAcknowledgement?: boolean;
  /** Maximum list height in pixels before it scrolls vertically. Default 320. */
  maxHeight?: number;
  /** Text width measure, e.g. canvas measureText. Default: measured with the list's font. */
  measure?: TextMeasure;
  /** Text when there are no items. Default "No terms to show". */
  emptyText?: string;
  className?: string;
  id?: string;
}

const SYMBOL_WIDTH = 24;
const PADDING = 16;
let canvas: HTMLCanvasElement | null = null;

function defaultMeasure(el: HTMLElement): TextMeasure {
  if (!canvas) canvas = document.createElement('canvas');
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    ctx = null;
  }
  if (!ctx) return s => s.length * 7;
  const cs = getComputedStyle(el);
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const c = ctx;
  return s => c.measureText(s).width;
}

/** Keep numbers with their units when wrapping (T1). */
const glued = (text: string) => truncationAtoms(text).map(a => a.replace(/ /g, ' ')).join(' ');

/**
 * Selection list of coded clinical terms that follows the truncation consultation: full terms with a
 * vertical scroll bar by default; optional end truncation with ellipsis and a symbol per shortened
 * item; inline expansion; "Show all terms in full"; automatic full display when shortened terms look
 * identical (T6); full text shown before any action on a shortened term (T7).
 */
export function ClinicalTermList({
  label, items, value: valueProp, defaultValue = null, onChange, onActivate, truncation = 'none', showFullTextToggle = true,
  resizable = true, requireFullTextAcknowledgement = true, maxHeight = 320, measure, emptyText = 'No terms to show', className, id,
}: ClinicalTermListProps) {
  const baseId = useId('cui-term-list', id);
  const [value, setValue] = useControllableState<string | null>(valueProp, defaultValue, onChange);
  const [active, setActive] = useState<string | null>(value ?? items[0]?.id ?? null);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState('');
  const [width, setWidth] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || truncation === 'none') return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [truncation]);

  const { displays, identical } = useMemo(() => {
    const map = new Map<string, { display: string; truncated: boolean }>();
    if (truncation === 'none' || showAll || width <= 0 || !listRef.current) {
      items.forEach(i => map.set(i.id, { display: i.term, truncated: false }));
      return { displays: map, identical: false };
    }
    const m = measure ?? defaultMeasure(listRef.current);
    const avail = Math.max(40, width - PADDING - SYMBOL_WIDTH);
    items.forEach(i => map.set(i.id, truncateEnd(i.term, avail, m)));
    const groups = findIdenticalTruncations(items.map(i => ({ id: i.id, text: i.term, display: map.get(i.id)!.display })));
    if (groups.length) {
      // T6: identical shortened terms in a fixed-width list: show the list without truncation
      items.forEach(i => map.set(i.id, { display: i.term, truncated: false }));
      return { displays: map, identical: true };
    }
    return { displays: map, identical: false };
  }, [items, truncation, showAll, width, measure]);

  const anyTruncated = items.some(i => displays.get(i.id)?.truncated);
  const isShortened = (itemId: string) => !!displays.get(itemId)?.truncated && !expanded.has(itemId);

  const move = (itemId: string) => {
    setActive(itemId);
    setValue(itemId);
    const el = document.getElementById(`${baseId}-opt-${itemId}`);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  };

  const expand = (itemId: string, on: boolean) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (on) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  };

  const activate = (item: ClinicalTerm) => {
    if (requireFullTextAcknowledgement && isShortened(item.id)) {
      expand(item.id, true);
      setMessage(`Full term shown: ${item.term}. Press Enter again to use it.`);
      return;
    }
    setMessage('');
    onActivate?.(item);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (!items.length) return;
    const idx = Math.max(0, items.findIndex(i => i.id === active));
    let next: number | null = null;
    if (e.key === 'ArrowDown') next = Math.min(items.length - 1, idx + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, idx - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      move(items[next].id);
      return;
    }
    const current = items[idx];
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value !== current.id) setValue(current.id);
      activate(current);
    } else if (e.key === ' ') {
      e.preventDefault();
      move(current.id);
    } else if (e.key === 'ArrowRight' && displays.get(current.id)?.truncated) {
      e.preventDefault();
      expand(current.id, true);
    } else if (e.key === 'ArrowLeft' && expanded.has(current.id)) {
      e.preventDefault();
      expand(current.id, false);
    }
  };

  return (
    <div className={cx('cui-term-list', resizable && 'cui-term-list--resizable', className)}>
      <div className="cui-term-list__head">
        <span id={`${baseId}-label`} className="cui-term-list__label">{label}</span>
        {truncation === 'end' && showFullTextToggle && !identical ? (
          <button
            type="button"
            className="cui-term-list__toggle"
            aria-pressed={showAll}
            onClick={() => setShowAll(s => !s)}
            disabled={!showAll && !anyTruncated}
          >
            <Icon name={showAll ? 'minus' : 'plus'} size={16} />
            {showAll ? 'Shorten long terms' : 'Show all terms in full'}
          </button>
        ) : null}
      </div>
      {identical ? (
        <div className="cui-term-list__notice" role="status">
          <Icon name="info" size={16} />
          <span>Some terms looked the same when shortened, so all terms are shown in full.</span>
        </div>
      ) : null}
      <ul
        ref={listRef}
        role="listbox"
        tabIndex={0}
        aria-labelledby={`${baseId}-label`}
        aria-activedescendant={active ? `${baseId}-opt-${active}` : undefined}
        aria-describedby={anyTruncated ? `${baseId}-help` : undefined}
        className="cui-term-list__list"
        style={{ maxHeight }}
        onKeyDown={onKeyDown}
      >
        {items.length === 0 ? <li className="cui-term-list__empty" role="presentation">{emptyText}</li> : null}
        {items.map(item => {
          const d = displays.get(item.id) ?? { display: item.term, truncated: false };
          const shortened = d.truncated && !expanded.has(item.id);
          return (
            <li
              key={item.id}
              id={`${baseId}-opt-${item.id}`}
              role="option"
              aria-selected={value === item.id}
              className={cx(
                'cui-term-list__item',
                value === item.id && 'cui-term-list__item--selected',
                active === item.id && 'cui-term-list__item--active',
                shortened && 'cui-term-list__item--truncated',
              )}
              onClick={() => move(item.id)}
              onDoubleClick={() => activate(item)}
            >
              {shortened ? (
                <>
                  <span aria-hidden="true" className="cui-term-list__text">{d.display}</span>
                  <span
                    aria-hidden="true"
                    className="cui-term-list__symbol"
                    title="Show the full term"
                    onClick={e => {
                      e.stopPropagation();
                      setActive(item.id);
                      expand(item.id, true);
                    }}
                  >
                    <Icon name="more" size={16} />
                  </span>
                  <VisuallyHidden>{`${item.term} (shortened on screen)`}</VisuallyHidden>
                </>
              ) : (
                <span className="cui-term-list__text cui-term-list__text--full">{glued(item.term)}</span>
              )}
            </li>
          );
        })}
      </ul>
      {anyTruncated ? (
        <div id={`${baseId}-help`} className="cui-visually-hidden">
          Some terms are shortened. Press the right arrow key to show the full term.
        </div>
      ) : null}
      <div className="cui-visually-hidden" aria-live="polite">{message}</div>
    </div>
  );
}
