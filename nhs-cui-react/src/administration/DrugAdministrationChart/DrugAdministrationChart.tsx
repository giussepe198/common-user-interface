import React from 'react';
import { Button, cx, Icon, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatShortDate, formatTime, toDate } from '../../core/format';
import type { DateLike } from '../../core/format';
import type { AdministrationEventMarker } from '../AdministrationEventIcon/AdministrationEventIcon';
import { AdministrationEventIcon } from '../AdministrationEventIcon/AdministrationEventIcon';
import type { AdministrationRecordingPayload } from '../AdministrationRecordingForm/AdministrationRecordingForm';
import { AdministrationRecordingForm } from '../AdministrationRecordingForm/AdministrationRecordingForm';
import { NilByMouthBanner } from '../NilByMouthBanner/NilByMouthBanner';
import { ADMIN_CHART_WORDING, adminReasonCodes, adminReasonLegend, adminRegionalStatusLabel } from '../utils/adminRegion';
import type {
  AdminEvent,
  AdminEventState,
  AdminMedication} from '../utils/adminEvents';
import {
  adminEstimatedStop,
  adminEventPlotTime,
  adminEventStates,
  adminFormatTimeLabel,
  adminInfusionStatus,
  adminInfusionStatusLabel,
  adminIsGivenStatus,
  adminIsUnscheduled,
  adminLockoutEnd,
  adminOutstandingEvents,
} from '../utils/adminEvents';
import type {
  AdminGrouping} from '../utils/adminChart';
import {
  adminAddDays,
  adminAdjacentEventDate,
  adminGroupMedications,
  adminIsMedicationVisible,
  adminIsOrderStale,
  adminIsPastMedication,
  adminIsSameDay,
  adminLineHeight,
  adminOrderKey,
  adminScaleLabels,
  adminScheduleMinutes,
  adminSortMedications,
  adminStartOfDay,
  adminStatusCounts,
  adminTimeToY,
  adminVisibleWindow,
} from '../utils/adminChart';
import { DayCalendar } from './DayCalendar';
import type { AdminInfoTab} from './MedicationLeftPanel';
import { MedicationInfoPanel, MedicationLeftPanel } from './MedicationLeftPanel';

/** A prescription change made by someone else while the chart is open (MEDa-0294 to MEDa-0297). */
export interface DrugAdministrationUpdate {
  change: 'new' | 'edited' | 'discontinued';
  medicationName: string;
  details?: string;
}

export interface DrugAdministrationChartProps {
  /** Medication lines, each matching one line in the Medications List View (MEDa-0001). */
  medications: AdminMedication[];
  /** Current time. Defaults to a live clock updated every minute [suggested]. */
  now?: Date;
  /** Selected (third, widest) day. Defaults to today (MEDa-0065). */
  selectedDate?: DateLike;
  defaultSelectedDate?: DateLike;
  onSelectedDateChange?: (date: Date) => void;
  /** Grouping. No grouping by default (MEDa-0012). */
  grouping?: AdminGrouping;
  defaultGrouping?: AdminGrouping;
  onGroupingChange?: (grouping: AdminGrouping) => void;
  /** Nil by Mouth notification below the column headings (MEDa-0163). Never blocks recording (MEDa-0164). */
  nilByMouth?: boolean | { since?: DateLike; until?: DateLike; reason?: React.ReactNode };
  /** Jurisdiction; defaults to the ClinicalLocaleProvider. Changes reason codes, icon letters and wording (G10 9.6, G11 8.2). */
  region?: ClinicalRegion;
  /** AU: paediatric chart; adds the circled P code (parent/carer administered). */
  paediatric?: boolean;
  /** AU and NZ: show the code legend under the chart [suggested]. Default true for AU and NZ. */
  showCodeLegend?: boolean;
  /** Logged-in user, pre-filled in the recording form. */
  currentUser?: string;
  /** Limited list of administration sites for the recording form (MEDa-0212). */
  sites?: string[];
  /**
   * Record an administration. `event` is null for a new unscheduled As Required administration (MEDa-0271).
   * When omitted, events are read-only and show details only.
   */
  onRecord?: (medication: AdminMedication, event: AdminEvent | null, payload: AdministrationRecordingPayload) => void;
  /** Clear a recorded event back to its previous state; the edit history must be kept (MEDa-0260). */
  onClearEvent?: (medication: AdminMedication, event: AdminEvent) => void;
  /** Open the detailed view of a Significant Duration drug, where it is recorded (MEDa-0149, 0160). */
  onOpenSignificantDurationDetail?: (medication: AdminMedication) => void;
  /** Replace the default drug details in the left-hand panel. By default the medications area's MedicationLine renders `line`, or `name` and `details` (MEDa-0265). */
  renderMedicationLine?: (medication: AdminMedication) => React.ReactNode;
  /** Prescription changes made while open. The chart freezes and shows them until acknowledged (MEDa-0294, 0296). */
  pendingUpdates?: DrugAdministrationUpdate[];
  /** Acknowledge pending updates; the list order is then refreshed. */
  onAcknowledgeUpdates?: () => void;
  /** Maximum height of the scrolling list in px. Default 560. */
  maxListHeight?: number;
  /** Minimum height of the 24-hour area of a line in px (MEDa-0234). Default 192. */
  minLineHeight?: number;
  /** Accessible name of the chart. Default "Drug administration chart". */
  'aria-label'?: string;
  className?: string;
}

const PAD = 12;
const ITEM = 24;
const LABEL = 18;

function useLiveNow(now?: Date): Date {
  const [tick, setTick] = React.useState(() => new Date());
  React.useEffect(() => {
    if (now) return;
    const t = setInterval(() => setTick(new Date()), 60000);
    return () => clearInterval(t);
  }, [now]);
  return now ?? tick;
}

interface Placed {
  key: string;
  event: AdminEvent | null; // null = synthetic unscheduled "now" event
  state: AdminEventState;
  time: Date;
}

function scheduledClockTimes(m: AdminMedication): string[] {
  if (adminIsUnscheduled(m.kind)) return []; // MEDa-0236
  if (m.scheduledTimes?.length) return m.scheduledTimes;
  const set = new Set<string>();
  m.events.forEach(e => e.scheduledTime && set.add(formatTime(e.scheduledTime)));
  return Array.from(set).sort();
}

function markersFor(m: AdminMedication, e: AdminEvent, isFirst: boolean, locked: boolean): AdministrationEventMarker[] {
  const out: AdministrationEventMarker[] = [];
  if (isFirst && !e.status) out.push('firstDose');
  if (e.multipleEntries) out.push('multipleEntries');
  if (e.review) out.push('review');
  if (locked) out.push('lockout');
  if (e.precondition) out.push('precondition');
  if (e.timeCritical) out.push('timeCritical');
  if (e.requiredRole) out.push('roleRequired');
  if (e.requiresWitness) out.push('witnessRequired');
  if (e.status === 'selfAdministered' && !e.reasonCode) out.push('selfAdministered'); // AU and NZ codes already show S or SM
  if (e.testResultAvailable) out.push('testResult');
  void m;
  return out;
}

/**
 * Single-patient drug administration chart (Drug Administration View). Four day columns with the
 * selected day third and widest, one bordered line per drug, list ordered by dueness and kept
 * stable until "Update list order" (MEDa-0032). Keyboard: arrow keys move between cells and
 * events, Enter or Space activates, Esc closes popovers.
 */
export function DrugAdministrationChart(props: DrugAdministrationChartProps) {
  const {
    medications,
    nilByMouth,
    currentUser,
    sites,
    onRecord,
    onClearEvent,
    onOpenSignificantDurationDetail,
    renderMedicationLine,
    pendingUpdates,
    onAcknowledgeUpdates,
    maxListHeight = 560,
    minLineHeight = 192,
    className,
    paediatric,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const wording = ADMIN_CHART_WORDING[region];
  const showLegend = props.showCodeLegend ?? region !== 'GB';
  const now = useLiveNow(props.now);
  const id = useId('cui-dac');
  const today = adminStartOfDay(now);
  const [selectedRaw, setSelected] = useControllableState<DateLike>(props.selectedDate, props.defaultSelectedDate ?? today, d =>
    props.onSelectedDateChange?.(toDate(d) ?? today),
  );
  const selected = adminStartOfDay(selectedRaw);
  const [grouping, setGrouping] = useControllableState<AdminGrouping>(props.grouping, props.defaultGrouping ?? 'none', props.onGroupingChange);
  const days = adminVisibleWindow(selected);
  const windowStart = days[0];
  const windowEnd = adminAddDays(selected, 2);

  // List order snapshot (MEDa-0032): computed on open, on manual refresh, or when a drug is added.
  const computeOrder = React.useCallback(() => adminSortMedications(medications, now).map(m => m.id), [medications, now]);
  const [order, setOrder] = React.useState<string[]>(computeOrder);
  const medIds = medications.map(m => m.id).join('|');
  React.useEffect(() => {
    if (medications.some(m => !order.includes(m.id))) setOrder(computeOrder());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medIds]);
  const recomputed = computeOrder();
  const currentOrder = order.filter(i => medications.some(m => m.id === i));
  const stale = adminIsOrderStale(currentOrder, recomputed);
  const byId = new Map(medications.map(m => [m.id, m] as const));
  const ordered = [...currentOrder, ...medications.map(m => m.id).filter(i => !currentOrder.includes(i))].map(i => byId.get(i)!);
  const visible = ordered.filter(m => adminIsMedicationVisible(m, windowStart, windowEnd, now)); // MEDa-0007
  const groups = adminGroupMedications(visible, grouping, region);
  const counts = adminStatusCounts(medications, now);

  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [recording, setRecording] = React.useState<{ medId: string; eventId: string | null; focusKey: string } | null>(null);
  const [details, setDetails] = React.useState<string | null>(null); // focusKey of recorded event popover
  const [info, setInfo] = React.useState<{ medId: string; tab: AdminInfoTab } | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const activeNav = React.useRef<string>('');
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozen = !!pendingUpdates?.length;

  const goTo = (d: Date) => {
    setSelected(adminStartOfDay(d));
  };

  const focusKey = (key: string) => {
    requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(key)}"]`)?.focus());
  };

  // ---------- Look-ahead scroll bar (MEDa-0039 to MEDa-0041) ----------
  const LOOK_AHEAD_MIN_VISIBLE = 40;
  const [lookAhead, setLookAhead] = React.useState<{ above: string[]; below: string[] }>({ above: [], below: [] });
  const updateLookAhead = () => {
    const body = bodyRef.current;
    if (!body) return;
    const top = body.scrollTop;
    const bottom = top + body.clientHeight;
    const above: string[] = [];
    const below: string[] = [];
    body.querySelectorAll<HTMLElement>('[data-med-row]').forEach(row => {
      if (row.dataset.past === 'true') return; // never name past drugs (MEDa-0041)
      const y = row.offsetTop;
      const h = row.offsetHeight;
      // Cut-line rule [suggested]: a line counts as out of view when less than its first LOOK_AHEAD_MIN_VISIBLE px
      // (drug name and first detail line) is visible, so a line cut off at the edge is always named.
      const need = Math.min(h, LOOK_AHEAD_MIN_VISIBLE);
      if (y + h - top < need) above.push(row.dataset.medRow!);
      else if (bottom - y < need) below.push(row.dataset.medRow!);
    });
    setLookAhead(prev =>
      prev.above.join() === above.join() && prev.below.join() === below.join() ? prev : { above, below },
    );
  };
  React.useLayoutEffect(() => updateLookAhead());
  // Recheck when the list viewport changes size without a re-render (container height, window resize).
  const lookAheadRef = React.useRef(updateLookAhead);
  lookAheadRef.current = updateLookAhead;
  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => lookAheadRef.current());
    ro.observe(body);
    const content = body.firstElementChild;
    if (content) ro.observe(content);
    return () => ro.disconnect();
  }, []);

  // Keep the column headings aligned with the scrolling body (scrollbar width).
  const [gutter, setGutter] = React.useState(0);
  React.useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const g = body.offsetWidth - body.clientWidth;
    if (g !== gutter) setGutter(g);
  });

  // Keep the recording form fully on screen (MEDa-0245).
  React.useEffect(() => {
    if (!recording) return;
    bodyRef.current?.querySelector<HTMLElement>('.cui-dac__extra--form')?.scrollIntoView({ block: 'nearest' });
  }, [recording]);
  const scrollToMed = (medId: string) => {
    const body = bodyRef.current;
    const row = body?.querySelector<HTMLElement>(`[data-med-row="${CSS.escape(medId)}"]`);
    if (body && row) {
      body.scrollTop = Math.max(0, row.offsetTop - 8);
      row.querySelector<HTMLElement>('[data-nav]')?.focus();
    }
  };

  // ---------- Keyboard grid navigation (roving tabindex) ----------
  React.useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const targets = Array.from(body.querySelectorAll<HTMLElement>('[data-nav]'));
    if (!targets.length) return;
    const active = targets.find(t => t.dataset.nav === activeNav.current) ?? targets[0];
    targets.forEach(t => (t.tabIndex = t === active ? 0 : -1));
  });

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-nav]');
    if (!t || !bodyRef.current) return;
    const [r, c, ev] = t.dataset.nav!.split(':').map(Number);
    const all = Array.from(bodyRef.current.querySelectorAll<HTMLElement>('[data-nav]'));
    const parse = (el: HTMLElement) => el.dataset.nav!.split(':').map(Number);
    const rows = Array.from(new Set(all.map(el => parse(el)[0]))).sort((a, b) => a - b);
    const inCell = (rr: number, cc: number) => all.filter(el => parse(el)[0] === rr && parse(el)[1] === cc).sort((a, b) => parse(a)[2] - parse(b)[2]);
    let target: HTMLElement | undefined;
    const ri = rows.indexOf(r);
    switch (e.key) {
      case 'ArrowRight':
        target = inCell(r, Math.min(4, c + 1))[0];
        break;
      case 'ArrowLeft':
        target = inCell(r, Math.max(0, c - 1))[0];
        break;
      case 'ArrowDown': {
        const cell = inCell(r, c);
        const idx = cell.indexOf(t);
        target = idx < cell.length - 1 ? cell[idx + 1] : ri < rows.length - 1 ? inCell(rows[ri + 1], c)[0] : undefined;
        break;
      }
      case 'ArrowUp': {
        const cell = inCell(r, c);
        const idx = cell.indexOf(t);
        if (idx > 0) target = cell[idx - 1];
        else if (ri > 0) {
          const prev = inCell(rows[ri - 1], c);
          target = prev[prev.length - 1];
        }
        break;
      }
      case 'Home':
        target = e.ctrlKey ? inCell(rows[0], 0)[0] : inCell(r, 0)[0];
        break;
      case 'End':
        target = e.ctrlKey ? inCell(rows[rows.length - 1], 4)[0] : inCell(r, 4)[0];
        break;
      case 'Enter':
      case ' ':
        if (t.dataset.lhp) {
          e.preventDefault();
          setInfo(info?.medId === t.dataset.lhp ? null : { medId: t.dataset.lhp, tab: 'verification' });
        }
        return;
      default:
        return;
    }
    void ev;
    if (target) {
      e.preventDefault();
      activeNav.current = target.dataset.nav!;
      target.focus();
    }
  };

  // ---------- Event activation ----------
  const activate = (m: AdminMedication, p: Placed, day: Date) => {
    const key = `${m.id}:${p.key}`;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (p.event?.status) {
      setDetails(details === key ? null : key);
      return;
    }
    if (!onRecord) {
      setDetails(details === key ? null : key);
      return;
    }
    // Make the event's day the selected day so all supporting information is visible (MEDa-0299).
    if (!adminIsSameDay(day, selected)) goTo(day);
    setDetails(null);
    setRecording({ medId: m.id, eventId: p.event ? p.event.id : null, focusKey: key });
  };

  const closeRecording = () => {
    const k = recording?.focusKey;
    setRecording(null);
    if (k) focusKey(k);
  };

  // Close details popover on outside click (MEDa-0112).
  React.useEffect(() => {
    if (!details) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.cui-dac__popover') && !el.closest(`[data-focus-key="${CSS.escape(details)}"]`)) setDetails(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [details]);

  // ---------- Rendering helpers ----------
  const nbm = nilByMouth ? (typeof nilByMouth === 'object' ? nilByMouth : {}) : null;

  const renderTimeScale = (m: AdminMedication, h: number) => {
    const times = scheduledClockTimes(m);
    const ticks = Array.from({ length: 25 }, (_, i) => i);
    const nowY = PAD + adminTimeToY(now, today, h);
    return (
      <div className="cui-dac__scale" aria-hidden="true" style={{ height: h + PAD * 2 }}>
        <div className="cui-dac__scale-past" style={{ top: PAD, height: nowY - PAD }} />
        {ticks.map(i => (
          <span
            key={i}
            className={cx('cui-dac__tick', i % 6 === 0 && 'cui-dac__tick--major')}
            style={{ top: PAD + (i / 24) * h }}
          />
        ))}
        {adminScaleLabels(times).map(l => (
          <span
            key={l.edge ?? l.minutes}
            className={cx('cui-dac__scale-label', l.edge && 'cui-dac__scale-label--edge', l.scheduled && 'cui-dac__scale-label--scheduled', l.edge && l.scheduled && 'cui-dac__scale-label--midnight')}
            style={{ top: PAD + (l.minutes / 1440) * h }}
            title={l.edge && l.scheduled ? 'Scheduled at midnight (shown as 00:00, never 24:00)' : undefined}
          >
            {l.label}
          </span>
        ))}
        <span className="cui-dac__now-line cui-dac__now-line--scale" style={{ top: nowY }} />
      </div>
    );
  };

  const eventDetail = (m: AdminMedication, e: AdminEvent | null, state: AdminEventState, isSelected: boolean): string => {
    const parts: string[] = [];
    if (!e) return isSelected && m.asRequired?.criteria ? m.asRequired.criteria : '';
    const doseAllDays = m.doseVariation && m.doseVariation !== 'none';
    if (e.status) {
      if (isSelected) {
        const t = adminFormatTimeLabel(e);
        if (t) parts.push(t);
      }
      if (adminIsGivenStatus(e.status) && e.dose && (isSelected || doseAllDays)) parts.push(e.dose);
      if (isSelected && e.recordedBy && (e.status === 'selfAdministered' || e.requiredRole)) parts.push(e.recordedBy);
      if (isSelected && e.notes) parts.push(e.notes);
      return parts.join(', ');
    }
    if (e.intendedDose && (isSelected || m.doseVariation === 'constantPattern' || m.doseVariation === 'varyingPattern')) parts.push(e.intendedDose);
    if (isSelected && (state === 'next' || state === 'due' || state === 'overdue')) {
      if (m.doseVariation === 'conditional' && m.doseCriteria) parts.push(m.doseCriteria);
      if (m.doseVariation === 'range' && m.doseRange) parts.push(m.doseRange);
      if (e.precondition) parts.push(e.precondition);
      if (e.requiredRole) parts.push(`Requires ${e.requiredRole}`);
    }
    return parts.join(', ');
  };

  const renderPopover = (m: AdminMedication, p: Placed) => {
    const e = p.event;
    const lines: string[] = [];
    if (e?.status) {
      const at = toDate(e.administeredAt ?? null);
      if (at) lines.push(`${e.timePrecision === 'approx' ? 'Approx ' : ''}${formatShortDate(at)} ${formatTime(at)}`);
      lines.push(adminRegionalStatusLabel(e.status, e.reasonCode, region));
      const legend = region !== 'GB' ? adminReasonLegend(e.reasonCode, region) : undefined;
      if (legend && legend !== lines[lines.length - 1].slice(lines[lines.length - 1].indexOf(' ') + 1)) lines.push(legend);
      if (e.reasonText) lines.push(`Reason: ${e.reasonText}`);
      if (e.scheduledTime) lines.push(`Intended ${formatTime(e.scheduledTime)}`);
      if (e.dose) lines.push(`Dose ${e.dose}`);
      if (e.recordedBy) lines.push(`Recorded by ${e.recordedBy}`);
      if (e.notes) lines.push(e.notes);
      if (e.edited) lines.push('This entry has been edited');
    } else if (e?.scheduledTime) {
      lines.push(`${formatShortDate(e.scheduledTime)} ${formatTime(e.scheduledTime)}`);
      if (e.intendedDose) lines.push(`Dose ${e.intendedDose}`);
      if (e.precondition) lines.push(e.precondition);
    }
    return (
      <div
        className="cui-dac__popover"
        role="dialog"
        aria-label={`Administration details, ${m.name}`}
        onMouseEnter={() => hoverTimer.current && clearTimeout(hoverTimer.current)}
        onMouseLeave={() => {
          hoverTimer.current = setTimeout(() => setDetails(null), 300);
        }}
        onKeyDown={ev => {
          if (ev.key === 'Escape') {
            ev.stopPropagation();
            setDetails(null);
            focusKey(`${m.id}:${p.key}`);
          }
        }}
      >
        <div className="cui-dac__popover-details">
          {lines.map((l, i) => (
            <div key={i} className={i === 0 ? 'cui-dac__popover-time' : undefined}>
              {l}
            </div>
          ))}
        </div>
        {onRecord && e ? (
          <div className="cui-dac__popover-actions">
            <Button
              size="sm"
              onClick={() => {
                setDetails(null);
                setRecording({ medId: m.id, eventId: e.id, focusKey: `${m.id}:${p.key}` });
              }}
            >
              {e.status ? 'Change' : 'Record'}
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  let rowIndex = -1;

  const renderRow = (m: AdminMedication) => {
    rowIndex++;
    const r = rowIndex;
    const isPast = adminIsPastMedication(m, now);
    const states = adminEventStates(m, now);
    const lock = adminLockoutEnd(m, now);
    const unscheduled = adminIsUnscheduled(m.kind);
    const firstEventId = m.startIsActual
      ? null
      : [...m.events].sort((a, b) => (adminEventPlotTime(a)?.getTime() ?? 0) - (adminEventPlotTime(b)?.getTime() ?? 0))[0]?.id;

    // Place events by day.
    const perDay: Placed[][] = days.map(() => []);
    for (const e of m.events) {
      if (unscheduled && !e.status) continue; // MEDa-0133
      const t = adminEventPlotTime(e);
      if (!t) continue;
      const di = days.findIndex(d => adminIsSameDay(d, t));
      if (di >= 0) perDay[di].push({ key: e.id, event: e, state: states.get(e.id) ?? 'future', time: t });
    }
    const todayIdx = days.findIndex(d => adminIsSameDay(d, now));
    if (unscheduled && !isPast && todayIdx >= 0) {
      // One available event at the current time that moves as time passes (MEDa-0271).
      perDay[todayIdx].push({ key: 'now', event: null, state: 'unscheduled', time: now });
    }
    perDay.forEach(list => list.sort((a, b) => a.time.getTime() - b.time.getTime()));

    const clock = scheduledClockTimes(m).map(t => adminScheduleMinutes(t)).filter((x): x is number => x != null && x > 0 && x < 1440);
    const labelTimes = [0, ...clock, 1440].map(mm => new Date(today.getTime() + mm * 60000));
    const h = Math.max(
      adminLineHeight(perDay.map(l => l.map(p => p.time)), minLineHeight, ITEM),
      adminLineHeight([labelTimes], minLineHeight, LABEL),
    );
    const earlier = adminAdjacentEventDate(m, windowStart, windowEnd, 'earlier');
    const later = adminAdjacentEventDate(m, windowStart, windowEnd, 'later');
    const infStatus = adminInfusionStatus(m, now);
    const inf = m.infusion;
    const infStart = inf ? toDate(inf.actualStart ?? null) ?? toDate(inf.scheduledStart) : null;
    const infStop = inf ? toDate(inf.stoppedAt ?? null) ?? adminEstimatedStop(inf, now) : null;
    const infStopEstimated = inf ? !toDate(inf.stoppedAt ?? null) : false;
    const isRecordingRow = recording?.medId === m.id;
    const kindClass = m.kind === 'onceOnly' ? 'once' : unscheduled || m.kind === 'asRequiredScheduled' ? 'prn' : m.kind === 'significantDuration' ? 'sd' : 'regular';
    const infoOpen = info?.medId === m.id;

    const row = (
      <div
        key={m.id}
        role="row"
        className={cx(
          'cui-dac__row',
          `cui-dac__row--${kindClass}`,
          isPast && 'cui-dac__row--past',
          recording && !isRecordingRow && 'cui-dac__row--dimmed',
          isRecordingRow && 'cui-dac__row--recording',
        )}
        data-med-row={m.id}
        data-past={isPast ? 'true' : 'false'}
        aria-rowindex={r + 2}
      >
        <div
          role="rowheader"
          className="cui-dac__lhp"
          data-nav={`${r}:0:0`}
          data-lhp={m.id}
          tabIndex={-1}
          data-focus-key={`lhp:${m.id}`}
          aria-expanded={infoOpen}
        >
          <MedicationLeftPanel
            medication={m}
            isPast={isPast}
            lockoutEnd={lock}
            now={now}
            medicationLine={renderMedicationLine?.(m)}
            region={region}
            onOpenInfo={tab => setInfo(infoOpen && info?.tab === tab ? null : { medId: m.id, tab })}
          />
        </div>
        {renderTimeScale(m, h)}
        {days.map((day, di) => {
          const isSel = di === 2;
          const isToday = adminIsSameDay(day, now);
          const isPastDay = day.getTime() < today.getTime();
          const cellDim = isRecordingRow && !isSel;
          const nowY = PAD + adminTimeToY(now, day, h);
          const targets: React.ReactNode[] = [];
          let navIdx = 0;
          const nav = () => `${r}:${di + 1}:${navIdx++}`;

          if (di === 0 && earlier) {
            targets.push(
              <button
                key="earlier"
                type="button"
                className="cui-dac__edge cui-dac__edge--earlier"
                data-nav={nav()}
                tabIndex={-1}
                title={`Earlier administrations. Go to ${formatShortDate(earlier)}`}
                aria-label={`Earlier administrations for ${m.name}. Go to ${formatShortDate(earlier)}`}
                onClick={() => goTo(earlier)}
              >
                <Icon name="chevron-left" size={16} />
              </button>,
            );
          }

          // Significant Duration bar (MEDa-0142 to MEDa-0147): static, no elapsed-time fill.
          let bar: React.ReactNode = null;
          if (inf && infStart && infStop) {
            const dayEnd = adminAddDays(day, 1);
            const s = Math.max(infStart.getTime(), day.getTime());
            const en = Math.min(infStop.getTime(), dayEnd.getTime());
            if (en > s) {
              const y1 = PAD + adminTimeToY(new Date(s), day, h);
              const y2 = PAD + (en >= dayEnd.getTime() ? h : adminTimeToY(new Date(en), day, h));
              const begun = infStatus === 'begun' || infStatus === 'completed' || infStatus === 'discontinued';
              bar = (
                <React.Fragment key="bar">
                  <div
                    className={cx('cui-dac__bar', begun ? 'cui-dac__bar--begun' : 'cui-dac__bar--scheduled', infStopEstimated && en === infStop.getTime() && 'cui-dac__bar--open-end')}
                    style={{ top: y1, height: Math.max(4, y2 - y1) }}
                    aria-hidden="true"
                  />
                  {(inf.interruptions ?? []).map((it, k) => {
                    const is = toDate(it.start);
                    const ie = toDate(it.end ?? null) ?? now;
                    if (!is) return null;
                    const a = Math.max(is.getTime(), s);
                    const b = Math.min(ie.getTime(), en);
                    if (b <= a) return null;
                    return (
                      <div
                        key={k}
                        className="cui-dac__bar-interruption"
                        style={{ top: PAD + adminTimeToY(new Date(a), day, h), height: Math.max(3, ((b - a) / 86400000) * h) }}
                        aria-hidden="true"
                      />
                    );
                  })}
                  {isSel ? (
                    <>
                      {infStart.getTime() >= day.getTime() ? (
                        <span className="cui-dac__bar-label" style={{ top: y1 - 8 }}>
                          {infStatus === 'startAt' || infStatus === 'dueAt' ? 'Start' : 'Started'} {formatTime(infStart)}
                        </span>
                      ) : null}
                      {infStop.getTime() <= dayEnd.getTime() ? (
                        <span className={cx('cui-dac__bar-label', infStopEstimated && 'cui-dac__bar-label--estimate')} style={{ top: y2 - 8 }}>
                          {infStopEstimated ? `Est. stop ${formatTime(infStop)} (estimate)` : `Stopped ${formatTime(infStop)}`}
                        </span>
                      ) : null}
                      {(inf.interruptions ?? []).filter(it => adminIsSameDay(it.start, day)).map((it, k) => (
                        <span key={`il${k}`} className="cui-dac__bar-label" style={{ top: PAD + adminTimeToY(it.start, day, h) - 8 }}>
                          Interrupted {formatTime(it.start)}
                          {it.end ? ` to ${formatTime(it.end)}` : ''}
                          {it.reason ? `, ${it.reason}` : ''}
                        </span>
                      ))}
                    </>
                  ) : null}
                </React.Fragment>
              );
            }
          }

          const events = perDay[di].map(p => {
            const key = `${m.id}:${p.key}`;
            const isLocked = !!lock && p.event === null;
            const detail = eventDetail(m, p.event, p.state, isSel);
            const showLabel =
              isSel || p.state === 'overdue' || p.state === 'due' || (p.state === 'recorded' && !adminIsGivenStatus(p.event?.status));
            const y = PAD + adminTimeToY(p.time, day, h);
            return (
              <div key={p.key} className={cx('cui-dac__event', details === key && 'cui-dac__event--open')} style={{ top: y - ITEM / 2 }}>
                <AdministrationEventIcon
                  state={p.state}
                  status={p.event?.status}
                  reasonCode={p.event?.reasonCode}
                  region={region}
                  kind={m.kind}
                  time={p.event ? p.event.scheduledTime ?? p.time : p.time}
                  detail={isLocked && isSel ? `Time restriction until ${formatTime(lock!)}` : detail || undefined}
                  showLabel={showLabel}
                  edited={p.event?.edited}
                  markers={p.event ? markersFor(m, p.event, p.event.id === firstEventId, false) : isLocked ? ['lockout'] : []}
                  medicationName={`${m.name}, ${formatShortDate(day)}`}
                  onActivate={() => activate(m, p, day)}
                  data-nav={nav()}
                  data-focus-key={key}
                  tabIndex={-1}
                  aria-haspopup={p.event?.status || !onRecord ? 'dialog' : undefined}
                  aria-expanded={details === key ? true : undefined}
                  onMouseEnter={() => {
                    if (!p.event?.status) return;
                    if (hoverTimer.current) clearTimeout(hoverTimer.current);
                    hoverTimer.current = setTimeout(() => setDetails(key), 500); // MEDa-0109
                  }}
                  onMouseLeave={() => {
                    if (hoverTimer.current) clearTimeout(hoverTimer.current);
                    if (details === key) hoverTimer.current = setTimeout(() => setDetails(null), 300);
                  }}
                />
                {details === key ? renderPopover(m, p) : null}
              </div>
            );
          });

          let statusBox: React.ReactNode = null;
          if (isSel && infStatus && inf) {
            const label = adminInfusionStatusLabel(infStatus, inf.scheduledStart);
            statusBox = (
              <div key="status" className="cui-dac__status-box">
                <AdministrationEventIcon
                  state={infStatus === 'dueAt' ? 'due' : infStatus === 'begun' ? 'begun' : infStatus === 'completed' ? 'recorded' : 'future'}
                  status={infStatus === 'completed' ? 'given' : undefined}
                  showLabel={false}
                />
                <span className="cui-dac__status-text">{label}</span>
                {onOpenSignificantDurationDetail ? (
                  <button
                    type="button"
                    className="cui-dac__status-link"
                    data-nav={nav()}
                    tabIndex={-1}
                    onClick={() => onOpenSignificantDurationDetail(m)}
                    aria-label={`Open details for ${m.name}`}
                  >
                    Details
                  </button>
                ) : null}
              </div>
            );
          }

          let laterBtn: React.ReactNode = null;
          if (di === 3 && later) {
            laterBtn = (
              <button
                key="later"
                type="button"
                className="cui-dac__edge cui-dac__edge--later"
                data-nav={nav()}
                tabIndex={-1}
                title={`Later administrations. Go to ${formatShortDate(later)}`}
                aria-label={`Later administrations for ${m.name}. Go to ${formatShortDate(later)}`}
                onClick={() => goTo(adminAddDays(later, 0))}
              >
                <Icon name="chevron-right" size={16} />
              </button>
            );
          }
          const hasTargets = navIdx > 0;
          const empty = !hasTargets;

          return (
            <div
              key={di}
              role="gridcell"
              className={cx(
                'cui-dac__cell',
                isSel && 'cui-dac__cell--selected',
                isToday && 'cui-dac__cell--today',
                isPastDay && 'cui-dac__cell--past',
                cellDim && 'cui-dac__cell--dimmed',
              )}
              style={{ height: h + PAD * 2 }}
              data-nav={empty ? `${r}:${di + 1}:0` : undefined}
              tabIndex={empty ? -1 : undefined}
              aria-label={empty ? `${m.name}, ${formatShortDate(day)}, no administrations` : undefined}
            >
              {isToday ? (
                <>
                  <div className="cui-dac__past-shade" style={{ top: 0, height: nowY }} aria-hidden="true" />
                  <div className="cui-dac__now-line" style={{ top: nowY }} aria-hidden="true" />
                </>
              ) : null}
              {bar}
              {targets}
              {events}
              {statusBox}
              {laterBtn}
            </div>
          );
        })}
        <div className="cui-dac__trail" aria-hidden="true" />
      </div>
    );

    const extra: React.ReactNode[] = [];
    if (infoOpen) {
      extra.push(
        <div key={`${m.id}-info`} role="row" className="cui-dac__extra">
          <div role="gridcell" className="cui-dac__extra-cell cui-dac__extra-cell--info">
            <MedicationInfoPanel
              id={`${id}-${m.id}-info`}
              medication={m}
              tab={info!.tab}
              onTab={tab => setInfo({ medId: m.id, tab })}
              onClose={() => {
                setInfo(null);
                focusKey(`lhp:${m.id}`);
              }}
            />
          </div>
        </div>,
      );
    }
    if (isRecordingRow && onRecord) {
      const ev = recording!.eventId ? m.events.find(e => e.id === recording!.eventId) ?? null : null;
      const formEvent: AdminEvent = ev ?? { id: `${m.id}-new` };
      extra.push(
        <div key={`${m.id}-form`} role="row" className="cui-dac__extra cui-dac__extra--form">
          <div role="gridcell" className="cui-dac__extra-cell cui-dac__extra-cell--form">
            <AdministrationRecordingForm
              medication={m}
              event={formEvent}
              now={now}
              currentUser={currentUser}
              region={region}
              paediatric={paediatric}
              sites={sites}
              nilByMouth={!!nbm}
              outstandingEvents={adminOutstandingEvents(m, now, ev?.id)}
              onSubmit={payload => {
                onRecord(m, ev, payload);
                closeRecording();
              }}
              onCancel={closeRecording}
              onClear={
                ev?.status && onClearEvent
                  ? () => {
                      onClearEvent(m, ev);
                      closeRecording();
                    }
                  : undefined
              }
            />
          </div>
        </div>,
      );
    }
    return (
      <React.Fragment key={m.id}>
        {row}
        {extra}
      </React.Fragment>
    );
  };

  const lookAheadArea = (where: 'above' | 'below') => {
    const ids = lookAhead[where];
    if (!ids.length) return null;
    return (
      <div className={cx('cui-dac__lasb', `cui-dac__lasb--${where}`)} role="navigation" aria-label={where === 'above' ? 'Medications above' : 'Medications below'}>
        <Icon name={where === 'above' ? 'arrow-up' : 'arrow-down'} size={16} />
        <span className="cui-dac__lasb-title">{where === 'above' ? 'Above' : 'Below'}:</span>
        {ids.map(mid => {
          const m = byId.get(mid);
          if (!m) return null;
          const k = adminOrderKey(m, now);
          const st = k.tier === 0 ? 'overdue' : k.tier === 1 ? 'due' : 'other';
          return (
            <button key={mid} type="button" className={cx('cui-dac__lasb-item', `cui-dac__lasb-item--${st}`)} onClick={() => scrollToMed(mid)}>
              {m.name}
              {st !== 'other' ? <span className="cui-dac__lasb-state">{st === 'overdue' ? 'Overdue' : 'Due'}</span> : null}
            </button>
          );
        })}
      </div>
    );
  };

  const groupingLabelId = `${id}-grouping`;
  const frozenProps = frozen ? ({ inert: '' } as Record<string, string>) : {};

  return (
    <div
      ref={rootRef}
      className={cx('cui-dac', recording && 'cui-dac--recording', className)}
      style={{ ['--cui-dac-max' as string]: `${maxListHeight}px` } as React.CSSProperties}
    >
      {/* Toolbar: status bar and grouping control (MEDa-0247); no filtering (MEDa-0248) */}
      <div className="cui-dac__toolbar">
        <div className="cui-dac__status" aria-live="polite" aria-atomic="true">
          <span className="cui-dac__count cui-dac__count--overdue">
            <span className="cui-dac__count-label">Overdue</span> <strong>{counts.overdue}</strong>
          </span>
          <span className="cui-dac__count cui-dac__count--due">
            <span className="cui-dac__count-label">Due</span> <strong>{counts.due}</strong>
          </span>
          <span className="cui-dac__count">
            <span className="cui-dac__count-label">{wording.asRequired}</span>{' '}
            <strong>
              {counts.asRequiredAvailable} of {counts.asRequiredTotal}
            </strong>{' '}
            available
          </span>
          <span className="cui-dac__count">
            <span className="cui-dac__count-label">Begun</span> <strong>{counts.begun}</strong>
          </span>
        </div>
        <div className="cui-dac__controls">
          <label className="cui-dac__grouping" htmlFor={groupingLabelId}>
            <Icon name="group" size={16} />
            <span className="cui-label">Grouping</span>
            <select id={groupingLabelId} value={grouping} onChange={e => setGrouping(e.target.value as AdminGrouping)}>
              <option value="none">No grouping</option>
              <option value="type">Group by type</option>
              <option value="startDate">Start date and time list order</option>
            </select>
          </label>
          {grouping !== 'none' ? (
            <Button size="sm" variant="quiet" onClick={() => setGrouping('none')}>
              Remove grouping
            </Button>
          ) : null}
          <Button
            size="sm"
            icon="refresh"
            disabled={!stale || grouping === 'startDate'}
            onClick={() => setOrder(computeOrder())}
            title={stale ? 'Changes affect the list order' : undefined}
          >
            Update list order
          </Button>
        </div>
      </div>

      {frozen ? (
        <div className="cui-dac__updates" role="alert">
          <Icon name="warning" size={16} />
          <div className="cui-dac__updates-body">
            <strong>Prescriptions have changed while this chart was open</strong>
            <ul>
              {pendingUpdates!.map((u, i) => (
                <li key={i}>
                  {u.change === 'new' ? 'New' : u.change === 'edited' ? 'Changed' : 'Discontinued'}: {u.medicationName}
                  {u.details ? `, ${u.details}` : ''}
                </li>
              ))}
            </ul>
            <span>
              The list order may change. If you have already given a dose according to the previous prescription, record it against the previous
              details.
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              onAcknowledgeUpdates?.();
              setOrder(computeOrder());
            }}
          >
            Acknowledge and update chart
          </Button>
        </div>
      ) : null}

      <div className="cui-dac__grid" role="grid" aria-label={props['aria-label'] ?? 'Drug administration chart'} aria-colcount={6} {...frozenProps}>
        <div className="cui-dac__head" role="rowgroup" style={{ paddingRight: gutter }}>
          <div className="cui-dac__head-row" role="row" aria-rowindex={1}>
            <div role="columnheader" className="cui-dac__head-cell cui-dac__head-cell--lhp">
              Medication
            </div>
            <div className="cui-dac__head-nav" role="gridcell">
              <Button size="sm" variant="quiet" icon="chevron-left" iconOnly onClick={() => goTo(adminAddDays(selected, -1))}>
                Previous day
              </Button>
            </div>
            {days.map((d, i) => {
              const isToday = adminIsSameDay(d, now);
              const isSel = i === 2;
              return (
                <div
                  key={i}
                  role="columnheader"
                  className={cx('cui-dac__head-cell', isSel && 'cui-dac__head-cell--selected', isToday && 'cui-dac__head-cell--today')}
                  aria-current={isToday ? 'date' : undefined}
                >
                  <span className="cui-dac__head-date">
                    {isToday ? <Icon name="clock" size={16} /> : null}
                    <span>
                      {isToday ? 'Today: ' : ''}
                      {formatShortDate(d)}
                    </span>
                    {isSel ? <VisuallyHidden>(selected day)</VisuallyHidden> : null}
                  </span>
                  {isSel ? (
                    <span className="cui-dac__head-cal">
                      <Button
                        size="sm"
                        variant="quiet"
                        icon="calendar"
                        iconOnly
                        aria-expanded={calendarOpen}
                        aria-haspopup="dialog"
                        onClick={() => setCalendarOpen(!calendarOpen)}
                      >
                        Choose a day
                      </Button>
                      {calendarOpen ? (
                        <DayCalendar
                          selected={selected}
                          today={today}
                          onSelect={dd => {
                            goTo(dd);
                            setCalendarOpen(false);
                          }}
                          onClose={() => setCalendarOpen(false)}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </div>
              );
            })}
            <div className="cui-dac__head-nav cui-dac__head-nav--next" role="gridcell">
              <Button size="sm" variant="quiet" icon="chevron-right" iconOnly onClick={() => goTo(adminAddDays(selected, 1))}>
                Next day
              </Button>
            </div>
          </div>
          {nbm ? (
            <div role="row" className="cui-dac__notice-row">
              <div role="gridcell" aria-colspan={6} className="cui-dac__notice-cell">
                <NilByMouthBanner since={nbm.since} until={nbm.until} reason={nbm.reason} />
              </div>
            </div>
          ) : null}
          {lookAhead.above.length ? (
            <div role="row" className="cui-dac__notice-row">
              <div role="gridcell" aria-colspan={6} className="cui-dac__notice-cell">
                {lookAheadArea('above')}
              </div>
            </div>
          ) : null}
        </div>

        <div className="cui-dac__body" role="rowgroup" ref={bodyRef} onScroll={updateLookAhead} onKeyDown={onGridKeyDown}>
          <div className="cui-dac__content">
            <div className="cui-dac__selected-frame" aria-hidden="true">
              <div />
            </div>
            {visible.length === 0 ? (
              <div role="row" className="cui-dac__empty">
                <div role="gridcell" aria-colspan={6}>
                  No medications were current between {formatShortDate(windowStart)} and {formatShortDate(days[3])}.
                </div>
              </div>
            ) : (
              groups.map(g => {
                const isCollapsed = collapsed.has(g.key);
                return (
                  <React.Fragment key={g.key}>
                    {g.label ? (
                      <div role="row" className="cui-dac__group">
                        <div role="gridcell" aria-colspan={6}>
                          <button
                            type="button"
                            className="cui-dac__group-toggle"
                            aria-expanded={!isCollapsed}
                            onClick={() => {
                              const n = new Set(collapsed);
                              if (isCollapsed) n.delete(g.key);
                              else n.add(g.key);
                              setCollapsed(n);
                            }}
                          >
                            <Icon name={isCollapsed ? 'chevron-right' : 'chevron-down'} size={16} />
                            {g.label} <span className="cui-dac__group-count">({g.medications.length})</span>
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {isCollapsed ? null : g.medications.map(renderRow)}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </div>
      {lookAheadArea('below')}
      {showLegend && wording.legendTitle ? (
        <div className="cui-dac__legend" aria-label={wording.legendTitle} role="note">
          <span className="cui-dac__legend-title">{wording.legendTitle}:</span>
          {adminReasonCodes(region, { paediatric }).map(c => (
            <span key={c.code} className="cui-dac__legend-item">
              <span className={cx('cui-dac__legend-code', c.circled && 'cui-dac__legend-code--circled')}>{c.code}</span>
              {c.legend.split(/[:–]/)[0].trim()}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
