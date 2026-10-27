/**
 * Spoken numbers for dictation: words as a speech engine writes them ("one hundred and twelve", "thirty eight
 * point four", "one ten on seventy") turned into values, and the teen and ty confusions ("fifteen" and "fifty")
 * that a listener or a recogniser can mishear. Pure functions, no React.
 *
 * Nothing here guesses: a phrase that is not entirely a number gives null, and a phrase that could be heard two
 * ways returns both readings so the review step can ask (Phase 4: dictation never auto-commits).
 */

const UNITS: Record<string, number> = {
  zero: 0, oh: 0, nought: 0, naught: 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
};
const TEENS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
/** Teen word and the ty word it is confused with (13 to 19 and 30 to 90). */
const TEEN_TY: Array<[string, string]> = [
  ['thirteen', 'thirty'], ['fourteen', 'forty'], ['fifteen', 'fifty'], ['sixteen', 'sixty'],
  ['seventeen', 'seventy'], ['eighteen', 'eighty'], ['nineteen', 'ninety'],
];
const SWAP: Record<string, string> = Object.fromEntries(TEEN_TY.flatMap(([a, b]) => [[a, b], [b, a], ...(b === 'forty' ? [['fourty', a]] : [])]));

/** Words that join the two numbers of a blood pressure ("110 on 70", "110 over 70"). */
const PAIR_JOINERS = new Set(['on', 'over', '/']);
const DECIMAL_WORDS = new Set(['point', 'decimal', 'dot', '.']);

/** A value read from a spoken or typed number. */
export interface SpokenNumberValue {
  /** The number (for a pair, the first: the systolic blood pressure). */
  value: number;
  /** Second number of a pair, e.g. 70 in "one ten on seventy" (diastolic blood pressure). */
  second?: number;
  /** Canonical text: "112", "38.4", "110/70". */
  text: string;
  /** How the number was said [suggested]: 'digits' (engine wrote digits), 'words', 'colloquial' ("one ten" = 110), 'digit-sequence' ("nine three" = 93). */
  form: 'digits' | 'words' | 'colloquial' | 'digit-sequence';
}

const isNumberWord = (w: string) => w in UNITS || w in TEENS || w in TENS || w === 'hundred' || w === 'thousand';
const isDigits = (w: string) => /^\d+(\.\d+)?$/.test(w);

/** Lower-case words, hyphens and commas in numbers removed ("ninety-three", "1,000"), "/" kept as a word. */
export function tokeniseSpokenNumber(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/(\d)\s*\/\s*(\d)/g, '$1 / $2')
    .replace(/[-–]/g, ' ')
    .replace(/[^a-z0-9./ ]+/g, ' ')
    .split(/\s+/)
    .map(w => (/^\.\d+$/.test(w) ? `0${w}` : w === '.' || w === '/' ? w : w.replace(/^\.+|\.+$/g, '')))
    .filter(Boolean);
}

interface Parsed {
  value: number;
  next: number;
}

function below100(t: string[], i: number): Parsed | null {
  const w = t[i];
  if (w === undefined) return null;
  if (w in TEENS) return { value: TEENS[w], next: i + 1 };
  if (w in TENS) {
    const u = t[i + 1];
    if (u !== undefined && u in UNITS && UNITS[u] > 0 && u !== 'oh') return { value: TENS[w] + UNITS[u], next: i + 2 };
    return { value: TENS[w], next: i + 1 };
  }
  if (w in UNITS && w !== 'oh') return { value: UNITS[w], next: i + 1 };
  return null;
}

function below1000(t: string[], i: number): Parsed | null {
  const w = t[i];
  if ((w === 'a' || (w in UNITS && UNITS[w] > 0)) && t[i + 1] === 'hundred') {
    const h = (w === 'a' ? 1 : UNITS[w]) * 100;
    let j = i + 2;
    const and = t[j] === 'and';
    if (and) j++;
    const rest = below100(t, j);
    if (rest) return { value: h + rest.value, next: rest.next };
    return and ? null : { value: h, next: j };
  }
  return below100(t, i);
}

/** Standard English: "one hundred and twelve", "two thousand five hundred", "thirty eight". */
function standard(t: string[]): number | null {
  if (!t.length) return null;
  let i = 0;
  let total = 0;
  if ((t[0] === 'a' || isNumberWord(t[0])) && t.includes('thousand')) {
    const k = t.indexOf('thousand');
    const head = k === 1 && t[0] === 'a' ? { value: 1, next: 1 } : below1000(t, 0);
    if (!head || head.next !== k) return null;
    total = head.value * 1000;
    i = k + 1;
    if (i === t.length) return total;
    if (t[i] === 'and') i++;
  }
  const rest = below1000(t, i);
  if (!rest || rest.next !== t.length) return null;
  return total + rest.value;
}

/** Clinical shorthand: "one ten" = 110, "one twelve" = 112, "one oh five" = 105, "two twenty five" = 225. */
function colloquial(t: string[]): number | null {
  if (t.length < 2 || !(t[0] in UNITS) || UNITS[t[0]] === 0) return null;
  const h = UNITS[t[0]] * 100;
  if ((t[1] === 'oh' || t[1] === 'zero') && t.length === 3 && t[2] in UNITS && UNITS[t[2]] > 0) return h + UNITS[t[2]];
  if (!(t[1] in TEENS) && !(t[1] in TENS)) return null;
  const rest = below100(t, 1);
  return rest && rest.next === t.length ? h + rest.value : null;
}

/** Digit by digit: "nine three" = 93. Only plain digits 0 to 9. */
function digitSequence(t: string[]): string | null {
  if (t.length < 2 || !t.every(w => w in UNITS)) return null;
  return t.map(w => String(UNITS[w])).join('');
}

function integerPart(t: string[]): { value: number; form: SpokenNumberValue['form'] } | null {
  if (t.length === 1 && /^\d+$/.test(t[0])) return { value: Number(t[0]), form: 'digits' };
  const s = standard(t);
  if (s !== null) return { value: s, form: 'words' };
  const c = colloquial(t);
  if (c !== null) return { value: c, form: 'colloquial' };
  const d = digitSequence(t);
  if (d !== null) return { value: Number(d), form: 'digit-sequence' };
  return null;
}

function fractionDigits(t: string[]): string | null {
  if (!t.length) return null;
  if (t.length === 1 && /^\d+$/.test(t[0])) return t[0];
  if (t.every(w => w in UNITS)) return t.map(w => String(UNITS[w])).join('');
  return null;
}

function single(t: string[]): { value: number; text: string; form: SpokenNumberValue['form'] } | null {
  if (!t.length) return null;
  if (t.length === 1 && isDigits(t[0])) return { value: Number(t[0]), text: String(Number(t[0])), form: 'digits' };
  const p = t.findIndex(w => DECIMAL_WORDS.has(w));
  if (p >= 0) {
    const intTokens = t.slice(0, p);
    const ip = intTokens.length ? integerPart(intTokens) : { value: 0, form: 'words' as const };
    const frac = fractionDigits(t.slice(p + 1));
    if (!ip || frac === null) return null;
    const text = `${ip.value}.${frac}`;
    return { value: Number(text), text, form: ip.form };
  }
  const ip = integerPart(t);
  return ip ? { value: ip.value, text: String(ip.value), form: ip.form } : null;
}

/**
 * Read a spoken or typed number. The whole text must be a number (or a blood pressure pair), otherwise null:
 * "one hundred and twelve" 112, "thirty eight point four" 38.4, "ninety three" 93, "one ten" 110,
 * "one ten on seventy" 110/70, "110 over 70" 110/70, "nine three" 93, "point five" 0.5, "38.4" 38.4.
 * Teen and ty confusions are not resolved here; use findAmbiguousSpokenNumbers or spokenNumberReadings.
 */
export function spokenNumberToValue(text: string): SpokenNumberValue | null {
  const t = tokeniseSpokenNumber(text);
  if (!t.length) return null;
  const j = t.findIndex(w => PAIR_JOINERS.has(w));
  if (j > 0) {
    const a = single(t.slice(0, j));
    const b = single(t.slice(j + 1));
    if (!a || !b) return null;
    return { value: a.value, second: b.value, text: `${a.text}/${b.text}`, form: a.form === b.form ? a.form : [a.form, b.form].find(f => f === 'colloquial' || f === 'digit-sequence') ?? 'words' };
  }
  const s = single(t);
  return s ? { value: s.value, text: s.text, form: s.form } : null;
}

/** Whether a word is a teen or ty word that can be confused with its partner. */
export function isTeenTyWord(word: string): boolean {
  return word.toLowerCase() in SWAP;
}

function swapDigits(text: string): string | null {
  // Last two digits of the integer part: 13..19 <-> 30..90.
  const m = /^(\d*?)(\d{2})(\.\d+)?$/.exec(text);
  if (!m) return null;
  const n = Number(m[2]);
  let alt: number | null = null;
  if (n >= 13 && n <= 19) alt = (n - 10) * 10;
  else if (n >= 30 && n <= 90 && n % 10 === 0) alt = n / 10 + 10;
  if (alt === null) return null;
  return `${m[1]}${alt}${m[3] ?? ''}`;
}

/**
 * Every reading of a spoken number when teen and ty words are swapped one at a time, the heard reading first.
 * "fifteen" gives [15, 50]; "one fifteen" gives [115, 150]; "one ten on seventy" gives 110/70 and 110/17.
 * With `digits` (default true) digits are treated the same way, because an engine that writes "50" may have heard
 * "fifteen". Returns [] when the text is not a number.
 */
export function spokenNumberReadings(text: string, options: { digits?: boolean } = {}): SpokenNumberValue[] {
  const heard = spokenNumberToValue(text);
  if (!heard) return [];
  const out: SpokenNumberValue[] = [heard];
  const seen = new Set([heard.text]);
  const add = (v: SpokenNumberValue | null) => {
    if (v && !seen.has(v.text)) {
      seen.add(v.text);
      out.push(v);
    }
  };
  const t = tokeniseSpokenNumber(text);
  t.forEach((w, i) => {
    const sw = SWAP[w];
    if (!sw) return;
    // "fifty five" cannot be "fifteen five": a ty word followed by a unit is not ambiguous.
    if (w in TENS && t[i + 1] !== undefined && t[i + 1] in UNITS && UNITS[t[i + 1]] > 0) return;
    const copy = t.slice();
    copy[i] = sw;
    add(spokenNumberToValue(copy.join(' ')));
  });
  if (options.digits !== false) {
    t.forEach((w, i) => {
      if (!isDigits(w)) return;
      const sw = swapDigits(w);
      if (!sw) return;
      const copy = t.slice();
      copy[i] = sw;
      add(spokenNumberToValue(copy.join(' ')));
    });
  }
  return out;
}

/** A number in a transcript that could have been heard two ways. */
export interface AmbiguousSpokenNumber {
  /** Offsets of the number in the transcript. */
  start: number;
  end: number;
  /** The words as heard. */
  text: string;
  /** Every reading, the heard reading first. Always two or more. */
  candidates: SpokenNumberValue[];
}

/** A run of number words found in free text. */
export interface SpokenNumberSpan {
  start: number;
  end: number;
  text: string;
  value: SpokenNumberValue;
}

const WORD_RE = /[A-Za-z][A-Za-z0-9]*|\d+(?:[.,]\d+)*|\//g;

interface Word {
  w: string;
  start: number;
  end: number;
}

function words(text: string): Word[] {
  const out: Word[] = [];
  let m: RegExpExecArray | null;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(text))) out.push({ w: m[0].toLowerCase().replace(/,(?=\d{3}\b)/g, ''), start: m.index, end: m.index + m[0].length });
  return out;
}

const canStart = (w: string) => w in UNITS || w in TEENS || w in TENS || isDigits(w) || w === 'point';
const canContinue = (w: string, pairs: boolean) =>
  canStart(w) || w === 'hundred' || w === 'thousand' || w === 'and' || DECIMAL_WORDS.has(w) || (pairs && PAIR_JOINERS.has(w));

/**
 * Number phrases in free text, longest first from the left: "sats ninety three, BP one ten on seventy" gives
 * "ninety three" (93) and "one ten on seventy" (110/70). `pairs` (default true) joins "on", "over" and "/".
 * "a" is only read as one before "hundred" or "thousand" [suggested].
 */
export function findSpokenNumbers(text: string, options: { pairs?: boolean } = {}): SpokenNumberSpan[] {
  const pairs = options.pairs !== false;
  const ws = words(text);
  const out: SpokenNumberSpan[] = [];
  let i = 0;
  while (i < ws.length) {
    const startsWithA = ws[i].w === 'a' && (ws[i + 1]?.w === 'hundred' || ws[i + 1]?.w === 'thousand');
    if (!canStart(ws[i].w) && !startsWithA) {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < ws.length && canContinue(ws[j].w, pairs)) j++;
    // Shrink from the right until the run is a number ("ninety three and" -> "ninety three").
    let found: SpokenNumberSpan | null = null;
    for (let k = j; k > i; k--) {
      const s = ws[i].start;
      const e = ws[k - 1].end;
      const v = spokenNumberToValue(text.slice(s, e));
      if (v) {
        found = { start: s, end: e, text: text.slice(s, e), value: v };
        j = k;
        break;
      }
    }
    if (found) {
      out.push(found);
      i = j;
    } else i++;
  }
  return out;
}

/**
 * Numbers in a transcript that could be a teen or a ty number ("fifteen" or "fifty", "thirteen" or "thirty"),
 * with every reading. Use the parameter's plausible range to drop readings that cannot be right before asking
 * (parseSpokenObservations does this). Digits are included unless `digits: false`.
 */
export function findAmbiguousSpokenNumbers(text: string, options: { digits?: boolean; pairs?: boolean } = {}): AmbiguousSpokenNumber[] {
  return findSpokenNumbers(text, options)
    .map(s => ({ start: s.start, end: s.end, text: s.text, candidates: spokenNumberReadings(s.text, options) }))
    .filter(a => a.candidates.length > 1);
}
