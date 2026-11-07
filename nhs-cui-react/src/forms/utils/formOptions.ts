/** One choice offered by Select, Combobox, MultiSelect, CheckboxGroup or RadioGroup. */
export interface FormOption {
  /** Stored value; unique within the list. */
  value: string;
  /** Visible text: short, positive phrasing, sentence case (CNA-2060, CNA-2080). */
  label: string;
  /** Second line of quieter text (Combobox and MultiSelect lists, check box and radio options). */
  description?: string;
  /** Shown but not choosable. */
  disabled?: boolean;
  /** Group heading (Select optgroup; Combobox and MultiSelect group rows). Options of a group must be adjacent. */
  group?: string;
  /** Language of the label when it is not English, e.g. "mi" (WCAG 3.1.2). */
  lang?: string;
  /** Character ranges of the label to mark as matched; default the typed words found in it [suggested]. */
  matchRanges?: ReadonlyArray<readonly [number, number]>;
  /** Why a close match matched, in words ("Sounds like "kathryn"") [suggested]. */
  matchNote?: string;
  /** A warning shown with the warning symbol ("Similar name to another person in this list") [suggested]. */
  warning?: string;
}

/** Lower case with diacritics (macrons included) removed, for matching only; never for display. */
export function foldFormText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * Options whose label (or description) contains every word typed, ignoring case and macrons. Options whose label
 * starts with the text come first; the given order is otherwise kept (CNA-1890 logical order). Empty text returns
 * the list unchanged.
 */
export function filterFormOptions<T extends FormOption>(options: readonly T[], query: string): T[] {
  const words = foldFormText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return options.slice();
  const q = words.join(' ');
  const starts: T[] = [];
  const rest: T[] = [];
  for (const o of options) {
    const hay = foldFormText(`${o.label} ${o.description ?? ''}`);
    if (!words.every((w) => hay.includes(w))) continue;
    (foldFormText(o.label).startsWith(q) ? starts : rest).push(o);
  }
  return [...starts, ...rest];
}

/** Character ranges of `label` that match the typed words, for highlighting (case and macron insensitive). */
export function formOptionMatchRanges(label: string, query: string): Array<[number, number]> {
  const words = foldFormText(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  // NFD folding keeps one character per base letter for Latin text with combining marks, so indexes line up
  // as long as each source character folds to exactly one character; otherwise skip highlighting.
  const folded = foldFormText(label);
  if (folded.length !== label.length) return [];
  const ranges: Array<[number, number]> = [];
  for (const w of words) {
    let from = 0;
    for (;;) {
      const i = folded.indexOf(w, from);
      if (i < 0) break;
      ranges.push([i, i + w.length]);
      from = i + w.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/** File size for people: "512 bytes", "12 KB", "3.4 MB" (1 KB = 1024 bytes). */
export function formatFormFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;
  const units = ['KB', 'MB', 'GB'];
  let v = bytes / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v >= 10 ? Math.round(v) : Math.round(v * 10) / 10} ${units[u]}`;
}

/**
 * Whether a file matches an `accept` list as the native file input reads it: comma-separated extensions
 * (".pdf"), exact media types ("application/pdf") or wildcards ("image/*"). An empty list accepts everything.
 */
export function fileMatchesAccept(file: { name: string; type: string }, accept?: string): boolean {
  const rules = (accept ?? '').split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((r) => {
    if (r.startsWith('.')) return name.endsWith(r);
    if (r.endsWith('/*')) return type.startsWith(r.slice(0, -1));
    return type === r;
  });
}
