/** Medications List logic: status, sorting, grouping, notifications, look-ahead (Medications List v1.0.0.0). */
import type { ReactNode } from 'react';
import type { DateLike } from '../../core/format';
import { toDate } from '../../core/format';
import type { MedicationLineData} from './medicationLine';
import { medicationDrugName } from './medicationLine';

/** Status values (MEDv-166 to MEDv-171). Current = Started, Not Started, Suspended; Past = Completed, Discontinued (MEDv-172/173). */
export type MedicationStatus = 'Started' | 'Not Started' | 'Suspended' | 'Completed' | 'Discontinued';

export const CURRENT_MEDICATION_STATUSES: MedicationStatus[] = ['Started', 'Not Started', 'Suspended'];
export const PAST_MEDICATION_STATUSES: MedicationStatus[] = ['Completed', 'Discontinued'];

export function isCurrentMedicationStatus(s: MedicationStatus): boolean {
  return CURRENT_MEDICATION_STATUSES.includes(s);
}

/** One row of the Medications List. */
export interface MedicationRecord {
  id: string;
  /** Drug Details, rendered as a medication line (MEDv-148). */
  line: MedicationLineData;
  /** Never blank (MEDv-162). */
  status: MedicationStatus;
  /** Second-line supplement such as "Verified" or "Not Verified"; never replaces the status (MEDv-164). */
  statusSupplement?: string;
  /** Date suspended, shown as "Suspended on 28-May-2010". */
  suspendedOn?: DateLike;
  /** Initiation date, e.g. first planned administration (MEDv-149). */
  startDate?: DateLike;
  /** Stop date, e.g. last administration or discontinued date (MEDv-150). Used for the recent past notification. */
  endDate?: DateLike;
  /**
   * The medication has decision support alerts: an alert icon after the Drug Details of the row (MEDv-023) and in the
   * look-ahead strips (MEDv-053/055).
   */
  hasAlert?: boolean;
  /** Accessible text (and tooltip) of the row's alert icon. Default "Decision support alert". */
  alertLabel?: string;
  /** Icons appended after the row's Drug Details, inside the same cell (MEDv-023). Each icon needs a text label. */
  icons?: ReactNode;
  /** Values per grouping option id, e.g. { form: ['Tablet'] }. Several values form a combined group (MEDv-197). */
  groupValues?: Record<string, string[] | string | undefined>;
}

export interface DeriveMedicationStatusInput {
  scheduledAdministrations: DateLike[];
  recordedAdministrations: Array<{ at: DateLike; given: boolean }>;
  suspended?: boolean;
  /** Date the prescription was stopped (discontinued). */
  stoppedAt?: DateLike;
  /** Planned end of the course. */
  endDate?: DateLike;
  now: DateLike;
}

const t = (d: DateLike | undefined | null): number | null => {
  const x = toDate(d ?? null);
  return x ? x.getTime() : null;
};

/**
 * Derive a status (MEDv-165 to MEDv-171). Suspended wins; Discontinued when stopped before one or
 * more scheduled administrations; Completed when the end date has passed and at least one
 * administration was given; otherwise Started if any administration event is recorded, else Not Started.
 */
export function deriveMedicationStatus(m: DeriveMedicationStatusInput): MedicationStatus {
  const now = t(m.now) ?? Date.now();
  if (m.suspended) return 'Suspended';
  const stopped = t(m.stoppedAt);
  if (stopped != null && m.scheduledAdministrations.some(s => (t(s) ?? -Infinity) > stopped)) return 'Discontinued';
  const anyGiven = m.recordedAdministrations.some(r => r.given);
  const end = t(m.endDate);
  if (end != null && end < now && anyGiven) return 'Completed';
  if (stopped != null && stopped <= now && anyGiven) return 'Completed';
  return m.recordedAdministrations.length > 0 ? 'Started' : 'Not Started';
}

export type MedicationSortKey = 'drugDetails' | 'status' | 'startDate' | 'endDate';
export interface MedicationSort {
  key: MedicationSortKey;
  direction: 'asc' | 'desc';
}

/** Default sorts: current by start date, most recent first (MEDv-099); past by end date, most recent first (MEDv-100). */
export const DEFAULT_CURRENT_SORT: MedicationSort = { key: 'startDate', direction: 'desc' };
export const DEFAULT_PAST_SORT: MedicationSort = { key: 'endDate', direction: 'desc' };

function sortValue(r: MedicationRecord, key: MedicationSortKey): string | number | null {
  switch (key) {
    case 'drugDetails': return medicationDrugName(r.line).toLocaleLowerCase('en-GB');
    case 'status': return r.status;
    case 'startDate': return t(r.startDate);
    case 'endDate': return t(r.endDate);
  }
}

function compareBy(a: MedicationRecord, b: MedicationRecord, s: MedicationSort): number {
  const va = sortValue(a, s.key);
  const vb = sortValue(b, s.key);
  if (va == null && vb == null) return 0;
  if (va == null) return 1; // missing values always last
  if (vb == null) return -1;
  const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'en-GB');
  return s.direction === 'asc' ? c : -c;
}

/**
 * Stable sort by the chosen column; ties fall back to the default sort (MEDv-105) and then to the
 * original order.
 */
export function sortMedications<T extends MedicationRecord>(rows: T[], sort: MedicationSort, defaultSort: MedicationSort): T[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => compareBy(a.r, b.r, sort) || compareBy(a.r, b.r, defaultSort) || a.i - b.i)
    .map(x => x.r);
}

/** A grouping choice for the "Group by" control (MEDv-084/085/190). */
export interface MedicationGroupingOption {
  id: string;
  label: string;
  /** Null group label without brackets, e.g. "No Route Specified" (MEDv-091/194). */
  nullLabel?: string;
  /** Values of this attribute for a row. Default: row.groupValues[id]. */
  getValues?: (r: MedicationRecord) => string[] | string | undefined;
  /** Sort order of values (MEDv-199). Default alphabetical, case-insensitive. */
  compare?: (a: string, b: string) => number;
}

export interface MedicationGroup<T extends MedicationRecord = MedicationRecord> {
  key: string;
  /** Heading text: "Oral", "Analgesic; Non-steroidal Anti-inflammatory", "(No Route Specified)". */
  label: string;
  isNull: boolean;
  rows: T[];
}

const alpha = (a: string, b: string) => a.localeCompare(b, 'en-GB', { sensitivity: 'base' });

/**
 * Group rows (MEDv-087, MEDv-091, MEDv-195, MEDv-197 to MEDv-200). Each row goes in exactly one
 * group; several values make a combined group whose names are sorted and joined with "; ".
 * Null group first, then groups in attribute sort order. Row order within groups is kept.
 */
export function groupMedications<T extends MedicationRecord>(rows: T[], option: MedicationGroupingOption): MedicationGroup<T>[] {
  const cmp = option.compare ?? alpha;
  const nullLabel = `(${option.nullLabel ?? `No ${option.label} Specified`})`;
  const groups = new Map<string, { values: string[]; rows: T[] }>();
  for (const r of rows) {
    const raw = option.getValues ? option.getValues(r) : r.groupValues?.[option.id];
    const list = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(v => v.trim()).filter(Boolean);
    const values = Array.from(new Set(list)).sort(cmp);
    const key = values.length ? values.join('; ') : '\u0000null';
    if (!groups.has(key)) groups.set(key, { values, rows: [] });
    groups.get(key)!.rows.push(r);
  }
  const compareValues = (a: string[], b: string[]) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const c = cmp(a[i], b[i]);
      if (c) return c;
    }
    return a.length - b.length;
  };
  return Array.from(groups.entries())
    .sort(([, a], [, b]) => {
      if (!a.values.length) return -1;
      if (!b.values.length) return 1;
      return compareValues(a.values, b.values);
    })
    .map(([key, g]) => ({ key, label: g.values.length ? g.values.join('; ') : nullLabel, isNull: !g.values.length, rows: g.rows }));
}

/**
 * Past filter notification (MEDv-071/072/176): "The total list (54) is filtered to show: Past 2 months (3)".
 * Each count sits next to the label it belongs to; never "3 of 54".
 */
export function medicationFilterNotification(total: number, shown: number, filterLabel: string): string {
  return `The total list (${total}) is filtered to show: ${filterLabel} (${shown})`;
}

/** "48 hours", "1 hour", "7 days" (whole days from 72 hours) [suggested]. */
export function formatMedicationInterval(hours: number): string {
  if (hours >= 72 && hours % 24 === 0) {
    const d = hours / 24;
    return `${d} day${d === 1 ? '' : 's'}`;
  }
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

/**
 * Recent past notification (MEDv-074/075/077): "2 past medications were completed or discontinued
 * in the last 48 hours". Returns null when there are none [suggested].
 */
export function medicationRecentPastNotification(rows: MedicationRecord[], now: DateLike, windowHours = 48): string | null {
  const n0 = t(now) ?? Date.now();
  const from = n0 - windowHours * 3600_000;
  const n = rows.filter(r => !isCurrentMedicationStatus(r.status) && (() => {
    const e = t(r.endDate);
    return e != null && e >= from && e <= n0;
  })()).length;
  if (!n) return null;
  return `${n} past medication${n === 1 ? ' was' : 's were'} completed or discontinued in the last ${formatMedicationInterval(windowHours)}`;
}

/** An item that may appear in a look-ahead notification. */
export interface MedicationLookAheadEntry {
  id: string;
  label: string;
  hasAlert?: boolean;
}

export type MedicationLookAheadToken =
  | { kind: 'count'; count: number; hasAlert: boolean }
  | { kind: 'name'; id: string; label: string; hasAlert: boolean };

/**
 * Tokens for one look-ahead notification, left to right (MEDv-048 to MEDv-055).
 * `nearestFirst` lists the out-of-view items starting with the one nearest the viewport.
 * Names are added nearest first while they fit; the rest are counted as "N more" at the far left.
 * A name that does not fit is counted, never truncated (MEDv-050/051). Past lists: count only (MEDv-054).
 * `measure` returns the pixel width of a token (bold for names); `delimiterWidth` covers " ● ".
 */
export function medicationLookAheadTokens(
  nearestFirst: MedicationLookAheadEntry[],
  opts: { mode: 'names' | 'countOnly'; availableWidth?: number; measure?: (text: string, bold: boolean) => number; delimiterWidth?: number; alertWidth?: number },
): MedicationLookAheadToken[] {
  const total = nearestFirst.length;
  if (!total) return [];
  if (opts.mode === 'countOnly') {
    return [{ kind: 'count', count: total, hasAlert: nearestFirst.some(i => i.hasAlert) }];
  }
  const measure = opts.measure ?? ((s: string) => s.length * 7);
  const avail = opts.availableWidth ?? Infinity;
  const delim = opts.delimiterWidth ?? 14;
  const alertW = opts.alertWidth ?? 18;
  const placed: MedicationLookAheadEntry[] = [];
  let used = 0;
  for (let i = 0; i < total; i++) {
    const item = nearestFirst[i];
    const w = measure(item.label, true) + (item.hasAlert ? alertW : 0) + (placed.length ? delim : 0);
    const remainingAfter = total - i - 1;
    const rest = nearestFirst.slice(i + 1);
    const countReserve = remainingAfter > 0
      ? delim + measure(`${remainingAfter} more`, false) + (rest.some(x => x.hasAlert) ? alertW : 0)
      : 0;
    if (used + w + countReserve > avail) break;
    placed.push(item);
    used += w;
  }
  const counted = nearestFirst.slice(placed.length);
  const tokens: MedicationLookAheadToken[] = [];
  if (counted.length) tokens.push({ kind: 'count', count: counted.length, hasAlert: counted.some(i => !!i.hasAlert) });
  for (let i = placed.length - 1; i >= 0; i--) {
    tokens.push({ kind: 'name', id: placed[i].id, label: placed[i].label, hasAlert: !!placed[i].hasAlert });
  }
  return tokens;
}
