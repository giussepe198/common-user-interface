# Select

A native drop-down list styled to the tokens: one bordered box at the control height with a chevron inside.

## When to use
- One choice from a medium-sized fixed list where radios do not fit.
- Not when missing an option has patient-safety implications, when there are few options and space for radios, or when the list is used rarely and its label is not understood by all users (CNA-2030): use RadioGroup. For long or searchable lists use Combobox.

## What you provide
- Put it in a `FormField`. `options` (`FormOption[]`; adjacent options with the same `group` become an optgroup), `value` and `onChange(value)` or `defaultValue`, `placeholder` (default "Please specify"; `null` removes the empty option), `widthChars`.

```tsx
<FormField label="Preferred contact"><Select options={contactMethods} /></FormField>
```

## Guidance implemented
- CNA-2030 [M] when not to use a list box (see above).
- CNA-2040 [M] options in a logical order (the consumer's order is kept; nothing is sorted).
- CNA-2050 [R] 'None' or 'All' first: put them first in `options`.
- [suggested] An empty first option ("Please specify") so nothing is chosen for the user (no default clinical value, as ClinicalRadioGroup); shown grey italic like a prompt (CNA-2100).
- CNA-2060 [R] sentence case labels (consumer supplied).

## Regional behaviour
None. Value sets that differ by region come from the host or the patient area.

## Do and don't
- Do keep options short and distinct.
- Don't rely on alphabetical order where a clinical order exists (CNA-2040).

## Accessibility
- The native `select`: platform keyboard and screen reader behaviour, named by FormField's label. The chevron is decorative.
- 44px high on coarse pointers through `--control-height`.
