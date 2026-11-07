/** Drug name formatting (Medication Line MEDi-001 to MEDi-003, MEDi-013; Search and Prescribe MSP-0810 to MSP-0840). */

const ROMAN = /^(?=[IVXLC]+$)C{0,3}(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function isPreservedToken(token: string, wholeNameUpper: boolean): boolean {
  if (!/[A-Za-z]/.test(token)) return false;
  if (/^[A-Z]$/.test(token)) return true; // "amphotericin B"
  if (/\d/.test(token) && /[A-Z]/.test(token)) return true; // "carbomer 974P"
  if (ROMAN.test(token)) return true; // "factor VIII"
  if (wholeNameUpper) return false; // "DILTIAZEM" is a shouted name, not an acronym
  return token.length >= 2 && token === token.toUpperCase(); // acronyms such as "HPV"
}

/**
 * Generic (VTM) name in lower case, never title case (MEDi-002). Capitals are kept for
 * acronyms, single letters, roman numerals and codes ("amphotericin B", "factor VIII",
 * "carbomer 974P"). The component draws it in bold (MEDi-001).
 */
export function formatGenericName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  const longWords = trimmed.split(/[\s+-/]+/).filter(w => /^[A-Za-z]{4,}$/.test(w) && !ROMAN.test(w));
  const wholeNameUpper = letters.length > 0 && letters === letters.toUpperCase() && longWords.length > 0;
  return trimmed
    .split(/([\s+-]+)/)
    .map(part => (isPreservedToken(part, wholeNameUpper) ? part : part.toLowerCase()))
    .join('');
}

/** Brand (trade family) name in capitals, never bold (MEDi-003). */
export function formatBrandName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleUpperCase('en-GB');
}

/** Separator between attributes: a dash with a space either side (MEDi-018, MSP-0820). */
export const MEDICATION_SEPARATOR = ' – ';

/**
 * Drug name for lists and search results: generic first, then brand (MEDi-013, MSP-0810/0840),
 * e.g. "atenolol – TENORMIN". A brand with no generic is shown alone in capitals.
 */
export function formatDrugDisplayName(genericName?: string, brandName?: string, brandDescriptor?: string): string {
  const parts: string[] = [];
  if (genericName) parts.push(formatGenericName(genericName));
  if (brandName) parts.push(formatBrandName(brandName) + (brandDescriptor ? ` ${brandDescriptor}` : ''));
  return parts.join(MEDICATION_SEPARATOR);
}
