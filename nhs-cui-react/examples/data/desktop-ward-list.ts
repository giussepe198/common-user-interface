/**
 * Ward list and handover data for the desktop-ward-list example. Built on the shared cast in ./patients:
 * the main patient and the ward neighbours (including each region's similar-name pair) plus a few extra
 * fictional patients so the list has enough rows to filter, sort and group. Identifiers are test values.
 */
import type { ClinicalRegion, PatientListPatient, HandoverPatient, HandoverTask } from '@clinical-cui/react';
import { MAIN_PATIENT, WARD } from './patients';

/** One bed on the ward list. A null patient is an unoccupied bed (shown as "UNOCCUPIED", PAL-0660). */
export interface WardRow {
  bed: number;
  patient: PatientListPatient | null;
  /** Latest early warning score; null when unoccupied. */
  ews: number | null;
  consultant: string;
  /** Admission date, YYYY-MM-DD. */
  admitted: string;
  diagnosis: string;
  /** Outstanding tasks, one per sublist row. */
  tasks: string[];
}

export interface WardSetup {
  ward: string;
  listFor: string;
  /** Column title for the early warning score in this region. */
  ewsTitle: string;
  consultants: string[];
  rows: WardRow[];
  /** Day staff giving handover and late staff receiving it. */
  giver: string;
  receiver: string;
  handoverPlace: string;
  /** Read-back wording for resuscitation status in this region. */
  resusText: string;
  /** Read-back item for the main patient (the allergy where one is recorded). */
  mainReadBack: string;
}

type WardPerson = (typeof WARD)['GB'][number];

/** Map a ward neighbour onto the list's identity record, using the region's identifier field. */
function fromWard(p: WardPerson, region: ClinicalRegion, title?: string): PatientListPatient {
  const base: PatientListPatient = { familyName: p.familyName, givenName: p.givenName, dateOfBirth: p.dateOfBirth, gender: p.gender, title };
  if (region === 'GB') return { ...base, nhsNumber: p.identifier };
  if (region === 'AU') return { ...base, title: undefined, mrn: p.identifier };
  return { ...base, nhi: p.identifier };
}

/** Map the region's main patient. AU shows the IHI first, then the URN (G10 1.6). */
function fromMain(region: ClinicalRegion): PatientListPatient {
  const m = MAIN_PATIENT[region];
  const id = (t: string) => m.identifiers.find(i => i.type === t)?.value ?? null;
  return {
    familyName: m.familyName, givenName: m.givenName, title: region === 'AU' ? undefined : m.title, preferredName: m.preferredName,
    dateOfBirth: m.dateOfBirth, gender: m.gender, nhsNumber: id('nhs'), ihi: id('ihi'), mrn: id('mrn'), nhi: id('nhi'),
  };
}

const w = (region: ClinicalRegion, i: number) => WARD[region][i];

export const WARD_SETUP: Record<ClinicalRegion, WardSetup> = {
  GB: {
    ward: 'Ward 7, Orwell Wing', listFor: 'Ward 7 nursing team', ewsTitle: 'NEWS2', consultants: ['Dr Okafor', 'Dr Hale'],
    giver: 'Staff Nurse K Adeyemi', receiver: 'Staff Nurse T Morgan', handoverPlace: 'Ward 7 office', resusText: 'Resuscitation status: DNACPR in place', mainReadBack: 'Allergy: penicillin (anaphylaxis)',
    rows: [
      { bed: 1, patient: fromWard(w('GB', 0), 'GB', 'Mrs'), ews: 0, consultant: 'Dr Okafor', admitted: '2026-10-25', diagnosis: 'Cellulitis, left leg', tasks: ['Review IV antibiotics (48 hours)'] },
      { bed: 2, patient: fromWard(w('GB', 1), 'GB', 'Mr'), ews: 5, consultant: 'Dr Hale', admitted: '2026-10-24', diagnosis: 'Community-acquired pneumonia', tasks: ['Repeat lactate', 'Review chest X-ray', 'Fluid balance chart'] },
      { bed: 3, patient: fromWard(w('GB', 2), 'GB', 'Mr'), ews: 3, consultant: 'Dr Okafor', admitted: '2026-10-26', diagnosis: 'Atrial fibrillation with fast ventricular rate', tasks: ['Repeat ECG', 'Check potassium'] },
      { bed: 4, patient: fromMain('GB'), ews: 2, consultant: 'Dr Okafor', admitted: '2026-10-23', diagnosis: 'Fall at home, fractured left wrist', tasks: ['Physiotherapy assessment', 'Occupational therapy home visit'] },
      { bed: 5, patient: null, ews: null, consultant: '', admitted: '', diagnosis: '', tasks: [] },
      { bed: 6, patient: { familyName: 'Patel', givenName: 'Anita', title: 'Ms', dateOfBirth: '1977-03-12', gender: 'Female', nhsNumber: '9990000069' }, ews: 1, consultant: 'Dr Hale', admitted: '2026-10-26', diagnosis: 'Asthma exacerbation', tasks: ['Peak flow before and after nebuliser'] },
      { bed: 8, patient: { familyName: 'Walker', givenName: 'David', title: 'Mr', dateOfBirth: '1958-10-02', gender: 'Male', nhsNumber: '9990000077' }, ews: 0, consultant: 'Dr Hale', admitted: '2026-10-26', diagnosis: 'Laparoscopic cholecystectomy, day 1', tasks: [] },
      { bed: 9, patient: fromWard(w('GB', 3), 'GB', 'Mr'), ews: 4, consultant: 'Dr Hale', admitted: '2026-10-27', diagnosis: 'Diabetic ketoacidosis', tasks: ['Hourly capillary glucose', 'Review insulin infusion rate'] },
      { bed: 10, patient: { familyName: 'Hughes', givenName: 'Margaret', title: 'Mrs', dateOfBirth: '1936-01-19', gender: 'Female', nhsNumber: '9990000085' }, ews: 2, consultant: 'Dr Okafor', admitted: '2026-10-27', diagnosis: 'Urinary tract infection with new confusion', tasks: ['Admission bloods', 'Delirium screen'] },
    ],
  },
  AU: {
    ward: 'Ward 5B, Fitzroy Campus', listFor: 'Ward 5B nursing team', ewsTitle: 'EWS', consultants: ['Dr Ramanathan', 'Dr Fraser'],
    giver: 'RN J Murphy', receiver: 'RN P Sandhu', handoverPlace: 'Ward 5B staff station', resusText: 'Goals of care: not for CPR', mainReadBack: 'High falls risk: supervise when mobilising',
    rows: [
      { bed: 1, patient: { familyName: 'Papadopoulos', givenName: 'Eleni', dateOfBirth: '1977-03-12', gender: 'Female', mrn: '0412388' }, ews: 1, consultant: 'Dr Fraser', admitted: '2026-10-26', diagnosis: 'Asthma exacerbation', tasks: ['Peak flow before and after nebuliser'] },
      { bed: 2, patient: fromWard(w('AU', 0), 'AU'), ews: 0, consultant: 'Dr Ramanathan', admitted: '2026-10-25', diagnosis: 'Cellulitis, left leg', tasks: ['Review IV antibiotics (48 hours)'] },
      { bed: 3, patient: fromWard(w('AU', 2), 'AU'), ews: 3, consultant: 'Dr Ramanathan', admitted: '2026-10-26', diagnosis: 'Atrial fibrillation with fast ventricular rate', tasks: ['Repeat ECG', 'Check potassium'] },
      { bed: 4, patient: { familyName: 'Kelly', givenName: 'Liam', dateOfBirth: '1958-10-02', gender: 'Male', mrn: '0401924' }, ews: 0, consultant: 'Dr Fraser', admitted: '2026-10-26', diagnosis: 'Laparoscopic cholecystectomy, day 1', tasks: [] },
      { bed: 5, patient: fromWard(w('AU', 1), 'AU'), ews: 5, consultant: 'Dr Fraser', admitted: '2026-10-24', diagnosis: 'Community-acquired pneumonia', tasks: ['Repeat lactate', 'Review chest X-ray', 'Fluid balance chart'] },
      { bed: 6, patient: { familyName: 'Rossi', givenName: 'Maria', dateOfBirth: '1936-01-19', gender: 'Female', mrn: '0420031' }, ews: 2, consultant: 'Dr Ramanathan', admitted: '2026-10-27', diagnosis: 'Urinary tract infection with new confusion', tasks: ['Admission bloods', 'Delirium screen'] },
      { bed: 7, patient: null, ews: null, consultant: '', admitted: '', diagnosis: '', tasks: [] },
      { bed: 9, patient: fromWard(w('AU', 3), 'AU'), ews: 4, consultant: 'Dr Fraser', admitted: '2026-10-27', diagnosis: 'Diabetic ketoacidosis', tasks: ['Hourly capillary glucose', 'Review insulin infusion rate'] },
      { bed: 12, patient: fromMain('AU'), ews: 2, consultant: 'Dr Ramanathan', admitted: '2026-10-23', diagnosis: 'Fall at home, fractured left wrist', tasks: ['Physiotherapy assessment', 'Occupational therapy home visit'] },
    ],
  },
  NZ: {
    ward: 'Ward 24, Riverside Hospital', listFor: 'Ward 24 nursing team', ewsTitle: 'NZEWS', consultants: ['Dr Tane', 'Dr Whitmore'],
    giver: 'RN A Tipene', receiver: 'RN L Fonoti', handoverPlace: 'Ward 24 office', resusText: 'Resuscitation status: not for CPR', mainReadBack: 'Allergy: penicillin (anaphylaxis); latex',
    rows: [
      { bed: 1, patient: { familyName: 'Singh', givenName: 'Harpreet', title: 'Ms', dateOfBirth: '1977-03-12', gender: 'Female', nhi: 'ZZZ0067' }, ews: 1, consultant: 'Dr Whitmore', admitted: '2026-10-26', diagnosis: 'Asthma exacerbation', tasks: ['Peak flow before and after nebuliser'] },
      { bed: 2, patient: fromWard(w('NZ', 0), 'NZ', 'Mr'), ews: 3, consultant: 'Dr Tane', admitted: '2026-10-26', diagnosis: 'Atrial fibrillation with fast ventricular rate', tasks: ['Repeat ECG', 'Check potassium'] },
      { bed: 3, patient: fromWard(w('NZ', 2), 'NZ', 'Mrs'), ews: 0, consultant: 'Dr Tane', admitted: '2026-10-25', diagnosis: 'Cellulitis, left leg', tasks: ['Review IV antibiotics (48 hours)'] },
      { bed: 4, patient: null, ews: null, consultant: '', admitted: '', diagnosis: '', tasks: [] },
      { bed: 5, patient: { familyName: 'MacDonald', givenName: 'Ian', title: 'Mr', dateOfBirth: '1958-10-02', gender: 'Male', nhi: 'ZZZ0075' }, ews: 0, consultant: 'Dr Whitmore', admitted: '2026-10-26', diagnosis: 'Laparoscopic cholecystectomy, day 1', tasks: [] },
      { bed: 6, patient: fromWard(w('NZ', 1), 'NZ', 'Mr'), ews: 4, consultant: 'Dr Whitmore', admitted: '2026-10-27', diagnosis: 'Diabetic ketoacidosis', tasks: ['Hourly capillary glucose', 'Review insulin infusion rate'] },
      { bed: 7, patient: fromMain('NZ'), ews: 2, consultant: 'Dr Tane', admitted: '2026-10-23', diagnosis: 'Fall at home, fractured left wrist', tasks: ['Physiotherapy assessment', 'Occupational therapy home visit'] },
      { bed: 8, patient: { familyName: 'Hēnare', givenName: 'Ataahua', title: 'Mrs', dateOfBirth: '1936-01-19', gender: 'Female', nhi: 'ZZZ0083' }, ews: 2, consultant: 'Dr Tane', admitted: '2026-10-27', diagnosis: 'Urinary tract infection with new confusion', tasks: ['Admission bloods', 'Delirium screen'] },
      { bed: 9, patient: fromWard(w('NZ', 3), 'NZ', 'Mrs'), ews: 5, consultant: 'Dr Whitmore', admitted: '2026-10-24', diagnosis: 'Community-acquired pneumonia', tasks: ['Repeat lactate', 'Review chest X-ray', 'Fluid balance chart'] },
    ],
  },
};

/** Fixed timestamps relative to EXAMPLE_NOW (27-Oct-2026 14:05). */
const T = (hhmm: string) => `2026-10-27T${hhmm}`;

/**
 * Handover items for the late shift: the patients who need something done or read back, in bed order,
 * each with its tasks. Built from the ward rows so names and identifiers always match the list.
 */
export function buildHandover(region: ClinicalRegion): { patients: HandoverPatient[]; tasks: HandoverTask[] } {
  const s = WARD_SETUP[region];
  const picked = s.rows.filter(r => r.patient && (r.ews ?? 0) >= 2);
  const patients: HandoverPatient[] = picked.map((r, i) => {
    const p = r.patient as PatientListPatient;
    return {
      id: `hp-${r.bed}`,
      familyName: p.familyName, givenName: p.givenName, title: p.title, gender: p.gender, dateOfBirth: p.dateOfBirth,
      nhsNumber: p.nhsNumber, ihi: p.ihi, mrn: p.mrn, nhi: p.nhi,
      location: `${s.ward.split(',')[0]}, bed ${r.bed}`,
      responsible: { name: s.giver, role: 'Registered nurse' },
      consultant: r.consultant,
      handoverState: 'toHandOver',
      // The oldest patient has a resuscitation decision that must be read back; the main patient has one key fact too.
      readBackReasons: r.diagnosis.startsWith('Urinary') ? [s.resusText] : r.diagnosis.startsWith('Fall') ? [s.mainReadBack] : undefined,
      updatedAt: T(i % 2 ? '13:40' : '12:55'),
      updatedBy: s.giver,
    };
  });
  const due = ['13:30', '16:00', '18:00', '15:00', '17:00', '20:00'];
  const tasks: HandoverTask[] = [];
  picked.forEach((r, i) => {
    r.tasks.forEach((d, j) => {
      const k = i * 3 + j;
      const status = k % 4 === 1 ? 'partial' : k % 5 === 3 ? 'complete' : 'incomplete';
      tasks.push({
        id: `ht-${r.bed}-${j}`,
        patientId: `hp-${r.bed}`,
        description: d,
        status,
        due: T(due[k % due.length]),
        allocatedTo: j === 0 ? s.receiver : undefined,
        forHandover: d.startsWith('Repeat lactate') || d.startsWith('Hourly'),
        completedBy: status === 'complete' ? s.giver : undefined,
      });
    });
  });
  return { patients, tasks };
}
