import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cx, useId, Icon, VisuallyHidden } from '../../core';
import { TruncationResult, truncateEnd, truncateMiddle, truncationAtoms } from '../utils/truncation';

export interface TruncatedTextProps {
  /** The full text, e.g. a SNOMED CT preferred term. */
  text: string;
  /**
   * "end" (default): cut at the end of a single line. "middle": keep both ends, single line only (T2).
   * "wrap": never truncate; wrap without hyphenation and keep numbers with their units (T1).
   */
  mode?: 'end' | 'middle' | 'wrap';
  /**
   * How the full text is reached (T7). "inline" (default, preferred by users): a separate button
   * expands the text in place. "flyout": the full text appears below on hover (after a short delay)
   * or keyboard focus.
   */
  reveal?: 'inline' | 'flyout';
  /** Show a truncation symbol after the ellipsis (T5, for selection lists). Default true. */
  showSymbol?: boolean;
  /** Called when the text becomes truncated or not. */
  onTruncationChange?: (truncated: boolean) => void;
  className?: string;
}

const SYMBOL_WIDTH = 26;
let canvas: HTMLCanvasElement | null = null;
function measurer(el: HTMLElement): (s: string) => number {
  if (!canvas) canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const cs = getComputedStyle(el);
  if (!ctx) return s => s.length * 7;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return s => ctx.measureText(s).width;
}

/** Keep numbers and units together when wrapping (T1): join each atom's inner spaces with no-break spaces. */
function glued(text: string): string {
  return truncationAtoms(text).map(a => a.replace(/ /g, ' ')).join(' ');
}

/**
 * Text that is truncated only when it does not fit, following the truncation consultation (T1..T7):
 * cuts between whole words, never inside numbers or units, ellipsis directly after the text, a
 * separate control (not the ellipsis) to see the full text, and the full text always available to
 * screen readers.
 */
export function TruncatedText({ text, mode = 'end', reveal = 'inline', showSymbol = true, onTruncationChange, className }: TruncatedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const flyId = useId('cui-truncated-flyout');
  const [width, setWidth] = useState(0);
  const [result, setResult] = useState<TruncationResult>({ display: text, truncated: false });
  const [expanded, setExpanded] = useState(false);
  const [flyout, setFlyout] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || mode === 'wrap') return;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || mode === 'wrap' || width <= 0) {
      setResult({ display: text, truncated: false });
      return;
    }
    const measure = measurer(el);
    const fn = mode === 'middle' ? truncateMiddle : truncateEnd;
    let r = fn(text, width, measure);
    if (r.truncated && showSymbol) r = fn(text, Math.max(0, width - SYMBOL_WIDTH), measure);
    setResult(r);
  }, [text, width, mode, showSymbol]);

  useEffect(() => {
    onTruncationChange?.(result.truncated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.truncated]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (mode === 'wrap' || expanded) {
    return (
      <span className={cx('cui-truncated', 'cui-truncated--wrap', className)}>
        {glued(text)}
        {expanded ? (
          <button type="button" className="cui-truncated__toggle" aria-expanded="true" onClick={() => setExpanded(false)} title="Show less">
            <Icon name="chevron-up" size={16} />
            <VisuallyHidden>Show less</VisuallyHidden>
          </button>
        ) : null}
      </span>
    );
  }

  const truncated = result.truncated;
  const showFly = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlyout(true), 400);
  };
  const hideFly = () => {
    window.clearTimeout(timer.current);
    setFlyout(false);
  };
  const flyoutMode = reveal === 'flyout' && truncated;

  return (
    <span
      ref={ref}
      className={cx('cui-truncated', truncated && 'cui-truncated--truncated', className)}
      tabIndex={flyoutMode ? 0 : undefined}
      aria-describedby={flyoutMode && flyout ? flyId : undefined}
      onMouseEnter={flyoutMode ? showFly : undefined}
      onMouseLeave={flyoutMode ? hideFly : undefined}
      onFocus={flyoutMode ? () => setFlyout(true) : undefined}
      onBlur={flyoutMode ? hideFly : undefined}
      onKeyDown={flyoutMode ? e => { if (e.key === 'Escape') hideFly(); } : undefined}
    >
      <span className="cui-truncated__text" aria-hidden={truncated || undefined}>{result.display}</span>
      {truncated ? <VisuallyHidden>{text} (shortened on screen)</VisuallyHidden> : null}
      {truncated && reveal === 'inline' ? (
        <button type="button" className="cui-truncated__toggle" aria-expanded="false" title="Show full text" onClick={() => setExpanded(true)}>
          {showSymbol ? <Icon name="more" size={16} /> : <Icon name="chevron-down" size={16} />}
          <VisuallyHidden>Show full text</VisuallyHidden>
        </button>
      ) : null}
      {flyoutMode && showSymbol ? <span className="cui-truncated__symbol" aria-hidden="true"><Icon name="more" size={16} /></span> : null}
      {flyoutMode && flyout ? (
        <span id={flyId} role="tooltip" className="cui-truncated__flyout">{text}</span>
      ) : null}
    </span>
  );
}
