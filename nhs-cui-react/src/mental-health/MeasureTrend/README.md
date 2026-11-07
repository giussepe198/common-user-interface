# MeasureTrend

Outcome measure totals over time on the CUI observation graph, with the host's bands shaded and named, and the change since the previous and the first occasion in non-directive words with the source.

## When to use

- The measures screen and the one-page clinical summary; with the person in a collaborative review.

## What you provide

- `instrument` (host definition with `bands`, `bandSource`, `reliableChange`, `totalRange`), `occasions` (`MeasureOccasion[]`), `title`, `unit`, `start`, `end`, `changeWords`, `changeSuffix`, `height`, `now`, `timeZone`, `region`.

```tsx
<MeasureTrend instrument={host.instruments.k10} occasions={collections} changeSuffix="for discussion with the person" />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Built on `lists/ObservationGraph`: predefined y range, never fitted to the data (GTAB-069, GTAB-072); bands shaded underneath and named in the legend so colour is not the only cue (GTAB-083 pattern); day precision points are hollow and not joined by time of day (GTAB-017); table alternative (GTAB accessibility).
- Totals come from the definition; a total that is not valid is left off the graph and listed in words, never drawn as zero; partial totals are labelled [suggested].
- Change against the host's reliable change, the band and change sources shown, non-directive wording ("for discussion with the person"); without a reliable change amount only the difference is shown [suggested].
- No diagnosis or risk decision; the words are the host's [suggested].
- The graph measures its frame and keeps its own minimum plot width (ObservationGraph); the summary wraps [suggested].

## Do and don't

- Do pass every occasion, including those with invalid totals, so the gaps are explained.
- Don't present a reliable change as a clinical judgement.

## Accessibility

- A labelled region; the graph offers its table view; the latest total, band and changes are text.

## Regional behaviour

- None; instruments, bands and reliable change amounts come from the host [verify per instrument].
