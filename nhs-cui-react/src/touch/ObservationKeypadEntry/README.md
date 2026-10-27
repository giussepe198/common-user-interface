# ObservationKeypadEntry

Observation entry with a large keypad (P2): one parameter at a time from any early warning chart, with the live score and zone in words, a band strip, a critical limit check, and previous and next parameter buttons.

## When to use

- Recording a set of vital signs on a phone. Combine with the patient header and EarlyWarningScoreSummary for the review step.

## What you provide

- `definition`: any chart from the lists area (EWS_NEWS2, EWS_NZEWS, EWS_ADDS_PLACEHOLDER, EWS_NSW_BTF, or `configureEwsChart(...)`). Default: the region's chart.
- `parameterIds` (order and subset), `parameterId` / `defaultParameterId` / `onParameterChange`.
- `values` / `defaultValues` / `onValuesChange`: entered values by parameter id (number text or option value).
- `previous`: last values `{ value, time }` by parameter id.
- `criticalThresholds` (with `appliesTo` = parameter id), `onCriticalConfirm`, `onRemeasure`.
- `onFinish(values, { confirmedCritical })`, `finishLabel` (default "Review"), `showNavigation`, `stickyNavigation`, `chartLabel`, `now`.

```tsx
<ObservationKeypadEntry definition={EWS_NZEWS} chartLabel="NZEWS" previous={last} criticalThresholds={limits}
  onFinish={(values, info) => review(touchObservationSet(EWS_NZEWS, values), info)} />
```

Utilities: `touchEwsBandStrip`, `touchObservationSet`, `touchScoreEntry`.

## Guidance implemented

- AU-OB-01 [M]: bands, scores, zones and wording come from the chart definition, never code; scoring uses the lists area's `ewsScoreParameter`.
- Colour never the only cue [M]: the score chip says "Score 3 · Red zone"; the band strip shows band text and score in each cell, outlines the current band and points to it; the strip has a text alternative.
- Unscored zone bands (NZEWS blue, G11 12.2) show the zone short label (e.g. "RRT"). Conditional bands (NEWS2 SpO2 scale 2) wait for the oxygen value and say so.
- GTAB-177 [M]: a value at or beyond a critical limit shows an alert with "Re-measure" (clears the value) or "Confirm 84 %"; Next stays on the parameter and moves focus to the alert until one is chosen.
- Placeholder charts (AU ADDS, G10 12.3) carry an on-screen warning.
- Categorical parameters (oxygen, consciousness) use 48 px option chips.

## Regional behaviour

- GB: default NEWS2 (RCP 2017). Zones are named by score, so the chip reads "Score 1".
- AU: default ADDS with placeholder scores (G10 12.3), flagged on screen; use `configureEwsChart` with the local chart, or EWS_NSW_BTF for zone-only scoring.
- NZ: default NZEWS (HQSC, G11 12.2 to 12.5), including the blue zone.

## Do and don't

- Do pass the patient's critical limits; the keypad does not invent them.
- Don't treat the per-parameter score as the total: show EarlyWarningScoreSummary before saving.

## Accessibility

- The value is an `output` labelled by the parameter name and announced politely, as is the score chip.
- The critical check is `role="alert"` with a heading; it can take focus.
- Keypad keys and navigation buttons are named buttons; hardware keyboard digits work in the pad.
