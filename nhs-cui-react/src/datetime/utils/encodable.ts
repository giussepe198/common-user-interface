/**
 * Encodable text model for EncodableTextEditor (CUI Terminology Display Standards for Coded
 * Information v2.0, "displaystandards" 2.1.1, 2.1.5, 2.2). The host's parser supplies the matches;
 * these pure helpers keep them aligned with the text as the user types.
 */

/** A phrase in the text recognised by the host's parser. Offsets are UTF-16 indexes into the text. */
export interface EncodableMatch {
  id: string;
  start: number;
  end: number;
  /**
   * encodable: can be coded on its own (light blue highlight, 2.1.1).
   * elaboration: only meaningful as elaboration of a concept, e.g. "mild" (D: distinguish standalone from elaboration-only).
   * confirmed: the user confirmed the code (grey, bold, locked until unconfirmed, 2.2).
   */
  status: 'encodable' | 'elaboration' | 'confirmed';
  /** Preferred term or synonym of the top match, e.g. "Fever" (announced; never the concept id). */
  label?: string;
  /** Expression this phrase belongs to; phrases with the same id share one marquee (2.1.5). Default: the match id. */
  expressionId?: string;
}

/** One edit: `deleteCount` characters at `start` replaced by `insertText`. */
export interface TextEdit {
  start: number;
  deleteCount: number;
  insertText: string;
}

/** The single edit that turns `before` into `after` (common prefix and suffix). */
export function diffTextEdit(before: string, after: string): TextEdit {
  let p = 0;
  const max = Math.min(before.length, after.length);
  while (p < max && before[p] === after[p]) p++;
  let s = 0;
  while (s < max - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
  return { start: p, deleteCount: before.length - s - p, insertText: after.slice(p, after.length - s) };
}

/** True when the edit changes text inside a confirmed match (confirmed text is locked, displaystandards 2.2). */
export function editTouchesConfirmed(matches: EncodableMatch[], edit: TextEdit): EncodableMatch | null {
  const a = edit.start;
  const b = edit.start + edit.deleteCount;
  for (const m of matches) {
    if (m.status !== 'confirmed') continue;
    if (edit.deleteCount > 0 ? a < m.end && b > m.start : a > m.start && a < m.end) return m;
  }
  return null;
}

/**
 * Move match offsets after an edit. Matches entirely before or after the edit shift; unconfirmed
 * matches the edit touches are dropped (the host's parser re-suggests them); confirmed matches are
 * never touched because the editor refuses those edits.
 */
export function adjustMatchesForEdit(matches: EncodableMatch[], edit: TextEdit): EncodableMatch[] {
  const a = edit.start;
  const b = edit.start + edit.deleteCount;
  const delta = edit.insertText.length - edit.deleteCount;
  const out: EncodableMatch[] = [];
  const word = /\w/;
  for (const m of matches) {
    const shift = () => ({ ...m, start: m.start + delta, end: m.end + delta });
    if (m.status === 'confirmed') {
      out.push(m.start >= b ? shift() : m);
      continue;
    }
    const inside = edit.deleteCount > 0 ? a < m.end && b > m.start : a > m.start && a < m.end;
    const extendsWord =
      edit.deleteCount === 0 &&
      ((a === m.end && word.test(edit.insertText.charAt(0))) || (a === m.start && word.test(edit.insertText.charAt(edit.insertText.length - 1))));
    if (inside || extendsWord) continue;
    out.push(m.start >= b ? shift() : m);
  }
  return out;
}

/** Piece of text for rendering: plain, or part of a match, inside an expression marquee or not. */
export interface EncodableSegment {
  text: string;
  start: number;
  match?: EncodableMatch;
}

export interface EncodableExpressionRun {
  /** Expression id, or null for text outside any expression. */
  expressionId: string | null;
  start: number;
  end: number;
  segments: EncodableSegment[];
}

/**
 * Split the text into runs: text outside expressions, and one run per expression marquee (from its
 * first to its last phrase, including words between). Overlapping expressions are not allowed
 * (2.1.5 must not overlap): a later overlapping expression is shown without its marquee.
 */
export function segmentEncodableText(text: string, matches: EncodableMatch[]): EncodableExpressionRun[] {
  const valid = matches
    .filter(m => m.start >= 0 && m.end <= text.length && m.start < m.end)
    .sort((x, y) => x.start - y.start || y.end - x.end);
  const ms: EncodableMatch[] = [];
  for (const m of valid) if (!ms.length || m.start >= ms[ms.length - 1].end) ms.push(m);

  const groups = new Map<string, { start: number; end: number }>();
  for (const m of ms) {
    const id = m.expressionId ?? m.id;
    const g = groups.get(id);
    groups.set(id, g ? { start: Math.min(g.start, m.start), end: Math.max(g.end, m.end) } : { start: m.start, end: m.end });
  }
  const exprs = [...groups.entries()].sort((x, y) => x[1].start - y[1].start);
  const kept: Array<{ id: string; start: number; end: number }> = [];
  for (const [id, r] of exprs) if (!kept.length || r.start >= kept[kept.length - 1].end) kept.push({ id, ...r });

  const segmentsIn = (start: number, end: number): EncodableSegment[] => {
    const out: EncodableSegment[] = [];
    let pos = start;
    for (const m of ms) {
      if (m.end <= start || m.start >= end) continue;
      const s = Math.max(m.start, start);
      const e = Math.min(m.end, end);
      if (s > pos) out.push({ text: text.slice(pos, s), start: pos });
      out.push({ text: text.slice(s, e), start: s, match: m });
      pos = e;
    }
    if (pos < end) out.push({ text: text.slice(pos, end), start: pos });
    return out;
  };

  const runs: EncodableExpressionRun[] = [];
  let pos = 0;
  for (const k of kept) {
    if (k.start > pos) runs.push({ expressionId: null, start: pos, end: k.start, segments: segmentsIn(pos, k.start) });
    runs.push({ expressionId: k.id, start: k.start, end: k.end, segments: segmentsIn(k.start, k.end) });
    pos = k.end;
  }
  if (pos < text.length || !runs.length) runs.push({ expressionId: null, start: pos, end: text.length, segments: segmentsIn(pos, text.length) });
  return runs;
}

/** The match containing a caret position (start inclusive, end inclusive), or null. */
export function matchAtCaret(matches: EncodableMatch[], caret: number): EncodableMatch | null {
  return matches.find(m => caret >= m.start && caret <= m.end) ?? null;
}

/** Next end of word after `pos` (for extending a boundary by one word), or `pos` at the end of text. */
export function nextWordEnd(text: string, pos: number): number {
  let i = pos;
  while (i < text.length && /\s|[.,;:]/.test(text[i])) i++;
  while (i < text.length && !/\s|[.,;:]/.test(text[i])) i++;
  return i;
}

/** Previous end of word before `pos` (for shrinking a boundary by one word). */
export function previousWordEnd(text: string, pos: number): number {
  let i = pos;
  while (i > 0 && !/\s/.test(text[i - 1])) i--;
  while (i > 0 && /\s|[.,;:]/.test(text[i - 1])) i--;
  return i;
}

/** Start of the previous word before `pos`. */
export function previousWordStart(text: string, pos: number): number {
  let i = pos;
  while (i > 0 && /\s|[.,;:]/.test(text[i - 1])) i--;
  while (i > 0 && !/\s|[.,;:]/.test(text[i - 1])) i--;
  return i;
}

/** Start of the next word after the word at `pos`. */
export function nextWordStart(text: string, pos: number): number {
  let i = pos;
  while (i < text.length && !/\s|[.,;:]/.test(text[i])) i++;
  while (i < text.length && /\s|[.,;:]/.test(text[i])) i++;
  return i;
}

/** Which marquee handle is being dragged. */
export type MarqueeEdge = 'start' | 'end';

/** Bounds of the expression's sentence: full stop (not between digits) or line break (2.1.5). */
function sentenceBounds(text: string, from: number, to: number): [number, number] {
  const isStop = (i: number) => text[i] === '\n' || (text[i] === '.' && !(/\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '')));
  let s = from;
  while (s > 0 && !isStop(s - 1)) s--;
  let e = to;
  while (e < text.length && !isStop(e)) e++;
  return [s, e];
}

/**
 * Offsets a marquee handle can snap to while dragged with the mouse (2.1.5: drag the handles to
 * include or exclude text): word starts for the start handle, word ends for the end handle, within
 * the expression's sentence, keeping at least one word, and never across another confirmed phrase.
 */
export function marqueeDragCandidates(text: string, match: Pick<EncodableMatch, 'id' | 'start' | 'end'>, others: readonly EncodableMatch[], edge: MarqueeEdge): number[] {
  const [s, e] = sentenceBounds(text, match.start, match.end);
  const locked = others.filter(o => o.id !== match.id && o.status === 'confirmed');
  const out: number[] = [];
  for (const w of text.slice(s, e).matchAll(/[^\s.,;:]+/g)) {
    const ws = s + (w.index ?? 0);
    const we = ws + w[0].length;
    const [start, end] = edge === 'start' ? [ws, match.end] : [match.start, we];
    if (start >= end) continue;
    if (locked.some(o => start < o.end && end > o.start)) continue;
    out.push(edge === 'start' ? ws : we);
  }
  return out;
}

/** The candidate whose on-screen position is nearest the pointer (line distance weighted over horizontal). */
export function nearestMarqueeOffset(candidates: readonly number[], positionOf: (offset: number) => { x: number; y: number } | null, point: { x: number; y: number }): number | null {
  let best: number | null = null;
  let bestD = Infinity;
  for (const c of candidates) {
    const p = positionOf(c);
    if (!p) continue;
    const d = Math.abs(p.x - point.x) + Math.abs(p.y - point.y) * 4;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}
