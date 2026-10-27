# MicroPatientBanner

Compact, display-only patient banner for hand-held screens (240 x 320 up to below 1024 x 768) that identifies the patient without any clinical information.

## When to use

- At the top of a hand-held screen showing one patient's record.
- Not on desktop screens (use `PatientBanner`), not on multi-patient screens, and never in or beside a patient list (MPB-0015, MPB-0016).

## What you provide

- `name`, `dateOfBirth`, `nhsNumber` (always shown), optional `showTitle` and `showAge`.
- `preferredName`, `dateOfDeath` (deceased state).
- Zone 2: `gender`, `address`, `onViewAllAddresses`.

```tsx
<MicroPatientBanner
  name={{ familyName: 'Ruth', givenName: 'Anne', title: 'Mrs' }}
  dateOfBirth="1972-03-09"
  nhsNumber="9990000026"
  gender="Female"
  address={{ type: 'Usual address', lines: ['340 Gloucester Road'], town: 'Tewkesbury', postcode: 'GL20 4RT' }}
  onViewAllAddresses={openAddresses}
/>
```

## Guidance implemented

- MPB-0001..0004, MPB-0006 [M]: Zone 1 always; optional Zone 2, collapsed by default.
- MPB-0005 [M]: no props for allergies, risks or other clinical information.
- MPB-0007 [R]: expanded Zone 2 overlays the screen with a slightly translucent fill and the note "Screen content is hidden behind this panel" [suggested wording].
- MPB-0008 [M]: display only; the only controls are the Zone 2 toggle and record links.
- MPB-0009..0014 [M]: full width, horizontal, distinct dark background with a thick border. Position it fixed at the top of the screen in your layout.
- MPB-0017..0019 [M]: family name, given name, Born and NHS No. always; title and age optional.
- MPB-0020, MPB-0024 [R]: no location or photograph props.
- MPB-0021, MPB-0027, MPB-0057..0060 [M]: deceased shows "Died" and "Age at Death" below "Born", no parentheses.
- MPB-0022 [M]: unknown values show "Not Known", never "?".
- MPB-0023, MPB-0036, MPB-0053 [R]: preferred name below the name.
- MPB-0025, MPB-0026 [M]: name, Born, age and NHS No. in Zone 1.
- MPB-0028, MPB-0029, MPB-0030 [M]: Gender and full address with its type label only in expanded Zone 2, with "View all addresses".
- MPB-0031..0035, MPB-0037..0043 [M/R]: labels "Born", "Gender", "NHS No.", "Died", "Age at Death", no colons; age in two units; gender in full words.
- MPB-0044 [R]: label definitions as tooltips that also open on focus (touch: on tap focus).
- MPB-0045 [M]: Gender is accompanied by "Use gender only to identify and address the patient, not for clinical judgements." (`genderCaution`, [suggested] wording).
- MPB-0046 [R]: `onOpenRecord` links Zone 1 and Zone 2 items to the record.
- MPB-0047 [R]: text sizes are in rem, so the user's font size settings apply. Font family and colour follow the host application's theme.
- MPB-0048..0054 [M/R]: "FAMILY, Given (Title)"; parentheses omitted when the title is hidden; names never truncated and wrap only between whole components.
- MPB-0055, MPB-0056 [M]: deceased Zone 1 changes brightness, hue and saturation and adds a diagonal hatch.
- MPB-0061..0063 [M]: preferred name and dates left-aligned below the items they relate to.

## Do and don't

- Do keep it at the top of the screen and visible while scrolling.
- Don't add allergies, risks or other clinical data to it.
- Don't use it inside a list of patients.

## Accessibility

- A `section` named after the patient, with ", deceased" when applicable.
- The Zone 2 toggle is a full-width button with `aria-expanded`; the overlay is hidden from assistive technology while collapsed.
- Gender is never shown as a symbol or abbreviation.

## Regional behaviour

- `region` (or the provider) switches identifiers, name case, title default and gender labels exactly as for `PatientBanner`: GB NHS No.; AU IHI then URN, Medicare with IRN and DVA (G10 1.6); NZ NHI (G11 12.6).
- AU: family name upper case, title hidden by default (AU-PI-02); single name shown alone (AU-NM-01); `dateFormat="dd/mm/yyyy"` (AU-PI-03 C).
- NZ: family name as recorded with macrons (G11 2.3); te reo gender labels with `teReoLabels`; Z-range NHIs flagged unless `flagTestIdentifiers={false}`.
- `unidentified` adds the "Unidentified patient" qualifier (AU-NM-02, G11 2.5).
- The banner still holds no clinical information (MPB-0005), so allergy wording does not apply.
