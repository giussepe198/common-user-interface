/**
 * Structured clinical note: a falls assessment after an inpatient fall (desktop).
 *
 * Composition:
 * - PatientBanner at the top: the note is always written against a visibly identified patient.
 * - The main column is the note in reading order: what happened (radio, check boxes, a data-triggered reveal),
 *   lying and standing blood pressure (with previous values), the Morse Fall Scale, past medical history
 *   (NoteEntryList), the working diagnosis (TerminologySearch), a body diagram (AnnotatedGraphicCanvas) and
 *   the free-text summary (AbbreviationCheckedTextArea).
 * - The right column stays in view: required fields still to do (MissedRequiredFieldsPanel), the calculated
 *   values, and Save. Calculated values are read-only text, never editable fields (CNA-1490/1500).
 * - Nothing clinical is pre-selected: every radio group starts empty unless the note already holds a value
 *   (Elaboration 2.3.2).
 */
import React, { useEffect, useState } from 'react';
import {
  AbbreviationCheckedTextArea,
  AnnotatedGraphicCanvas,
  Button,
  CalculatedValue,
  ClinicalCheckboxGroup,
  ClinicalRadioGroup,
  FormField,
  MissedRequiredFieldsPanel,
  NoteEntryList,
  PatientBanner,
  PreviousValuesPopover,
  RequiredKey,
  RevealSection,
  SNOMED_EDITIONS,
  TerminologySearch,
  formatTime,
  useRequiredFieldTracking,
} from '@clinical-cui/react';
import type { ClinicalChoiceOption, ClinicalRegion, GraphicFinding, NoteEntry, TerminologyResult } from '@clinical-cui/react';
import { ExampleShell, type ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW } from './data/patients';
import {
  BODY_FINDINGS, BODY_GRAPHIC, LYING_SYSTOLIC_HISTORY, NOTE_CONCEPTS, NOTE_HISTORY, noteBanner, searchNoteConcepts,
} from './data/desktop-clinical-note';

export const meta: ExampleMeta = {
  title: 'Falls assessment note',
  description:
    'A structured note after an inpatient fall: choice groups with a data-triggered reveal, blood pressure with previous values, a calculated Morse Fall Scale, coded past history and diagnosis from an asynchronous terminology search, a body diagram and abbreviation-checked free text. Save lists any required field still empty.',
  kind: 'desktop',
  regions: ['GB', 'AU', 'NZ'],
  components: [
    'PatientBanner', 'FormField', 'ClinicalRadioGroup', 'ClinicalCheckboxGroup', 'RevealSection', 'PreviousValuesPopover',
    'CalculatedValue', 'NoteEntryList', 'TerminologySearch', 'AnnotatedGraphicCanvas', 'AbbreviationCheckedTextArea',
    'RequiredKey', 'MissedRequiredFieldsPanel',
  ],
};

// Morse Fall Scale items and points. Risk bands vary between organisations; these are a common local choice.
const MORSE = {
  history: [{ value: '0', label: 'No' }, { value: '25', label: 'Yes', prompt: '25 points' }],
  aid: [
    { value: '0', label: 'None, bed rest or nurse assists' },
    { value: '15', label: 'Crutches, stick or walking frame', prompt: '15 points' },
    { value: '30', label: 'Holds on to furniture', prompt: '30 points' },
  ],
  iv: [{ value: '0', label: 'No' }, { value: '20', label: 'Yes', prompt: '20 points' }],
  gait: [
    { value: '0', label: 'Normal, bed rest or wheelchair' },
    { value: '10', label: 'Weak', prompt: '10 points' },
    { value: '20', label: 'Impaired', prompt: '20 points' },
  ],
  mental: [
    { value: '0', label: 'Knows own limits' },
    { value: '15', label: 'Overestimates or forgets limits', prompt: '15 points' },
  ],
} satisfies Record<string, ClinicalChoiceOption[]>;
const morseMeaning = (n: number) => (n >= 45 ? 'High risk of falling' : n >= 25 ? 'Moderate risk of falling' : 'Low risk of falling');

const MECHANISMS: ClinicalChoiceOption[] = [
  { value: 'trip', label: 'Tripped or slipped' },
  { value: 'balance', label: 'Lost balance' },
  { value: 'dizzy', label: 'Dizzy or light-headed' },
  { value: 'collapse', label: 'Collapsed' },
  { value: 'unknown', label: 'Not known' },
];
const INJURIES: ClinicalChoiceOption[] = [
  { value: 'none', label: 'No injury', pinFirst: true },
  { value: 'head', label: 'Head injury', reveals: true, prompt: 'Opens further details' },
  { value: 'wrist', label: 'Wrist or arm' },
  { value: 'hip', label: 'Hip or leg' },
  { value: 'skin', label: 'Skin tear' },
];

const SUMMARY_TEXT =
  'Tripped on a rug while walking to the toilet and fell onto an outstretched left hand. No head injury and no loss of consciousness. ' +
  'Plan: fracture clinic referral, physiotherapy and occupational therapy review before discharge. D/C IV fluids when drinking well. Morphine 2.5 mg SC if needed for pain.';

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-6)',
};
const h2: React.CSSProperties = { margin: '0 0 var(--space-3)', fontSize: 18, lineHeight: '24px', fontWeight: 600 };
const h3: React.CSSProperties = { margin: '0 0 var(--space-2)', fontSize: 15, lineHeight: '20px', fontWeight: 600 };

function NoteScreen({ region }: { region: ClinicalRegion }) {
  const edition = SNOMED_EDITIONS[region];

  // Fall details
  const [mechanism, setMechanism] = useState<string | null>('trip');
  const [injuries, setInjuries] = useState<string[]>(['wrist', 'hip']);
  const [headLoc, setHeadLoc] = useState<string | null>(null);
  const [headAnticoag, setHeadAnticoag] = useState<string | null>(null);
  // Lying and standing blood pressure (text, as typed)
  const [lying, setLying] = useState('146');
  const [standing, setStanding] = useState('');
  // Morse Fall Scale
  const [morse, setMorse] = useState<Record<keyof typeof MORSE, string | null>>({ history: '25', aid: '15', iv: '20', gait: '10', mental: '0' });
  // Coded entries and drawings
  const [history, setHistory] = useState<NoteEntry[]>(NOTE_HISTORY[region]);
  const [diagnosis, setDiagnosis] = useState<TerminologyResult | null>(() => {
    const c = NOTE_CONCEPTS[0];
    return { id: c.id, term: c.term, fsn: c.fsn, parents: c.parents, isCommon: c.isCommon };
  });
  const [findings, setFindings] = useState<GraphicFinding[]>(BODY_FINDINGS);
  const [summary, setSummary] = useState(SUMMARY_TEXT);
  const [summaryValid, setSummaryValid] = useState(true);
  // The opening state is the moment after the clinician pressed Save with the standing reading still empty.
  const [saveAttempted, setSaveAttempted] = useState(true);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Required fields in tab order, with their sections (CNA-1210). Missed = empty and passed over (CNA-1140);
  // after Save, tracking.markAllMissed() counts every empty required field as missed and the panel lists them.
  const required = [
    { id: 'f-mechanism', label: 'How the fall happened', section: 'What happened', empty: !mechanism },
    { id: 'f-lying', label: 'Lying systolic blood pressure', section: 'Lying and standing blood pressure', empty: lying.trim() === '' },
    { id: 'f-standing', label: 'Standing systolic blood pressure (3 minutes)', section: 'Lying and standing blood pressure', empty: standing.trim() === '' },
    { id: 'f-diagnosis', label: 'Working diagnosis', section: 'Diagnosis', empty: !diagnosis },
    { id: 'f-summary', label: 'Clinical summary and plan', section: 'Summary and plan', empty: summary.trim() === '' },
  ];
  const tracking = useRequiredFieldTracking(required);
  const { missedItems, isMissed } = tracking;
  // Opening state: Save has just been pressed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { tracking.markAllMissed(); }, []);

  // Calculated values. Missing inputs make the result partial or not calculable, never silently zero (CNA-1640/1650).
  const lyingN = Number(lying);
  const standingN = Number(standing);
  const bpReady = lying.trim() !== '' && standing.trim() !== '' && isFinite(lyingN) && isFinite(standingN);
  const secondaryDiagnosis = history.filter(e => e.concept).length >= 2 ? 15 : 0;
  const morseKeys = Object.keys(MORSE) as Array<keyof typeof MORSE>;
  const morseMissing = morseKeys.filter(k => morse[k] === null);
  const morseTotal = morseKeys.reduce((n, k) => n + Number(morse[k] ?? 0), 0) + secondaryDiagnosis;
  const morseLabels: Record<keyof typeof MORSE, string> = { history: 'History of falling', aid: 'Walking aid', iv: 'Intravenous therapy or cannula', gait: 'Gait', mental: 'Mental status' };

  const onSave = () => {
    setSaveAttempted(true);
    // markAllMissed() marks every empty required field as missed (reached or not) and returns them in tab order.
    const missed = tracking.markAllMissed();
    // The text area reports dangerous abbreviations through onValidityChange: such text must not be stored (abbracs 3.1).
    setSavedAt(missed.length === 0 && summaryValid ? EXAMPLE_NOW : null);
  };
  const blocking = missedItems.length + (summaryValid ? 0 : 1);

  const radio = (key: keyof typeof MORSE, legend: string) => (
    <ClinicalRadioGroup
      legend={legend}
      orientation="horizontal"
      options={MORSE[key]}
      value={morse[key]}
      onChange={v => setMorse(m => ({ ...m, [key]: v }))}
      id={`f-morse-${key}`}
    />
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <PatientBanner {...noteBanner(region)} now={EXAMPLE_NOW} sticky={false} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* tracking.formProps: focus moving into a later field marks earlier empty required fields as missed (CNA-1140). */}
        <form aria-labelledby="note-title" onSubmit={e => e.preventDefault()} {...tracking.formProps} style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
          <div>
            <h2 id="note-title" style={{ margin: 0, fontSize: 20, lineHeight: '26px' }}>Falls assessment</h2>
            <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--ink-muted)' }}>Post-fall review, {formatTime(EXAMPLE_NOW)} today</p>
          </div>

          <section style={card} aria-labelledby="s-what">
            <h3 id="s-what" style={h2}>What happened</h3>
            <ClinicalRadioGroup
              id="f-mechanism"
              legend="How the fall happened"
              orientation="horizontal"
              options={MECHANISMS}
              value={mechanism}
              onChange={setMechanism}
              required
              missed={isMissed('f-mechanism')}
            />
            <ClinicalCheckboxGroup
              legend="Injuries found"
              orientation="horizontal"
              options={INJURIES}
              value={injuries}
              // "No injury" excludes the others, and choosing an injury clears it.
              onChange={v => setInjuries(v.includes('none') && !injuries.includes('none') ? ['none'] : v.filter(x => x !== 'none'))}
              revealAnnouncement="Further details for head injury shown below"
            />
            {/* Data-triggered reveal (CNA-0880): opens when "Head injury" is ticked; cannot be hidden while it holds data (CNA-0970). */}
            <RevealSection
              label="Further details: head injury"
              prompt="Opens when head injury is ticked"
              trigger={injuries.includes('head')}
              values={[headLoc, headAnticoag]}
            >
              <ClinicalRadioGroup legend="Loss of consciousness" orientation="horizontal" options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }, { value: 'unknown', label: 'Not known' }]} value={headLoc} onChange={setHeadLoc} />
              <ClinicalRadioGroup legend="Taking an anticoagulant or antiplatelet" orientation="horizontal" options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} value={headAnticoag} onChange={setHeadAnticoag} />
            </RevealSection>
          </section>

          <section style={card} aria-labelledby="s-bp">
            <h3 id="s-bp" style={h2}>Lying and standing blood pressure</h3>
            {/* Previous values appear above the field on focus, oldest first, unit once in the title (CNA-1300..1470). */}
            <FormField id="f-lying" label="Lying systolic" labelPosition="left" labelWidth="14em" required missed={isMissed('f-lying')} prompt="mmHg, after 5 minutes lying" promptPlacement="right">
              <PreviousValuesPopover values={LYING_SYSTOLIC_HISTORY} unit="mmHg">
                <input type="text" inputMode="numeric" value={lying} onChange={e => setLying(e.target.value)} style={{ width: '6em' }} />
              </PreviousValuesPopover>
            </FormField>
            <FormField id="f-standing" label="Standing systolic" labelPosition="left" labelWidth="14em" required missed={isMissed('f-standing')} prompt="mmHg, after 3 minutes standing" promptPlacement="right">
              <input type="text" inputMode="numeric" value={standing} onChange={e => setStanding(e.target.value)} style={{ width: '6em' }} />
            </FormField>
          </section>

          <section style={card} aria-labelledby="s-morse">
            <h3 id="s-morse" style={h2}>Morse Fall Scale</h3>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 14, color: 'var(--ink-muted)' }}>
              Secondary diagnosis is taken from past medical history: {secondaryDiagnosis ? 'two or more coded conditions (15 points)' : 'fewer than two coded conditions (0 points)'}.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', columnGap: 'var(--space-6)' }}>
              {radio('history', morseLabels.history)}
              {radio('iv', morseLabels.iv)}
              {radio('aid', morseLabels.aid)}
              {radio('gait', morseLabels.gait)}
              {radio('mental', morseLabels.mental)}
            </div>
          </section>

          <section style={card} aria-labelledby="s-history">
            {/* Coded entries from the edition's search. Dates are typed naturally ("past 10 years") and confirmed in standard form. */}
            <NoteEntryList
              heading="Past medical history"
              entries={history}
              onEntriesChange={setHistory}
              search={searchNoteConcepts}
              instructionText="Add a condition or procedure. Fields for dates and details appear once a term is selected."
              helpText={region === 'NZ' ? 'Type part of each word, for example "osteo"; macrons and accents are optional' : 'Type part of each word, for example "osteo"'}
              referenceDate={EXAMPLE_NOW}
              birthDate={noteBanner(region).dateOfBirth ?? undefined}
              showLaterality={e => !!e.concept && ['n09', 'n16', 'n17'].includes(e.concept.id)}
              searchOptions={{ showEdition: true }}
            />
            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 12, color: 'var(--ink-muted)' }}>Terms from SNOMED CT {edition.label}</p>
          </section>

          <section style={card} aria-labelledby="s-diagnosis">
            <h3 id="s-diagnosis" style={h2}>Diagnosis</h3>
            {/* TerminologySearch sits in FormField like any input: the field label, asterisk and missed shading reach the
                search box, whose id ("f-diagnosis") is the one the tracking and the missed panel link use. */}
            <FormField id="f-diagnosis" label="Working diagnosis" required missed={isMissed('f-diagnosis')}>
              <TerminologySearch
                helpText={region === 'NZ' ? 'Type part of each word, for example "dist rad"; macrons are optional' : 'Type part of each word, for example "dist rad"'}
                search={searchNoteConcepts}
                defaultQuery="dist rad"
                selected={diagnosis}
                onSelectionChange={setDiagnosis}
                showEdition
                widthChars={40}
              />
            </FormField>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-muted)' }}>Searching SNOMED CT {edition.label}</p>
          </section>

          <section style={card} aria-labelledby="s-body">
            <h3 id="s-body" style={h2}>Injuries: body diagram</h3>
            {/* Each mark has its own text-box and arrow; the drawing is greyscale line art so marks stand out (NwG). */}
            <AnnotatedGraphicCanvas graphic={BODY_GRAPHIC} findings={findings} onFindingsChange={setFindings} sideWidth={200} />
          </section>

          <section style={card} aria-labelledby="s-summary">
            <h3 id="s-summary" style={h2}>Summary and plan</h3>
            {/* AbbreviationCheckedTextArea also sits in FormField (no label of its own): FormField's label, asterisk and
                missed state reach the text area. The region's "do not use" abbreviation list is the default; alerts show on
                leaving the field or on Save. */}
            <FormField id="f-summary" label="Clinical summary and plan" required missed={isMissed('f-summary')}>
              <AbbreviationCheckedTextArea
                value={summary}
                onChange={setSummary}
                onValidityChange={ok => setSummaryValid(ok)}
                showAlerts={saveAttempted}
                rows={5}
              />
            </FormField>
          </section>
        </form>

        <aside aria-label="Note status" style={{ position: 'sticky', top: 'var(--space-4)', display: 'grid', gap: 'var(--space-4)' }}>
          <div style={card}>
            <h3 style={h3}>Scores</h3>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <CalculatedValue
                label="Morse Fall Scale"
                value={morseMissing.length === morseKeys.length ? null : morseTotal}
                status={morseMissing.length === 0 ? 'complete' : morseMissing.length === morseKeys.length ? 'cannotCalculate' : 'partial'}
                meaning={morseMissing.length ? undefined : morseMeaning(morseTotal)}
                scoringSystem="Morse Fall Scale (bands: 0 to 24 low, 25 to 44 moderate, 45 and over high)"
                contributors={[
                  ...morseKeys.map(k => ({ label: morseLabels[k], value: morse[k] ?? undefined, unit: 'points', section: 'Morse Fall Scale', fieldId: `f-morse-${k}`, source: 'form' as const })),
                  { label: 'Secondary diagnosis', value: secondaryDiagnosis, unit: 'points', section: 'Past medical history', source: 'form' as const },
                ]}
                onNavigateToField={id => document.getElementById(id)?.scrollIntoView({ block: 'center' })}
              />
              <CalculatedValue
                label="Postural drop"
                value={bpReady ? lyingN - standingN : null}
                unit="mmHg"
                status={bpReady ? 'complete' : 'cannotCalculate'}
                cannotCalculateText="Cannot be calculated: standing reading missing"
                meaning={bpReady ? (lyingN - standingN >= 20 ? 'Postural hypotension' : 'No postural hypotension') : undefined}
                normalRange={{ high: 19 }}
                scoringSystem="Lying systolic minus standing systolic at 3 minutes; 20 mmHg or more is a postural drop"
                contributors={[
                  { label: 'Lying systolic', value: lying || undefined, unit: 'mmHg', section: 'Lying and standing blood pressure', fieldId: 'f-lying', source: 'form' },
                  { label: 'Standing systolic', value: standing || undefined, unit: 'mmHg', section: 'Lying and standing blood pressure', fieldId: 'f-standing', source: 'form' },
                ]}
                onNavigateToField={id => document.getElementById(id)?.focus()}
              />
            </div>
          </div>

          {/* Lists every missed required field with links that move focus to it (CNA-1200..1240). Never blocks typing. */}
          <MissedRequiredFieldsPanel items={missedItems} intro="Complete these before saving the note." sticky={false} />

          <div style={{ ...card, display: 'grid', gap: 'var(--space-3)' }}>
            <RequiredKey />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="primary" onClick={onSave}>Save note</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
            <p role="status" style={{ margin: 0, fontSize: 14, color: savedAt ? 'var(--success)' : 'var(--ink-muted)' }}>
              {savedAt
                ? `Saved at ${formatTime(savedAt)}`
                : saveAttempted && blocking
                  ? `Not saved: ${missedItems.length ? `${missedItems.length} required field${missedItems.length === 1 ? '' : 's'} empty` : ''}${missedItems.length && !summaryValid ? ' and ' : ''}${summaryValid ? '' : 'abbreviations to correct in the summary'}`
                  : 'Not saved yet'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function DesktopClinicalNote() {
  return <ExampleShell meta={meta}>{region => <NoteScreen region={region} />}</ExampleShell>;
}
