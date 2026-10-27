/**
 * Shared types for patient lists, filtering, sorting and grouping (FSG Table 5 / Table 6).
 */

/** FSG Table 5 data types. Drive which filter operators and sort orders are offered. */
export type ListDataType = 'integer' | 'ordinal' | 'unorderedSymbol' | 'string' | 'date' | 'real' | 'dateTime';

/** Filter operators named after the FSG operator labels (FSG-0039..0050). */
export type ListFilterOperator =
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'equalTo'
  | 'greaterThanOrEqual'
  | 'greaterThan'
  | 'equals'
  | 'on'
  | 'before'
  | 'onOrBefore'
  | 'after'
  | 'onOrAfter'
  | 'between';

/** An attribute (column) that can be filtered, sorted or grouped. */
export interface ListAttribute<T = unknown> {
  /** Stable id; also the default property name read from each row. */
  id: string;
  /** Visible label, as in the column header. */
  label: string;
  /** FSG data type (Table 5). */
  dataType: ListDataType;
  /** Explicit order for ordinal types (FSG-0106/0112), or the value set for unordered symbols. */
  options?: string[];
  /** Unit shown in the column header (FSG-0014) and after values in notifications. */
  unit?: string;
  /** Read the raw value from a row. Defaults to `row[id]`. */
  getValue?: (row: T) => unknown;
}

/**
 * One filter criterion: attribute + operator + value on one line (FSG-0016).
 * Values are kept as entered text: numbers as decimal text, dates as YYYY-MM-DD,
 * date-times as YYYY-MM-DDTHH:mm. This keeps the state serialisable for persistence (PAL-0790).
 */
export interface ListFilterCriterion {
  attributeId: string;
  operator: ListFilterOperator | '';
  value: string;
  /** Second value, only for 'between' (FSG-0036). */
  value2?: string;
}

/** Complete filter state. A single logical operator across all criteria (FSG-0053), OR by default (FSG-0027). */
export interface ListFilterState {
  criteria: ListFilterCriterion[];
  combine: 'or' | 'and';
}

/** A sort key. Progressive sorts are an ordered array of keys (FSG-0121). */
export interface ListSortKey {
  attributeId: string;
  direction: 'asc' | 'desc';
}

/** Read a row value for an attribute. */
export function readListValue<T>(row: T, attr: ListAttribute<T>): unknown {
  if (attr.getValue) return attr.getValue(row);
  if (row && typeof row === 'object') return (row as unknown as Record<string, unknown>)[attr.id];
  return undefined;
}

export function isListValueMissing(v: unknown): boolean {
  return v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v));
}
