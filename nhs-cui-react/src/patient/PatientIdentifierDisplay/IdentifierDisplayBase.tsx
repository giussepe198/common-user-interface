import React from 'react';
import { cx, Icon } from '../../core';
import { PATIENT_UNKNOWN_TEXT } from '../utils/patient';
import { LabelledValue } from '../LabelledValue/LabelledValue';

/** A text qualifier shown after an identifier: never colour alone (AU-ID-01). */
export interface IdentifierFlag {
  text: string;
  /** "warning" for invalid or test numbers, "info" for status qualifiers. */
  tone: 'warning' | 'info';
}

/** Internal base for identifier displays. Not exported publicly. */
export interface IdentifierDisplayBaseProps {
  /** Modifier for the block class, e.g. "ihi". */
  kind: string;
  /** The value as supplied, trimmed. Empty shows `unknownText`. */
  raw: string;
  /** Formatted value, or null to show the raw value exactly as supplied (never a partial grouping). */
  formatted: string | null;
  flags?: ReadonlyArray<IdentifierFlag>;
  /** Content after the number, e.g. "IRN 1". */
  suffix?: React.ReactNode;
  /** Content after the flags, outside any open-record button (e.g. a "Use live NHI" action). */
  after?: React.ReactNode;
  label?: string;
  definition?: string;
  unknownText?: string;
  onOpenRecord?: () => void;
  className?: string;
}

export function IdentifierDisplayBase({
  kind,
  raw,
  formatted,
  flags = [],
  suffix,
  after,
  label,
  definition,
  unknownText = PATIENT_UNKNOWN_TEXT,
  onOpenRecord,
  className,
}: IdentifierDisplayBaseProps) {
  const valueContent = raw ? (
    <span className={cx('cui-identifier__value', flags.some((f) => f.tone === 'warning') && 'cui-identifier__value--flagged')}>
      <span className="cui-identifier__digits">{formatted ?? raw}</span>
      {suffix ? (
        <>
          {' '}
          <span className="cui-identifier__suffix">{suffix}</span>
        </>
      ) : null}
      {flags.map((f, i) => (
        <span key={i} className={cx('cui-identifier__flag', `cui-identifier__flag--${f.tone}`)}>
          {' '}
          {f.tone === 'warning' ? <Icon name="warning" size={16} /> : null}
          <span>{f.tone === 'info' ? `(${f.text})` : f.text}</span>
        </span>
      ))}
    </span>
  ) : null;
  const content = valueContent;
  const cls = cx('cui-identifier', `cui-identifier--${kind}`, className);
  if (label) {
    const labelled = (
      <LabelledValue className={cls} label={label} definition={definition} value={content} unknownText={unknownText} onOpenRecord={onOpenRecord} />
    );
    return after && raw ? (
      <span className="cui-identifier__group">
        {labelled}
        {after}
      </span>
    ) : (
      labelled
    );
  }
  return (
    <span className={cx(cls, !raw && 'cui-identifier--unknown')}>
      {raw ? (
        onOpenRecord ? (
          <button type="button" className="cui-labelled-value__open" onClick={onOpenRecord} title="Click here to open this section of the record.">
            {content}
          </button>
        ) : (
          content
        )
      ) : (
        unknownText
      )}
      {raw && after ? after : null}
    </span>
  );
}
