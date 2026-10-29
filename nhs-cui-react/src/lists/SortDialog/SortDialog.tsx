import React from 'react';
import { Button, useId } from '../../core';
import { ListDialog } from '../shared/ListDialog';
import { listSortDialogLabel, listSortOrderLabels } from '../utils/sortGroup';
import type { ListAttribute, ListSortKey } from '../utils/listTypes';

export interface SortDialogProps<T = unknown> {
  /** Table name, shown in the title "Sort <tableName>" (FSG-0078). */
  tableName: string;
  /** Row noun for "1 – Sort <rowNoun> by:" (FSG-0090). */
  rowNoun: string;
  /** Displayed attributes in table order (FSG-0093, FSG-0097). */
  attributes: ListAttribute<T>[];
  /** Attributes not currently displayed, listed after the displayed ones (FSG-0093). Sorting by one adds its column (FSG-0098). */
  hiddenAttributes?: ListAttribute<T>[];
  /** Current sort, used to prepopulate (FSG-0086/0092). */
  initial?: ListSortKey[];
  /** Apply without closing (FSG-0081..0084). */
  onPreview?: (sort: ListSortKey[]) => void;
  /** Apply and close. */
  onOk: (sort: ListSortKey[]) => void;
  /** Close and restore the original sort (receives it). */
  onCancel: (original: ListSortKey[]) => void;
  /** Modal with translucent backdrop (default) or inline. */
  modal?: boolean;
}

interface Line {
  attributeId: string;
  direction: 'asc' | 'desc' | '';
}

/**
 * Sort dialog (FSG 3.7): numbered lines "1 – Sort patients by:", "2 – Then, within Consultant, sort by:", each an
 * attribute list with order radio buttons below it worded in plain terms (never "Ascending"), Add, Remove and
 * Remove all, and Preview / OK / Cancel.
 */
export function SortDialog<T>({ tableName, rowNoun, attributes, hiddenAttributes = [], initial = [], onPreview, onOk, onCancel, modal = true }: SortDialogProps<T>) {
  const id = useId('cui-sd');
  const original = React.useRef(initial);
  const all = [...attributes, ...hiddenAttributes];
  const [lines, setLines] = React.useState<Line[]>(() => (initial.length ? initial.map(k => ({ ...k })) : [{ attributeId: '', direction: '' }]));
  const selRefs = React.useRef<Array<HTMLSelectElement | null>>([]);
  const focusLine = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (focusLine.current !== null) {
      selRefs.current[focusLine.current]?.focus();
      focusLine.current = null;
    }
  });
  const complete = lines.filter((l): l is ListSortKey => !!l.attributeId && !!l.direction);
  const anyChosen = lines.some(l => l.attributeId);
  const okEnabled = complete.length > 0 || (original.current.length > 0 && !anyChosen);
  const set = (i: number, patch: Partial<Line>) => setLines(ls => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const choose = (i: number, attributeId: string) => {
    const a = all.find(x => x.id === attributeId);
    set(i, { attributeId, direction: a ? listSortOrderLabels(a.dataType, a.options).first : '' });
  };
  const remove = (i: number) => {
    if (lines.length === 1) setLines([{ attributeId: '', direction: '' }]);
    else setLines(ls => ls.filter((_, j) => j !== i));
    focusLine.current = Math.max(0, lines.length === 1 ? 0 : i - 1);
  };
  return (
    <ListDialog
      title={`Sort ${tableName}`}
      titleId={`${id}-title`}
      modal={modal}
      onDismiss={() => onCancel(original.current)}
      className="cui-sort-dialog"
      footer={
        <>
          <Button disabled={!anyChosen} onClick={() => {
            setLines([{ attributeId: '', direction: '' }]);
            focusLine.current = 0;
          }}>Remove all</Button>
          <span className="cui-list-dialog__footer-spacer" />
          <Button disabled={!complete.length || !onPreview} onClick={() => onPreview?.(complete)}>Preview</Button>
          <Button variant="primary" disabled={!okEnabled} onClick={() => onOk(complete)}>OK</Button>
          <Button onClick={() => onCancel(original.current)}>Cancel</Button>
        </>
      }
    >
      <ol className="cui-sort-dialog__lines">
        {lines.map((l, i) => {
          const a = all.find(x => x.id === l.attributeId);
          const prev = i > 0 ? all.find(x => x.id === lines[i - 1].attributeId) : undefined;
          const labelId = `${id}-l${i}`;
          const labels = a ? listSortOrderLabels(a.dataType, a.options) : null;
          const orders: Array<'asc' | 'desc'> = labels ? (labels.first === 'desc' ? ['desc', 'asc'] : ['asc', 'desc']) : [];
          return (
            <li key={i} className="cui-sort-dialog__line">
              <div id={labelId} className="cui-sort-dialog__label">{listSortDialogLabel(i + 1, rowNoun, prev?.label ?? (i > 0 ? 'the previous sort' : undefined))}</div>
              <div className="cui-sort-dialog__row">
                <select
                  ref={el => {
                    selRefs.current[i] = el;
                  }}
                  className="cui-list-input cui-sort-dialog__attr"
                  aria-labelledby={labelId}
                  value={l.attributeId}
                  onChange={e => choose(i, e.target.value)}
                >
                  <option value="">Select an attribute</option>
                  <optgroup label="Displayed">
                    {attributes.map(x => (
                      <option key={x.id} value={x.id}>{x.label}</option>
                    ))}
                  </optgroup>
                  {hiddenAttributes.length ? (
                    <optgroup label="Not displayed (column will be added)">
                      {hiddenAttributes.map(x => (
                        <option key={x.id} value={x.id}>{x.label}</option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
                <Button size="sm" variant="quiet" icon="trash" onClick={() => remove(i)} aria-label={`Remove sort ${i + 1}`}>Remove</Button>
              </div>
              {labels ? (
                <div role="radiogroup" aria-label={`Order for ${a?.label}`} className="cui-sort-dialog__orders">
                  {orders.map(o => (
                    <label key={o} className="cui-list-choice" data-touch-target>
                      <input type="radio" name={`${id}-o${i}`} checked={l.direction === o} onChange={() => set(i, { direction: o })} />
                      {o === 'asc' ? labels.asc : labels.desc}
                    </label>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="cui-sort-dialog__add">
        <Button size="sm" icon="plus" disabled={!lines[lines.length - 1].attributeId} onClick={() => {
          setLines(ls => [...ls, { attributeId: '', direction: '' }]);
          focusLine.current = lines.length;
        }}>Add</Button>
      </div>
    </ListDialog>
  );
}
