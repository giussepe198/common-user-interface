import React from 'react';
import { cx, formatTime, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike } from '../../core';
import { findDangerousAbbreviations, type AbbreviationFinding } from '../../datetime';
import { formatQuantity, type MedicationQuantity } from '../../medications';
import { SuggestedMatchList, type SuggestedMatch } from '../../noting';
import { ActionBar, TouchButton } from '../../touch';
import { MicButton } from '../MicButton/MicButton';
import type { SpeechEngine } from '../SpeechEngine/SpeechEngine';
import { useSpeechDictation } from '../SpeechEngine/useSpeechDictation';
import { checkDosePlausibility, parseDoseMentions, type DoseMention, type DosePlausibility } from '../utils/doseMentions';
import { voiceReviewBlockers, type VoiceDoseCheck, type VoiceReviewBlocker } from '../utils/reviewBlockers';

/** A suggested code for a stretch of the note, from the consumer's matcher. */
export interface DictatedNoteCodeMatch {
  /** Offsets of the matched words in the note text. */
  start: number;
  end: number;
  /** The suggestion, as SuggestedMatchList shows it (label, attributes, free text, warnings). */
  suggestion: SuggestedMatch;
}

/** Consumer-supplied matcher: suggested codes for the note text (e.g. from a terminology server, cached). */
export type DictatedNoteMatcher = (text: string, options: { region: ClinicalRegion }) => DictatedNoteCodeMatch[];

/** A current prescription to check spoken doses against. */
export interface DictatedNotePrescription {
  /** Medicine name as said in notes, e.g. "flucloxacillin". */
  medicine: string;
  /** Other names that refer to it (brand, short name). */
  aliases?: string[];
  /** Prescribed dose, e.g. { value: 500, unit: 'mg' }. */
  dose: MedicationQuantity;
}

/** A dose choice made during review. */
export interface DictatedNoteDoseDecision {
  medicine: string;
  heard: string;
  prescribed: string;
  decision: 'prescribed' | 'heard';
  status: DosePlausibility['status'];
}

/** State handed to `onSaveDraft` and `onSign`. */
export interface DictatedNoteResult {
  text: string;
  /** Suggestions with their confirmation state; only confirmed ones are codes (B2.6). */
  codes: SuggestedMatch[];
  doseDecisions: DictatedNoteDoseDecision[];
  /** What still blocks signing (empty when signing). */
  blockers: VoiceReviewBlocker[];
}

export interface DictatedNoteReviewProps {
  /** Note text (controlled). Shown exactly as dictated; macrons are kept. */
  text?: string;
  defaultText?: string;
  onTextChange?: (text: string) => void;
  /** Patient header slot. */
  banner?: React.ReactNode;
  /** Heading. Default "Note". */
  heading?: React.ReactNode;
  /** Draft time, shown as "Draft, 14:10". */
  draftAt?: DateLike;
  /** Region; otherwise read from ClinicalLocaleProvider. Chooses the abbreviation list, dose wording and preferred terms. */
  region?: ClinicalRegion;
  /** Suggested codes for the text (synchronous). Use `codeMatches` instead when your search is asynchronous. */
  matchCodes?: DictatedNoteMatcher;
  /** Suggested codes already found for the current text. Wins over `matchCodes`. */
  codeMatches?: DictatedNoteCodeMatch[];
  /** Tick or untick a code (nothing is coded without confirmation, B2.6). */
  onCodesChange?: (codes: SuggestedMatch[]) => void;
  /** Open the alternatives for a suggestion (passed to SuggestedMatchList). */
  onOpenAlternatives?: (suggestionId: string, attributeId?: string) => void;
  /** Current prescriptions: doses heard for these medicines are checked for unit and magnitude. */
  prescribed?: DictatedNotePrescription[];
  /** Check dangerous abbreviations for the region. Default true. */
  checkAbbreviations?: boolean;
  /** Speech engine for "Dictate more"; final results are added to the end of the note. */
  engine?: SpeechEngine | null;
  /** "Dictate more" when you run dictation yourself (used when no `engine`). */
  onDictateMore?: () => void;
  /** Always allowed: saves a draft with the blockers recorded. */
  onSaveDraft?: (result: DictatedNoteResult) => void;
  /** Only called when nothing blocks. */
  onSign?: (result: DictatedNoteResult) => void;
  /** Label of the sign button. Default "Sign note". */
  signLabel?: string;
  /** Keep the action bar stuck to the bottom. Default true. */
  stickyActions?: boolean;
  className?: string;
  id?: string;
}

interface Mark {
  start: number;
  end: number;
  kind: 'confirmed' | 'encodable' | 'check';
  label: string;
  priority: number;
}

const doseId = (m: DoseMention, n: number) => `${m.medicine ?? ''}|${m.text.toLowerCase()}|${n}`;

function WarningIcon() {
  return (
    <svg className="cui-dictated-note__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4.5l8.5 15h-17zM12 10v4.5M12 17v.4" />
    </svg>
  );
}

/**
 * Dictated note review (C3): the note with encodable words highlighted and confirmed terms marked, suggested codes
 * to tick (SuggestedMatchList, consumer matcher), a dose check against the prescription that needs "Use
 * prescribed" or "Keep as heard" for a unit or order-of-magnitude mismatch, the region's dangerous abbreviation
 * check, Save draft at any time and Sign only when nothing blocks.
 */
export function DictatedNoteReview(props: DictatedNoteReviewProps) {
  const {
    banner,
    heading = 'Note',
    draftAt,
    matchCodes,
    onCodesChange,
    onOpenAlternatives,
    prescribed = [],
    checkAbbreviations = true,
    engine,
    onDictateMore,
    onSaveDraft,
    onSign,
    signLabel = 'Sign note',
    stickyActions = true,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const id = useId('cui-dictated-note', props.id);
  const [text, setText] = useControllableState<string>(props.text, props.defaultText ?? '', props.onTextChange);
  const [editingText, setEditingText] = React.useState(false);
  const [confirm, setConfirm] = React.useState<Record<string, { confirmed: boolean; attributes: Record<string, boolean> }>>({});
  const [decisions, setDecisions] = React.useState<Record<string, 'prescribed' | 'heard'>>({});
  const [log, setLog] = React.useState<DictatedNoteDoseDecision[]>([]);
  const textRef = React.useRef(text);
  textRef.current = text;
  const signRef = React.useRef<HTMLButtonElement>(null);
  const firstCheckRef = React.useRef<HTMLElement>(null);
  const focusAfter = React.useRef(false);

  const dictation = useSpeechDictation(engine, {
    region,
    onFinalResult: added => {
      const cur = textRef.current;
      setText(cur ? `${cur.replace(/\s+$/, '')} ${added}` : added);
    },
  });

  // Codes
  const matches = React.useMemo(() => props.codeMatches ?? matchCodes?.(text, { region }) ?? [], [props.codeMatches, matchCodes, text, region]);
  const suggestions: SuggestedMatch[] = matches.map(m => {
    const c = confirm[m.suggestion.id];
    return {
      ...m.suggestion,
      sourceText: m.suggestion.sourceText ?? text.slice(m.start, m.end),
      confirmed: c ? c.confirmed : m.suggestion.confirmed,
      attributes: m.suggestion.attributes?.map(a => ({ ...a, confirmed: c?.attributes[a.id] ?? a.confirmed })),
    };
  });
  const codesRef = React.useRef(onCodesChange);
  codesRef.current = onCodesChange;
  const setCodeConfirm = (sid: string, on: boolean, attributeId?: string) => {
    const s = suggestions.find(x => x.id === sid);
    if (!s) return;
    const prev = confirm[sid] ?? { confirmed: !!s.confirmed, attributes: Object.fromEntries((s.attributes ?? []).map(a => [a.id, !!a.confirmed])) };
    const next = attributeId
      ? { ...prev, attributes: { ...prev.attributes, [attributeId]: on } }
      : {
          confirmed: on,
          // Ticking the base ticks its mandatory qualifiers; unticking it unticks every attribute (Post-coordination 2.1.4).
          attributes: Object.fromEntries((s.attributes ?? []).map(a => [a.id, on ? prev.attributes[a.id] || !!a.mandatory : false])),
        };
    const all = { ...confirm, [sid]: next };
    setConfirm(all);
    codesRef.current?.(
      suggestions.map(x => (x.id === sid ? { ...x, confirmed: next.confirmed, attributes: x.attributes?.map(a => ({ ...a, confirmed: next.attributes[a.id] })) } : x)),
    );
  };

  // Doses
  const medicineNames = prescribed.flatMap(p => [p.medicine, ...(p.aliases ?? [])]);
  const prescriptionFor = (name?: string) =>
    name ? prescribed.find(p => [p.medicine, ...(p.aliases ?? [])].some(n => n.toLowerCase() === name.toLowerCase())) : undefined;
  const mentions = React.useMemo(() => parseDoseMentions(text, { medicines: medicineNames }), [text, medicineNames.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const doseChecks: Array<VoiceDoseCheck & { prescription: DictatedNotePrescription }> = [];
  const seen: Record<string, number> = {};
  for (const m of mentions) {
    const p = prescriptionFor(m.medicine);
    if (!p) continue;
    const key = `${m.medicine}|${m.text.toLowerCase()}`;
    seen[key] = (seen[key] ?? 0) + 1;
    const did = doseId(m, seen[key]);
    doseChecks.push({ id: did, mention: m, check: checkDosePlausibility(m, p.dose, region), decision: decisions[did], prescription: p });
  }

  // Abbreviations
  const abbreviations = React.useMemo(
    () => (checkAbbreviations ? findDangerousAbbreviations(text, region).filter(f => f.severity === 'dangerous') : []),
    [text, region, checkAbbreviations],
  );

  const blockers = voiceReviewBlockers({ note: { doseChecks, abbreviations } });
  const ready = blockers.length === 0;
  React.useEffect(() => {
    if (!focusAfter.current) return;
    focusAfter.current = false;
    (firstCheckRef.current ?? signRef.current)?.focus();
  });

  const replace = (start: number, end: number, value: string) => {
    setText(text.slice(0, start) + value + text.slice(end));
    focusAfter.current = true;
  };
  const decideDose = (d: (typeof doseChecks)[number], decision: 'prescribed' | 'heard') => {
    const entry: DictatedNoteDoseDecision = {
      medicine: d.prescription.medicine, heard: d.mention.text, prescribed: d.check.prescribedText, decision, status: d.check.status,
    };
    setLog(l => [...l, entry]);
    if (decision === 'prescribed') replace(d.mention.start, d.mention.end, formatQuantity(d.prescription.dose, region));
    else {
      setDecisions(x => ({ ...x, [d.id]: 'heard' }));
      focusAfter.current = true;
    }
  };
  const fixAbbreviation = (f: AbbreviationFinding, s: string) => replace(f.start, f.end, f.resolution === 'expand' ? `${f.text} (${s})` : s);

  // Text marks: checks first, then confirmed and encodable codes.
  const marks: Mark[] = [];
  doseChecks.forEach(d => {
    if (d.check.needsChoice && !d.decision) marks.push({ start: d.mention.start, end: d.mention.end, kind: 'check', label: 'check this dose', priority: 3 });
  });
  abbreviations.forEach(f => marks.push({ start: f.start, end: f.end, kind: 'check', label: 'abbreviation to replace', priority: 3 }));
  matches.forEach(m => {
    const s = suggestions.find(x => x.id === m.suggestion.id);
    marks.push({ start: m.start, end: m.end, kind: s?.confirmed ? 'confirmed' : 'encodable', label: s?.confirmed ? 'confirmed code' : 'suggested code', priority: s?.confirmed ? 2 : 1 });
  });
  const accepted: Mark[] = [];
  marks
    .filter(m => m.start >= 0 && m.end <= text.length && m.end > m.start)
    .sort((a, b) => b.priority - a.priority || a.start - b.start)
    .forEach(m => {
      if (!accepted.some(a => m.start < a.end && m.end > a.start)) accepted.push(m);
    });
  accepted.sort((a, b) => a.start - b.start);
  const textNodes: React.ReactNode[] = [];
  let at = 0;
  accepted.forEach((m, i) => {
    if (m.start > at) textNodes.push(text.slice(at, m.start));
    textNodes.push(
      <span key={i} className={`cui-dictated-note__${m.kind}`}>
        {text.slice(m.start, m.end)}
        <span className="cui-visually-hidden">{` (${m.label})`}</span>
      </span>,
    );
    at = m.end;
  });
  if (at < text.length) textNodes.push(text.slice(at));

  const differs = doseChecks.filter(d => d.check.status === 'differs');
  const result = (): DictatedNoteResult => ({ text, codes: suggestions, doseDecisions: log, blockers });
  const reasonId = `${id}-reason`;
  const micStatus = engine ? dictation.status : onDictateMore ? 'idle' : 'unavailable';

  return (
    <div className={cx('cui-dictated-note', className)} id={id}>
      {banner}
      <div className="cui-dictated-note__main">
        <div className="cui-dictated-note__head">
          <h1 className="cui-dictated-note__heading">{heading}</h1>
          {draftAt !== undefined ? <span className="cui-dictated-note__draft">{`Draft, ${formatTime(draftAt)}`}</span> : null}
        </div>

        {editingText ? (
          <div className="cui-dictated-note__edit">
            <label htmlFor={`${id}-ta`} className="cui-dictated-note__label">Note text</label>
            <textarea id={`${id}-ta`} className="cui-dictated-note__textarea" value={text} rows={7} onChange={e => setText(e.target.value)} />
            <TouchButton size={48} onClick={() => setEditingText(false)}>Done</TouchButton>
          </div>
        ) : (
          <section className="cui-dictated-note__text" aria-labelledby={`${id}-tl`}>
            <h2 id={`${id}-tl`} className="cui-visually-hidden">Note text</h2>
            <p className="cui-dictated-note__para">{text ? textNodes : <span className="cui-dictated-note__empty">Nothing dictated yet.</span>}</p>
            <TouchButton size={48} variant="quiet" className="cui-dictated-note__edit-btn" onClick={() => setEditingText(true)}>
              Edit text
            </TouchButton>
          </section>
        )}

        {blockers.map((b, i) => {
          const hid = `${id}-chk-${i}`;
          if (b.kind === 'dose') {
            const d = doseChecks.find(x => `dose:${x.id}` === b.id);
            if (!d) return null;
            return (
              <section key={b.id} ref={i === 0 ? firstCheckRef : undefined} tabIndex={-1} className="cui-dictated-note__question" aria-labelledby={hid}>
                <h2 id={hid} className="cui-dictated-note__check-title"><WarningIcon />Check this dose</h2>
                <p className="cui-dictated-note__check-text">{b.message}</p>
                <div className="cui-dictated-note__answers">
                  <TouchButton size={48} onClick={() => decideDose(d, 'prescribed')}>{`Use ${formatQuantity(d.prescription.dose, region)}`}</TouchButton>
                  <TouchButton size={48} onClick={() => decideDose(d, 'heard')}>Keep as heard</TouchButton>
                </div>
              </section>
            );
          }
          if (b.kind === 'abbreviation') {
            const f = b.finding;
            return (
              <section key={b.id} ref={i === 0 ? firstCheckRef : undefined} tabIndex={-1} className="cui-dictated-note__question" aria-labelledby={hid}>
                <h2 id={hid} className="cui-dictated-note__check-title"><WarningIcon />{`Replace "${f.text}"`}</h2>
                <p className="cui-dictated-note__check-text">{f.reason}</p>
                <div className="cui-dictated-note__answers">
                  {f.suggestions.length ? (
                    f.suggestions.map(s => (
                      <TouchButton key={s} size={48} onClick={() => fixAbbreviation(f, s)}>{f.resolution === 'expand' ? `${f.text} (${s})` : s}</TouchButton>
                    ))
                  ) : (
                    <TouchButton size={48} onClick={() => setEditingText(true)}>Edit text</TouchButton>
                  )}
                </div>
              </section>
            );
          }
          return null;
        })}

        {differs.length ? (
          <ul className="cui-dictated-note__notes" aria-label="Dose notes">
            {differs.map(d => (
              <li key={d.id}>{`${d.prescription.medicine}: ${d.check.message}`}</li>
            ))}
          </ul>
        ) : null}

        {matches.length ? (
          <SuggestedMatchList
            className="cui-dictated-note__codes"
            suggestions={suggestions}
            region={region}
            label="Suggested codes (tap to confirm)"
            onConfirmChange={(sid, on) => setCodeConfirm(sid, on)}
            onAttributeConfirmChange={(sid, aid, on) => setCodeConfirm(sid, on, aid)}
            onOpenAlternatives={onOpenAlternatives}
          />
        ) : null}
      </div>

      <ActionBar
        sticky={stickyActions}
        label="Note actions"
        summary={<span id={reasonId}>{ready ? 'Ready to sign' : `Resolve ${blockers.length === 1 ? 'the check' : `${blockers.length} checks`} above to sign`}</span>}
      >
        <div className="cui-dictated-note__bar">
          {engine || onDictateMore ? (
          <MicButton
            size={56}
            status={micStatus}
            startLabel="Dictate more"
            onPress={engine ? dictation.toggle : onDictateMore}
            errorMessage={dictation.error?.message}
            unavailableMessage="Dictation is not available. Use Edit text."
          />
          ) : null}
          <TouchButton className="cui-dictated-note__draft-btn" onClick={() => onSaveDraft?.(result())}>
            Save draft
          </TouchButton>
          <TouchButton
            ref={signRef}
            variant="primary"
            className="cui-dictated-note__sign"
            disabled={!ready}
            aria-describedby={ready ? undefined : `${reasonId} ${id}-chk-0`}
            onClick={() => {
              if (ready) onSign?.(result());
            }}
          >
            {signLabel}
          </TouchButton>
        </div>
      </ActionBar>
    </div>
  );
}
