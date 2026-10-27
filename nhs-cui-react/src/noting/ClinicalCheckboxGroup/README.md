# ClinicalCheckboxGroup

A labelled group of independent check boxes for on/off choices, with no mixed or indeterminate state.

## When to use
- Several independent yes/no selections (for example associated symptoms), 10 or fewer.
- Not for mutually exclusive answers: use `ClinicalRadioGroup`.

## What you provide
- `legend`, `options` (same shape as `ClinicalRadioGroup`), and `value`/`onChange` (array of values) or `defaultValue`.

```tsx
<ClinicalCheckboxGroup legend="Associated symptoms" prompt="Tick all that apply"
  options={[{ value: 'cough', label: 'Cough' }, { value: 'cp', label: 'Chest pain', reveals: true }]}
  value={symptoms} onChange={setSymptoms} />
```

## Guidance implemented
- CNA-1950 [M] cleared state is the unambiguous opposite of selected; CNA-2020 [M] every check box labelled; no mixed or tri-state option is offered.
- CNA-1960 [R] on/off only; CNA-1970 [M] boxes are independent (selection order follows option order).
- CNA-1980 [R] 10 or fewer (development warning); CNA-1990 [M] logical order (`ordering`); CNA-2000 [R] vertical by default.
- CNA-2010 [M] ticking an option with `reveals` announces the new fields.
- CNA-2060 [R] sentence case; CNA-2070 [R] keep labels a similar length; CNA-2080 [R] positive phrasing (development warning for labels starting "Do not", "Not", "Never").
- Nothing is ticked by default [suggested], so no finding is recorded without a decision.

## Do and don't
- Do phrase options positively ("Smoker", not "Not a non-smoker").
- Don't use a check box for a question whose unticked state is ambiguous; use radios with explicit answers.

## Accessibility
- Real `fieldset`, `legend` and `label` elements; Space toggles. Prompts and messages are linked with `aria-describedby`.
