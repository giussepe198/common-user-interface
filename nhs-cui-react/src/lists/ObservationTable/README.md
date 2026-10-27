# ObservationTable

A table of observations with the newest reading in view, aligned decimals, frozen headings and how each reading was taken.

## When to use

As the tabular alternative to `ObservationGraph`, or wherever clinicians read exact values. One column (or row) per observation type, one unit each.

## What you provide

```tsx
<ObservationTable
  caption="Vital signs, last 24 hours"
  series={[{ id: 'temp', label: 'Temperature', unit: '°C', points: [{ time: '2026-10-27T08:00', value: 37.2, display: '37.2', source: 'manual' }], roundTo: 1 }]}
  bloodPressure={{ points: [{ time: '2026-10-27T08:00', systolic: 126, diastolic: 80 }] }}
/>
```

## Guidance implemented

- GTAB-186/187 [M] fixed orientation per data type: time down the rows by default; `orientation` for time across.
- Never wider than its container: the table scrolls sideways (and vertically, to `maxHeight`) inside its own region with the headings and row headers frozen, so it does not widen the page in grid or flex layouts `[suggested]`. If you place it in your own flex item, give that item `min-width: 0`.
- GTAB-188/189 [R] newest at the top (vertical) or far right (horizontal), scrolled into view.
- GTAB-190 [R] re-sort ("Show oldest at top"); GTAB-191 [R] "Swap rows and columns".
- GTAB-192/193 [R] light banding, no heavy gridlines; GTAB-199 [R] extra space after every fifth row; GTAB-198 not stretched to fill space.
- GTAB-194..196 [M] optional rounding (`roundTo`) with a note, and the recorded value on hover or focus.
- GTAB-197 [R] the first instance of a date is bold; repeats are lighter.
- GTAB-200 [M] tabular numerals; GTAB-201 [M] decimal markers aligned; GTAB-202 [R] no ".0" appended, cells padded instead (`alignDecimals`).
- GTAB-203..210 headings brief, top aligned and over their data; GTAB-213 never vertical; GTAB-217/218 [M] column and row headings always visible (sticky).
- GTAB-029 [M] never mixes units in a column or row: the unit is in the heading (FSG-0014).
- GTAB-219/220 [M] "manual" or "machine" shown by every value; manual readings are italic as well as labelled.
- Dates and times use the CUI formats (`dd-Mmm-yyyy`, 24-hour `HH:mm`).

Early warning annotations `[suggested]`
- `annotate` adds text and a fill to any value. `ewsObservationAnnotator(EWS_NZEWS, { pulse: 'heartRate' })` shows each value's early warning score with its zone in words (tooltip and screen reader text) and the zone fill (GTAB-083). Zone fills follow the `--ews-zone-*` tokens (see `VitalSignsChart`).

Critical thresholds
- GTAB-177 [M] `criticalThresholds` (same shape as on `ObservationGraph`): values at or beyond a limit carry a bordered tag with an up or down arrow and the word "Critical" (shape and text), read as "critical high" or "critical low"; the limits are listed under the table ("Critical limits: Temperature: Critical high ≥ 39.5 °C"). For blood pressure use `appliesTo: 'systolic'` or `'diastolic'`.

## Do and don't

- Do pass recorded precision as `display` strings so "37.0" stays "37.0".
- Don't mix Celsius and Fahrenheit in one series.

## Accessibility

- A real `table` with `th` row and column headers; the scroll area is a focusable, labelled region.
- Unit abbreviations have their full names as `abbr` titles.
- Rounded values are focusable and include the recorded value as visually hidden text.
