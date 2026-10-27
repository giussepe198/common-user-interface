/** Checks medication text against the Medication Line display rules. */

export interface MedicationTextViolation {
  /** Guideline ID, e.g. "MEDi-026". */
  rule: string;
  message: string;
  /** Offending text. */
  match: string;
}

const RULES: Array<{ rule: string; re: RegExp; message: string }> = [
  { rule: 'MEDi-026', re: /[@|<>/\\&°]/g, message: 'Do not use the symbols @ | < > / \\ & or °; use words such as "at", "per", "in", "and".' },
  { rule: 'MEDi-028', re: /[()[\]{}]/g, message: 'Do not use brackets; use a dash or a black dot instead.' },
  { rule: 'MEDi-027', re: /\S\+|\+\S/g, message: 'A "+" joins drug names only and needs a space either side.' },
  { rule: 'MEDi-027', re: /(?:4 \+|\+ 4)/g, message: 'A "+" next to a "4" needs a double space.' },
  { rule: 'MEDi-024', re: /\b(?:mg|mL|ml|g|kg|micrograms|nanograms|units|L)\./g, message: 'No full stop after a unit.' },
  { rule: 'MEDi-015', re: /\d\.\d*0(?!\d)/g, message: 'No trailing zero after a decimal value ("0.5", not "0.50").' },
  { rule: 'MEDi-016', re: /(?:^|[^\d])\.\d/g, message: 'Use a leading zero for values below 1 ("0.5", not ".5").' },
  { rule: 'MEDi-017', re: /(?:^|[^\d,.])\d{4,}(?![\d,])/g, message: 'Use a comma thousands separator ("5,000").' },
  { rule: 'MEDi-041', re: /\d(?:mg|mL|g|micrograms|units)\b/g, message: 'Put a space between the amount and the unit.' },
  { rule: 'MEDi-018', re: /\S[\u2013\u2014]|[\u2013\u2014]\S/g, message: 'Separators need a single space either side.' },
  { rule: 'MEDi-032', re: /\b(?:DOSE|VOLUME|RATE|ROUTE|STRENGTH|FORM|FREQUENCY):/g, message: 'No colon after a label.' },
  { rule: 'MEDi-012', re: /\.\.\.|…/g, message: 'Do not truncate medication text.' },
];

/** Remove dates and times, which follow Date and Time Display rules rather than these number rules. */
function stripDatesAndTimes(text: string): string {
  return text.replace(/\b\d{2}-[A-Z][a-z]{2}-\d{4}\b/g, ' ').replace(/\b\d{2}:\d{2}\b/g, ' ');
}

/**
 * Validate medication line text (MEDi-012, 015 to 018, 024, 026 to 028, 032, 041).
 * Returns one entry per problem found; an empty array means the text passes.
 */
export function validateMedicationText(text: string): MedicationTextViolation[] {
  const clean = stripDatesAndTimes(text);
  const out: MedicationTextViolation[] = [];
  for (const r of RULES) {
    r.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.re.exec(clean))) {
      out.push({ rule: r.rule, message: r.message, match: m[0] });
      if (m[0] === '') r.re.lastIndex++;
    }
  }
  return out;
}
