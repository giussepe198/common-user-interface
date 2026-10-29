import React from 'react';
import { cx, useId } from '../../core';
import { selectPreviousValues, type PreviousValue } from '../utils/previousValues';

export type { PreviousValue };

export interface PreviousValuesPopoverProps {
  /** Earlier numeric values with the date and time each was recorded (CNA-1440). */
  values: PreviousValue[];
  /** Unit, shown once next to the title (CNA-1460/1470), e.g. "mmHg". */
  unit?: string;
  /** How many of the most recent values to show; agreed by the clinical authority (CNA-1300). Default 3. */
  maxCount?: number;
  /** Fixed decimal places (CNA-1350). Default: as recorded. */
  decimals?: number;
  /** Title (CNA-1410). Default "Previous values". */
  title?: string;
  /**
   * Where the panel sits: 'above' the field (CNA-1320, values in ascending order, CNA-1390) or
   * 'beside' it when there is no room above (CNA-1400, most recent first).
   */
  placement?: 'above' | 'beside';
  /** Opens a graphical or historical view of all values [suggested from the research conclusion]. */
  onOpenHistory?: () => void;
  /** Label for the history control. Default "View history". */
  historyLabel?: string;
  /** Force the panel open (for previews and tests). Normally it follows focus. */
  forceOpen?: boolean;
  /** The numeric entry field. It receives `aria-describedby` pointing at the values. */
  children: React.ReactElement;
  className?: string;
  /**
   * Field props passed on to the entry field, so a wrapping FormField that clones this popover still labels the
   * field itself (its id) and its hints [suggested].
   */
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
  placeholder?: string;
}

/**
 * Floating panel of recent values shown above a numeric field while it has focus, including while
 * typing (CNA-1260..1290). Shows nothing when there are no previous values (CNA-1270).
 */
export function PreviousValuesPopover({
  values,
  unit,
  maxCount = 3,
  decimals,
  title = 'Previous values',
  placement = 'above',
  onOpenHistory,
  historyLabel = 'View history',
  forceOpen,
  children,
  className,
  id: fieldId,
  'aria-describedby': fieldDescribedBy,
  'aria-invalid': fieldInvalid,
  'aria-required': fieldRequired,
  placeholder,
}: PreviousValuesPopoverProps) {
  const id = useId('cui-prev');
  const [focused, setFocused] = React.useState(false);
  const rows = selectPreviousValues(values, { maxCount, decimals, order: placement === 'above' ? 'ascending-value' : 'chronological' });
  const has = rows.length > 0;
  const open = has && (forceOpen || focused);
  const own = (children.props as { 'aria-describedby'?: string })['aria-describedby'];
  const fieldProps = Object.fromEntries(
    Object.entries({ id: fieldId, 'aria-invalid': fieldInvalid, 'aria-required': fieldRequired, placeholder }).filter(([, v]) => v !== undefined),
  );
  const describedBy = [own, fieldDescribedBy, has ? id : undefined].filter(Boolean).join(' ') || undefined;
  const child = React.cloneElement(children, { ...fieldProps, 'aria-describedby': describedBy } as Record<string, unknown>);
  const heading = unit ? `${title} (${unit})` : title;

  return (
    <span
      className={cx('cui-previous-values', `cui-previous-values--${placement}`, className)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {child}
      {has ? (
        <span id={id} className="cui-previous-values__panel" role="note" hidden={!open}>
          <span className="cui-previous-values__title">{heading}</span>
          <span className="cui-previous-values__rows">
            {rows.map((r, i) => (
              <span key={i} className="cui-previous-values__row">
                <span className="cui-previous-values__value">{r.valueText}</span>
                <span className="cui-visually-hidden">{unit ? ` ${unit}` : ''}, recorded </span>
                <span className="cui-previous-values__when">{r.when}</span>
                <span className="cui-visually-hidden">. </span>
              </span>
            ))}
          </span>
          {onOpenHistory ? (
            <button type="button" className="cui-previous-values__history" onMouseDown={(e) => e.preventDefault()} onClick={onOpenHistory}>
              {historyLabel}
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
