# BarChart

Counts or measures by category, as columns or horizontal bars, grouped when there is more than one series.

## When to use

Use it for comparisons across categories: referrals by source, open episodes by team, contacts by month with the previous year beside them. Use `LineChart` for change over time in one measure, and `StatTile` for a single number.

## What you provide

```tsx
<BarChart
  title="Referrals by source"
  unit="referrals"
  series={[{ id: 'q3', label: 'Jul to Sep' }, { id: 'q2', label: 'Apr to Jun' }]}
  categories={[{ id: 'gp', label: 'GP', values: [42, 30] }, { id: 'self', label: 'Self', values: [null, 7] }]}
  suppressedText="<5"
  thresholds={[{ value: 40, label: 'Planned capacity' }]}
/>
```

`orientation` is 'vertical', 'horizontal' or 'auto' (default). `max` sets the top of the value axis (it always starts at zero). `showValues` writes each value at its bar (default on).

## Guidance implemented

- GTAB-002 [M] applied to bars: series differ by fill pattern (solid, hatched, dotted, cross-hatched) as well as colour, and the key names them [suggested].
- GTAB-092..094 easy steps on the value axis (chooseYTicks).
- GTAB-177/182 thresholds as labelled dashed lines, named in the key.
- GTAB-057/062 applied to categories: the arrow keys move a focus highlight between categories and announce every value [suggested].
- A value that is not shown (a suppressed small count) is drawn as its words at the baseline, never as zero [suggested].
- 'auto' orientation switches to horizontal bars when a category label would not fit under its column, so labels are wrapped, never cut [suggested].

## Regional behaviour

None. Suppression rules and their words come from the report specification.

## Do and don't

- Do order categories meaningfully and keep the axis starting at zero.
- Do give `suppressedText` for small cells; never pass 0 for a suppressed value.
- Don't use more than about four series; split the chart instead.
- Don't rely on colour: keep the key and the values on.

## Accessibility

A `figure` named by the title; the plot is a focusable group with a description of the keys (arrows, Home, End, Escape). Each bar has a tooltip in words, focus announcements go to a polite live region, and "Show table" gives a real table with the same numbers, notes and suppressed words. The chart measures its container and fits from 320px.
