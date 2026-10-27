# SortDialog

A dialog for setting a progressive (multi-level) sort, using plain order words such as "Most recent first".

## When to use

Opened from the Sort command of a `DataToolbar`, a header context menu, or its keyboard command. For a quick single-attribute sort, users can also click a column header in `PatientList`.

## What you provide

```tsx
<SortDialog
  tableName="ward patient list"
  rowNoun="patients"
  attributes={displayedAttributes}
  hiddenAttributes={otherAttributes}
  initial={sort}
  onPreview={setSort}
  onOk={s => { setSort(s); close(); }}
  onCancel={original => { setSort(original); close(); }}
/>
```

Apply the result with `progressiveSort(rows, sort, attributes)`. `PatientList` adds a hidden column when the sort uses it.

## Guidance implemented

- FSG-0075 [M] user-specified sorting; FSG-0076 sort dialog; FSG-0078 [R] title includes the table name.
- FSG-0080 the sort line is never split; FSG-0090/0091 [R] labels "1 – Sort patients by:" and "2 – Then, within Consultant, sort by:" (an en dash is used on every line for consistency).
- FSG-0093 [R] attribute list is a select (never free text): displayed attributes in table order, then non-displayed ones. FSG-0097/0098 [M] any attribute can be used; a non-displayed one is added as a column.
- FSG-0103 [R] never "Ascending", "Descending", "Chronological"; FSG-0104/0115 [R] radio buttons below the attribute: "Most recent first" / "Oldest first", "Largest first" / "Smallest first", "A – Z" / "Z – A"; ordinal attributes use their own first and last values ("Alert first") `[suggested]`.
- FSG-0085 [R] dates default to most recent first.
- FSG-0081..0084 [R] Preview, OK and Cancel with the same meaning as in the filter dialog; FSG-0086/0092 [R] prepopulated with the current sort.
- FSG-0094..0096 [R] "Add" below the last line; FSG-0116..0120 [R] "Remove" on each line and "Remove all".
- FSG-0121 [M] progressive sort.

## Do and don't

- Do give the row noun the user would say ("medications", "patients").
- Don't label orders "Ascending" or "Descending".

## Accessibility

- Each attribute select is labelled by its line label; each order choice is a radio group named "Order for Consultant".
- Esc cancels; focus is kept inside the modal dialog. After Add or Remove focus moves to the affected line.
