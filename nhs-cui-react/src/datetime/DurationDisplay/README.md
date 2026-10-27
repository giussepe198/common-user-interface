# DurationDisplay

Shows a duration in the CUI format, such as 2hr 40min or 1m 2d 3hr 17min.

## When to use

Elapsed times, lengths of stay, infusion durations, time since an event.

## What you provide

- `value`: `ClinicalDurationParts` with whole numbers per unit (`years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`).
- `approximate`, `units` (extended symbols such as `{ hours: 'hrs' }`), `nullText`.

```tsx
<DurationDisplay value={{ hours: 2, minutes: 40 }} />              // 2hr 40min
<DurationDisplay value={{ hours: 2, minutes: 40 }} approximate />  // Approx 2hr 40min
```

## Guidance implemented

- D+Tb-0017 [M] years, months, weeks, days, hours, minutes and seconds as needed.
- D+Tb-0018 [M] whole numbers only (a decimal throws an error in development).
- D+Tb-0033 [M] symbols y, m, w, d, hr, min, sec, same for singular and plural.
- D+Tb-0034 [R] extended symbols allowed if unique across the set (checked).
- D+Tb-0026 [M] zero units omitted.
- D+Tb-0027, D+Tb-0028 [M] no space inside a pair, one space between pairs.
- D+Tb-0029 [M] largest unit first.
- D+Tb-0030, D+Tb-0031 [M] "Approx " prefix.
- Carries are not normalised (the source shows "2w 12d").
- An all-zero duration shows "0sec" [suggested: the source is silent].

## Do and don't

- Do convert decimals before display (1.5 hours is 1hr 30min).
- Don't use "m" for minutes: it always means months here.

## Accessibility

Screen readers hear the units in full ("2 hours 40 minutes") [suggested], so "m" cannot be misheard.
