# Checkbox

One independent on or off choice with its label beside the box; with `fieldLabel` it becomes a full field for form rows.

## When to use
- A single yes or no statement ("Carer present"), or one setting saved with the form.
- For several related choices use CheckboxGroup; for clinical noting groups use ClinicalCheckboxGroup.

## What you provide
- `label` (required), optional `description`, `checked` and `onChange(checked)` or `defaultChecked`.
- In a FormRow or FormGrid give `fieldLabel` (and optionally `prompt`, `error`, `required`, `missed`) instead of wrapping it in FormField, which would label it twice.

```tsx
<FormRow>
  <FormField label="Next review"><DateInput label="Next review" bare /></FormField>
  <Checkbox fieldLabel="Consent" label="Person agreed to share with their GP" required />
</FormRow>
```

## Guidance implemented
- CNA-1950 [M] the cleared state is the unambiguous opposite of ticked; unticked by default.
- CNA-1960 [R] only for on/off choices; CNA-1970 [M] independent.
- CNA-2020 [M] every check box is labelled; no mixed or indeterminate state.
- CNA-2080 [R] positive phrasing (consumer supplied).
- CNA-1160..1180 [R] missed state in field mode: yellow outline, icon and screen-reader text.

## Regional behaviour
None.

## Do and don't
- Do phrase the label positively ("Carer present", not "No carer").
- Don't use a check box for a choice that needs a recorded "No": use RadioGroup.

## Accessibility
- A native check box with a `label`; the description is linked. In field mode the field label names a `role="group"` and the prompt and error are linked to the box.
- The whole label is the target; at least 44px high on coarse pointers.
- A disabled box greys its label only; its description keeps the muted text colour, so a reason or a read-only list stays readable (WCAG 1.4.3) [suggested].
