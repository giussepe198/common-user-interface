/**
 * Data for the mobile examples: the shared cast mapped onto the mobile identity shape, plus the patient record
 * (medicines, drug chart events, observations) used by mobile-patient-review. Fictional throughout.
 *
 * `mobileIdentity` is also used by mobile-nurse-round and mobile-voice-capture, so every mobile example shows the
 * same person in the same way.
 */
import type {
  AdminMedication,
  ClinicalRegion,
  EwsObservationSet,
  MedicationLineData,
  MobileMedicationItem,
  MobilePatientIdentity,
  MobileSummaryAlert,
  MobileSummaryDueMedicine,
  PatientIdentifier,
} from '@clinical-cui/react';
import { EXAMPLE_NOW, MAIN_PATIENT, WARD, type CastPatient } from './patients';

/** A time today (27-Oct-2026), or `dayOffset` days away. */
export const today = (hh: number, mm = 0, dayOffset = 0) => new Date(2026, 9, 27 + dayOffset, hh, mm);

/** Ethnicity labels for the cast's Stats NZ level 4 codes (HISO 10001). */
const NZ_ETHNICITY: Record<string, string> = { '21111': 'Māori', '31111': 'Samoan' };

/** Medicare card "YYYY-MM" in the cast becomes the "MM/YYYY" the identifier display expects (G12 1). */
const cardMonth = (v?: string) => (v ? `${v.slice(5, 7)}/${v.slice(0, 4)}` : undefined);

/**
 * Map a cast member onto MobilePatientIdentity. Only data the record holds is passed: nothing is invented, so an
 * empty allergy record shows the region's "not recorded" wording rather than a false "none known".
 */
export function mobileIdentity(p: CastPatient, region: ClinicalRegion): MobilePatientIdentity {
  const identifiers: PatientIdentifier[] = p.identifiers.map(i =>
    i.type === 'medicare'
      ? { type: 'medicare', value: i.value, irn: i.irn, medicareValidTo: cardMonth(i.validTo) }
      : { type: i.type, value: i.value },
  );
  const mobilePhone = /^0(2|4)/.test(p.phone);
  return {
    id: p.id,
    name: { familyName: p.familyName, givenName: p.givenName, title: p.title },
    preferredName: p.preferredName,
    dateOfBirth: p.dateOfBirth,
    gender: p.gender,
    identifiers,
    location: p.location,
    allergies:
      p.allergies === 'none-known'
        ? { status: 'none-known', recordedAt: '2026-10-26', recordedBy: 'RN T Walsh' }
        : {
            status: 'known',
            items: p.allergies.map(a => ({ name: a.substance, reaction: a.reaction, lastUpdated: a.recorded, recordedBy: a.by })),
          },
    address: {
      unit: p.address.unit,
      lines: p.address.lines,
      suburb: region === 'NZ' ? p.address.suburb : undefined,
      town: region === 'AU' ? (p.address.suburb ?? p.address.town) : p.address.town,
      state: p.address.state,
      county: p.address.county,
      postcode: p.address.postcode,
    },
    phones: mobilePhone ? { mobile: p.phone } : { home: p.phone },
    ethnicity: p.ethnicity ? { entries: p.ethnicity.map(code => ({ code, label: NZ_ETHNICITY[code] ?? code })) } : undefined,
    indigenousStatus: p.indigenousStatus,
    // Region-only facts the examples demonstrate: an NZ protected address (HISO 10046, G12 3) and the AU My Health
    // Record state (G12 2). Set here so the header, details sheet and switch guard all see the same record.
    protection: region === 'NZ' ? { address: true } : undefined,
    myHealthRecord: region === 'AU' ? 'available' : undefined,
  };
}

type WardMember = (typeof WARD)['GB'][number];

/** A ward neighbour as a mobile identity. Allergy status is recorded as none known for the neighbours. */
export function wardIdentity(w: WardMember, region: ClinicalRegion): MobilePatientIdentity {
  const type = region === 'GB' ? 'nhs' : region === 'NZ' ? 'nhi' : 'mrn';
  return {
    id: w.id,
    name: { familyName: w.familyName, givenName: w.givenName },
    dateOfBirth: w.dateOfBirth,
    gender: w.gender,
    identifiers: [{ type, value: w.identifier }],
    location: region === 'GB' ? `Ward 7, ${w.location}` : region === 'AU' ? `Ward 5B, ${w.location}` : `Ward 24, ${w.location}`,
    allergies: { status: 'none-known', recordedAt: '2026-10-25' },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Patient record for mobile-patient-review
// ---------------------------------------------------------------------------------------------------------------

const mg = (v: number) => ({ kind: 'simple' as const, values: [v], unit: 'mg' });

/** Medication lines, written once and shared by the summary, the medicines list and the drug agenda. */
export const LINES = {
  paracetamol: {
    genericName: 'paracetamol',
    strength: mg(500),
    form: 'tablet',
    route: 'oral',
    dose: { value: 1, unit: 'g' },
    frequency: 'four times a day',
  },
  clindamycin: {
    genericName: 'clindamycin',
    strength: mg(150),
    form: 'capsule',
    route: 'oral',
    dose: { value: 450, unit: 'mg' },
    frequency: 'four times a day',
    indication: 'for cellulitis',
  },
  enoxaparin: {
    genericName: 'enoxaparin',
    strength: { kind: 'inFluid', values: [40], unit: 'mg', fluidQuantity: 0.4, fluidUnit: 'mL' },
    form: 'injection',
    route: 'subcutaneous',
    dose: { value: 40, unit: 'mg' },
    frequency: 'once a day',
    qualifiers: ['at 18:00'],
  },
  metoprolol: {
    genericName: 'metoprolol',
    strength: mg(47.5),
    form: 'modified-release tablet',
    route: 'oral',
    dose: { value: 47.5, unit: 'mg' },
    frequency: 'once a day',
    qualifiers: ['in the morning'],
  },
  oxycodone: {
    genericName: 'oxycodone',
    strength: mg(5),
    form: 'capsule',
    route: 'oral',
    dose: { value: 5, unit: 'mg' },
    frequency: 'every 4 hours when required',
    qualifiers: ['maximum 30 mg in 24 hours'],
    indication: 'for pain',
  },
  ondansetron: {
    genericName: 'ondansetron',
    strength: mg(4),
    form: 'orally disintegrating tablet',
    route: 'oral',
    dose: { value: 4, unit: 'mg' },
    frequency: 'every 8 hours when required',
    indication: 'for nausea',
  },
  amlodipine: {
    genericName: 'amlodipine',
    strength: mg(5),
    form: 'tablet',
    route: 'oral',
    dose: { value: 5, unit: 'mg' },
    frequency: 'once a day',
  },
  doxycycline: {
    genericName: 'doxycycline',
    strength: mg(100),
    form: 'capsule',
    route: 'oral',
    dose: { value: 100, unit: 'mg' },
    frequency: 'once a day',
  },
  omeprazole: {
    genericName: 'omeprazole',
    strength: mg(20),
    form: 'capsule',
    route: 'oral',
    dose: { value: 20, unit: 'mg' },
    frequency: 'once a day',
  },
} satisfies Record<string, MedicationLineData>;

/**
 * The drug chart: the single source of truth for this example. The medicines list statuses and the summary's
 * "Medicines due" are derived from these events, so the three screens can never disagree.
 */
export const CHART: AdminMedication[] = [
  {
    id: 'para',
    name: 'paracetamol',
    line: LINES.paracetamol,
    kind: 'regular',
    route: 'oral',
    startDate: today(8, 0, -3),
    events: [
      { id: 'p08', scheduledTime: today(8), status: 'given', administeredAt: today(8, 5), recordedBy: 'RN T Walsh' },
      { id: 'p13', scheduledTime: today(13) },
      { id: 'p18', scheduledTime: today(18) },
      { id: 'p22', scheduledTime: today(22) },
    ],
  },
  {
    id: 'clin',
    name: 'clindamycin',
    line: LINES.clindamycin,
    kind: 'regular',
    route: 'oral',
    startDate: today(6, 0, -2),
    events: [
      { id: 'c06', scheduledTime: today(6), status: 'given', administeredAt: today(6, 10) },
      { id: 'c12', scheduledTime: today(12), status: 'given', administeredAt: today(12, 5) },
      { id: 'c18', scheduledTime: today(18) },
      { id: 'c24', scheduledTime: today(23, 59) },
    ],
  },
  {
    id: 'enox',
    name: 'enoxaparin',
    line: LINES.enoxaparin,
    kind: 'regular',
    route: 'subcutaneous',
    startDate: today(18, 0, -3),
    events: [{ id: 'e18', scheduledTime: today(18) }],
  },
  {
    id: 'meto',
    name: 'metoprolol',
    line: LINES.metoprolol,
    kind: 'regular',
    route: 'oral',
    startDate: today(8, 0, -7),
    events: [{ id: 'm08', scheduledTime: today(8), status: 'given', administeredAt: today(8, 5) }],
  },
  {
    id: 'oxy',
    name: 'oxycodone',
    line: LINES.oxycodone,
    kind: 'asRequiredUnscheduled',
    route: 'oral',
    startDate: today(0, 0, -3),
    asRequired: { minIntervalMinutes: 240, criteria: 'for pain' },
    events: [{ id: 'o1', status: 'given', administeredAt: today(10, 30) }],
  },
  {
    id: 'ond',
    name: 'ondansetron',
    line: LINES.ondansetron,
    kind: 'asRequiredUnscheduled',
    route: 'oral',
    startDate: today(0, 0, -3),
    asRequired: { minIntervalMinutes: 480, criteria: 'for nausea' },
    events: [{ id: 'n1', status: 'given', administeredAt: today(22, 10, -1) }],
  },
];

/** Decision support alerts in words, keyed by medication id (shown by the list and the agenda). */
export const MEDICATION_ALERTS: Record<string, string[]> = { enox: ['Renal function alert'] };

/** The medicines list (A3): the chart's lines plus suspended and past medicines, each with today's schedule. */
export const MEDICINES: MobileMedicationItem[] = [
  { id: 'para', status: 'Started', startDate: today(8, 0, -3), line: LINES.paracetamol, schedule: { state: 'overdue', at: today(13) } },
  {
    id: 'clin',
    status: 'Started',
    startDate: today(6, 0, -2),
    line: LINES.clindamycin,
    schedule: { state: 'given', lastGivenAt: today(12, 5), nextAt: today(18) },
  },
  {
    id: 'enox',
    status: 'Started',
    startDate: today(18, 0, -3),
    line: LINES.enoxaparin,
    schedule: { state: 'next', at: today(18) },
    alerts: MEDICATION_ALERTS.enox,
    hasAlert: true,
  },
  {
    id: 'meto',
    status: 'Started',
    startDate: today(8, 0, -7),
    line: LINES.metoprolol,
    schedule: { state: 'given', lastGivenAt: today(8, 5), nextAt: today(8, 0, 1) },
  },
  {
    id: 'oxy',
    status: 'Started',
    startDate: today(0, 0, -3),
    line: LINES.oxycodone,
    schedule: { state: 'notAvailable', lastGivenAt: today(10, 30), availableFrom: today(14, 30) },
  },
  {
    id: 'ond',
    status: 'Started',
    startDate: today(0, 0, -3),
    line: LINES.ondansetron,
    schedule: { state: 'available', lastGivenAt: today(22, 10, -1) },
  },
  { id: 'aml', status: 'Suspended', suspendedOn: today(9, 0, -1), startDate: today(8, 0, -7), line: LINES.amlodipine },
  { id: 'doxy', status: 'Completed', startDate: today(8, 0, -12), endDate: today(8, 0, -5), line: LINES.doxycycline },
  { id: 'ome', status: 'Discontinued', startDate: today(8, 0, -7), endDate: today(10, 0, -2), line: LINES.omeprazole },
];

/** "Medicines due" on the summary (A1), overdue first. */
export const DUE: MobileSummaryDueMedicine[] = [
  { id: 'para', line: LINES.paracetamol, state: 'overdue', at: today(13) },
  { id: 'clin', line: LINES.clindamycin, state: 'next', at: today(18) },
];

/**
 * Latest observations, scored on the summary with the region's chart. Oxygen differs by chart: NEWS2 and NZEWS record
 * air or oxygen, the AU ADDS placeholder records the flow in L/min (0 on room air).
 */
export function latestObservations(region: ClinicalRegion): EwsObservationSet {
  const oxygen = region === 'AU' ? { oxygenFlow: 0 } : { supplementalOxygen: 'air' };
  return {
    time: today(13, 40),
    values: {
      respiratoryRate: 21,
      oxygenSaturation: 95,
      ...oxygen,
      heartRate: 104,
      systolicBloodPressure: 118,
      temperature: 38.1,
      consciousness: 'A',
    },
    recordedBy: 'RN T Walsh',
  };
}

/** One decision support alert (high priority): wording is the alert's own, shown in full. */
export const ALERTS: Omit<MobileSummaryAlert, 'onAction'>[] = [
  {
    id: 'renal',
    title: 'High priority alert',
    message: 'eGFR 28 mL/min/1.73 m² at 06:10 today. Enoxaparin 40 mg once a day may need a lower dose: review before the 18:00 dose.',
  },
];

/**
 * The second patient for the switch demonstration: the similar-name neighbour for the region, with a short record of
 * their own, so a switch visibly changes every screen.
 */
export function switchTarget(region: ClinicalRegion): MobilePatientIdentity {
  const w = region === 'NZ' ? WARD.NZ[1] : WARD[region][3];
  return wardIdentity(w, region);
}

export const SWITCH_TARGET_CHART: AdminMedication[] = [
  {
    id: 'ins',
    name: 'insulin aspart',
    kind: 'regular',
    route: 'subcutaneous',
    startDate: today(8, 0, -1),
    line: {
      genericName: 'insulin aspart',
      brandName: 'NovoRapid',
      strength: { kind: 'perUnit', values: [100], unit: 'units', fluidUnit: 'mL' },
      form: 'injection',
      route: 'subcutaneous',
      dose: { value: 6, unit: 'units' },
      frequency: 'three times a day',
      qualifiers: ['with meals'],
    },
    events: [
      { id: 'i08', scheduledTime: today(8), status: 'given', administeredAt: today(8, 2) },
      { id: 'i12', scheduledTime: today(12), status: 'given', administeredAt: today(12, 10) },
      { id: 'i18', scheduledTime: today(18) },
    ],
  },
];

export const SWITCH_TARGET_MEDICINES: MobileMedicationItem[] = [
  {
    id: 'ins',
    status: 'Started',
    startDate: today(8, 0, -1),
    line: SWITCH_TARGET_CHART[0].line as MedicationLineData,
    schedule: { state: 'next', at: today(18) },
  },
];

export { EXAMPLE_NOW, MAIN_PATIENT, WARD };
