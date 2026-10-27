# MeasuredValueInput

Value and unit entry for a measured concept such as body temperature or blood pressure.

## When to use
- When a coded observable needs a value (Terminology Elaboration 2.3), inside an encoding dialog or a template.

## What you provide
- `conceptLabel`, `fields` (name, label, allowed `units` with ranges, `composite` for "120/80").
- `values`/`onValuesChange`, `confirmed`/`onConfirmedChange` (or defaults).

```tsx
<MeasuredValueInput conceptLabel="Body temperature"
  fields={[{ name: 't', label: 'Temperature value', units: [{ unit: '°C', min: 25, max: 45 }] }]} />
```

## Guidance implemented
- Elaboration 2.3.2 (preliminary): the default unit is offered but never a default value; values are checked when focus leaves the field and the message says how to correct them (for example 398 instead of 39.8); typing a value ticks the confirmation; confirming without a value warns "You should enter values".
- Rendered result "Body temperature = 39.8 °C".
- Parsing and range checks use `parseValueWithUnit`.

## Do and don't
- Do set realistic `min`/`max` per unit; they drive the range check.
- Don't accept a value outside the range without correction.

## Accessibility
- A fieldset with the concept as legend; each value has a visible label; the unit select is labelled; errors are linked with `aria-describedby` and set `aria-invalid`.
