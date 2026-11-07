import React from 'react';
import { Icon, cx } from '../../core';
import { formOptionMatchRanges, type FormOption } from '../utils/formOptions';
import type { OptionSearchStatus } from './useOptionSearch';

export const optionDomId = (listId: string, index: number) => `${listId}-opt-${index}`;

function highlight(label: string, query: string, given?: ReadonlyArray<readonly [number, number]>): React.ReactNode {
  const ranges = given ?? formOptionMatchRanges(label, query);
  if (!ranges.length) return label;
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const [s, e] of ranges) {
    if (s > at) out.push(label.slice(at, s));
    out.push(<span key={s} className="cui-option-list__hit">{label.slice(s, e)}</span>);
    at = e;
  }
  if (at < label.length) out.push(label.slice(at));
  return out;
}

/** Internal: the popup list shared by Combobox and MultiSelect (ARIA 1.2 listbox; focus stays in the input). */
export function OptionList(props: {
  listId: string;
  labelledBy?: string;
  label?: string;
  options: FormOption[];
  activeIndex: number;
  selected: ReadonlySet<string>;
  multiselectable?: boolean;
  query: string;
  status: OptionSearchStatus;
  busy: boolean;
  noMatchesText: string;
  visibleRows: number;
  onPick: (index: number) => void;
  onHover: (index: number) => void;
}) {
  const { listId, labelledBy, label, options, activeIndex, selected, multiselectable, query, status, busy, noMatchesText, visibleRows, onPick, onHover } = props;
  const activeRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = activeRef.current;
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const rows: React.ReactNode[] = [];
  let group: { name: string; items: React.ReactNode[] } | null = null;
  const flush = () => {
    if (!group) return;
    const gid = `${listId}-g-${rows.length}`;
    rows.push(
      <div key={gid} role="group" aria-labelledby={gid}>
        <div id={gid} role="presentation" className="cui-option-list__group">{group.name}</div>
        {group.items}
      </div>,
    );
    group = null;
  };
  options.forEach((o, i) => {
    const isSel = selected.has(o.value);
    const node = (
      <div
        key={`${o.value}-${i}`}
        id={optionDomId(listId, i)}
        ref={i === activeIndex ? activeRef : undefined}
        role="option"
        aria-selected={isSel}
        aria-disabled={o.disabled ? true : undefined}
        className={cx('cui-option-list__option', i === activeIndex && 'cui-option-list__option--active', isSel && 'cui-option-list__option--selected')}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => i !== activeIndex && onHover(i)}
        onClick={() => !o.disabled && onPick(i)}
      >
        <span className="cui-option-list__check" aria-hidden="true">{isSel ? <Icon name="check" size={16} /> : null}</span>
        <span className="cui-option-list__text">
          <span lang={o.lang}>{highlight(o.label, query, o.matchRanges)}</span>
          {o.description ? <span className="cui-option-list__description">{o.description}</span> : null}
          {o.matchNote ? <span className="cui-option-list__description cui-option-list__note"><Icon name="info" size={16} />{o.matchNote}</span> : null}
          {o.warning ? <span className="cui-option-list__warning"><Icon name="warning" size={16} />{o.warning}</span> : null}
        </span>
      </div>
    );
    if (o.group) {
      if (group && group.name !== o.group) flush();
      if (!group) group = { name: o.group, items: [] };
      group.items.push(node);
    } else {
      flush();
      rows.push(node);
    }
  });
  flush();

  let statusRow: React.ReactNode = null;
  if (busy) statusRow = <div className="cui-option-list__status">Searching…</div>;
  else if (status === 'error') statusRow = (
    <div className="cui-option-list__status cui-option-list__status--error"><Icon name="error" size={16} />Options could not be loaded. Try again.</div>
  );
  else if (status === 'done' && !options.length) statusRow = <div className="cui-option-list__status">{noMatchesText}</div>;

  return (
    <div className="cui-option-list" style={{ '--cui-option-rows': visibleRows } as React.CSSProperties}>
      {statusRow}
      <div id={listId} role="listbox" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} aria-multiselectable={multiselectable || undefined}>
        {rows}
      </div>
    </div>
  );
}
