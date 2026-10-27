# PrescriptionForm

A prescription form in sentence layout for one drug: route, strength, dose, frequency, administration times, first dose and duration, with optional fields, an incomplete indicator and a Preview and Authorise command bar.

## When to use

- After a drug has been chosen (for example with DrugSearch), in a wide, shallow prescribing area.
- For a tall, column-style detailed form with tabs, build a different layout; this control covers the sentence layout (MSP-1450).

## What you provide

The drug, the option lists relevant to it (you decide what is valid for the drug and route), and handlers.

```tsx
<PrescriptionForm
  drug={{ genericName: 'amoxicillin', form: 'capsule' }}
  options={{
    route: [{ value: 'oral' }, { value: 'intravenous' }],
    dose: [{ value: '250 mg' }, { value: '500 mg' }],
    frequency: [{ value: 'twice a day' }, { value: 'three times a day' }],
    administrationTimes: [{ value: '08:00; 20:00', supplementary: 'Standard times' }],
    firstDose: [{ value: 'Today 20:00' }, { value: 'Tomorrow 08:00' }],
    duration: [{ value: '5 days' }, { value: '7 days' }, { value: 'ongoing' }],
  }}
  getPrefill={(field, v) => (field === 'frequency' && v.frequency === 'twice a day'
    ? { administrationTimes: '08:00; 20:00', firstDose: 'Today 20:00' } : {})}
  optionalFields={[{ id: 'reason', addLabel: 'Add a reason for prescribing', inlineLabel: 'for',
    label: 'Reason for prescribing', prompt: 'Select or enter a reason for prescribing',
    options: [{ value: 'urinary tract infection' }], allowOther: true }]}
  onAuthorise={values => authorise(values)}
  onCancel={close}
/>
```

Also: `values`/`defaultValues`/`onChange`, `allowOther` (fields offering "other..."), `requiredFields`, `stepByStep`, `onPreview`, `builtInPreview`, `title`.

## Guidance implemented

- MSP-1310, MSP-1580, MSP-1660 [M]: only the drug and route are shown until a route is chosen; no disabled placeholder fields.
- MSP-1450 to MSP-1520 [M/R]: sentence layout; labels inside fields ("DOSE 500 mg", "at these times", "first dose", "duration"); fields wrap whole, each group starts a new line, and fields grow and shrink with their value.
- MSP-1530 [M]: fixed field order for every prescription: route, strength, dose, frequency, give when, administration times, first dose, duration, then optional fields.
- MSP-1550, MSP-1680 [M]: the drug name sits at the top in a sticky header.
- MSP-1320, MSP-1330 [M/R]: `stepByStep` shows required fields one at a time; "give when" appears straight after a frequency containing "as required".
- MSP-1390, MSP-2030 [R]: every field can be reopened, even with one option.
- MSP-1400, MSP-1630, MSP-1760, MSP-1790, MSP-1800 [R/M]: optional fields hidden behind "More options"; each "+ Add ..." control sits where the field will appear, in muted text; added fields have a "Remove" item that returns them to their initial state.
- MSP-1720, MSP-1730 [R]: promoted optional fields are required and offer "None (leave blank)", which counts as complete.
- MSP-1740, MSP-1750 [M/R]: empty fields show verb-first prompts ("Select a dose").
- MSP-1820, MSP-1860 [M/R]: "give when" is inserted next to frequency and removed when frequency no longer says "as required".
- MSP-1870, MSP-1890 [M]: Esc closes a list without selecting; reopening never clears other fields.
- MSP-1900, MSP-0940, MSP-0950 [R/M]: free text only after "other...", which is last and separated by a line.
- MSP-1910 [R]: supplementary option text in grey italics ("Standard times").
- MSP-2040, MSP-2050, MSP-2060 [R/M]: `getPrefill` fills dependent fields; automatically changed fields are highlighted with a fill and an icon until the user changes them.
- MSP-2070, MSP-2090, MSP-1520 [M]: dose labelled "DOSE"; strength labelled "strength"; dose and strength are on different lines (MSP-2100).
- MSP-2110, MSP-2120 [M/R]: the first dose time is bold in the times list; more than 6 times a day shows a count instead of a horizontal list.
- MSP-2150, MSP-2160 [R]: "first dose" for regular and "starting from" for as-required medicines.
- MSP-0040 and study note [R]: status text "Incomplete prescription: n required fields to complete", then "Not yet prescribed: ready to authorise"; never "Started".
- MSP-2180, MSP-2270, MSP-2280, MSP-2290, MSP-2300, MSP-2310 [M]: "Preview" before "Authorise" in layout and tab order; label exactly "Authorise"; bottom right; never focused by default; disabled until `canAuthorise` is true. A line under the bar names the fields still needed [suggested].
- `authoriseBlockedReason` [suggested]: hold Authorise while something outside the form is unresolved, for example an unanswered High Priority alert. Authorise is disabled, the reason is shown under the commands (warning icon and text) and referenced by the button's `aria-describedby`, and the status reads "Not yet prescribed: authorise on hold" instead of "ready to authorise". The built-in preview is held too.
- MSP-2250, MSP-2260 [M]: the built-in preview opens with focus on "Close Preview"; closing returns focus to "Preview".

## Do and don't

- Do give only options valid for the drug and route (MSP-0890, MSP-1970), sorted by numeric value for doses [suggested].
- Do use `getPrefill` only where there is a single safe default; type-defining choices must stay explicit.
- Don't use a check box for "as required"; choose it as a frequency.
- Not implemented: cascading lists, template prescriptions and the selection trail (MSP-0850 to MSP-1300), detailed tabbed form (MSP-1580 to MSP-1710), conflict clearing between strength and dose (MSP-1990, MSP-2010: do this in `getPrefill` by returning `undefined` for cleared fields).

## Accessibility

- Each field is a button with `aria-haspopup="listbox"` and an accessible name such as "Dose: 500 mg"; lists support Up, Down, Home, End, Enter, Space and Esc.
- Automatically filled fields say "filled automatically" to screen readers.
- The completion status is a `status` region so changes are announced.

## Regional behaviour

- The drug line and built-in preview follow the region (`region` prop or provider): AU mixed-case lettering and ACSQHC line rules, NZ HQSC rules, GB unchanged.
- Option values are shown as supplied; supply AU and NZ option text in full words ("subcutaneous", "microgram").
