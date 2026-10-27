# GraphStack

Several observation graphs stacked on one time axis with a single focus line across them all, for reading vital signs at the same moment.

## When to use

A vital signs view with more than one observation type over the same period (temperature, blood pressure, pulse, respiratory rate, oxygen saturation). Use a single `ObservationGraph` for one type, and overlay series on one graph only when they share a unit (GTAB-154).

## What you provide

```tsx
const session = new SeriesStyleAllocator(); // one per consultation
<GraphStack
  title="Vital signs"
  start={dayAgo} end={now} rangeLabel="Last 24 hours"
  graphs={[
    { id: 'temp', series: [temperature], yRange: { min: 35, max: 41 }, criticalThresholds: [{ direction: 'high', value: 39.5 }] },
    { id: 'bp', bloodPressure: { points: bp }, yRange: { min: 40, max: 200 } },
    { id: 'pulse', series: [pulse], yRange: { min: 40, max: 160 }, normalRange: { low: 60, high: 100, population: 'adult' } },
  ]}
  defaultOrder={graphStackConventionalOrder(graphs)}
  styleAllocator={session}
  maxHeight={640}
/>
```

Each graph takes the `ObservationGraph` props except the shared ones (`start`, `end`, `rangeLabel`, `now`, focus settings), plus an `id`. `order`/`defaultOrder`/`onOrderChange` and `focusTime`/`onFocusTimeChange` can be controlled.

## Guidance implemented

Multiple series
- GTAB-145 [R] graphs stacked vertically by default.
- GTAB-146 [M] left axes aligned: every graph has the same left margin and plot width; when any graph needs a thumbnail, every graph reserves its space `[suggested]`. In a container too narrow for a thumbnail and a 100 px plot, no graph reserves it, so the axes stay aligned.
- GTAB-147 [M] one time scale for the whole stack (`start`, `end`), so time intervals line up; GTAB-106 [R] the same vertical gridlines on every graph.
- GTAB-148 [R] minimal space between graphs: borders are shared and time labels show only under the bottom graph (tick marks stay on every graph).
- GTAB-149 [R] conventional order on request with `graphStackConventionalOrder` (temperature at the top, blood pressure next to pulse) `[keyword matching suggested]`; GTAB-150 [R] otherwise the order added; GTAB-151 [R] "Move up" and "Move down" buttons beside each graph.
- GTAB-152 [M] with `maxHeight` the stack scrolls; GTAB-153 [M] graphs out of view are named above it ("1 graph below the view: Oxygen saturation. Scroll down to see it."). A graph counts as out of view when less than half of it shows `[suggested]`.

Focus line
- GTAB-057 [M] one vertical focus line at the same time on every graph, with value labels where it crosses data; GTAB-065 [M] labelled with its time on each graph and in the stack heading.
- GTAB-058 [R] readings within `focusToleranceMs` (default 5 minutes) count as one set.
- GTAB-059 [R] labels on a background. GTAB-060/061 [R] each series' value just before and after the focus time (within `focusNeighbourMs`, default 12 hours `[suggested]`) in lighter, smaller labels; aligned values bold.
- GTAB-062/063 [M]/[R] follows the mouse over any graph and snaps to nearby readings; GTAB-064 [M] Left and Right arrows step one reading back or forward across the readings of every graph, Home and End go to the first and last, Escape clears.
- GTAB-177 [M] critical thresholds per graph (see `ObservationGraph`) are named in the announcement ("critical high"); threshold labels move clear of the latest value and the "Now" label.

## Do and don't

- Do give every graph a predefined `yRange` for its data type; never fit to the data by default (GTAB-072).
- Do share one `SeriesStyleAllocator` per consultation so a series keeps its colour and symbol.
- Don't put graphs with different periods in one stack; that is what this control prevents.
- Don't hide the stack heading: it carries the period and the focus time.

## Accessibility

- Each graph is a focusable group with its own name; the arrow keys on any graph move the shared focus line. Focus leaving the stack clears the line.
- One polite live region announces every graph at the focus time, in display order, for example "27-Oct-2026 12:00. Temperature 39.6 °C, manual, critical high. Respiratory rate: no reading at this time; before 22 at 08:00, after 24 at 16:00." `[suggested]` Graphs do not announce separately.
- Reorder buttons are named "Move Temperature up" and are disabled at the ends. Each graph keeps its "Show table" alternative.
