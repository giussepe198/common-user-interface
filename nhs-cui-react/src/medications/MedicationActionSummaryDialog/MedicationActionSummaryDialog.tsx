import React from 'react';
import { Button, cx, useClinicalLocale, useId } from '../../core';
import type { ClinicalRegion } from '../../core';
import { MedicationLine } from '../MedicationLine/MedicationLine';
import { MedicationStatusText } from '../MedicationLine/MedicationStatus';
import type { MedicationRecord } from '../utils/medicationsList';

export interface MedicationActionSummaryDialogProps {
  /** The action, as a verb, e.g. "Suspend", "Discontinue", "Verify". Used in the title and confirm button. */
  actionLabel: string;
  /** The selected medications. Each is listed in full as a medication line with its status (MEDv-203, MEDi-012). */
  medications: MedicationRecord[];
  /** Complete the action for all the listed medications. */
  onConfirm: () => void;
  /** Go back without doing anything. Also on Esc and on the backdrop. */
  onCancel: () => void;
  /** Heading. Default "{actionLabel} {n} medications". */
  title?: string;
  /** Confirm button text. Default "{actionLabel} {n} medications", so the count is stated where the decision is made [suggested]. */
  confirmLabel?: string;
  /** Text under the heading. Default "Check that these are the medications you mean before you continue." [suggested]. */
  description?: string;
  /** Confirm button style. Use "danger" for actions such as discontinue. Default "primary". */
  confirmVariant?: 'primary' | 'danger';
  /** Render in place without the modal backdrop, e.g. inside a side panel. Default false. */
  inline?: boolean;
  /** Jurisdiction for the medication lines; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  className?: string;
}

const plural = (n: number) => `${n} medication${n === 1 ? '' : 's'}`;

/**
 * Summary of the selected medications shown before an action on more than one medication is
 * completed (MEDv-203), so selected rows scrolled out of view are not forgotten. Every medication
 * is listed in full, never truncated. Focus starts on Cancel; Esc cancels.
 */
export function MedicationActionSummaryDialog({
  actionLabel, medications, onConfirm, onCancel, title, confirmLabel, description, confirmVariant = 'primary', inline = false,
  region: regionProp, className,
}: MedicationActionSummaryDialogProps) {
  const uid = useId('cui-med-summary');
  const { region } = useClinicalLocale(regionProp);
  const ref = React.useRef<HTMLDivElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const n = medications.length;
  const heading = title ?? `${actionLabel} ${plural(n)}`;

  React.useEffect(() => {
    if (inline) return undefined;
    const previous = document.activeElement as HTMLElement | null;
    // Default focus on Cancel, never on the confirming action [suggested, as MSP-2300 for Authorise].
    cancelRef.current?.focus();
    return () => { previous?.focus?.(); };
  }, [inline]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); return; }
    if (e.key !== 'Tab' || inline) return;
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]') ?? []);
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const dialog = (
    <div
      ref={ref}
      role={inline ? 'region' : 'dialog'}
      aria-modal={inline ? undefined : true}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-desc`}
      className={cx('cui-med-summary', inline && 'cui-med-summary--inline', className)}
      onKeyDown={onKeyDown}
    >
      <h2 id={`${uid}-title`} className="cui-med-summary__title">{heading}</h2>
      <p id={`${uid}-desc`} className="cui-med-summary__desc">
        {description ?? 'Check that these are the medications you mean before you continue.'}{' '}
        <strong>{plural(n)} selected.</strong>
      </p>
      <ol className="cui-med-summary__list" tabIndex={0} aria-label="Selected medications">
        {medications.map((m, i) => (
          <li key={m.id} className={cx('cui-med-summary__item', i % 2 === 1 && 'is-shaded')}>
            <MedicationLine {...m.line} region={region} block />
            <MedicationStatusText status={m.status} suspendedOn={m.suspendedOn} supplement={m.statusSupplement} className="cui-med-summary__status" />
          </li>
        ))}
      </ol>
      <div className="cui-med-summary__commands">
        <Button ref={cancelRef} onClick={onCancel}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} disabled={n === 0}>{confirmLabel ?? `${actionLabel} ${plural(n)}`}</Button>
      </div>
    </div>
  );

  if (inline) return dialog;
  return (
    <div className="cui-med-summary-layer">
      <div className="cui-med-summary-layer__backdrop" aria-hidden="true" onClick={onCancel} />
      {dialog}
    </div>
  );
}
