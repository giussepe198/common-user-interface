/**
 * Drug administration chart: time window, visibility, list order, grouping and counts.
 * Source: CUI Medications Management - Drug Administration (MEDa-xxxx). Pure functions, no React.
 */
import { DateLike, toDate } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import { ADMIN_CHART_WORDING } from './regions/administration';
import {
  ADMIN_DEFAULT_TOLERANCE,
  AdminMedication,
  AdminMedicationKind,
  adminEventPlotTime,
  adminEventStates,
  adminInfusionStatus,
  adminIsAsRequired,
  adminIsUnscheduled,
  adminLockoutEnd,
} from './adminEvents';

const DAY = 86400000;

/** Local midnight at the start of the day containing `d`. */
export function adminStartOfDay(d: DateLike): Date {
  const x = toDate(d) ?? new Date(NaN);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

/** Add whole calendar days (local time, safe across daylight saving changes). */
export function adminAddDays(d: DateLike, days: number): Date {
  const x = adminStartOfDay(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate() + days);
}

export function adminIsSameDay(a: DateLike, b: DateLike): boolean {
  return adminStartOfDay(a).getTime() === adminStartOfDay(b).getTime();
}

/** The four visible days: two before, the selected day (third, widest column), one after (MEDa-0064, 0084). */
export function adminVisibleWindow(selected: DateLike): Date[] {
  return [-2, -1, 0, 1].map(n => adminAddDays(selected, n));
}

/** Time a medication stops being current, or null if still current with no end. */
export function adminMedicationEnd(med: AdminMedication): Date | null {
  const end = toDate(med.endDate ?? null);
  if (end) return end;
  if (med.pastState) {
    const times = med.events.map(e => adminEventPlotTime(e)?.getTime() ?? 0);
    const last = Math.max(toDate(med.startDate)?.getTime() ?? 0, ...times);
    return new Date(last);
  }
  return null;
}

/** Past drug: completed or discontinued at the time viewed (definitions). */
export function adminIsPastMedication(med: AdminMedication, now: Date): boolean {
  if (med.pastState) return true;
  const end = toDate(med.endDate ?? null);
  return !!end && end.getTime() <= now.getTime();
}

/**
 * Show every medication that was or is current at any point in the visible window (MEDa-0262),
 * and retain medications current as of now while navigating (MEDa-0263).
 */
export function adminIsMedicationVisible(med: AdminMedication, windowStart: Date, windowEnd: Date, now: Date): boolean {
  const start = toDate(med.startDate)?.getTime() ?? -Infinity;
  const end = adminMedicationEnd(med)?.getTime() ?? Infinity;
  if (start < windowEnd.getTime() && end > windowStart.getTime()) return true;
  return !adminIsPastMedication(med, now) && start <= now.getTime() && end > now.getTime();
}

/** Vertical position in a 24-hour line: 00:00 at the top, 24:00 at the bottom, linear (MEDa-0231, 0237). */
export function adminTimeToY(time: DateLike, dayStart: DateLike, heightPx: number): number {
  const t = toDate(time)?.getTime() ?? 0;
  const s = adminStartOfDay(dayStart).getTime();
  const f = Math.min(1, Math.max(0, (t - s) / DAY));
  return f * heightPx;
}

/** Parse 'HH:mm' to minutes after midnight, or null. */
export function adminParseClock(hhmm: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/**
 * Minutes after midnight of a scheduled clock time, accepting chart forms: "HH:mm", "HHmm", and
 * midnight written as "24:00" or "2400" (NIMC prints 2400 for 6 hourly doses, G10 9.6), which gives
 * 1440 (the end of the day). Null when not a time.
 */
export function adminScheduleMinutes(time: string): number | null {
  const t = time.trim();
  if (/^24:?00$/.test(t)) return 1440;
  const m = /^([01]?\d|2[0-3]):?([0-5]\d)$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** A label on a drug's time scale. */
export interface AdminScaleLabel {
  /** Minutes after the start of the day (0 at the top, 1440 at the bottom). */
  minutes: number;
  /** Always HH:mm; midnight is "00:00", never "24:00" (D+Tb-0009, AU-DT-05). */
  label: string;
  /** A scheduled time of this drug (MEDa-0235); unscheduled edge labels are shown less prominently. */
  scheduled: boolean;
  /** Top and bottom edges of the 24-hour ruler (MEDa-0237). */
  edge?: 'top' | 'bottom';
}

/**
 * Labels for a drug's time scale (MEDa-0069, 0235, 0237): both edges labelled "00:00", and each
 * scheduled time. A midnight schedule ("00:00", "24:00" or "2400") is shown by marking BOTH edge
 * labels as scheduled (the dose sits at the top of the next day's line, which is the bottom of this
 * one), so it is never dropped and never displayed as 24:00.
 */
export function adminScaleLabels(times: readonly string[]): AdminScaleLabel[] {
  const mins = Array.from(new Set(times.map(adminScheduleMinutes).filter((m): m is number => m != null)));
  const midnight = mins.some(m => m === 0 || m === 1440);
  const inner = mins.filter(m => m > 0 && m < 1440).sort((a, b) => a - b);
  const label = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return [
    { minutes: 0, label: '00:00', scheduled: midnight, edge: 'top' },
    ...inner.map(m => ({ minutes: m, label: label(m), scheduled: true })),
    { minutes: 1440, label: '00:00', scheduled: midnight, edge: 'bottom' },
  ];
}

/**
 * Height of a 24-hour line so that no two events in the same day overlap (MEDa-0275) while keeping
 * linear time and one scale for the line (MEDa-0233). `baseHeight` is the minimum (MEDa-0234).
 */
export function adminLineHeight(eventTimesByDay: Date[][], baseHeight: number, itemPx: number, maxHeight = 960): number {
  let minGap = Infinity;
  for (const day of eventTimesByDay) {
    const ts = day.map(d => d.getTime()).sort((a, b) => a - b);
    for (let i = 1; i < ts.length; i++) minGap = Math.min(minGap, ts[i] - ts[i - 1]);
  }
  if (!isFinite(minGap) || minGap <= 0) return baseHeight;
  const needed = Math.ceil((itemPx * DAY) / minGap);
  return Math.min(maxHeight, Math.max(baseHeight, needed));
}

/** Per-drug sort key used by adminSortMedications. */
export interface AdminOrderKey {
  /** 0 overdue, 1 due, 2 Significant Duration due to start, 3 Begun, 4 available As Required, 5 next or locked out, 6 current without events, 7 past. */
  tier: number;
  time: number;
  priority: number;
  kindRank: number;
}

function strictness(med: AdminMedication): number {
  if (med.priority != null) return med.priority;
  const t = med.tolerance ?? ADMIN_DEFAULT_TOLERANCE;
  return t.dueFromMinutes + t.overdueAfterMinutes;
}

/** Compute the list order key for one drug (MEDa-0023 to MEDa-0031, 0252, 0280). */
export function adminOrderKey(med: AdminMedication, now: Date): AdminOrderKey {
  const priority = strictness(med);
  const kindRank = adminIsAsRequired(med.kind) ? 1 : 0; // Regular above As Required at equal times (MEDa-0026)
  if (adminIsPastMedication(med, now)) {
    const last = Math.max(0, ...med.events.filter(e => e.status).map(e => (adminEventPlotTime(e)?.getTime() ?? 0)));
    return { tier: 7, time: -last, priority, kindRank };
  }
  const states = adminEventStates(med, now);
  const times = (state: string) =>
    med.events.filter(e => states.get(e.id) === state).map(e => adminEventPlotTime(e)?.getTime() ?? Infinity);
  // Oldest unrecorded past event fixes the position of a drug with outstanding events (MEDa-0280).
  const overdue = times('overdue');
  if (overdue.length) return { tier: 0, time: Math.min(...overdue), priority, kindRank };
  const due = times('due');
  if (due.length) return { tier: 1, time: Math.min(...due), priority, kindRank };
  const inf = adminInfusionStatus(med, now);
  if (inf === 'dueAt') return { tier: 2, time: toDate(med.infusion!.scheduledStart)!.getTime(), priority, kindRank };
  if (inf === 'begun') return { tier: 3, time: toDate(med.infusion!.actualStart!)!.getTime(), priority, kindRank };
  if (adminIsUnscheduled(med.kind)) {
    const lock = adminLockoutEnd(med, now);
    // Locked-out As Required goes below drugs scheduled before the lockout ends (MEDa-0027).
    if (lock) return { tier: 5, time: lock.getTime(), priority, kindRank };
    return { tier: 4, time: now.getTime(), priority, kindRank };
  }
  const next = times('next');
  if (next.length) return { tier: 5, time: Math.min(...next), priority, kindRank };
  if (inf === 'startAt') return { tier: 5, time: toDate(med.infusion!.scheduledStart)!.getTime(), priority, kindRank };
  return { tier: 6, time: Infinity, priority, kindRank };
}

/**
 * Sort drugs by the time of their Next administration, most Due first, past drugs last
 * (MEDa-0023 to MEDa-0031). This order is NOT a clinical priority. Call it only on open, on a
 * manual refresh, or when a medication is added or updated (MEDa-0032).
 */
export function adminSortMedications<T extends AdminMedication>(meds: readonly T[], now: Date): T[] {
  const keyed = meds.map(m => ({ m, k: adminOrderKey(m, now) }));
  keyed.sort((a, b) =>
    a.k.tier - b.k.tier ||
    (a.k.time === b.k.time ? 0 : a.k.time < b.k.time ? -1 : 1) ||
    a.k.priority - b.k.priority ||
    a.k.kindRank - b.k.kindRank ||
    a.m.name.localeCompare(b.m.name, undefined, { sensitivity: 'base' }),
  );
  return keyed.map(x => x.m);
}

/** True when a recomputed order differs from the order on screen, so "Update list order" is enabled (MEDa-0021). */
export function adminIsOrderStale(currentIds: readonly string[], recomputedIds: readonly string[]): boolean {
  if (currentIds.length !== recomputedIds.length) return true;
  return currentIds.some((id, i) => id !== recomputedIds[i]);
}

/** Status bar counts (MEDa-0015, 0016, 0257). */
export interface AdminStatusCounts {
  overdue: number;
  due: number;
  asRequiredTotal: number;
  asRequiredAvailable: number;
  begun: number;
}

/** Count Overdue and Due events, As Required drugs (total and not locked out) and Begun Significant Duration drugs. */
export function adminStatusCounts(meds: readonly AdminMedication[], now: Date): AdminStatusCounts {
  const c: AdminStatusCounts = { overdue: 0, due: 0, asRequiredTotal: 0, asRequiredAvailable: 0, begun: 0 };
  for (const m of meds) {
    if (adminIsPastMedication(m, now)) continue;
    const states = adminEventStates(m, now);
    states.forEach(s => {
      if (s === 'overdue') c.overdue++;
      else if (s === 'due') c.due++;
    });
    if (adminIsAsRequired(m.kind)) {
      c.asRequiredTotal++;
      if (!adminLockoutEnd(m, now)) c.asRequiredAvailable++;
    }
    if (adminInfusionStatus(m, now) === 'begun') c.begun++;
  }
  return c;
}

/** Grouping options: none by default (MEDa-0012), by type (MEDa-0219), or a static start date order (MEDa-0218). */
export type AdminGrouping = 'none' | 'type' | 'startDate';

export interface AdminMedicationGroup<T> {
  key: string;
  label: string;
  medications: T[];
}

const TYPE_GROUPS: { key: 'onceOnly' | 'regular' | 'asRequired' | 'significantDuration'; kinds: AdminMedicationKind[] }[] = [
  { key: 'onceOnly', kinds: ['onceOnly'] },
  { key: 'regular', kinds: ['regular'] },
  { key: 'asRequired', kinds: ['asRequiredUnscheduled', 'asRequiredIndicative', 'asRequiredScheduled'] },
  { key: 'significantDuration', kinds: ['significantDuration'] },
];

/**
 * Group an already sorted list. List order is kept within each group (MEDa-0013).
 * 'startDate' replaces the dynamic order with a static order by start date and time (MEDa-0218).
 */
export function adminGroupMedications<T extends AdminMedication>(
  sorted: readonly T[],
  grouping: AdminGrouping,
  region: ClinicalRegion = 'GB',
): AdminMedicationGroup<T>[] {
  if (grouping === 'type') {
    const w = ADMIN_CHART_WORDING[region];
    const label = (k: (typeof TYPE_GROUPS)[number]['key']) => (k === 'regular' ? 'Regular' : w[k]);
    return TYPE_GROUPS.map(g => ({ key: g.key, label: label(g.key), medications: sorted.filter(m => g.kinds.includes(m.kind)) })).filter(
      g => g.medications.length > 0,
    );
  }
  if (grouping === 'startDate') {
    const meds = [...sorted].sort(
      (a, b) => (toDate(a.startDate)?.getTime() ?? 0) - (toDate(b.startDate)?.getTime() ?? 0) || a.name.localeCompare(b.name),
    );
    return [{ key: 'startDate', label: 'Start date and time list order', medications: meds }];
  }
  return [{ key: 'all', label: '', medications: [...sorted] }];
}

/**
 * Date of the nearest event outside the visible window, in a direction, for the edge markers
 * (MEDa-0036, 0037). Returns null when there is none, or when an event is already visible.
 */
export function adminAdjacentEventDate(med: AdminMedication, windowStart: Date, windowEnd: Date, direction: 'earlier' | 'later'): Date | null {
  const times = med.events.map(e => adminEventPlotTime(e)).filter((d): d is Date => !!d);
  if (times.some(t => t >= windowStart && t < windowEnd)) return null;
  const cand = direction === 'earlier' ? times.filter(t => t < windowStart) : times.filter(t => t >= windowEnd);
  if (!cand.length) return null;
  const pick = cand.reduce((a, b) => (direction === 'earlier' ? (b > a ? b : a) : b < a ? b : a));
  return adminStartOfDay(pick);
}
