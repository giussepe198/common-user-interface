# RadioGroup

One choice from a short list as native radio buttons, laid out as a three-slot field for FormRow and FormGrid.

## When to use
- One choice from 2 to 7±2 options where all options should be visible (preferred over Select when a missed option matters, CNA-2030).
- For clinical noting use ClinicalRadioGroup (fieldset, ordering, reveal announcements).

## What you provide
- `label`, `options`, `value` (`string | null`) and `onChange(value)` or `defaultValue`, `orientation`, `prompt`, `required`, `missed`, `error`, `name`, `disabled`.

```tsx
<RadioGroup label="Interpreter needed" orientation="horizontal"
  options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unknown', label: 'Not known' }]} />
```

## Guidance implemented
- CNA-1880 [R] 2 to 7±2 options; CNA-1890 [M] logical order; CNA-1900 [R] same sets in the same order (consumer).
- CNA-1910 [R] vertical by default.
- CNA-1930 [R] first option default: deliberately not followed [suggested]; nothing is chosen until the user decides, as ClinicalRadioGroup, so no value is recorded without a decision.
- CNA-1940 [R] no nesting.
- CNA-1080, CNA-1160..1180 [R] required and missed states.

## Regional behaviour
None.

## Do and don't
- Do include "Not known" where the answer may be unknown, rather than leaving the group empty.
- Don't use radios for independent choices.

## Accessibility
- `role="radiogroup"` named by the visible label, with `aria-required` and `aria-invalid`; native radios share one name, so Tab enters the group and the arrow keys move and choose.
- Errors are in a polite live region and linked with `aria-describedby`.
