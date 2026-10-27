# TimeDisplay

Shows an exact or approximate time on the 24-hour clock, such as 14:30 or Approx 03:56.

## When to use

Any time of day on screen: administration times, observation times, times of events. For a date and time together use DateTimeDisplay; for elapsed time use DurationDisplay.

## What you provide

- `value`: a `Date`, an ISO date-time, a "HH:mm" string, a `TimeInputValue`, or `"unknown"`.
- `showSeconds`, `approximate`, `nullText`, `clockIndicator` (`"tooltip"`, `"visible"` or `"none"`).
- `timeZone` (IANA name, e.g. `"Australia/Perth"`) to show an instant in that zone; `showZone` (`true` or `"auto"`) to add the zone abbreviation; `region`.

```tsx
<TimeDisplay value="04:28" clockIndicator="visible" />   // 04:28  24-hour clock
<TimeDisplay value={t} approximate />                     // Approx 03:56
```

## Guidance implemented

- D+Tb-0001 [M] 24-hour clock only.
- D+Tb-0002 to D+Tb-0007 [M] HH:mm with leading zeros and colons.
- D+Tb-0009, D+Tb-0010 [M] midnight is 00:00, never 24:00; last minute 23:59.
- D+Tb-0011 [M] missing times show "Unknown" or similar.
- D+Tb-0012 [R] seconds only when required.
- D+Tb-0014 to D+Tb-0016 [M] "Approx" prefix with one space.
- D+Tb-0032 [M] indication that the 24-hour clock is used: a tooltip by default [suggested mechanism], visible text "24-hour clock" as in the Quick Implementation Guide, or none when a header already says so.

## Do and don't

- Do use `clockIndicator="none"` only when the column header or form already states "24-hour clock".
- Don't show time ranges as one string: use two TimeDisplays with "From" and "To" labels (D+Tb-0013).

## Accessibility

The time is in a `<time>` element. The visible indicator text is plain text and is read by screen readers.

## Time zones [suggested mechanism]

Without `timeZone` or `showZone` the time is shown in the browser's zone, exactly as before. With `timeZone` the instant is formatted in that IANA zone from the platform's time zone data, never a fixed offset. `showZone={true}` always adds the abbreviation (`02:30 AEDT`); `showZone="auto"` adds it only when the zone's offset differs from the facility zone (the locale's `timeZone`) at that instant, or when the time falls in the repeated hour after clocks go back. "HH:mm" strings and `TimeInputValue` are times of day, not instants, so they are never converted or labelled.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Format | HH:mm, 24-hour, colon | HH:mm, 24-hour, colon; never 24:00 or 2400 (AU-DT-05) | HH:mm, 24-hour (G11 7.1) |
| Zone labels | GMT, BST | AEST/AEDT, ACST/ACDT, AWST, ACWST (unofficial), LHST/LHDT, NFT/NFDT, CXT, CCT | NZST/NZDT, CHAST/CHADT |
| When to label | host's choice | other zone than the facility, or the repeated hour (AU-DT-08) | the repeated hour (G11 7.2) |

Abbreviations come from `TIME_ZONE_NAMES` (`utils/regions/timeZones.ts`); zones not in the table show the offset, e.g. `UTC+05:30`. Offsets in the AU table are marked [UNCERTAIN] in G10 8.3 but are read from the platform, not from the table. Sources: G10-australia.md 8.2, 8.3; G11-new-zealand.md 7.1, 7.2.
