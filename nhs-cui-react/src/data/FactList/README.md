# FactList

Read-only facts as label and value pairs, built by composing `LabelledValue` from the patient area.

## When to use

Use it for the details of one record: a referral's source and dates, an episode's team and keyworker, a report run's parameters. Use `DataTable` for many records.

## What you provide

```tsx
<FactList
  aria-label="Referral details"
  layout="grid"
  items={[
    { label: 'Source', value: 'GP' },
    { label: 'Received', value: '20-Oct-2026' },
    { label: 'Reason', value: longText, wide: true },
    { label: 'Keyworker', value: null, unknownText: 'Not allocated' },
  ]}
/>
```

`layout` 'grid' (label above value, as many columns as fit, `minColumnWidth`) or 'rows' (label beside value, stacking in a narrow container). Items take `definition` (tooltip on the label) and `onOpenRecord` (the value opens that part of the record).

## Guidance implemented

- PAB-0042/0044 [M] labels in label style without a colon (LabelledValue removes a trailing colon).
- PAB-0045/0046 [M] values in data style.
- PAB-0019 [M] a missing value shows "Not Known" (or the given words), never "?" or a blank.
- PAB-0047 [R] a definition on the label as a keyboard-accessible tooltip; PAB-0048 [R] a value can open its part of the record.
- Grid and rows layouts, wide items and the container query are [suggested].

## Regional behaviour

None in the control. Pass values already formatted by the regional display controls.

## Do and don't

- Do format dates, names and identifiers with the library's display controls before passing them.
- Don't shorten values; they wrap.
- Don't put editable fields in a FactList; use a form.

## Accessibility

A list (`ul`) with an optional accessible name; each item reads label then value. Definitions are reachable by keyboard. The rows layout stacks under 400px so nothing scrolls sideways.
