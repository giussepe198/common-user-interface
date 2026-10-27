/**
 * One-day drug administration agenda for a phone (concept P3). Builds time slots, the "now" line position and the
 * when-required section from the administration area's data model and status rules (G6 MEDa, G10 9.6, G11 8.2).
 * Pure functions, no React.
 */
import { formatShortDate, formatTime, toDate, type DateLike } from '../../core/format';
import type { ClinicalRegion } from '../../core/locale';
import { formatClinicalDuration } from '../../datetime';
import {
  ADMIN_STATUS_LABELS,
  adminEventGlyph,
  adminEventPlotTime,
  adminEventStates,
  adminFindReasonCode,
  adminIsGivenStatus,
  adminIsSameDay,
  adminIsUnscheduled,
  adminLockoutEnd,
  adminStartOfDay,
} from '../../administration';
import type { AdminEvent, AdminEventState, AdminMedication } from '../../administration';

/**
 * Shape of the event mark. Shapes and words carry the meaning together, never colour alone (MEDa-0117, MEDa-0120):
 * given = filled square with a tick or code; notGiven = unfilled square with a solid border and the code; overdue =
 * filled circle with "!"; due = outlined square with a clock; scheduled = dashed square; available = outlined circle with "+".
 */
export type MobileAgendaShape = 'given' | 'notGiven' | 'overdue' | 'due' | 'scheduled' | 'available' | 'unavailable';

/** One event in a slot. */
export interface MobileAgendaEvent {
  key: string;
  medication: AdminMedication;
  event: AdminEvent;
  state: AdminEventState;
  /** Plotted time (scheduled, or recorded for unscheduled doses). */
  time: Date;
  shape: MobileAgendaShape;
  /** Glyph for recorded events: "check" or the code letters (AU "R", NZ "RV"). Empty otherwise. */
  glyph: string;
  /** Status in words: "Given 08:05", "R: Refused", "Overdue by 1hr 6min", "Due now", "Next dose", "Scheduled". */
  statusText: string;
  /** Extra words, e.g. the written reason "prescriber told 06:20". */
  note?: string;
  /** The event can still be recorded (not recorded yet). */
  actionable: boolean;
}

/** Events that share a scheduled time. */
export interface MobileAgendaSlot {
  key: string;
  time: Date;
  /** "13:00". */
  label: string;
  /** 'overdue' if any event is overdue, 'due' if any is due, 'done' if every event is recorded, else 'future'. */
  tone: 'overdue' | 'due' | 'done' | 'future';
  events: MobileAgendaEvent[];
}

/** A when-required medicine and whether it can be given now (MEDa-0136: advisory, never blocks recording). */
export interface MobileAgendaAsRequired {
  medication: AdminMedication;
  lastGiven: Date | null;
  /** End of the time restriction, or null when available now. */
  availableFrom: Date | null;
  available: boolean;
  /** "Available now" or "Available from 12:30". */
  statusText: string;
  /** "last 06:30", "last 26-Oct-2026 22:10", or "" when never given. */
  lastText: string;
  /** Doses given on the day shown. */
  givenOnDay: number;
}

export interface MobileAgendaDay {
  date: Date;
  isToday: boolean;
  slots: MobileAgendaSlot[];
  /** Index of the slot the "now" line goes before (slots.length = after the last), or -1 when the day is not today. */
  nowIndex: number;
  asRequired: MobileAgendaAsRequired[];
}

const MIN = 60_000;

function overdueBy(time: Date, now: Date): string {
  const mins = Math.max(0, Math.floor((now.getTime() - time.getTime()) / MIN));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  return formatClinicalDuration({ days, hours, minutes: mins % 60 }, { zeroText: '0min' });
}

/** Status words for an event (MEDa-0250; AU-MD-08 code and meaning together; G11 8.2). */
export function mobileAgendaStatusText(event: AdminEvent, state: AdminEventState, time: Date, now: Date, region: ClinicalRegion = 'GB'): string {
  if (state === 'recorded' && event.status) {
    if (adminIsGivenStatus(event.status)) {
      const code = region === 'GB' ? undefined : adminFindReasonCode(event.reasonCode, region);
      const label = code ? `${code.code}: ${code.label}` : ADMIN_STATUS_LABELS[event.status];
      const at = toDate(event.administeredAt ?? null);
      return at ? `${label} ${formatTime(at)}` : label;
    }
    const code = region === 'GB' ? undefined : adminFindReasonCode(event.reasonCode, region);
    return code ? `${code.code}: ${code.label}` : ADMIN_STATUS_LABELS[event.status];
  }
  switch (state) {
    case 'overdue': return `Overdue by ${overdueBy(time, now)}`;
    case 'due': return 'Due now';
    case 'next': return 'Next dose';
    case 'unscheduled': return 'Available';
    default: return 'Scheduled';
  }
}

function shapeFor(event: AdminEvent, state: AdminEventState): MobileAgendaShape {
  if (state === 'recorded') return adminIsGivenStatus(event.status) ? 'given' : 'notGiven';
  if (state === 'overdue') return 'overdue';
  if (state === 'due') return 'due';
  return 'scheduled';
}

/**
 * Build one day of the agenda. Unscheduled when-required medicines go in their own section (MEDa-0273 doses are listed
 * there with "last" time); everything else is grouped by plotted time. The now line goes before the first slot that is
 * later than now or that holds a due event, so overdue doses stay above it and due doses sit just below it (concept P3).
 */
export function mobileAgendaSlots(
  medications: ReadonlyArray<AdminMedication>,
  day: DateLike,
  now: Date,
  region: ClinicalRegion = 'GB',
): MobileAgendaDay {
  const date = adminStartOfDay(day);
  const isToday = adminIsSameDay(date, now);
  const bySlot = new Map<number, MobileAgendaEvent[]>();
  const asRequired: MobileAgendaAsRequired[] = [];

  for (const med of medications) {
    const states = adminEventStates(med, now);
    if (adminIsUnscheduled(med.kind)) {
      if (med.pastState) continue;
      const given = med.events
        .filter(e => adminIsGivenStatus(e.status))
        .map(e => toDate(e.administeredAt ?? null))
        .filter((d): d is Date => !!d && d.getTime() <= now.getTime())
        .sort((a, b) => a.getTime() - b.getTime());
      const lastGiven = given.length ? given[given.length - 1] : null;
      const availableFrom = adminLockoutEnd(med, now);
      const fromText = availableFrom
        ? adminIsSameDay(availableFrom, now) ? formatTime(availableFrom) : `${formatShortDate(availableFrom)} ${formatTime(availableFrom)}`
        : '';
      asRequired.push({
        medication: med,
        lastGiven,
        availableFrom,
        available: !availableFrom,
        statusText: availableFrom ? `Available from ${fromText}` : 'Available now',
        lastText: lastGiven ? `last ${adminIsSameDay(lastGiven, now) ? '' : formatShortDate(lastGiven) + ' '}${formatTime(lastGiven)}` : '',
        givenOnDay: given.filter(d => adminIsSameDay(d, date)).length,
      });
      continue;
    }
    for (const ev of med.events) {
      const t = adminEventPlotTime(ev);
      if (!t || !adminIsSameDay(t, date)) continue;
      const state = states.get(ev.id) ?? 'future';
      const recordedNotGiven = state === 'recorded' && ev.status && !adminIsGivenStatus(ev.status);
      const item: MobileAgendaEvent = {
        key: `${med.id}:${ev.id}`,
        medication: med,
        event: ev,
        state,
        time: t,
        shape: shapeFor(ev, state),
        glyph: state === 'recorded' && ev.status ? adminEventGlyph(ev.status, ev.reasonCode, region) : '',
        statusText: mobileAgendaStatusText(ev, state, t, now, region),
        note: recordedNotGiven || ev.reasonText ? ev.reasonText || undefined : undefined,
        actionable: state !== 'recorded',
      };
      const k = Math.floor(t.getTime() / MIN);
      const arr = bySlot.get(k) ?? [];
      arr.push(item);
      bySlot.set(k, arr);
    }
  }

  const slots: MobileAgendaSlot[] = Array.from(bySlot.entries())
    .sort(([a], [b]) => a - b)
    .map(([k, events]) => {
      const time = new Date(k * MIN);
      events.sort((a, b) => (a.medication.priority ?? 0) - (b.medication.priority ?? 0) || a.medication.name.localeCompare(b.medication.name));
      const tone: MobileAgendaSlot['tone'] = events.some(e => e.state === 'overdue')
        ? 'overdue'
        : events.some(e => e.state === 'due')
          ? 'due'
          : events.every(e => e.state === 'recorded')
            ? 'done'
            : 'future';
      return { key: String(k), time, label: formatTime(time), tone, events };
    });

  let nowIndex = -1;
  if (isToday) {
    nowIndex = slots.findIndex(s => s.time.getTime() > now.getTime() || s.events.some(e => e.state === 'due'));
    if (nowIndex < 0) nowIndex = slots.length;
  }
  return { date, isToday, slots, nowIndex, asRequired };
}
