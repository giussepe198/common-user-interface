# ObservationGraph

An SVG line graph of time-based observations (vital signs) on a proportional time axis, with a predefined value scale, shaded normal range, latest values, a focus line and a table alternative.

## When to use

Trends of one observation type (pulse, temperature, respiratory rate, oxygen saturation), overlaid series that share a unit, or blood pressure. Stack several graphs with the same `start`, `end` and width so their time intervals line up (GTAB-146/147). Inside a `TimelineView`, use a graphs section.

## What you provide

```tsx
const session = new SeriesStyleAllocator(); // one per consultation, shared by every graph
<ObservationGraph
  series={[{ id: 'pulse', label: 'Pulse rate', unit: 'beats/min', unitDefinition: 'beats per minute',
    points: [{ time: '2026-10-27T08:00', value: 94, source: 'machine' }] }]}
  start={dayAgo} end={now} rangeLabel="Last 24 hours"
  yRange={defaultYRange({ min: 40, max: 160 }, { low: 60, high: 100 })}
  normalRange={{ low: 60, high: 100, population: 'adult' }}
  styleAllocator={session}
/>
<ObservationGraph bloodPressure={{ points: bp, systolicRange, diastolicRange }} start={dayAgo} end={now} yRange={{ min: 40, max: 180 }} />
```

Pass recorded precision with `display` (for example `"37.0"`); values are never padded or rounded on the graph.

## Guidance implemented

Data points and series
- GTAB-001 [M] points joined by lines, never bars or areas. GTAB-002/006..009 [M] distinct colour and symbol per series; symbols are symmetric and centred on the value (GTAB-008/012). GTAB-003..005 [M] `SeriesStyleAllocator` keeps a series' style for the session and is reset at the end of the consultation.
- GTAB-124 [R] colours allocated blue, red, yellow first, then green and black. Only five token colours exist, so further series reuse a colour with a new symbol: every pair stays unique `[suggested]`.
- GTAB-010/011/016 [M] 10 px symbols, larger than the 2.5 px line, constant size. GTAB-014 [R] tightly packed points become short thick vertical lines. GTAB-121 [R] black border on points (white in dark theme, through the `--ink` token).
- GTAB-017 [R] day-precision data (`timePrecision: 'day'`) is drawn hollow and not interpolated, and its latest value is given with its date only ("Latest 21 on 15-Oct-2026").
- GTAB-018..024 [M]/[R] series label above the graph at top left; overlaid series get a legend directly above the graph area. GTAB-025 no vertical labels.

Units
- GTAB-027 [M] unit always visible, beside the label and at the top of the value axis; GTAB-034/035 definition on request (`unitDefinition` as an `abbr` title); GTAB-037 unit less prominent than the label; GTAB-028 one unit per series; GTAB-154/155: series with different units on one graph show a warning and no horizontal gridlines (GTAB-157).

Blood pressure
- GTAB-039..042 [M] systolic and diastolic on one graph as the ends of a vertical line with T-bars thicker than gridlines; GTAB-043 [R] not interpolated; GTAB-044 [R] crowded readings become plain vertical lines; GTAB-185 [R] systolic and diastolic ranges in different shades.

Values and focus
- GTAB-045..047 [M] latest and penultimate values shown by default, the latest larger and bolder; GTAB-048/049 [M] "Show all values" on request; GTAB-051..053 values just above their points (overlaid series alternate above and below); GTAB-054 [M] recorded precision; GTAB-134 [M] no brackets.
- GTAB-057 [M] vertical focus line with value labels where it crosses data; GTAB-058 [R] tolerance (`focusToleranceMs`, default 5 minutes); GTAB-059 [R] labels on a background; GTAB-062..064 [M] follows the mouse, and Left/Right arrows move it one reading at a time; GTAB-065 [M] labelled with its time.

Scaling and axes
- GTAB-066 linear scales; GTAB-069/072 [M] the y range is predefined (`yRange`, see `defaultYRange`), never fitted to the data by default; GTAB-073/075 "Fit to data" on request, shown as "Rescaled to fit the data".
- GTAB-078 [M] values outside the scale are drawn as arrowheads at the edge and counted ("2 above the scale") `[suggested]`; with `thumbnail` (default `'auto'`) a `GraphThumbnail` beside the graph, never over it, shows all data in the timeframe with upper and lower tick marks and the indicative range (GTAB-079..083). Not shown in embedded timeline rows. An automatic thumbnail is left out when it would squeeze the plot below its 100 px minimum; the legend still counts the values off the scale `[suggested]`.
- Narrow containers `[suggested]`: the plot never drops below 100 px wide; below that the graph scrolls sideways inside its frame instead of widening the page.
- GTAB-084..089 [M] time left to right, proportional, conventional intervals from `chooseTimeTicks`, midnight marks heavier; GTAB-112 [M] full dates under midnight marks and in the range label; GTAB-114 [R] range label ("Last 24 hours").
- GTAB-092/093 [R] y steps of 1, 2 or 5 times a power of ten (`chooseYTicks`); GTAB-100 y need not start at zero; GTAB-101..106 sparse light gridlines; GTAB-107 gridlines can be turned off (`showGridlines`); GTAB-108 labels on marks.

Formatting and ranges
- GTAB-118/120 [M] plain light graph area with good contrast; GTAB-125..133 dark undecorated text, no vertical or flashing text; GTAB-141..143 no watermarks, patterns or decoration.
- GTAB-164..173 straight solid lines drawn beneath points, same colour, thinner than points, broken across known gaps (`gaps`); overlaid lines semi-transparent (GTAB-160) and symbols hollow (GTAB-162).
- GTAB-174..184 normal range shaded underneath everything, low saturation, labelled with its population; one shading style per system (`rangeShading`, GTAB-175).

Context
- GTAB-219/220 [M] how the latest reading was taken is shown by default ("machine reading"); every point's tooltip and the focus label include it.

Early warning zones
- GTAB-083 [R] `zones` shades early warning bands under the data, e.g. `ewsGraphZones(EWS_NZEWS, 'heartRate')`, each named in the legend ("Red zone, score 3") so colour is not the only cue; the thumbnail shows the same zones.

Critical thresholds
- GTAB-177 [M] `criticalThresholds` adds consumer-defined critical limits beside the normal range: each is a solid threshold line (lines are kept for clinician thresholds, GTAB-182) named in the plot and in the legend ("Critical high ≥ 39.5 °C, set by Dr Okafor"). Values at or beyond a limit get a ring (shape), their value label is always shown, and tooltips, focus labels, the "Latest" line and announcements say "critical high" or "critical low" (text). Colour is never the only cue. The threshold label sits at the right end of its line unless that would overlap a value label, a point, the "Now" label or line, the inside value scale (embedded) or another threshold label; it then moves to the other side of the line, then to the left end `[suggested]`. Limits are inclusive unless `inclusive: false` `[suggested]`. For blood pressure use `appliesTo: 'systolic'` or `'diastolic'`. The table alternative tags the same values.
- Thresholds do not change the y range: a limit outside the range is listed in the legend only `[suggested]`.

Shared focus (used by `GraphStack`)
- `focusTime` and `onFocusTimeChange` make the focus line controlled; `focusStepTimes` sets the times the arrow keys step through; `announceFocus={false}` leaves announcing to the host. `showFocusNeighbours` shows each series' value just before and after the focus time in lighter labels (GTAB-060/061, window `focusNeighbourMs`, default 12 hours `[suggested]`). `hideTimeLabels` and `reserveThumbnailSpace` keep stacked graphs aligned (GTAB-147/148).

## Do and don't

- Do share one `SeriesStyleAllocator` per consultation.
- Do set `yRange` from clinical presets so significant changes stay visible (GTAB-071).
- Don't overlay series with different units, or overlay two normal ranges.
- Don't use the graph as the only view: the table alternative is always one click away.
- Don't mark critical values with colour alone, or use a critical threshold where a normal range is meant.

## Accessibility

- "Show table" switches to `ObservationTable` with the same data (the accessible alternative).
- The graph is focusable, described by instructions, and announces focus-line values in a polite live region ("27-Oct-2026 08:00: Pulse rate 94 beats/min, machine").
- Colour is never the only code: series also differ by symbol and label.
