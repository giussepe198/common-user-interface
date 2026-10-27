# GraphThumbnail

A small overview placed beside a graph that shows every value in the timeframe, so data outside the graph's scale is never hidden.

## When to use

`ObservationGraph` shows one automatically when values fall outside its predefined scale (`thumbnail="auto"`). Use it directly beside a custom graph that keeps a fixed scale.

## What you provide

```tsx
<GraphThumbnail series={[pulse]} start={start} end={end} viewRange={{ min: 40, max: 160 }}
  normalRange={{ low: 60, high: 100 }} zones={ewsGraphZones(EWS_NZEWS, 'heartRate')} label="Pulse rate" unit="beats/min" />
```

## Guidance implemented

- GTAB-078 [M] communicates all data in the timeframe; the extent covers the main view and every value, rounded to an easy step (`graphThumbnailExtent`).
- GTAB-079 [R] placed to the right of the graph; GTAB-082 [M] never over it.
- GTAB-080 [R] points when there is room, interpolation only when dense (`mode`).
- GTAB-081 [R] upper and lower axis tick marks with their values.
- GTAB-083 [R] indicative range and early warning zones overlaid as on the main graph.
- `[suggested]` the main graph's range is outlined, and "2 outside view" counts values the main graph cannot show.

## Do and don't

- Do pass the same series, timeframe and ranges as the main graph.
- Don't use the thumbnail as the only way to read values: it is an overview.

## Accessibility

- An SVG image with an accessible name giving the value count, extent, the main view's range and how many values are outside it.
