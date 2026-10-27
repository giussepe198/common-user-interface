# CalculatedValue

Shows a system-calculated value (a score such as an early warning score, or a derived value such as BMI) in bold read-only text, with a link-styled label that opens the details of how it was worked out. Includes `OutOfRangeMarker` for values outside the normal range.

## When to use
- Any value the system calculates from entered or recorded data.
- `OutOfRangeMarker` on its own next to contributing fields.

## What you provide
- `label`, `value`, optional `unit`, `decimals`, `meaning`, `scoringSystem`, `normalRange`.
- `status`: `complete`, `partial` or `cannotCalculate`; `contributors` (label, value, section, field id, assumed, out of range).
- Optional `onOpenDetails` (the "Details of scoring" button) and `onNavigateToField`.

```tsx
<CalculatedValue label="Early warning score" value={5} status="partial" meaning="Medium risk"
  scoringSystem="National Early Warning Score 2" contributors={contributors} onOpenDetails={openScoring} />
```

## Guidance implemented
- CNA-1480 [M] calculated values clearly distinct from entered ones; CNA-1490 [R] bold; CNA-1500 [R] never in an editable field (rendered as `output`).
- CNA-1510 [R] brief meaning next to the value.
- CNA-1520 [R] details list contributing values, where they were entered, values from the record and the scoring system.
- CNA-1530/1540 [R] label opens a dialog over the form; CNA-1550 [R] dialog is labelled; CNA-1560 [R] focus moving away closes it (Esc also closes); CNA-1570/1580/1590 [R] label uses link style and changes on hover; CNA-1600 [R] "Details of scoring" button is focused when the dialog opens.
- CNA-1610 [R] in-line out-of-range markers (red circle with arrow and text alternative).
- CNA-1620 [R] partial scores only when you pass `status="partial"` (your clinical authority decides); CNA-1630 [M] assumptions communicated; CNA-1640 [R] a partial score is never shown without its "Partial score: values missing" label.
- CNA-1650 [R] when it cannot be calculated, a message plus access to details; CNA-1660/1670 [R] the dialog lists missing values with links to their fields.
- Wording of the partial and cannot-calculate messages is [suggested].

## Do and don't
- Do calculate in your own code and pass the status honestly: this component does not compute scores.
- Don't show a partial score for values such as BMI where a partial result is meaningless.

## Accessibility
- The label is a `button` with `aria-expanded`; the dialog has `role="dialog"` and a heading.
- The value's accessible name includes "partial" when relevant. Out-of-range markers carry text ("Above normal range"), never colour alone.
