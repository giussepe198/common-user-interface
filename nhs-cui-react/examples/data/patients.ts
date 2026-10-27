/**
 * The fictional cast shared by every example, one main patient per region plus ward neighbours.
 * Identifiers are test values: NHS numbers in the 999 range, a Luhn-valid IHI on the 800360 prefix,
 * and NZ NHIs in the reserved Z range. Map these plain records onto each component's props.
 */
import type { ClinicalRegion } from '@clinical-cui/react';

export interface CastPatient {
  id: string;
  familyName: string;
  givenName: string;
  title?: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: 'Female' | 'Male';
  /** Region identifiers, primary first. */
  identifiers: Array<{ type: 'nhs' | 'ihi' | 'mrn' | 'medicare' | 'nhi'; value: string; irn?: string; validTo?: string }>;
  address: { unit?: string; lines: string[]; suburb?: string; town: string; state?: string; county?: string; postcode: string };
  phone: string;
  allergies: Array<{ substance: string; reaction: string; recorded: string; by: string }> | 'none-known';
  location: string;
  ethnicity?: string[];
  indigenousStatus?: string;
}

export const MAIN_PATIENT: Record<ClinicalRegion, CastPatient> = {
  GB: {
    id: 'gb-1', familyName: 'Smith', givenName: 'Joan', title: 'Mrs', dateOfBirth: '1951-04-05', gender: 'Female',
    identifiers: [{ type: 'nhs', value: '9990000018' }],
    address: { lines: ['14 Mill Lane'], town: 'Ipswich', county: 'Suffolk', postcode: 'IP4 1AB' },
    phone: '01632 960123',
    allergies: [{ substance: 'penicillin', reaction: 'Anaphylaxis', recorded: '2024-02-02', by: 'Dr A Patel' }],
    location: 'Ward 7, bed 4',
  },
  AU: {
    id: 'au-1', familyName: 'Chen', givenName: 'Wei', title: 'Mr', dateOfBirth: '1949-09-02', gender: 'Male',
    identifiers: [{ type: 'ihi', value: '8003601234567894' }, { type: 'mrn', value: '0412345' }, { type: 'medicare', value: '2123456701', irn: '1', validTo: '2028-03' }],
    address: { unit: 'Unit 2', lines: ['14 Smith St'], suburb: 'Fitzroy', town: 'Melbourne', state: 'VIC', postcode: '3065' },
    phone: '0491 570 156',
    allergies: 'none-known',
    location: 'Ward 5B, bed 12',
    indigenousStatus: '4',
  },
  NZ: {
    id: 'nz-1', familyName: 'Ngata', givenName: 'Mereana', title: 'Ms', preferredName: 'Mere', dateOfBirth: '1958-03-14', gender: 'Female',
    identifiers: [{ type: 'nhi', value: 'ZZZ0016' }],
    address: { lines: ['22 Kōwhai Street'], suburb: 'Southbrook', town: 'Rangiora', postcode: '7400' },
    phone: '027 000 1234',
    allergies: [
      { substance: 'penicillin', reaction: 'Anaphylaxis', recorded: '2024-02-02', by: 'Dr A Moana' },
      { substance: 'latex', reaction: 'Contact dermatitis', recorded: '2024-02-02', by: 'Dr A Moana' },
    ],
    location: 'Ward 24, bed 7',
    ethnicity: ['21111', '31111'],
  },
};

/** Ward neighbours for lists and worklists, per region. Includes one similar-name pair per region. */
export const WARD: Record<ClinicalRegion, Array<Pick<CastPatient, 'id' | 'familyName' | 'givenName' | 'dateOfBirth' | 'gender' | 'location'> & { identifier: string }>> = {
  GB: [
    { id: 'gb-2', familyName: 'Jones', givenName: 'Sarah', dateOfBirth: '1971-08-09', gender: 'Female', location: 'bed 1', identifier: '9990000026' },
    { id: 'gb-3', familyName: 'Brown', givenName: 'Peter', dateOfBirth: '1940-02-17', gender: 'Male', location: 'bed 2', identifier: '9990000034' },
    { id: 'gb-4', familyName: 'Smith', givenName: 'John', dateOfBirth: '1962-06-11', gender: 'Male', location: 'bed 3', identifier: '9990000042' },
    { id: 'gb-5', familyName: 'Smith', givenName: 'Jon', dateOfBirth: '1985-01-30', gender: 'Male', location: 'bed 9', identifier: '9990000050' },
  ],
  AU: [
    { id: 'au-2', familyName: "O'Brien", givenName: 'Siobhan', dateOfBirth: '1990-05-21', gender: 'Female', location: 'bed 2', identifier: '0412366' },
    { id: 'au-3', familyName: 'Nguyen', givenName: 'Mia', dateOfBirth: '1988-03-02', gender: 'Female', location: 'bed 5', identifier: '0412377' },
    { id: 'au-4', familyName: 'Smith', givenName: 'John', dateOfBirth: '1962-06-11', gender: 'Male', location: 'bed 3', identifier: '0398812' },
    { id: 'au-5', familyName: 'Smith', givenName: 'Jon', dateOfBirth: '1985-01-30', gender: 'Male', location: 'bed 9', identifier: '0420017' },
  ],
  NZ: [
    { id: 'nz-2', familyName: 'Tūhoe', givenName: 'Kahu', dateOfBirth: '1979-11-03', gender: 'Male', location: 'bed 2', identifier: 'ZZZ0024' },
    { id: 'nz-3', familyName: 'Tūhoe', givenName: 'Kāhu', dateOfBirth: '2001-04-19', gender: 'Male', location: 'bed 6', identifier: 'ZZZ0032' },
    { id: 'nz-4', familyName: 'Fa\'atau', givenName: 'Lesieli', dateOfBirth: '1966-07-28', gender: 'Female', location: 'bed 3', identifier: 'ZZZ0008' },
    { id: 'nz-5', familyName: 'Wilson', givenName: 'Grace', dateOfBirth: '1945-12-01', gender: 'Female', location: 'bed 9', identifier: 'ZZZ0059' },
  ],
};

/** A fixed "now" so every example renders the same day: Tue 27-Oct-2026 14:05 local. */
export const EXAMPLE_NOW = new Date(2026, 9, 27, 14, 5);
