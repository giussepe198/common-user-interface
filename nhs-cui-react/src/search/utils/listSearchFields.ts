import type { SmartFieldKind, SmartFieldScalar, SmartFieldValue, SmartSearchField } from './smartSearch';

/** The parts of a list column the list search reads (DataTable and PatientList columns have them). */
export interface ListSearchColumn<T> {
  id: string;
  title: string;
  dataType?: string;
  getValue?: (row: T) => unknown;
  /**
   * Search this column: shown columns are searched unless false; a hidden column only when true (a list declares
   * its hidden identifiers and other names this way).
   */
  searchable?: boolean;
  /** How its values compare. Default from the data type: dates as dates, everything else as words. */
  searchKind?: SmartFieldKind;
  /** The values searched, when the cell's value is not text (an object, a code shown as words). */
  searchValue?: (row: T) => SmartFieldValue;
}

const scalar = (v: unknown): SmartFieldScalar => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string' || typeof v === 'number' || v instanceof Date) return v;
  if (typeof v === 'boolean') return null;
  if (typeof v === 'object' && 'text' in (v as Record<string, unknown>) && typeof (v as { text: unknown }).text === 'string') return v as { text: string };
  return null;
};

/** A column's value as searchable values: text, numbers and dates; lists of them; nothing for other objects. */
export function listSearchValue(v: unknown): SmartFieldValue {
  if (Array.isArray(v)) return v.map(scalar);
  return scalar(v);
}

/**
 * The smart search fields of a list: every shown column that is not `searchable: false`, then hidden columns marked
 * `searchable: true`, then the list's extra fields. Each column is a scope by its id and its title ("team:north").
 */
export function listSearchFields<T>(
  columns: readonly ListSearchColumn<T>[],
  shownIds: readonly string[],
  extra: readonly SmartSearchField<T>[] = [],
): SmartSearchField<T>[] {
  const shown = new Set(shownIds);
  const read = (c: ListSearchColumn<T>) => (row: T): SmartFieldValue => {
    if (c.searchValue) return c.searchValue(row);
    const v = c.getValue ? c.getValue(row) : row && typeof row === 'object' ? (row as unknown as Record<string, unknown>)[c.id] : undefined;
    return listSearchValue(v);
  };
  const kindOf = (c: ListSearchColumn<T>): SmartFieldKind => c.searchKind ?? (c.dataType === 'date' || c.dataType === 'dateTime' ? 'date' : 'text');
  const fromColumns = columns
    .filter(c => (shown.has(c.id) ? c.searchable !== false : c.searchable === true))
    .sort((a, b) => Number(!shown.has(a.id)) - Number(!shown.has(b.id)))
    .map<SmartSearchField<T>>(c => ({ key: c.id, label: c.title, kind: kindOf(c), get: read(c) }));
  const taken = new Set(fromColumns.map(f => f.key));
  return [...fromColumns, ...extra.filter(f => !taken.has(f.key))];
}
