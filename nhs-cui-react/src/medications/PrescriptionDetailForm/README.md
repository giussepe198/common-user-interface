# PrescriptionDetailForm

The detailed (full) prescription form: drug name and route at the top, "Drug Details" and "Administration Schedule" tabs, labels on the left, and inter-related fields that clear when they conflict.

## When to use

- When the prescriber chooses "Full Prescription Form" or "other..." from a cascade or template list, or for prescriptions that need optional fields.
- For quick prescribing in a strip, use PrescriptionForm (sentence layout); `onGoBack` returns to it.

## What you provide

```tsx
<PrescriptionDetailForm
  drug={{ genericName: 'clarithromycin' }}
  options={{
    route: [{ value: 'oral' }],
    strength: [{ value: '250 mg', doses: ['250 mg', '500 mg'] }, { value: '500 mg', doses: ['500 mg', '1 g'] }],
    dose: [{ value: '250 mg' }, { value: '500 mg' }, { value: '1 g' }],
    frequency: [{ value: 'twice a day' }],
    administrationTimes: [{ value: '08:00; 20:00', supplementary: 'Standard times' }],
    firstDose: [{ value: 'Today 20:00' }],
    duration: [{ value: '7 days' }],
  }}
  optionalFields={[{ id: 'reason', addLabel: 'Add a Reason for Prescribing', label: 'Reason', prompt: 'Select or enter a reason for prescribing', options: [], allowOther: true, promoted: true }]}
  templateFieldIds={['dose', 'frequency']}
  onOpenTemplates={reopenTemplates}
  onEditDrugAndRoute={reopenCascade}
  onGoBack={backToQuickForm}
  onAuthorise={authorise}
/>
```

Also: `relations` for further inter-related fields, `getPrefill`, `allowOther`, `requiredFields`, controlled `values` and `tab`. Utility: `resolvePrescriptionConflicts`.

## Guidance implemented

- MSP-1550, MSP-1680 [M]: drug name and route at the top, sticky while the form scrolls.
- MSP-1640, MSP-1650 [R]: drug and route in one control offering "Edit drug name and route".
- MSP-1580 [M]: until the route is chosen only drug and route are shown (no disabled fields).
- MSP-1590, MSP-1600 [M]: required fields shown by default; optional ones via "Add ..." controls in place (MSP-1760 [M], MSP-1790 [R]); promoted fields required with "None (leave blank)" (MSP-1720, MSP-1730 [R]); "Remove" returns them to the control (MSP-1800 [R]).
- MSP-1610, MSP-1620 [M]: tabs "Drug Details" and "Administration Schedule"; each tab shows how many required fields are left [suggested].
- MSP-1530 [M], MSP-1690, MSP-1700, MSP-1710: fixed field order, sections with labels ("Strength, Form and Device", "How Much and When", "Administration", "Course Duration").
- MSP-1560 [R]: labels left and right-aligned, fields left-aligned.
- MSP-1660, MSP-1670 [M]: no disabling to impose order; lists never open by themselves.
- MSP-2070, MSP-2090, MSP-2100 [M]: dose labelled "DOSE"; strength labelled; strength and dose never side by side.
- MSP-1970, MSP-1980 [M/R]: with `doses` on strength options, invalid doses are listed under "For other strengths" and invalid strengths under "For other doses" [suggested heading].
- MSP-1990 [M], MSP-2010 [R]: choosing a conflicting value clears the other field, which shows "Cleared: select again" and is announced; without dose data any strength or dose change clears the other.
- MSP-2050 [M], MSP-2040, MSP-2060 [R]: pre-filled fields highlighted.
- MSP-2110, MSP-2120: first administration time bold; above 6 a day no horizontal list.
- MSP-2160 [R]: "Starting From" replaces "First Dose" for as-required prescriptions.
- MSP-1260 to MSP-1290: TemplateReopenControl in the dose and frequency section highlights template-defined fields.
- MSP-1360, MSP-1410 [M]: "Go Back" keeps every value (values live in the consumer or the component state).
- MSP-2220 [M]: details span two tabs, so Authorise stays disabled until the current values have been previewed; MSP-2270 to MSP-2310 [M]: Preview before Authorise, exact label, bottom right, never default focus, disabled until complete.
- `authoriseBlockedReason` [suggested]: hold Authorise while something outside the form is unresolved, for example an unanswered High Priority alert. Authorise is disabled, the reason is shown under the commands (warning icon and text) and referenced by the button's `aria-describedby`, and the status reads "Not yet prescribed: authorise on hold" instead of "ready to authorise". The built-in preview is held too.

## Do and don't

- Do supply option lists already limited to the drug and route.
- Do supply `doses` per strength when known, so only real conflicts are cleared.
- Don't change values behind the prescriber's back without `getPrefill` (which highlights them).

## Accessibility

- Tabs follow the ARIA tabs pattern (Left, Right, Home, End). Every field has a visible label. Cleared fields are announced in a polite live region and marked with an icon and text, not colour alone.

## Regional behaviour

- The drug and route control and preview follow the region: AU mixed-case lettering and ACSQHC rules, route abbreviations written in full ("PO" shows "oral"); NZ HQSC Tall Man lettering and DO NOT USE rules; GB unchanged.
- Option values are shown as supplied: give AU and NZ options in full words and regional units.
