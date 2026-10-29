# LineChart

A time series chart for values that are not vital signs, such as outcome measure scores, with clinically meaningful bands named in words.

## When to use

Use it for a measure collected on occasions over weeks or months (K10, HoNOS, PHQ-9 totals), waiting times by month, or any series in one unit. Use `ObservationGraph` or `VitalSignsChart` for vital signs and observations, which need normal ranges, early warning zones and blood pressure symbology.

## What you provide

```tsx
<LineChart
  title="K10 total"
  unit="score"
  direction="Lower scores mean less distress"
  yRange={{ min: 10, max: 50 }}
  bands={[{ from: 10, to: 15, label: 'Low' }, { from: 16, to: 21, label: 'Moderate' }, { from: 22, to: 29, label: 'High' }, { from: 30, to: 50, label: 'Very high' }]}
  series={[{ id: 'k10', label: 'Consumer-rated', points: [{ time: '2026-02-02', value: 31, occasion: 'Start' }, { time: '2026-05-04', value: null, note: '3 items missing' }] }]}
/>
```

Bands, their words and the direction come from the measure's definition (supplied by the host), never from app code. `thresholds` draws labelled dashed lines (a target, a reliable change cut-off). `valueLabels` chooses which values carry a number. `styleAllocator` shares series styles with other charts in a session.

## Guidance implemented

- GTAB-002 [M] each series has a distinct colour and symbol (SeriesStyleAllocator from the lists area); overlaid series also differ by line dash [suggested] and are drawn hollow (GTAB-160).
- GTAB-028 one unit per chart, shown after the title and on the value axis.
- GTAB-048/049 [R] the latest value is labelled, all values on request.
- GTAB-057..064 [M] a focus line moved by the mouse or the Left and Right arrow keys (Home, End, Escape), labelled with its date and values, announced in words.
- GTAB-066/085 proportional time axis and GTAB-087..089 conventional ticks (chooseTimeTicks); GTAB-092..094 easy steps on the value axis (chooseYTicks).
- GTAB-069/072 [M] the value range is predefined, never fitted to the data.
- GTAB-164 [M] a line never bridges a value that has no valid number.
- GTAB-174..184 bands shaded under the data, named in the plot, the key, the table and every announcement; GTAB-177/182 thresholds as labelled lines.
- A value with no valid number drawn hollow on the baseline with its reason, and the "Show table" view with band words, are [suggested].

## Regional behaviour

None in the control. Band words, measure names and cut-offs differ by jurisdiction and come in as props.

## Do and don't

- Do state the direction in words when higher is not obviously better or worse.
- Do pass the measure's whole scale as `yRange`.
- Don't colour bands as good or bad, and don't add a claim of clinical significance the definition does not make.
- Don't put series with different units on one chart.

## Accessibility

A `figure` named by the title; the plot is a focusable group with a description of the keys. Every value, band and threshold is available in words: tooltips, the key, focus announcements in a polite live region and the "Show table" view with a real table. Colour is never the only cue (symbol, dash, words). The plot measures its container and shrinks to fit from 320px.
