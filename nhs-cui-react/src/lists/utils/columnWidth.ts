/** Width in px of the longest unbreakable word in a text, measured with `measure`. */
export function listLongestWordWidth(text: string, measure: (t: string) => number): number {
  let max = 0;
  for (const w of text.split(/\s+/)) if (w) max = Math.max(max, measure(w));
  return max;
}

/**
 * Automatic column widening after a content update (PAL-0270): each column whose longest element (plus margins) now
 * exceeds its width is widened to fit; columns are never narrowed and other columns are unchanged (PAL-0220).
 * Returns the new widths, or null when nothing changes.
 */
export function listAutoWidenColumns(widths: Record<string, number>, required: Record<string, number>): Record<string, number> | null {
  let changed = false;
  const out = { ...widths };
  for (const [id, need] of Object.entries(required)) {
    const cur = out[id];
    if (cur !== undefined && need > cur + 0.5) {
      out[id] = Math.ceil(need);
      changed = true;
    }
  }
  return changed ? out : null;
}
