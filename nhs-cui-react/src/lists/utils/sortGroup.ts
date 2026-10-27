import { formatDateTime, formatShortDate, toDate } from '../../core/format';
import { isListValueMissing, readListValue, type ListAttribute, type ListDataType, type ListSortKey } from './listTypes';

const collator = typeof Intl !== 'undefined' ? new Intl.Collator('en-GB', { sensitivity: 'base', numeric: true }) : null;
const compareText = (a: string, b: string) => (collator ? collator.compare(a, b) : a < b ? -1 : a > b ? 1 : 0);

function sortValue<T>(raw: unknown, attr: ListAttribute<T>): { n?: number; s?: string } | null {
  if (isListValueMissing(raw)) return null;
  switch (attr.dataType) {
    case 'integer':
    case 'real': {
      const n = typeof raw === 'number' ? raw : Number(String(raw));
      return isFinite(n) ? { n } : { s: String(raw) }; // non-numeric symbols such as '<10' fall back to text (FSG-0114)
    }
    case 'date':
    case 'dateTime': {
      const d = toDate(raw instanceof Date ? raw : String(raw));
      return d ? { n: d.getTime() } : { s: String(raw) };
    }
    case 'ordinal': {
      const i = attr.options ? attr.options.indexOf(String(raw)) : -1;
      return i >= 0 ? { n: i } : { s: String(raw) }; // ISV order (FSG-0112), alphabetic fallback (FSG-0114)
    }
    default:
      return { s: String(raw) };
  }
}

function compareValues(a: { n?: number; s?: string }, b: { n?: number; s?: string }): number {
  if (a.n !== undefined && b.n !== undefined) return a.n - b.n;
  if (a.n !== undefined) return -1; // ordered values before fall-back text
  if (b.n !== undefined) return 1;
  return compareText(a.s ?? '', b.s ?? '');
}

/**
 * Progressive (multi-key) stable sort (FSG-0121). Ordinal values follow the supplied order, text is
 * alphabetic (en-GB), numbers and dates numeric. Missing values always sort last [suggested].
 */
export function progressiveSort<T>(rows: T[], keys: ListSortKey[], attrs: ListAttribute<T>[]): T[] {
  const resolved = keys
    .map(k => ({ k, attr: attrs.find(a => a.id === k.attributeId) }))
    .filter((x): x is { k: ListSortKey; attr: ListAttribute<T> } => !!x.attr);
  if (!resolved.length) return rows.slice();
  const decorated = rows.map((row, index) => ({ row, index, vals: resolved.map(r => sortValue(readListValue(row, r.attr), r.attr)) }));
  decorated.sort((x, y) => {
    for (let i = 0; i < resolved.length; i++) {
      const a = x.vals[i];
      const b = y.vals[i];
      if (a === null && b === null) continue;
      if (a === null) return 1;
      if (b === null) return -1;
      const c = compareValues(a, b);
      if (c !== 0) return resolved[i].k.direction === 'desc' ? -c : c;
    }
    return x.index - y.index;
  });
  return decorated.map(d => d.row);
}

/**
 * Sort-order labels for the sort dialog (FSG-0103/0104/0115). Never "Ascending"/"Descending".
 * `first` is the order offered first: dates offer most recent first (FSG-0085).
 */
export function listSortOrderLabels(type: ListDataType, options?: string[]): { asc: string; desc: string; first: 'asc' | 'desc' } {
  switch (type) {
    case 'date':
    case 'dateTime':
      return { asc: 'Oldest first', desc: 'Most recent first', first: 'desc' };
    case 'integer':
    case 'real':
      return { asc: 'Smallest first', desc: 'Largest first', first: 'asc' };
    case 'ordinal':
      if (options && options.length > 1) {
        return { asc: `${options[0]} first`, desc: `${options[options.length - 1]} first`, first: 'asc' };
      }
      return { asc: 'A – Z', desc: 'Z – A', first: 'asc' };
    default:
      return { asc: 'A – Z', desc: 'Z – A', first: 'asc' };
  }
}

/** Sort dialog line label (FSG-0090/0091): "1 – Sort medications by:" then "2 – Then, within Drug, sort by:". */
export function listSortDialogLabel(index: number, rowNoun: string, previousAttributeLabel?: string): string {
  if (index <= 1 || !previousAttributeLabel) return `${index} – Sort ${rowNoun} by:`;
  return `${index} – Then, within ${previousAttributeLabel}, sort by:`;
}

/** One group of rows. */
export interface ListRowGroup<T> {
  /** Stable key ('' for the null group). */
  key: string;
  /** Heading text. */
  label: string;
  /** True for the group of rows with no value (FSG-0134). */
  isNullGroup: boolean;
  rows: T[];
}

/**
 * Group rows by an attribute, preserving the incoming row order inside each group so the current sort is
 * retained (FSG-0133). Groups follow the ordinal order when one exists, otherwise alphabetic; rows with no
 * value go into a last "null" group (FSG-0134, label [suggested] "(No value)").
 */
export function groupRows<T>(
  rows: T[],
  attributeId: string,
  attrs: ListAttribute<T>[],
  opts: { nullLabel?: string } = {},
): ListRowGroup<T>[] {
  const attr = attrs.find(a => a.id === attributeId);
  if (!attr) return [{ key: '*', label: 'All', isNullGroup: false, rows: rows.slice() }];
  const map = new Map<string, ListRowGroup<T>>();
  const sortKeys = new Map<string, { n?: number; s?: string }>();
  for (const row of rows) {
    const raw = readListValue(row, attr);
    const missing = isListValueMissing(raw);
    const key = missing ? '' : raw instanceof Date ? String(raw.getTime()) : String(raw);
    let g = map.get(key);
    if (!g) {
      const label = missing
        ? opts.nullLabel ?? '(No value)'
        : attr.dataType === 'date'
          ? formatShortDate(raw as Date | string)
          : attr.dataType === 'dateTime'
            ? formatDateTime(raw as Date | string)
            : String(raw);
      g = { key, label, isNullGroup: missing, rows: [] };
      map.set(key, g);
      if (!missing) sortKeys.set(key, sortValue(raw, attr) ?? { s: key });
    }
    g.rows.push(row);
  }
  const groups = [...map.values()];
  groups.sort((a, b) => {
    if (a.isNullGroup) return 1;
    if (b.isNullGroup) return -1;
    return compareValues(sortKeys.get(a.key) as { n?: number }, sortKeys.get(b.key) as { n?: number });
  });
  return groups;
}
