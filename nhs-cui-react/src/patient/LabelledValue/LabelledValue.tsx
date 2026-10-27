import React from 'react';
import { cx } from '../../core';
import { PATIENT_UNKNOWN_TEXT } from '../utils/patient';
import { DefinitionTip } from './DefinitionTip';

export interface LabelledValueProps {
  /** Label text in "label text" style with no colon (PAB-0042, PAB-0044). A trailing colon is removed. */
  label: string;
  /** The data, shown in the more emphasised "data text" style (PAB-0045, PAB-0046). Empty, "?" or "-" shows `unknownText` (PAB-0019). */
  value?: React.ReactNode;
  /** Definition shown as a keyboard-accessible tooltip on the label (PAB-0047, MPB-0044). */
  definition?: string;
  /** Shown when the value is missing. Default "Not Known"; never "?" (PAB-0019, MPB-0022). */
  unknownText?: string;
  /** Makes the value a button that opens this part of the record (PAB-0048). */
  onOpenRecord?: () => void;
  /** Tooltip for the open-record button. Default "Click here to open this section of the record." (PAB QIG). */
  openRecordTooltip?: string;
  /** "inline": label then value on one line (banners). "stacked": label above value. Default "inline". */
  layout?: 'inline' | 'stacked';
  /** Keep label and value together on one line. Default true. */
  noWrap?: boolean;
  className?: string;
  id?: string;
}

const isEmpty = (v: React.ReactNode) =>
  v === null || v === undefined || v === false || (typeof v === 'string' && /^\s*[?-]?\s*$/.test(v));

/** Label and value pair used by the patient banners: label style, data style, no colon, never "?". */
export function LabelledValue({
  label,
  value,
  definition,
  unknownText = PATIENT_UNKNOWN_TEXT,
  onOpenRecord,
  openRecordTooltip = 'Click here to open this section of the record.',
  layout = 'inline',
  noWrap = true,
  className,
  id,
}: LabelledValueProps) {
  const cleanLabel = label.replace(/\s*:\s*$/, '');
  const empty = isEmpty(value);
  const shown = empty ? unknownText : value;
  return (
    <span
      id={id}
      className={cx(
        'cui-labelled-value',
        `cui-labelled-value--${layout}`,
        noWrap && 'cui-labelled-value--nowrap',
        className,
      )}
    >
      <span className="cui-labelled-value__label">
        {definition ? <DefinitionTip definition={definition}>{cleanLabel}</DefinitionTip> : cleanLabel}
      </span>
      {layout === 'inline' ? ' ' : null}
      <span className={cx('cui-labelled-value__value', empty && 'cui-labelled-value__value--unknown')}>
        {onOpenRecord && !empty ? (
          <button type="button" className="cui-labelled-value__open" title={openRecordTooltip} onClick={onOpenRecord}>
            {shown}
          </button>
        ) : (
          shown
        )}
      </span>
    </span>
  );
}
