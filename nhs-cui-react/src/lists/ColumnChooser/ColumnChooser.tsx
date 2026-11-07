import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { SortableList } from '../../interaction';

/** A column the user may show, hide or reorder. */
export interface ColumnChooserColumn {
  id: string;
  title: string;
  /** Row key identifier column (patient identification, location): always shown, fixed at the left (PAL-0710/0720). */
  locked?: boolean;
}

/** A named column set, e.g. for a role (PAL-0730). */
export interface ColumnChooserPreset {
  id: string;
  label: string;
  columnIds: string[];
}

export interface ColumnChooserProps {
  /** All available columns in default order. */
  columns: ColumnChooserColumn[];
  /** Visible column ids in display order (controlled). Locked columns are always included. */
  value?: string[];
  defaultValue?: string[];
  /** Called with the new visible ids in order. Persist it between sessions (PAL-0790). */
  onChange?: (ids: string[]) => void;
  /** Role-based column sets (PAL-0730). */
  presets?: ColumnChooserPreset[];
  /** Heading. Default "Columns". */
  title?: string;
  className?: string;
}

/**
 * Choose which columns a list shows and in what order (PAL-0710). Row key identifier columns are locked:
 * they cannot be hidden or moved (PAL-0720). Optional role-based presets (PAL-0730).
 */
export function ColumnChooser({ columns, value, defaultValue, onChange, presets, title = 'Columns', className }: ColumnChooserProps) {
  const id = useId('cui-cc');
  const lockedIds = columns.filter(c => c.locked).map(c => c.id);
  const normalise = (ids: string[]) => [...lockedIds, ...ids.filter(x => !lockedIds.includes(x) && columns.some(c => c.id === x))];
  const [raw, setRaw] = useControllableState<string[]>(value, defaultValue ?? columns.map(c => c.id), onChange);
  const visible = normalise(raw);
  const set = (ids: string[]) => setRaw(normalise(ids));
  const [announce, setAnnounce] = React.useState('');
  const hidden = columns.filter(c => !visible.includes(c.id));
  const byId = (x: string) => columns.find(c => c.id === x) as ColumnChooserColumn;
  const toggle = (colId: string, on: boolean) => {
    set(on ? [...visible, colId] : visible.filter(x => x !== colId));
    setAnnounce(`${byId(colId).title} ${on ? 'shown' : 'hidden'}`);
  };
  const activePreset = presets?.find(p => {
    const ids = normalise(p.columnIds);
    return ids.length === visible.length && ids.every((x, i) => x === visible[i]);
  });

  const check = (c: ColumnChooserColumn, shown: boolean) => {
    const cid = `${id}-${c.id}`;
    return (
      <span className="cui-column-chooser__check" data-touch-target>
        <input id={cid} type="checkbox" checked={shown} disabled={!!c.locked} onChange={e => toggle(c.id, e.target.checked)} />
        <label htmlFor={cid} className="cui-column-chooser__label">{c.title}</label>
        {c.locked ? (
          <span className="cui-column-chooser__locked">
            <Icon name="lock" /> Always shown
          </span>
        ) : null}
      </span>
    );
  };

  return (
    <div className={cx('cui-column-chooser', className)} role="group" aria-labelledby={`${id}-title`}>
      <div className="cui-column-chooser__head">
        <h3 id={`${id}-title`} className="cui-column-chooser__title">{title}</h3>
        {presets && presets.length ? (
          <label className="cui-column-chooser__preset">
            <span className="cui-label">Column set</span>
            <select
              className="cui-list-input"
              value={activePreset?.id ?? ''}
              onChange={e => {
                const p = presets.find(x => x.id === e.target.value);
                if (p) {
                  set(p.columnIds);
                  setAnnounce(`${p.label} column set applied`);
                }
              }}
            >
              {!activePreset ? <option value="">Custom</option> : null}
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <p className="cui-prompt cui-column-chooser__hint">Shown columns appear in this order, left to right.</p>
      {/* Shown columns in order: drag the handle, use the keyboard on it, or the move buttons (G13). Locked key
          columns hold the first places (PAL-0720): they have no handle and nothing moves above them. */}
      <SortableList
        className="cui-column-chooser__list cui-column-chooser__list--shown"
        label="Shown columns"
        items={visible.map(byId)}
        getKey={c => c.id}
        getLabel={c => c.title}
        canMove={c => !c.locked}
        renderItem={c => check(c, true)}
        moveLabels={{ earlier: l => `Move ${l} left`, later: l => `Move ${l} right` }}
        onReorder={keys => set(keys)}
      />
      {hidden.length ? (
        <>
          <div className="cui-column-chooser__sub">Hidden</div>
          <ul className="cui-column-chooser__list" aria-label="Hidden columns">
            {hidden.map(c => (
              <li key={c.id} className="cui-column-chooser__item cui-column-chooser__item--hidden" data-touch-target>
                {check(c, false)}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
    </div>
  );
}
