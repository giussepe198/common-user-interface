# FormField

Wraps a single input with its label, prompt text, required indicator, missed-field state and error message, following the clinical noting rules for labels and prompts.

## When to use
- Any single text, number, select or text area field on a clinical form.
- Use `ClinicalRadioGroup` or `ClinicalCheckboxGroup` for choice groups (they render their own fieldset).

## What you provide
- `label` (string or node), and one input element as the child, or a render function that receives the control props.
- Optional `prompt` with `promptPlacement` (`below`, `right` or `in-field`), `required`, `missed`, `error`, `labelPosition` (`top` or `left`).

```tsx
<FormField label="Respiration rate" labelPosition="left" required missed={isMissed('rr')} prompt="Breaths per minute" promptPlacement="right">
  <input id="rr" inputMode="numeric" />
</FormField>
```

- A child element gets `id`, `aria-describedby` (merged with its own), `aria-invalid`, `aria-required` and, for an in-field prompt, `placeholder`; props FormField has no value for are not passed, so the child's own `placeholder` is kept. Composite controls work as children when they put `id` on their input: `TerminologySearch` does (leave out its `label`). A child's `inputId` is used as the id when neither has an `id`.

- Three slots in a row: FormField renders its label, control and feedback as its only children (`data-slot="label"`, `"control"`, `"feedback"`, root `data-cui-field`). Inside `FormRow` or `FormGrid` (forms area) each becomes a subgrid item: labels share one track and sit at its end, controls share the next track, and prompts below and errors share the feedback track, so they never push a control. Outside a row the slots stack as before. `labelPosition="left"` is ignored inside a row.
- Forms controls (`TextInput`, `Select`, `Combobox`, `MultiSelect`, `TextArea`, `Switch`, `FileInput`, `SearchInput`) and the datetime inputs in `bare` mode are designed as children. Controls that draw their own box mark it `data-cui-box` (and their input `data-cui-boxed`), and the error and missed states shade the box instead of the input inside it.

## Guidance implemented
- CNA-0440 [M] every field has a visible label; CNA-2060 [R] labels in sentence case (applied to string labels, `preserveWords` keeps proper nouns).
- CNA-2090 [R] prompts where needed; CNA-2100 [R] prompts grey italic; CNA-2110 [M] prompt text is not editable.
- CNA-2120 [R] prompt below or right of the field when there is space; CNA-2130 [R] in-field prompt when space is limited; CNA-2140/2150 [R] the in-field prompt stays on focus and goes when data is typed (native placeholder behaviour); CNA-2160 [R] no examples in in-field prompts (development warning).
- CNA-1080 [R] red asterisk; CNA-1110 [R] immediately right of the label; with `labelPosition="left"` labels are right-aligned so asterisks line up; CNA-1120 [M] consistent position; CNA-1130 [R] stays after the field is filled.
- CNA-1160 [R] yellow shading on missed required fields; CNA-1170 [R] plus a warning icon, not shading alone; CNA-1180 [R] screen-reader text "Required field not completed".
- CNA-0710 [M] tab order follows the visual order (label, field, prompt are in document order).

## Do and don't
- Do pair asterisks with a `RequiredKey` on the same page (CNA-1100).
- Do keep prompts short and about the type of data.
- Don't put examples in an in-field prompt; put them in a prompt below the field.
- Don't block the user on a missed field; show it and let them carry on.

## Accessibility
- The label is a real `label` bound to the control. Prompt, missed text and error are linked with `aria-describedby`; `aria-invalid` is set for errors and missed fields; `aria-required` for required fields.
- The error sits in a polite live region that is always present, so an error that appears is announced without interrupting typing.
- The asterisk is hidden from screen readers and replaced by the word "required".
- Placeholder colour (`--ink-subtle`) is used on `--surface` only.
