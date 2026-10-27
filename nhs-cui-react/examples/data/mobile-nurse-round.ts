/**
 * Data for mobile-nurse-round: one afternoon medication round on the ward, per region. The worklist tasks and the
 * administration details for each dose come from here; the patients are the shared cast (see patients.ts).
 */
import { adminReasonCodes, mobileIdentityMatch } from '@clinical-cui/react';
import type {
  ClinicalRegion,
  DoseWristbandScan,
  MedicationLineData,
  MobilePatientIdentity,
  MobileQuantity,
  MobileUnitDose,
  ReasonCodeValue,
  SecondChecker,
  WorklistTask,
} from '@clinical-cui/react';
import { MAIN_PATIENT, WARD } from './patients';
import { mobileIdentity, today, wardIdentity } from './mobile-patient-review';

/** The early warning chart each region's observation tasks use (AU-OB-01: the chart is local data). */
const CHART_NAME: Record<ClinicalRegion, string> = { GB: 'NEWS2', AU: 'ADDS', NZ: 'NZEWS' };

/** Everything DoseAdministrationFlow needs for one dose, beyond the patient and the order. */
export interface RoundDose {
  dose: MobileQuantity;
  unitDose?: MobileUnitDose;
  scheduledAt: Date;
  lastGivenAt?: Date;
  minIntervalMinutes?: number;
  givenIn24Hours?: MobileQuantity;
  maximumIn24Hours?: MobileQuantity;
  /** What the barcode scanner read from the pack. */
  productText?: string;
  /** High-risk reason, e.g. "insulin". */
  highRisk?: string;
  /** Latest result to show before giving (blood glucose for insulin, heart rate for a beta blocker). */
  check?: { label: string; value: string; at: Date; source: string };
}

export interface RoundTask extends WorklistTask {
  administration?: RoundDose;
}

/** The people on this round, by role in the story. */
export interface RoundCast {
  main: MobilePatientIdentity;
  /** The similar-name pair: one has observations due, the other insulin (AU-PI-04). */
  pairA: MobilePatientIdentity;
  pairB: MobilePatientIdentity;
  /** The patient whose dose is withheld. */
  withheld: MobilePatientIdentity;
  /** Someone with a non-medication task. */
  dressing: MobilePatientIdentity;
}

export function roundCast(region: ClinicalRegion): RoundCast {
  const w = WARD[region];
  const ward = (i: number) => wardIdentity(w[i], region);
  return region === 'NZ'
    ? { main: mobileIdentity(MAIN_PATIENT.NZ, 'NZ'), pairA: ward(0), pairB: ward(1), withheld: ward(3), dressing: ward(2) }
    : {
        main: mobileIdentity(MAIN_PATIENT[region], region),
        pairA: ward(2),
        pairB: ward(3),
        withheld: ward(region === 'GB' ? 1 : 0),
        dressing: ward(region === 'GB' ? 0 : 1),
      };
}

const mg = (v: number) => ({ kind: 'simple' as const, values: [v], unit: 'mg' });

const PARACETAMOL: MedicationLineData = {
  genericName: 'paracetamol',
  brandName: 'Panadol',
  strength: mg(500),
  form: 'tablet',
  route: 'oral',
  dose: { value: 1, unit: 'g' },
  frequency: 'four times a day',
};
const INSULIN: MedicationLineData = {
  genericName: 'insulin aspart',
  brandName: 'NovoRapid',
  strength: { kind: 'perUnit', values: [100], unit: 'units', fluidUnit: 'mL' },
  form: 'injection',
  route: 'subcutaneous',
  dose: { value: 6, unit: 'units' },
  qualifiers: ['with lunch'],
};
const METOPROLOL: MedicationLineData = {
  genericName: 'metoprolol',
  strength: mg(47.5),
  form: 'modified-release tablet',
  route: 'oral',
  dose: { value: 47.5, unit: 'mg' },
  frequency: 'once a day',
  qualifiers: ['withhold if heart rate below 55'],
};

/**
 * The round at 14:05. Times are chosen so each state shows: paracetamol overdue since 13:00, insulin and
 * observations due at 14:00, a dressing next, a later paracetamol, and one task already done (hidden by the list).
 */
export function roundTasks(region: ClinicalRegion): RoundTask[] {
  const c = roundCast(region);
  return [
    {
      id: 'para13',
      kind: 'medication',
      patient: c.main,
      dueAt: today(13),
      medication: PARACETAMOL,
      administration: {
        dose: { value: 1, unit: 'g' },
        unitDose: { value: 500, unit: 'mg', form: 'tablet' },
        scheduledAt: today(13),
        lastGivenAt: today(8, 5),
        minIntervalMinutes: 240,
        givenIn24Hours: { value: 3, unit: 'g' },
        maximumIn24Hours: { value: 4, unit: 'g' },
        productText: 'Panadol 500 mg tablet',
      },
    },
    {
      id: 'obs14',
      kind: 'observations',
      patient: c.pairA,
      dueAt: today(14),
      title: `Observations (${CHART_NAME[region]})`,
      detail: 'Last score 2 at 10:00',
    },
    {
      id: 'ins14',
      kind: 'medication',
      patient: c.pairB,
      dueAt: today(14),
      medication: INSULIN,
      highRisk: true,
      administration: {
        dose: { value: 6, unit: 'units' },
        scheduledAt: today(14),
        lastGivenAt: today(8, 2),
        highRisk: 'insulin',
        check: { label: 'Blood glucose', value: '9.8 mmol/L', at: today(13, 55), source: 'meter' },
      },
    },
    {
      id: 'meto14',
      kind: 'medication',
      patient: c.withheld,
      dueAt: today(14),
      medication: METOPROLOL,
      administration: {
        dose: { value: 47.5, unit: 'mg' },
        unitDose: { value: 47.5, unit: 'mg', form: 'modified-release tablet' },
        scheduledAt: today(14),
        lastGivenAt: today(14, 0, -1),
        productText: 'metoprolol 47.5 mg modified-release tablet',
        check: { label: 'Heart rate', value: '48 beats/min', at: today(13, 50), source: 'monitor' },
      },
    },
    {
      id: 'dress',
      kind: 'other',
      patient: c.dressing,
      dueAt: today(14, 45),
      title: 'Wound dressing',
      detail: 'Left leg: change and photograph',
    },
    { id: 'para18', kind: 'medication', patient: c.main, dueAt: today(18), medication: PARACETAMOL },
    {
      id: 'obs12',
      kind: 'observations',
      patient: c.main,
      dueAt: today(12),
      completedAt: today(12, 10),
      title: `Observations (${CHART_NAME[region]})`,
    },
  ];
}

/**
 * What the scanner read from a wristband, compared with the patient on screen. The band carries the primary
 * identifier, the name and the date of birth; `mobileIdentityMatch` checks all three.
 */
export function wristbandScan(patient: MobilePatientIdentity, region: ClinicalRegion, scannedAt: Date): DoseWristbandScan {
  const band = { identifiers: patient.identifiers?.slice(0, 1), name: patient.name, dateOfBirth: patient.dateOfBirth };
  const m = mobileIdentityMatch(patient, band, region);
  return { status: m.result, matched: m.matched, differences: m.differences, scannedAt };
}

/** The signed-in nurse and the colleague who does the second check (P4). */
export const CURRENT_USER_ID = 'RN100';
export const SECOND_CHECKER: Record<ClinicalRegion, SecondChecker> = {
  GB: { id: 'RN204', name: 'Kiran Patel', role: 'RN' },
  AU: { id: 'RN204', name: 'Kiran Patel', role: 'RN' },
  NZ: { id: 'RN204', name: 'Aroha Tane', role: 'RN' },
};

/**
 * The not-given choice as the nurse has made it in frame 4: the region's "withheld" code with the reason typed.
 * The sheet itself never pre-selects a code; this is the state after the nurse's choice.
 */
export function withheldChoice(region: ClinicalRegion): ReasonCodeValue {
  // AU NIMC and NZ NMC both have W: Withheld (NZ D is a prescriber's decision, not a nurse's). The GB status set has
  // no "withheld", so a nurse holding a dose for a clinical reason records "Other clinical reason".
  const codes = adminReasonCodes(region);
  const code = (codes.find(c => c.code === 'W') ?? codes.find(c => c.status === 'otherClinicalReason'))?.code ?? null;
  return { code, reason: 'Heart rate 48 beats/min at 13:50. Dr L Okafor informed, review at 16:00.', prompts: {} };
}
