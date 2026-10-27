# DateTimeDisplay

Shows a date and time together, separated by a single space: Tue 05-Jan-2009 09:43:22.

## When to use

Event timestamps such as when a result was reported or a dose was given.

## What you provide

- `value`: a `Date` or ISO date-time string.
- `dayOfWeek`, `showSeconds`, `approximateTime`, `timeUnknown`, `nullText`, `clockIndicator`.
- `timeZone`, `showZone` (`true` or `"auto"`) and `region`, as for TimeDisplay.

```tsx
<DateTimeDisplay value="2006-06-12T02:30:00" />          // 12-Jun-2006 02:30
<DateTimeDisplay value={recorded} dayOfWeek showSeconds />
<DateTimeDisplay value="2010-03-27" timeUnknown />      // 27-Mar-2010 Unknown
```

## Guidance implemented

- D+Tb-0008 [M] single space between date and time; never "T", "-" or ":" between them.
- All D+Ta short-format rules for the date and D+Tb rules for the time (reuses core `formatDateTime` parts).
- D+Tb-0014 [M] "Approx" before an approximate time.
- D+Ta-0022, D+Tb-0011 [M] missing values show "Unknown" or similar; a missing time alone shows after the date.
- D+Tb-0032 [M] 24-hour clock indication (tooltip by default [suggested]).

## Do and don't

- Do set `timeUnknown` when only the date is known rather than inventing 00:00.
- Don't use for durations or time ranges.

## Accessibility

Screen readers hear the long date and the time, for example "Monday 12 June 2006 02:30".

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Format | Mon 12-Jun-2006 02:30 | Thur 05-Mar-2026 09:00 (day abbreviation per ACSQHC 2024) | as GB |
| Zones | browser zone unless `timeZone` given | facility zone; label other zones and the repeated hour, `04-Apr-2027 02:30 AEDT` then `04-Apr-2027 02:30 AEST` (AU-DT-07, AU-DT-08) | Pacific/Auckland or Pacific/Chatham; label the repeated hour NZDT/NZST (G11 7.2) |

With a zone, the `<time dateTime>` attribute carries the offset, e.g. `2027-04-04T02:30:00+10:00`, so the two readings of the repeated hour stay distinct. Sources: G10-australia.md 8.1 to 8.3; G11-new-zealand.md 7.1, 7.2.
