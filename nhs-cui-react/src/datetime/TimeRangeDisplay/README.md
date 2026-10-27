# TimeRangeDisplay

Shows a time range as two adjacent times, each with its own label, such as "From 06:23 to 08:23", with the elapsed time if wanted.

## When to use

Infusion periods, procedure times, shifts, observation windows: any start and end shown together. For a single time use TimeDisplay; for elapsed time alone use DurationDisplay.

## What you provide

- `from`, `to`: a `Date` or ISO date-time (an instant), a "HH:mm" string, or a `TimeInputValue`. Missing ends show `nullText` ("Unknown" by default).
- `fromLabel` (default "From") and `toLabel` (default "to").
- `showDuration`, `showDates` (`"auto"`, `"always"`, `"never"`), `showSeconds`, `approximateFrom`, `approximateTo`, `clockIndicator`.
- `timeZone`, `showZone` (`true` or `"auto"`), `region`.

```tsx
<TimeRangeDisplay from="06:23" to="08:23" />                         // From 06:23 to 08:23
<TimeRangeDisplay from={start} to={end} showDuration showZone="auto" /> // From 00:00 AEST to 05:00 AEDT (4hr)
```

## Guidance implemented

- D+Tb-0013 [R] a time range is two adjacent time displays, each with a contextual label; elapsed time may be shown as a duration ("From 06:23 to 08:23" as in the Quick Implementation Guide).
- D+Tb-0001 to D+Tb-0012 [M] each time follows Time Display (24-hour, HH:mm, 00:00 for midnight, "Unknown" for missing).
- D+Tb-0017 to D+Tb-0031 [M] the elapsed time follows the duration format (2hr 40min) and is read out in full words.
- D+Tb-0014 [M] "Approx" before an approximate time.
- [suggested] Dates are shown with both times when the ends fall on different days.
- [suggested] For times of day without dates, an end earlier than the start is read as the next day (22:00 to 01:30 is 3hr 30min).
- [suggested] An instant range whose end is before its start shows "Check: the end is before the start." with a warning icon and no duration.

## Do and don't

- Do pass instants (Date or ISO with time) when the range can cross midnight or a clock change.
- Don't merge the two times into one string such as "06:23-08:23".

## Accessibility

Each time is its own `<time>` element, labels are plain text read in order, the duration is announced in words ("4 hours"), and the reversed-range warning uses an icon and text, not colour alone.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Elapsed time across a clock change | real elapsed time | real elapsed time: 00:00 AEST to 05:00 AEDT on 04-Oct-2026 is 4hr (AU-DT-09) | real elapsed time: 01:00 NZDT to 03:00 NZST on 05-Apr-2026 is 3hr (G11 7.2) |
| Zone labels | GMT/BST with `showZone` | AEST/AEDT etc.; "auto" labels other zones and the repeated hour (AU-DT-08) | NZST/NZDT, CHAST/CHADT |

Sources: G10-australia.md 8.3; G11-new-zealand.md 7.2.
