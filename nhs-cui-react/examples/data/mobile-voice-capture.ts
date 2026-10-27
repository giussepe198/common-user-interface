/**
 * Data for mobile-voice-capture: what the nurse says at the bedside, the ward round note a doctor dictates, the
 * patient's current prescriptions for the dose check, and a stand-in for the consumer's terminology matcher.
 */
import type { ClinicalRegion, DictatedNoteCodeMatch, DictatedNotePrescription, ScriptedSpeechStep } from '@clinical-cui/react';

/** He or she, for the review questions ("Is she on room air?"). From the cast: Joan and Mereana, Wei. */
export const SUBJECT: Record<ClinicalRegion, string> = { GB: 'she', AU: 'he', NZ: 'she' };

/**
 * The observations as spoken, in the steps a speech engine reports them: interim text first, then the final words.
 * Two things are left for the review to catch:
 * - oxygen is never mentioned, so the review must ask (it never assumes room air);
 * - "fifteen" for the respiratory rate can be misheard for "fifty", so both readings are offered.
 */
export function observationScript(region: ClinicalRegion): ScriptedSpeechStep[] {
  return [
    { interim: ['Resp', 'Resp rate fif'], final: 'Resp rate fifteen,' },
    { interim: ['sats ninety'], final: 'sats ninety three,' },
    { interim: ['BP one ten'], final: 'BP one ten on seventy,' },
    { final: 'heart rate one hundred and twelve,' },
    { interim: ['temp thirty eight'], final: `temp thirty eight point four, ${SUBJECT[region]}'s alert` },
  ];
}

/**
 * The ward round note as dictated. The clindamycin dose was heard as micrograms, but 450 mg is prescribed: a
 * 1,000-fold difference that must be resolved before signing. (The patient in GB and NZ is allergic to penicillin,
 * hence clindamycin for the cellulitis.)
 */
export const NOTE_TEXT =
  'Day 2 of cellulitis of left lower leg. Erythema now 2 cm beyond the marked margin, worse since yesterday. Fever 38.4. ' +
  'Plan: continue clindamycin four hundred and fifty micrograms four times a day and paracetamol 1 g four times a day, review bloods tomorrow.';

/** What "Dictate more" adds to the note: a scripted engine stands in for the consumer's speech engine. */
export const NOTE_MORE: ScriptedSpeechStep[] = [{ interim: ['Mobilising'], final: 'Mobilising with a frame, physiotherapy review today.' }];

/** Current prescriptions, so doses heard in the note can be checked for unit and order of magnitude. */
export const PRESCRIBED: DictatedNotePrescription[] = [
  { medicine: 'clindamycin', dose: { value: 450, unit: 'mg' } },
  { medicine: 'paracetamol', aliases: ['Panadol'], dose: { value: 1, unit: 'g' } },
];

/**
 * A stand-in for the consumer's terminology matcher (in an app: a SNOMED CT search, cached). It returns suggestions
 * only; nothing is coded until the clinician ticks it (B2.6).
 */
export function matchNoteCodes(text: string): DictatedNoteCodeMatch[] {
  const out: DictatedNoteCodeMatch[] = [];
  const phrase = 'cellulitis of left lower leg';
  const c = text.indexOf(phrase);
  if (c >= 0) {
    out.push({
      start: c,
      end: c + phrase.length,
      suggestion: {
        id: 'cellulitis',
        sourceText: phrase,
        label: 'Cellulitis of lower leg',
        attributes: [{ id: 'left', label: 'Left', friendlyName: 'laterality', mandatory: true }],
        freeText: ['worse since yesterday'],
      },
    });
  }
  const f = text.indexOf('Fever');
  if (f >= 0) out.push({ start: f, end: f + 5, suggestion: { id: 'fever', sourceText: 'Fever', label: 'Fever' } });
  return out;
}
