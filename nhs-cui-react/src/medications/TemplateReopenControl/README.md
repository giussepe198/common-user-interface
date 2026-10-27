# TemplateReopenControl

The "Template Prescriptions" control that reopens the template list after a template has been applied, and highlights the fields the template filled.

## When to use

- Beside the dose and frequency group of a prescription form once a template has been applied. PrescriptionDetailForm shows it when `onOpenTemplates` is given.

## What you provide

```tsx
const [highlight, setHighlight] = useState<string[]>([]);
<TemplateReopenControl
  definedFieldIds={['dose', 'frequency', 'duration']}
  fieldNames={{ dose: 'Dose', frequency: 'Frequency', duration: 'Duration' }}
  appliedTemplate="DOSE 250 mg twice a day"
  onOpen={reopenTemplates}
  onHighlightChange={setHighlight}
/>
// add className "cui-template-defined" to fields in `highlight`
```

## Guidance implemented

- MSP-1250 [M]: works with editable pre-filled fields (the form's).
- MSP-1260, MSP-1270 [M]: a control to reopen the template list and choose another template; default label "Template Prescriptions".
- MSP-1280, MSP-1290 [R]: while the control has focus or the pointer, the template-defined fields are highlighted (`cui-template-defined`, a dashed accent outline).
- [suggested] The applied template is named on the control.

## Do and don't

- Do clear the highlight when the control loses focus and pointer (the component reports `[]`).

## Accessibility

- A button with `aria-haspopup="listbox"`; its description lists the fields the template filled. The highlight is an outline, not colour fill alone.

## Regional behaviour

- None: the same in GB, AU and NZ.
