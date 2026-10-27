# NaturalDateInput

A "Duration and/or date(s)" field that understands simple natural language ("past 10 years", "since 2016", "summer 2019") and shows the formal reading beside it.

## When to use
- Dates and durations attached to note entries, such as past medical history (used inside `NoteEntryList`).
- Not for a single exact date where the user must type day, month and year: use `DateInput` from the datetime area.

## What you provide
- `value`/`onChange` (text) and `dateValue`/`onDateValueChange` (standard form), or the uncontrolled `defaultValue`.
- Optional `referenceDate` (default today), `birthDate` (for "during childhood"), `region`, `showDateMenu`, `menuOptions`, `interpret` (your own reading, replaces the parser).

```tsx
<NaturalDateInput label="Duration and/or date(s)" value={text} onChange={setText}
  dateValue={when} onDateValueChange={setWhen} birthDate={patient.dob} showDateMenu />
```

## Guidance implemented
- CNA-0520 [R] one field labelled "Duration and/or date(s)".
- CNA-0530 [R] suggested readings appear immediately below the field while typing and can be chosen; CNA-0540 [R] only after 2 characters [suggested minimum] and only for phrases that make sense.
- CNA-0550 [R] no drop-down button on the field.
- CNA-0560/0570 [R] text descriptions ("past", "last", "for", "during") and approximate periods (seasons, Christmas, "during childhood", "10 years ago").
- CNA-0580 [R] an exact match is selected automatically; an ambiguous reading waits for the user to choose.
- CNA-0590/0600/0610 [R] the confirmation is shown to the right in the structure From, To, For.
- CNA-0620 [R] approximate values carry "(approximate)" and dates are shown only to the precision of the input (year only for "past 10 years").
- CNA-0630 [R,L] a separate "Choose period" menu (`showDateMenu`). The menu entries are [suggested].
- Hazard mitigation: the reading is returned in standard form (`ClinicalDateValue`); when two of start, end and duration are known the third is derived.
- Explicit dates are read with `parseDateInput` from the datetime area, so "05-Apr-2008", "Apr 2008", "2008" and "Unknown" work as in `DateInput`.
- "Not recognised as a date or duration: it will be kept as typed" for other text [suggested].

## Do and don't
- Do keep the typed text as well as `dateValue`: the confirmation is what is displayed later, the text is the source.
- Don't put examples in the in-field prompt (CNA-0270); put them in help text.

## Accessibility
- ARIA combobox with a listbox of readings; arrow keys move, Enter chooses, Escape closes.
- The confirmation is a polite live region and describes the field.
- The date menu is a menu button; arrow keys move between items and Escape returns focus.

## Regional behaviour
- GB: an ambiguous numeric date (05/04/2008) offers both readings as buttons ("Which did you mean?").
- AU and NZ: day precedes month in every format and month-first readings are never offered (G10 AU-DT-01; G11 section 6, "never accept or display MM/DD/YYYY").
- Seasons follow the hemisphere: GB summer June to August; AU and NZ summer December to February, winter June to August. Seasons crossing the new year are dated from the year they start [suggested; configurable in `SEASON_MONTHS`].
