# ExampleDesktopClinicalNote

A structured note after an inpatient fall: choice groups with a data-triggered reveal, blood pressure with previous values, a calculated Morse Fall Scale, coded past history and diagnosis from an asynchronous terminology search, a body diagram and abbreviation-checked free text. Save lists any required field still empty.

## Components used

- PatientBanner
- FormField
- ClinicalRadioGroup
- ClinicalCheckboxGroup
- RevealSection
- PreviousValuesPopover
- CalculatedValue
- NoteEntryList
- TerminologySearch
- AnnotatedGraphicCanvas
- AbbreviationCheckedTextArea
- RequiredKey
- MissedRequiredFieldsPanel

## Source

`examples/desktop-clinical-note.tsx` in the package. Open `docs/site/desktop-clinical-note.html` locally to switch region (GB, AU, NZ) and theme.
