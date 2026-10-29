# CheckboxGroup

Independent check boxes under one label, laid out as a three-slot field so it lines up in FormRow and FormGrid.

## When to use
- Several independent choices from ten or fewer options in general forms.
- For clinical noting (sentence casing, frequency ordering, reveal announcements) use ClinicalCheckboxGroup. That control renders a fieldset, whose legend cannot share a row's label track, so this general group uses a labelled `role="group"` instead.

## What you provide
- `label`, `options` (`FormOption[]`), `value` and `onChange(values)` or `defaultValue`, `orientation`, `prompt`, `required`, `missed`, `error`, `name`, `disabled`.

```tsx
<CheckboxGroup label="Contact by" options={[{ value: 'phone', label: 'Phone' }, { value: 'sms', label: 'Text message' }]} />
```

## Guidance implemented
- CNA-1970 [M] independent choices; CNA-1980 [R] 10 or fewer; CNA-1990 [M] logical order (kept as given).
- CNA-2000 [R] vertical by default; `orientation="horizontal"` wraps.
- CNA-2020 [M] every box labelled, no indeterminate state; CNA-2070 [R] similar label lengths.
- CNA-1080 [R] required asterisk by the label; CNA-1160..1180 [R] missed shading, icon and screen-reader text.
- CNA-2120 [R] prompt below the options.

## Regional behaviour
None.

## Do and don't
- Do keep options short and similar in length.
- Don't nest check boxes or radios inside options (CNA-1940).

## Accessibility
- `role="group"` named by the visible label, described by the prompt, missed text and error (polite live region).
- Native check boxes: Tab moves between them, Space toggles. 44px targets on coarse pointers.
