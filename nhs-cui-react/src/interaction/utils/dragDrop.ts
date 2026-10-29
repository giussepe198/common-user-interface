/**
 * Pure functions behind the drag and drop controls (G13-drag-and-drop.md): list reordering, moves between columns,
 * insertion from a pointer position, keyboard steps, auto-scroll speed and the words for positions. No React, no DOM.
 */

/** A key the drag model understands while an item is carried (DND-0020). */
export type DragKey = 'up' | 'down' | 'left' | 'right' | 'home' | 'end';

/** Map a KeyboardEvent key to a drag step, or null for keys the model leaves alone. */
export function dragKeyOf(key: string): DragKey | null {
  switch (key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    case 'Home':
      return 'home';
    case 'End':
      return 'end';
    default:
      return null;
  }
}

/** A copy of `list` with the item at `from` moved so that it ends at index `to` (both clamped). */
export function dragReorder<T>(list: readonly T[], from: number, to: number): T[] {
  const out = list.slice();
  if (from < 0 || from >= out.length) return out;
  const [item] = out.splice(from, 1);
  const at = Math.max(0, Math.min(to, out.length));
  out.splice(at, 0, item as T);
  return out;
}

/**
 * Move `key` into column `to` at `index` (its final position there), taking it out of whichever column held it.
 * Columns not touched keep their arrays. An unknown key or column returns the input unchanged.
 */
export function dragMoveBetween(columns: Readonly<Record<string, readonly string[]>>, key: string, to: string, index: number): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [id, keys] of Object.entries(columns)) out[id] = keys.slice();
  if (!out[to]) return out;
  const from = Object.keys(out).find(id => out[id]!.includes(key));
  if (!from) return out;
  out[from] = out[from]!.filter(k => k !== key);
  const target = out[to]!;
  target.splice(Math.max(0, Math.min(index, target.length)), 0, key);
  return out;
}

/** A box on one axis: where it starts and how long it is (top and height, or left and width). */
export interface DragSpan {
  start: number;
  size: number;
}

/**
 * Where an item dropped at `pos` would end up among the other items (whose spans are given in order, without the
 * dragged item): the number of items whose middle lies before `pos`. That is also the item's final index.
 */
export function dragInsertionIndex(pos: number, others: readonly DragSpan[]): number {
  let n = 0;
  for (const s of others) if (s.start + s.size / 2 < pos) n += 1;
  return n;
}

/**
 * How far to scroll a frame this animation frame while the pointer is at `pos` inside the visible range
 * [`start`, `end`]: negative near the start, positive near the end, faster the closer to the edge, 0 elsewhere
 * (DND-0140). `edge` is the band in px; `max` the fastest step in px.
 */
export function dragAutoScrollDelta(pos: number, start: number, end: number, edge = 48, max = 18): number {
  if (end - start <= edge * 2) return 0;
  if (pos < start + edge) return -Math.round(max * Math.min(1, (start + edge - pos) / edge));
  if (pos > end - edge) return Math.round(max * Math.min(1, (pos - (end - edge)) / edge));
  return 0;
}

/** The next index in a list of `count` for a key: up and down by one, home and end to the ends; null for other keys. */
export function dragStepIndex(index: number, count: number, key: DragKey): number | null {
  if (count <= 0) return null;
  if (key === 'up') return Math.max(0, index - 1);
  if (key === 'down') return Math.min(count - 1, index + 1);
  if (key === 'home') return 0;
  if (key === 'end') return count - 1;
  return null;
}

/** "position 3 of 5" (DND-0210). */
export function dragPositionWords(index: number, count: number): string {
  return `position ${index + 1} of ${count}`;
}

/** "1 task", "3 tasks": counts in words for column headings. */
export function dragCountWords(n: number, noun: { one: string; other: string }): string {
  return `${n} ${n === 1 ? noun.one : noun.other}`;
}
