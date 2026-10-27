import React from 'react';
import { cx, Icon, useClinicalLocale } from '../../core';
import type { ClinicalRegion, IconName } from '../../core';
import { formatTime } from '../../core/format';
import type { DateLike } from '../../core/format';
import { adminEventGlyph, adminReasonLegend, adminRegionalStatusLabel } from '../utils/adminRegion';
import {
  AdminEventState,
  AdminMedicationKind,
  AdminStatus,
  adminFormatStateLabel,
  adminIsGivenStatus,
} from '../utils/adminEvents';

/** Supplementary markers shown to the right of the status icon (MEDa-0278, 0116). */
export type AdministrationEventMarker =
  | 'firstDose'
  | 'multipleEntries'
  | 'review'
  | 'lockout'
  | 'precondition'
  | 'timeCritical'
  | 'roleRequired'
  | 'witnessRequired'
  | 'selfAdministered'
  | 'testResult';

const MARKERS: Record<AdministrationEventMarker, { icon: IconName | 'W' | 'S'; label: string }> = {
  firstDose: { icon: 'plus', label: 'First administration of a new drug' },
  multipleEntries: { icon: 'history', label: 'More than one entry recorded' },
  review: { icon: 'calendar', label: 'Review scheduled at this time' },
  lockout: { icon: 'lock', label: 'Locked out by a time restriction' },
  precondition: { icon: 'filter', label: 'Precondition applies' },
  timeCritical: { icon: 'clock', label: 'Time critical' },
  roleRequired: { icon: 'user', label: 'Specific role required' },
  witnessRequired: { icon: 'W', label: 'Witness required' },
  selfAdministered: { icon: 'S', label: 'Self-administration' },
  testResult: { icon: 'link', label: 'Related test result available' },
};

export interface AdministrationEventIconProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Schedule state of the event (Table 6). 'recorded' requires `status`. */
  state: AdminEventState;
  /** Recorded status: filled icon when successfully administered, unfilled with solid border otherwise (MEDa-0117). */
  status?: AdminStatus;
  /** AU or NZ reason code recorded with the status, e.g. "W" or "RV": drawn in the icon and shown with its meaning (AU-MD-08, G11 8.2). */
  reasonCode?: string;
  /** Jurisdiction; defaults to the ClinicalLocaleProvider (GB when none). */
  region?: ClinicalRegion;
  /** Drug kind. Once Only uses a round icon, all others square (MEDa-0132). */
  kind?: AdminMedicationKind;
  /** Due or recorded time, used in labels such as "Overdue 08:00" (MEDa-0250). */
  time?: DateLike | null;
  /** Extra text appended to the label, e.g. "Approx 08:30" or a dose (MEDa-0105, 0289). */
  detail?: string;
  /** Show the text label beside the icon. When false the label is still the accessible name (MEDa-0120). */
  showLabel?: boolean;
  /** The status has been edited: an edited marker is always visible, not only on hover (MEDa-0096). */
  edited?: boolean;
  /** Supplementary markers, drawn to the right of the status icon, never replacing it (MEDa-0116, 0278). */
  markers?: AdministrationEventMarker[];
  /** Name of the drug, added to the accessible name so screen reader users know which line [suggested]. */
  medicationName?: string;
  /** Makes the icon an activatable button (Enter or Space), e.g. to open the recording form (MEDa-0190, 0108). */
  onActivate?: (e: React.SyntheticEvent) => void;
}

/** Text label for a state or status, e.g. "Overdue 08:00", "Patient refused" (GB) or "W Withheld" (AU, NZ). */
export function administrationEventLabel(
  state: AdminEventState,
  status?: AdminStatus,
  time?: DateLike | null,
  region: ClinicalRegion = 'GB',
  reasonCode?: string,
): string {
  if (state === 'recorded' && status) return adminRegionalStatusLabel(status, reasonCode, region);
  if (state === 'future') return time ? `Scheduled ${formatTime(time)}` : 'Scheduled';
  return adminFormatStateLabel(state, time);
}

function variantOf(state: AdminEventState, status?: AdminStatus): string {
  if (state === 'recorded') return adminIsGivenStatus(status) ? 'given' : 'not-given';
  return state;
}

function Glyph({ state, status, reasonCode, region }: { state: AdminEventState; status?: AdminStatus; reasonCode?: string; region: ClinicalRegion }) {
  if (state === 'recorded' && status) {
    const g = adminEventGlyph(status, reasonCode, region);
    if (g === 'check') return <path className="cui-admin-event-icon__glyph-line" d="M6 10.2l2.8 2.8L14.2 7.4" />;
    return (
      <text
        className={cx('cui-admin-event-icon__glyph-text', g.length > 1 && 'cui-admin-event-icon__glyph-text--pair')}
        x="10"
        y="10.5"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {g}
      </text>
    );
  }
  switch (state) {
    case 'due':
      return <rect className="cui-admin-event-icon__glyph-fill" x="7.5" y="7.5" width="5" height="5" />;
    case 'overdue':
      return (
        <>
          <path className="cui-admin-event-icon__glyph-line" d="M10 5.8v5.2" />
          <circle className="cui-admin-event-icon__glyph-fill" cx="10" cy="14" r="1.2" />
        </>
      );
    case 'unscheduled':
      return <path className="cui-admin-event-icon__glyph-line" d="M10 6.5v7M6.5 10h7" />;
    case 'begun':
      return <path className="cui-admin-event-icon__glyph-fill" d="M8 6.5l5.5 3.5L8 13.5z" />;
    default:
      return null;
  }
}

/**
 * Administration event symbol: shape, fill, border style and a text label together carry the
 * state, so colour is never the only cue (MEDa-0120). Outline is symmetrical about the horizontal
 * axis so its centre can sit on the event time (MEDa-0269, 0232).
 */
export const AdministrationEventIcon = React.forwardRef<HTMLElement, AdministrationEventIconProps>(function AdministrationEventIcon(
  { state, status, reasonCode, region: regionProp, kind, time, detail, showLabel = true, edited, markers = [], medicationName, onActivate, className, title, ...rest },
  ref,
) {
  const { region } = useClinicalLocale(regionProp);
  const label = administrationEventLabel(state, status, time, region, reasonCode);
  const legend = state === 'recorded' && region !== 'GB' ? adminReasonLegend(reasonCode, region) : undefined;
  const round = kind === 'onceOnly';
  const variant = variantOf(state, status);
  const accessible = [
    legend && legend !== label.slice(label.indexOf(' ') + 1) ? `${label} (${legend})` : label,
    detail,
    medicationName,
    ...markers.map(m => MARKERS[m].label),
    edited ? 'Edited' : '',
  ]
    .filter(Boolean)
    .join(', ');

  const content = (
    <>
      <svg className="cui-admin-event-icon__symbol" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {round ? (
          <circle className="cui-admin-event-icon__shape" cx="10" cy="10" r="8" />
        ) : (
          <rect className="cui-admin-event-icon__shape" x="2" y="2" width="16" height="16" rx="2" />
        )}
        <Glyph state={state} status={status} reasonCode={reasonCode} region={region} />
      </svg>
      {showLabel && (label || detail) ? (
        <span className="cui-admin-event-icon__text">
          {label ? <span className="cui-admin-event-icon__label">{label}</span> : null}
          {detail ? <span className="cui-admin-event-icon__detail">{detail}</span> : null}
        </span>
      ) : null}
      {markers.length || edited ? (
        <span className="cui-admin-event-icon__markers" aria-hidden="true">
          {markers.map(m => {
            const d = MARKERS[m];
            return (
              <span key={m} className="cui-admin-event-icon__marker" title={d.label}>
                {d.icon === 'W' || d.icon === 'S' ? <span className="cui-admin-event-icon__marker-letter">{d.icon}</span> : <Icon name={d.icon} size={16} />}
              </span>
            );
          })}
          {edited ? (
            <span className="cui-admin-event-icon__marker cui-admin-event-icon__marker--edited" title="Edited">
              <Icon name="pencil" size={16} />
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  );

  const cls = cx(
    'cui-admin-event-icon',
    `cui-admin-event-icon--${variant}`,
    round && 'cui-admin-event-icon--round',
    onActivate && 'cui-admin-event-icon--active',
    className,
  );

  if (onActivate) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        aria-label={accessible}
        title={title ?? legend}
        onClick={onActivate}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={cls} role="img" aria-label={accessible} title={title ?? legend} {...rest}>
      {content}
    </span>
  );
});
