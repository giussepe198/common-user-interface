/**
 * Data for the desktop-registration example: the starting record for each region (from the shared cast) and
 * fake lookup services standing in for the host's address, NHI, ethnicity and iwi services. The controls make
 * no network calls; the host supplies these hooks.
 */
import type {
  AddressInputValue,
  AddressLookupResult,
  ClinicalRegion,
  EthnicityClassificationItem,
  IwiOption,
  NhiLookupResult,
  PatientNameValue,
} from '@clinical-cui/react';
import { MAIN_PATIENT } from './patients';

const delay = <T,>(value: T, ms = 150) => new Promise<T>(resolve => setTimeout(() => resolve(value), ms));

/** The record being updated, per region. */
export function registrationStart(region: ClinicalRegion) {
  const m = MAIN_PATIENT[region];
  const id = (t: string) => m.identifiers.find(i => i.type === t);
  const name: PatientNameValue = { title: m.title, familyName: m.familyName, givenName: m.givenName, middleNames: '', suffix: '', preferredName: m.preferredName ?? '' };
  const a = m.address;
  const address: AddressInputValue =
    region === 'GB'
      ? { line1: a.lines[0], line2: '', line3: '', town: a.town, county: a.county ?? '', postcode: a.postcode }
      : region === 'AU'
        ? { unit: a.unit ?? '', line1: a.lines[0], line2: '', line3: '', town: a.suburb ?? a.town, state: a.state ?? '', postcode: a.postcode }
        : { buildingName: '', line1: a.lines[0], line2: '', line3: '', suburb: a.suburb ?? '', town: a.town, postcode: a.postcode };
  const medicare = id('medicare');
  return {
    name,
    dateOfBirth: m.dateOfBirth,
    nhs: id('nhs')?.value ?? '',
    ihi: id('ihi')?.value ?? '',
    mrn: id('mrn')?.value ?? '',
    medicare: medicare?.value ?? '',
    medicareIrn: medicare?.irn ?? '',
    medicareValidTo: medicare?.validTo ? `${medicare.validTo.slice(5)}/${medicare.validTo.slice(0, 4)}` : '',
    // NZ starts with an old NHI copied from a referral letter: the lookup reports it dormant and offers the live one.
    nhi: region === 'NZ' ? DORMANT_NHI : '',
    address,
    phone: m.phone,
  };
}

/** NZ: a dormant NHI linked to the main patient's live NHI (test range). */
export const DORMANT_NHI = 'ZZZ0091';

/** Fake NHI service: one dormant number, the cast's live numbers, anything else not found. */
export function lookupNhi(nhi: string): Promise<NhiLookupResult> {
  if (nhi === DORMANT_NHI) return delay({ status: 'dormant', liveNhi: 'ZZZ0016' });
  if (['ZZZ0016', 'ZZZ0024', 'ZZZ0032', 'ZZZ0008', 'ZZZ0059'].includes(nhi)) return delay({ status: 'live' });
  return delay({ status: 'not-found' });
}

/** GB address finder (house number or name plus postcode) and postcode finder, over a tiny fictional gazetteer. */
const GB_ADDRESSES: AddressLookupResult[] = [
  { address: { line1: '12 Mill Lane', line2: '', line3: '', town: 'Ipswich', county: 'Suffolk', postcode: 'IP4 1AB' } },
  { address: { line1: '14 Mill Lane', line2: '', line3: '', town: 'Ipswich', county: 'Suffolk', postcode: 'IP4 1AB' } },
  { address: { line1: 'Flat 3, Orwell House', line2: '16 Mill Lane', line3: '', town: 'Ipswich', county: 'Suffolk', postcode: 'IP4 1AB' } },
];
export const gbFindAddress = (q: { buildingNumber: string; buildingName: string; postcode: string }) =>
  delay(GB_ADDRESSES.filter(r => (r.address.postcode ?? '').replace(/\s/g, '').toUpperCase() === q.postcode.replace(/\s/g, '').toUpperCase() && (!q.buildingNumber || (r.address.line1 ?? '').startsWith(q.buildingNumber) || (r.address.line2 ?? '').startsWith(q.buildingNumber))));
export const gbFindPostcode = (a: AddressInputValue) => delay(GB_ADDRESSES.filter(r => r.address.line1?.toLowerCase().includes(a.line1.toLowerCase().split(' ').slice(-2).join(' '))));

/** AU (G-NAF style) and NZ (NZ Post style) free-text address search. Identifiers are made up. */
const AU_ADDRESSES: AddressLookupResult[] = [
  { address: { unit: 'Unit 2', line1: '14 Smith St', town: 'Fitzroy', state: 'VIC', postcode: '3065', addressId: 'GAVIC_DEMO_0001' } },
  { address: { unit: '', line1: '14 Smith St', town: 'Collingwood', state: 'VIC', postcode: '3066', addressId: 'GAVIC_DEMO_0002' } },
  { address: { unit: '', line1: '140 Smith St', town: 'Fitzroy', state: 'VIC', postcode: '3065', addressId: 'GAVIC_DEMO_0003' } },
];
const NZ_ADDRESSES: AddressLookupResult[] = [
  { address: { line1: '22 Kōwhai Street', suburb: 'Southbrook', town: 'Rangiora', postcode: '7400', addressId: 'NZP-DEMO-1001' } },
  { address: { line1: '22 Kōwhai Road', suburb: 'RD 2', town: 'Rangiora', postcode: '7472', addressId: 'NZP-DEMO-1002' } },
  { address: { line1: '2 Kōwhai Street', suburb: '', town: 'Kaiapoi', postcode: '7630', addressId: 'NZP-DEMO-1003' } },
];
/** Macron-insensitive match, so "kowhai" finds "Kōwhai" (NZ 11.1). */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const searchAddress = (region: ClinicalRegion) => (query: string) => {
  const words = fold(query).split(/[\s,]+/).filter(Boolean);
  const list = region === 'AU' ? AU_ADDRESSES : NZ_ADDRESSES;
  return delay(list.filter(r => words.every(w => fold(Object.values(r.address).join(' ')).includes(w))));
};

/** Stats NZ ethnicity classification lookup for "Other" (illustrative entries; a real system queries the classification). */
const ETHNICITY_CLASSIFICATION: EthnicityClassificationItem[] = [
  { code: '12948', label: 'Dutch' },
  { code: '35111', label: 'Tokelauan' },
];
export const lookupEthnicity = (q: string) => delay(ETHNICITY_CLASSIFICATION.filter(e => fold(e.label).includes(fold(q))));

/**
 * Iwi reference list for the lookup. Names as published, macrons kept. The first two codes are the HISO 10094
 * examples used in the library preview; the others are placeholders: load the Stats NZ iwi classification in a real system.
 */
export const IWI_LIST: IwiOption[] = [
  { code: '0101', name: 'Te Aupōuri', rohe: 'Te Tai Tokerau' },
  { code: '0104', name: 'Ngāpuhi', rohe: 'Te Tai Tokerau' },
  { code: 'demo-01', name: 'Ngāti Porou', rohe: 'Te Tai Rāwhiti' },
  { code: 'demo-02', name: 'Ngāi Tahu / Kāi Tahu', rohe: 'Te Waipounamu' },
  { code: 'demo-03', name: 'Ngāti Kahungunu', rohe: 'Te Matau-a-Māui' },
  { code: 'demo-04', name: 'Tūhoe', rohe: 'Te Urewera' },
];
