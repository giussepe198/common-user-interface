# FormGrid

A grid of fields in a set number of columns that keeps every visual line aligned; `FormGridSpan` widens one field.

## When to use
- A form section with several fields laid out in two or more columns (for example a person's contact details).
- For one line of related fields use `FormRow`.

## What you provide
- `columns` (1 to 6, default 2) and fields as children, filled row by row (the same children as `FormRow`).
- `FormGridSpan` with `span` (a number or `'full'`) around one field to widen it, for example a TextArea across the whole line.

```tsx
<FormGrid columns={3}>
  <FormField label="Preferred name"><TextInput /></FormField>
  <FormField label="Pronouns"><Select options={pronouns} /></FormField>
  <FormField label="Date of birth"><DateInput label="Date of birth" bare /></FormField>
  <FormGridSpan span="full"><FormField label="Notes"><TextArea /></FormField></FormGridSpan>
</FormGrid>
```

## Guidance implemented
- [suggested] The alignment rule, exactly as FormRow: every field is a subgrid of three row tracks (label, control, feedback); labels sit at the end of the label track; controls share the control track; prompts and errors never push a control.
- CNA-0710 [M] tab order follows the visual order (row by row, document order).
- [suggested] Responsive with its own width (container queries): at most 3 columns below 64rem, at most 2 below 48rem and 1 below 30rem. Spans are clamped to the columns the grid has at its width, so a span never adds a column.

## Regional behaviour
None.

## Do and don't
- Do order fields so that reading row by row makes sense; the order is kept when the grid collapses.
- Do use `FormGridSpan span="full"` for text areas and long single fields.
- Don't put a FormGrid inside a FormGrid; use a `Fieldset` per section instead.

## Accessibility
- No semantics unless given `aria-label` (then `role="group"`); each field keeps its own label and descriptions.
- One column at 320px with no horizontal scroll; 44px controls on coarse pointers through `--control-height`.
