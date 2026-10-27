# PrescriptionPreview

A read-only summary of a prescription, shown before it is authorised, with "Close Preview" and "Authorise".

## When to use

- After the user presses Preview in a prescription form. PrescriptionForm includes it by default; use it directly when you build your own form.
- Compulsory before Authorise when the form spans more than one screen or tab (MSP-2220); optional otherwise (MSP-2210).

## What you provide

```tsx
<PrescriptionPreview
  medication={{ genericName: 'diltiazem', brandName: 'Dilzem SR', form: 'modified-release capsule',
    dose: { value: 60, unit: 'mg' }, route: 'oral', frequency: 'twice a day' }}
  administrationTimes={['08:00', '20:00']}
  firstDose="Today 20:00"
  duration="ongoing"
  details={[{ label: 'Reason for prescribing', value: 'hypertension' }]}
  canAuthorise={complete}
  onClose={backToForm}
  onAuthorise={authorise}
/>
```

## Guidance implemented

- MSP-2190 [M]: shows every value defined; pass anything extra through `details`.
- MSP-2200 [M]: drug details as a MedicationLine, with administration times and first dose appended as in the guidance example (`scheduleInLine`, default true).
- MSP-2230 [R]: the line wraps and is never wider than 120 characters.
- MSP-2240 [R]: administration times also listed vertically, with the first dose in bold (MSP-2110) and labelled.
- MSP-2160 [R]: `firstDoseLabel` is "first dose" or "starting from".
- MSP-2250, MSP-2260 [M]: "Close Preview" returns to the form and gets focus when the preview opens.
- MSP-2280, MSP-2300, MSP-2310 [M]: "Authorise" exactly, never focused by default, disabled until complete.
- `authoriseBlockedReason` [suggested]: Authorise disabled with the reason shown and referenced by `aria-describedby`.
- Study 67 [R]: structured schedule shown beneath the sentence.
- "Not yet prescribed: check the details, then authorise." status text [suggested].

## Do and don't

- Do keep the form's values intact while the preview is open, so closing it loses nothing (MSP-1410).
- Don't auto-focus Authorise or place it before Close Preview.

## Accessibility

- A labelled `section` with a heading; details are a description list (`dl`).
- Focus moves to "Close Preview" on open (`autoFocus`, default true).

## Regional behaviour

- The medication line follows the region (see MedicationLine README): AU 16-element order with route before "DOSE", Title Case italic brand and "SUPPLY"; NZ HQSC units and whole numbers; GB unchanged.
- `tallManLettering` overrides the regional default (on for AU and NZ).
