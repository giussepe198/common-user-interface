/**
 * Number pad editing rules. Pure functions, no React.
 */

/** A key on the number pad. */
export type NumberPadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'delete' | 'clear';

export interface NumberPadRules {
  /** Allow one decimal point. Default false. */
  allowDecimal?: boolean;
  /** Most digits after the decimal point. Default 2 when decimals are allowed. */
  maxDecimals?: number;
  /** Most characters in total, including the point. Default 6. */
  maxLength?: number;
}

/**
 * Apply one key press to the text being entered. Rules [suggested, safe numeric entry]:
 * a leading point becomes "0." (never ".5", which can be misread as 5); no second point; no leading zeros
 * ("07" becomes "7"); limits on length and decimal places; delete removes the last character.
 */
export function applyNumberPadKey(text: string, key: NumberPadKey, rules: NumberPadRules = {}): string {
  const allowDecimal = rules.allowDecimal ?? false;
  const maxDecimals = rules.maxDecimals ?? 2;
  const maxLength = rules.maxLength ?? 6;
  if (key === 'clear') return '';
  if (key === 'delete') {
    const next = text.slice(0, -1);
    return next === '0' && text.startsWith('0.') ? '' : next;
  }
  if (key === '.') {
    if (!allowDecimal || text.includes('.')) return text;
    const next = text === '' ? '0.' : `${text}.`;
    return next.length > maxLength ? text : next;
  }
  // digit
  const dot = text.indexOf('.');
  if (dot >= 0 && text.length - dot - 1 >= maxDecimals) return text;
  if (text === '0') return key;
  const next = text + key;
  return next.length > maxLength ? text : next;
}

/** Number from entered text, or null when empty or incomplete ("12." gives 12). */
export function parseNumberPadValue(text: string): number | null {
  if (!text || text === '.') return null;
  const n = Number(text.endsWith('.') ? text.slice(0, -1) : text);
  return isFinite(n) ? n : null;
}

/** Map a keyboard key to a pad key, or null. Supports digits, "." and ",", Backspace, Delete and Escape. */
export function numberPadKeyFromKeyboard(key: string): NumberPadKey | null {
  if (/^[0-9]$/.test(key)) return key as NumberPadKey;
  if (key === '.' || key === ',' || key === 'Decimal') return '.';
  if (key === 'Backspace') return 'delete';
  if (key === 'Delete') return 'clear';
  return null;
}
