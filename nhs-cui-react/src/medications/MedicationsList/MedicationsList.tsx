import React from 'react';
import { cx, formatShortDate, Icon, toDate, useClinicalLocale, useControllableState, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion , DateLike } from '../../core';
import { MedicationActionSummaryDialog } from '../MedicationActionSummaryDialog/MedicationActionSummaryDialog';
import { MedicationLine } from '../MedicationLine/MedicationLine';
import { MedicationStatusText } from '../MedicationLine/MedicationStatus';
import type { MedicationAttributeKey} from '../utils/medicationLine';
import { medicationDrugName } from '../utils/medicationLine';
import { tallManDefaultFor } from '../utils/tallMan';
import type { MedicationLookAheadEntry, MedicationLookAheadToken,
  MedicationGroupingOption, MedicationRecord, MedicationSort, MedicationSortKey} from '../utils/medicationsList';
import {
  DEFAULT_CURRENT_SORT, DEFAULT_PAST_SORT, groupMedications, isCurrentMedicationStatus, medicationFilterNotification,
  medicationLookAheadTokens, medicationRecentPastNotification, sortMedications,
} from '../utils/medicationsList';
import { MedicationsMenu } from './MedicationsMenu';

/** A past medications filter (MEDv-066/067). Omit both windows for "Show All Past". */
export interface MedicationPastFilter {
  id: string;
  label: string;
  withinDays?: number;
  withinMonths?: number;
}

/** A level of detail for the list (MEDv-201). Mandatory columns always stay (MEDv-147 to MEDv-150). */
export interface MedicationDetailLevel {
  id: string;
  /** Shown in the "Detail" control, e.g. "Summary", "Standard", "Full". */
  label: string;
  /** Drug Details layout. "multiline" uses hard breaks with labels (MEDi-030). Default "sentence". */
  lineLayout?: 'sentence' | 'multiline';
  /** Multi-line only: attributes that start a new line. Default ['dose']. */
  lineBreaks?: MedicationAttributeKey[];
  /** Show the end date column in the current list too. */
  showEndDate?: boolean;
  /** Show status supplements such as "Verified" (MEDv-164). Default true. */
  showStatusSupplement?: boolean;
}

/** Built-in levels of detail [suggested]: Summary (no status supplements), Standard, Full (multi-line Drug Details and end dates). */
export const DEFAULT_MEDICATION_DETAIL_LEVELS: MedicationDetailLevel[] = [
  { id: 'summary', label: 'Summary', showStatusSupplement: false },
  { id: 'standard', label: 'Standard' },
  { id: 'full', label: 'Full', lineLayout: 'multiline', lineBreaks: ['dose'], showEndDate: true },
];

/** An action in the list's own context menu (MEDv-128 to MEDv-136). */
export interface MedicationContextAction {
  id: string;
  /** Menu text, e.g. "Details...", "Suspend". */
  label: string;
  /**
   * Menu group (MEDv-133): information (display more), direct (act now), addInformation (add to the record).
   * Shown in that order with a divider between groups; "Details..." is first (MEDv-135/136).
   */
  group: 'information' | 'direct' | 'addInformation';
  /** Enabled for these selected rows; otherwise shown greyed out (MEDv-131). Default: always enabled. */
  isEnabled?: (rows: MedicationRecord[]) => boolean;
  /** Verb for the summary shown before acting on more than one medication (MEDv-203). Default: the label without dots. */
  summaryVerb?: string;
  /** Use the danger style on the summary's confirm button, e.g. for discontinue. */
  destructive?: boolean;
}

export interface MedicationsListProps {
  /** All of the patient's medications, current and past. Status decides the list (MEDv-172/173). */
  medications: MedicationRecord[];
  /** Which list is shown. "Current" is selected by default (MEDv-062). */
  view?: 'current' | 'past';
  defaultView?: 'current' | 'past';
  onViewChange?: (view: 'current' | 'past') => void;
  /** Past filter options; must include an "all past" option with no window (MEDv-067). */
  pastFilters?: MedicationPastFilter[];
  /** Selected past filter id. Default "all". */
  pastFilterId?: string;
  defaultPastFilterId?: string;
  onPastFilterChange?: (id: string) => void;
  /** Group by options. "None" is always added first (MEDv-190). */
  groupingOptions?: MedicationGroupingOption[];
  /** Initial grouping of the current list. Default "none": no grouping by default (MEDv-083). */
  defaultGroupBy?: string;
  /** Selected medication ids. None are selected by default (MEDv-202). */
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Right-click, Shift+F10 or the Menu key on a row, with the selected rows (MEDv-128). The consumer shows the menu. */
  onRowContextMenu?: (rows: MedicationRecord[], anchor: { x: number; y: number }) => void;
  /** Enter or double-click on a row. */
  onRowActivate?: (row: MedicationRecord) => void;
  /** Reference time for the past filter and the recent past notification. Default: now. */
  now?: DateLike;
  /** Recent past notification window in hours (MEDv-074/075). Default 48. */
  recentPastWindowHours?: number;
  /** Height of the scrolling list area in px, including the reserved look-ahead strips. Default 360. */
  maxHeight?: number;
  /** Look-ahead notifications (MEDv-177/178). Default true. */
  lookAhead?: boolean;
  /** Heading for the initiation date column (MEDv-149/155). Default "Start Date". */
  startDateHeading?: string;
  /** Heading for the stop date column (MEDv-150/155). Default "End Date". */
  endDateHeading?: string;
  /** Show the end date column in the current list too. Default false. */
  showEndDateInCurrent?: boolean;
  /** Empty list messages (MEDv-146). */
  emptyMessages?: { current?: string; past?: string };
  /** Jurisdiction for Drug Details and look-ahead names; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Mixed-case (Tall Man) lettering in Drug Details and look-ahead names. Default on for AU and NZ. */
  tallManLettering?: boolean;
  /** Levels of detail offered by a "Detail" control in the toolbar (MEDv-201). Omit for no control. See DEFAULT_MEDICATION_DETAIL_LEVELS. */
  detailLevels?: MedicationDetailLevel[];
  /** Selected level id (controlled). Default "standard" when present, else the first level. */
  detailLevel?: string;
  defaultDetailLevel?: string;
  onDetailLevelChange?: (id: string) => void;
  /**
   * The list's own context menu (right-click, Shift+F10, Menu key) when `onRowContextMenu` is not given
   * (MEDv-128 to MEDv-136). A "Details..." item is added if missing (MEDv-135).
   */
  contextActions?: MedicationContextAction[];
  /**
   * A context action was chosen. With more than one row it is called only after the summary of the
   * selected medications has been confirmed (MEDv-203).
   */
  onAction?: (actionId: string, rows: MedicationRecord[]) => void;
  /**
   * Show a warning icon with text "Decision support alert" (or the row's `alertLabel`) after the Drug Details of each row
   * with `hasAlert`, alongside any `line.icons` (MEDv-023). Default true [suggested].
   */
  showRowAlerts?: boolean;
  /** Accessible name for the list. Default "Medications". */
  label?: string;
  className?: string;
}

const DEFAULT_PAST_FILTERS: MedicationPastFilter[] = [
  { id: 'all', label: 'Show All Past' },
  { id: 'week', label: 'Past week', withinDays: 7 },
  { id: 'month', label: 'Past month', withinMonths: 1 },
  { id: '3months', label: 'Past 3 months', withinMonths: 3 },
  { id: '2years', label: 'Past 2 years', withinMonths: 24 },
];

const STATUS_ORDER = ['Started', 'Not Started', 'Suspended', 'Completed', 'Discontinued'];
/** Heading case for attribute values used as group headings, e.g. "Oral" [suggested]. Drug names are never changed (MEDi-002). */
const headingCase = (v: string | undefined) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v);
const DEFAULT_GROUPING: MedicationGroupingOption[] = [
  { id: 'drugName', label: 'Drug Name', getValues: r => medicationDrugName(r.line) },
  { id: 'route', label: 'Route', getValues: r => r.groupValues?.route ?? headingCase(r.line.route) },
  { id: 'frequency', label: 'Frequency', getValues: r => r.groupValues?.frequency ?? headingCase(r.line.frequency) },
  {
    id: 'routeAndFrequency', label: 'Route and Frequency', nullLabel: 'No Route or Frequency Specified',
    getValues: r => (r.line.route || r.line.frequency ? headingCase([r.line.route ?? '', r.line.frequency ?? ''].filter(Boolean).join(', ')) : undefined),
  },
  { id: 'status', label: 'Status', getValues: r => r.status, compare: (a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b) },
];

type ViewState = { sort: MedicationSort; groupBy: string; collapsed: string[] };
type Item =
  | { type: 'heading'; key: string; label: string; count: number; collapsed: boolean; rows: MedicationRecord[] }
  | { type: 'row'; row: MedicationRecord; shaded: boolean; groupKey?: string };

const SORT_DEFAULT_DIR: Record<MedicationSortKey, 'asc' | 'desc'> = { drugDetails: 'asc', status: 'asc', startDate: 'desc', endDate: 'desc' };

function filterStart(f: MedicationPastFilter, now: Date): number | null {
  if (f.withinDays != null) return now.getTime() - f.withinDays * 86400_000;
  if (f.withinMonths != null) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - f.withinMonths);
    return d.getTime();
  }
  return null;
}

let measureCtx: CanvasRenderingContext2D | null | undefined;
function measureText(text: string, font: string): number {
  if (measureCtx === undefined) measureCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  if (!measureCtx) return text.length * 7.5;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

function LookAheadStrip({ tokens, position, mode }: { tokens: MedicationLookAheadToken[]; position: 'top' | 'bottom'; mode: 'names' | 'countOnly' }) {
  const parts: React.ReactNode[] = [];
  tokens.forEach((t, i) => {
    if (i > 0) parts.push(<span key={`d${i}`} className="cui-medications-list__lasb-dot" aria-hidden="true"> {'●'} </span>);
    if (t.kind === 'count') {
      parts.push(
        <span key={`c${i}`} className="cui-medications-list__lasb-count">
          {t.count} more
          {t.hasAlert ? <Icon name="warning" label="Includes medications with decision support alerts" className="cui-medications-list__lasb-alert" /> : null}
        </span>,
      );
    } else {
      parts.push(
        <span key={t.id} className="cui-medications-list__lasb-name">
          {t.label}
          {t.hasAlert ? <Icon name="warning" label="Decision support alert" className="cui-medications-list__lasb-alert" /> : null}
        </span>,
      );
    }
  });
  const summary = tokens.length
    ? `${tokens.reduce((n, t) => n + (t.kind === 'count' ? t.count : 1), 0)} ${mode === 'names' ? 'medications' : 'items'} ${position === 'top' ? 'above' : 'below'}: `
    : '';
  return (
    <div className={cx('cui-medications-list__lasb', `cui-medications-list__lasb--${position}`)}>
      {tokens.length ? (
        <span className="cui-medications-list__lasb-note">
          <VisuallyHidden>{summary}</VisuallyHidden>
          {parts}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Tabular list of one patient's current or past medications (Medications List v1.0.0.0):
 * Current/Past buttons with a past filter, Group by, sortable columns, bold status, look-ahead
 * notifications for rows out of view, filter and recent past notification rows, and keyboard
 * selection. Each row's Drug Details is a full MedicationLine.
 */
export function MedicationsList({
  medications, view: viewProp, defaultView = 'current', onViewChange, pastFilters = DEFAULT_PAST_FILTERS,
  pastFilterId: pastFilterProp, defaultPastFilterId, onPastFilterChange, groupingOptions = DEFAULT_GROUPING, defaultGroupBy = 'none',
  selectedIds: selectedProp, defaultSelectedIds = [], onSelectionChange, onRowContextMenu, onRowActivate, now: nowProp,
  recentPastWindowHours = 48, maxHeight = 360, lookAhead = true, startDateHeading = 'Start Date', endDateHeading = 'End Date',
  showEndDateInCurrent = false, emptyMessages, label = 'Medications', className, region: regionProp, tallManLettering,
  detailLevels, detailLevel: detailProp, defaultDetailLevel, onDetailLevelChange, contextActions, onAction, showRowAlerts = true,
}: MedicationsListProps) {
  const uid = useId('cui-medlist');
  const { region } = useClinicalLocale(regionProp);
  const tallMan = tallManLettering ?? tallManDefaultFor(region);
  const drugName = (row: MedicationRecord) => medicationDrugName(row.line, { region, tallMan });
  const levels = detailLevels && detailLevels.length ? detailLevels : null;
  const [levelId, setLevelId] = useControllableState(
    detailProp,
    defaultDetailLevel ?? (levels ? (levels.find(l => l.id === 'standard') ?? levels[0]).id : ''),
    onDetailLevelChange,
  );
  const level: MedicationDetailLevel | null = levels ? levels.find(l => l.id === levelId) ?? levels[0] : null;
  const [rowMenu, setRowMenu] = React.useState<{ x: number; y: number; rows: MedicationRecord[] } | null>(null);
  const [summary, setSummary] = React.useState<{ action: MedicationContextAction; rows: MedicationRecord[] } | null>(null);
  const rowMenuReturn = React.useRef<HTMLElement | null>(null);
  const now = React.useMemo(() => toDate(nowProp ?? null) ?? new Date(), [nowProp]);
  const [view, setView] = useControllableState(viewProp, defaultView, onViewChange);
  const allFilterId = (pastFilters.find(f => f.withinDays == null && f.withinMonths == null) ?? pastFilters[0])?.id ?? 'all';
  const [pastFilterId, setPastFilterId] = useControllableState(pastFilterProp, defaultPastFilterId ?? allFilterId, onPastFilterChange);
  const [selected, setSelected] = useControllableState(selectedProp, defaultSelectedIds, onSelectionChange);
  // Sort, grouping and collapse state are independent for Current and Past (MEDv-087, 3.3.30).
  const [states, setStates] = React.useState<Record<'current' | 'past', ViewState>>({
    current: { sort: DEFAULT_CURRENT_SORT, groupBy: defaultGroupBy, collapsed: [] },
    past: { sort: DEFAULT_PAST_SORT, groupBy: 'none', collapsed: [] },
  });
  const vs = states[view];
  const patch = (p: Partial<ViewState>) => setStates(s => ({ ...s, [view]: { ...s[view], ...p } }));
  const [filterMenu, setFilterMenu] = React.useState(false);
  const [headingMenu, setHeadingMenu] = React.useState<{ x: number; y: number; key: string } | null>(null);
  const [focusKey, setFocusKey] = React.useState<string | null>(null);
  const [anchorId, setAnchorId] = React.useState<string | null>(null);
  const filterBtn = React.useRef<HTMLButtonElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headRef = React.useRef<HTMLTableSectionElement>(null);
  const footRef = React.useRef<HTMLTableSectionElement>(null);
  const itemRefs = React.useRef(new Map<string, HTMLTableRowElement>());
  const headingFocusRef = React.useRef<HTMLElement | null>(null);

  const isPast = view === 'past';
  const defaultSort = isPast ? DEFAULT_PAST_SORT : DEFAULT_CURRENT_SORT;
  const activeFilter = pastFilters.find(f => f.id === pastFilterId) ?? pastFilters[0];
  const currentAll = medications.filter(m => isCurrentMedicationStatus(m.status));
  const pastAll = medications.filter(m => !isCurrentMedicationStatus(m.status));
  const filterFrom = isPast && activeFilter ? filterStart(activeFilter, now) : null;
  // Current medications are never filtered (3.3.19).
  const listRows = isPast
    ? pastAll.filter(r => {
        if (filterFrom == null) return true;
        const e = toDate(r.endDate ?? null);
        return !!e && e.getTime() >= filterFrom;
      })
    : currentAll;
  const sorted = sortMedications(listRows, vs.sort, defaultSort);
  const grouping = vs.groupBy === 'none' ? null : groupingOptions.find(g => g.id === vs.groupBy) ?? null;

  const grouped = grouping != null;
  const items: Item[] = [];
  if (grouping) {
    for (const g of groupMedications(sorted, grouping)) {
      const collapsed = vs.collapsed.includes(g.key);
      items.push({ type: 'heading', key: g.key, label: g.label, count: g.rows.length, collapsed, rows: g.rows });
      // Shading restarts in each group, first row unshaded (MEDv-192).
      if (!collapsed) g.rows.forEach((row, i) => items.push({ type: 'row', row, shaded: i % 2 === 1, groupKey: g.key }));
    }
  } else {
    sorted.forEach((row, i) => items.push({ type: 'row', row, shaded: i % 2 === 1 }));
  }
  const visibleRows = items.filter((i): i is Extract<Item, { type: 'row' }> => i.type === 'row').map(i => i.row);
  const itemKey = (it: Item) => (it.type === 'row' ? `r:${it.row.id}` : `g:${it.key}`);
  const keys = items.map(itemKey);
  const tabKey = focusKey && keys.includes(focusKey) ? focusKey : keys[0];

  const recentPast = !isPast ? medicationRecentPastNotification(pastAll, now, recentPastWindowHours) : null;
  const filtered = isPast && filterFrom != null;
  const filterText = filtered ? medicationFilterNotification(pastAll.length, listRows.length, activeFilter.label) : null;

  // Columns. Current: Drug Details first (MEDv-173, 3.3.16). Past: Status first, Drug Details second (MEDv-175).
  type Col = { key: MedicationSortKey; heading: string };
  const dateCols: Col[] = [{ key: 'startDate', heading: startDateHeading }];
  if (isPast || showEndDateInCurrent || level?.showEndDate) dateCols.push({ key: 'endDate', heading: endDateHeading }); // start before end (MEDv-151/152)
  const cols: Col[] = isPast
    ? [{ key: 'status', heading: 'Status' }, { key: 'drugDetails', heading: 'Drug Details' }, ...dateCols]
    : [{ key: 'drugDetails', heading: 'Drug Details' }, { key: 'status', heading: 'Status' }, ...dateCols];

  // ---- Selection (MEDv-122 to MEDv-127) ----
  const select = (ids: string[], anchor?: string | null) => {
    setSelected(ids);
    if (anchor !== undefined) setAnchorId(anchor);
  };
  const rangeIds = (fromId: string | null, toId: string) => {
    const ids = visibleRows.map(r => r.id);
    const a = fromId ? ids.indexOf(fromId) : -1;
    const b = ids.indexOf(toId);
    if (a < 0) return [toId];
    return ids.slice(Math.min(a, b), Math.max(a, b) + 1);
  };
  const onRowClick = (e: React.MouseEvent, row: MedicationRecord) => {
    setFocusKey(`r:${row.id}`);
    if (e.shiftKey) select(rangeIds(anchorId, row.id));
    else if (e.ctrlKey || e.metaKey) select(selected.includes(row.id) ? selected.filter(id => id !== row.id) : [...selected, row.id], row.id);
    else select([row.id], row.id);
  };
  const hasOwnMenu = !onRowContextMenu && !!contextActions && contextActions.length > 0;
  const openRowMenu = (row: MedicationRecord, x: number, y: number) => {
    if (!onRowContextMenu && !hasOwnMenu) return;
    const ids = selected.includes(row.id) ? selected : [row.id];
    if (!selected.includes(row.id)) select([row.id], row.id);
    const rows = medications.filter(m => ids.includes(m.id));
    if (onRowContextMenu) onRowContextMenu(rows, { x, y });
    else {
      rowMenuReturn.current = itemRefs.current.get(`r:${row.id}`) ?? null;
      setRowMenu({ x, y, rows });
    }
  };
  // Static menu order (MEDv-132): information, direct actions, actions that add information (MEDv-133); "Details..." first (MEDv-135).
  const menuActions: MedicationContextAction[] = React.useMemo(() => {
    if (!contextActions) return [];
    const hasDetails = contextActions.some(a => /^details/i.test(a.label));
    const all = hasDetails ? contextActions : [{ id: 'details', label: 'Details...', group: 'information' as const, isEnabled: (r: MedicationRecord[]) => r.length === 1 }, ...contextActions];
    const order = { information: 0, direct: 1, addInformation: 2 };
    return all.map((a, i) => ({ a, i })).sort((x, y) => order[x.a.group] - order[y.a.group] || x.i - y.i).map(x => x.a);
  }, [contextActions]);
  const runAction = (action: MedicationContextAction, rows: MedicationRecord[]) => {
    // More than one medication: show a summary before completing (MEDv-203).
    if (rows.length > 1) setSummary({ action, rows });
    else onAction?.(action.id, rows);
  };

  const toggleGroup = (key: string, collapse?: boolean) => {
    const isCollapsed = vs.collapsed.includes(key);
    const next = collapse ?? !isCollapsed;
    patch({ collapsed: next ? Array.from(new Set([...vs.collapsed, key])) : vs.collapsed.filter(k => k !== key) });
  };

  const focusItem = (key: string | undefined) => {
    if (!key) return;
    setFocusKey(key);
    const el = itemRefs.current.get(key);
    el?.focus();
  };

  const onItemKeyDown = (e: React.KeyboardEvent, it: Item) => {
    const k = itemKey(it);
    const i = keys.indexOf(k);
    const move = (to: number) => {
      const nk = keys[Math.max(0, Math.min(keys.length - 1, to))];
      focusItem(nk);
      return nk;
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nk = move(i + (e.key === 'ArrowDown' ? 1 : -1));
      if (e.shiftKey && nk.startsWith('r:')) {
        const id = nk.slice(2);
        select(rangeIds(anchorId ?? (it.type === 'row' ? it.row.id : null), id));
      }
    } else if (e.key === 'Home') { e.preventDefault(); move(0); }
    else if (e.key === 'End') { e.preventDefault(); move(keys.length - 1); }
    else if (it.type === 'heading') {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(it.key); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); toggleGroup(it.key, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); toggleGroup(it.key, false); }
      else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        e.preventDefault();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        headingFocusRef.current = e.currentTarget as HTMLElement;
        setHeadingMenu({ x: r.left + 24, y: r.bottom, key: it.key });
      }
    } else {
      const row = it.row;
      if (e.key === ' ') {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) select(selected.includes(row.id) ? selected.filter(id => id !== row.id) : [...selected, row.id], row.id);
        else select([row.id], row.id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onRowActivate?.(row);
      } else if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        e.preventDefault();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        openRowMenu(row, r.left + 24, r.bottom);
      }
    }
  };

  const onSortClick = (key: MedicationSortKey) => {
    // Click sorts; clicking the active column reverses (MEDv-101/102).
    patch({ sort: vs.sort.key === key ? { key, direction: vs.sort.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: SORT_DEFAULT_DIR[key] } });
  };

  // Keep the selection visible after sort or grouping changes (MEDv-125); otherwise show the top so a group heading is visible (MEDv-193).
  const layoutKey = `${view}|${vs.groupBy}|${vs.sort.key}|${vs.sort.direction}`;
  const lastLayout = React.useRef(layoutKey);
  React.useLayoutEffect(() => {
    if (lastLayout.current === layoutKey) return;
    const groupChanged = lastLayout.current.split('|')[1] !== vs.groupBy || lastLayout.current.split('|')[0] !== view;
    lastLayout.current = layoutKey;
    const sel = selected.find(id => itemRefs.current.has(`r:${id}`));
    const sc = scrollRef.current;
    if (sel) {
      const el = itemRefs.current.get(`r:${sel}`);
      if (el && sc) {
        const head = headRef.current?.offsetHeight ?? 0;
        const foot = footRef.current?.offsetHeight ?? 0;
        const top = el.offsetTop - head;
        if (el.offsetTop < sc.scrollTop + head || el.offsetTop + el.offsetHeight > sc.scrollTop + sc.clientHeight - foot) sc.scrollTop = Math.max(0, top - 8);
      }
    } else if (groupChanged && sc) sc.scrollTop = 0;
  });

  // ---- Look-ahead notifications (MEDv-177 to MEDv-189) ----
  const [lasb, setLasb] = React.useState<{ top: MedicationLookAheadToken[]; bottom: MedicationLookAheadToken[] }>({ top: [], bottom: [] });
  const computeLasb = React.useCallback(() => {
    const sc = scrollRef.current;
    if (!sc || !lookAhead) return;
    const scRect = sc.getBoundingClientRect();
    const vpTop = scRect.top + (headRef.current?.offsetHeight ?? 0);
    const vpBottom = scRect.top + sc.clientHeight - (footRef.current?.offsetHeight ?? 0);
    const above: MedicationLookAheadEntry[] = [];
    const below: MedicationLookAheadEntry[] = [];
    for (const it of items) {
      if (it.type === 'heading') {
        if (!it.collapsed) continue;
        // Rows of a collapsed group out of view are still listed (MEDv-181).
        const el = itemRefs.current.get(itemKey(it));
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const entries = it.rows.map(row => ({ id: row.id, label: drugName(row), hasAlert: row.hasAlert }));
        if (r.bottom <= vpTop + 1) above.push(...entries);
        else if (r.top >= vpBottom - 1) below.push(...entries);
        continue;
      }
      const el = itemRefs.current.get(itemKey(it));
      const name = el?.querySelector('[data-medication-name]') as HTMLElement | null;
      if (!name) continue;
      const r = name.getBoundingClientRect();
      // Ignore ascenders and descenders: inset the text box (MEDv-183) [suggested 20% of a line].
      const inset = Math.min(4, r.height * 0.2);
      const entry = { id: it.row.id, label: drugName(it.row), hasAlert: it.row.hasAlert };
      if (r.top + inset < vpTop) above.push(entry);
      else if (r.bottom - inset > vpBottom) below.push(entry);
    }
    const strip = footRef.current?.querySelector('.cui-medications-list__lasb') as HTMLElement | null;
    const cs = strip ? getComputedStyle(strip) : null;
    const family = cs?.fontFamily ?? 'sans-serif';
    const size = cs?.fontSize ?? '12px';
    const avail = (strip?.clientWidth ?? 600) - 24;
    const opts = {
      mode: (isPast ? 'countOnly' : 'names') as 'names' | 'countOnly',
      availableWidth: avail,
      measure: (t: string, bold: boolean) => measureText(t, `${bold ? 700 : 400} ${size} ${family}`) + 1,
      delimiterWidth: measureText(' ● ', `400 ${size} ${family}`) + 1,
      alertWidth: 18,
    };
    const next = {
      top: medicationLookAheadTokens([...above].reverse(), opts),
      bottom: medicationLookAheadTokens(below, opts),
    };
    setLasb(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [items, lookAhead, isPast, region, tallMan]);

  const computeRef = React.useRef(computeLasb);
  computeRef.current = computeLasb;
  React.useLayoutEffect(() => { computeLasb(); });
  React.useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const on = () => computeRef.current();
    sc.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(on) : null;
    ro?.observe(sc);
    return () => { sc.removeEventListener('scroll', on); window.removeEventListener('resize', on); ro?.disconnect(); };
  }, []);

  const colCount = cols.length;
  const emptyText = isPast
    ? emptyMessages?.past ?? 'There are no past medications for this patient'
    : emptyMessages?.current ?? 'There are no current medications for this patient';

  const renderCell = (c: Col, row: MedicationRecord) => {
    switch (c.key) {
      case 'drugDetails':
        return (
          <td key={c.key} data-label={c.heading} className="cui-medications-list__drug">
            <MedicationLine
              {...row.line}
              region={region}
              tallManLettering={tallMan}
              layout={level?.lineLayout ?? 'sentence'}
              lineBreaks={level?.lineBreaks}
              icons={
                showRowAlerts && row.hasAlert ? (
                  <>
                    {row.icons}
                    {row.icons ? ' ' : null}
                    <span className="cui-medications-list__row-alert">
                      <Icon name="warning" label={row.alertLabel ?? 'Decision support alert'} />
                    </span>
                  </>
                ) : row.icons
              }
            />
          </td>
        );
      case 'status':
        return (
          <td key={c.key} data-label={c.heading} className="cui-medications-list__status">
            <MedicationStatusText status={row.status} suspendedOn={row.suspendedOn} supplement={level?.showStatusSupplement === false ? undefined : row.statusSupplement} />
          </td>
        );
      case 'startDate':
      case 'endDate': {
        const v = c.key === 'startDate' ? row.startDate : row.endDate;
        return (
          <td key={c.key} data-label={c.heading} className="cui-medications-list__date">
            {v ? formatShortDate(v) : <span className="cui-medications-list__none">Not recorded</span>}
          </td>
        );
      }
    }
  };

  return (
    <div className={cx('cui-medications-list', isPast && 'cui-medications-list--past', className)}>
      <div className="cui-medications-list__toolbar" role="toolbar" aria-label={`${label} view options`}>
        <div className="cui-medications-list__toggle" role="group" aria-label="Current or past medications">
          <button
            type="button"
            className={cx('cui-medications-list__view-btn', !isPast && 'is-selected')}
            aria-pressed={!isPast}
            onClick={() => setView('current')}
          >
            {!isPast ? <Icon name="check" size={16} /> : null}
            Current
          </button>
          <span className={cx('cui-medications-list__split', isPast && 'is-selected')}>
            <button
              type="button"
              className={cx('cui-medications-list__view-btn', 'cui-medications-list__view-btn--past', isPast && 'is-selected')}
              aria-pressed={isPast}
              onClick={() => setView('past')}
            >
              {isPast ? <Icon name="check" size={16} /> : null}
              Past
            </button>
            <button
              ref={filterBtn}
              type="button"
              className={cx('cui-medications-list__filter-btn', isPast && 'is-selected')}
              aria-haspopup="menu"
              aria-expanded={filterMenu}
              aria-label={`Past medications filter: ${activeFilter?.label ?? ''}`}
              onClick={() => setFilterMenu(o => !o)}
              onKeyDown={e => { if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); setFilterMenu(true); } }}
            >
              <Icon name="chevron-down" size={16} />
            </button>
            {filterMenu ? (
              <MedicationsMenu
                label="Past medications filter"
                radio
                items={pastFilters.map(f => ({ id: f.id, label: f.label, checked: f.id === pastFilterId }))}
                onSelect={id => { setPastFilterId(id); setView('past'); }}
                onClose={() => setFilterMenu(false)}
                returnFocusTo={filterBtn}
                className="cui-medications-list__filter-menu"
              />
            ) : null}
          </span>
        </div>
        <label className="cui-medications-list__groupby">
          <span className="cui-medications-list__groupby-label">Group by</span>
          <select value={vs.groupBy} onChange={e => patch({ groupBy: e.target.value, collapsed: [] })}>
            <option value="none">None</option>
            {groupingOptions.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </label>
        {levels ? (
          <label className="cui-medications-list__groupby cui-medications-list__detail">
            <span className="cui-medications-list__groupby-label">Detail</span>
            <select value={level?.id} onChange={e => setLevelId(e.target.value)}>
              {levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </label>
        ) : null}
      </div>

      {/* Groups that expand and collapse make the rows a tree (ARIA treegrid); without groups it is a plain grid. */}
      <div ref={scrollRef} className="cui-medications-list__scroll" style={{ maxHeight }}>
        <table
          className="cui-medications-list__table"
          role={grouped ? 'treegrid' : 'grid'}
          aria-multiselectable="true"
          aria-label={`${isPast ? 'Past' : 'Current'} medications`}
          aria-describedby={`${uid}-hint`}
        >
          <colgroup>
            {cols.map(c => <col key={c.key} className={`cui-medications-list__col--${c.key}`} />)}
          </colgroup>
          <thead ref={headRef} className="cui-medications-list__head">
            <tr>
              {cols.map(c => {
                const active = vs.sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (vs.sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={cx(active && 'is-sorted')}
                  >
                    <button type="button" className="cui-medications-list__sort" onClick={() => onSortClick(c.key)}>
                      {c.heading}
                      {active ? (
                        <>
                          <Icon name={vs.sort.direction === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} />
                          <VisuallyHidden>{vs.sort.direction === 'asc' ? ', sorted ascending' : ', sorted descending'}</VisuallyHidden>
                        </>
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
            {filterText ? (
              <tr className="cui-medications-list__notice-row cui-medications-list__notice-row--filter">
                <td colSpan={colCount}>
                  <span className="cui-medications-list__notice" role="status">
                    <Icon name="filter" size={16} />
                    <span>{filterText}</span>
                    <button type="button" className="cui-medications-list__notice-action" onClick={() => setPastFilterId(allFilterId)}>
                      Remove Filter
                    </button>
                  </span>
                </td>
              </tr>
            ) : null}
            {lookAhead ? (
              <tr className="cui-medications-list__lasb-row">
                <td colSpan={colCount}>
                  <LookAheadStrip tokens={lasb.top} position="top" mode={isPast ? 'countOnly' : 'names'} />
                </td>
              </tr>
            ) : null}
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr className="cui-medications-list__empty-row">
                <td colSpan={colCount}>{emptyText}</td>
              </tr>
            ) : null}
            {items.map(it => {
              const k = itemKey(it);
              if (it.type === 'heading') {
                return (
                  <tr
                    key={k}
                    ref={el => { if (el) itemRefs.current.set(k, el); else itemRefs.current.delete(k); }}
                    className="cui-medications-list__group"
                    aria-level={1}
                    aria-expanded={!it.collapsed}
                    tabIndex={tabKey === k ? 0 : -1}
                    onFocus={() => setFocusKey(k)}
                    onClick={() => toggleGroup(it.key)}
                    onKeyDown={e => onItemKeyDown(e, it)}
                    onContextMenu={e => { e.preventDefault(); headingFocusRef.current = e.currentTarget; setHeadingMenu({ x: e.clientX, y: e.clientY, key: it.key }); }}
                  >
                    <th colSpan={colCount} scope="rowgroup">
                      <span className="cui-medications-list__group-toggle" aria-hidden="true">
                        <Icon name={it.collapsed ? 'chevron-right' : 'chevron-down'} size={16} />
                      </span>
                      {it.label}
                      {it.collapsed ? <span className="cui-medications-list__group-count"> ({it.count})</span> : null}
                      <VisuallyHidden>{it.collapsed ? ', collapsed' : `, ${it.count} medication${it.count === 1 ? '' : 's'}`}</VisuallyHidden>
                    </th>
                  </tr>
                );
              }
              const row = it.row;
              const isSel = selected.includes(row.id);
              return (
                <tr
                  key={k}
                  ref={el => { if (el) itemRefs.current.set(k, el); else itemRefs.current.delete(k); }}
                  className={cx(
                    'cui-medications-list__row',
                    it.shaded && 'is-shaded',
                    isSel && 'is-selected',
                    row.status === 'Suspended' && 'is-suspended',
                  )}
                  aria-selected={isSel}
                  aria-level={grouped ? 2 : undefined}
                  tabIndex={tabKey === k ? 0 : -1}
                  onFocus={() => setFocusKey(k)}
                  onClick={e => onRowClick(e, row)}
                  onDoubleClick={() => onRowActivate?.(row)}
                  onKeyDown={e => onItemKeyDown(e, it)}
                  onContextMenu={onRowContextMenu || hasOwnMenu ? e => { e.preventDefault(); openRowMenu(row, e.clientX, e.clientY); } : undefined}
                >
                  {cols.map(c => renderCell(c, row))}
                </tr>
              );
            })}
            {recentPast ? (
              <tr className="cui-medications-list__notice-row cui-medications-list__notice-row--recent">
                <td colSpan={colCount}>
                  <span className="cui-medications-list__notice">
                    <Icon name="history" size={16} />
                    <span>{recentPast}</span>
                  </span>
                </td>
              </tr>
            ) : null}
            {/* One line of blank space at the end of the list (MEDv-142). */}
            <tr className="cui-medications-list__end" aria-hidden="true">
              <td colSpan={colCount} />
            </tr>
          </tbody>
          {lookAhead ? (
            <tfoot ref={footRef} className="cui-medications-list__foot">
              <tr className="cui-medications-list__lasb-row">
                <td colSpan={colCount}>
                  <LookAheadStrip tokens={lasb.bottom} position="bottom" mode={isPast ? 'countOnly' : 'names'} />
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {headingMenu ? (
        <MedicationsMenu
          label="Group options"
          items={[{ id: 'collapse', label: 'Collapse All Groups' }, { id: 'expand', label: 'Expand All Groups' }]}
          onSelect={id => patch({ collapsed: id === 'collapse' ? items.filter(i => i.type === 'heading').map(i => (i as { key: string }).key) : [] })}
          onClose={() => setHeadingMenu(null)}
          returnFocusTo={headingFocusRef as React.RefObject<HTMLElement | null>}
          className="cui-medications-list__context-menu"
          style={{ position: 'fixed', left: headingMenu.x, top: headingMenu.y }}
        />
      ) : null}
      {rowMenu ? (
        <MedicationsMenu
          label="Medication actions"
          items={menuActions.map((a, i) => ({
            id: a.id,
            label: a.label,
            // Unavailable for any selected row: greyed out, still visible (MEDv-131).
            disabled: a.isEnabled ? !a.isEnabled(rowMenu.rows) : false,
            separatorBefore: i > 0 && menuActions[i - 1].group !== a.group,
          }))}
          onSelect={id => {
            const action = menuActions.find(a => a.id === id);
            if (action) runAction(action, rowMenu.rows);
          }}
          onClose={() => setRowMenu(null)}
          returnFocusTo={rowMenuReturn as React.RefObject<HTMLElement | null>}
          className="cui-medications-list__context-menu"
          style={{ position: 'fixed', left: rowMenu.x, top: rowMenu.y }}
        />
      ) : null}
      {summary ? (
        <MedicationActionSummaryDialog
          actionLabel={summary.action.summaryVerb ?? summary.action.label.replace(/\.+$/, '')}
          medications={summary.rows}
          region={region}
          confirmVariant={summary.action.destructive ? 'danger' : 'primary'}
          onCancel={() => setSummary(null)}
          onConfirm={() => { const s0 = summary; setSummary(null); onAction?.(s0.action.id, s0.rows); }}
        />
      ) : null}
      <span id={`${uid}-hint`} hidden>
        Use arrow keys to move, Space to select, Ctrl+Space to add to the selection, Shift+arrow to extend.
      </span>
    </div>
  );
}
