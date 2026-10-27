import React from 'react';
import { cx, formatShortDate, DateLike } from '../../core';
import type { MedicationStatus } from '../utils/medicationsList';
import { isCurrentMedicationStatus } from '../utils/medicationsList';

/** Internal: bold status text with optional suspended date and supplement (MEDv-042, MEDv-164, MEDv-024). */
export function MedicationStatusText({ status, suspendedOn, supplement, className }: {
  status: MedicationStatus;
  suspendedOn?: DateLike;
  supplement?: string;
  className?: string;
}) {
  const past = !isCurrentMedicationStatus(status);
  // Dates never break across lines.
  const text = status === 'Suspended' && suspendedOn
    ? <>Suspended on <span className="cui-nowrap">{formatShortDate(suspendedOn)}</span></>
    : status;
  return (
    <span
      className={cx(
        'cui-medication-status',
        status === 'Suspended' && 'cui-medication-status--suspended',
        status === 'Not Started' && 'cui-medication-status--not-started',
        past && 'cui-medication-status--past',
        className,
      )}
    >
      <span className="cui-medication-status__value">{text}</span>
      {supplement ? <span className="cui-medication-status__supplement">{supplement}</span> : null}
    </span>
  );
}
