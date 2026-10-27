# DateDisplay

Shows a single date in the CUI short format (05-Apr-2008) for clinical use, or the long format (05 April 2008; in Australia 5 April 2008) for patient-facing text.

## When to use

Anywhere a date is shown: dates of birth, medication start and end dates, appointments, results. Use the long format only in communications with patients and other non-clinical readers.

## What you provide

- `value`: a `Date`, an ISO string, or a `DateInputValue` (including partial dates and unknown). Missing values show `nullText`.
- `format`: `"short"` (default) or `"long"`.
- `dayOfWeek`, `ordinal` (long format only), `longDateStyle` ('cui' or 'style-manual'; default by region), `nullText`, `spokenLongForm`.
- `region` (optional): otherwise read from `ClinicalLocaleProvider`.

```tsx
<DateDisplay value="2008-04-05" />                        // 05-Apr-2008
<DateDisplay value={appt} dayOfWeek />                    // Tue 01-Jan-2008
<DateDisplay value="2008-01-22" format="long" ordinal />  // 22nd January 2008
<DateDisplay value={null} nullText="Not recorded" />
<DateDisplay value="2008-04-05" format="long" dayOfWeek region="AU" />  // Saturday 5 April 2008
```

## Guidance implemented

- D+Ta-0002 [M] month always as text, never a number.
- D+Ta-0003 [M] month with first letter capitalised only (Apr, April).
- D+Ta-0004 [M] four-digit year.
- D+Ta-0005 [R] tabular figures so dates align in columns.
- D+Ta-0006 [M] short format by default for clinical use.
- D+Ta-0007, D+Ta-0008, D+Ta-0009 [M] three-letter month (May in full), no full stop, single hyphens.
- D+Ta-0010 [M] short format ignores regional settings (uses core `formatShortDate`, never `toLocaleDateString`).
- D+Ta-0011, D+Ta-0012, D+Ta-0013 [M] long format with full month name and single spaces.
- D+Ta-0015 [R] screen readers hear the long form of a short date.
- D+Ta-0016, D+Ta-0017 [R] optional day of week, Mon to Sun, placed before the date with one space.
- D+Ta-0018, D+Ta-0019 [M] two-digit day, except ordinal days.
- D+Ta-0020, D+Ta-0021 [M] ordinal suffix st, nd, rd, th, lower case, superscript, no space.
- D+Ta-0022 [M] missing dates show "Unknown" or similar, never blank.
- Rendered as `<time dateTime>` and never wraps at its hyphens [suggested].
- Partial dates show as "Aug-2005" and "2005" (long: "August 2005") [suggested: the source does not define partial date display].

## Do and don't

- Do use the short format for every clinical date, including date of birth.
- Do show the day of week for appointments and scheduling.
- Don't show the day of week for date of birth or date of death.
- Don't pass pre-formatted strings such as "08/04/2008".

## Accessibility

The visible short date is hidden from screen readers and replaced by the long form ("Saturday 05 April 2008"), because "Jun" and "Jul" sound alike. The long format follows English (UK) only; D+Ta-0014 (follow the user's default regional settings for the long format) is not implemented beyond English.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Short format on screen | DD-Mmm-YYYY | DD-Mmm-YYYY (ACSQHC on-screen guideline examples, AU-DT-02) | DD-Mmm-YYYY (G11 7.1 recommendation) |
| Day of week | Mon Tue Wed Thu Fri Sat Sun | Mon Tue Wed **Thur** Fri Sat Sun (ACSQHC 2024 accepted terms, AU-DT-04) | as GB (no NZ source) |
| Long format | 05 April 2008 | **5 April 2008**, day of week in full ("Saturday 5 April 2008"), no comma, no ordinal (Australian Government Style Manual) | as GB |
| Screen reader form of a short date | Saturday 05 April 2008 | Saturday 5 April 2008 | as GB |

Sources: G10-australia.md 8.1; G11-new-zealand.md 7.1; Australian Government Style Manual, "Dates and time", https://www.stylemanual.gov.au/grammar-punctuation-and-conventions/numbers-and-measurements/dates-and-time (checked 27-Oct-2026): full dates are day, month, year with no comma or other punctuation, without ordinal numbers, and are not shortened in text; day and month abbreviations only where space is limited. The notes had this as [UNCERTAIN]; it is now verified and is the AU default for `format="long"`. Pass `longDateStyle="cui"` to keep the CUI form in AU, or `"style-manual"` to use it elsewhere. The short on-screen form stays DD-Mmm-YYYY in AU (ACSQHC on-screen guideline, AU-DT-02); the Style Manual's own numeric forms (7/12/2020) are not used, because a numeric month is unsafe in clinical display (D+Ta-0002).

Not built: the AU-DT-03 option to show DD/MM/YYYY to match a wristband [configurable in the notes]. `DateTimeDisplay` and `CalendarPicker` keep the CUI spoken form in AU [suggested follow-up].
