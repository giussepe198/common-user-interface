/**
 * Mobile: dictation (concepts C1, C2 and C3).
 *
 * Voice is a mode inside the nursing and medical screens, never a shortcut past the checks. Three screens side by
 * side:
 *   1. observations by voice: a scripted speech engine plays on load, the transcript and the read-back fill in;
 *   2. the review: what was heard becomes structured values; oxygen was not heard and "fifteen" could be "fifty", so
 *      Save is blocked with a specific question for each;
 *   3. a dictated ward round note: a dose heard in micrograms against a prescription in mg, and suggested codes to
 *      tick; Sign is blocked until the dose is resolved, Save draft is always allowed.
 * Dictation never auto-commits: every screen ends in a separate tap by the clinician.
 */
import React from 'react';
import {
  DictatedNoteReview,
  DictatedObservationsCapture,
  DictationReview,
  MobilePatientHeader,
  ScriptedSpeechEngine,
  SheetContainerProvider,
  formatTime,
} from '@clinical-cui/react';
import type {
  ClinicalRegion,
  DictatedNoteResult,
  DictationReviewSaveResult,
  MobilePatientIdentity,
  SpokenObservationsResult,
} from '@clinical-cui/react';
import { ExampleShell, PhoneFrame, type ExampleMeta } from './shell/ExampleShell';
import { EXAMPLE_NOW, MAIN_PATIENT } from './data/patients';
import { mobileIdentity } from './data/mobile-patient-review';
import { NOTE_MORE, NOTE_TEXT, PRESCRIBED, SUBJECT, matchNoteCodes, observationScript } from './data/mobile-voice-capture';

export const meta: ExampleMeta = {
  title: 'Dictation on a phone',
  description:
    'Observations by voice with a live transcript and read-back, a review that blocks saving until the oxygen question and an ambiguous number are answered, and a dictated note whose micrograms-for-mg dose must be resolved before signing. Dictation never saves or signs by itself.',
  kind: 'mobile',
  regions: ['AU', 'NZ', 'GB'],
  components: [
    'DictatedObservationsCapture',
    'LiveTranscript',
    'MicButton',
    'DictationReview',
    'ObservationKeypadEntry',
    'DictatedNoteReview',
    'SuggestedMatchList',
    'ScriptedSpeechEngine',
    'MobilePatientHeader',
  ],
};

const NOW = EXAMPLE_NOW;

/**
 * The phone screen inside a PhoneFrame: a scroller filling the phone, so each screen's sticky action bar sits at the
 * bottom of the phone (thumb zone) and short screens still reach the bottom. SheetContainerProvider sends the sheets
 * these screens open (such as keypad entry for one value in the review) into this phone's own layer: PhoneFrame has
 * a transform, so the sheet covers this phone only and the docs page keeps scrolling.
 */
function Screen({ children, note }: { children: React.ReactNode; note?: string }) {
  // State setters are stable, so they work as callback refs.
  const [layer, setLayer] = React.useState<HTMLDivElement | null>(null);
  return (
    <SheetContainerProvider container={layer}>
      <div
        style={{
          height: '100%',
          overflow: 'auto',
          display: 'grid',
          gridTemplateRows: 'minmax(100%, auto)',
          gridTemplateColumns: 'minmax(0, 1fr)',
          background: 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {note ? (
            <p
              role="status"
              style={{
                margin: 0,
                padding: '8px 16px',
                fontSize: 14,
                lineHeight: '20px',
                color: 'var(--ink-muted)',
                background: 'var(--surface-muted)',
              }}
            >
              {note}
            </p>
          ) : null}
          <div style={{ flex: '1 1 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }}>{children}</div>
        </div>
      </div>
      <div ref={setLayer} />
    </SheetContainerProvider>
  );
}

/** Shown in place of a screen once the clinician has committed it. */
function Done({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div role="status" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'start' }}>
      <h2 style={{ margin: 0, fontSize: 18, lineHeight: '24px', color: 'var(--success)' }}>{title}</h2>
      {lines.map(l => (
        <p key={l} style={{ margin: 0, fontSize: 16, lineHeight: '22px' }}>
          {l}
        </p>
      ))}
    </div>
  );
}

function VoiceCapture({ region }: { region: ClinicalRegion }) {
  const patient: MobilePatientIdentity = mobileIdentity(MAIN_PATIENT[region], region);

  // The speech engine is the consumer's (Phase 4 rule): here a scripted one that plays every step as soon as
  // listening starts, so the transcript is filled on load. Created once per take; "Speak again" makes a new take.
  const [take, setTake] = React.useState(0);
  const engine = React.useMemo(() => new ScriptedSpeechEngine(observationScript(region), { playOnStart: true }), [region, take]);
  const noteEngine = React.useMemo(() => new ScriptedSpeechEngine(NOTE_MORE, { delayMs: 400 }), []);

  // Shared state: what was heard in frame 1 feeds the review in frame 2.
  const [heard, setHeard] = React.useState<(SpokenObservationsResult & { transcript: string }) | null>(null);
  const [saved, setSaved] = React.useState<DictationReviewSaveResult | null>(null);
  const [signed, setSigned] = React.useState<DictatedNoteResult | null>(null);
  const [typeNote, setTypeNote] = React.useState('');
  const [draftNote, setDraftNote] = React.useState('');

  // Every patient-context screen shows the patient header (condensed on these task screens) and keeps it visible.
  const banner = <MobilePatientHeader patient={patient} variant="condensed" now={NOW} showDetailsButton={false} sticky />;

  return (
    <>
      <PhoneFrame caption="1. Observations by voice">
        <Screen note={typeNote}>
          <DictatedObservationsCapture
            key={take}
            engine={engine}
            autoStart
            banner={banner}
            // Values are parsed against the region's chart (NEWS2, ADDS placeholder or NZEWS): names, units and
            // oxygen wording come from the chart definition, never from code (AU-OB-01).
            onHeardChange={setHeard}
            onReview={r => setHeard(r)}
            onTypeInstead={() => setTypeNote('Type instead opens keypad entry (ObservationKeypadEntry), parameter by parameter.')}
          />
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="2. Check before saving">
        <Screen>
          {saved ? (
            <Done
              title="Observations saved"
              lines={[
                `Score ${saved.score.total} at ${formatTime(NOW)}.`,
                saved.changedParameterIds.length
                  ? `Answered or edited in review: ${saved.changedParameterIds.join(', ')}.`
                  : 'All values as heard.',
              ]}
            />
          ) : (
            // Keyed by the transcript, so a new take starts a fresh review. Each missing, ambiguous or implausible
            // value is a question with its own buttons; the total shows "N+" until every answer is in, and Save stays
            // disabled with the reason beside it. Edit opens the keypad for that one parameter.
            <DictationReview
              key={heard?.transcript ?? 'empty'}
              heard={heard?.observations}
              subject={SUBJECT[region]}
              takenAt={NOW}
              now={NOW}
              banner={banner}
              onSpeakAgain={() => {
                setHeard(null);
                setTake(t => t + 1);
              }}
              onSave={setSaved}
            />
          )}
        </Screen>
      </PhoneFrame>

      <PhoneFrame caption="3. Dictated note">
        <Screen note={draftNote}>
          {signed ? (
            <Done
              title="Note signed"
              lines={[
                `Signed at ${formatTime(NOW)}.`,
                `Confirmed codes: ${
                  signed.codes
                    .filter(c => c.confirmed)
                    .map(c => c.label)
                    .join(', ') || 'none'
                }.`,
                `Dose choices: ${
                  signed.doseDecisions
                    .map(d => `${d.medicine} ${d.decision === 'prescribed' ? d.prescribed : `"${d.heard}" kept as heard`}`)
                    .join(', ') || 'none'
                }.`,
              ]}
            />
          ) : (
            // The dose check compares each dose heard for a prescribed medicine: a unit or ten-fold mismatch needs
            // "Use 450 mg" or "Keep as heard". Codes are suggestions until ticked (B2.6). Abbreviations are checked
            // against the region's list. Save draft is always allowed; Sign only when nothing blocks.
            <DictatedNoteReview
              defaultText={NOTE_TEXT}
              heading="Ward round note"
              draftAt={NOW}
              banner={banner}
              matchCodes={matchNoteCodes}
              prescribed={PRESCRIBED}
              engine={noteEngine}
              onSaveDraft={r => setDraftNote(`Draft saved at ${formatTime(NOW)} with ${r.blockers.length} check(s) still open.`)}
              onSign={setSigned}
            />
          )}
        </Screen>
      </PhoneFrame>
    </>
  );
}

export default function Example() {
  return <ExampleShell meta={meta}>{region => <VoiceCapture region={region} />}</ExampleShell>;
}
