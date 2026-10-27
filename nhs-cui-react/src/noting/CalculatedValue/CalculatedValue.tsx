import React from 'react';
import { Button, Icon, cx, useId } from '../../core';

export interface OutOfRangeMarkerProps {
  /** 'high' or 'low' adds an arrow and more specific text. */
  direction?: 'high' | 'low';
  /** Text alternative. Default "Above normal range", "Below normal range" or "Outside normal range". */
  label?: string;
  /** Also show the text visibly. Default false (the text is then read by screen readers only). */
  showText?: boolean;
  className?: string;
}

/** In-line out-of-normal-range marker (CNA-1610: e.g. red circle icon), never colour alone. */
export function OutOfRangeMarker({ direction, label, showText, className }: OutOfRangeMarkerProps) {
  const text = label ?? (direction === 'high' ? 'Above normal range' : direction === 'low' ? 'Below normal range' : 'Outside normal range');
  return (
    <span className={cx('cui-out-of-range', className)} title={text}>
      <span className="cui-out-of-range__dot" aria-hidden="true">
        {direction ? <Icon name={direction === 'high' ? 'arrow-up' : 'arrow-down'} size={16} /> : '!'}
      </span>
      <span className={showText ? 'cui-out-of-range__text' : 'cui-visually-hidden'}>{text}</span>
    </span>
  );
}

/** A value that contributed to a calculation (CNA-1520). */
export interface CalculationContributor {
  /** Field label, e.g. "Respiration rate". */
  label: string;
  /** Value used (already formatted), or undefined when missing. */
  value?: string | number;
  unit?: string;
  /** Form heading where the field is (CNA-1520, CNA-1670). */
  section?: string;
  /** Element id of the field, for "go to field" links. */
  fieldId?: string;
  /** Entered on this form, or taken from the record. */
  source?: 'form' | 'record';
  /** A default ('normal') value was assumed because none was entered (CNA-1630/1640). */
  assumed?: boolean;
  /** Outside the normal range (CNA-1610). */
  outOfRange?: boolean | 'high' | 'low';
}

export interface CalculatedValueProps {
  /** Label that opens the details, styled as a link (CNA-1530, CNA-1580), e.g. "NEWS2 score". */
  label: string;
  /** The calculated value. Shown in bold as read-only text, never in an editable field (CNA-1490/1500). */
  value?: number | string | null;
  /** Unit after the value. */
  unit?: string;
  /** Decimal places for numeric values. */
  decimals?: number;
  /** Brief clinical meaning shown next to the value (CNA-1510), e.g. "Low risk". */
  meaning?: string;
  /** Scoring system applied (CNA-1520), e.g. "National Early Warning Score 2". */
  scoringSystem?: string;
  /**
   * 'complete'; 'partial' when values were missing or assumed (always labelled, never shown alone,
   * CNA-1640); 'cannotCalculate' shows a message with access to the details (CNA-1650).
   */
  status?: 'complete' | 'partial' | 'cannotCalculate';
  /** Text shown with a partial value. Default "Partial score: values missing". */
  partialText?: string;
  /** Text shown when it cannot be calculated. Default "Cannot be calculated: values missing". */
  cannotCalculateText?: string;
  /** Normal range; a value outside it gets an `OutOfRangeMarker`. */
  normalRange?: { low?: number; high?: number };
  /** Contributing values listed in the details dialog (CNA-1520, CNA-1660/1670). */
  contributors?: CalculationContributor[];
  /** Move to a contributing or missing field (CNA-1670). */
  onNavigateToField?: (fieldId: string) => void;
  /** Opens further calculation details; shown as the auto-focused "Details of scoring" button (CNA-1600). */
  onOpenDetails?: () => void;
  /** Label of the details button. Default "Details of scoring". */
  detailsLabel?: string;
  className?: string;
}

/** System-calculated value (score or derived value) with access to how it was calculated (CNA-1480..1670). */
export function CalculatedValue({
  label,
  value,
  unit,
  decimals,
  meaning,
  scoringSystem,
  status = 'complete',
  partialText = 'Partial score: values missing',
  cannotCalculateText = 'Cannot be calculated: values missing',
  normalRange,
  contributors = [],
  onNavigateToField,
  onOpenDetails,
  detailsLabel = 'Details of scoring',
  className,
}: CalculatedValueProps) {
  const id = useId('cui-calc');
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLSpanElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const firstRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const numeric = typeof value === 'number' ? value : null;
  const shown = value == null || value === '' ? '' : numeric != null && decimals != null ? numeric.toFixed(decimals) : String(value);
  const direction = numeric != null && normalRange ? (normalRange.high != null && numeric > normalRange.high ? 'high' : normalRange.low != null && numeric < normalRange.low ? 'low' : null) : null;
  const missing = contributors.filter((c) => c.value == null || c.value === '');
  const assumed = contributors.filter((c) => c.assumed);

  React.useEffect(() => {
    if (open) (firstRef.current ?? dialogRef.current)?.focus();
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  return (
    <span
      ref={rootRef}
      className={cx('cui-calculated-value', `cui-calculated-value--${status}`, className)}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node | null)) close(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close(true);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="cui-calculated-value__label"
        aria-expanded={open}
        aria-controls={`${id}-dialog`}
        aria-describedby={`${id}-value`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>
      <span id={`${id}-value`} className="cui-calculated-value__body">
        {status === 'cannotCalculate' ? (
          <span className="cui-calculated-value__message">
            <Icon name="info" />
            {cannotCalculateText}
          </span>
        ) : (
          <>
            <output className="cui-calculated-value__value" aria-label={`${label}${status === 'partial' ? ', partial' : ''}: ${shown}${unit ? ` ${unit}` : ''}`}>
              {shown}
            </output>
            {unit ? <span className="cui-calculated-value__unit">{unit}</span> : null}
            {direction ? <OutOfRangeMarker direction={direction} /> : null}
            {status === 'partial' ? <span className="cui-calculated-value__partial">{partialText}</span> : null}
            {meaning ? <span className="cui-calculated-value__meaning">{meaning}</span> : null}
          </>
        )}
      </span>
      {open ? (
        <div ref={dialogRef} id={`${id}-dialog`} role="dialog" aria-labelledby={`${id}-title`} className="cui-calculated-value__dialog" tabIndex={-1}>
          <div className="cui-calculated-value__dialog-head">
            <h3 id={`${id}-title`} className="cui-calculated-value__dialog-title">{label}</h3>
            <Button variant="quiet" size="sm" icon="close" iconOnly onClick={() => close(true)}>Close details</Button>
          </div>
          <p className="cui-calculated-value__summary">
            {status === 'cannotCalculate' ? cannotCalculateText : (
              <>
                <strong>{shown}{unit ? ` ${unit}` : ''}</strong>
                {meaning ? `: ${meaning}` : ''}
                {status === 'partial' ? ` (${partialText.charAt(0).toLowerCase()}${partialText.slice(1)})` : ''}
              </>
            )}
          </p>
          {scoringSystem ? <p className="cui-calculated-value__system">Scoring system: {scoringSystem}</p> : null}
          {contributors.length ? (
            <table className="cui-calculated-value__table">
              <caption className="cui-visually-hidden">Values used in the calculation</caption>
              <thead>
                <tr><th scope="col">Value used</th><th scope="col">Field</th><th scope="col">Where entered</th></tr>
              </thead>
              <tbody>
                {contributors.map((c, i) => {
                  const isMissing = c.value == null || c.value === '';
                  const dir = c.outOfRange === 'high' || c.outOfRange === 'low' ? c.outOfRange : undefined;
                  return (
                    <tr key={i} className={cx(isMissing && 'cui-calculated-value__row--missing')}>
                      <td className="cui-calculated-value__cell-value">
                        {isMissing ? <span className="cui-calculated-value__flag">Missing</span> : (
                          <>
                            <strong>{c.value}</strong>{c.unit ? ` ${c.unit}` : ''}
                            {c.outOfRange ? <OutOfRangeMarker direction={dir} /> : null}
                            {c.assumed ? <span className="cui-calculated-value__flag">Assumed</span> : null}
                          </>
                        )}
                      </td>
                      <td>
                        {c.fieldId && onNavigateToField ? (
                          <button type="button" className="cui-calculated-value__link" onClick={() => onNavigateToField(c.fieldId!)}>{c.label}</button>
                        ) : c.label}
                      </td>
                      <td>{c.source === 'record' ? 'From the record' : c.section ?? 'This form'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}
          {missing.length || assumed.length ? (
            <p className="cui-calculated-value__note">
              {missing.length ? `${missing.length} ${missing.length === 1 ? 'value is' : 'values are'} missing. ` : ''}
              {assumed.length ? `A normal value was assumed for ${assumed.map((a) => a.label).join(', ')}.` : ''}
            </p>
          ) : null}
          {onOpenDetails ? (
            <Button ref={firstRef} size="sm" onClick={onOpenDetails}>{detailsLabel}</Button>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}
