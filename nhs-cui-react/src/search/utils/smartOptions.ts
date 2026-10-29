import type { FormOption } from '../../forms/utils/formOptions';
import { createSmartSearchIndex, smartHitRanges, smartMatchNote, type SmartFieldKind, type SmartSearchField } from './smartSearch';

const fieldsFor = (kind: SmartFieldKind): SmartSearchField<FormOption>[] => [
  { key: 'label', label: 'Name', kind, get: o => o.label },
  { key: 'description', label: 'Details', kind: 'text', get: o => o.description ?? null },
  // Codes and identifiers in the value ("F32.1", a record number) match exactly or by their start.
  { key: 'value', label: 'Code', kind: 'identifier', get: o => o.value, scope: false },
];

/**
 * Options ranked by the smart search [suggested]: words in any order at the start of words, then within words, then
 * close spellings and, for names, similar sounds; each option carries its matched ranges and, for a close match, the
 * words that say why. Empty text returns the options unchanged.
 */
export function smartFilterFormOptions<T extends FormOption>(options: readonly T[], query: string, kind: SmartFieldKind = 'text'): T[] {
  if (!query.trim()) return options.slice();
  const res = createSmartSearchIndex<FormOption>(options, fieldsFor(kind)).search(query, { suggest: false });
  return res.hits.map(h => annotate(h.item as T, h));
}

/**
 * Options found elsewhere (a server search), in their own order, marked with what matched and why [suggested].
 * Options the engine cannot explain are kept as they are: the server decided they match.
 */
export function smartAnnotateFormOptions<T extends FormOption>(options: readonly T[], query: string, kind: SmartFieldKind = 'text'): T[] {
  if (!query.trim()) return options.slice();
  const res = createSmartSearchIndex<FormOption>(options, fieldsFor(kind)).search(query, { suggest: false });
  const byItem = new Map(res.hits.map(h => [h.item, h]));
  return options.map(o => {
    const h = byItem.get(o);
    return h ? annotate(o, h) : o;
  });
}

function annotate<T extends FormOption>(o: T, h: Parameters<typeof smartMatchNote>[0] & { matches: Parameters<typeof smartHitRanges>[0]['matches'] }): T {
  const ranges = smartHitRanges(h, 'label');
  const note = smartMatchNote(h);
  return { ...o, matchRanges: ranges, ...(note && !o.matchNote ? { matchNote: note } : {}) };
}
