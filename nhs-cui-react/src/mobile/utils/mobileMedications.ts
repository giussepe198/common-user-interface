/**
 * Medicines list on a phone (concept A3): schedule status words and the "due first" sort. Pure functions, no React.
 * Builds on the medications area's record model and sorts (G5 MEDv).
 */
import { formatShortDate, toDate, type DateLike } from '../../core/format';
import {
  DEFAULT_CURRENT_SORT,
  DEFAULT_PAST_SORT,
  isCurrentMedicationStatus,
  medicationDrugName,
  sortMedications,
  type MedicationRecord,
} from '../../medications';
import type { ClinicalRegion } from '../../core/locale';
import { mobileRelativeTime } from './mobileTime';

/** Where a medicine is in its schedule today. */
export type MobileMedicationScheduleState = 'overdue' | 'due' | 'given' | 'next' | 'available' | 'notAvailable' | 'none';

/** Schedule facts for the status line. */
export interface MobileMedicationSchedule {
  state: MobileMedicationScheduleState;
  /** Due or scheduled time (overdue, due, next). */
  at?: DateLike;
  /** Last given (given, available, notAvailable). */
  lastGivenAt?: DateLike;
  /** Next scheduled dose (given). */
  nextAt?: DateLike;
  /** End of a when-required time restriction (notAvailable). Advisory only (MEDa-0136). */
  availableFrom?: DateLike;
}

/** A medicine row: a medications-area record plus today's schedule and alerts. */
export interface MobileMedicationItem extends MedicationRecord {
  schedule?: MobileMedicationSchedule;
  /** Alerts in words, e.g. "Allergy alert" (decision support summary; colour is never the only cue). */
  alerts?: string[];
}

/** One piece of the status line, with its tone. */
export interface MobileStatusPart {
  text: string;
  tone: 'danger' | 'accent' | 'success' | 'warning' | 'muted';
  /** Mark shape shown before the words. */
  mark?: 'overdue' | 'due' | 'suspended' | 'available' | 'stop';
}

/**
 * Status line words (concept A3): "Overdue 13:00", "Due 14:00", "Given 08:05" + "Next 08:00 tomorrow",
 * "Suspended on 26-Oct-2026" (MEDv), "Last given 06:30" + "Available now", past "Discontinued 20-Oct-2026".
 */
export function mobileMedicationStatusParts(item: MobileMedicationItem, now: Date): MobileStatusPart[] {
  const parts: MobileStatusPart[] = [];
  if (item.status === 'Suspended') {
    parts.push({ text: item.suspendedOn ? `Suspended on ${formatShortDate(item.suspendedOn)}` : 'Suspended', tone: 'warning', mark: 'suspended' });
  } else if (!isCurrentMedicationStatus(item.status)) {
    parts.push({ text: item.endDate ? `${item.status} ${formatShortDate(item.endDate)}` : item.status, tone: 'muted' });
  } else {
    const s = item.schedule;
    const rel = (d?: DateLike) => mobileRelativeTime(d ?? null, now);
    switch (s?.state) {
      case 'overdue':
        parts.push({ text: `Overdue ${rel(s.at)}`.trim(), tone: 'danger', mark: 'overdue' });
        break;
      case 'due':
        parts.push({ text: `Due ${rel(s.at)}`.trim(), tone: 'accent', mark: 'due' });
        break;
      case 'given':
        parts.push({ text: `Given ${rel(s.lastGivenAt)}`.trim(), tone: 'muted' });
        if (s.nextAt) parts.push({ text: `Next ${rel(s.nextAt)}`, tone: 'muted' });
        break;
      case 'next':
        parts.push({ text: `Next ${rel(s.at)}`.trim(), tone: 'muted' });
        break;
      case 'available':
        if (s.lastGivenAt) parts.push({ text: `Last given ${rel(s.lastGivenAt)}`, tone: 'muted' });
        parts.push({ text: 'Available now', tone: 'success', mark: 'available' });
        break;
      case 'notAvailable':
        if (s.lastGivenAt) parts.push({ text: `Last given ${rel(s.lastGivenAt)}`, tone: 'muted' });
        parts.push({ text: s.availableFrom ? `Available from ${rel(s.availableFrom)}` : 'Not available yet', tone: 'muted' });
        break;
      default:
        if (item.status === 'Not Started' && item.startDate) parts.push({ text: `Starts ${formatShortDate(item.startDate)}`, tone: 'muted' });
    }
    if ((s?.state === 'overdue' || s?.state === 'none' || !s) && item.startDate && item.status === 'Started') {
      parts.push({ text: `Started ${formatShortDate(item.startDate)}`, tone: 'muted' });
    }
  }
  for (const a of item.alerts ?? []) parts.push({ text: a, tone: 'danger', mark: 'stop' });
  return parts;
}

/** Sort choices offered on a phone. */
export type MobileMedicationSort = 'due' | 'name' | 'start' | 'end';

/** Labels for the sort button and sheet ("Sort: due first"). */
export const MOBILE_MEDICATION_SORT_LABELS: Record<MobileMedicationSort, string> = {
  due: 'due first',
  name: 'name A to Z',
  start: 'newest started',
  end: 'most recently stopped',
};

const DUE_RANK: Record<MobileMedicationScheduleState, number> = { overdue: 0, due: 1, available: 2, next: 3, given: 4, notAvailable: 5, none: 6 };

/**
 * Sort a phone medicines list. 'due': overdue, due, available, next, given, then the rest, earliest time first; ties
 * and the other choices use the medications area's sort (MEDv-099, MEDv-100, MEDv-105). Suspended medicines go after
 * active ones in 'due' order [suggested].
 */
export function mobileSortMedications<T extends MobileMedicationItem>(rows: ReadonlyArray<T>, sort: MobileMedicationSort, region: ClinicalRegion = 'GB'): T[] {
  const list = [...rows];
  if (sort === 'name') return sortMedications(list, { key: 'drugDetails', direction: 'asc' }, DEFAULT_CURRENT_SORT);
  if (sort === 'start') return sortMedications(list, DEFAULT_CURRENT_SORT, DEFAULT_CURRENT_SORT);
  if (sort === 'end') return sortMedications(list, DEFAULT_PAST_SORT, DEFAULT_PAST_SORT);
  const time = (r: T) => toDate((r.schedule?.at ?? r.schedule?.availableFrom ?? r.schedule?.nextAt ?? null) as DateLike | null)?.getTime() ?? Infinity;
  const rank = (r: T) => (r.status === 'Suspended' ? 7 : DUE_RANK[r.schedule?.state ?? 'none']);
  return list
    .map((r, i) => ({ r, i }))
    .sort(
      (a, b) =>
        rank(a.r) - rank(b.r) ||
        time(a.r) - time(b.r) ||
        medicationDrugName(a.r.line, { region }).localeCompare(medicationDrugName(b.r.line, { region }), 'en-GB', { sensitivity: 'base' }) ||
        a.i - b.i,
    )
    .map(x => x.r);
}
