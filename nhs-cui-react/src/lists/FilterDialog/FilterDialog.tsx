import React from 'react';
import { Button, useId } from '../../core';
import { ListDialog } from '../shared/ListDialog';
import { ListFilterValueInput } from '../shared/ListFilterValueInput';
import { filterOperatorLabel, isListFilterCriterionComplete, permittedFilterOperators } from '../utils/filter';
import type { ListAttribute, ListFilterCriterion, ListFilterOperator, ListFilterState } from '../utils/listTypes';

export interface FilterDialogProps<T = unknown> {
  /** Table name, shown in the title "Filter <tableName>" (FSG-0008). */
  tableName: string;
  /** Row noun for "Filter to show rows of <rowNoun> where:" (FSG-0009), e.g. "patients". */
  rowNoun: string;
  /** Displayed attributes in table column order (FSG-0011, FSG-0030/0031). */
  attributes: ListAttribute<T>[];
  /** Current filter, used to prepopulate the dialog (FSG-0021). */
  initial?: ListFilterState | null;
  /** Wording for AND / OR: 'long' = "All must be true" / "Any of which are true", 'short' = "Match All" / "Match Any" (FSG-0028/0029). */
  combineWording?: 'long' | 'short';
  /** Add "<", "=", ">" symbols to numeric operators (FSG-0043). Default false. */
  showOperatorSymbols?: boolean;
  /** Apply without closing (FSG-0018). */
  onPreview?: (filter: ListFilterState) => void;
  /** Apply and close, no confirmation (FSG-0019). Receives null when every criterion was removed. */
  onOk: (filter: ListFilterState | null) => void;
  /** Close and restore the data as it was when the dialog opened (FSG-0020); receives that original filter. */
  onCancel: (original: ListFilterState | null) => void;
  /** Modal with translucent backdrop (default) or inline. */
  modal?: boolean;
}

const emptyCriterion = (): ListFilterCriterion => ({ attributeId: '', operator: '', value: '' });

/**
 * Filter dialog (FSG 3.6): each criterion is attribute, operator and value on one line; "Add" inserts a new line;
 * OR / AND radio buttons appear once there are two criteria, OR first and default; no NOT; Preview, OK, Cancel.
 */
export function FilterDialog<T>({
  tableName, rowNoun, attributes, initial, combineWording = 'long', showOperatorSymbols, onPreview, onOk, onCancel, modal = true,
}: FilterDialogProps<T>) {
  const id = useId('cui-fd');
  const original = React.useRef(initial ?? null);
  const [criteria, setCriteria] = React.useState<ListFilterCriterion[]>(() =>
    initial && initial.criteria.length ? initial.criteria.map(c => ({ ...c })) : [emptyCriterion()],
  );
  const [combine, setCombine] = React.useState<'or' | 'and'>(initial?.combine ?? 'or');
  const addRef = React.useRef<HTMLButtonElement>(null);
  const lineRefs = React.useRef<Array<HTMLSelectElement | null>>([]);
  const focusLine = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (focusLine.current !== null) {
      lineRefs.current[focusLine.current]?.focus();
      focusLine.current = null;
    }
  });

  const anyComplete = criteria.some(c => isListFilterCriterionComplete(c, attributes));
  const anyChosen = criteria.some(c => c.attributeId);
  // Initially only Cancel is enabled (FSG-0017); OK is also enabled when the user has cleared a previous filter.
  const okEnabled = anyComplete || (!!original.current?.criteria.length && !anyChosen);
  const state = (): ListFilterState | null => {
    const kept = criteria.filter(c => c.attributeId);
    return kept.length ? { criteria: kept, combine } : null;
  };
  const update = (i: number, patch: Partial<ListFilterCriterion>) =>
    setCriteria(cs => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  const setAttribute = (i: number, attributeId: string) => {
    const attr = attributes.find(a => a.id === attributeId);
    const ops = attr ? permittedFilterOperators(attr.dataType) : [];
    update(i, { attributeId, operator: ops.length === 1 ? ops[0] : '', value: '', value2: undefined });
  };
  const remove = (i: number) => {
    if (criteria.length === 1) {
      setCriteria([emptyCriterion()]); // single line: clear the controls (FSG-0061)
      focusLine.current = 0;
    } else {
      setCriteria(cs => cs.filter((_, j) => j !== i)); // several lines: delete the line (FSG-0062)
      focusLine.current = Math.max(0, i - 1);
    }
  };
  const add = () => {
    setCriteria(cs => [...cs, emptyCriterion()]);
    focusLine.current = criteria.length;
  };
  const removeAll = () => {
    setCriteria([emptyCriterion()]);
    setCombine('or');
    focusLine.current = 0;
  };

  const words = combineWording === 'short' ? { or: 'Match Any', and: 'Match All' } : { or: 'Any of which are true', and: 'All must be true' };
  const title = `Filter ${tableName}`;

  const valueInput = (c: ListFilterCriterion, i: number, which: 'value' | 'value2', attr: ListAttribute<T>, label: string) => (
    <ListFilterValueInput
      key={`${i}-${which}-${attr.id}`}
      id={`${id}-${i}-${which}`}
      attr={attr}
      label={label}
      value={(which === 'value' ? c.value : c.value2) ?? ''}
      onChange={nv => update(i, { [which]: nv } as Partial<ListFilterCriterion>)}
    />
  );

  return (
    <ListDialog
      title={title}
      titleId={`${id}-title`}
      modal={modal}
      onDismiss={() => onCancel(original.current)}
      className="cui-filter-dialog"
      footer={
        <>
          <Button onClick={removeAll} disabled={!anyChosen}>Remove all filters</Button>
          <span className="cui-list-dialog__footer-spacer" />
          <Button disabled={!anyComplete || !onPreview} onClick={() => onPreview?.(state() ?? { criteria: [], combine })}>Preview</Button>
          <Button variant="primary" disabled={!okEnabled} onClick={() => onOk(state())}>OK</Button>
          <Button onClick={() => onCancel(original.current)}>Cancel</Button>
        </>
      }
    >
      <p className="cui-filter-dialog__lead" id={`${id}-lead`}>Filter to show rows of {rowNoun} where:</p>
      <ol className="cui-filter-dialog__lines" aria-labelledby={`${id}-lead`}>
        {criteria.map((c, i) => {
          const attr = attributes.find(a => a.id === c.attributeId);
          const ops: ListFilterOperator[] = attr ? permittedFilterOperators(attr.dataType) : [];
          const n = i + 1;
          return (
            <li key={i} className="cui-filter-dialog__line">
              <select
                ref={el => {
                  lineRefs.current[i] = el;
                }}
                className="cui-list-input cui-filter-dialog__attr"
                aria-label={`Criterion ${n} attribute`}
                value={c.attributeId}
                onChange={e => setAttribute(i, e.target.value)}
              >
                <option value="">Select an attribute</option>
                {attributes.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                    {a.unit ? ` (${a.unit})` : ''}
                  </option>
                ))}
              </select>
              <span className="cui-filter-dialog__opval">
                <select
                  className="cui-list-input cui-filter-dialog__op"
                  aria-label={`Criterion ${n} operator`}
                  value={c.operator}
                  disabled={!attr}
                  onChange={e => update(i, { operator: e.target.value as ListFilterOperator, value2: e.target.value === 'between' ? c.value2 ?? '' : undefined })}
                >
                  <option value="">Select an operator</option>
                  {ops.map(o => (
                    <option key={o} value={o}>{filterOperatorLabel(o, showOperatorSymbols)}</option>
                  ))}
                </select>
                {attr ? valueInput(c, i, 'value', attr, c.operator === 'between' ? `Criterion ${n} from` : `Criterion ${n} value`) : (
                  <input className="cui-list-input cui-filter-dialog__value" disabled aria-label={`Criterion ${n} value`} placeholder="Value" />
                )}
                {attr && c.operator === 'between' ? (
                  <>
                    <span className="cui-filter-dialog__and">and</span>
                    {valueInput(c, i, 'value2', attr, `Criterion ${n} to`)}
                  </>
                ) : null}
                {attr?.unit && (attr.dataType === 'integer' || attr.dataType === 'real') ? <span className="cui-filter-dialog__unit">{attr.unit}</span> : null}
              </span>
              <Button size="sm" variant="quiet" icon="trash" onClick={() => remove(i)} aria-label={`Remove criterion ${n}`}>
                Remove
              </Button>
            </li>
          );
        })}
      </ol>
      <div className="cui-filter-dialog__add">
        <Button ref={addRef} size="sm" icon="plus" onClick={add}>Add</Button>
      </div>
      {criteria.length >= 2 ? (
        <fieldset className="cui-filter-dialog__combine">
          <legend>Show rows where</legend>
          <label className="cui-list-choice">
            <input type="radio" name={`${id}-combine`} checked={combine === 'or'} onChange={() => setCombine('or')} /> {words.or}
          </label>
          <label className="cui-list-choice">
            <input type="radio" name={`${id}-combine`} checked={combine === 'and'} onChange={() => setCombine('and')} /> {words.and}
          </label>
        </fieldset>
      ) : null}
    </ListDialog>
  );
}
