# DictatedNoteReview

Review of a dictated clinical note before signing (C3): the note with encodable words highlighted and confirmed terms marked, suggested codes to tick, a dose check against the prescription, the region's dangerous abbreviation check, Save draft at any time and Sign only when nothing blocks.

## When to use

- Ward round or progress notes dictated on a phone.

## What you provide

- `text` / `defaultText` / `onTextChange`, `banner`, `heading`, `draftAt`, `region`.
- Codes: `matchCodes(text, { region })` (consumer-supplied matcher returning `{ start, end, suggestion }`) or precomputed `codeMatches`; `onCodesChange`, `onOpenAlternatives`. Suggestions use the noting area's `SuggestedMatch`.
- Doses: `prescribed` (`{ medicine, aliases?, dose: { value, unit } }`).
- `checkAbbreviations` (default true), `engine` or `onDictateMore`, `onSaveDraft`, `onSign`, `signLabel`.

```tsx
<DictatedNoteReview defaultText={transcript} matchCodes={myMatcher}
  prescribed={[{ medicine: 'flucloxacillin', dose: { value: 500, unit: 'mg' } }]}
  onSaveDraft={saveDraft} onSign={sign} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: implausible values need an explicit choice. A dose heard for a prescribed medicine is compared by `checkDosePlausibility`: a unit mismatch (500 micrograms heard, 500 mg prescribed) or a ten-fold difference shows "Check this dose" with "Use 500 mg" (replaces the words) or "Keep as heard"; the choice is returned in `doseDecisions`. Smaller differences are listed without blocking [suggested].
- Abbreviation checking (abbracs 3.1 [M]): dangerous abbreviations block signing until replaced with one of the suggested forms; lists by region from the datetime area (`findDangerousAbbreviations`).
- B2.6 and Matching 2.3.3 [M]: nothing is coded without confirmation (SuggestedMatchList, label "Suggested codes (tap to confirm)"); confirmed terms are bold on the grey confirmed colour, suggested ones on the pale blue encodable colour. Ticking a base concept ticks its mandatory qualifiers; unticking clears all its attributes (Post-coordination 2.1.4).
- Save draft is always allowed; Sign is disabled with `aria-describedby` pointing at the reason and the first check.
- "Edit text" gives a 17 px text area so the note can be corrected by touch [suggested].

## Regional behaviour

- GB: NHS dangerous abbreviation list; doses written as prescribed ("0.125 mg").
- AU: ACSQHC 2024 list (for example "QDS", "mcg", "U" must be written in full, G10 6.2); doses formatted with whole numbers and "microgram" (on-screen 6.3).
- NZ: HQSC "do not use" list (G11 8.3); "microgram" in full; SNOMED CT NZ preferred terms when suggestions carry descriptions.

## Do and don't

- Do supply the patient's current prescriptions, or doses cannot be checked.
- Do keep matching fast or pass `codeMatches` from your asynchronous search.
- Don't sign automatically after the checks are resolved.

## Accessibility

- Marks in the text carry hidden labels ("suggested code", "confirmed code", "check this dose").
- Each check is a labelled section with a heading; after a choice focus moves to the next check or to Sign.
- Answer buttons are 48 px; the bottom actions are 56 px with safe-area padding.
