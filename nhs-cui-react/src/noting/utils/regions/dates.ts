/**
 * Region data for natural-language date entry in notes (CNA-0570: approximate periods such as
 * "summer" and "during childhood"). The CUI guidance names the constructs but not their dates; the
 * values below are [suggested] and configurable by editing or replacing these tables.
 */
import type { ClinicalRegion } from '../../../core';

export type SeasonName = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * First and last month (1-12) of each season. A last month smaller than the first means the
 * season crosses the new year (it is dated from the year it starts).
 * Meteorological seasons (whole calendar months), not in the guidance notes [UNCERTAIN: confirm locally]:
 * GB: Met Office, https://www.metoffice.gov.uk (spring March to May, summer June to August).
 * AU: Bureau of Meteorology, http://www.bom.gov.au/climate/glossary/seasons.shtml (summer December to February).
 * NZ: southern hemisphere convention as used by NIWA, https://niwa.co.nz (summer December to February).
 */
export const SEASON_MONTHS: Readonly<Record<ClinicalRegion, Readonly<Record<SeasonName, readonly [number, number]>>>> = {
  GB: { spring: [3, 5], summer: [6, 8], autumn: [9, 11], winter: [12, 2] },
  AU: { spring: [9, 11], summer: [12, 2], autumn: [3, 5], winter: [6, 8] },
  NZ: { spring: [9, 11], summer: [12, 2], autumn: [3, 5], winter: [6, 8] },
};

/**
 * Life periods as ages in whole years [suggested; no CUI source]: same in every region.
 * Used only when the patient's date of birth is known; otherwise the period is kept as text.
 */
export const CHILDHOOD_PERIODS: Readonly<Record<string, { label: string; fromAge: number; toAge: number }>> = {
  infancy: { label: 'During infancy', fromAge: 0, toAge: 1 },
  childhood: { label: 'During childhood', fromAge: 0, toAge: 12 },
  adolescence: { label: 'During adolescence', fromAge: 13, toAge: 19 },
};
