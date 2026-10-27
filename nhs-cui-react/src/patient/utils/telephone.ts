/**
 * Telephone number formatting and validation per region.
 * GB: CUI TID-0001..0019 and Appendix A (unchanged). AU: Australian Government Style Manual and AU-PH-01/02 (G10 section 7).
 * NZ: G11 section 6 (NAD register via secondary source) and HISO 10046 storage. Pure functions, no React.
 */
import type { ClinicalRegion } from '../../core/locale';
import { ITU_COUNTRY_CODES } from './countries';

/** Six-digit UK area codes (Appendix A rule 12c). */
export const SIX_DIGIT_AREA_CODES: ReadonlyArray<string> = [
  '013873', '015242', '015394', '015395', '015396', '016973', '016974', '017683', '017684', '017687', '019467',
];

/* ------------------------------------------------------------------ */
/* Telephone                                                          */
/* ------------------------------------------------------------------ */

/** Characters treated as separators [suggested: the guide does not define them]. */
const SEPARATOR = /[ \-.()/]/;
const SEPARATORS_G = /[ \-.()/]+/g;
const ONLY_DIGITS_AND_SEPARATORS = /^[\d \-.()/]*$/;
const EXTENSION = /\s*(?:extension number|extension|extn|ext|ex|x)\s*[.:=-]?\s*(\d+)\s*$/i;

export interface FormattedTelephoneNumber {
  /** The value to show. Unrecognised input is returned exactly as entered (trimmed), TID-0015. */
  display: string;
  /** True when the number was identified and reformatted (TID-0013). */
  recognised: boolean;
  /** Extension digits, if any (Appendix A Part II). */
  extension?: string;
}

function groupFromRight(digits: string): string {
  const groups: string[] = [];
  let rest = digits;
  while (rest.length > 6) {
    groups.unshift(rest.slice(-4));
    rest = rest.slice(0, -4);
  }
  if (rest) groups.unshift(rest);
  return groups.join(' ');
}

function splitLocal(rest: string): string {
  return rest.length > 6 ? `${rest.slice(0, -4)} ${rest.slice(-4)}` : rest;
}

/** UK national number (leading 0) per Appendix A rules 11-16. */
function formatUkNationalNumber(raw: string): string | null {
  if (!ONLY_DIGITS_AND_SEPARATORS.test(raw)) return null;
  const d = raw.replace(SEPARATORS_G, '');
  if (!/^0\d{9,10}$/.test(d)) return null;
  let at: number;
  if (d.startsWith('01') || d.startsWith('02')) {
    if (d.startsWith('02')) at = 3;
    else if (d[2] === '1' || d[3] === '1') at = 4;
    else if (SIX_DIGIT_AREA_CODES.includes(d.slice(0, 6))) at = 6;
    else at = 5;
  } else if (/^0[3-7]/.test(d)) at = 5;
  else if (/^0[89]/.test(d)) at = 4;
  else return null;
  return `${d.slice(0, at)} ${splitLocal(d.slice(at))}`;
}

/**
 * GB telephone number display per TID-0001..0019 and Appendix A. UK numbers never show "+44"
 * (TID-0001, TID-0016); other countries keep "+CC " (TID-0002..0004, TID-0017, TID-0019);
 * extensions become " x1234" (TID-0007, TID-0008). Anything not identifiable is returned as entered.
 */
function formatGbTelephoneNumber(raw: string | null | undefined): FormattedTelephoneNumber {
  const input = (raw ?? '').trim();
  if (!input) return { display: '', recognised: false };
  const ext = EXTENSION.exec(input);
  const extension = ext ? ext[1] : undefined;
  const main = ext ? input.slice(0, ext.index).trim() : input;
  const withExt = (s: string) => (extension ? `${s} x${extension}` : s);
  const asEntered: FormattedTelephoneNumber = { display: input, recognised: false, extension };

  if (main.startsWith('+') || main.startsWith('00')) {
    const lead = main.startsWith('+') ? main.slice(1) : main.slice(2);
    if (/^44[ \-.()/]*0/.test(lead)) return asEntered; // rule 7: "+44 0..." is invalid
    if (/^44/.test(lead)) {
      const uk = formatUkNationalNumber(`0${lead.slice(2).replace(/^[ \-.()/]+/, '')}`); // rules 3-4
      return uk ? { display: withExt(uk), recognised: true, extension } : asEntered;
    }
    let cc = '';
    for (let len = 1; len <= 3; len++) {
      const c = lead.slice(0, len);
      if (/^\d+$/.test(c) && ITU_COUNTRY_CODES.has(c)) {
        cc = c;
        break;
      }
    }
    if (!cc) return asEntered;
    let rest = lead.slice(cc.length);
    if (rest && SEPARATOR.test(rest[0])) rest = rest.replace(/^[ \-.()/]+/, ''); // rule 9
    if (!rest) return asEntered;
    if (!ONLY_DIGITS_AND_SEPARATORS.test(rest)) return { display: withExt(`+${cc} ${rest}`), recognised: true, extension }; // 10a
    const formatted = SEPARATOR.test(rest)
      ? rest.replace(SEPARATORS_G, ' ').trim() // 10b-i
      : groupFromRight(rest); // 10b-ii
    return { display: withExt(`+${cc} ${formatted}`), recognised: true, extension };
  }

  const uk = formatUkNationalNumber(main);
  return uk ? { display: withExt(uk), recognised: true, extension } : asEntered;
}

/* ------------------------------------------------------------------ */
/* Australia and New Zealand                                          */
/* ------------------------------------------------------------------ */

export type TelephoneNumberType =
  | 'landline'
  | 'mobile'
  | 'freephone'
  | 'local-rate'
  | 'premium'
  | 'non-geographic'
  | 'emergency'
  | 'international';

interface NationalNumber {
  /** National display with trunk 0, e.g. "02 5550 4321". */
  national: string;
  /** International display without the trunk 0, e.g. "+61 2 5550 4321". Null when not diallable from overseas. */
  international: string | null;
  /** E.164 with no punctuation, e.g. "+61255504321". */
  e164: string | null;
  type: TelephoneNumberType;
}

const HOME_DIAL_CODE: Record<ClinicalRegion, string> = { GB: '44', AU: '61', NZ: '64' };

const chunks = (d: string, sizes: number[]) => {
  const out: string[] = [];
  let at = 0;
  for (const s of sizes) {
    out.push(d.slice(at, at + s));
    at += s;
  }
  if (at < d.length) out.push(d.slice(at));
  return out.filter(Boolean).join(' ');
};

/**
 * Australian national number (digits only, trunk 0 where applicable). Style Manual groupings: geographic 2-4-4,
 * mobile 4-3-3 (3-3-3 after +61), 1300/1800 4-3-3, 13 numbers 2-2-2 (AU-PH-01, AU-PH-02).
 */
function auNational(d: string): NationalNumber | null {
  if (/^0[2378]\d{8}$/.test(d)) {
    return { national: chunks(d, [2, 4, 4]), international: `+61 ${chunks(d.slice(1), [1, 4, 4])}`, e164: `+61${d.slice(1)}`, type: 'landline' };
  }
  if (/^0[45]\d{8}$/.test(d)) {
    return { national: chunks(d, [4, 3, 3]), international: `+61 ${chunks(d.slice(1), [3, 3, 3])}`, e164: `+61${d.slice(1)}`, type: 'mobile' };
  }
  if (/^1[38]00\d{6}$/.test(d)) {
    return { national: chunks(d, [4, 3, 3]), international: null, e164: null, type: d[1] === '8' ? 'freephone' : 'local-rate' };
  }
  if (/^13\d{4}$/.test(d)) return { national: chunks(d, [2, 2, 2]), international: null, e164: null, type: 'local-rate' };
  if (/^(000|112|106)$/.test(d)) return { national: d, international: null, e164: null, type: 'emergency' };
  return null;
}

/**
 * New Zealand national number. Landline 0X XXX XXXX; mobile 02X XXX XXX / XXX XXXX / XXXX XXXX; 0800 and 0508 XXX XXX(X);
 * 0900 XX XXX (G11 section 6, [UNCERTAIN] mobile lengths vary by block).
 */
function nzNational(d: string): NationalNumber | null {
  if (/^0[34679][2-9]\d{6}$/.test(d)) {
    return { national: chunks(d, [2, 3, 4]), international: `+64 ${chunks(d.slice(1), [1, 3, 4])}`, e164: `+64${d.slice(1)}`, type: 'landline' };
  }
  if (/^02\d{7,9}$/.test(d)) {
    const rest = d.length - 3;
    const sizes = rest === 6 ? [3, 3, 3] : rest === 7 ? [3, 3, 4] : [3, 4, 4];
    const nat = chunks(d, sizes);
    return { national: nat, international: `+64 ${nat.slice(1)}`, e164: `+64${d.slice(1)}`, type: 'mobile' };
  }
  if (/^0(800|508)\d{6,7}$/.test(d)) {
    // Freephone numbers are not diallable from overseas [suggested].
    return { national: chunks(d, d.length === 10 ? [4, 3, 3] : [4, 3, 4]), international: null, e164: null, type: 'freephone' };
  }
  if (/^0900\d{5,6}$/.test(d)) return { national: chunks(d, d.length === 9 ? [4, 2, 3] : [4, 3, 3]), international: null, e164: null, type: 'premium' };
  if (/^(111|105|112)$/.test(d)) return { national: d, international: null, e164: null, type: 'emergency' };
  return null;
}

/** UK national number (leading 0) as a NationalNumber, using the CUI grouping. */
function ukNational(d: string): NationalNumber | null {
  const f = formatUkNationalNumber(d);
  if (!f) return null;
  const type: TelephoneNumberType = /^0[12]/.test(d) ? 'landline' : d.startsWith('07') ? 'mobile' : d.startsWith('080') ? 'freephone' : d.startsWith('09') ? 'premium' : 'non-geographic';
  return { national: f, international: `+44 ${f.slice(1)}`, e164: `+44${d.slice(1)}`, type };
}

const NATIONAL: Record<ClinicalRegion, (d: string) => NationalNumber | null> = { GB: ukNational, AU: auNational, NZ: nzNational };

interface ParsedTelephone {
  extension?: string;
  /** Recognised number (home or another known region), with whether it belongs to the home region. */
  number?: NationalNumber & { home: boolean };
  /** Generic international display when the country is not GB, AU or NZ. */
  otherInternational?: { display: string; e164: string | null };
}

function parse(raw: string, region: ClinicalRegion): ParsedTelephone | null {
  const input = raw.trim();
  if (!input) return null;
  const ext = EXTENSION.exec(input);
  const extension = ext ? ext[1] : undefined;
  const main = ext ? input.slice(0, ext.index).trim() : input;
  if (!ONLY_DIGITS_AND_SEPARATORS.test(main.replace(/^\+/, ''))) return { extension };
  const digits = main.replace(/[^\d]/g, '');
  // Emergency and short numbers first, so "000" is not read as an international prefix.
  if (!main.startsWith('+')) {
    const home = NATIONAL[region](digits);
    if (home && (home.type === 'emergency' || !digits.startsWith('00'))) return { extension, number: { ...home, home: true } };
  }
  let intl: string | null = null;
  if (main.startsWith('+')) intl = digits;
  else if (region === 'AU' && digits.startsWith('0011')) intl = digits.slice(4);
  else if (digits.startsWith('00')) intl = digits.slice(2);
  if (intl === null) return { extension };
  for (const r of ['GB', 'AU', 'NZ'] as ClinicalRegion[]) {
    const cc = HOME_DIAL_CODE[r];
    if (intl.startsWith(cc)) {
      const rest = intl.slice(cc.length);
      if (rest.startsWith('0')) return { extension }; // "+61 0..." is not a valid form (cf. Appendix A rule 7)
      const n = NATIONAL[r](`0${rest}`);
      return n && n.e164 ? { extension, number: { ...n, home: r === region } } : { extension };
    }
  }
  for (let len = 1; len <= 3; len++) {
    const c = intl.slice(0, len);
    if (!ITU_COUNTRY_CODES.has(c)) continue;
    const restDigits = intl.slice(len);
    if (!restDigits) return { extension };
    // Text after the international prefix and country code, as typed.
    let typed = main.replace(/^\+/, '');
    let skip = main.startsWith('+') ? len : digits.length - intl.length + len;
    let k = 0;
    while (k < typed.length && skip > 0) {
      if (/\d/.test(typed[k])) skip--;
      k++;
    }
    typed = typed.slice(k).replace(/^[ \-.()/]+/, '');
    // Keep the user's own grouping if they typed separators, otherwise group from the right (Appendix A rule 10b).
    const display = SEPARATOR.test(typed) ? typed.replace(SEPARATORS_G, ' ').trim() : groupFromRight(restDigits);
    return { extension, otherInternational: { display: `+${c} ${display}`, e164: `+${intl}` } };
  }
  return { extension };
}

/**
 * Telephone number display. GB behaviour is exactly as before (TID rules). For AU and NZ, home-region numbers are shown
 * in national format ("02 5550 4321", "0491 570 159", "03 312 3456", "021 123 4567") whether entered with the trunk 0,
 * +61/+64 or 0061/0064; other countries keep "+CC" (Style Manual: foreign numbers in international format);
 * extensions become " x1234"; anything not identifiable is returned as entered.
 * Spaces are ordinary spaces; displays keep the number on one line with CSS (Style Manual: never wrap).
 */
export function formatTelephoneNumber(raw: string | null | undefined, region: ClinicalRegion = 'GB'): FormattedTelephoneNumber {
  if (region === 'GB') return formatGbTelephoneNumber(raw);
  const input = (raw ?? '').trim();
  if (!input) return { display: '', recognised: false };
  const p = parse(input, region);
  const withExt = (s: string) => (p?.extension ? `${s} x${p.extension}` : s);
  if (p?.number) {
    const shown = p.number.home ? p.number.national : p.number.international ?? p.number.national;
    return { display: withExt(shown), recognised: true, extension: p.extension };
  }
  if (p?.otherInternational) return { display: withExt(p.otherInternational.display), recognised: true, extension: p.extension };
  return { display: input, recognised: false, extension: p?.extension };
}

export interface TelephoneValidation {
  /** True when the number is a recognised, complete number for the region or a recognised international number. */
  valid: boolean;
  type?: TelephoneNumberType;
  /** E.164 with no punctuation ("+61491570159"), for storage (AU-PH-01; HISO 10046). Null for numbers not diallable from overseas. */
  e164: string | null;
  /** Display per `formatTelephoneNumber`. */
  display: string;
  /** Message to show when not valid. */
  message?: string;
}

const INVALID_MESSAGE: Record<ClinicalRegion, string> = {
  GB: 'Check the telephone number, for example 01632 960123 or 07700 900123, or an international number starting with +',
  AU: 'Check the phone number. Australian numbers have 10 digits, for example 02 5550 4321 or 0491 570 159. Start international numbers with +',
  NZ: 'Check the phone number, for example 03 312 3456 or 021 123 4567. Start international numbers with +',
};

/** Validates a telephone number for a region (AU-PH-02; G11 section 6 format checks; GB per Appendix A). Empty is not valid. */
export function validatePhoneNumber(raw: string | null | undefined, region: ClinicalRegion = 'GB'): TelephoneValidation {
  const input = (raw ?? '').trim();
  const display = formatTelephoneNumber(input, region).display;
  const p = input ? parse(input, region) : null;
  if (p?.number) return { valid: true, type: p.number.home ? p.number.type : 'international', e164: p.number.e164, display };
  if (p?.otherInternational) return { valid: true, type: 'international', e164: p.otherInternational.e164, display };
  return { valid: false, e164: null, display, message: INVALID_MESSAGE[region] };
}

/** E.164 form ("+6421234567") for storage, or null when not identifiable or not diallable from overseas. */
export function telephoneToE164(raw: string | null | undefined, region: ClinicalRegion = 'GB'): string | null {
  return validatePhoneNumber(raw, region).e164;
}

/**
 * Value for a "tel:" link: international form without spaces where possible ("tel:+61491570156", Style Manual),
 * otherwise the national digits (13, 1300, 1800, 0900 numbers). Extensions follow a comma. Null when not identifiable.
 */
export function telephoneHref(raw: string | null | undefined, region: ClinicalRegion = 'GB'): string | null {
  const v = validatePhoneNumber(raw, region);
  if (!v.valid) return null;
  const ext = formatTelephoneNumber(raw, region).extension;
  const base = v.e164 ?? v.display.replace(/\s+x\d+$/, '').replace(/[^\d+]/g, '');
  return `tel:${base}${ext ? `,${ext}` : ''}`;
}
