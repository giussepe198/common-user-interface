import React from 'react';
import { cx, Icon, VisuallyHidden } from '../../core';

/** One choice in a prescription selection list. */
export interface PrescriptionOption {
  /** Stored value, e.g. "500 mg", "twice a day", "08:00; 20:00", "Today 20:00". */
  value: string;
  /** Visible text if different from the value. */
  label?: string;
  /** Supplementary text in grey italics, e.g. "Standard times" (MSP-1910). */
  supplementary?: string;
}

export const NONE_LEAVE_BLANK = 'None (leave blank)';

/**
 * Internal dynamic-width selection field for sentence layout (MSP-1450 to MSP-1520):
 * the label sits inside the field ("DOSE 500 mg"), the field grows and shrinks with its value,
 * the list stays re-selectable even with one option (MSP-1390), Esc closes it without
 * selecting (MSP-1870), and free text is only offered after "other..." (MSP-1900).
 */
export function SentenceSelect({
  id, inlineLabel, accessibleLabel, value, display, prompt, otherPrompt, options, allowOther, allowNone, onRemove,
  onChange, highlighted, optional, describedBy, extraSections, onOpenChange, className,
}: {
  id: string;
  inlineLabel?: string;
  accessibleLabel: string;
  value: string | null | undefined;
  display?: React.ReactNode;
  prompt: string;
  otherPrompt?: string;
  options: PrescriptionOption[];
  allowOther?: boolean;
  allowNone?: boolean;
  onRemove?: () => void;
  onChange: (v: string | null) => void;
  highlighted?: boolean;
  optional?: boolean;
  describedBy?: string;
  /** Further labelled sections after the main options, e.g. "For other strengths" (MSP-1980). */
  extraSections?: Array<{ label: string; options: PrescriptionOption[] }>;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const btn = React.useRef<HTMLButtonElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const wrap = React.useRef<HTMLSpanElement>(null);

  type Item = { key: string; text: string; supplementary?: string; kind: 'value' | 'none' | 'other' | 'remove'; value?: string };
  const items: Item[] = options.map(o => ({ key: `v:${o.value}`, text: o.label ?? o.value, supplementary: o.supplementary, kind: 'value', value: o.value }));
  if (allowNone) items.push({ key: 'none', text: NONE_LEAVE_BLANK, kind: 'none' });
  const sectionItems = (extraSections ?? []).filter(sec => sec.options.length).map(sec => ({
    label: sec.label,
    items: sec.options.map<Item>(o => ({ key: `x:${sec.label}:${o.value}`, text: o.label ?? o.value, supplementary: o.supplementary, kind: 'value', value: o.value })),
  }));
  const extra: Item[] = [];
  if (allowOther) extra.push({ key: 'other', text: 'other...', kind: 'other' });
  if (onRemove) extra.push({ key: 'remove', text: 'Remove', kind: 'remove' });

  React.useEffect(() => {
    if (!open) return;
    const sel = list.current?.querySelector<HTMLElement>('[aria-selected="true"]') ?? list.current?.querySelector<HTMLElement>('[role="option"]');
    sel?.focus();
    const onDoc = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  React.useEffect(() => { if (editing) input.current?.focus(); }, [editing]);
  const openRef = React.useRef(open);
  React.useEffect(() => { if (openRef.current !== open) { openRef.current = open; onOpenChange?.(open); } }, [open, onOpenChange]);

  const pick = (it: Item) => {
    setOpen(false);
    if (it.kind === 'other') { setDraft(''); setEditing(true); return; }
    if (it.kind === 'remove') { onRemove?.(); return; }
    onChange(it.kind === 'none' ? null : it.value ?? '');
    btn.current?.focus();
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const opts = Array.from(list.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
    const i = opts.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); opts[Math.min(opts.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); opts[Math.max(0, i - 1)]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); opts[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); opts[opts.length - 1]?.focus(); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === 'Tab') setOpen(false);
  };

  const filled = value !== undefined && value !== '';
  if (editing) {
    return (
      <span className="cui-sentence-field cui-sentence-field--editing" ref={wrap}>
        {inlineLabel ? <span className="cui-sentence-field__label" aria-hidden="true">{inlineLabel}</span> : null}
        <input
          ref={input}
          className="cui-sentence-field__input"
          aria-label={accessibleLabel}
          placeholder={otherPrompt ?? prompt}
          value={draft}
          size={Math.max(12, draft.length + 1)}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && draft.trim()) { e.preventDefault(); onChange(draft.trim()); setEditing(false); setTimeout(() => btn.current?.focus(), 0); }
            else if (e.key === 'Escape') { e.preventDefault(); setEditing(false); setTimeout(() => btn.current?.focus(), 0); }
          }}
          onBlur={() => { if (draft.trim()) onChange(draft.trim()); setEditing(false); }}
        />
      </span>
    );
  }

  const renderItem = (it: Item, divided = false) => {
    const isSel = (it.kind === 'value' && it.value === value) || (it.kind === 'none' && value === null);
    return (
      <li
        key={it.key}
        role="option"
        aria-selected={isSel}
        tabIndex={-1}
        className={cx('cui-sentence-field__option', isSel && 'is-selected', it.kind !== 'value' && 'cui-sentence-field__option--special', divided && 'has-divider')}
        onClick={() => pick(it)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(it); } }}
      >
        <span>{inlineLabel && it.kind === 'value' && inlineLabel === inlineLabel.toUpperCase() ? <span className="cui-sentence-field__label">{inlineLabel} </span> : null}{it.text}</span>
        {it.supplementary ? <span className="cui-sentence-field__supp">{it.supplementary}</span> : null}
      </li>
    );
  };

  return (
    <span className={cx('cui-sentence-field-wrap', className)} ref={wrap}>
      <button
        ref={btn}
        id={id}
        type="button"
        className={cx('cui-sentence-field', !filled && 'is-empty', highlighted && 'is-highlighted', optional && 'is-optional')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${accessibleLabel}: ${filled ? (value === null ? NONE_LEAVE_BLANK : value) : 'not selected'}`}
        aria-describedby={describedBy}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }}
      >
        {inlineLabel ? <span className="cui-sentence-field__label">{inlineLabel}</span> : null}
        <span className={cx('cui-sentence-field__value', !filled && 'cui-sentence-field__prompt')}>
          {filled ? (value === null ? NONE_LEAVE_BLANK : display ?? value) : prompt}
        </span>
        {highlighted ? (
          <>
            <Icon name="refresh" size={16} className="cui-sentence-field__auto" />
            <VisuallyHidden>, filled automatically</VisuallyHidden>
          </>
        ) : null}
        <Icon name="chevron-down" size={16} className="cui-sentence-field__chevron" />
      </button>
      {open ? (
        <ul ref={list} role="listbox" aria-label={accessibleLabel} className="cui-sentence-field__list" onKeyDown={onListKey}>
          {items.map(it => renderItem(it))}
          {sectionItems.map(sec => (
            <React.Fragment key={sec.label}>
              <li role="presentation" className="cui-sentence-field__section">{sec.label}</li>
              {sec.items.map(it => renderItem(it))}
            </React.Fragment>
          ))}
          {extra.map((it, i) => renderItem(it, i === 0))}
        </ul>
      ) : null}
    </span>
  );
}
