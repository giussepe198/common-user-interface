/**
 * Regional date and time conventions for display and entry.
 * All regions display DD-Mmm-YYYY on screen and HH:mm on the 24-hour clock with a colon.
 */
import type { ClinicalRegion } from '../../../core/locale';

/**
 * Day-of-week abbreviations, Sunday first (JavaScript getDay order).
 * GB: CUI D+Ta-0016 (Mon Tue Wed Thu Fri Sat Sun).
 * AU: ACSQHC Recommendations for safe use of medicines terminology (Nov 2024), accepted terms
 *     "Mon, Tue, Wed, Thur, Fri, Sat, Sun" (note Thur). G10 AU-DT-04.
 *     https://www.safetyandquality.gov.au/sites/default/files/2024-12/recommendations-for-safe-use-of-medicines-terminology.pdf
 * NZ: no NZ source found; CUI set kept (G11 7.1).
 */
export const DAY_ABBREVIATIONS: Record<ClinicalRegion, readonly string[]> = {
  GB: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  AU: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
  NZ: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/**
 * How numeric dates such as 05/04/2009 are read.
 * GB: "ask" (CUI D+Tc-0005: offer 05-Apr-2009 or 04-May-2009).
 * AU: "dayFirst": AU-DT-01, day precedes month in every format; never MM/DD/YYYY (G10 8.1).
 * NZ: "dayFirst": accept DD/MM/YYYY and D/M/YYYY, never MM/DD/YYYY (G11 7.1; HQSC NMC user guide 2021
 *     https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf).
 */
export const NUMERIC_DATE_ORDER: Record<ClinicalRegion, 'ask' | 'dayFirst'> = {
  GB: 'ask',
  AU: 'dayFirst',
  NZ: 'dayFirst',
};

/** Day abbreviation for a getDay() index in the region, e.g. AU 4 gives "Thur". */
export function regionalDayAbbreviation(day: number, region: ClinicalRegion = 'GB'): string {
  return DAY_ABBREVIATIONS[region][day];
}

/** How a long (prose) date is written: CUI "05 April 2008" or Style Manual "5 April 2008". */
export type LongDateStyle = 'cui' | 'style-manual';

/**
 * Long date style by region.
 * GB: CUI D+Ta-0011..0013, D+Ta-0018 (two-digit day: "05 April 2008"; optional ordinal "5th").
 * AU: Australian Government Style Manual, "Dates and time" (fetched 27-Oct-2026):
 *     https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time
 *     Full dates are day month year with no comma or other punctuation ("Friday 1 May 1997"), no
 *     ordinal numbers, and are not shortened in text. G10 8.1 had this as [UNCERTAIN]; now verified.
 *     The on-screen short form stays DD-Mmm-YYYY (ACSQHC, AU-DT-02).
 * NZ: no NZ government long-date rule in G11; CUI form kept.
 */
export const LONG_DATE_STYLES: Record<ClinicalRegion, LongDateStyle> = {
  GB: 'cui',
  AU: 'style-manual',
  NZ: 'cui',
};

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Long date in the given style. 'cui': "05 April 2008" (day of week, if asked, as the region's
 * abbreviation, "Sat 05 April 2008"). 'style-manual': "5 April 2008", with the day of week in full
 * and no comma, "Saturday 5 April 2008" (Style Manual: abbreviate days only where space is limited).
 * `spoken` gives the full day name in either style, for screen readers.
 */
export function formatLongDateInStyle(date: Date, style: LongDateStyle = 'cui', options: { dayOfWeek?: boolean; region?: ClinicalRegion; spoken?: boolean } = {}): string {
  const { dayOfWeek = false, region = 'GB', spoken = false } = options;
  const day = style === 'style-manual' ? String(date.getDate()) : String(date.getDate()).padStart(2, '0');
  const body = `${day} ${MONTHS_LONG[date.getMonth()]} ${String(date.getFullYear()).padStart(4, '0')}`;
  if (!dayOfWeek) return body;
  const dayName = style === 'style-manual' || spoken ? DAYS_LONG[date.getDay()] : DAY_ABBREVIATIONS[region][date.getDay()];
  return `${dayName} ${body}`;
}
