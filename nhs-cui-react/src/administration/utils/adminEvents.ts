/**
 * Drug administration: data model and event status derivation.
 * Source: CUI Medications Management - Drug Administration (MEDa-xxxx).
 * Pure functions, no React.
 */
import { DateLike, formatTime, toDate } from '../../core/format';
import type { MedicationLineData } from '../../medications';

/** Recorded administration statuses (MEDa-0119, fig 95). Never "Missed" or "Not Recorded" (MEDa-0282). */
export type AdminStatus =
  | 'given'
  | 'givenLate'
  | 'givenEarly'
  | 'givenOnceOnly'
  | 'selfAdministered'
  | 'patientRefused'
  | 'patientAbsent'
  | 'otherClinicalReason'
  | 'drugUnavailable'
  | 'nilByMouth'
  | 'drugFreeInterval'
  | 'deferred'
  | 'withheld'
  | 'carerAdministered'
  | 'unknown';

/** Schedule state of an event (Table 6). 'recorded' means a status has been recorded. */
export type AdminEventState = 'future' | 'next' | 'due' | 'overdue' | 'begun' | 'unscheduled' | 'recorded';

/** Drug categories on the chart, including the three As Required types (definitions). */
export type AdminMedicationKind =
  | 'regular'
  | 'onceOnly'
  | 'asRequiredUnscheduled'
  | 'asRequiredIndicative'
  | 'asRequiredScheduled'
  | 'significantDuration';

/** Local governance time tolerances in minutes, relative to the scheduled time. */
export interface AdminTolerance {
  /** Event becomes Due this many minutes before its scheduled time. */
  dueFromMinutes: number;
  /** Event becomes Overdue this many minutes after its scheduled time. */
  overdueAfterMinutes: number;
}

/** How precisely the administration time was recorded (MEDa-0104 to MEDa-0106). */
export type AdminTimePrecision = 'withinTolerance' | 'approx' | 'exact';

/** One administration event for one medication line. */
export interface AdminEvent {
  id: string;
  /** Intended (scheduled) time. Absent for unscheduled As Required events. */
  scheduledTime?: DateLike;
  /** Recorded status. Absent until recorded. */
  status?: AdminStatus;
  /** Recorded time of administration. */
  administeredAt?: DateLike;
  /** Regional reason code recorded with the status, e.g. AU "W" or NZ "RV" (G10 9.6, G11 8.2). Ignored for GB. */
  reasonCode?: string;
  /** Written reason or explanation, required for some codes (AU-MD-09; NZ D, N, W). */
  reasonText?: string;
  /** Precision of the recorded time. Default 'withinTolerance' (no time shown, MEDa-0104). */
  timePrecision?: AdminTimePrecision;
  /** Actual dose given (MEDa-0289, 0291, 0292). */
  dose?: string;
  /** Intended dose for dose-pattern drugs (MEDa-0293). */
  intendedDose?: string;
  /** Notes recorded with the event (MEDa-0238, 0256). */
  notes?: string;
  /** Precondition text, e.g. "Check pulse above 60" (MEDa-0173, 0174). */
  precondition?: string;
  /** Name of the person who recorded the event (MEDa-0181, 0183). */
  recordedBy?: string;
  /** The status has been edited; an edited marker is always shown (MEDa-0096). */
  edited?: boolean;
  /** A witness is required (MEDa-0184, 0185). */
  requiresWitness?: boolean;
  /** Role required to administer (MEDa-0182, 0183). */
  requiredRole?: string;
  /** Special time tolerance applies, e.g. Parkinson's medication (MEDa-0179). */
  timeCritical?: boolean;
  /** A related test result is available (MEDa-0258). */
  testResultAvailable?: boolean;
  /** More than one entry has been recorded for the event (MEDa-0278). */
  multipleEntries?: boolean;
  /** A review is scheduled at the same time (MEDa-0278). */
  review?: boolean;
}

/** Significant Duration administration such as an infusion (MEDa-0142 to MEDa-0151). */
export interface AdminInfusion {
  scheduledStart: DateLike;
  expectedDurationMinutes: number;
  actualStart?: DateLike;
  stoppedAt?: DateLike;
  interruptions?: { start: DateLike; end?: DateLike; reason?: string }[];
  /** Detailed record: bag changes, rates, pump settings, checks, issues and notes (MEDa-0152, 0157, 0159). */
  log?: AdminInfusionEntry[];
}

/** Kind of entry in the detailed record of a Significant Duration administration (MEDa-0152). */
export type AdminInfusionEntryKind =
  | 'start'
  | 'stop'
  | 'bagChange'
  | 'rateChange'
  | 'pumpSetting'
  | 'interruption'
  | 'resume'
  | 'check'
  | 'issue'
  | 'note';

/** One entry in the detailed record of an infusion (MEDa-0152 to MEDa-0162). */
export interface AdminInfusionEntry {
  id: string;
  kind: AdminInfusionEntryKind;
  at: DateLike;
  by?: string;
  /** Rate after this entry, e.g. "125 mL/hour". */
  rate?: string;
  /** Volume, e.g. volume infused at a check or volume of a new bag (MEDa-0157). */
  volume?: string;
  /** The volume is approximate (MEDa-0161). */
  volumeApprox?: boolean;
  /** Pump setting text, e.g. "VTBI 1000 mL". */
  pumpSetting?: string;
  /** Classification from a limited list, for issues and notes (MEDa-0162). */
  category?: string;
  text?: string;
  /** Issues only: outstanding until resolved (MEDa-0159). */
  resolved?: boolean;
  /** Issues only: what to do (MEDa-0159). */
  instruction?: string;
  /** Issues only: action buttons, e.g. "Contact prescriber" (MEDa-0159). */
  actions?: { id: string; label: string }[];
}

/** One medication line on the drug administration chart (MEDa-0001). */
export interface AdminMedication {
  id: string;
  /** Drug name as it appears on the medication line (MEDa-0265). */
  name: string;
  /**
   * Structured medication line, rendered with the medications area's MedicationLine (MEDa-0265).
   * When absent, `name` is rendered as the generic name followed by `details`.
   */
  line?: MedicationLineData;
  /** Dose, route and frequency text of the medication line, e.g. "500 mg, oral, four times a day". */
  details?: string;
  kind: AdminMedicationKind;
  /** Route; 'oral' triggers the Nil by Mouth reminder (MEDa-0165). */
  route?: string;
  prescriber?: string;
  /** Intended first administration, or actual first dose once given (MEDa-0044). */
  startDate: DateLike;
  /** True once the first dose has been given (start label shows the actual time). */
  startIsActual?: boolean;
  endDate?: DateLike;
  reviewDate?: DateLike;
  /** Set when the drug is past (MEDa-0222). */
  pastState?: 'completed' | 'discontinued';
  /** Scheduled times of day, 'HH:mm', shown in the time scale (MEDa-0235, 0276). */
  scheduledTimes?: string[];
  events: AdminEvent[];
  tolerance?: AdminTolerance;
  /** Administration priority; lower numbers sort higher at equal times (MEDa-0025). */
  priority?: number;
  asRequired?: { criteria?: string; minIntervalMinutes?: number; maxPerDay?: number };
  doseVariation?: 'none' | 'conditional' | 'range' | 'constantPattern' | 'varyingPattern';
  /** Criteria for a conditional dose, shown by the Next event (MEDa-0288). */
  doseCriteria?: string;
  /** Dose range for a range drug (MEDa-0290). */
  doseRange?: string;
  /** Pharmacist verification; omit when verification is not used (MEDa-0268). */
  verification?: 'verified' | 'awaiting';
  verifiedBy?: string;
  verifiedAt?: DateLike;
  /** Additional administration instructions (status icon, MEDa-0051). */
  instructions?: string;
  infusion?: AdminInfusion;
}

/** [suggested] Default tolerance: Due from 1 hour before, Overdue 1 hour after (example in Table 6). */
export const ADMIN_DEFAULT_TOLERANCE: AdminTolerance = { dueFromMinutes: 60, overdueAfterMinutes: 60 };

const MIN = 60000;

/** Display text for each recorded status. */
export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  given: 'Given',
  givenLate: 'Given late',
  givenEarly: 'Given early',
  givenOnceOnly: 'Given (once only)',
  selfAdministered: 'Self-administered',
  patientRefused: 'Patient refused',
  patientAbsent: 'Patient absent',
  otherClinicalReason: 'Other clinical reason',
  drugUnavailable: 'Drug unavailable',
  nilByMouth: 'Nil by mouth',
  drugFreeInterval: 'Drug-free interval',
  deferred: 'Deferred administration',
  withheld: 'Withheld',
  carerAdministered: 'Carer or parent administered',
  unknown: 'Unknown',
};

/** Statuses meaning the drug was successfully administered (filled icon, MEDa-0117). */
export function adminIsGivenStatus(status: AdminStatus | undefined): boolean {
  return status === 'given' || status === 'givenLate' || status === 'givenEarly' || status === 'givenOnceOnly' || status === 'selfAdministered' || status === 'carerAdministered';
}

export function adminIsAsRequired(kind: AdminMedicationKind): boolean {
  return kind === 'asRequiredUnscheduled' || kind === 'asRequiredIndicative' || kind === 'asRequiredScheduled';
}

/** Unscheduled As Required (including indicative frequency, which is never plotted). */
export function adminIsUnscheduled(kind: AdminMedicationKind): boolean {
  return kind === 'asRequiredUnscheduled' || kind === 'asRequiredIndicative';
}

/** Time at which an event is plotted: recorded unscheduled As Required at the recorded time (MEDa-0273), others at the intended time (MEDa-0270). */
export function adminEventPlotTime(event: AdminEvent): Date | null {
  return toDate(event.scheduledTime ?? null) ?? toDate(event.administeredAt ?? null);
}

/**
 * State of a single event, before Next is applied.
 * Overdue never changes automatically to another status (MEDa-0281).
 */
export function adminEventStatus(event: AdminEvent, med: Pick<AdminMedication, 'kind' | 'tolerance'>, now: Date): AdminEventState {
  if (event.status) return 'recorded';
  if (adminIsUnscheduled(med.kind)) return 'unscheduled';
  const t = toDate(event.scheduledTime ?? null);
  if (!t) return 'future';
  const tol = med.tolerance ?? ADMIN_DEFAULT_TOLERANCE;
  const n = now.getTime();
  if (n >= t.getTime() + tol.overdueAfterMinutes * MIN) return 'overdue';
  if (n >= t.getTime() - tol.dueFromMinutes * MIN) return 'due';
  return 'future';
}

/**
 * States of every event of a medication, with Next applied (MEDa-0252): the earliest future
 * event of a drug that has no Due or Overdue event, excluding unscheduled As Required.
 */
export function adminEventStates(med: AdminMedication, now: Date): Map<string, AdminEventState> {
  const out = new Map<string, AdminEventState>();
  for (const e of med.events) out.set(e.id, adminEventStatus(e, med, now));
  if (adminIsUnscheduled(med.kind)) return out;
  const states = Array.from(out.values());
  if (states.includes('due') || states.includes('overdue')) return out;
  let next: AdminEvent | null = null;
  let nextT = Infinity;
  for (const e of med.events) {
    if (out.get(e.id) !== 'future') continue;
    const t = toDate(e.scheduledTime ?? null)?.getTime() ?? Infinity;
    if (t < nextT) { nextT = t; next = e; }
  }
  if (next) out.set(next.id, 'next');
  return out;
}

/** Status of a Significant Duration administration for its status box (MEDa-0150). */
export type AdminInfusionStatus = 'startAt' | 'dueAt' | 'begun' | 'completed' | 'discontinued';

export function adminInfusionStatus(med: AdminMedication, now: Date): AdminInfusionStatus | null {
  const inf = med.infusion;
  if (!inf) return null;
  if (med.pastState === 'discontinued') return 'discontinued';
  if (med.pastState === 'completed' || toDate(inf.stoppedAt ?? null)) return 'completed';
  if (toDate(inf.actualStart ?? null)) return 'begun';
  const start = toDate(inf.scheduledStart);
  const tol = med.tolerance ?? ADMIN_DEFAULT_TOLERANCE;
  if (start && now.getTime() >= start.getTime() - tol.dueFromMinutes * MIN) return 'dueAt';
  return 'startAt';
}

/** Status box text: "Start at 10:00", "Due at 10:00", "Begun", "Completed", "Discontinued" (MEDa-0150). */
export function adminInfusionStatusLabel(status: AdminInfusionStatus, scheduledStart?: DateLike): string {
  switch (status) {
    case 'startAt': return `Start at ${formatTime(scheduledStart ?? '')}`;
    case 'dueAt': return `Due at ${formatTime(scheduledStart ?? '')}`;
    case 'begun': return 'Begun';
    case 'completed': return 'Completed';
    case 'discontinued': return 'Discontinued';
  }
}

/**
 * Estimated stop time recalculated from the recorded start and recorded interruptions (MEDa-0285).
 * An interruption with no end is counted up to `now` [suggested].
 */
export function adminEstimatedStop(inf: AdminInfusion, now?: Date): Date | null {
  const start = toDate(inf.actualStart ?? null) ?? toDate(inf.scheduledStart);
  if (!start) return null;
  let ms = start.getTime() + inf.expectedDurationMinutes * MIN;
  for (const i of inf.interruptions ?? []) {
    const s = toDate(i.start);
    const e = toDate(i.end ?? null) ?? now ?? null;
    if (s && e && e > s) ms += e.getTime() - s.getTime();
  }
  return new Date(ms);
}

/**
 * When an As Required drug is locked out by a time restriction, the time the lockout ends (MEDa-0136, 0137).
 * Advisory only: never use this to block recording.
 */
export function adminLockoutEnd(med: AdminMedication, now: Date): Date | null {
  if (!adminIsAsRequired(med.kind) || !med.asRequired) return null;
  const given = med.events
    .filter(e => adminIsGivenStatus(e.status))
    .map(e => toDate(e.administeredAt ?? null) ?? toDate(e.scheduledTime ?? null))
    .filter((d): d is Date => !!d && d.getTime() <= now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  let end = 0;
  const { minIntervalMinutes, maxPerDay } = med.asRequired;
  const last = given[given.length - 1];
  if (minIntervalMinutes && last) end = Math.max(end, last.getTime() + minIntervalMinutes * MIN);
  if (maxPerDay) {
    const inDay = given.filter(d => d.getTime() > now.getTime() - 1440 * MIN);
    if (inDay.length >= maxPerDay) end = Math.max(end, inDay[inDay.length - maxPerDay].getTime() + 1440 * MIN);
  }
  return end > now.getTime() ? new Date(end) : null;
}

/** "Overdue 08:00", "Due 12:00", "Next 18:00" (MEDa-0250), "Begun" (MEDa-0264), else ''. */
export function adminFormatStateLabel(state: AdminEventState, time?: DateLike | null): string {
  const t = time ? formatTime(time) : '';
  switch (state) {
    case 'overdue': return t ? `Overdue ${t}` : 'Overdue';
    case 'due': return t ? `Due ${t}` : 'Due';
    case 'next': return t ? `Next ${t}` : 'Next';
    case 'begun': return 'Begun';
    case 'unscheduled': return 'Available';
    default: return '';
  }
}

/**
 * Time shown for a recorded administration in the selected day: nothing when within tolerance
 * (MEDa-0104), "Approx HH:mm" when approximate (MEDa-0105), "HH:mm" when exact (MEDa-0106).
 */
export function adminFormatTimeLabel(event: AdminEvent): string {
  if (!event.administeredAt) return '';
  if (event.timePrecision === 'approx') return formatTime(event.administeredAt, { approx: true });
  if (event.timePrecision === 'exact') return formatTime(event.administeredAt);
  return '';
}

/** Status recorded for a "Given" outcome, from the event state (Table 6) and drug kind. */
export function adminDeriveGivenStatus(state: AdminEventState, kind: AdminMedicationKind, selfAdministered = false): AdminStatus {
  if (selfAdministered) return 'selfAdministered';
  if (kind === 'onceOnly') return 'givenOnceOnly';
  if (state === 'overdue') return 'givenLate';
  if (state === 'next' || state === 'future') return 'givenEarly';
  return 'given';
}

/** Validation: administration time cannot be in the future (MEDa-0239). Returns an error message or null. */
export function adminValidateAdministrationTime(time: Date | null, now: Date): string | null {
  if (!time || isNaN(time.getTime())) return 'Enter the time of administration as HH:mm, for example 08:30';
  if (time.getTime() > now.getTime()) return 'The time of administration cannot be in the future';
  return null;
}

/** Past events with no recorded status, other than `excludeId`, oldest first (MEDa-0284). */
export function adminOutstandingEvents(med: AdminMedication, now: Date, excludeId?: string): AdminEvent[] {
  if (adminIsUnscheduled(med.kind)) return [];
  return med.events
    .filter(e => e.id !== excludeId && !e.status)
    .filter(e => {
      const t = toDate(e.scheduledTime ?? null);
      return !!t && t.getTime() <= now.getTime();
    })
    .sort((a, b) => (toDate(a.scheduledTime!)!.getTime() - toDate(b.scheduledTime!)!.getTime()));
}
