import { nameSearchKey } from '../../patient';

/*
 * Sounds-alike names for the similar-name warning (PAL-0560) [suggested]. The guidance asks lists to warn about
 * similar names but gives no algorithm. This is a conservative, documented rule a system can pass as `similarNames`
 * to PatientList and HandoverTaskList: each name part (family and given) must either fold to the same text
 * (case, diacritics and macrons ignored, as the AU/NZ default does) or sound alike. "Sound alike" means the same
 * phonetic code (a Soundex-style code over the whole word, the first letter coded too so C/K and PH/F agree) AND a
 * small spelling distance (at most one edit, or one edit in three letters for longer names), so "John"/"Jon",
 * "Smith"/"Smyth", "Catherine"/"Katherine" and "Steven"/"Stephen" are flagged but "John"/"Jane" is not.
 */

const CODE: Record<string, string> = {
  b: '1', f: '1', p: '1', v: '1',
  c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
  d: '3', t: '3',
  l: '4',
  m: '5', n: '5',
  r: '6',
};

/** Letters only, folded (case and diacritics ignored), with "ph" read as "f". */
function foldLetters(value: string | null | undefined): string {
  return nameSearchKey(value).replace(/[^a-z]/g, '').replace(/ph/g, 'f');
}

/** A Soundex-style code of the whole word with the first letter coded (vowels separate repeats; h and w do not). */
export function listPhoneticCode(value: string | null | undefined): string {
  const s = foldLetters(value);
  let out = '';
  let last = '';
  for (const ch of s) {
    const c = CODE[ch];
    if (c) {
      if (c !== last) out += c;
      last = c;
    } else if (ch !== 'h' && ch !== 'w') {
      last = '';
    }
  }
  return out;
}

function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/** One name part: the same once folded, or the same phonetic code with a small spelling distance. */
function partSoundsAlike(x: string | null | undefined, y: string | null | undefined): boolean {
  const a = foldLetters(x);
  const b = foldLetters(y);
  if (a === b) return true;
  if (!a || !b) return false;
  if (listPhoneticCode(a) !== listPhoneticCode(b)) return false;
  return editDistance(a, b) <= Math.max(1, Math.floor(Math.max(a.length, b.length) / 3));
}

/**
 * True when both the family and the given names are the same or sound alike (PAL-0560) [suggested]. Pass it as
 * `similarNames` to PatientList and HandoverTaskList; it includes the AU/NZ rule that names differing only by
 * diacritics or macrons are similar ("Kāhu" and "Kahu").
 */
export function listNamesSoundAlike(
  a: { familyName?: string | null; givenName?: string | null },
  b: { familyName?: string | null; givenName?: string | null },
): boolean {
  return partSoundsAlike(a.familyName, b.familyName) && partSoundsAlike(a.givenName, b.givenName);
}
