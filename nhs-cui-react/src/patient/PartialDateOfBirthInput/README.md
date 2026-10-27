# PartialDateOfBirthInput

Date of birth entry that accepts a full or partial date (year only, or month and year) and never invents a missing day or month.

## When to use

- NZ registration where HISO 10046 allows a partial date of birth, and anywhere a date of birth may be only partly known.
- Use the datetime area's date input for ordinary full dates.

## What you provide

- `value`/`onChange(date, hiso, parts)` or `defaultValue` (HISO "YYYY[MM[DD]]", ISO, or `{ year, month?, day? }`).
- Optional `showSource` with `source`/`onSourceChange` for the HISO date of birth information source; `required`, `now`, `error`, `onValidityChange`.

```tsx
<PartialDateOfBirthInput value={dob} onChange={(d, hiso) => setDob(hiso)} showSource source={src} onSourceChange={setSrc} />
```

## Guidance implemented

- HISO 10046:2024 2.3.1 [M]: layout YYYY[MM[DD]]; year mandatory; month if known; day only if the month is recorded; a valid date; not in the future.
- HISO 10046:2024 2.3.2 [M]: date of birth information source codes (BRCT, BREG, HL7, MIGR, NPRF, NZCI, NZCT, NZET, NZPV, NZTV, NZRT, OTHR, PPRT) when `showSource` is on; required once a date is entered.
- G11 1.4 [NHS DELTA]: no day is invented; "Recorded as: Mar-1975 (day not known)" confirms what will be stored [suggested wording].
- Day, month and year boxes in day-first order (G10, G11 day-first rule) [suggested layout].
- Year before 1800 refused (the ADHA B2B gateway uses the same floor) [suggested for NZ].
- HISO 10046:2024 has no separate "date of birth accuracy indicator"; accuracy is derived from the components (`partialDateAccuracy`).

## Do and don't

- Do store the HISO form returned in `onChange` (for example "197503").
- Don't convert a partial date to a full date for storage or calculations; use `formatPartialAge` for ages.

## Accessibility

- `fieldset` and `legend`; each box has a visible label and numeric keyboard. Errors appear after focus leaves the group, in a `role="alert"` region linked to the fieldset. The recorded result is an `output` with `aria-live="polite"`.

## Regional behaviour

- NZ: HISO 10046 rules and source codes. AU and GB have no partial date of birth rule in the notes; the control can still be used where a local policy allows it [suggested].
- Source: HISO 10046:2024 (G12 section 5).
