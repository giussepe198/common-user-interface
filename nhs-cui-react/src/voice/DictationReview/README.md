# DictationReview

Review of dictated observations before saving (C2): each value with its unit, score and zone word, an edit button per row, a specific question for anything missing, ambiguous, implausible or critical, the total as "N+" until complete, the chart's mandatory text, and Save blocked with the reason until everything is resolved.

## When to use

- After DictatedObservationsCapture, and whenever observations came from speech.

## What you provide

- `heard` (from `parseSpokenObservations`) or `transcript` (parsed with the chart), `defaultValues`, `definition`, `region`, `parameterIds`, `requiredParameterIds` (default every scored parameter).
- `criticalThresholds` (`appliesTo` = parameter id, or `diastolic`), `previous` (for the keypad), `subject` ("she" in "Is she on room air?"), `banner`, `takenAt`, `heading`.
- `onSave(result)` with `{ values, diastolic, flowRate, score, confirmedCritical, keptImplausible, changedParameterIds }`, `onSpeakAgain`, `onBlockersChange`.
- `portal`, `container`, `closeOnBrowserBack`: where the edit keypad sheet renders (default from `SheetContainerProvider`, otherwise `document.body`).

```tsx
<DictationReview heard={r.observations} subject="she" takenAt={now} criticalThresholds={limits}
  onSpeakAgain={back} onSave={res => record(res.values, res.score)} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: missing and ambiguous values block saving with a specific question ("Oxygen was not heard. Is she on room air?", "Was respiratory rate 15 or 50?" with both as buttons); implausible values need "Change it" or "Keep"; Save is disabled and `aria-describedby` points at the reason and the first question.
- GTAB-177 [M]: a value at or beyond a consumer critical limit needs "Re-measure" or "Confirm"; the keypad does the same while editing.
- AU-OB-01 [M]: scores, zones, response wording and mandatory text come from the chart definition, scored with the lists area (`scoreEarlyWarning`, `ewsScoreParameter`).
- The total shows "N+" (screen readers hear "or more") and "so far" until every question is answered and the set is complete; never a partial total presented as final.
- Colour is never the only cue [M]: score chips say "2 Orange" (read as "Score 2, Orange zone"); needed rows say "Needed".
- Edit opens ObservationKeypadEntry for that parameter in a FullScreenSheet. Editing the systolic pressure drops the dictated diastolic, and changing oxygen drops the dictated flow, so no heard value is kept beside an edited one [suggested].
- Placeholder charts (AU ADDS) show the placeholder warning.

## Regional behaviour

- GB: NEWS2; zones are named by score, so chips show the score alone; "Is the patient on air?".
- AU: ADDS placeholder by default with on-screen warning (G10 12.3); oxygen flow is numeric; set your local chart with `configureEwsChart`.
- NZ: NZEWS; shows the HQSC mandatory text "ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT..." and the escalation line (G11 12.3); "Is she on room air?".

## Do and don't

- Do pass the patient's critical limits; the review does not invent them.
- Do store `diastolic` and `flowRate` with the record.
- Don't save on behalf of the user when the questions are answered: Save is always a separate tap.

## Accessibility

- Each question is a labelled section with a heading; after an answer focus moves to the next question, or to Save when none remain.
- Edit buttons are 48 px and named "Edit heart rate"; answers are 48 px buttons with unit in the label ("50 breaths/min").
- The reason line above the actions is announced politely when it changes.
