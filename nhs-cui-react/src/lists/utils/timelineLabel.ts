/** Result of fitting a timeline label into the space left before the right edge of the viewing area. */
export interface TimelineLabelFit {
  /** Text to draw (may be just the truncation symbol). */
  text: string;
  /** True when anything was left out; show the full text another way (tooltip, accessible name) (TLN-0500). */
  truncated: boolean;
  /** The complete label text. */
  fullText: string;
}

const ELLIPSIS = '…';

/**
 * Fit a label made of fields (the first is the name, e.g. the drug name) into `availablePx` (TLN-0500..0560).
 * Never wraps and never shifts left. Whole trailing fields are dropped until it fits, followed by an ellipsis.
 * The name is never partially shown: if it does not fit, only the ellipsis remains. Pass `allowCharacterTruncation`
 * for free-text labels that are not medication details, which may be cut by character.
 */
export function timelineFitLabel(
  fields: string[],
  availablePx: number,
  measure: (text: string) => number,
  opts: { allowCharacterTruncation?: boolean } = {},
): TimelineLabelFit {
  const parts = fields.filter(f => f && f.trim() !== '');
  const fullText = parts.join(' ');
  if (measure(fullText) <= availablePx) return { text: fullText, truncated: false, fullText };
  for (let n = parts.length - 1; n >= 1; n--) {
    const t = `${parts.slice(0, n).join(' ')} ${ELLIPSIS}`;
    if (measure(t) <= availablePx) return { text: t, truncated: true, fullText };
  }
  if (opts.allowCharacterTruncation) {
    let t = fullText;
    while (t.length > 1 && measure(`${t}${ELLIPSIS}`) > availablePx) t = t.slice(0, -1);
    if (t.length > 1) return { text: `${t.trimEnd()}${ELLIPSIS}`, truncated: true, fullText };
  }
  return { text: ELLIPSIS, truncated: true, fullText };
}
