# FormRow

Puts fields side by side so that their controls always sit on one line, whatever the labels, prompts or errors do.

## When to use
- Two to six related fields that belong on one line, such as family name and given name, or dose and unit.
- For a longer form laid out in columns use `FormGrid`. Side-by-side fields go only in `FormRow` or `FormGrid`, never in a hand-made flex row.

## What you provide
- Fields as children: `FormField` (around TextInput, Select, Combobox, MultiSelect, Switch, FileInput, SearchInput, or a datetime input with `bare`), `CheckboxGroup`, `RadioGroup`, or `Checkbox` with `fieldLabel`. Every child must have the three slots; a bare control or a button is not a field.
- Optional `columns` (default: the number of fields), `template` (for example `"2fr 1fr"`), `aria-label` when the row is a group of its own.

```tsx
<FormRow template="2fr 1fr">
  <FormField label="Family name" required><TextInput /></FormField>
  <FormField label="Given name"><TextInput /></FormField>
</FormRow>
```

## Guidance implemented
- [suggested] The alignment rule: each field spans the row's three row tracks as a CSS subgrid, so the label track is as tall as the tallest label and labels sit at its end, all controls share the control track and start at its top, and prompts and errors sit in the feedback track below and never push a control. A two-line label beside a one-line label leaves both controls level.
- CNA-0710 [M] tab order follows the visual order: fields are in document order and the layout never reorders them.
- CNA-2120 [R] prompts sit below the field (feedback track) or to its right (inside the control slot).
- [suggested] Responsive with its own width: container queries, not the viewport. One column below 30rem; rows of four or more fields go to two columns below 48rem.
- [suggested] Control heights come from `--control-height` (32px compact, 40px under `[data-density="standard"]`, 44px on coarse pointers), so fields in a row stay the same height in every density.

## Regional behaviour
None: the layout is the same in GB, AU and NZ.

## Do and don't
- Do keep a row to fields that belong together; a long label is fine (it wraps and the controls stay level).
- Do wrap DateInput, TimeInput and DurationInput in FormField with `bare`, so the field has the three slots.
- Don't put a FormRow inside a FormRow, or a button in a row; put actions after the row.
- Don't set heights or margins on fields to line them up: the subgrid does it.

## Accessibility
- The row adds no semantics unless given `aria-label` (then `role="group"`). Each field keeps its own label, description and error links.
- Reflows to one column at 320px with no horizontal scroll; works at 200% zoom because it responds to its own width.
