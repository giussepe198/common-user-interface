# TouchDateTimePicker

Touch date and time entry (P1): quick date chips, typed or spoken date text read back before use, large 24-hour steppers with quick time chips, Approximate and Time not known, a summary line, and clock-change checks in the facility time zone.

## When to use

- Recording when something happened on a phone (a fall, a dose given late, symptom onset), usually inside a FullScreenSheet.
- For desktop forms use DateInput and TimeInput from the datetime area.

## What you provide

- `value` / `defaultValue` / `onChange`: `TouchDateTimeValue` `{ date, time, approximate, timeNotKnown, occurrence? }`.
- `onConfirm(value, instant)`: shows the summary and "Use this date and time" bar; called only when nothing blocks. `instant` is the UTC instant in the facility zone, or null when the time is not known.
- `min`, `max`, `allowFuture` (default false), `allowApproximate`, `allowTimeNotKnown`, `minuteStep`, `quickTimes`.
- `dateText` / `defaultDateText` / `onDateTextChange`: the typed or dictated date text (a speech engine can fill it; it is still read back and needs "Use this date").
- `region`, `timeZone`, `now` (for tests and previews), `stickyActions`, `headingLevel`.

```tsx
<TouchDateTimePicker onConfirm={(v, instant) => save(v, instant)} min={admittedAt} />
```

Utilities: `readTouchDateInput`, `touchQuickDateOptions`, `formatTouchDate`, `stepTouchTime`, `shiftTouchDateTime`, `touchNow`, `touchDateTimeToInstant`, `checkTouchDateTime`, `touchDaylightSavingNotice`, `formatTouchDateTimeSummary`, `touchRepeatedHourLabels`.

## Guidance implemented

- D+Ta [M]: dates shown as "Mon 26-Oct-2026" (core short format with day name); D+Tb [M] 24-hour time with a colon; "Approx 21:30" for approximate times (D+Tb-0014).
- D+Tc-0005 [M]: in GB a numeric date such as 5/4 offers both readings; it is never guessed.
- Typed and spoken text is parsed by the datetime area's `parseDateInput`, keeping its messages. Added [suggested]: "today", "yesterday", "day before yesterday", and day and month without a year, for which the most recent past date is assumed and the read-back says "year assumed".
- Nothing typed or spoken is used until the user taps "Use this date" (Phase 4: dictation never auto-commits).
- Clock changes [M]: "now", Today and every check use the facility IANA zone, not the device zone (AU-DT-07). A time in the skipped hour is refused; a time in the repeated hour must be marked first or second, and the summary then shows the zone abbreviation (AU-DT-08, AU-DT-09; G11 7.2). When the period to now crosses a clock change, the library notice is shown (D+Tc-0048, D+Tc-0049).
- Future-time guard [suggested]: times after now are refused unless `allowFuture`. Min and max are checked to the minute.
- Steppers wrap within the field without carrying, like CUI time spinning (D+Tc-0027, via `spinTime`); the quick chips (Now, −15 min, −1 hr) are relative to now and carry into the date.

## Regional behaviour

- GB: numeric dates offer both readings (D+Tc-0005); day names Mon to Sun; zone Europe/London (GMT/BST).
- AU: numeric dates are read day first, never month first (AU-DT-01, G10 8.1); day names use "Thur" (ACSQHC 2024, AU-DT-04); default zone Australia/Sydney, set `timeZone` for Brisbane, Perth or Adelaide; repeated and skipped hours per AU-DT-08 and AU-DT-09.
- NZ: numeric dates are read day first (G11 7.1); default zone Pacific/Auckland (NZST/NZDT); set `timeZone="Pacific/Chatham"` where needed.

## Do and don't

- Do put it in a FullScreenSheet with `hasUnsavedData` once a value is chosen.
- Do store `timeNotKnown` and `approximate` with the record; don't store midnight as if it were a known time.
- Don't pre-fill a time the user has not confirmed.

## Accessibility

- Date and Time are labelled sections; the chosen date is announced politely.
- Hour and minute are `role="spinbutton"` inputs with Up and Down arrows and direct typing; the 64 x 48 px buttons above and below are named "Hour later", "Minutes earlier" and so on.
- Read-back and problems are live regions; on a blocked commit focus moves to the problem list.
- The calendar opens in a BottomSheet; it is the datetime area's CalendarPicker with touch-sized days.
