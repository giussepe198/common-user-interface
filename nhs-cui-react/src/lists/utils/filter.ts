import { formatDateTime, formatShortDate, toDate } from '../../core/format';
import {
  isListValueMissing,
  readListValue,
  type ListAttribute,
  type ListDataType,
  type ListFilterCriterion,
  type ListFilterOperator,
  type ListFilterState,
} from './listTypes';

const NUMERIC: ListFilterOperator[] = ['lessThan', 'lessThanOrEqual', 'equalTo', 'greaterThanOrEqual', 'greaterThan'];

/** Operators permitted for each data type, exactly per FSG Table 5 (FSG-0032). Reals never get equality. */
export function permittedFilterOperators(type: ListDataType): ListFilterOperator[] {
  switch (type) {
    case 'integer':
    case 'ordinal':
      return [...NUMERIC];
    case 'unorderedSymbol':
    case 'string':
      return ['equals'];
    case 'date':
      return ['on', 'before', 'onOrBefore', 'after', 'onOrAfter', 'between'];
    case 'real':
      return ['lessThan', 'greaterThan'];
    case 'dateTime':
      return ['before', 'after', 'between'];
  }
}

const LABELS: Record<ListFilterOperator, string> = {
  lessThan: 'less than',
  lessThanOrEqual: 'less than or equal to',
  equalTo: 'equal to',
  greaterThanOrEqual: 'greater than or equal to',
  greaterThan: 'greater than',
  equals: 'equals',
  on: 'on',
  before: 'before',
  onOrBefore: 'on or before',
  after: 'after',
  onOrAfter: 'on or after',
  between: 'between',
};
const SYMBOLS: Partial<Record<ListFilterOperator, string>> = {
  lessThan: '<',
  lessThanOrEqual: '≤',
  equalTo: '=',
  greaterThanOrEqual: '≥',
  greaterThan: '>',
};

/**
 * Operator label exactly as FSG-0039..0050. With `withSymbol`, numeric operators gain a symbol
 * suffix (FSG-0043; the compound symbols are [suggested]).
 */
export function filterOperatorLabel(op: ListFilterOperator, withSymbol = false): string {
  const s = withSymbol ? SYMBOLS[op] : undefined;
  return s ? `${LABELS[op]} ${s}` : LABELS[op];
}

const parseNumber = (s: string | undefined): number | null => {
  if (s == null || s.trim() === '') return null;
  const n = Number(s);
  return isFinite(n) ? n : null;
};

/** True when the criterion has an attribute, a permitted operator and valid value(s). */
export function isListFilterCriterionComplete<T>(c: ListFilterCriterion, attrs: ListAttribute<T>[]): boolean {
  const attr = attrs.find(a => a.id === c.attributeId);
  if (!attr || !c.operator) return false;
  if (!permittedFilterOperators(attr.dataType).includes(c.operator)) return false;
  const ok = (v: string | undefined) => {
    if (v == null || v.trim() === '') return false;
    switch (attr.dataType) {
      case 'integer': {
        const n = parseNumber(v);
        return n !== null && Number.isInteger(n);
      }
      case 'real':
        return parseNumber(v) !== null;
      case 'date':
      case 'dateTime':
        return toDate(v) !== null;
      case 'ordinal':
        return !attr.options || attr.options.includes(v);
      default:
        return true;
    }
  };
  if (!ok(c.value)) return false;
  if (c.operator === 'between') {
    if (!ok(c.value2)) return false;
  }
  return true;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function toComparable<T>(raw: unknown, attr: ListAttribute<T>): number | string | null {
  if (isListValueMissing(raw)) return null;
  switch (attr.dataType) {
    case 'integer':
    case 'real': {
      const n = typeof raw === 'number' ? raw : parseNumber(String(raw));
      return n;
    }
    case 'ordinal': {
      const i = attr.options ? attr.options.indexOf(String(raw)) : -1;
      return i < 0 ? null : i;
    }
    case 'date': {
      const d = toDate(raw instanceof Date ? raw : String(raw));
      return d ? startOfDay(d) : null;
    }
    case 'dateTime': {
      const d = toDate(raw instanceof Date ? raw : String(raw));
      return d ? d.getTime() : null;
    }
    default:
      return String(raw).trim().toLowerCase();
  }
}

function testCriterion<T>(row: T, c: ListFilterCriterion, attr: ListAttribute<T>): boolean {
  const v = toComparable(readListValue(row, attr), attr);
  if (v === null) return false;
  const a = toComparable(c.value, attr);
  const b = c.operator === 'between' ? toComparable(c.value2 ?? '', attr) : null;
  if (a === null) return false;
  switch (c.operator) {
    case 'equals':
    case 'equalTo':
    case 'on':
      return v === a;
    case 'lessThan':
    case 'before':
      return v < a;
    case 'lessThanOrEqual':
    case 'onOrBefore':
      return v <= a;
    case 'greaterThan':
    case 'after':
      return v > a;
    case 'greaterThanOrEqual':
    case 'onOrAfter':
      return v >= a;
    case 'between': {
      if (b === null) return false;
      const lo = a <= b ? a : b;
      const hi = a <= b ? b : a;
      return v >= lo && v <= hi; // inclusive of both bounds (FSG Table 5)
    }
    default:
      return false;
  }
}

/** Result of applying a filter: filtered-in, filtered-out and all original rows (FSG-0065..0067). */
export interface ListFilterResult<T> {
  filteredIn: T[];
  filteredOut: T[];
  all: T[];
}

/**
 * Apply a filter. Filters say what to KEEP (FSG-0005). Incomplete criteria are ignored; with no complete
 * criteria every row is kept. One combinator for all criteria, OR or AND, no NOT (FSG-0051..0053).
 * Date operators compare whole calendar days; 'between' is inclusive. Rows with no value never match.
 * Throws if a criterion uses an operator the data type does not permit (FSG-0032).
 */
export function evaluateFilter<T>(rows: T[], state: ListFilterState | null | undefined, attrs: ListAttribute<T>[]): ListFilterResult<T> {
  const all = rows.slice();
  if (!state) return { filteredIn: all.slice(), filteredOut: [], all };
  for (const c of state.criteria) {
    const attr = attrs.find(a => a.id === c.attributeId);
    if (attr && c.operator && !permittedFilterOperators(attr.dataType).includes(c.operator)) {
      throw new Error(`Operator "${c.operator}" is not permitted for ${attr.dataType} attribute "${attr.label}"`);
    }
  }
  const active = state.criteria.filter(c => isListFilterCriterionComplete(c, attrs));
  if (!active.length) return { filteredIn: all.slice(), filteredOut: [], all };
  const filteredIn: T[] = [];
  const filteredOut: T[] = [];
  for (const row of rows) {
    const results = active.map(c => testCriterion(row, c, attrs.find(a => a.id === c.attributeId) as ListAttribute<T>));
    const keep = state.combine === 'and' ? results.every(Boolean) : results.some(Boolean);
    (keep ? filteredIn : filteredOut).push(row);
  }
  return { filteredIn, filteredOut, all };
}

function formatFilterValue<T>(v: string, attr: ListAttribute<T>): string {
  let s = v;
  if (attr.dataType === 'date') s = formatShortDate(v) || v;
  if (attr.dataType === 'dateTime') s = formatDateTime(v) || v;
  if (attr.unit && (attr.dataType === 'integer' || attr.dataType === 'real')) s = `${s} ${attr.unit}`;
  return s;
}

/**
 * Filter notification text (FSG-0073): "Data filtered to show " followed by the criteria, joined by
 * " or " / " and " to match the combinator [joining wording suggested]. Returns '' when nothing is active.
 */
export function filterNotificationText<T>(state: ListFilterState | null | undefined, attrs: ListAttribute<T>[]): string {
  if (!state) return '';
  const parts = state.criteria
    .filter(c => isListFilterCriterionComplete(c, attrs))
    .map(c => {
      const attr = attrs.find(a => a.id === c.attributeId) as ListAttribute<T>;
      const op = filterOperatorLabel(c.operator as ListFilterOperator);
      const v1 = formatFilterValue(c.value, attr);
      const v = c.operator === 'between' ? `${v1} and ${formatFilterValue(c.value2 ?? '', attr)}` : v1;
      return `${attr.label} ${op} ${v}`;
    });
  if (!parts.length) return '';
  return `Data filtered to show ${parts.join(state.combine === 'and' ? ' and ' : ' or ')}`;
}
