import React from 'react';
import { Icon, cx, useId, type IconName } from '../../core';

/** One version of the record, a column of the comparison. */
export interface DiffTableVersion {
  id: string;
  /** Column heading, e.g. "Before" or "After (amended 29-Sep-2026 10:14)". */
  label: string;
}

/** One field compared across the versions. */
export interface DiffTableRow {
  id: string;
  /** The field, e.g. "Date of birth". */
  label: string;
  /** One value per version, in version order. A missing value shows `unknownText`, never a blank. */
  values: React.ReactNode[];
  /**
   * Whether the values differ. Default: worked out by comparing the values as text, which only works for strings and
   * numbers; pass it for anything richer.
   */
  changed?: boolean;
  /** The comparison in words when "Changed" and "Same" are not enough, e.g. "Different: choose" [suggested]. */
  status?: { text: string; icon?: IconName };
}

export interface DiffTableProps {
  /** Names the comparison, e.g. "What changed in the amendment of 29-Sep-2026". Shown as the caption. */
  caption: string;
  captionHidden?: boolean;
  /** Two or more versions, oldest first. */
  versions: DiffTableVersion[];
  rows: DiffTableRow[];
  /** Show only the changed rows (an amendment). Default false: every row (a merge comparison). */
  changedOnly?: boolean;
  /** Words for a missing value. Default "Not recorded". */
  unknownText?: string;
  /** Column and status words. Defaults: "Field", "Comparison", "Changed", "Same". */
  labels?: { field?: string; comparison?: string; changed?: string; same?: string };
  className?: string;
}

const isMissing = (v: React.ReactNode) => v === null || v === undefined || v === false || (typeof v === 'string' && v.trim() === '');
const asText = (v: React.ReactNode) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : isMissing(v) ? '' : null);

/** Whether a row's values differ: the explicit flag, else a text comparison of string and number values. */
export function diffTableRowChanged(row: DiffTableRow): boolean {
  if (row.changed !== undefined) return row.changed;
  const texts = row.values.map(asText);
  if (texts.some(t => t === null)) return false;
  return texts.some(t => t !== texts[0]);
}

/**
 * Two or more versions of a record side by side, field by field: an amendment's before and after, or two records to
 * merge. Each changed row says so in words with an icon, and every value after the first that changed is highlighted
 * and marked, so the difference is never shown by colour alone. Earlier values stay readable: nothing is struck out
 *. In a narrow container each field becomes a card with every value labelled by its version.
 */
export function DiffTable({ caption, captionHidden, versions, rows, changedOnly = false, unknownText = 'Not recorded', labels = {}, className }: DiffTableProps) {
  const id = useId('cui-diff');
  const words = { field: 'Field', comparison: 'Comparison', changed: 'Changed', same: 'Same', ...labels };
  const decided = rows.map(r => ({ r, changed: diffTableRowChanged(r) }));
  const shown = changedOnly ? decided.filter(d => d.changed) : decided;
  const changedCount = decided.filter(d => d.changed).length;
  return (
    <div className={cx('cui-diff-table', className)}>
      <div className="cui-diff-table__frame">
        <table className="cui-diff-table__table">
          <caption className="cui-diff-table__caption">
            <span className={cx('cui-diff-table__caption-text', captionHidden && 'cui-visually-hidden')}>{caption}</span>
            <span className="cui-diff-table__summary" id={`${id}-summary`}>{`${changedCount} of ${rows.length} field${rows.length === 1 ? '' : 's'} changed`}</span>
          </caption>
          <thead>
            <tr>
              <th scope="col">{words.field}</th>
              {versions.map(v => (
                <th scope="col" key={v.id}>{v.label}</th>
              ))}
              <th scope="col">{words.comparison}</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={versions.length + 2} className="cui-diff-table__empty">No fields changed</td>
              </tr>
            ) : null}
            {shown.map(({ r, changed }) => (
              <tr key={r.id} className={cx('cui-diff-table__row', changed && 'cui-diff-table__row--changed')}>
                <th scope="row" className="cui-diff-table__field">{r.label}</th>
                {versions.map((v, vi) => {
                  const value = r.values[vi];
                  const missing = isMissing(value);
                  const differs = changed && vi > 0 && asText(value) !== asText(r.values[vi - 1]);
                  const mark = changed && vi > 0 && (differs || asText(value) === null);
                  return (
                    <td key={v.id} data-label={v.label} className={cx('cui-diff-table__value', mark && 'cui-diff-table__value--changed', missing && 'cui-diff-table__value--missing')}>
                      {mark ? (
                        <span className="cui-diff-table__mark">
                          <Icon name="pencil" />
                          <span className="cui-visually-hidden">{`${words.changed}: `}</span>
                        </span>
                      ) : null}
                      <span className="cui-diff-table__text">{missing ? unknownText : value}</span>
                    </td>
                  );
                })}
                <td data-label={words.comparison} className="cui-diff-table__status">
                  <span className={cx('cui-diff-table__chip', changed ? 'cui-diff-table__chip--changed' : 'cui-diff-table__chip--same')}>
                    <Icon name={r.status?.icon ?? (changed ? 'history' : 'check')} />
                    {r.status?.text ?? (changed ? words.changed : words.same)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
