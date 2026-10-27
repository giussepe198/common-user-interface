# DictatedObservationsCapture

Dictation screen for a set of vital signs (C1): patient banner, what was heard, a read-back of every chart parameter ("Not heard yet" until it is), guidance, and Type instead, the microphone and Review. Nothing is saved here.

## When to use

- When a nurse says the observations aloud at the bedside. Follow it with DictationReview; "Type instead" goes to ObservationKeypadEntry (P2).

## What you provide

- `engine` (any SpeechEngine), or `transcript` / `interim` / `status` when you run the engine yourself.
- `banner` (patient header slot), `definition` (default: the region's chart), `region`, `parameterIds`, `parseOptions`.
- `onTypeInstead`, `onReview(result)` with `{ transcript, observations, values, highlights }`, `onHeardChange`, `autoStart`, `heading`, `intro`, `guidance`, `stickyActions`.

```tsx
<DictatedObservationsCapture engine={engine} banner={<PatientHeader ... />}
  onTypeInstead={openKeypad} onReview={r => goToReview(r.transcript, r.observations)} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: dictation never auto-commits ("Nothing is saved until you review and confirm"); every value is read back as structured data with its unit; the screen works by touch when no engine is available (a note and Type instead).
- AU-OB-01 [M]: parameters, names and units come from the chart definition (lists area), never from code.
- Parsing uses `parseSpokenObservations`: values are only taken from words heard after the parameter's name, teen and ty numbers keep both readings ("15 or 50?"), and words that are not a value show "Not understood".
- Primary actions 56 px at the bottom with safe-area padding (ActionBar) [M].
- Wording and layout from the approved concept C1 [suggested].

## Regional behaviour

- GB: NEWS2 by default; recognition language en-GB.
- AU: ADDS placeholder chart by default (oxygen as a flow in L/min, so "four litres" reads back "4 L/min"); en-AU.
- NZ: NZEWS by default (oxygen as Room air or Supplement); en-NZ.

## Do and don't

- Do always offer the review step; do not save from this screen.
- Don't hide "Type instead", even when the engine works.

## Accessibility

- Headings for the screen, the transcript and the read-back; the read-back heading includes how many parameters were heard.
- The read-back is a description list (name, value). "Not heard yet" is text, not colour alone.
- New transcript text and microphone state changes are announced politely.
