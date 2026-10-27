# PatientIdentificationCell

The patient identification cell for multi-patient lists: name, date of birth and record identifier on separate lines, with the region's labels and formats and the identical-name warning.

## When to use

`PatientList` uses it for `kind: 'patient'` columns. Use it directly in other lists that show one patient per row.

## What you provide

```tsx
<PatientIdentificationCell
  region="AU"
  patient={{ familyName: 'Nguyen', givenName: 'Minh', dateOfBirth: '1951-06-07', ihi: '8003601234567894', ihiStatus: { record: 'Unverified' }, mrn: '00412377' }}
  match={findDuplicateNames(patients).get(id)}
/>
```

`patient={null}` shows an unoccupied location. Identifiers: `nhsNumber` (GB), `ihi`, `ihiStatus`, `mrn` (AU), `nhi` (NZ).

## Guidance implemented

- PAL-0450 [M] name, date of birth and identifier in that order on separate lines; PAL-0520 [M] "FAMILY, Given (Title)"; PAL-0530 [R] preferred name after the name; PAL-0600 [M] name larger and bolder.
- PAL-0460..0500 [R] "UNKNOWN, Unknown, Male", "Born Unknown", identifier "Unknown"; PAL-0510 [R] temporary number while no national identifier is held.
- PAL-0540..0570 [M]/[R] warning symbol and highlight for identical or similar names, with the first differentiator underlined (given name, date of birth, then identifier), and the reason in words for screen readers.
- PAL-0660 [R] "UNOCCUPIED".

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Identifier | NHS No. 999 000 0018 | IHI in 4-4-4-4 groups then URN; each held one shown; "IHI Unknown" when neither (G10 1.6) | NHI, 7 characters upper case, never grouped (G11 1.3) |
| Status | None | IHI status other than Active or Verified shown in words, e.g. "(Unverified)" (AU-ID-01) | None |
| Name | FAMILY upper case, title shown | FAMILY upper case, no title (AU-PI-02) | Family name as recorded, macrons kept (G11 2.3) |
| Single name | "SMITH, Unknown" (PAL-0480) | Name alone (AU-NM-01) | Name alone (G11 2.1) |
| Date of birth | dd-Mmm-yyyy | dd-Mmm-yyyy, or DD/MM/YYYY with `dateOfBirthFormat="numeric"` to match the wristband (AU-PI-03) | dd-Mmm-yyyy |
| Unidentified | Table 7 wording | Recorded name exactly plus "Unidentified patient" (AU-NM-02) | Same, `[suggested]` (G11 2.5) |

Labels, IHI and NHI formatting, and name case come from the patient area (`PATIENT_IDENTIFIER_LABELS`, `formatIhi`, `formatNhi`, `PATIENT_NAME_RULES`). AU URN label is configurable with `mrnLabel` (AU-ID-04). The NZ name case default is [UNCERTAIN] in G11 2.3. Medicare and DVA numbers are not shown: they are not stand-alone patient identifiers (AU-ID-03).

## Do and don't

- Do pass the duplicate-name match computed across the whole list, including filtered-out rows.
- Don't show bed or room as an identifier (AU-ID-05).

## Accessibility

- Labels ("Born", "IHI") are text, not colour; the warning is announced with the element to check.
