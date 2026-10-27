/**
 * Data for the desktop-clinical-note example: a small fictional concept list for the terminology search,
 * the body diagram line art, earlier blood pressure readings and the starting state of the falls note.
 * Concept ids are made up (never displayed); terms follow SNOMED CT style (preferred term, synonyms, FSN with a
 * semantic tag) so the search, flyout and abbreviation rules behave as they would against a real server.
 */
import { matchesDescription } from '@clinical-cui/react';
import type {
  ClinicalRegion,
  GraphicDefinition,
  GraphicFinding,
  NoteEntry,
  PatientBannerProps,
  PreviousValue,
  TerminologyResult,
  TerminologySearchFn,
} from '@clinical-cui/react';
import { MAIN_PATIENT } from './patients';

type Concept = TerminologyResult & { synonyms?: string[] };

/** Fictional concept list, falls and frailty focused. `isCommon` puts the term in "Common matches" (CNA-0210). */
export const NOTE_CONCEPTS: Concept[] = [
  { id: 'n01', term: 'Fracture of distal end of radius', fsn: 'Fracture of distal end of radius (disorder)', isCommon: true, parents: ['Fracture of radius'], synonyms: ["Colles' fracture", 'Distal radius fracture'] },
  { id: 'n02', term: 'Fall', fsn: 'Fall (event)', isCommon: true, parents: ['Accidental event'] },
  { id: 'n03', term: 'Orthostatic hypotension', fsn: 'Orthostatic hypotension (disorder)', isCommon: true, parents: ['Low blood pressure'], synonyms: ['Postural hypotension'] },
  { id: 'n04', term: 'Syncope', fsn: 'Syncope (disorder)', isCommon: true, parents: ['Disorder of consciousness'], synonyms: ['Faint'] },
  { id: 'n05', term: 'Osteoporosis', fsn: 'Osteoporosis (disorder)', isCommon: true, parents: ['Disorder of bone'] },
  { id: 'n06', term: 'Hypertensive disorder', fsn: 'Hypertensive disorder, systemic arterial (disorder)', isCommon: true, parents: ['Disorder of cardiovascular system'], synonyms: ['Hypertension', 'High blood pressure'] },
  { id: 'n07', term: 'Atrial fibrillation', fsn: 'Atrial fibrillation (disorder)', parents: ['Supraventricular arrhythmia'], synonyms: ['AF - Atrial fibrillation'] },
  { id: 'n08', term: 'Type 2 diabetes mellitus', fsn: 'Type 2 diabetes mellitus (disorder)', isCommon: true, parents: ['Diabetes mellitus'] },
  { id: 'n09', term: 'Cataract', fsn: 'Cataract (disorder)', parents: ['Disorder of lens'] },
  { id: 'n10', term: "Parkinson's disease", fsn: "Parkinson's disease (disorder)", parents: ['Degenerative disorder of basal ganglia'] },
  { id: 'n11', term: 'Dementia', fsn: 'Dementia (disorder)', parents: ['Cognitive disorder'] },
  { id: 'n12', term: "Ménière's disease", fsn: "Ménière's disease (disorder)", parents: ['Disorder of inner ear'] },
  { id: 'n13', term: 'Benign paroxysmal positional vertigo', fsn: 'Benign paroxysmal positional vertigo (disorder)', parents: ['Vertigo'], synonyms: ['BPPV - Benign paroxysmal positional vertigo'] },
  { id: 'n14', term: 'Peripheral neuropathy', fsn: 'Peripheral nerve disease (disorder)', parents: ['Disorder of peripheral nervous system'] },
  { id: 'n15', term: 'Chronic kidney disease stage 3', fsn: 'Chronic kidney disease stage 3 (disorder)', parents: ['Chronic kidney disease'] },
  { id: 'n16', term: 'Osteoarthritis of knee', fsn: 'Osteoarthritis of knee joint (disorder)', parents: ['Osteoarthritis'] },
  { id: 'n17', term: 'Total replacement of hip joint', fsn: 'Total replacement of hip joint (procedure)', parents: ['Hip joint replacement'], synonyms: ['Total hip replacement'] },
  { id: 'n18', term: 'Transient ischaemic attack', fsn: 'Transient cerebral ischaemia (disorder)', parents: ['Cerebrovascular disease'], synonyms: ['TIA - Transient ischaemic attack'] },
  { id: 'n19', term: 'Hypothyroidism', fsn: 'Hypothyroidism (disorder)', parents: ['Disorder of thyroid gland'] },
  { id: 'n20', term: 'Fracture of neck of femur', fsn: 'Fracture of neck of femur (disorder)', parents: ['Fracture of femur'], synonyms: ['Hip fracture'] },
];

/**
 * Async search over the concept list, standing in for a terminology server. Matches the preferred term or a
 * synonym (each word prefix, any order), honours the edition's diacritic folding (macron-insensitive in NZ,
 * NZ 11.1) and stops work when a newer request supersedes it (`signal`). Synonym hits are returned as the
 * synonym with the preferred term for the flyout (SCT-045).
 */
export const searchNoteConcepts: TerminologySearchFn = (query, options) =>
  new Promise(resolve => {
    const timer = setTimeout(() => {
      const fold = { foldDiacritics: options.foldDiacritics };
      const hits: TerminologyResult[] = [];
      for (const c of NOTE_CONCEPTS) {
        const { synonyms, ...result } = c;
        if (matchesDescription(query, c.term, undefined, fold)) hits.push(result);
        else {
          const syn = synonyms?.find(s => matchesDescription(query, s, undefined, fold));
          if (syn) hits.push({ ...result, id: `${c.id}-s`, term: syn, isSynonym: true, preferredTerm: c.term });
        }
      }
      resolve(hits);
    }, 160);
    // A superseded request resolves empty; the control ignores late responses anyway (Matching 2.3.1).
    options.signal.addEventListener('abort', () => { clearTimeout(timer); resolve([]); });
  });

/** Past medical history already entered this admission. */
export const NOTE_HISTORY: Record<ClinicalRegion, NoteEntry[]> = {
  GB: [
    { id: 'h1', text: 'osteop', concept: { id: 'n05', term: 'Osteoporosis' }, dateText: '2019', additionalText: 'On weekly alendronic acid' },
    { id: 'h2', text: 'hypert', concept: { id: 'n06', term: 'Hypertensive disorder' }, dateText: 'past 10 years' },
    { id: 'h3', text: 'catar', concept: { id: 'n09', term: 'Cataract' }, laterality: 'right', dateText: 'last year' },
  ],
  AU: [
    { id: 'h1', text: 'af', concept: { id: 'n07', term: 'Atrial fibrillation' }, dateText: 'since 2016', additionalText: 'Anticoagulated with apixaban' },
    { id: 'h2', text: 'diab 2', concept: { id: 'n08', term: 'Type 2 diabetes mellitus' }, dateText: 'past 8 years' },
    { id: 'h3', text: 'hip repl', concept: { id: 'n17', term: 'Total replacement of hip joint' }, laterality: 'left', dateText: '2021', additionalText: 'Mobilises with a stick since' },
  ],
  NZ: [
    { id: 'h1', text: 'meniere', concept: { id: 'n12', term: "Ménière's disease" }, dateText: 'since 2015' },
    { id: 'h2', text: 'osteop', concept: { id: 'n05', term: 'Osteoporosis' }, dateText: '2019' },
    { id: 'h3', text: 'catar', concept: { id: 'n09', term: 'Cataract' }, laterality: 'right', dateText: 'last year' },
  ],
};

/** Earlier lying systolic readings for the previous values panel (CNA-1440). */
export const LYING_SYSTOLIC_HISTORY: PreviousValue[] = [
  { value: 148, recordedAt: '2026-10-25T09:10' },
  { value: 142, recordedAt: '2026-10-26T08:40' },
  { value: 151, recordedAt: '2026-10-27T08:05' },
];

const bodyOutline = (dx: number) => {
  const pts = [[63, 38], [40, 48], [28, 120], [24, 150], [32, 153], [40, 122], [44, 82], [46, 140], [48, 260], [44, 272], [64, 272], [66, 170], [70, 160], [74, 170], [76, 272], [96, 272], [92, 260], [94, 140], [96, 82], [100, 122], [108, 153], [116, 150], [112, 120], [100, 48], [77, 38]];
  return 'M' + pts.map(p => `${p[0] + dx} ${p[1]}`).join(' L') + ' Z';
};
const headOutline = (dx: number) => `M${70 + dx} 6a16 16 0 1 0 0.01 0Z`;

/** Adult body line art, front and back, labelled under each view (NwG-0008). */
export const BODY_GRAPHIC: GraphicDefinition = {
  id: 'body-adult',
  title: 'Adult body, front and back',
  width: 300,
  height: 280,
  ageGroup: 'adult',
  keywords: ['whole body', 'skin', 'injury'],
  images: [
    { label: 'Front view', x: 0, y: 0, width: 140, height: 280, paths: [headOutline(0), bodyOutline(0)] },
    { label: 'Back view', x: 160, y: 0, width: 140, height: 280, paths: [headOutline(160), bodyOutline(160), 'M230 42 V150'] },
  ],
};

/**
 * Findings drawn so far. The patient's left side is on the right of the front view. Each finding is a mark with
 * its text-box (NwG-0043); the comment with no mark is a general note (NwG-0055).
 */
export const BODY_FINDINGS: GraphicFinding[] = [
  { id: 'g1', mark: { kind: 'symbol', symbolId: 'x', x: 111, y: 146 }, box: { x: 330, y: 118, width: 170 }, text: 'Swelling and deformity, left wrist. Backslab applied.' },
  { id: 'g2', mark: { kind: 'region', points: [{ x: 76, y: 150 }, { x: 90, y: 146 }, { x: 94, y: 162 }, { x: 86, y: 178 }, { x: 76, y: 170 }] }, box: { x: 330, y: 196, width: 170 }, text: 'Bruising over left hip, 6 cm. No bony tenderness.' },
  { id: 'g3', box: { x: -190, y: 16, width: 170 }, text: 'Found on the floor by a neighbour after about one hour.' },
];

/** Banner props for the region's main patient. */
export function noteBanner(region: ClinicalRegion): PatientBannerProps {
  const m = MAIN_PATIENT[region];
  const gender = region === 'GB' ? m.gender : region === 'AU' ? (m.gender === 'Male' ? '1' : '2') : m.gender === 'Male' ? 'M' : 'F';
  return {
    name: { familyName: m.familyName, givenName: m.givenName, title: m.title },
    preferredName: m.preferredName,
    dateOfBirth: m.dateOfBirth,
    gender,
    nhsNumber: m.identifiers.find(i => i.type === 'nhs')?.value,
    identifiers: m.identifiers
      .filter(i => i.type !== 'nhs')
      .map(i => ({ type: i.type, value: i.value, irn: i.irn, medicareValidTo: i.validTo ? `${i.validTo.slice(5)}/${i.validTo.slice(0, 4)}` : undefined })),
    flagTestIdentifiers: false,
    address: { unit: m.address.unit, lines: m.address.lines, suburb: region === 'NZ' ? m.address.suburb : undefined, town: region === 'AU' ? m.address.suburb : m.address.town, state: m.address.state, county: m.address.county, postcode: m.address.postcode },
    contacts: region === 'GB' ? { home: m.phone } : { mobile: m.phone },
    allergies:
      m.allergies === 'none-known'
        ? { status: 'none-known', recordedBy: 'RN J Murphy', recordedAt: '2026-10-23T10:20' }
        : { status: 'known', items: m.allergies.map(a => ({ name: a.substance, reaction: a.reaction.toLowerCase(), lastUpdated: a.recorded })) },
  };
}
