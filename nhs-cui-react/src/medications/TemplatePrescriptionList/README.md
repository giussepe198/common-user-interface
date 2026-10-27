# TemplatePrescriptionList

Template prescriptions offered once drug and cascade selections are complete, each starting with the dose.

## When to use

- After CascadeSelector completes, to pre-fill dose, frequency and other values in one step.

## What you provide

```tsx
<TemplatePrescriptionList
  templates={[
    { id: 't1', dose: { value: 250, unit: 'mg' }, attributes: ['twice a day', 'for 7 days'], definesFields: ['dose', 'frequency', 'duration'] },
    { id: 't2', brandName: 'Dilzem SR', dose: { value: 60, unit: 'mg' }, attributes: ['three times a day'], supplementary: '12-hourly preparation' },
  ]}
  onSelect={applyTemplate}
  onSkipToForm={openForm}
/>
```

Utilities: `formatTemplatePrescription(t, style, region)` and `findNearDuplicateTemplates(templates)` (check configured sets for MSP-1170).

## Guidance implemented

- MSP-1030, MSP-1040 [M]: show only when the cascade is complete (consumer).
- MSP-1110 [M], MSP-1120 [R]: no column headings; attributes combined in one column.
- MSP-1130 [M]: each row begins "DOSE" and the dose; `doseLabel` for VOLUME or RATE.
- MSP-1140 [R]: `layout="medicationLine"` joins with " – " where space is limited.
- MSP-1150 [M]: rows wrap, never scroll sideways.
- MSP-1200 [R]: brand first with a double space ("DILZEM SR  DOSE 60 mg three times a day").
- MSP-1210 [R]: supplementary text in grey italics.
- MSP-1230, MSP-1240 [M]: "other..." last, below a line, goes to the form.
- MSP-0880, MSP-1070: `placement` right or below.
- [suggested] Small caption "Template prescriptions" above the list; alternate shading.

## Do and don't

- Do keep templates few and distinct (MSP-1050, MSP-1170).
- Don't put templates in a Quick List (MSP-0130).

## Accessibility

- A `listbox` named by its caption; Up, Down, Home, End move; Enter or Space selects. `autoFocus` moves focus to the first template.

## Regional behaviour

- Doses use the regional formatter: AU and NZ move mass doses below 1 to a smaller unit ("0.5 g" shows "500 mg"), spell units in full ("microgram", "units") and write half tablets in words. AU brands are Title Case italic with mixed-case lettering; NZ Title Case; GB capitals.
