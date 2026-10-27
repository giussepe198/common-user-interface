/**
 * Clinical data for the desktop patient record examples (patient record, drug round, prescribing,
 * observations). One admission per region, built on the shared cast in ./patients:
 *
 * - GB: Joan Smith, community-acquired pneumonia, recorded penicillin anaphylaxis. Co-amoxiclav was
 *   prescribed overnight and conflicts with the allergy.
 * - AU: Wei Chen, community-acquired pneumonia, allergies positively recorded as "Nil known". There is
 *   no allergy conflict to show, so the high priority alert is the clarithromycin and simvastatin
 *   interaction instead (a contraindicated pair).
 * - NZ: Mereana Ngata, community-acquired pneumonia, penicillin anaphylaxis and latex dermatitis.
 *   Amoxicillin conflicts with the penicillin allergy.
 *
 * Everything is fictional. Times are relative to EXAMPLE_NOW (Tue 27-Oct-2026 14:05).
 */
import type {
  AdrEntry,
  AdrStatusRecord,
  BloodPressureSeries,
  ClinicalRegion,
  DecisionSupportAlert,
  EwsObservationSet,
  MedicationRecord,
  ObservationCriticalThreshold,
  ObservationSeries,
  PatientBannerProps,
  PatientIdentifier,
} from '@clinical-cui/react';
import { EXAMPLE_NOW, MAIN_PATIENT } from './patients';

/** A time relative to the example day: `at(-1, 22)` is 26-Oct-2026 22:00. */
export function at(dayOffset: number, hour: number, minute = 0): Date {
  return new Date(EXAMPLE_NOW.getFullYear(), EXAMPLE_NOW.getMonth(), EXAMPLE_NOW.getDate() + dayOffset, hour, minute);
}

/** The logged-in clinician per region (pre-filled as author in forms). */
export const CURRENT_USER: Record<ClinicalRegion, string> = {
  GB: 'Dr R Okafor (FY2)',
  AU: 'Dr L Nguyen (RMO)',
  NZ: 'Dr H Te Huia (RMO)',
};

/** The nurse on the drug round per region. */
export const CURRENT_NURSE: Record<ClinicalRegion, string> = {
  GB: 'Staff Nurse K Ward',
  AU: 'RN M Rossi',
  NZ: 'RN T Parata',
};

/* ------------------------------------------------------------------------------------------------
 * Patient banner
 * ---------------------------------------------------------------------------------------------- */

/**
 * PatientBanner props for the region's main patient. The banner itself applies the regional rules
 * (identifier order and labels, family name case, allergy wording); the example only maps the record.
 */
export function bannerProps(region: ClinicalRegion): PatientBannerProps {
  const p = MAIN_PATIENT[region];
  const identifiers: PatientIdentifier[] = p.identifiers.map(i => ({
    type: i.type,
    value: i.value,
    irn: i.irn,
    // Cast data holds "2028-03"; the banner expects the card's "MM/YYYY".
    medicareValidTo: i.validTo ? `${i.validTo.slice(5, 7)}/${i.validTo.slice(0, 4)}` : undefined,
    ihiNumberStatus: i.type === 'ihi' ? 'Active' : undefined,
    ihiRecordStatus: i.type === 'ihi' ? 'Verified' : undefined,
  }));
  // Gender: GB takes the CUI word, AU the ABS code letter, NZ the HISO 10046 code. The banner shows words.
  const gender = region === 'GB' ? p.gender : p.gender === 'Female' ? 'F' : 'M';
  const allergies: PatientBannerProps['allergies'] =
    p.allergies === 'none-known'
      ? { status: 'none-known', recordedBy: 'Dr L Nguyen', recordedAt: at(-1, 21, 40) }
      : {
          status: 'known',
          items: p.allergies.map(a => ({ name: a.substance[0].toUpperCase() + a.substance.slice(1), lastUpdated: a.recorded, reaction: a.reaction.toLowerCase() })),
          recordedBy: p.allergies[0].by,
          recordedAt: p.allergies[0].recorded,
        };
  return {
    name: { familyName: p.familyName, givenName: p.givenName, title: p.title },
    preferredName: p.preferredName ?? null,
    dateOfBirth: p.dateOfBirth,
    gender,
    nhsNumber: region === 'GB' ? p.identifiers[0].value : undefined,
    identifiers: region === 'GB' ? undefined : identifiers,
    address: { type: 'Usual address', ...p.address },
    contacts: region === 'GB' ? { home: p.phone } : { mobile: p.phone },
    allergies,
    now: EXAMPLE_NOW,
  };
}

/* ------------------------------------------------------------------------------------------------
 * Medications (MedicationsList rows)
 * ---------------------------------------------------------------------------------------------- */

/** Id of the antibiotic that raised the high priority alert, per region. */
export const FLAGGED_MEDICATION_ID: Record<ClinicalRegion, string> = { GB: 'coamox', AU: 'clari', NZ: 'amox' };

/**
 * Current and recent past medications. Names are given in plain lower case: MedicationLine applies
 * mixed-case lettering for AU and NZ itself (cefTRIAXONE, cLARITHROMYcin, amLODIPine), so the data stays
 * searchable and the display rule lives in one place.
 */
export const MEDICATIONS: Record<ClinicalRegion, MedicationRecord[]> = {
  GB: [
    { id: 'coamox', status: 'Started', statusSupplement: 'Not Verified', startDate: at(-1, 22), hasAlert: true, alertLabel: 'High Priority alert: penicillin allergy',
      line: { genericName: 'co-amoxiclav', form: 'tablet', dose: { value: 625, unit: 'mg' }, route: 'oral', frequency: 'three times a day', indication: 'community-acquired pneumonia' } },
    { id: 'clari', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22), hasAlert: true, alertLabel: 'Priority alert: interaction with atorvastatin',
      line: { genericName: 'clarithromycin', form: 'tablet', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'twice a day', courseDuration: 'for 5 days' } },
    { id: 'para', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 20),
      line: { genericName: 'paracetamol', form: 'tablet', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: 'every 4 to 6 hours as required', qualifiers: ['maximum 4 doses in 24 hours'], indication: 'for pain or fever' } },
    { id: 'enox', status: 'Not Started', statusSupplement: 'Verified', startDate: at(0, 18),
      line: { genericName: 'enoxaparin', dose: { value: 40, unit: 'mg' }, route: 'subcutaneous', frequency: 'once a day', qualifiers: ['at 18:00'] } },
    { id: 'amlo', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22),
      line: { genericName: 'amlodipine', form: 'tablet', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' } },
    { id: 'ator', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22),
      line: { genericName: 'atorvastatin', form: 'tablet', dose: { value: 20, unit: 'mg' }, route: 'oral', frequency: 'once a day', qualifiers: ['at night'] } },
    { id: 'rami', status: 'Suspended', statusSupplement: 'Verified', startDate: at(-1, 22), suspendedOn: at(0, 9),
      line: { genericName: 'ramipril', form: 'capsule', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' } },
    { id: 'doxy', status: 'Completed', startDate: at(-6, 9), endDate: at(-1, 9),
      line: { genericName: 'doxycycline', form: 'capsule', dose: { value: 100, unit: 'mg' }, route: 'oral', frequency: 'once a day', courseDuration: 'for 5 days' } },
  ],
  AU: [
    { id: 'ceft', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 21),
      line: { genericName: 'ceftriaxone', strength: '1 g', form: 'injection', route: 'intravenous', dose: { value: 1, unit: 'g' }, frequency: 'once a day', indication: 'community-acquired pneumonia' } },
    { id: 'clari', status: 'Started', statusSupplement: 'Not Verified', startDate: at(-1, 21), hasAlert: true, alertLabel: 'High Priority alert: interaction with simvastatin',
      line: { genericName: 'clarithromycin', strength: '500 mg', form: 'tablet', route: 'oral', dose: { value: 500, unit: 'mg' }, frequency: 'twice a day', courseDuration: 'for 5 days' } },
    { id: 'simva', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 21), hasAlert: true, alertLabel: 'High Priority alert: interaction with clarithromycin',
      line: { genericName: 'simvastatin', strength: '40 mg', form: 'tablet', route: 'oral', dose: { value: 40, unit: 'mg' }, frequency: 'once a day', qualifiers: ['at night'] } },
    { id: 'para', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 20),
      line: { genericName: 'paracetamol', strength: '500 mg', form: 'tablet', route: 'oral', dose: { value: 1, unit: 'g' }, frequency: 'every 4 to 6 hours when required', qualifiers: ['maximum 4 g in 24 hours'], indication: 'pain or fever' } },
    { id: 'enox', status: 'Not Started', statusSupplement: 'Verified', startDate: at(0, 18), hasAlert: true, alertLabel: 'Priority alert: dose in renal impairment',
      line: { genericName: 'enoxaparin', strength: '40 mg/0.4 mL', form: 'injection', route: 'subcutaneous', dose: { value: 40, unit: 'mg' }, frequency: 'once a day', qualifiers: ['at 18:00'] } },
    { id: 'amlo', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 21),
      line: { genericName: 'amlodipine', strength: '5 mg', form: 'tablet', route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day' } },
    { id: 'rami', status: 'Suspended', statusSupplement: 'Verified', startDate: at(-1, 21), suspendedOn: at(0, 9),
      line: { genericName: 'ramipril', strength: '5 mg', form: 'capsule', route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day' } },
    { id: 'doxy', status: 'Completed', startDate: at(-6, 9), endDate: at(-1, 9),
      line: { genericName: 'doxycycline', strength: '100 mg', form: 'tablet', route: 'oral', dose: { value: 100, unit: 'mg' }, frequency: 'once a day', courseDuration: 'for 5 days' } },
  ],
  NZ: [
    { id: 'amox', status: 'Started', statusSupplement: 'Not Verified', startDate: at(-1, 22), hasAlert: true, alertLabel: 'High Priority alert: penicillin allergy',
      line: { genericName: 'amoxicillin', form: 'capsule', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: 'three times a day', indication: 'community-acquired pneumonia' } },
    { id: 'clari', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22), hasAlert: true, alertLabel: 'Priority alert: interaction with atorvastatin',
      line: { genericName: 'clarithromycin', form: 'tablet', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'twice a day', courseDuration: 'for 5 days' } },
    { id: 'para', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 20),
      line: { genericName: 'paracetamol', form: 'tablet', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: 'every 4 to 6 hours when required', qualifiers: ['maximum 4 g in 24 hours'], indication: 'for pain or fever' } },
    { id: 'meto', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22),
      line: { genericName: 'metoclopramide', form: 'tablet', dose: { value: 10, unit: 'mg' }, route: 'oral', frequency: 'three times a day when required', indication: 'for nausea' } },
    { id: 'enox', status: 'Not Started', statusSupplement: 'Verified', startDate: at(0, 18),
      line: { genericName: 'enoxaparin', dose: { value: 40, unit: 'mg' }, route: 'subcutaneous', frequency: 'once a day', qualifiers: ['at 18:00'] } },
    { id: 'amlo', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22),
      line: { genericName: 'amlodipine', form: 'tablet', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' } },
    { id: 'ator', status: 'Started', statusSupplement: 'Verified', startDate: at(-1, 22),
      line: { genericName: 'atorvastatin', form: 'tablet', dose: { value: 20, unit: 'mg' }, route: 'oral', frequency: 'once a day', qualifiers: ['at night'] } },
    { id: 'cila', status: 'Suspended', statusSupplement: 'Verified', startDate: at(-1, 22), suspendedOn: at(0, 9),
      line: { genericName: 'cilazapril', form: 'tablet', dose: { value: 2.5, unit: 'mg' }, route: 'oral', frequency: 'once a day' } },
    { id: 'doxy', status: 'Completed', startDate: at(-6, 9), endDate: at(-1, 9),
      line: { genericName: 'doxycycline', form: 'tablet', dose: { value: 100, unit: 'mg' }, route: 'oral', frequency: 'once a day', courseDuration: 'for 5 days' } },
  ],
};

/* ------------------------------------------------------------------------------------------------
 * Allergies and adverse drug reactions (AdrSummaryList)
 * ---------------------------------------------------------------------------------------------- */

export const ADR_ENTRIES: Record<ClinicalRegion, AdrEntry[]> = {
  GB: [
    { id: 'adr-pen', agent: { code: '91936005', term: 'Penicillin', isClass: true }, reactions: [{ concept: { code: '39579001', term: 'Anaphylaxis' }, elaboration: 'Throat swelling within minutes of oral dose, 2019' }],
      source: 'Clinical documentation', clinicianWitnessed: false, recordedBy: 'Dr A Patel', recordedAt: '2024-02-02T10:15' },
  ],
  AU: [],
  NZ: [
    { id: 'adr-pen', agent: { code: '91936005', term: 'Penicillin', isClass: true }, reactions: [{ concept: { code: '39579001', term: 'Anaphylaxis' } }],
      source: 'Clinical documentation', recordedBy: 'Dr A Moana', recordedAt: '2024-02-02T10:15' },
    { id: 'adr-latex', agent: { code: '111088007', term: 'Latex', isDrug: false }, reactions: [{ concept: { code: '40275004', term: 'Contact dermatitis' } }],
      source: 'Patient testimony', recordedBy: 'Dr A Moana', recordedAt: '2024-02-02T10:20' },
  ],
};

/** AU: "Nil known" is positively recorded with who and when; an empty list alone would read "Not recorded". */
export const ADR_STATUS: Record<ClinicalRegion, AdrStatusRecord | null> = {
  GB: null,
  AU: { status: 'noKnown', recordedAt: at(-1, 21, 40), recordedBy: 'Dr L Nguyen', source: 'Patient testimony' },
  NZ: null,
};

/* ------------------------------------------------------------------------------------------------
 * Observations: one admission's vital signs, every 4 hours, fever settling after the first doses.
 * ---------------------------------------------------------------------------------------------- */

interface ObsRow { t: Date; rr: number; spo2: number; hr: number; sbp: number; dbp: number; temp: string; loc: string }

const OBS_ROWS: ObsRow[] = [
  { t: at(-1, 18), rr: 18, spo2: 96, hr: 92, sbp: 128, dbp: 78, temp: '37.8', loc: 'A' },
  { t: at(-1, 22), rr: 20, spo2: 95, hr: 98, sbp: 122, dbp: 74, temp: '38.4', loc: 'A' },
  { t: at(0, 2), rr: 22, spo2: 94, hr: 108, sbp: 112, dbp: 68, temp: '38.9', loc: 'A' },
  { t: at(0, 6), rr: 24, spo2: 93, hr: 116, sbp: 104, dbp: 62, temp: '39.3', loc: 'A' },
  { t: at(0, 10), rr: 22, spo2: 94, hr: 108, sbp: 106, dbp: 64, temp: '38.7', loc: 'A' },
  { t: at(0, 13, 50), rr: 22, spo2: 95, hr: 104, sbp: 108, dbp: 66, temp: '38.3', loc: 'A' },
];

/**
 * Observation sets keyed by the region chart's parameter ids. ADDS records oxygen as a flow rate;
 * NEWS2 and NZEWS record air or oxygen.
 */
export function observationSets(region: ClinicalRegion): EwsObservationSet[] {
  return OBS_ROWS.map(r => ({
    time: r.t,
    recordedBy: CURRENT_NURSE[region],
    values: {
      respiratoryRate: r.rr,
      oxygenSaturation: r.spo2,
      ...(region === 'AU' ? { oxygenFlow: 0 } : { supplementalOxygen: 'air' }),
      heartRate: r.hr,
      systolicBloodPressure: r.sbp,
      temperature: { value: Number(r.temp), display: r.temp },
      consciousness: r.loc,
    },
  }));
}

/** The latest set, for the early warning score summary. */
export function latestObservation(region: ClinicalRegion): EwsObservationSet {
  const sets = observationSets(region);
  return sets[sets.length - 1];
}

/** Graph and table series, ids matching the early warning parameter ids so annotators line up. */
export const SERIES = {
  temperature: { id: 'temperature', label: 'Temperature', unit: '°C', unitDefinition: 'degrees Celsius', roundTo: 1,
    points: OBS_ROWS.map(r => ({ time: r.t, value: Number(r.temp), display: r.temp, source: 'machine' as const })) },
  heartRate: { id: 'heartRate', label: 'Pulse rate', unit: 'beats/min', unitDefinition: 'beats per minute',
    points: OBS_ROWS.map(r => ({ time: r.t, value: r.hr, source: 'machine' as const })) },
  respiratoryRate: { id: 'respiratoryRate', label: 'Respiratory rate', unit: 'breaths/min', unitDefinition: 'breaths per minute',
    points: OBS_ROWS.map(r => ({ time: r.t, value: r.rr, source: 'manual' as const })) },
  oxygenSaturation: { id: 'oxygenSaturation', label: 'Oxygen saturation', unit: '%', unitDefinition: 'per cent',
    points: OBS_ROWS.map(r => ({ time: r.t, value: r.spo2, source: 'machine' as const, context: 'Room air' })) },
} satisfies Record<string, ObservationSeries>;

export const BLOOD_PRESSURE: BloodPressureSeries = {
  points: OBS_ROWS.map(r => ({ time: r.t, systolic: r.sbp, diastolic: r.dbp, source: 'machine' as const, context: 'Left arm, lying' })),
};

/**
 * Patient-specific critical thresholds set by the admitting team, in addition to the chart's bands.
 * The 06:00 temperature of 39.3 °C breaches the high limit.
 */
export const CRITICAL_THRESHOLDS: ObservationCriticalThreshold[] = [
  { appliesTo: 'temperature', direction: 'high', value: 39, setBy: 'Dr R Okafor, 26-Oct-2026' },
  { appliesTo: 'systolic', direction: 'low', value: 90, setBy: 'Dr R Okafor, 26-Oct-2026' },
  { appliesTo: 'oxygenSaturation', direction: 'low', value: 91, setBy: 'Dr R Okafor, 26-Oct-2026' },
];

/** Start of the 24-hour observation window shown on graphs. */
export const OBS_WINDOW = { start: at(-1, 14, 5), end: EXAMPLE_NOW };

/* ------------------------------------------------------------------------------------------------
 * Decision support alerts
 * ---------------------------------------------------------------------------------------------- */

/** One high priority and one priority alert per region (AlertContainer groups and orders them). */
export function alerts(region: ClinicalRegion): DecisionSupportAlert[] {
  const statin = region === 'AU' ? 'simvastatin' : 'atorvastatin';
  const high: DecisionSupportAlert =
    region === 'AU'
      ? {
          id: 'interaction', status: 'High Priority', occurredAt: at(-1, 21, 5), source: 'Drug Interaction Checking',
          summary: 'Clarithromycin is contraindicated with simvastatin: high risk of myopathy and rhabdomyolysis.',
          details: {
            patientSpecific: 'Both are current. Clarithromycin started 26-Oct-2026 21:00; simvastatin 40 mg at night is a regular medicine.',
            rationale: 'Clarithromycin strongly inhibits CYP3A4 and raises simvastatin levels.',
            references: 'Australian Medicines Handbook, interactions: macrolides with statins.',
          },
          actions: [
            { id: 'withhold', label: 'Withhold simvastatin until 48 hours after the last clarithromycin dose', preference: 5, reasons: ['Short antibiotic course', 'Statin interruption is low risk'] },
            { id: 'switch', label: 'Change clarithromycin to doxycycline', preference: 4, reasons: ['No CYP3A4 interaction'] },
            { id: 'override', label: 'Continue both with documented reason', preference: 1, reasons: ['Contraindicated combination'] },
          ],
        }
      : {
          id: 'allergy', status: 'High Priority', occurredAt: at(-1, 22, 5), source: 'Allergy Checking',
          summary: region === 'GB'
            ? 'Co-amoxiclav contains amoxicillin, a penicillin. Recorded allergy: penicillin (anaphylaxis).'
            : 'Amoxicillin is a penicillin. Recorded allergy: penicillin (anaphylaxis).',
          details: {
            patientSpecific: `Allergy recorded 02-Feb-2024 by ${region === 'GB' ? 'Dr A Patel' : 'Dr A Moana'}. One dose given at 22:15 on 26-Oct-2026; no reaction recorded.`,
            rationale: 'Cross-reactivity within the penicillin class is expected. Anaphylaxis is a severe reaction.',
            references: region === 'GB' ? 'BNF: penicillins, contra-indications.' : 'NZ Formulary: penicillins, contraindications.',
          },
          actions: [
            { id: 'stop', label: 'Stop the penicillin and prescribe a non-beta-lactam alternative', preference: 5, reasons: ['Recorded anaphylaxis to the class'] },
            { id: 'review', label: 'Review the allergy record with the patient', preference: 3, reasons: ['Confirms the reaction history'] },
            { id: 'override', label: 'Continue with documented reason', preference: 1, reasons: ['Anaphylaxis risk'] },
          ],
        };
  const priority: DecisionSupportAlert =
    region === 'AU'
      ? {
          id: 'renal', status: 'Priority', occurredAt: at(0, 9, 20), source: 'Dose Calculations',
          summary: 'Enoxaparin: eGFR 28 mL/min/1.73 m² on 27-Oct-2026. Consider a reduced dose for prophylaxis.',
          details: { patientSpecific: 'Creatinine 182 micromol/L, eGFR 28 (09:00 today). Weight 74 kg.', rationale: 'Enoxaparin accumulates when creatinine clearance is below 30 mL/min.' },
          actions: [{ id: 'reduce', label: 'Reduce enoxaparin to 20 mg once a day', preference: 4, reasons: ['Renal impairment'] }],
        }
      : {
          id: 'statin', status: 'Priority', occurredAt: at(-1, 22, 5), source: 'Drug Interaction Checking',
          summary: `Clarithromycin with ${statin}: increased risk of myopathy.`,
          details: { patientSpecific: `${statin[0].toUpperCase() + statin.slice(1)} 20 mg at night is current.`, rationale: 'Clarithromycin inhibits CYP3A4 and raises statin levels.' },
          actions: [{ id: 'withhold', label: `Withhold ${statin} during the course`, preference: 4, reasons: ['Short course', 'Low risk of interruption'] }],
        };
  return [high, priority];
}
