import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { MedicationLine } from '../MedicationLine/MedicationLine';
import { MedicationLineData } from '../utils/medicationLine';
import { firstDoseTimeIndex, formatAdministrationTimes } from '../utils/prescription';

export interface PrescriptionPreviewProps {
  /** Drug details of the prescription, shown as a medication line (MSP-2200). */
  medication: MedicationLineData;
  /** Administration times, e.g. ["08:00", "20:00"]. Listed vertically with the first dose in bold (MSP-2240, MSP-2110). */
  administrationTimes?: string[];
  /** First dose (or start) date and time, e.g. "Today 20:00" (MSP-2150). */
  firstDose?: string;
  /** Label for the first dose: "first dose" (regular) or "starting from" (as required) (MSP-2160). Default "first dose". */
  firstDoseLabel?: string;
  /** Duration, e.g. "7 days" or "ongoing". */
  duration?: string;
  /** Any other values defined, e.g. reason for prescribing. All defined values must be shown (MSP-2190). */
  details?: Array<{ label: string; value: string }>;
  /** Include administration times and first dose in the medication line, as in the MSP-2200 example. Default true. */
  scheduleInLine?: boolean;
  /** Authorise is enabled only when all required fields are complete (MSP-2310). Default true. */
  canAuthorise?: boolean;
  /** "Close Preview" returns to the form for amendment (MSP-2250). */
  onClose: () => void;
  /** "Authorise". Omit to hide the button. */
  onAuthorise?: () => void;
  /** Hold Authorise with a reason (disabled, reason shown and referenced by aria-describedby) [suggested]. */
  authoriseBlockedReason?: string;
  /** Heading. Default "Prescription preview". */
  title?: string;
  /** Jurisdiction for the medication line (AU on-screen order with DOSE and SUPPLY; NZ HQSC rules); otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Mixed-case (Tall Man) lettering. Default on for AU and NZ, off for GB. */
  tallManLettering?: boolean;
  /** Move focus to "Close Preview" when shown, never to Authorise (MSP-2260/2300). Default true. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * Read-only preview of a prescription before it is authorised (MSP-2180 to MSP-2310): the
 * medication line wraps and is never one line over 120 characters (MSP-2230), with a structured
 * schedule beneath. Default focus is on "Close Preview".
 */
export function PrescriptionPreview({
  medication, administrationTimes = [], firstDose, firstDoseLabel = 'first dose', duration, details = [],
  scheduleInLine = true, canAuthorise = true, onClose, onAuthorise, authoriseBlockedReason, title = 'Prescription preview', autoFocus = true, className,
  region: regionProp, tallManLettering,
}: PrescriptionPreviewProps) {
  const uid = useId('cui-rx-preview');
  const { region } = useClinicalLocale(regionProp);
  const closeRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => { if (autoFocus) closeRef.current?.focus(); }, [autoFocus]);
  const firstIdx = firstDoseTimeIndex(administrationTimes, firstDose);
  const schedule: string[] = [];
  if (scheduleInLine && administrationTimes.length) schedule.push(formatAdministrationTimes(administrationTimes));
  if (scheduleInLine && firstDose) schedule.push(firstDose);
  const line: MedicationLineData = { ...medication, scheduleText: [...(medication.scheduleText ?? []), ...schedule] };

  return (
    <section className={cx('cui-rx-preview', className)} aria-labelledby={`${uid}-title`}>
      <h3 id={`${uid}-title`} className="cui-rx-preview__title">{title}</h3>
      <p className="cui-rx-preview__status">Not yet prescribed: check the details, then authorise.</p>
      <div className="cui-rx-preview__line">
        <MedicationLine {...line} region={region} tallManLettering={tallManLettering} block />
      </div>
      <dl className="cui-rx-preview__details">
        {administrationTimes.length ? (
          <div className="cui-rx-preview__item">
            <dt>Administration times</dt>
            <dd>
              <ul className="cui-rx-preview__times">
                {administrationTimes.map((t, i) => (
                  <li key={t + i} className={cx(i === firstIdx && 'is-first')}>
                    {i === firstIdx ? <strong>{t}</strong> : t}
                    {i === firstIdx ? <span className="cui-rx-preview__first"> {firstDoseLabel}</span> : null}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {firstDose ? (
          <div className="cui-rx-preview__item">
            <dt>{firstDoseLabel.charAt(0).toUpperCase() + firstDoseLabel.slice(1)}</dt>
            <dd><strong>{firstDose}</strong></dd>
          </div>
        ) : null}
        {duration ? (
          <div className="cui-rx-preview__item">
            <dt>Duration</dt>
            <dd>{duration}</dd>
          </div>
        ) : null}
        {details.map(d => (
          <div className="cui-rx-preview__item" key={d.label}>
            <dt>{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>
      <div className="cui-rx-preview__commands">
        <Button ref={closeRef} onClick={onClose}>Close Preview</Button>
        {onAuthorise ? (
          <Button
            variant="primary"
            onClick={onAuthorise}
            disabled={!canAuthorise || !!authoriseBlockedReason}
            aria-describedby={authoriseBlockedReason ? `${uid}-blocked` : undefined}
          >
            Authorise
          </Button>
        ) : null}
      </div>
      {onAuthorise && authoriseBlockedReason ? (
        <p id={`${uid}-blocked`} className="cui-rx-preview__blocked">
          <Icon name="warning" size={16} />
          <span>{authoriseBlockedReason}</span>
        </p>
      ) : null}
    </section>
  );
}
