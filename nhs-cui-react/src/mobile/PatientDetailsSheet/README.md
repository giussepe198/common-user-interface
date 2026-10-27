# PatientDetailsSheet

Full-screen patient details for phones (concept A2): identity, contact with protected values revealed only with a reason, ethnicity per region and the allergy list.

## When to use

- Opened from MobilePatientHeader's expand button (built in), or on its own from a "More" tab.

## What you provide

- `open`, `onClose`, `patient` (`MobilePatientIdentity`, including `address`, `phones`, `email`, `ethnicity`, `indigenousStatus`, `protection`, `allergies` with `recordedBy` per entry).
- `onRevealProtected(kind, reason)`: record the reason for audit; return false to keep the value hidden. `revealed` to control it.
- `region`, `now`, `dateFormat`, `title`, `portal`, `container`, `closeOnBrowserBack`, `initialFocusRef`, `autoFocus` (see FullScreenSheet; defaults from `SheetContainerProvider`).

```tsx
<PatientDetailsSheet open={open} onClose={close} patient={patient} onRevealProtected={(kind, reason) => audit(kind, reason)} />
```

## Guidance implemented

- Built on FullScreenSheet: modal, focus kept inside, Close in the header and Done at the bottom (Phase 4 rules).
- PAB name and NUM identifier rules as in MobilePatientHeader; nothing is truncated.
- G12 3 / HISO 10046 protection flags: address and contact details masked as "Address protected" / "Contact details protected"; reveal needs a written reason and the host's agreement [suggested, as the standard sets no UI].
- AU-AL-03 [R]: each allergy shows substance (regional mixed-case lettering), reaction and who recorded it and when; G11 9.2 "New this admission".
- AU-AL-01 [M]: "Unknown" and "Not recorded" are styled as warnings, never like "Nil known".

## Regional behaviour

- GB: "Ethnic category" as free text [suggested]; allergy heading "Allergies".
- AU: "Indigenous status" from the METeOR 602543 code (short wording, AU-IS-03); allergy heading "Allergies and adverse drug reactions"; My Health Record state row (G12 2).
- NZ: "Ethnicity" from HISO 10001 entries joined with "; ", macrons kept; allergy heading "Allergies and adverse reactions" (HQSC NMC).
- Data: `MOBILE_ETHNICITY_LABEL`, `MOBILE_ALLERGY_HEADING`.

## Do and don't

- Do audit every reveal reason on the server.
- Don't pre-fill the reason or reveal protected values without `onRevealProtected`.

## Accessibility

- `dialog` named by its title; sections are labelled by headings; values are in `dl` rows.
- The reason field is `aria-required`; the error is linked with `aria-describedby` and shown with an icon and words.
- Telephone links have an enlarged tap area.
