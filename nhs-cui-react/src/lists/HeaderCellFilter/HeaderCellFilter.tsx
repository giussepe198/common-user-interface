import React from 'react';
import { Button, Icon, cx, useId } from '../../core';
import { filterOperatorLabel, isListFilterCriterionComplete, permittedFilterOperators } from '../utils/filter';
import type { ListAttribute, ListFilterCriterion, ListFilterOperator } from '../utils/listTypes';
import { ListFilterValueInput } from '../shared/ListFilterValueInput';

const CUSTOM = '__custom';

export interface HeaderCellFilterProps<T = unknown> {
  /** The column being filtered: one attribute at a time (FSG-0012). */
  attribute: ListAttribute<T>;
  /** Current criterion for this attribute, used to prepopulate (FSG-0021). */
  initial?: ListFilterCriterion | null;
  /** Apply the single criterion. */
  onApply: (criterion: ListFilterCriterion) => void;
  /** Remove the filter on this column (shown when `initial` is set). */
  onRemove?: () => void;
  /** Offer "Custom…" in the operator list, which opens the full filter dialog (FSG-0037/0038). */
  onCustom?: () => void;
  /** Close without applying (Escape or Cancel). */
  onCancel: () => void;
  /** Another filter is active and applying this one replaces it [suggested]: a note says so. */
  replacesFilter?: boolean;
  /** Add "<", "=", ">" to numeric operators (FSG-0043). */
  showOperatorSymbols?: boolean;
  className?: string;
}

/**
 * Filter from a column header (FSG-0012, 0033, 0034, 0037, 0038): operator and value controls shown inline from the
 * header context menu, for that column only. "Custom…" opens the full filter dialog for more criteria.
 */
export function HeaderCellFilter<T>({ attribute, initial, onApply, onRemove, onCustom, onCancel, replacesFilter, showOperatorSymbols, className }: HeaderCellFilterProps<T>) {
  const id = useId('cui-hcf');
  const ops = permittedFilterOperators(attribute.dataType);
  const [crit, setCrit] = React.useState<ListFilterCriterion>(() =>
    initial && initial.attributeId === attribute.id
      ? { ...initial }
      : { attributeId: attribute.id, operator: ops.length === 1 ? ops[0] : '', value: '' },
  );
  const opRef = React.useRef<HTMLSelectElement>(null);
  React.useEffect(() => {
    opRef.current?.focus();
  }, []);
  const complete = isListFilterCriterionComplete(crit, [attribute]);
  const apply = () => complete && onApply(crit);

  return (
    <div
      className={cx('cui-header-filter', className)}
      role="dialog"
      aria-labelledby={`${id}-t`}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="cui-header-filter__title" id={`${id}-t`}>
        <Icon name="filter" /> Filter: {attribute.label}
        {attribute.unit ? <span className="cui-header-filter__unit"> ({attribute.unit})</span> : null}
      </div>
      <form
        className="cui-header-filter__form"
        onSubmit={e => {
          e.preventDefault();
          apply();
        }}
      >
        <select
          ref={opRef}
          className="cui-list-input cui-header-filter__op"
          aria-label={`${attribute.label} operator`}
          value={crit.operator}
          onChange={e => {
            if (e.target.value === CUSTOM) {
              onCustom?.();
              return;
            }
            const op = e.target.value as ListFilterOperator;
            setCrit(c => ({ ...c, operator: op, value2: op === 'between' ? c.value2 ?? '' : undefined }));
          }}
        >
          <option value="">Select an operator</option>
          {ops.map(o => (
            <option key={o} value={o}>{filterOperatorLabel(o, showOperatorSymbols)}</option>
          ))}
          {onCustom ? <option value={CUSTOM}>Custom…</option> : null}
        </select>
        <span className="cui-header-filter__values">
          <ListFilterValueInput
            id={`${id}-v`}
            attr={attribute}
            label={crit.operator === 'between' ? `${attribute.label} from` : `${attribute.label} value`}
            value={crit.value}
            onChange={v => setCrit(c => ({ ...c, value: v }))}
          />
          {crit.operator === 'between' ? (
            <>
              <span className="cui-filter-dialog__and">and</span>
              <ListFilterValueInput
                id={`${id}-v2`}
                attr={attribute}
                label={`${attribute.label} to`}
                value={crit.value2 ?? ''}
                onChange={v => setCrit(c => ({ ...c, value2: v }))}
              />
            </>
          ) : null}
        </span>
        {replacesFilter ? <p className="cui-header-filter__note">Applying this replaces the current filter.</p> : null}
        <div className="cui-header-filter__buttons">
          {initial && onRemove ? <Button size="sm" onClick={onRemove}>Remove filter</Button> : null}
          <span className="cui-list-dialog__footer-spacer" />
          <Button size="sm" variant="primary" type="submit" disabled={!complete}>Apply</Button>
          <Button size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
