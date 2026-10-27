/**
 * Pure form-state helpers: missed required fields (CNA-1140..1210) and hideable sections (CNA-0960/0970).
 */

export interface RequiredFieldState {
  /** Element id of the field (used for navigation links, CNA-1230). */
  id: string;
  /** Field label as shown on the form. */
  label: string;
  /** Form section heading, used to group the missed list (CNA-1210). */
  section?: string;
  /** Position in the tab order (lower comes first). */
  order: number;
  /** Whether the field is required. */
  required: boolean;
  /** Whether the field currently has no value. */
  empty: boolean;
}

/**
 * Ids of required fields that are empty and sit before `reachedOrder` in the tab order, i.e. the
 * user has moved focus beyond them ("missed", CNA-1150). Returned in tab order.
 */
export function computeMissedRequired(fields: readonly RequiredFieldState[], reachedOrder: number): string[] {
  return fields
    .filter((f) => f.required && f.empty && f.order < reachedOrder)
    .sort((a, b) => a.order - b.order)
    .map((f) => f.id);
}

/** True when a value counts as entered data: not null/undefined/false, not blank text, not an empty array or object. */
export function hasEnteredData(value: unknown): boolean {
  if (value == null || value === false) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !Number.isNaN(value);
  if (Array.isArray(value)) return value.some(hasEnteredData);
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).some(hasEnteredData);
  return true;
}

/**
 * Whether a reveal section may be hidden: false if any of its field values holds data
 * (CNA-0960 do not allow hiding fields that contain data; CNA-0970 disable the hide control).
 */
export function canHideSection(values: readonly unknown[] | Readonly<Record<string, unknown>>): boolean {
  const list = Array.isArray(values) ? values : Object.values(values);
  return !list.some(hasEnteredData);
}
