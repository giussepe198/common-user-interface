# TextInput

Single-line text entry in one bordered box at the control height, with an optional prefix or unit inside the box.

## When to use
- Short free text and numbers: names, references, quantities with a unit.
- Not for identifiers, dates, times, durations or phone numbers: use NhsNumberInput, MedicareNumberInput, IhiInput, NhiInput, DateInput, TimeInput, DurationInput and TelephoneNumberInput (patient area). Phone numbers are not duplicated here.

## What you provide
- Put it in a `FormField` for its label, prompt, required mark and error. FormField passes `id`, `aria-describedby`, `aria-invalid`, `aria-required` and an in-field prompt as `placeholder`.
- `value` and `onChange(value)` or `defaultValue`; optional `type`, `prefix`, `suffix`, `widthChars`, `invalid`; any native input attribute.

```tsx
<FormField label="Weight" prompt="Kilograms" promptPlacement="right">
  <TextInput type="number" suffix="kg" widthChars={6} />
</FormField>
```

## Guidance implemented
- CNA-0440 [M] every field has a visible label (through FormField).
- CNA-2100 [R] prompts grey italic: the in-field prompt uses `--ink-subtle` italic; CNA-2140/2150 [R] it stays on focus and goes when typing (native placeholder).
- CNA-0200 pattern [R]: `widthChars` sizes the box to the expected value.
- [suggested] Prefix and unit sit inside the border and are read with the field (aria-describedby). Height from `--control-height`; numbers right-aligned with tabular figures.
- CNA-1160..1180 [R] missed required field: FormField shades the box yellow and adds an icon and screen-reader text.

## Regional behaviour
None. Region-specific values have their own controls in the patient and datetime areas.

## Do and don't
- Do give units as `suffix`, not in the label only.
- Don't use the in-field prompt for examples (CNA-2160); put examples in a prompt below.
- Don't set a height or border on it; tokens do that.

## Accessibility
- A real `input` named by FormField's `label`. Prefix and suffix are linked descriptions. Invalid state is `aria-invalid` plus FormField's message with an icon, never colour alone.
- Focus ring around the whole box; 44px high on coarse pointers.
