/** Selection, ordering and timestamp rules for previous values (CNA-1260..1470). Internal. */
import { formatShortDate, formatTime, toDate, type DateLike } from '../../core/format';

export interface PreviousValue {
  value: number;
  recordedAt: DateLike;
}

export interface PreviousValueRow {
  value: number;
  recordedAt: Date;
  /** Formatted value with fixed decimal places (CNA-1350). */
  valueText: string;
  /** Date, plus 24-hour time when another shown value falls on the same day (CNA-1440/1450). */
  when: string;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Keep the `maxCount` most recent values, then order them: ascending value when the panel sits
 * above the field (CNA-1390), otherwise most recent first (consistent order, CNA-1360).
 */
export function selectPreviousValues(
  values: readonly PreviousValue[],
  options: { maxCount?: number; order?: 'ascending-value' | 'chronological'; decimals?: number } = {},
): PreviousValueRow[] {
  const { maxCount = 3, order = 'ascending-value', decimals } = options;
  const dated = values
    .map((v) => ({ value: v.value, recordedAt: toDate(v.recordedAt) }))
    .filter((v): v is { value: number; recordedAt: Date } => v.recordedAt !== null && Number.isFinite(v.value))
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
    .slice(0, Math.max(0, maxCount));
  const counts = new Map<string, number>();
  for (const v of dated) counts.set(dayKey(v.recordedAt), (counts.get(dayKey(v.recordedAt)) ?? 0) + 1);
  const rows = dated.map((v) => ({
    value: v.value,
    recordedAt: v.recordedAt,
    valueText: decimals != null ? v.value.toFixed(decimals) : String(v.value),
    when: (counts.get(dayKey(v.recordedAt)) ?? 0) > 1 ? `${formatShortDate(v.recordedAt)} ${formatTime(v.recordedAt)}` : formatShortDate(v.recordedAt),
  }));
  if (order === 'ascending-value') rows.sort((a, b) => a.value - b.value || b.recordedAt.getTime() - a.recordedAt.getTime());
  return rows;
}
