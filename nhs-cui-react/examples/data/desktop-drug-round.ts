/**
 * Drug administration chart lines for the desktop drug round example, one patient per region, matching
 * the current medications in ./desktop-patient-record. "Now" is 27-Oct-2026 14:05; the patient has been
 * nil by mouth since 10:00 for a bronchoscopy at 16:00.
 *
 * Recorded non-administrations carry the region's code where the national chart has one: AU NIMC
 * (W withheld, F fasting) and NZ HQSC (W withheld, D prescriber's instructions). GB records a status only.
 */
import type { AdminEvent, AdminMedication, ClinicalRegion } from '@clinical-cui/react';
import { CURRENT_NURSE, at } from './desktop-patient-record';

/** A dose given a few minutes after its scheduled time. */
function given(region: ClinicalRegion, id: string, day: number, hour: number, extra: Partial<AdminEvent> = {}): AdminEvent {
  return { id, scheduledTime: at(day, hour), status: 'given', administeredAt: at(day, hour, 6), recordedBy: CURRENT_NURSE[region], ...extra };
}
/** A scheduled dose not yet recorded. */
function planned(id: string, day: number, hour: number, extra: Partial<AdminEvent> = {}): AdminEvent {
  return { id, scheduledTime: at(day, hour), ...extra };
}

/** Infusion with its detailed record (MEDa-0152): start, a volume check and an outstanding issue. */
function infusion(region: ClinicalRegion, prescriber: string): AdminMedication {
  const nurse = CURRENT_NURSE[region];
  return {
    id: 'nacl', name: 'sodium chloride 0.9%', kind: 'significantDuration', route: 'intravenous', prescriber,
    line: { genericName: 'sodium chloride', strength: { kind: 'percentage', values: [0.9] }, form: 'infusion', doseEquivalent: { label: 'VOLUME', quantity: { value: 1000, unit: 'mL' } }, route: 'intravenous', doseDuration: 'over 8 hours', rate: '125 mL per hour' },
    startDate: at(0, 10), startIsActual: true, events: [],
    verification: 'verified', verifiedBy: region === 'GB' ? 'P Ahmed (Pharmacist)' : region === 'AU' ? 'J Walsh (Pharmacist)' : 'S Lee (Pharmacist)', verifiedAt: at(0, 9, 30),
    infusion: {
      scheduledStart: at(0, 10), expectedDurationMinutes: 480, actualStart: at(0, 10, 5),
      log: [
        { id: 'l1', kind: 'start', at: at(0, 10, 5), by: nurse, rate: '125 mL/hour', pumpSetting: 'VTBI 1000 mL', volume: '1000 mL bag' },
        { id: 'l2', kind: 'check', at: at(0, 12), by: nurse, volume: '240 mL infused', volumeApprox: true, text: 'Site clean, no swelling.' },
        { id: 'l3', kind: 'issue', at: at(0, 13, 40), by: nurse, category: 'Cannula site', text: 'Site slightly red, patient reports discomfort.',
          resolved: false, instruction: 'Check the site hourly. Resite the cannula if swelling or pain increase.', actions: [{ id: 'resite', label: 'Request cannula resite' }] },
      ],
    },
  };
}

export function roundMedications(region: ClinicalRegion): AdminMedication[] {
  const nurse = CURRENT_NURSE[region];
  if (region === 'AU') {
    const prescriber = 'Dr L Nguyen';
    return [
      { id: 'ceft', name: 'ceftriaxone', kind: 'regular', route: 'intravenous', prescriber, startDate: at(-1, 21), startIsActual: true, scheduledTimes: ['21:00'],
        verification: 'verified', verifiedBy: 'J Walsh (Pharmacist)', verifiedAt: at(0, 9),
        line: { genericName: 'ceftriaxone', strength: '1 g', form: 'injection', route: 'intravenous', dose: { value: 1, unit: 'g' }, frequency: 'once a day', instructions: 'Give over 30 minutes' },
        events: [given(region, 'c1', -1, 21), planned('c2', 0, 21), planned('c3', 1, 21)] },
      { id: 'clari', name: 'clarithromycin', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 21), startIsActual: true, scheduledTimes: ['08:00', '20:00'],
        verification: 'awaiting',
        line: { genericName: 'clarithromycin', strength: '500 mg', form: 'tablet', route: 'oral', dose: { value: 500, unit: 'mg' }, frequency: 'twice a day', courseDuration: 'for 5 days' },
        events: [given(region, 'k0', -1, 21, { scheduledTime: at(-1, 21) }), given(region, 'k1', 0, 8), planned('k2', 0, 20), planned('k3', 1, 8), planned('k4', 1, 20)] },
      { id: 'simva', name: 'simvastatin', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 21), startIsActual: true, scheduledTimes: ['21:00'],
        line: { genericName: 'simvastatin', strength: '40 mg', form: 'tablet', route: 'oral', dose: { value: 40, unit: 'mg' }, frequency: 'once a day', qualifiers: ['at night'] },
        events: [{ id: 's1', scheduledTime: at(-1, 21), status: 'withheld', reasonCode: 'W', reasonText: 'Interaction alert with clarithromycin; prescriber asked to review', administeredAt: at(-1, 21, 10), recordedBy: nurse },
          planned('s2', 0, 21), planned('s3', 1, 21)] },
      // Oral doses at 08:00 today were given before the fast began; the 08:00 amlodipine was refused.
      { id: 'amlo', name: 'amlodipine', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 21), startIsActual: true, scheduledTimes: ['08:00'],
        line: { genericName: 'amlodipine', strength: '5 mg', form: 'tablet', route: 'oral', dose: { value: 5, unit: 'mg' }, frequency: 'once a day' },
        events: [{ id: 'a1', scheduledTime: at(0, 8), status: 'patientRefused', reasonCode: 'R', administeredAt: at(0, 8, 10), recordedBy: nurse, notes: 'Nauseated. Prescriber informed.' }, planned('a2', 1, 8)] },
      { id: 'enox', name: 'enoxaparin', kind: 'regular', route: 'subcutaneous', prescriber, startDate: at(0, 18), scheduledTimes: ['18:00'],
        line: { genericName: 'enoxaparin', strength: '40 mg/0.4 mL', form: 'injection', route: 'subcutaneous', dose: { value: 40, unit: 'mg' }, frequency: 'once a day' },
        events: [planned('e1', 0, 18, { intendedDose: '40 mg' }), planned('e2', 1, 18, { intendedDose: '40 mg' })] },
      { id: 'para', name: 'paracetamol', kind: 'asRequiredUnscheduled', route: 'oral', prescriber, startDate: at(-1, 20), asRequired: { criteria: 'Pain or fever', minIntervalMinutes: 240, maxPerDay: 4 },
        line: { genericName: 'paracetamol', strength: '500 mg', form: 'tablet', route: 'oral', dose: { value: 1, unit: 'g' }, frequency: 'every 4 to 6 hours when required', qualifiers: ['maximum 4 g in 24 hours'], indication: 'pain or fever' },
        events: [{ id: 'p1', status: 'given', administeredAt: at(0, 6, 20), timePrecision: 'exact', dose: '1 g', recordedBy: nurse }] },
      infusion(region, prescriber),
    ];
  }

  const prescriber = region === 'GB' ? 'Dr R Okafor' : 'Dr H Te Huia';
  const isGB = region === 'GB';
  // The penicillin dose at 08:00 was held back by the nurse because of the allergy alert. NZ records
  // W (withheld, explanation required); GB has no code, so the status carries the meaning.
  const heldAbx: AdminEvent = isGB
    ? { id: 'x1', scheduledTime: at(0, 8), status: 'otherClinicalReason', administeredAt: at(0, 8, 10), recordedBy: nurse, notes: 'Held: allergy alert (penicillin). Prescriber asked to review.' }
    : { id: 'x1', scheduledTime: at(0, 8), status: 'withheld', reasonCode: 'W', reasonText: 'Allergy alert (penicillin). Prescriber asked to review.', administeredAt: at(0, 8, 10), recordedBy: nurse };
  return [
    { id: 'abx', name: isGB ? 'co-amoxiclav' : 'amoxicillin', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 22), startIsActual: true, scheduledTimes: ['08:00', '14:00', '22:00'],
      verification: 'awaiting',
      line: isGB
        ? { genericName: 'co-amoxiclav', form: 'tablet', dose: { value: 625, unit: 'mg' }, route: 'oral', frequency: 'three times a day' }
        : { genericName: 'amoxicillin', form: 'capsule', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: 'three times a day' },
      events: [given(region, 'x0', -1, 22, { administeredAt: at(-1, 22, 15) }), heldAbx, planned('x2', 0, 14), planned('x3', 0, 22), planned('x4', 1, 8), planned('x5', 1, 14)] },
    { id: 'clari', name: 'clarithromycin', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 22), startIsActual: true, scheduledTimes: ['08:00', '20:00'],
      verification: 'verified', verifiedBy: isGB ? 'P Ahmed (Pharmacist)' : 'S Lee (Pharmacist)', verifiedAt: at(0, 9),
      line: { genericName: 'clarithromycin', form: 'tablet', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'twice a day' },
      events: [given(region, 'k0', -1, 22, { scheduledTime: at(-1, 22) }), given(region, 'k1', 0, 8), planned('k2', 0, 20), planned('k3', 1, 8)] },
    { id: 'amlo', name: 'amlodipine', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 22), startIsActual: true, scheduledTimes: ['08:00'],
      line: { genericName: 'amlodipine', form: 'tablet', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' },
      events: [given(region, 'a1', 0, 8), planned('a2', 1, 8)] },
    { id: 'ator', name: 'atorvastatin', kind: 'regular', route: 'oral', prescriber, startDate: at(-1, 22), startIsActual: true, scheduledTimes: ['22:00'],
      line: { genericName: 'atorvastatin', form: 'tablet', dose: { value: 20, unit: 'mg' }, route: 'oral', frequency: 'once a day', qualifiers: ['at night'] },
      events: [isGB
        ? { id: 't1', scheduledTime: at(-1, 22), status: 'deferred', administeredAt: at(-1, 22, 15), recordedBy: nurse, notes: 'Interaction alert with clarithromycin; awaiting review.' }
        : { id: 't1', scheduledTime: at(-1, 22), status: 'withheld', reasonCode: 'D', reasonText: 'Prescriber: withhold during clarithromycin course', administeredAt: at(-1, 22, 15), recordedBy: nurse },
        planned('t2', 0, 22), planned('t3', 1, 22)] },
    { id: 'enox', name: 'enoxaparin', kind: 'regular', route: 'subcutaneous', prescriber, startDate: at(0, 18), scheduledTimes: ['18:00'],
      line: { genericName: 'enoxaparin', dose: { value: 40, unit: 'mg' }, route: 'subcutaneous', frequency: 'once a day' },
      events: [planned('e1', 0, 18, { intendedDose: '40 mg' }), planned('e2', 1, 18, { intendedDose: '40 mg' })] },
    { id: 'para', name: 'paracetamol', kind: 'asRequiredUnscheduled', route: 'oral', prescriber, startDate: at(-1, 20), asRequired: { criteria: 'For pain or fever', minIntervalMinutes: 240, maxPerDay: 4 },
      line: { genericName: 'paracetamol', form: 'tablet', dose: { value: 1, unit: 'g' }, route: 'oral', frequency: isGB ? 'every 4 to 6 hours as required' : 'every 4 to 6 hours when required', qualifiers: [isGB ? 'maximum 4 doses in 24 hours' : 'maximum 4 g in 24 hours'], indication: 'for pain or fever' },
      events: [{ id: 'p1', status: 'given', administeredAt: at(0, 6, 20), timePrecision: 'exact', dose: '1 g', recordedBy: nurse }] },
    infusion(region, prescriber),
  ];
}
