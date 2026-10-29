import React from 'react';
import { Button, Icon, cx, formatDateTime, formatShortDate, toDate, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike } from '../../core';
import { SortIndicator } from '../SortIndicator/SortIndicator';
import { FilterNotification } from '../FilterNotification/FilterNotification';
import { evaluateFilter } from '../utils/filter';
import { groupRows, listSortOrderLabels, progressiveSort } from '../utils/sortGroup';
import { findDuplicateNames, type PatientListNameMatch } from '../utils/patientListName';
import type { ListAttribute, ListDataType, ListFilterCriterion, ListFilterState, ListSortKey } from '../utils/listTypes';
import { PatientIdentificationCell, type PatientListPatient } from '../PatientIdentificationCell/PatientIdentificationCell';
import { HeaderCellFilter } from '../HeaderCellFilter/HeaderCellFilter';
import { listRegionalPatientName, listNamesDifferOnlyByDiacritics } from '../utils/regions/patientIdentification';
import { listAutoWidenColumns, listLongestWordWidth } from '../utils/columnWidth';
import { listMeasureText } from '../shared/measure';
import { UpdateMarker } from '../UpdateMarker/UpdateMarker';
import { SubList } from '../SubList/SubList';
import { HistoricalSnapshotBanner } from '../HistoricalSnapshotBanner/HistoricalSnapshotBanner';
import { ListSearch, SearchHighlight, SearchMatchNote, listSearchLabel } from '../../search/ListSearch/ListSearch';
import { useListSearch } from '../../search/ListSearch/useListSearch';
import { listSearchFields } from '../../search/utils/listSearchFields';
import { smartHitRanges, smartMatchNote, type SmartFieldKind, type SmartFieldValue, type SmartSearchField } from '../../search/utils/smartSearch';

export type { PatientListPatient } from '../PatientIdentificationCell/PatientIdentificationCell';

/** A column definition. */
export interface PatientListColumn<T> {
  /** Stable id; also the default property read from each row. */
  id: string;
  /** Header title. Wraps, never truncated (PAL-0120/0150). */
  title: string;
  /** Unit shown in the header (FSG-0014). Never mix units in a column (FSG-0013). */
  unit?: string;
  /** Header and data alignment, kept the same (PAL-0140). Default 'left'. */
  align?: 'left' | 'center' | 'right';
  /** FSG data type: drives filter operators and sort order words. Default 'string'. */
  dataType?: ListDataType;
  /**
   * 'patient' renders the identification cell (PAL-0450). 'location' (bed) and 'time' (appointment) are row key
   * identifiers and the default sort (PAL-0650/0690). Key columns are frozen at the left and cannot be hidden (PAL-0610..0620, 0720).
   */
  kind?: 'data' | 'patient' | 'location' | 'time';
  /** Mark another column as a row key identifier (PAL-0580). */
  isRowKey?: boolean;
  /** Value used for sorting, filtering and grouping. Defaults to row[id]. */
  getValue?: (row: T) => unknown;
  /** Custom cell content. Defaults to the value as text (dates use the CUI date format). */
  render?: (row: T) => React.ReactNode;
  /** Render the cell as a sublist: one item per sub-row, never truncated (PAL-0390..0410). */
  sublist?: (row: T) => React.ReactNode[];
  /** Ordinal order (FSG-0112) or value set. */
  options?: string[];
  /** Initial width in px. */
  width?: number;
  /** Minimum width when resizing. Default 64. */
  minWidth?: number;
  /** The list search reads this column: a shown column unless false, a hidden one only when true [suggested]. */
  searchable?: boolean;
  /** How the search compares its values. Default: names for the patient column, dates by data type, else words. */
  searchKind?: SmartFieldKind;
  /** The values the search reads when the cell value is not text. */
  searchValue?: (row: T) => SmartFieldValue;
}

/** An update to mark for the user (PAL-0880..0950). Marks are per user (PAL-0970): keep them in your user's state. */
export interface PatientListUpdate {
  id: string;
  rowKey: string;
  /** Updated cell. Omit to mark a newly added patient: the whole row is marked (PAL-0940). */
  columnId?: string;
  /** Mark one sublist entry only (PAL-0900). */
  sublistIndex?: number;
  /** Number of sublist items removed: shows "3 items removed" at the end of the sublist (PAL-0920). */
  removedCount?: number;
  /** The cell's content was removed: shows "Item removed" in the cell (PAL-0910). */
  cellRemoved?: boolean;
}

export interface PatientListProps<T> {
  /** List title in the header. Default "Patient list". */
  title?: string;
  /** Heading level of the title, so the list nests under a page section's own heading [suggested]. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** Who the list is for, e.g. "Dr Maxhurst", "Mr Crossley, Mr Argos", "Physiotherapists" (PAL-0040, 0050..0070). */
  listFor?: string;
  /** Service provided, e.g. "Respiratory medicine" (PAL-0040). */
  service?: string;
  /** Locations, uniquely identified, e.g. ["Ward 3, North wing"] or ["All Wards"] (PAL-0080/0090). */
  locations?: string[];
  /** Time the list was last updated, or the current time for real-time lists (PAL-0040/0100). */
  timestamp: DateLike;
  /** Which time `timestamp` is. Default 'lastUpdated'. */
  timestampKind?: 'lastUpdated' | 'current';
  /** Inclusion criteria shown under the title, e.g. "All surgical patients" (handover RID 144). */
  inclusionCriteria?: string;
  /**
   * Historical list for a past point in time: distinct colour scheme and the word "Historical" (PAL-1010/1020).
   * Never show a historical and a current list at the same time (PAL-1030).
   */
  historical?: boolean;
  /** Column definitions in default order. */
  columns: PatientListColumn<T>[];
  /** One patient (or location) per row (PAL-0280). */
  rows: T[];
  /** Stable unique key for each row (PAL-0580). */
  getRowKey: (row: T) => string;
  /** Patient for the identification column; return null for an unoccupied location (PAL-0660). */
  getPatient?: (row: T) => PatientListPatient | null;
  /**
   * Custom content for the patient column [suggested]: the host renders the identification cell itself (for example
   * `PatientIdentificationCell` with `nameHref`, or a local extension such as a preferred name) and receives the
   * name match the list found (PAL-0540..0570), so the identical and similar name warning is never lost. Sorting,
   * filtering and the name check still use `getPatient`. Default: `PatientIdentificationCell`.
   */
  renderPatient?: (row: T, cell: { patient: PatientListPatient | null; match: PatientListNameMatch | null }) => React.ReactNode;
  /**
   * The patient's own id, for a list where one patient can have several rows (a person under two teams) [suggested].
   * Rows of the same patient are never warned against each other as identical names (PAL-0540).
   */
  getPatientId?: (row: T) => string;
  /** Plural noun for rows, used in messages. Default "patients". */
  rowNoun?: string;
  /** Singular noun for one row ("person" for "people") [suggested]. Default `rowNoun` without its final "s". */
  rowNounSingular?: string;
  /** Ids of displayed columns in display order (PAL-0710). Key columns are always shown first (PAL-0720). */
  visibleColumnIds?: string[];
  /** Controlled sort keys (FSG-0121). */
  sort?: ListSortKey[];
  /** Initial sort. Default: location or time column first (PAL-0650/0690). */
  defaultSort?: ListSortKey[];
  /** Called when the user clicks a header to sort (FSG-0087). */
  onSortChange?: (sort: ListSortKey[]) => void;
  /** Active filter (FSG 3.6). Filtered-out rows are not shown (FSG-0064). */
  filter?: ListFilterState | null;
  /** Called with null when the user removes all filters from the notification. */
  onFilterChange?: (filter: ListFilterState | null) => void;
  /** Column id to group by, or null (FSG 3.8). */
  groupBy?: string | null;
  /** Hide unoccupied locations until they are occupied (PAL-0670). Default false. */
  hideUnoccupied?: boolean;
  /** Updates marked for viewing (PAL-0840..0950). */
  updates?: PatientListUpdate[];
  /** Unmark individual updates (PAL-0930). */
  onUnmark?: (updateIds: string[]) => void;
  /** Ask for confirmation before "Unmark all" (PAL-0980). Default true. */
  confirmUnmarkAll?: boolean;
  /** Called when the user ticks "Do not ask again" on the unmark-all confirmation (PAL-0980). */
  onSuppressUnmarkConfirm?: () => void;
  /** Real-time list (PAL-0810). When false the bar shows time since refresh and a Refresh control (PAL-0860/0870). Default true. */
  realTime?: boolean;
  /** Last refresh time for non-real-time lists. */
  lastRefreshed?: DateLike;
  /** Automatic refresh interval communicated to users, e.g. "every 5 minutes" (PAL-0830). */
  refreshIntervalLabel?: string;
  /** Refresh from source (PAL-0800). */
  onRefresh?: () => void;
  /** Clock used for elapsed time. Default: the system clock. */
  now?: DateLike;
  /** Show the columns-out-of-view indicator (PAL-0240..0260). Default true. */
  showOutOfViewMessage?: boolean;
  /** Called when the user hides the out-of-view indicator until the next session (PAL-0260). */
  onDismissOutOfViewMessage?: () => void;
  /** Row selection. Default 'single'. */
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Open the patient (Enter or double-click). Must replace the list view, never a side panel (PAL-1040/1050). */
  onOpenRow?: (row: T) => void;
  /** Header context menu (right-click or Shift+F10): Filter, Sort, Group by (FSG-0004). */
  onHeaderCommand?: (command: 'filter' | 'sort' | 'groupBy', columnId: string) => void;
  /** Controlled column widths in px (PAL-0200: persist them between sessions). */
  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  /** Similar-name test for PAL-0560 (e.g. a phonetic match). Identical names are always detected. */
  similarNames?: (a: PatientListPatient, b: PatientListPatient) => boolean;
  /** Toolbar slot, e.g. a DataToolbar, placed above the notifications. */
  toolbar?: React.ReactNode;
  /** Maximum height of the scrolling viewport. Default 480. */
  maxHeight?: number | string;
  /**
   * Jurisdiction; otherwise read from ClinicalLocaleProvider. Sets the identification cell's identifier (GB NHS No.,
   * AU IHI then URN, NZ NHI), name case (NZ as recorded) and single-name display (G10 1.6, 3.3; G11 1.3, 2.3).
   */
  region?: ClinicalRegion;
  /** AU: show dates of birth as DD/MM/YYYY to match the wristband (AU-PI-03). Default 'cui'. */
  dateOfBirthFormat?: 'cui' | 'numeric';
  /** AU: label for the hospital record number (AU-ID-04). Default "URN". */
  mrnLabel?: string;
  /**
   * "Filter" in the header context menu shows operator and value controls in the header cell for that column
   * (FSG-0012, 0033, 0034); its "Custom…" option calls `onHeaderCommand('filter', columnId)` to open the full dialog
   * (FSG-0037/0038). Requires `onFilterChange`. Default false.
   */
  headerFilter?: boolean;
  /** Widen a resized column automatically when updated content no longer fits its longest word (PAL-0270). Default true. */
  autoWidenColumns?: boolean;
  /**
   * The list search box above the toolbar [suggested]: names in either order, close spellings and similar-sounding
   * names, the record number and other identifiers, dates of birth ("born:1980"), and the columns as scopes. 'auto'
   * (default) shows it once the list has 8 rows or more; true always; false never.
   */
  search?: boolean | 'auto';
  /** The search text, controlled. Never put a search for people in a URL: keep it in component state. */
  searchQuery?: string;
  defaultSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  /** Further values the search reads (other names, other identifiers). */
  searchFields?: SmartSearchField<T>[];
  className?: string;
}

type FlatRow<T> =
  | { type: 'group'; key: string; label: string; count: number; expanded: boolean }
  | { type: 'data'; key: string; row: T; band: number };

const isKey = <T,>(c: PatientListColumn<T>) => c.isRowKey || c.kind === 'patient' || c.kind === 'location' || c.kind === 'time';

function useNow(now: DateLike | undefined, active: boolean): number {
  const [tick, setTick] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (now !== undefined || !active) return;
    const t = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [now, active]);
  return now !== undefined ? toDate(now)?.getTime() ?? tick : tick;
}

function elapsedText(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 1) return 'less than a minute ago';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  return `${h} hour${h === 1 ? '' : 's'} ago`;
}

function defaultCellText(v: unknown, type: ListDataType, timeZone?: string): string {
  if (v === null || v === undefined || v === '') return '';
  if (type === 'date') return formatShortDate(v as DateLike, { timeZone });
  if (type === 'dateTime') return formatDateTime(v as DateLike, { timeZone });
  return String(v);
}

/**
 * Turn PatientList column definitions into the attribute list that FilterDialog, SortDialog, FilterNotification,
 * DataToolbar and the filter and sort utilities take, exactly as PatientList builds it internally. A 'patient'
 * column without its own `getValue` filters and sorts by the displayed regional name when `getPatient` is given
 * (PAL-0520; G10 1.6, G11 1.3).
 */
export function patientListAttributes<T>(
  columns: PatientListColumn<T>[],
  opts: { getPatient?: (row: T) => PatientListPatient | null; region?: ClinicalRegion } = {},
): ListAttribute<T>[] {
  const { getPatient, region = 'GB' } = opts;
  return columns.map(c => ({
    id: c.id,
    label: c.title,
    dataType: c.dataType ?? 'string',
    options: c.options,
    unit: c.unit,
    getValue:
      c.getValue ??
      (c.kind === 'patient' && getPatient
        ? (row: T) => {
            const p = getPatient(row);
            return p ? listRegionalPatientName(p, region) : null;
          }
        : undefined),
  }));
}

/**
 * Multi-patient list (PAL guidance): header, sticky column headers, frozen row key identifiers, patient
 * identification cells, sorting, grouping, filtering, sublists, update marking and keyboard navigation.
 */
export function PatientList<T>(props: PatientListProps<T>) {
  const {
    title = 'Patient list', headingLevel = 2, listFor, service, locations, timestamp, timestampKind = 'lastUpdated', inclusionCriteria, historical,
    columns, rows, getRowKey, getPatient, rowNoun = 'patients', visibleColumnIds, onSortChange, filter, onFilterChange,
    groupBy, hideUnoccupied, updates = [], onUnmark, confirmUnmarkAll = true, onSuppressUnmarkConfirm, realTime = true,
    lastRefreshed, refreshIntervalLabel, onRefresh, now, showOutOfViewMessage = true, onDismissOutOfViewMessage,
    selectionMode = 'single', onOpenRow, onHeaderCommand, similarNames, toolbar, maxHeight = 480, className,
    dateOfBirthFormat, mrnLabel, headerFilter = false, autoWidenColumns = true, search = 'auto', searchFields,
  } = props;
  const { region, displayTimeZone: timeZone } = useClinicalLocale(props.region);
  const baseId = useId('cui-pl');
  const nowMs = useNow(now, !realTime);

  // ---------- columns ----------
  const attrs = React.useMemo<ListAttribute<T>[]>(() => patientListAttributes(columns, { getPatient, region }), [columns, getPatient, region]);

  const autoSort = React.useMemo<ListSortKey[]>(() => {
    const loc = columns.find(c => c.kind === 'location') ?? columns.find(c => c.kind === 'time');
    return loc ? [{ attributeId: loc.id, direction: 'asc' }] : [];
  }, [columns]);
  const [sort, setSort] = useControllableState<ListSortKey[]>(props.sort, props.defaultSort ?? autoSort, onSortChange);

  const shownColumns = React.useMemo(() => {
    const byId = new Map(columns.map(c => [c.id, c]));
    const keys = columns.filter(isKey);
    const ids = visibleColumnIds ?? columns.map(c => c.id);
    const rest = ids.map(id => byId.get(id)).filter((c): c is PatientListColumn<T> => !!c && !isKey(c));
    // Sorting by a hidden column adds it at the right-hand end (FSG-0098).
    for (const k of sort) {
      const c = byId.get(k.attributeId);
      if (c && !isKey(c) && !rest.includes(c)) rest.push(c);
    }
    return [...keys, ...rest];
  }, [columns, visibleColumnIds, sort]);

  // ---------- search: the patient's names, identifiers and date of birth, then the columns ----------
  const [queryRaw, setQuery] = useControllableState<string>(props.searchQuery, props.defaultSearchQuery ?? '', props.onSearchQueryChange);
  const query = queryRaw ?? '';
  const searchShown = search === true || (search === 'auto' && (rows.length >= 8 || !!query.trim()));
  const fields = React.useMemo<SmartSearchField<T>[]>(() => {
    const person = (row: T) => (getPatient ? getPatient(row) : null);
    const cols = columns.map(c =>
      c.kind === 'patient' && !c.searchValue
        ? {
            ...c,
            searchKind: c.searchKind ?? ('name' as const),
            searchValue: (row: T): SmartFieldValue => {
              const p = person(row);
              if (!p) return null;
              const legal = [p.familyName, p.givenName].filter(Boolean).join(', ');
              return [legal || null, p.preferredName ? { text: p.preferredName, note: 'Preferred name' } : null];
            },
          }
        : c,
    );
    const ids: SmartSearchField<T>[] = getPatient
      ? [
          { key: 'born', label: 'Born', kind: 'date', scopeAliases: ['dob', 'birth'], get: row => (person(row)?.dateOfBirth ?? null) as SmartFieldValue },
          { key: 'mrn', label: mrnLabel ?? 'Record number', kind: 'identifier', scopeAliases: ['urn', 'record', 'number'], get: row => person(row)?.mrn ?? null },
          { key: 'identifier', label: 'Identifier', kind: 'identifier', scopeAliases: ['ihi', 'nhi', 'nhs'], get: row => {
            const p = person(row);
            return p ? [p.ihi, p.nhi, p.nhsNumber, p.temporaryNumber] : null;
          } },
        ]
      : [];
    return listSearchFields(cols, shownColumns.map(c => c.id), [...ids, ...(searchFields ?? [])]);
  }, [columns, shownColumns, searchFields, getPatient, mrnLabel]);
  const found = useListSearch(rows, fields, searchShown ? query : '');

  // ---------- data pipeline ----------
  const [filterView, setFilterView] = React.useState<'in' | 'out' | 'all'>('in');
  const filterResult = React.useMemo(() => evaluateFilter(found.rows, filter ?? null, attrs), [found.rows, filter, attrs]);
  const filterActive = filterResult.filteredOut.length > 0 || (filter?.criteria.some(c => c.operator) ?? false);
  const viewRows = filterView === 'out' ? filterResult.filteredOut : filterView === 'all' ? filterResult.all : filterResult.filteredIn;
  React.useEffect(() => {
    if (!filter) setFilterView('in');
  }, [filter]);

  const visibleRows = React.useMemo(() => {
    let r = viewRows;
    if (hideUnoccupied && getPatient) r = r.filter(row => getPatient(row) !== null);
    return found.rankOrder(progressiveSort(r, sort, attrs));
  }, [viewRows, hideUnoccupied, getPatient, sort, attrs, found]);

  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());
  React.useEffect(() => setCollapsed(new Set()), [groupBy]);
  const flat = React.useMemo<FlatRow<T>[]>(() => {
    const out: FlatRow<T>[] = [];
    let band = 0;
    const pushRows = (rs: T[]) => rs.forEach(row => out.push({ type: 'data', key: getRowKey(row), row, band: band++ % 2 }));
    if (groupBy && attrs.some(a => a.id === groupBy)) {
      for (const g of groupRows(visibleRows, groupBy, attrs)) {
        const expanded = !collapsed.has(g.key);
        out.push({ type: 'group', key: `g:${g.key}`, label: g.label, count: g.rows.length, expanded });
        if (expanded) pushRows(g.rows);
      }
    } else pushRows(visibleRows);
    return out;
  }, [visibleRows, groupBy, attrs, collapsed, getRowKey]);

  // ---------- duplicate names (PAL-0540..0570) ----------
  const nameMatches = React.useMemo(() => {
    if (!getPatient) return new Map<string, PatientListNameMatch>();
    const ids: Array<PatientListPatient & { id: string }> = [];
    const patientOf = new Map<string, string>();
    const getPatientId = props.getPatientId;
    rows.forEach(r => {
      const p = getPatient(r);
      if (!p) return;
      ids.push({ ...p, id: getRowKey(r) });
      if (getPatientId) patientOf.set(getRowKey(r), getPatientId(r));
    });
    const samePatient = getPatientId ? (a: { id: string }, b: { id: string }) => patientOf.get(a.id) === patientOf.get(b.id) : undefined;
    // AU and NZ: names differing only by macrons or diacritics are flagged as similar by default [suggested].
    const similar = similarNames
      ? (a: PatientListPatient, b: PatientListPatient) => similarNames(a, b)
      : region !== 'GB'
        ? listNamesDifferOnlyByDiacritics
        : undefined;
    return findDuplicateNames(ids, { ...(similar ? { similar } : {}), ...(samePatient ? { samePatient } : {}) });
  }, [rows, getPatient, getRowKey, similarNames, region, props.getPatientId]);

  // ---------- updates ----------
  const updateIndex = React.useMemo(() => {
    const m = new Map<string, PatientListUpdate[]>();
    for (const u of updates) {
      const k = `${u.rowKey}|${u.columnId ?? '*'}`;
      m.set(k, [...(m.get(k) ?? []), u]);
    }
    return m;
  }, [updates]);
  const cellUpdates = (rowKey: string, colId?: string) => updateIndex.get(`${rowKey}|${colId ?? '*'}`) ?? [];

  // ---------- selection ----------
  const [selected, setSelected] = useControllableState<string[]>(props.selectedKeys, props.defaultSelectedKeys ?? [], props.onSelectionChange);
  const toggleSelect = (key: string, additive: boolean) => {
    if (selectionMode === 'none') return;
    if (selectionMode === 'single' || !additive) setSelected(selected.length === 1 && selected[0] === key && additive ? [] : [key]);
    else setSelected(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  };

  // ---------- widths (PAL-0200..0230) ----------
  const [widths, setWidths] = useControllableState<Record<string, number> | null>(
    props.columnWidths,
    columns.some(c => c.width) ? Object.fromEntries(columns.filter(c => c.width).map(c => [c.id, c.width as number])) : null,
    w => w && props.onColumnWidthsChange?.(w),
  );
  const fixedLayout = !!widths && shownColumns.every(c => widths[c.id]);
  const thRefs = React.useRef(new Map<string, HTMLTableCellElement>());
  const resizeColumn = (colId: string, next: number) => {
    const base: Record<string, number> = { ...(widths ?? {}) };
    shownColumns.forEach(c => {
      if (!base[c.id]) base[c.id] = Math.round(thRefs.current.get(c.id)?.getBoundingClientRect().width ?? 120);
    });
    const col = shownColumns.find(c => c.id === colId);
    base[colId] = Math.max(col?.minWidth ?? 64, Math.round(next));
    setWidths(base);
  };
  const startResize = (e: React.PointerEvent, colId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = thRefs.current.get(colId)?.getBoundingClientRect().width ?? 120;
    const move = (ev: PointerEvent) => resizeColumn(colId, startW + ev.clientX - startX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // ---------- frozen key columns + scroll state ----------
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [frozenLeft, setFrozenLeft] = React.useState<Record<string, number>>({});
  const [headHeight, setHeadHeight] = React.useState(0);
  const [hScroll, setHScroll] = React.useState({ left: false, right: false });
  const [outOfViewUpdates, setOutOfViewUpdates] = React.useState(0);
  const keyCols = shownColumns.filter(isKey);
  const measure = React.useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let left = 0;
    const next: Record<string, number> = {};
    for (const c of keyCols) {
      next[c.id] = left;
      left += thRefs.current.get(c.id)?.getBoundingClientRect().width ?? 0;
    }
    setFrozenLeft(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    const thead = tableRef.current?.tHead;
    const hh = thead ? thead.getBoundingClientRect().height : 0;
    setHeadHeight(prev => (Math.abs(prev - hh) < 0.5 ? prev : hh));
    setHScroll(prev => {
      const n = { left: vp.scrollLeft > 1, right: vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 1 };
      return prev.left === n.left && prev.right === n.right ? prev : n;
    });
    // Updates out of view (PAL-0850): marks outside the visible, unfrozen part of the viewport.
    const vr = vp.getBoundingClientRect();
    const top = vr.top + hh;
    const leftEdge = vr.left + left;
    let count = 0;
    vp.querySelectorAll<HTMLElement>('[data-update-mark]').forEach(el => {
      const r = el.getBoundingClientRect();
      const frozen = el.closest('.cui-patient-list__cell--frozen');
      const outV = r.bottom <= top || r.top >= vr.bottom;
      const outH = !frozen && (r.right <= leftEdge || r.left >= vr.right);
      if (outV || outH) count++;
    });
    setOutOfViewUpdates(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyCols.map(c => c.id).join('|')]);
  React.useLayoutEffect(() => {
    measure();
  });
  React.useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(vp);
    if (tableRef.current) ro.observe(tableRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // ---------- keyboard grid navigation ----------
  const [focus, setFocus] = React.useState<{ r: number; c: number }>({ r: -1, c: 0 });
  const [gridHasFocus, setGridHasFocus] = React.useState(false);
  const pendingFocus = React.useRef(false);
  const rowCount = flat.length;
  const colCount = shownColumns.length;
  const clampFocus = (r: number, c: number) => ({ r: Math.max(-1, Math.min(rowCount - 1, r)), c: Math.max(0, Math.min(colCount - 1, c)) });
  const safeFocus = clampFocus(focus.r, focus.c);
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const el = tableRef.current?.querySelector<HTMLElement>(`[data-nav="${safeFocus.r}:${flat[safeFocus.r]?.type === 'group' ? 0 : safeFocus.c}"]`);
    el?.focus();
  });
  const moveTo = (r: number, c: number) => {
    pendingFocus.current = true;
    setFocus(clampFocus(r, c));
  };
  const toggleGroup = (key: string) =>
    setCollapsed(prev => {
      const n = new Set(prev);
      const k = key.slice(2);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const sortByColumn = (col: PatientListColumn<T>) => {
    const primary = sort[0];
    if (primary && primary.attributeId === col.id && sort.length === 1) {
      setSort([{ attributeId: col.id, direction: primary.direction === 'asc' ? 'desc' : 'asc' }]);
    } else {
      setSort([{ attributeId: col.id, direction: listSortOrderLabels(col.dataType ?? 'string', col.options).first }]);
    }
  };

  const [menu, setMenu] = React.useState<string | null>(null);
  const [cellFilter, setCellFilter] = React.useState<string | null>(null);
  const inlineFilter = headerFilter && !!onFilterChange;
  const menuEnabled = !!onHeaderCommand || inlineFilter;
  const menuItems: Array<'filter' | 'sort' | 'groupBy'> = onHeaderCommand ? ['filter', 'sort', 'groupBy'] : ['filter'];
  const onMenuSelect = (cmd: 'filter' | 'sort' | 'groupBy', colId: string) => {
    setMenu(null);
    if (cmd === 'filter' && inlineFilter) setCellFilter(colId);
    else onHeaderCommand?.(cmd, colId);
  };

  // ---------- automatic widening after updates (PAL-0270) ----------
  React.useLayoutEffect(() => {
    const table = tableRef.current;
    if (!autoWidenColumns || !widths || !table || typeof window === 'undefined') return;
    const required: Record<string, number> = {};
    const cells = Array.from(table.querySelectorAll<HTMLElement>('[data-col]'));
    for (const c of shownColumns) {
      if (!widths[c.id]) continue;
      let need = 0;
      for (const cell of cells) {
        if (cell.dataset.col !== c.id || cell.tagName === 'TH' && cell.closest('thead')) continue;
        const cs = window.getComputedStyle(cell);
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) + 2;
        const els = [cell, ...Array.from(cell.querySelectorAll<HTMLElement>('*'))];
        for (const el of els) {
          const text = Array.from(el.childNodes)
            .filter(n => n.nodeType === 3)
            .map(n => n.textContent ?? '')
            .join(' ');
          if (!text.trim()) continue;
          const font = window.getComputedStyle(el).font || undefined;
          need = Math.max(need, listLongestWordWidth(text, t => listMeasureText(t, font)) + pad);
        }
      }
      required[c.id] = need;
    }
    const next = listAutoWidenColumns(widths, required);
    if (next) setWidths(next);
    // Runs when the content changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, updates, autoWidenColumns]);

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    // A link or button inside a cell (the patient's name as a link) keeps its own Enter and Space [suggested].
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement).closest('a[href], button:not(.cui-patient-list__group-toggle), input, select, textarea')) return;
    const { r, c } = safeFocus;
    const item = r >= 0 ? flat[r] : undefined;
    const ctrl = e.ctrlKey || e.metaKey;
    switch (e.key) {
      case 'ArrowDown':
        moveTo(r + 1, c);
        break;
      case 'ArrowUp':
        moveTo(r - 1, c);
        break;
      case 'ArrowRight':
        if (item?.type === 'group' && !item.expanded) toggleGroup(item.key);
        else if (r === -1 && e.altKey) resizeColumn(shownColumns[c].id, (thRefs.current.get(shownColumns[c].id)?.getBoundingClientRect().width ?? 120) + 16);
        else moveTo(r, c + 1);
        break;
      case 'ArrowLeft':
        if (item?.type === 'group' && item.expanded) toggleGroup(item.key);
        else if (r === -1 && e.altKey) resizeColumn(shownColumns[c].id, (thRefs.current.get(shownColumns[c].id)?.getBoundingClientRect().width ?? 120) - 16);
        else moveTo(r, c - 1);
        break;
      case 'Home':
        moveTo(ctrl ? 0 : r, 0);
        break;
      case 'End':
        moveTo(ctrl ? rowCount - 1 : r, colCount - 1);
        break;
      case 'PageDown':
        moveTo(r + 10, c);
        break;
      case 'PageUp':
        moveTo(r - 10, c);
        break;
      case 'Enter':
        if (r === -1) sortByColumn(shownColumns[c]);
        else if (item?.type === 'group') toggleGroup(item.key);
        else if (item?.type === 'data') onOpenRow?.(item.row);
        else return;
        break;
      case ' ':
        if (r === -1) sortByColumn(shownColumns[c]);
        else if (item?.type === 'group') toggleGroup(item.key);
        else if (item?.type === 'data') toggleSelect(item.key, selectionMode === 'multiple' || ctrl);
        else return;
        break;
      case 'F10':
        if (!e.shiftKey || r !== -1 || !menuEnabled) return;
        setMenu(shownColumns[c].id);
        break;
      case 'ContextMenu':
        if (r !== -1 || !menuEnabled) return;
        setMenu(shownColumns[c].id);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  // ---------- header ----------
  const ts = formatDateTime(timestamp, { timeZone });
  const forText = listFor ? `${title} for: ${listFor}` : title;
  const headerMeta = [service, locations && locations.length ? locations.join(', ') : undefined].filter(Boolean) as string[];

  // ---------- update notification ----------
  const [confirming, setConfirming] = React.useState(false);
  const [suppressTick, setSuppressTick] = React.useState(false);
  const confirmBtn = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (confirming) confirmBtn.current?.focus();
  }, [confirming]);
  const unmarkAll = () => {
    if (suppressTick) onSuppressUnmarkConfirm?.();
    setConfirming(false);
    onUnmark?.(updates.map(u => u.id));
  };

  const [oovHidden, setOovHidden] = React.useState(false);
  const showOov = showOutOfViewMessage && !oovHidden && (hScroll.left || hScroll.right);
  const scrollBy = (dx: number) => viewportRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  const sortRank = (colId: string) => {
    const i = sort.findIndex(k => k.attributeId === colId);
    return i < 0 ? null : { i, key: sort[i] };
  };

  // ---------- cells ----------
  const renderPatient = (row: T, rowKey: string) => props.renderPatient ? (
    props.renderPatient(row, { patient: getPatient ? getPatient(row) : null, match: nameMatches.get(rowKey) ?? null })
  ) : (
    <PatientIdentificationCell
      patient={getPatient ? getPatient(row) : null}
      region={region}
      match={nameMatches.get(rowKey)}
      dateOfBirthFormat={dateOfBirthFormat}
      mrnLabel={mrnLabel}
    />
  );

  const markButton = (ids: string[], what: string) => <UpdateMarker label={what} focusable={false} onUnmark={() => onUnmark?.(ids)} />;

  const renderCell = (col: PatientListColumn<T>, row: T, rowKey: string, rowUpdated: PatientListUpdate[]) => {
    const ups = cellUpdates(rowKey, col.id);
    const cellMarks = ups.filter(u => u.sublistIndex === undefined && u.removedCount === undefined);
    const removed = ups.reduce((n, u) => n + (u.removedCount ?? 0), 0);
    let content: React.ReactNode;
    if (cellMarks.some(u => u.cellRemoved)) content = <span className="cui-patient-list__removed">Item removed</span>;
    else if (col.kind === 'patient') {
      const hit = found.active ? found.hitOf(row) : undefined;
      content = (
        <>
          {renderPatient(row, rowKey)}
          {hit ? <SearchMatchNote note={smartMatchNote(hit)} /> : null}
        </>
      );
    }
    else if (col.sublist) {
      const items = col.sublist(row);
      const updatedIndexes = items.map((_, i) => i).filter(i => ups.some(u => u.sublistIndex === i));
      content = (
        <SubList
          items={items}
          updatedIndexes={updatedIndexes}
          onUnmarkItem={i => onUnmark?.(ups.filter(u => u.sublistIndex === i).map(u => u.id))}
          itemLabel={`${col.title} entry`}
          removedCount={removed}
          markersFocusable={false}
        />
      );
    } else if (col.render) content = col.render(row);
    else {
      const attr = attrs.find(a => a.id === col.id) as ListAttribute<T>;
      const v = attr.getValue ? attr.getValue(row) : (row as unknown as Record<string, unknown>)[col.id];
      const text = defaultCellText(v, col.dataType ?? 'string', timeZone);
      const hit = found.active && text && col.dataType !== 'date' && col.dataType !== 'dateTime' ? found.hitOf(row) : undefined;
      const m = hit?.matches.find(x => x.fieldKey === col.id && x.value === text);
      content = hit && m ? <SearchHighlight text={text} ranges={smartHitRanges(hit, col.id, m.valueIndex)} /> : text;
    }
    const cellMarked = cellMarks.length > 0;
    const rowMark = col.kind === 'patient' && rowUpdated.length > 0;
    return (
      <>
        {content}
        {cellMarked ? markButton(cellMarks.map(u => u.id), col.title) : null}
        {rowMark ? markButton(rowUpdated.map(u => u.id), 'patient row') : null}
      </>
    );
  };

  const headerTextId = `${baseId}-title`;
  const TitleTag = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const totalMarked = updates.length;
  const showBar = totalMarked > 0 || !realTime;

  return (
    <section className={cx('cui-patient-list', historical && 'cui-patient-list--historical', className)} aria-labelledby={headerTextId}>
      <header className="cui-patient-list__header">
        <TitleTag id={headerTextId} className="cui-patient-list__title">
          {historical ? <HistoricalSnapshotBanner variant="tag" /> : null}
          {forText}
        </TitleTag>
        <div className="cui-patient-list__meta">
          {headerMeta.map(m => (
            <span key={m} className="cui-patient-list__meta-item">{m}</span>
          ))}
          <span className={cx('cui-patient-list__meta-item', 'cui-tabular', historical && 'cui-patient-list__meta-time--historical')}>
            {historical ? `List as at ${ts}` : timestampKind === 'current' ? `Current time ${ts}` : `Last updated ${ts}`}
          </span>
        </div>
        {inclusionCriteria ? <div className="cui-patient-list__criteria">Showing: {inclusionCriteria}</div> : null}
      </header>
      {searchShown ? (
        <div className="cui-patient-list__search">
          <ListSearch
            label={listSearchLabel(title)}
            value={query}
            onChange={setQuery}
            scopes={found.scopeFields}
            activeScopes={found.query?.scopes ?? []}
            shown={found.rows.length}
            total={rows.length}
            rowNoun={rowNoun}
            rowNounSingular={props.rowNounSingular}
            closeMatches={found.closeMatches}
            suggestions={found.suggestions}
          />
        </div>
      ) : null}
      {toolbar ? <div className="cui-patient-list__toolbar">{toolbar}</div> : null}
      {filterActive && filter ? (
        <FilterNotification
          filter={filter}
          attributes={attrs}
          counts={{ in: filterResult.filteredIn.length, out: filterResult.filteredOut.length, all: filterResult.all.length }}
          view={filterView}
          onViewChange={setFilterView}
          rowNoun={rowNoun}
          onRemoveAll={() => {
            setFilterView('in');
            onFilterChange?.(null);
          }}
        />
      ) : null}
      {showBar ? (
        <div className="cui-patient-list__updates" role="region" aria-label="Updates">
          <span className="cui-patient-list__updates-count" aria-live="polite">
            <Icon name="bell" />{' '}
            {totalMarked === 0
              ? 'No updates marked'
              : `${totalMarked} update${totalMarked === 1 ? '' : 's'} marked for viewing${outOfViewUpdates ? `, ${outOfViewUpdates} out of view` : ''}`}
          </span>
          {totalMarked > 0 && onUnmark ? (
            <Button size="sm" onClick={() => (confirmUnmarkAll ? setConfirming(true) : unmarkAll())}>Unmark all</Button>
          ) : null}
          {!realTime ? (
            <span className="cui-patient-list__refresh">
              <span>{lastRefreshed ? `Last refreshed ${elapsedText(nowMs - (toDate(lastRefreshed)?.getTime() ?? nowMs))}` : 'Not yet refreshed'}</span>
              {refreshIntervalLabel ? <span className="cui-patient-list__refresh-interval">Refreshes {refreshIntervalLabel}</span> : null}
              {onRefresh ? <Button size="sm" icon="refresh" onClick={onRefresh}>Refresh</Button> : null}
            </span>
          ) : null}
          {confirming ? (
            <div className="cui-patient-list__confirm" role="alertdialog" aria-labelledby={`${baseId}-confirm`}>
              <span id={`${baseId}-confirm`}>
                <Icon name="warning" /> You may not have seen all the updates. Unmark all {totalMarked}?
              </span>
              <label className="cui-list-choice" data-touch-target>
                <input type="checkbox" checked={suppressTick} onChange={e => setSuppressTick(e.target.checked)} /> Do not ask again
              </label>
              <Button ref={confirmBtn} size="sm" variant="primary" onClick={unmarkAll}>Unmark all</Button>
              <Button size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          ) : null}
        </div>
      ) : null}
      {showOov ? (
        <div className="cui-patient-list__oov" role="status">
          <span className="cui-patient-list__oov-side">
            {hScroll.left ? (
              <button type="button" className="cui-patient-list__oov-arrow" onClick={() => scrollBy(-240)} aria-label="Scroll left to columns out of view">
                <Icon name="chevron-left" />
              </button>
            ) : null}
          </span>
          <span className="cui-patient-list__oov-msg">
            {`Columns out of view – scroll ${hScroll.left && hScroll.right ? 'left and right' : hScroll.left ? 'left' : 'right'}`}
            <button
              type="button"
              className="cui-patient-list__oov-hide"
              onClick={() => {
                setOovHidden(true);
                onDismissOutOfViewMessage?.();
              }}
            >
              Hide until next session
            </button>
          </span>
          <span className="cui-patient-list__oov-side cui-patient-list__oov-side--right">
            {hScroll.right ? (
              <button type="button" className="cui-patient-list__oov-arrow" onClick={() => scrollBy(240)} aria-label="Scroll right to columns out of view">
                <Icon name="chevron-right" />
              </button>
            ) : null}
          </span>
        </div>
      ) : null}
      <div
        ref={viewportRef}
        className="cui-patient-list__viewport"
        style={{ maxHeight, ['--cui-pl-head' as string]: `${headHeight}px` } as React.CSSProperties}
        onScroll={measure}
      >
        <table
          ref={tableRef}
          role="grid"
          aria-labelledby={headerTextId}
          aria-multiselectable={selectionMode === 'multiple' || undefined}
          className={cx('cui-patient-list__table', fixedLayout && 'cui-patient-list__table--fixed')}
          style={fixedLayout && widths ? { width: shownColumns.reduce((s, c) => s + widths[c.id], 0) } : undefined}
          onKeyDown={onGridKeyDown}
          onFocus={() => setGridHasFocus(true)}
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setGridHasFocus(false);
          }}
        >
          {fixedLayout && widths ? (
            <colgroup>
              {shownColumns.map(c => (
                <col key={c.id} style={{ width: widths[c.id] }} />
              ))}
            </colgroup>
          ) : null}
          <thead>
            <tr>
              {shownColumns.map((col, ci) => {
                const sr = sortRank(col.id);
                const frozen = isKey(col);
                const active = gridHasFocus && safeFocus.c === ci;
                const labels = listSortOrderLabels(col.dataType ?? 'string', col.options);
                return (
                  <th
                    key={col.id}
                    ref={el => {
                      if (el) thRefs.current.set(col.id, el);
                      else thRefs.current.delete(col.id);
                    }}
                    scope="col"
                    aria-sort={sr && sr.i === 0 ? (sr.key.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cx(
                      'cui-patient-list__th',
                      `cui-patient-list__th--${col.align ?? 'left'}`,
                      frozen && 'cui-patient-list__cell--frozen',
                      frozen && ci === keyCols.length - 1 && 'cui-patient-list__cell--frozen-last',
                      active && 'cui-patient-list__th--active',
                    )}
                    style={frozen ? { left: frozenLeft[col.id] ?? 0 } : { minWidth: col.minWidth }}
                    data-col={col.id}
                    onContextMenu={
                      menuEnabled
                        ? e => {
                            e.preventDefault();
                            setMenu(col.id);
                          }
                        : undefined
                    }
                  >
                    <div
                      className="cui-patient-list__th-inner"
                      tabIndex={safeFocus.r === -1 && safeFocus.c === ci ? 0 : -1}
                      data-nav={`-1:${ci}`}
                      role="button"
                      aria-haspopup={menuEnabled ? 'menu' : undefined}
                      title={`Sort by ${col.title}`}
                      onClick={() => {
                        setFocus({ r: -1, c: ci });
                        sortByColumn(col);
                      }}
                      onFocus={() => setFocus({ r: -1, c: ci })}
                    >
                      <span className="cui-patient-list__th-title">
                        {col.title}
                        {col.unit ? <span className="cui-patient-list__th-unit"> ({col.unit})</span> : null}
                      </span>
                      {sr ? (
                        <SortIndicator
                          direction={sr.key.direction}
                          rank={sort.length > 1 ? sr.i + 1 : undefined}
                          orderLabel={sr.key.direction === 'asc' ? labels.asc : labels.desc}
                          attributeLabel={col.title}
                        />
                      ) : null}
                    </div>
                    <span
                      className="cui-patient-list__resize"
                      aria-hidden="true"
                      title="Drag to resize. With the header focused, Alt+Left or Alt+Right also resizes."
                      onPointerDown={e => startResize(e, col.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    {cellFilter === col.id && onFilterChange ? (
                      <HeaderCellFilter
                        attribute={attrs.find(a => a.id === col.id) as ListAttribute<T>}
                        initial={filter?.criteria.find(c => c.attributeId === col.id) ?? null}
                        replacesFilter={!!filter && filter.criteria.some(c => c.attributeId !== col.id && c.operator)}
                        onApply={(c: ListFilterCriterion) => {
                          setCellFilter(null);
                          setFilterView('in');
                          onFilterChange({ criteria: [c], combine: 'or' });
                          moveTo(-1, ci);
                        }}
                        onRemove={() => {
                          setCellFilter(null);
                          const rest = (filter?.criteria ?? []).filter(c => c.attributeId !== col.id);
                          onFilterChange(rest.length && filter ? { ...filter, criteria: rest } : null);
                          moveTo(-1, ci);
                        }}
                        onCustom={
                          onHeaderCommand
                            ? () => {
                                setCellFilter(null);
                                onHeaderCommand('filter', col.id);
                              }
                            : undefined
                        }
                        onCancel={() => {
                          setCellFilter(null);
                          moveTo(-1, ci);
                        }}
                      />
                    ) : null}
                    {menu === col.id && menuEnabled ? (
                      <HeaderMenu
                        items={menuItems}
                        onSelect={cmd => onMenuSelect(cmd, col.id)}
                        onClose={() => {
                          setMenu(null);
                          moveTo(-1, ci);
                        }}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="cui-patient-list__edge" aria-hidden="true">
              <td colSpan={colCount}>
                <span className="cui-patient-list__edge-text">Start of list</span>
              </td>
            </tr>
            {flat.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="cui-patient-list__empty">
                  {found.active && !found.rows.length ? `No ${rowNoun} match the search` : filterActive ? `No ${rowNoun} match the filter` : `No ${rowNoun} on this list`}
                </td>
              </tr>
            ) : null}
            {flat.map((item, ri) => {
              if (item.type === 'group') {
                const col = shownColumns.find(c => c.id === groupBy) ?? columns.find(c => c.id === groupBy);
                return (
                  <tr key={item.key} className="cui-patient-list__group">
                    <th colSpan={colCount} scope="colgroup" className="cui-patient-list__group-cell">
                      <button
                        type="button"
                        className="cui-patient-list__group-toggle"
                        aria-expanded={item.expanded}
                        tabIndex={safeFocus.r === ri ? 0 : -1}
                        data-nav={`${ri}:0`}
                        onClick={() => {
                          setFocus({ r: ri, c: safeFocus.c });
                          toggleGroup(item.key);
                        }}
                        onFocus={() => setFocus({ r: ri, c: safeFocus.c })}
                      >
                        <Icon name={item.expanded ? 'chevron-down' : 'chevron-right'} />
                        <span>
                          {col ? `${col.title}: ` : ''}
                          {item.label}
                        </span>
                        <span className="cui-patient-list__group-count">{`${item.count} ${item.count === 1 ? (props.rowNounSingular ?? rowNoun.replace(/s$/, '')) : rowNoun}`}</span>
                      </button>
                    </th>
                  </tr>
                );
              }
              const { row, key } = item;
              const rowUpdated = cellUpdates(key);
              const isSel = selected.includes(key);
              const rowFocused = gridHasFocus && safeFocus.r === ri;
              return (
                <tr
                  key={key}
                  aria-selected={selectionMode !== 'none' ? isSel : undefined}
                  className={cx(
                    'cui-patient-list__row',
                    item.band === 1 && 'cui-patient-list__row--band',
                    isSel && 'cui-patient-list__row--selected',
                    rowUpdated.length > 0 && 'cui-patient-list__row--updated',
                  )}
                  onDoubleClick={() => onOpenRow?.(row)}
                >
                  {shownColumns.map((col, ci) => {
                    const frozen = isKey(col);
                    const Tag = frozen ? 'th' : 'td';
                    const cellUps = cellUpdates(key, col.id).filter(u => u.sublistIndex === undefined && u.removedCount === undefined);
                    return (
                      <Tag
                        key={col.id}
                        data-col={col.id}
                        data-label={col.title}
                        scope={frozen ? 'row' : undefined}
                        tabIndex={safeFocus.r === ri && safeFocus.c === ci ? 0 : -1}
                        data-nav={`${ri}:${ci}`}
                        className={cx(
                          'cui-patient-list__cell',
                          `cui-patient-list__cell--${col.align ?? 'left'}`,
                          frozen && 'cui-patient-list__cell--frozen',
                          frozen && ci === keyCols.length - 1 && 'cui-patient-list__cell--frozen-last',
                          frozen && 'cui-patient-list__cell--key',
                          col.kind === 'location' || col.kind === 'time' ? 'cui-patient-list__cell--key-text' : null,
                          col.sublist && 'cui-patient-list__cell--sublist',
                          cellUps.length > 0 && 'cui-patient-list__cell--updated',
                          frozen && rowFocused && 'cui-patient-list__cell--key-active',
                        )}
                        style={frozen ? { left: frozenLeft[col.id] ?? 0 } : undefined}
                        onClick={e => {
                          setFocus({ r: ri, c: ci });
                          toggleSelect(key, selectionMode === 'multiple' && (e.ctrlKey || e.metaKey));
                        }}
                        onFocus={() => setFocus({ r: ri, c: ci })}
                      >
                        {frozen && ci === 0 && isSel ? (
                          <span className="cui-patient-list__selected-mark">
                            <Icon name="check" />
                            <span className="cui-visually-hidden">Selected</span>
                          </span>
                        ) : null}
                        {renderCell(col, row, key, rowUpdated)}
                      </Tag>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="cui-patient-list__edge" aria-hidden="true">
              <td colSpan={colCount}>
                <span className="cui-patient-list__edge-text">End of list</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HeaderMenu({ items: shown, onSelect, onClose }: { items: Array<'filter' | 'sort' | 'groupBy'>; onSelect: (c: 'filter' | 'sort' | 'groupBy') => void; onClose: () => void }) {
  const ref = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);
  const items: Array<['filter' | 'sort' | 'groupBy', string]> = (
    [
      ['filter', 'Filter'],
      ['sort', 'Sort'],
      ['groupBy', 'Group by'],
    ] as Array<['filter' | 'sort' | 'groupBy', string]>
  ).filter(([k]) => shown.includes(k));
  const onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') els[(i + 1) % els.length]?.focus();
    else if (e.key === 'ArrowUp') els[(i - 1 + els.length) % els.length]?.focus();
    else if (e.key === 'Escape' || e.key === 'Tab') onClose();
    else return;
    e.preventDefault();
  };
  return (
    <ul ref={ref} role="menu" className="cui-patient-list__menu" onKeyDown={onKeyDown} onClick={e => e.stopPropagation()}>
      {items.map(([cmd, label]) => (
        <li key={cmd} role="menuitem" tabIndex={-1} className="cui-patient-list__menu-item" onClick={() => onSelect(cmd)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(cmd);
          }
        }}>
          {label}
        </li>
      ))}
    </ul>
  );
}
