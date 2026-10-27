/**
 * Address data per region (G1 ADR, G10 section 6, G11 section 5). Pure data.
 */

/**
 * Australian state and territory abbreviations, in alphabetical order.
 * Sources: https://auspost.com.au/content/dam/auspost_corp/media/documents/correct-addressing.pdf ;
 * https://www.upu.int/UPU/media/upu/PostalEntitiesFiles/addressingUnit/ausEn.pdf
 */
export const AU_STATES: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'ACT', name: 'Australian Capital Territory' },
  { code: 'NSW', name: 'New South Wales' },
  { code: 'NT', name: 'Northern Territory' },
  { code: 'QLD', name: 'Queensland' },
  { code: 'SA', name: 'South Australia' },
  { code: 'TAS', name: 'Tasmania' },
  { code: 'VIC', name: 'Victoria' },
  { code: 'WA', name: 'Western Australia' },
];

/**
 * Postcode ranges per state, inclusive. [UNCERTAIN] compiled from Australia Post postcode data, not fetched (G10 6.3).
 * A mismatch is a warning, never a block (AU-AD-02).
 */
export const AU_POSTCODE_RANGES: Readonly<Record<string, ReadonlyArray<[number, number]>>> = {
  NSW: [[1000, 1999], [2000, 2599], [2619, 2899], [2921, 2999]],
  ACT: [[200, 299], [2600, 2618], [2900, 2920]],
  VIC: [[3000, 3999], [8000, 8999]],
  QLD: [[4000, 4999], [9000, 9999]],
  SA: [[5000, 5799], [5800, 5999]],
  WA: [[6000, 6797], [6800, 6999]],
  TAS: [[7000, 7799], [7800, 7999]],
  NT: [[800, 899], [900, 999]],
};

/**
 * Known postcode and state pairs outside the ranges above. [UNCERTAIN] (G10 6.3): Jervis Bay 2540, border localities
 * such as Barooga NSW 3644 and NSW localities in 4383 and 4385. Extend as needed.
 */
export const AU_POSTCODE_STATE_EXCEPTIONS: Readonly<Record<string, ReadonlyArray<string>>> = {
  '2540': ['ACT'],
  '3644': ['NSW'],
  '4383': ['NSW'],
  '4385': ['NSW'],
};

/** Address input labels per region [suggested wording for AU; NZ from HISO 10046 element names]. */
export const AU_ADDRESS_LABELS = {
  unit: 'Unit, flat or level',
  line1: 'Street address',
  line2: 'Address line 2',
  locality: 'Suburb or town',
  state: 'State or territory',
  postcode: 'Postcode',
  outside: 'Address outside Australia',
  noFixedAddress: 'No fixed address',
} as const;

export const NZ_ADDRESS_LABELS = {
  buildingName: 'Building name',
  line1: 'Street address',
  suburb: 'Suburb or RD',
  town: 'Town or city',
  postcode: 'Postcode',
  outside: 'Address outside New Zealand',
  noFixedAddress: 'No fixed address',
} as const;

/** Country names that mean "home country" per region; such a country is never displayed. */
export const HOME_COUNTRY_NAMES = {
  GB: /^(united kingdom|uk|great britain|gb)$/i,
  AU: /^(australia|au)$/i,
  NZ: /^(new zealand|aotearoa|aotearoa new zealand|nz)$/i,
} as const;
