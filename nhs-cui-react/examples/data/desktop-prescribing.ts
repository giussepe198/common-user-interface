/**
 * A small fictional formulary for the desktop prescribing example: catalogue entries for DrugSearch,
 * the option lists PrescriptionForm needs for each drug, and a stand-in decision support check that
 * compares the chosen drug with the patient's recorded allergies and current medicines.
 *
 * Names are plain lower case; DrugSearch, PrescriptionForm and MedicationLine apply the regional
 * display rules (AU and NZ mixed-case lettering such as flucLOXACILLIN, cefaLEXin, cLINDAmycin).
 */
import type {
  ClinicalRegion,
  DecisionSupportAlert,
  DrugCatalogueEntry,
  DrugQuickList,
  PrescriptionFieldId,
  PrescriptionOption,
} from '@clinical-cui/react';
import { MAIN_PATIENT } from './patients';
import { at } from './desktop-patient-record';

/** Drug classes the stand-in checker knows about. */
type DrugClass = 'penicillin' | 'cephalosporin' | 'macrolide' | 'other';

export interface FormularyItem {
  entry: DrugCatalogueEntry;
  drugClass: DrugClass;
  form: string;
  options: Partial<Record<PrescriptionFieldId, PrescriptionOption[]>>;
}

const QDS: PrescriptionOption[] = [{ value: 'four times a day' }];
const QDS_TIMES: PrescriptionOption[] = [{ value: '06:00; 12:00; 18:00; 22:00', supplementary: 'Standard times' }];
const BD: PrescriptionOption[] = [{ value: 'twice a day' }];
const BD_TIMES: PrescriptionOption[] = [{ value: '08:00; 20:00', supplementary: 'Standard times' }];
const FIRST: PrescriptionOption[] = [{ value: 'Today 18:00', supplementary: 'Next standard time' }, { value: 'Now (once only first dose)' }, { value: 'Tomorrow 06:00' }];
const COURSE: PrescriptionOption[] = [{ value: '5 days' }, { value: '7 days' }, { value: '10 days' }];

export const FORMULARY: FormularyItem[] = [
  { entry: { id: 'fluclox', genericName: 'flucloxacillin', prioritised: true }, drugClass: 'penicillin', form: 'capsule',
    options: { route: [{ value: 'oral' }, { value: 'intravenous' }], dose: [{ value: '500 mg' }, { value: '1 g' }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'amox', genericName: 'amoxicillin', prioritised: true }, drugClass: 'penicillin', form: 'capsule',
    options: { route: [{ value: 'oral' }], dose: [{ value: '500 mg' }, { value: '1 g' }], frequency: [{ value: 'three times a day' }], administrationTimes: [{ value: '08:00; 14:00; 22:00', supplementary: 'Standard times' }], firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'cefalex', genericName: 'cefalexin', synonyms: ['cephalexin'] }, drugClass: 'cephalosporin', form: 'capsule',
    options: { route: [{ value: 'oral' }], dose: [{ value: '500 mg' }, { value: '1 g' }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'cefalex-b', genericName: 'cefalexin', brandName: 'Keflex' }, drugClass: 'cephalosporin', form: 'capsule',
    options: { route: [{ value: 'oral' }], dose: [{ value: '500 mg' }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'clinda', genericName: 'clindamycin', prioritised: true }, drugClass: 'other', form: 'capsule',
    options: { route: [{ value: 'oral' }, { value: 'intravenous' }], dose: [{ value: '300 mg' }, { value: '450 mg' }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'doxy', genericName: 'doxycycline' }, drugClass: 'other', form: 'tablet',
    options: { route: [{ value: 'oral' }], dose: [{ value: '100 mg' }, { value: '200 mg' }], frequency: [{ value: 'once a day' }, { value: 'twice a day' }], administrationTimes: BD_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'erythro', genericName: 'erythromycin' }, drugClass: 'macrolide', form: 'tablet',
    options: { route: [{ value: 'oral' }], dose: [{ value: '250 mg' }, { value: '500 mg' }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE } },
  { entry: { id: 'hydral', genericName: 'hydralazine', misSelectionRisk: true }, drugClass: 'other', form: 'tablet',
    options: { route: [{ value: 'oral' }], dose: [{ value: '25 mg' }], frequency: BD, administrationTimes: BD_TIMES, firstDose: FIRST, duration: [{ value: 'ongoing' }] } },
  { entry: { id: 'hydroxyz', genericName: 'hydroxyzine', misSelectionRisk: true }, drugClass: 'other', form: 'tablet',
    options: { route: [{ value: 'oral' }], dose: [{ value: '25 mg' }], frequency: [{ value: 'at night when required' }], administrationTimes: [{ value: '22:00' }], firstDose: FIRST, duration: [{ value: '7 days' }] } },
  { entry: { id: 'furo', genericName: 'furosemide', synonyms: ['frusemide'] }, drugClass: 'other', form: 'tablet',
    options: { route: [{ value: 'oral' }], dose: [{ value: '40 mg' }], frequency: [{ value: 'once a day' }], administrationTimes: [{ value: '08:00' }], firstDose: FIRST, duration: [{ value: 'ongoing' }] } },
];

export const CATALOGUE: DrugCatalogueEntry[] = FORMULARY.map(f => f.entry);

export function formularyItem(id: string): FormularyItem | undefined {
  return FORMULARY.find(f => f.entry.id === id);
}

/** A ward Quick List shown while the search box is empty (MSP-0080). */
export const QUICK_LISTS: DrugQuickList[] = [
  { id: 'abx', name: 'Antimicrobials (ward)', description: '5 commonly prescribed antimicrobials', items: ['fluclox', 'amox', 'clinda', 'doxy', 'cefalex'].map(id => formularyItem(id)!.entry) },
];

/**
 * Stand-in for an allergy and interaction checking service. A real system calls its decision support
 * service; the example only needs the shape of the result (a DecisionSupportAlert or nothing).
 */
export function checkPrescription(item: FormularyItem, region: ClinicalRegion): DecisionSupportAlert | null {
  const allergies = MAIN_PATIENT[region].allergies;
  const penicillinAllergy = allergies !== 'none-known' && allergies.some(a => a.substance === 'penicillin');
  const name = item.entry.genericName ?? '';
  const Name = name[0].toUpperCase() + name.slice(1);
  if (penicillinAllergy && item.drugClass === 'penicillin') {
    return {
      id: `allergy-${item.entry.id}`, status: 'High Priority', occurredAt: at(0, 14, 5), source: 'Allergy Checking',
      summary: `${Name} is a penicillin. Recorded allergy: penicillin (anaphylaxis).`,
      details: {
        patientSpecific: 'Penicillin anaphylaxis recorded 02-Feb-2024.',
        rationale: 'All penicillins share the beta-lactam ring; cross-reactivity within the class is expected.',
      },
      actions: [
        { id: 'clinda', label: 'Choose clindamycin instead', preference: 5, reasons: ['Not a beta-lactam', 'Covers skin infection'] },
        { id: 'doxy', label: 'Choose doxycycline instead', preference: 4, reasons: ['Not a beta-lactam'] },
      ],
    };
  }
  if (penicillinAllergy && item.drugClass === 'cephalosporin') {
    return {
      id: `allergy-${item.entry.id}`, status: 'Priority', occurredAt: at(0, 14, 5), source: 'Allergy Checking',
      summary: `${Name} is a cephalosporin. Recorded allergy: penicillin (anaphylaxis). Cross-sensitivity is possible.`,
      actions: [{ id: 'clinda', label: 'Choose clindamycin instead', preference: 4, reasons: ['Avoids beta-lactams after anaphylaxis'] }],
    };
  }
  if (item.drugClass === 'macrolide') {
    const statin = region === 'AU' ? 'simvastatin' : 'atorvastatin';
    return {
      id: `interaction-${item.entry.id}`, status: region === 'AU' ? 'High Priority' : 'Priority', occurredAt: at(0, 14, 5), source: 'Drug Interaction Checking',
      summary: `${Name} with ${statin}${region === 'AU' ? ' is contraindicated' : ''}: increased risk of myopathy. Clarithromycin is already prescribed.`,
      actions: [{ id: 'doxy', label: 'Choose doxycycline instead', preference: 4, reasons: ['No statin interaction'] }],
    };
  }
  return null;
}
