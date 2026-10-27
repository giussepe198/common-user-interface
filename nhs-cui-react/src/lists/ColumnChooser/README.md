# ColumnChooser

A panel for choosing which columns a list shows and in what order, with locked key identifier columns and role-based column sets.

## When to use

Beside or inside a settings popover for `PatientList` (feed its `value` to `visibleColumnIds`). The guidance does not specify the method or appearance, so this panel is one acceptable design `[suggested]`.

## What you provide

```tsx
<ColumnChooser
  columns={[{ id: 'bed', title: 'Location', locked: true }, { id: 'patient', title: 'Patient', locked: true }, { id: 'news', title: 'NEWS2 score' }]}
  presets={[{ id: 'nurse', label: 'Ward nurse', columnIds: ['news', 'tasks'] }]}
  value={visible}
  onChange={setVisible}
/>
```

## Guidance implemented

- PAL-0710 [R] users choose the displayed columns and their order, except the row key identifier columns.
- PAL-0720 [M] key identifier columns (patient identification, location) cannot be removed: they are locked, shown first and labelled "Always shown".
- PAL-0730 [R] role-based default column sets via `presets`; the list shows "Custom" when the user changes a set.
- PAL-0790 [R] persist the selection between sessions: store what `onChange` gives you.

## Do and don't

- Do mark patient identification and location columns as `locked`.
- Don't offer a way to hide the patient identification column.

## Accessibility

- Real checkboxes with labels. Move buttons have full names ("Move Age left") and keep focus after moving.
- Changes are announced in a polite live region ("Age moved to position 4").
- The lock is shown with an icon and the text "Always shown", not colour.
