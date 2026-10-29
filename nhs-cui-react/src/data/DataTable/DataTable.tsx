import React from 'react';
import { Button, Icon, cx, formatDateTime, formatShortDate, useControllableState, useId, type DateLike } from '../../core';
import {
  ColumnChooser,
  DataToolbar,
  FilterDialog,
  FilterNotification,
  HeaderCellFilter,
  SortDialog,
  SortIndicator,
  SubList,
  UpdateMarker,
  evaluateFilter,
  groupRows,
  listSortOrderLabels,
  progressiveSort,
  readListValue,
  type ColumnChooserPreset,
  type ListAttribute,
  type ListDataType,
  type ListFilterCriterion,
  type ListFilterState,
  type ListSortKey,
} from '../../lists';
import { Pagination } from '../../shell';
import { ListSearch, SearchHighlight, SearchMatchNote, listSearchLabel } from '../../search/ListSearch/ListSearch';
import { useListSearch } from '../../search/ListSearch/useListSearch';
import { listSearchFields } from '../../search/utils/listSearchFields';
import { smartHitRanges, smartMatchNote, type SmartFieldKind, type SmartFieldValue, type SmartSearchField } from '../../search/utils/smartSearch';


/** A column of a DataTable. */
export interface DataTableColumn<T> {
  /** Stable id; also the default property read from each row. */
  id: string;
  /** Header title. Wraps, never truncated (PAL-0120/0150). */
  title: string;
  /** Unit shown in the header (FSG-0014). Never mix units in one column (FSG-0013). */
  unit?: string;
  /** Header and data alignment, kept the same (PAL-0140). Default 'left'; numbers read best 'right'. */
  align?: 'left' | 'center' | 'right';
  /** FSG data type: drives filter operators, sort order words and default cell text (FSG Table 5). Default 'string'. */
  dataType?: ListDataType;
  /** Ordinal order (FSG-0112) or the value set of an unordered symbol. */
  options?: string[];
  /** Value used for sorting, filtering and grouping. Defaults to row[id]. */
  getValue?: (row: T) => unknown;
  /** Custom cell content. Defaults to the value as text (dates use the CUI date format). */
  render?: (row: T) => React.ReactNode;
  /** Render the cell as a sublist: one item per sub-row, every item shown (PAL-0390..0410). */
  sublist?: (row: T) => React.ReactNode[];
  /** Row key identifier (PAL-0580): always shown, first, and the title of each card in the stacked layout. */
  isRowKey?: boolean;
  /** Offer sorting from the header and the sort dialog. Default true. */
  sortable?: boolean;
  /** Offer filtering from the header menu and the filter dialog. Default true. */
  filterable?: boolean;
  /** Offer this column in the "Group by" menu (FSG-0132). Default false. */
  groupable?: boolean;
  /** Minimum width in px [suggested]. Cells otherwise size to content and wrap. */
  minWidth?: number;
  /**
   * The list search reads this column: a shown column unless false, a hidden one only when true (hidden identifiers,
   * other names) [suggested].
   */
  searchable?: boolean;
  /** How the search compares its values: 'name' adds sounds-alike, 'identifier' exact or by its start. Default from `dataType`. */
  searchKind?: SmartFieldKind;
  /** The values the search reads when the cell value is not text (an object, a code shown as words). */
  searchValue?: (row: T) => SmartFieldValue;
}

/** An update to mark for the user (PAL-0880..0950). Marks are per user (PAL-0970): keep them in that user's state. */
export interface DataTableUpdate {
  id: string;
  rowKey: string;
  /** Updated cell. Omit to mark a newly added row: the whole row is marked (PAL-0940). */
  columnId?: string;
  /** Mark one sublist entry only (PAL-0900). */
  sublistIndex?: number;
}

export interface DataTableProps<T> {
  /** Names the table: shown as its heading and used in dialog titles ("Filter <caption>", FSG-0008/0078). */
  caption: string;
  /** Keep the caption for assistive technology only, for a page that already has a heading with the same words. */
  captionHidden?: boolean;
  /** Column definitions in default order. */
  columns: DataTableColumn<T>[];
  /** The rows. In 'server' processing these are already sorted, filtered and paged. */
  rows: T[];
  /** Stable unique key for each row (PAL-0580). */
  getRowKey: (row: T) => string;
  /** Short words naming a row for checkboxes and cards ("Referral RF-0012"). Default: the row key columns' text. */
  getRowLabel?: (row: T) => string;
  /** Plural noun for rows, used in messages ("referrals"). Default "rows". */
  rowNoun?: string;
  /**
   * 'client' (default): the table sorts, filters and groups `rows` itself with the lists engine.
   * 'server': the table only reports sort, filter and group changes through the callbacks; `rows` are shown as given.
   */
  processing?: 'client' | 'server';
  /** Server processing: the number of rows that match before paging, for "Showing 25 of 340" [suggested]. */
  totalCount?: number;
  /** Server processing: counts for the filter notification (FSG-0065..0068). */
  filterCounts?: { in: number; out: number; all: number };
  /** Sort keys, controlled (FSG-0121). */
  sort?: ListSortKey[];
  defaultSort?: ListSortKey[];
  onSortChange?: (sort: ListSortKey[]) => void;
  /** Filter, controlled (FSG 3.6). Filtered-out rows are never shown greyed (FSG-0064). */
  filter?: ListFilterState | null;
  defaultFilter?: ListFilterState | null;
  onFilterChange?: (filter: ListFilterState | null) => void;
  /** Column id to group by, or null (FSG 3.8). */
  groupBy?: string | null;
  defaultGroupBy?: string | null;
  onGroupByChange?: (id: string | null) => void;
  /** Visible column ids in display order (PAL-0710). Row key columns are always shown first (PAL-0720). */
  visibleColumnIds?: string[];
  defaultVisibleColumnIds?: string[];
  onVisibleColumnIdsChange?: (ids: string[]) => void;
  /** Show the Filter, Sort, Group by and Columns toolbar (FSG-0001/0002). Default true. */
  showToolbar?: boolean;
  /** Offer "Columns" in the toolbar to show, hide and reorder columns (PAL-0710..0730). Default true. */
  columnChooser?: boolean;
  /** Role-based column sets for the column chooser (PAL-0730). */
  columnPresets?: ColumnChooserPreset[];
  /** Extra commands at the end of the toolbar, e.g. "Export". */
  toolbarExtra?: React.ReactNode;
  /** Row selection. Default 'none'. 'multiple' adds a checkbox column with "Select all" [suggested]. */
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** Open a row (Enter or double-click). */
  onOpenRow?: (row: T) => void;
  /** Updates marked for viewing since the user last looked (PAL-0840..0950). */
  updates?: DataTableUpdate[];
  /** Unmark updates, one by one (PAL-0930) or all (PAL-0980). */
  onUnmark?: (updateIds: string[]) => void;
  /** Ask before "Unmark all" (PAL-0980). Default true. */
  confirmUnmarkAll?: boolean;
  /** Rows are being fetched: the table is marked busy and says so in words [suggested]. */
  loading?: boolean;
  /** Words shown when there are no rows. Default "No <rowNoun> to show". Say what was looked for where you can. */
  emptyText?: string;
  /** Maximum height of the scrolling area; the header stays visible (PAL-0170). Default none (page scroll). */
  maxHeight?: number | string;
  /**
   * Client processing: show this many rows at a time, with `Pagination` under the table and what the page shows in words
   * ("Tasks 26 to 50 of 60"). Filtering and sorting apply to every row first, so a sort is never of one page only; with
   * Group by the groups are of the rows on the page. The page goes back to 1 when the filter, sort or grouping changes.
   * Default none (every row) [suggested].
   */
  pageSize?: number;
  /** The current page, from 1 (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Names the page navigation landmark. Default "Pages of <caption>". */
  pageLabel?: string;
  /**
   * 'auto' (default) shows a table and, when its container is narrower than 600px, the same table as stacked cards of
   * label and value pairs (a container query): no sideways scrolling, table semantics kept, the column headings
   * a wrapping row of sort buttons. 'table' never stacks; 'cards' always stacks.
   */
  layout?: 'auto' | 'table' | 'cards';
  /** Columns shown in each card, in order. Default: every visible column. Row key columns always head the card. */
  cardColumnIds?: string[];
  /**
   * The list search box above the toolbar (smart search over the loaded rows) [suggested]. 'auto' (default) shows it
   * for client processing once there are 8 rows or more; true always; false never. Server processing pages rows, so
   * it shows the box only when true (and searches only the rows given).
   */
  search?: boolean | 'auto';
  /** The search text, controlled. */
  searchQuery?: string;
  defaultSearchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  /** Further values the search reads beyond the columns (a person's other names, a hidden identifier). */
  searchFields?: SmartSearchField<T>[];
  className?: string;
}

type FlatItem<T> =
  | { type: 'group'; key: string; label: string; count: number; expanded: boolean }
  | { type: 'data'; key: string; row: T; band: number };

const SELECT_COL = '__select';

function defaultText(v: unknown, type: ListDataType): string {
  if (v === null || v === undefined || v === '') return '';
  if (type === 'date') return formatShortDate(v as DateLike);
  if (type === 'dateTime') return formatDateTime(v as DateLike);
  return String(v);
}

const singular = (noun: string) => noun.replace(/s$/, '');

/**
 * Turn DataTable columns into the attribute list that FilterDialog, SortDialog, FilterNotification and the lists
 * filter and sort utilities take, exactly as DataTable builds it internally (use it for server-side processing).
 */
export function dataTableAttributes<T>(columns: DataTableColumn<T>[]): ListAttribute<T>[] {
  return columns.map(c => ({ id: c.id, label: c.title, dataType: c.dataType ?? 'string', options: c.options, unit: c.unit, getValue: c.getValue }));
}

/**
 * Dense data table for lists that are not patient lists (referrals, tasks, reports, admin lists), with the interaction
 * model of PatientList: sortable headers, header cell filters and the filter notification, grouping, column chooser,
 * toolbar, optional selection, keyboard grid navigation, a sticky header, empty and loading states and update marking.
 * Narrow containers get stacked cards of label and value pairs instead of sideways scrolling.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    caption, captionHidden, columns, rows, getRowKey, getRowLabel, rowNoun = 'rows', processing = 'client', totalCount, filterCounts,
    showToolbar = true, columnChooser = true, columnPresets, toolbarExtra, selectionMode = 'none', onOpenRow, updates = [], onUnmark,
    confirmUnmarkAll = true, loading = false, emptyText, maxHeight, layout = 'auto', cardColumnIds, className, pageSize, pageLabel,
    search = 'auto', searchFields,
  } = props;
  const baseId = useId('cui-dt');
  const server = processing === 'server';
  const attrs = React.useMemo(() => dataTableAttributes(columns), [columns]);
  const colById = React.useMemo(() => new Map(columns.map(c => [c.id, c])), [columns]);

  const [sort, setSort] = useControllableState<ListSortKey[]>(props.sort, props.defaultSort ?? [], props.onSortChange);
  const [filterRaw, setFilter] = useControllableState<ListFilterState | null>(props.filter, props.defaultFilter ?? null, props.onFilterChange);
  const filter = filterRaw ?? null;
  const [groupRaw, setGroupBy] = useControllableState<string | null>(props.groupBy, props.defaultGroupBy ?? null, props.onGroupByChange);
  const groupBy = groupRaw ?? null;
  const [visibleRaw, setVisible] = useControllableState<string[]>(props.visibleColumnIds, props.defaultVisibleColumnIds ?? columns.map(c => c.id), props.onVisibleColumnIdsChange);
  const [selected, setSelected] = useControllableState<string[]>(props.selectedKeys, props.defaultSelectedKeys ?? [], props.onSelectionChange);

  // ---------- columns: row keys first and locked (PAL-0720); sorting by a hidden column shows it (FSG-0098) ----------
  const shownColumns = React.useMemo(() => {
    const keys = columns.filter(c => c.isRowKey);
    const rest = visibleRaw.map(id => colById.get(id)).filter((c): c is DataTableColumn<T> => !!c && !c.isRowKey);
    for (const k of sort) {
      const c = colById.get(k.attributeId);
      if (c && !c.isRowKey && !rest.includes(c)) rest.push(c);
    }
    return [...keys, ...rest];
  }, [columns, colById, visibleRaw, sort]);
  const shownAttrs = shownColumns.map(c => attrs.find(a => a.id === c.id) as ListAttribute<T>);

  // ---------- search (client): before the filter, so the filter and its counts act on what the search found ----------
  const [queryRaw, setQuery] = useControllableState<string>(props.searchQuery, props.defaultSearchQuery ?? '', props.onSearchQueryChange);
  const query = queryRaw ?? '';
  const searchShown = search === true || (search === 'auto' && !server && (rows.length >= 8 || !!query.trim()));
  const fields = React.useMemo(() => listSearchFields(columns, shownColumns.map(c => c.id), searchFields), [columns, shownColumns, searchFields]);
  const found = useListSearch(rows, fields, searchShown ? query : '');

  // ---------- data pipeline (client) ----------
  const [filterView, setFilterView] = React.useState<'in' | 'out' | 'all'>('in');
  React.useEffect(() => {
    if (!filter) setFilterView('in');
  }, [filter]);
  const filterResult = React.useMemo(
    () => (server ? { filteredIn: found.rows, filteredOut: [] as T[], all: found.rows } : evaluateFilter(found.rows, filter, attrs)),
    [server, found.rows, filter, attrs],
  );
  const filterActive = !!filter && filter.criteria.some(c => c.operator);
  const viewRows = filterView === 'out' ? filterResult.filteredOut : filterView === 'all' ? filterResult.all : filterResult.filteredIn;
  const sortedRows = React.useMemo(() => found.rankOrder(server ? viewRows : progressiveSort(viewRows, sort, attrs)), [server, viewRows, sort, attrs, found]);
  const counts = server ? filterCounts : { in: filterResult.filteredIn.length, out: filterResult.filteredOut.length, all: filterResult.all.length };

  // ---------- paging (client): after filter and sort, before grouping ----------
  const paging = !server && !!pageSize && pageSize > 0;
  const [pageRaw, setPage] = useControllableState<number>(props.page, props.defaultPage ?? 1, props.onPageChange);
  const pageCount = paging ? Math.max(1, Math.ceil(sortedRows.length / (pageSize as number))) : 1;
  const page = Math.min(Math.max(1, pageRaw ?? 1), pageCount);
  const pagedRows = React.useMemo(
    () => (paging ? sortedRows.slice((page - 1) * (pageSize as number), page * (pageSize as number)) : sortedRows),
    [paging, sortedRows, page, pageSize],
  );
  const pagingStarted = React.useRef(false);
  React.useEffect(() => {
    if (!pagingStarted.current) {
      pagingStarted.current = true;
      return;
    }
    if (paging && page !== 1) setPage(1);
    // Back to the first page when what is listed, or its order, changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterView, sort, groupBy, query]);

  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set());
  React.useEffect(() => setCollapsed(new Set()), [groupBy]);
  const flat = React.useMemo<FlatItem<T>[]>(() => {
    const out: FlatItem<T>[] = [];
    let band = 0;
    const push = (rs: T[]) => rs.forEach(row => out.push({ type: 'data', key: getRowKey(row), row, band: band++ % 2 }));
    if (groupBy && attrs.some(a => a.id === groupBy)) {
      // Groups keep the current sort inside them (FSG-0133); rows with no value form the last group (FSG-0134).
      for (const g of groupRows(pagedRows, groupBy, attrs)) {
        const expanded = !collapsed.has(g.key);
        out.push({ type: 'group', key: `g:${g.key}`, label: g.label, count: g.rows.length, expanded });
        if (expanded) push(g.rows);
      }
    } else push(pagedRows);
    return out;
  }, [pagedRows, groupBy, attrs, collapsed, getRowKey]);
  const dataCount = sortedRows.length;

  // ---------- updates ----------
  const updatesFor = (rowKey: string, colId?: string) => updates.filter(u => u.rowKey === rowKey && u.columnId === colId && u.sublistIndex === undefined);
  const sublistUpdates = (rowKey: string, colId: string) => updates.filter(u => u.rowKey === rowKey && u.columnId === colId && u.sublistIndex !== undefined);

  // ---------- selection ----------
  const multi = selectionMode === 'multiple';
  const toggleSelect = (key: string, additive: boolean) => {
    if (selectionMode === 'none') return;
    if (multi && additive) setSelected(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
    else setSelected(selected.length === 1 && selected[0] === key ? [] : [key]);
  };
  const visibleKeys = flat.filter((f): f is Extract<FlatItem<T>, { type: 'data' }> => f.type === 'data').map(f => f.key);
  const allSelected = visibleKeys.length > 0 && visibleKeys.every(k => selected.includes(k));
  const someSelected = visibleKeys.some(k => selected.includes(k));
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected && !allSelected;
  });

  const rowLabel = (row: T) => {
    if (getRowLabel) return getRowLabel(row);
    const keys = shownColumns.filter(c => c.isRowKey);
    const text = keys.map(c => defaultText(readListValue(row, attrs.find(a => a.id === c.id) as ListAttribute<T>), c.dataType ?? 'string')).filter(Boolean).join(', ');
    return text || getRowKey(row);
  };

  // ---------- layout ----------
  const inCard = (col: DataTableColumn<T>) => col.isRowKey || !cardColumnIds || cardColumnIds.includes(col.id);

  // ---------- sorting ----------
  const sortByColumn = (col: DataTableColumn<T>) => {
    if (col.sortable === false) return;
    const primary = sort[0];
    const next: ListSortKey[] =
      primary && primary.attributeId === col.id && sort.length === 1
        ? [{ attributeId: col.id, direction: primary.direction === 'asc' ? 'desc' : 'asc' }]
        : [{ attributeId: col.id, direction: listSortOrderLabels(col.dataType ?? 'string', col.options).first }];
    applySort(next);
  };
  const sortWords = (keys: ListSortKey[]) =>
    keys
      .map(k => {
        const c = colById.get(k.attributeId);
        if (!c) return '';
        const l = listSortOrderLabels(c.dataType ?? 'string', c.options);
        return `${c.title}, ${(k.direction === 'asc' ? l.asc : l.desc).toLowerCase()}`;
      })
      .filter(Boolean)
      .join(', then ');

  // ---------- announcements ----------
  const [announce, setAnnounce] = React.useState('');
  const countWords = (n: number) => `${n} ${n === 1 ? singular(rowNoun) : rowNoun}`;
  const applySort = (next: ListSortKey[]) => {
    setSort(next);
    setAnnounce(next.length ? `Sorted by ${sortWords(next)}` : 'Sort removed');
  };
  const applyFilter = (next: ListFilterState | null) => {
    setFilterView('in');
    setFilter(next);
  };
  const firstRender = React.useRef(true);
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!loading) setAnnounce(`${countWords(dataCount)} shown`);
    // Announce the result count when the filter, view or rows change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterView, rows.length, loading]);

  // ---------- dialogs and menus ----------
  const [dialog, setDialog] = React.useState<null | 'filter' | 'sort' | 'columns'>(null);
  const [menu, setMenu] = React.useState<string | null>(null);
  const [cellFilter, setCellFilter] = React.useState<string | null>(null);
  const filterAttrs = attrs.filter(a => colById.get(a.id)?.filterable !== false);
  const sortAttrs = shownAttrs.filter(a => colById.get(a.id)?.sortable !== false);
  const hiddenSortAttrs = attrs.filter(a => !shownAttrs.includes(a) && colById.get(a.id)?.sortable !== false);
  const groupOptions = columns.filter(c => c.groupable).map(c => ({ id: c.id, label: c.title }));

  // ---------- keyboard grid navigation (PAL-0700) ----------
  const navCols: Array<DataTableColumn<T> | typeof SELECT_COL> = [...(multi ? [SELECT_COL as typeof SELECT_COL] : []), ...shownColumns];
  const [focus, setFocus] = React.useState({ r: -1, c: 0 });
  const [gridHasFocus, setGridHasFocus] = React.useState(false);
  const pending = React.useRef(false);
  const navRoot = React.useRef<HTMLElement | null>(null);

  // Layout 'auto': cards below 600px (the container query), and also when the columns cannot fit the width they have
  // [suggested], so a table never scrolls sideways (PAL-0320..0350). The width the table needed is kept, and the
  // table comes back once the list is that wide again.
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = React.useState<{ cards: boolean; need: number }>({ cards: false, need: 0 });
  React.useLayoutEffect(() => {
    const vp = viewportRef.current;
    const table = navRoot.current;
    if (layout !== 'auto' || !vp || !table) return;
    const check = () =>
      setFit(prev => {
        const width = vp.clientWidth;
        if (!prev.cards) {
          const need = table.scrollWidth;
          return width >= 600 && need > width + 1 ? { cards: true, need } : prev;
        }
        return width >= prev.need ? { cards: false, need: 0 } : prev;
      });
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(check);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [layout, rows, columns]);
  const shownLayout = layout === 'auto' && fit.cards ? 'cards' : layout;
  const rowCount = flat.length;
  const clamp = (r: number, c: number) => ({ r: Math.max(-1, Math.min(rowCount - 1, r)), c: Math.max(0, Math.min(navCols.length - 1, c)) });
  const safe = clamp(focus.r, focus.c);
  React.useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const c = flat[safe.r]?.type === 'group' ? 0 : safe.c;
    navRoot.current?.querySelector<HTMLElement>(`[data-nav="${safe.r}:${c}"]`)?.focus();
  });
  // A cell holding its own links or buttons is never the grid's tab stop: Tab reaches its controls, and a focusable
  // cell around them would be a target wrapped round other targets (WCAG 2.5.8). Arrow keys still move onto it.
  React.useLayoutEffect(() => {
    for (const cell of navRoot.current?.querySelectorAll<HTMLElement>('td[data-nav], th[data-nav]') ?? []) {
      if (cell.tabIndex === 0 && cell.querySelector('a[href], button, input, select, textarea')) cell.tabIndex = -1;
    }
  });
  const moveTo = (r: number, c: number) => {
    pending.current = true;
    setFocus(clamp(r, c));
  };
  const toggleGroup = (key: string) =>
    setCollapsed(prev => {
      const n = new Set(prev);
      const k = key.slice(2);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  const onNavKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('[role="menu"], [role="dialog"]')) return;
    // A link or button inside a cell keeps its own Enter and Space [suggested].
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement).closest('a[href], button, input, select, textarea')) return;
    const { r, c } = safe;
    const item = r >= 0 ? flat[r] : undefined;
    const ctrl = e.ctrlKey || e.metaKey;
    const col = navCols[c];
    const header = r === -1;
    switch (e.key) {
      case 'ArrowDown':
        moveTo(r + 1, c);
        break;
      case 'ArrowUp':
        moveTo(r - 1, c);
        break;
      case 'ArrowRight':
        if (item?.type === 'group' && !item.expanded) toggleGroup(item.key);
        else moveTo(r, c + 1);
        break;
      case 'ArrowLeft':
        if (item?.type === 'group' && item.expanded) toggleGroup(item.key);
        else moveTo(r, c - 1);
        break;
      case 'Home':
        moveTo(ctrl ? 0 : r, 0);
        break;
      case 'End':
        moveTo(ctrl ? rowCount - 1 : r, navCols.length - 1);
        break;
      case 'PageDown':
        moveTo(r + 10, c);
        break;
      case 'PageUp':
        moveTo(r - 10, c);
        break;
      case 'Enter':
        if (header && col !== SELECT_COL) sortByColumn(col);
        else if (item?.type === 'group') toggleGroup(item.key);
        else if (item?.type === 'data' && onOpenRow) onOpenRow(item.row);
        else return;
        break;
      case ' ':
        if (header && col === SELECT_COL) setSelected(allSelected ? selected.filter(k => !visibleKeys.includes(k)) : [...new Set([...selected, ...visibleKeys])]);
        else if (header) sortByColumn(col as DataTableColumn<T>);
        else if (item?.type === 'group') toggleGroup(item.key);
        else if (item?.type === 'data' && selectionMode !== 'none') toggleSelect(item.key, multi || ctrl);
        else return;
        break;
      case 'F10':
      case 'ContextMenu':
        if ((e.key === 'F10' && !e.shiftKey) || !header || col === SELECT_COL) return;
        setMenu((col as DataTableColumn<T>).id);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  // ---------- unmark all (PAL-0980) ----------
  const [confirming, setConfirming] = React.useState(false);
  const confirmBtn = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (confirming) confirmBtn.current?.focus();
  }, [confirming]);
  const unmarkAll = () => {
    setConfirming(false);
    onUnmark?.(updates.map(u => u.id));
  };

  // ---------- cells ----------
  const renderValue = (col: DataTableColumn<T>, row: T, rowKey: string, markersFocusable: boolean): React.ReactNode => {
    if (col.sublist) {
      const items = col.sublist(row);
      const ups = sublistUpdates(rowKey, col.id);
      return (
        <SubList
          items={items}
          updatedIndexes={ups.map(u => u.sublistIndex as number)}
          onUnmarkItem={i => onUnmark?.(ups.filter(u => u.sublistIndex === i).map(u => u.id))}
          itemLabel={`${col.title} entry`}
          markersFocusable={markersFocusable}
          aria-label={`${col.title}, ${rowLabel(row)}`}
        />
      );
    }
    if (col.render) return col.render(row);
    const text = defaultText(readListValue(row, attrs.find(a => a.id === col.id) as ListAttribute<T>), col.dataType ?? 'string');
    const hit = found.active ? found.hitOf(row) : undefined;
    // Highlight words matched in a plain text cell (a date cell shows its own format, so it is not marked by range).
    if (hit && text && (col.dataType ?? 'string') !== 'date' && (col.dataType ?? 'string') !== 'dateTime') {
      const m = hit.matches.find(x => x.fieldKey === col.id && x.value === text);
      if (m) return <SearchHighlight text={text} ranges={smartHitRanges(hit, col.id, m.valueIndex)} />;
    }
    return text;
  };

  const emptyMessage = found.active && !found.rows.length ? `No ${rowNoun} match the search` : filterActive ? `No ${rowNoun} match the filter` : emptyText ?? `No ${rowNoun} to show`;
  const captionId = `${baseId}-caption`;
  const totalText = server && totalCount !== undefined && totalCount !== dataCount ? `Showing ${dataCount} of ${countWords(totalCount)}` : countWords(dataCount);

  const sortRank = (colId: string) => {
    const i = sort.findIndex(k => k.attributeId === colId);
    return i < 0 ? null : { i, key: sort[i] };
  };

  const headerCell = (col: DataTableColumn<T>, ci: number) => {
    const sr = sortRank(col.id);
    const labels = listSortOrderLabels(col.dataType ?? 'string', col.options);
    const active = gridHasFocus && safe.c === ci;
    const sortable = col.sortable !== false;
    return (
      <th
        key={col.id}
        scope="col"
        aria-sort={sr && sr.i === 0 ? (sr.key.direction === 'asc' ? 'ascending' : 'descending') : undefined}
        className={cx('cui-data-table__th', `cui-data-table__th--${col.align ?? 'left'}`, active && 'cui-data-table__th--active')}
        style={col.minWidth ? ({ '--cui-data-table-min-width': `${col.minWidth}px` } as React.CSSProperties) : undefined}
        onContextMenu={e => {
          e.preventDefault();
          setMenu(col.id);
        }}
      >
        <div
          className={cx('cui-data-table__th-inner', !sortable && 'cui-data-table__th-inner--static')}
          tabIndex={safe.r === -1 && safe.c === ci ? 0 : -1}
          data-nav={`-1:${ci}`}
          role={sortable ? 'button' : undefined}
          aria-haspopup="menu"
          title={sortable ? `Sort by ${col.title}` : undefined}
          onClick={() => {
            setFocus({ r: -1, c: ci });
            sortByColumn(col);
          }}
          onFocus={() => setFocus({ r: -1, c: ci })}
        >
          <span className="cui-data-table__th-title">
            {col.title}
            {col.unit ? <span className="cui-data-table__th-unit"> ({col.unit})</span> : null}
          </span>
          {sr ? (
            <SortIndicator direction={sr.key.direction} rank={sort.length > 1 ? sr.i + 1 : undefined} orderLabel={sr.key.direction === 'asc' ? labels.asc : labels.desc} attributeLabel={col.title} />
          ) : null}
        </div>
        {cellFilter === col.id ? (
          <HeaderCellFilter
            attribute={attrs.find(a => a.id === col.id) as ListAttribute<T>}
            initial={filter?.criteria.find(c => c.attributeId === col.id) ?? null}
            replacesFilter={!!filter && filter.criteria.some(c => c.attributeId !== col.id && c.operator)}
            onApply={(c: ListFilterCriterion) => {
              setCellFilter(null);
              applyFilter({ criteria: [c], combine: 'or' });
              moveTo(-1, ci);
            }}
            onRemove={() => {
              setCellFilter(null);
              const rest = (filter?.criteria ?? []).filter(c => c.attributeId !== col.id);
              applyFilter(rest.length && filter ? { ...filter, criteria: rest } : null);
              moveTo(-1, ci);
            }}
            onCustom={() => {
              setCellFilter(null);
              setDialog('filter');
            }}
            onCancel={() => {
              setCellFilter(null);
              moveTo(-1, ci);
            }}
          />
        ) : null}
        {menu === col.id ? (
          <HeaderMenu
            items={[
              ...(col.filterable !== false ? [['filter', 'Filter'] as const] : []),
              ...(sortable ? [['sort', 'Sort'] as const] : []),
              ...(col.groupable ? [['groupBy', 'Group by'] as const] : []),
            ]}
            onSelect={cmd => {
              setMenu(null);
              if (cmd === 'filter') setCellFilter(col.id);
              else if (cmd === 'sort') setDialog('sort');
              else setGroupBy(col.id);
            }}
            onClose={() => {
              setMenu(null);
              moveTo(-1, ci);
            }}
          />
        ) : null}
      </th>
    );
  };

  // The label is the tap area (44px on a coarse pointer); clicks on it never reach the row.
  const selectBox = (key: string, row: T) => (
    <label className="cui-data-table__check-hit" data-touch-target onClick={e => e.stopPropagation()}>
      <input
        type="checkbox"
        className="cui-data-table__check"
        tabIndex={-1}
        checked={selected.includes(key)}
        aria-label={`Select ${rowLabel(row)}`}
        onChange={() => toggleSelect(key, true)}
        onClick={e => e.stopPropagation()}
      />
    </label>
  );

  const groupHeading = (item: Extract<FlatItem<T>, { type: 'group' }>, ri: number) => {
    const col = colById.get(groupBy ?? '');
    return (
      <button
        type="button"
        className="cui-data-table__group-toggle"
        aria-expanded={item.expanded}
        tabIndex={safe.r === ri ? 0 : -1}
        data-nav={`${ri}:0`}
        onClick={() => {
          setFocus({ r: ri, c: safe.c });
          toggleGroup(item.key);
        }}
        onFocus={() => setFocus({ r: ri, c: safe.c })}
      >
        <Icon name={item.expanded ? 'chevron-down' : 'chevron-right'} />
        <span>{`${col ? `${col.title}: ` : ''}${item.label}`}</span>
        <span className="cui-data-table__group-count">{countWords(item.count)}</span>
      </button>
    );
  };

  const noteOf = (row: T) => {
    const hit = found.hitOf(row);
    return hit ? smartMatchNote(hit) : null;
  };

  // ---------- table body ----------
  const table = (
    <div ref={viewportRef} className="cui-data-table__viewport" style={maxHeight !== undefined ? ({ '--cui-data-table-max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } as React.CSSProperties) : undefined}>
      <table
        ref={el => {
          navRoot.current = el;
        }}
        role="grid"
        aria-labelledby={captionId}
        aria-busy={loading || undefined}
        aria-rowcount={server && totalCount !== undefined ? totalCount + 1 : undefined}
        aria-multiselectable={multi || undefined}
        className="cui-data-table__table"
        onKeyDown={onNavKey}
        onFocus={() => setGridHasFocus(true)}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setGridHasFocus(false);
        }}
      >
        <thead>
          <tr>
            {multi ? (
              <th scope="col" className="cui-data-table__th cui-data-table__th--select">
                <div className="cui-data-table__th-inner cui-data-table__th-inner--static" tabIndex={safe.r === -1 && safe.c === 0 ? 0 : -1} data-nav="-1:0" onFocus={() => setFocus({ r: -1, c: 0 })}>
                  <label className="cui-data-table__check-hit" data-touch-target>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="cui-data-table__check"
                    tabIndex={-1}
                    checked={allSelected}
                    disabled={!visibleKeys.length}
                    aria-label={`Select all ${rowNoun} shown`}
                    onChange={() => setSelected(allSelected ? selected.filter(k => !visibleKeys.includes(k)) : [...new Set([...selected, ...visibleKeys])])}
                  />
                  </label>
                </div>
              </th>
            ) : null}
            {shownColumns.map((col, i) => headerCell(col, i + (multi ? 1 : 0)))}
          </tr>
        </thead>
        <tbody>
          {flat.length === 0 ? (
            <tr>
              <td colSpan={navCols.length} className={cx('cui-data-table__empty', loading && 'cui-data-table__empty--loading')}>
                {loading ? `Loading ${rowNoun}` : emptyMessage}
              </td>
            </tr>
          ) : null}
          {flat.map((item, ri) => {
            if (item.type === 'group') {
              return (
                <tr key={item.key} className="cui-data-table__group">
                  <th colSpan={navCols.length} scope="colgroup" className="cui-data-table__group-cell">
                    {groupHeading(item, ri)}
                  </th>
                </tr>
              );
            }
            const { row, key } = item;
            const rowMarks = updatesFor(key);
            const isSel = selected.includes(key);
            const rowFocused = gridHasFocus && safe.r === ri;
            return (
              <tr
                key={key}
                aria-selected={selectionMode !== 'none' ? isSel : undefined}
                className={cx(
                  'cui-data-table__row',
                  item.band === 1 && 'cui-data-table__row--band',
                  isSel && 'cui-data-table__row--selected',
                  rowMarks.length > 0 && 'cui-data-table__row--updated',
                  rowFocused && 'cui-data-table__row--focused',
                )}
                onDoubleClick={() => onOpenRow?.(row)}
              >
                {navCols.map((col, ci) => {
                  // The roving stop follows focus on the cell itself; a control inside a cell is a tab stop of its own, so focusing
                  // it leaves the stop where it was (a cell and its button are never both in the tab order or both targets).
                  const nav = { tabIndex: safe.r === ri && safe.c === ci ? 0 : -1, 'data-nav': `${ri}:${ci}`, onFocus: (e: React.FocusEvent<HTMLElement>) => { if (e.target === e.currentTarget) setFocus({ r: ri, c: ci }); } };
                  if (col === SELECT_COL) {
                    return (
                      <td key={SELECT_COL} className="cui-data-table__cell cui-data-table__cell--select" {...nav}>
                        {selectBox(key, row)}
                      </td>
                    );
                  }
                  const cellMarks = updatesFor(key, col.id);
                  const Tag = col.isRowKey ? 'th' : 'td';
                  const firstData = ci === (multi ? 1 : 0);
                  return (
                    <Tag
                      key={col.id}
                      scope={col.isRowKey ? 'row' : undefined}
                      data-label={col.isRowKey ? undefined : `${col.title}${col.unit ? ` (${col.unit})` : ''}`}
                      data-card={inCard(col) ? undefined : 'off'}
                      className={cx(
                        'cui-data-table__cell',
                        `cui-data-table__cell--${col.align ?? 'left'}`,
                        col.isRowKey && 'cui-data-table__cell--key',
                        // A key, date or number shown as its value never breaks; a rendered cell (a person cell, a status with
                        // its date) lays out its own parts and wraps between them, so it never forces the table wider.
                        !col.render && (col.isRowKey || ['date', 'dateTime', 'integer', 'real'].includes(col.dataType ?? 'string')) && 'cui-data-table__cell--nowrap',
                        col.sublist && 'cui-data-table__cell--sublist',
                        cellMarks.length > 0 && 'cui-data-table__cell--updated',
                      )}
                      onClick={e => {
                        if (!(e.target as HTMLElement).closest('a, button, input, select, textarea')) setFocus({ r: ri, c: ci });
                        if (selectionMode !== 'none') toggleSelect(key, multi || e.ctrlKey || e.metaKey);
                      }}
                      {...nav}
                    >
                      {firstData && isSel && !multi ? (
                        <span className="cui-data-table__selected-mark">
                          <Icon name="check" />
                          <span className="cui-visually-hidden">Selected</span>
                        </span>
                      ) : null}
                      <div className="cui-data-table__value">{renderValue(col, row, key, false)}</div>
                      {firstData && found.active ? <SearchMatchNote note={noteOf(row)} /> : null}
                      {cellMarks.length ? <UpdateMarker label={col.title} focusable={false} onUnmark={() => onUnmark?.(cellMarks.map(u => u.id))} /> : null}
                      {firstData && rowMarks.length ? <UpdateMarker label={singular(rowNoun)} focusable={false} onUnmark={() => onUnmark?.(rowMarks.map(u => u.id))} /> : null}
                    </Tag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className={cx('cui-data-table', `cui-data-table--${shownLayout}`, className)} aria-labelledby={captionId}>
      <div className={cx('cui-data-table__header', captionHidden && 'cui-data-table__header--bare')}>
        <h2 id={captionId} className={cx('cui-data-table__caption', captionHidden && 'cui-visually-hidden')}>
          {caption}
        </h2>
        {loading && !flat.length ? null : <span className="cui-data-table__count cui-tabular">{totalText}</span>}
        {loading && flat.length ? (
          <span className="cui-data-table__busy" role="status">
            <Icon name="refresh" /> Updating
          </span>
        ) : null}
      </div>
      {searchShown ? (
        <div className="cui-data-table__search">
          <ListSearch
            label={listSearchLabel(caption)}
            value={query}
            onChange={setQuery}
            scopes={found.scopeFields}
            activeScopes={found.query?.scopes ?? []}
            shown={found.rows.length}
            total={rows.length}
            rowNoun={rowNoun}
            closeMatches={found.closeMatches}
            suggestions={found.suggestions}
          />
        </div>
      ) : null}
      {showToolbar ? (
        <div className="cui-data-table__toolbar">
          <DataToolbar
            label={`${caption} tools`}
            keyboardShortcuts={false}
            onFilter={filterAttrs.length ? () => setDialog('filter') : undefined}
            onSort={sortAttrs.length || hiddenSortAttrs.length ? () => setDialog('sort') : undefined}
            groupOptions={groupOptions}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            filterActive={filterActive}
            onRemoveAllFilters={() => applyFilter(null)}
          >
            {columnChooser ? (
              <Button variant="quiet" icon="more" aria-expanded={dialog === 'columns'} onClick={() => setDialog(dialog === 'columns' ? null : 'columns')}>
                Columns
              </Button>
            ) : null}
            {toolbarExtra}
          </DataToolbar>
        </div>
      ) : null}
      {dialog === 'columns' ? (
        <div className="cui-data-table__chooser">
          <ColumnChooser
            columns={columns.map(c => ({ id: c.id, title: c.title, locked: c.isRowKey }))}
            value={shownColumns.map(c => c.id)}
            onChange={setVisible}
            presets={columnPresets}
          />
          <Button size="sm" onClick={() => setDialog(null)}>Done</Button>
        </div>
      ) : null}
      {filterActive && filter ? (
        <FilterNotification
          filter={filter}
          attributes={attrs}
          counts={counts}
          view={filterView}
          onViewChange={server ? undefined : setFilterView}
          rowNoun={rowNoun}
          onRemoveAll={() => applyFilter(null)}
        />
      ) : null}
      {updates.length ? (
        <div className="cui-data-table__updates" role="region" aria-label="Updates">
          <span className="cui-data-table__updates-count">
            <Icon name="bell" /> {`${updates.length} update${updates.length === 1 ? '' : 's'} since you last looked`}
          </span>
          {onUnmark ? <Button size="sm" onClick={() => (confirmUnmarkAll ? setConfirming(true) : unmarkAll())}>Unmark all</Button> : null}
          {confirming ? (
            <span className="cui-data-table__confirm" role="alertdialog" aria-labelledby={`${baseId}-confirm`}>
              <span id={`${baseId}-confirm`}>
                <Icon name="warning" /> {`You may not have seen all the updates. Unmark all ${updates.length}?`}
              </span>
              <Button ref={confirmBtn} size="sm" variant="primary" onClick={unmarkAll}>Unmark all</Button>
              <Button size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
            </span>
          ) : null}
        </div>
      ) : null}
      {table}
      {paging && pageCount > 1 ? (
        <Pagination
          className="cui-data-table__pages"
          label={pageLabel ?? `Pages of ${caption}`}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          summary={`${rowNoun.charAt(0).toUpperCase()}${rowNoun.slice(1)} ${(page - 1) * (pageSize as number) + 1} to ${(page - 1) * (pageSize as number) + pagedRows.length} of ${dataCount}`}
        />
      ) : null}
      <div className="cui-visually-hidden" aria-live="polite">{announce}</div>
      {dialog === 'filter' ? (
        <FilterDialog
          tableName={caption}
          rowNoun={rowNoun}
          attributes={filterAttrs}
          initial={filter}
          onOk={f => {
            setDialog(null);
            applyFilter(f);
          }}
          onCancel={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'sort' ? (
        <SortDialog
          tableName={caption}
          rowNoun={rowNoun}
          attributes={sortAttrs}
          hiddenAttributes={hiddenSortAttrs}
          initial={sort}
          onOk={s => {
            setDialog(null);
            applySort(s);
          }}
          onCancel={() => setDialog(null)}
        />
      ) : null}
    </section>
  );
}

type MenuCommand = 'filter' | 'sort' | 'groupBy';

/** Header context menu (FSG-0004): Filter, Sort, Group by in that order (FSG-0001). Area-internal. */
function HeaderMenu({ items, onSelect, onClose }: { items: ReadonlyArray<readonly [MenuCommand, string]>; onSelect: (c: MenuCommand) => void; onClose: () => void }) {
  const ref = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, []);
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
  if (!items.length) return null;
  return (
    <ul ref={ref} role="menu" className="cui-data-table__menu" onKeyDown={onKeyDown} onClick={e => e.stopPropagation()}>
      {items.map(([cmd, label]) => (
        <li
          key={cmd}
          role="menuitem"
          tabIndex={-1}
          className="cui-data-table__menu-item"
          onClick={() => onSelect(cmd)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(cmd);
            }
          }}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
