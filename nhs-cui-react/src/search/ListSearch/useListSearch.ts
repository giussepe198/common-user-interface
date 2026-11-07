import React from 'react';
import { createSmartSearchIndex, type SmartParsedQuery, type SmartSearchField, type SmartSearchHit, type SmartSearchSuggestion } from '../utils/smartSearch';

/** What a list needs from its search: the rows that match, in rank groups, and the words to show. */
export interface ListSearchState<T> {
  /** A query is in force. */
  active: boolean;
  /** The rows to show: all rows without a query; the matches otherwise, exact matches before close ones. */
  rows: T[];
  /** The hit for a row, for highlighting and the explanation. */
  hitOf: (row: T) => SmartSearchHit<T> | undefined;
  query: SmartParsedQuery | null;
  suggestions: SmartSearchSuggestion[];
  /** Some matches are close (a spelling or a sound), not as typed. */
  closeMatches: boolean;
  scopeFields: ReadonlyArray<{ key: string; label: string }>;
  /** Rows (already sorted by the list) with close matches moved after the matches as typed, order kept within. */
  rankOrder: (rows: readonly T[]) => T[];
}

/**
 * Search a list's loaded rows with the smart search engine [suggested]. Without a query every row is returned as given.
 * With one, the matching rows keep the list's own order within each rank group (as typed, then close spellings, then
 * sounds alike), so a sorted list stays sorted where it can.
 */
export function useListSearch<T>(rows: readonly T[], fields: readonly SmartSearchField<T>[], query: string): ListSearchState<T> {
  const index = React.useMemo(() => createSmartSearchIndex(rows, fields), [rows, fields]);
  const result = React.useMemo(() => (query.trim() ? index.search(query) : null), [index, query]);
  return React.useMemo(() => {
    const scopeFields = index.scopeFields.map(f => ({ key: f.key, label: f.label }));
    if (!result || result.empty) {
      return { active: false, rows: rows as T[], hitOf: () => undefined, query: result?.query ?? null, suggestions: [], closeMatches: false, scopeFields, rankOrder: (r: readonly T[]) => r as T[] };
    }
    const byRow = new Map<T, SmartSearchHit<T>>();
    for (const h of result.hits) byRow.set(h.item, h);
    const group = (h: SmartSearchHit<T>) => (h.tier === 'fuzzy' ? 1 : h.tier === 'phonetic' ? 2 : 0);
    const ordered = [...result.hits].sort((a, b) => group(a) - group(b) || a.index - b.index).map(h => h.item);
    return {
      active: true,
      rows: ordered,
      hitOf: (row: T) => byRow.get(row),
      query: result.query,
      suggestions: result.suggestions,
      closeMatches: result.hits.some(h => group(h) > 0),
      scopeFields,
      rankOrder: (r: readonly T[]) => {
        const g = (row: T) => {
          const h = byRow.get(row);
          return h ? group(h) : 0;
        };
        return r.map((row, i) => ({ row, i, g: g(row) })).sort((a, b) => a.g - b.g || a.i - b.i).map(x => x.row);
      },
    };
  }, [index, result, rows]);
}
