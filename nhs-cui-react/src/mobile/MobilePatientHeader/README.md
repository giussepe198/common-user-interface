# MobilePatientHeader

Compact patient banner for phones (concepts A1, A3, B2, P3, P4), with full and condensed variants and an expand button that opens PatientDetailsSheet.

## When to use

- At the top of every patient-context screen on a phone. Use `variant="full"` on summary and administration screens and `variant="condensed"` on list screens (medicines, drug agenda).
- Use `sticky` where the screen scrolls, so the patient stays visible.

## What you provide

- `patient`: `MobilePatientIdentity` `{ name, preferredName?, dateOfBirth?, partialDateOfBirth?, gender?, identifiers?, location?, allergies?, protection?, myHealthRecord?, similarNames? }`.
- `variant`, `region`, `now`, `dateFormat` (AU `dd/mm/yyyy` to match the wristband), `onBack` + `backLabel`, `showDetailsButton`, `detailsOpen` / `defaultDetailsOpen` / `onDetailsOpenChange`, `onRevealProtected`, `detailsSheetProps`, `similarNameLabel`, `showLocation`, `sticky`.

```tsx
<MobilePatientHeader patient={patient} variant="full" onBack={toWorklist} backLabel="Back to worklist" sticky />
```

## Guidance implemented

- Phase 4 mobile rules [M]: always visible on patient screens; never truncates the name or an identifier. Names wrap only between components (NID-0013, MPB-0054); identifiers stay on one line (NUM-0001).
- PAB-0016 [M]: Born (with age), Gender, identifier in that order; PAB-0061 preferred name under the name.
- PAB-0064 [M]: allergy status in exact regional wording; known allergies are named in the full variant and counted in the condensed one ("Allergies 2"), with the full wording as the accessible name [suggested].
- G10 1.6 [M]: identifiers always labelled; AU-ID-01 [M] IHI status qualifiers in words; AU-ID-03 Medicare shown with the IRN or "IRN not recorded".
- AU-PI-04 [M]: similar-name warning with icon and words, driven by host data.
- G12 3: "Name protected" indicator; G12 5: partial dates of birth with "year only" or "day not known" and an age range; G12 2: My Health Record state in words.
- AU-ID-05 [M]: location is shown but never used as an identifier.
- The expand button is 48 x 48 px and opens the details sheet; the back button is optional [suggested].

## Regional behaviour

- GB: "SMITH, John (Mr)", NHS No. 3-3-4, "Known allergies" / "No known allergies" / "Allergies not recorded" / "Allergies unavailable" (PAB-0064).
- AU: family name upper case, no title (AU-PI-02); IHI first then URN (G10 1.6); "Allergies: Nil known", "Allergies: Unknown", "Allergies: Not recorded" with the last two styled as warnings (AU-AL-01); optional DD/MM/YYYY (AU-PI-03); My Health Record state (G12 2).
- NZ: name as recorded with macrons (G11 2.3), NHI unbroken and test or dormant NHIs flagged (G11 1.3, G12 4), "Allergies and adverse reactions" / "No known allergies or adverse reactions" (G11 9.2, wording [UNCERTAIN]).
- Wording data: `ALLERGY_STATUS_TEXT`, `PATIENT_NAME_RULES` (patient area) and `MOBILE_ALLERGY_SHORT_LABEL`.

## Do and don't

- Do supply `similarNames` from your ward census.
- Don't put the bed number in place of an identifier, and don't hide the header while scrolling.

## Accessibility

- `header` landmark named "Patient"; every value has a visible label.
- The allergy chip uses an icon and words, never colour alone; the short chip keeps the full wording as its accessible name.
- Expand button: `aria-haspopup="dialog"`, `aria-expanded`.
