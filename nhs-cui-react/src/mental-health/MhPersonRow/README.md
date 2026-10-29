# MhPersonRow

A person in a list: the CUI patient identification cell with the mental health extension (Known as, pronouns, sex, legal status, restricted marker).

## When to use

- Search results, caseloads, worklists and any list of people. Not for one-person screens (use `MhPatientBanner`).

## What you provide

- `person` as the CUI `PatientListPatient` (legal name, date of birth, `mrn` for the service record number, `ihi`, `nhi`).
- `preferredName`, `pronouns`, `sex` (host words), `legalStatuses`, `restricted`, `consent`, `markers`, `match` (from `findDuplicateNames`), `now` (for the age), `actions`.

```tsx
<MhPersonRow person={{ familyName: 'Nguyen', givenName: 'Thi Lan', dateOfBirth: '1990-03-12', mrn: '004512' }}
  preferredName="Lan" pronouns="she/her" sex={host.sex.display}
  legalStatuses={[{ state: 'current', label: host.labels.orderType }]} restricted />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- PAL-0450 [M]: name, date of birth and record identifier on separate lines, through `PatientIdentificationCell`.
- PAL-0540 to PAL-0570 [M]: identical or similar name warning passes through `match`.
- AU-ID-04, G11 12.6: identifier labels per region ("URN", "NHI").
- "Known as ..." and pronouns shown, never hidden; the CUI "Preferred name" line (PAL-0530) is replaced by it.
- Sex in the host's words right after the date of birth and age, on the Born line ("Born 12-Mar-1990 (36y) Sex Female"), before the record number; "Sex Not Known" when none. Placed through the cell's `afterBirth` slot.
- "Known as" sits on the name line through the cell's `afterName` slot [suggested].
- Markers in words (Restricted, Possible duplicate record, Deceased) [suggested].
- Side by side from 640px container width, stacked below [suggested].

## Do and don't

- Do pass the service record number as `mrn` so all three identifiers show.
- Don't show the legal status by colour alone; the badge carries the host's words.

## Accessibility

- Plain text lines in reading order; markers are text with an icon; badges are not interactive unless `onOpen` is given.

## Regional behaviour

- Name case and identifier labels follow the region (G10 2, G11 12.6); te reo macrons kept.
