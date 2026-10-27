# SubList

A list inside a list cell, one item per sub-row, with updated items marked one by one and removed items counted.

## When to use

A cell holding several entries, such as outstanding tasks, results or alerts for a patient on a patient list (PAL-0390). `PatientList` uses it for columns with `sublist`; use it directly in other tables and handover views.

## What you provide

```tsx
<SubList
  items={['Chest X-ray', 'Bloods: FBC, U&E', 'Physio review']}
  updatedIndexes={[1]}
  onUnmarkItem={i => unmark(taskIds[i])}
  itemLabel="task"
  removedCount={2}
  aria-label="Outstanding tasks for bed 4"
/>
```

## Guidance implemented

- PAL-0390 [M] each item on its own sub-row.
- PAL-0400 [M] dotted sublist dividers, lighter than row dividers.
- PAL-0410 [R] every item shown: no truncation, no "5 of 8", no scrolling inside the cell.
- PAL-0420..0440 [R] the cell grows and rows are added or removed with the data (the list re-renders with the new items).
- PAL-0900 [M] only the updated entry is marked, with the corner triangle and highlight (`UpdateMarker`), not the whole cell.
- PAL-0920 [R] removed items noted at the end: "3 items removed".
- PAL-0930 [R] each mark can be unmarked on its own.
- `[suggested]` "None" when there are no items (`emptyText`), so an empty cell is never blank.

## Do and don't

- Do pass every item; the list never shortens itself.
- Do keep update marks per user (PAL-0970).
- Don't use update marks for task status, responsibility or acceptance.

## Accessibility

- A real `ul` with one `li` per item; give it an `aria-label` when the column header is not nearby.
- Update triangles are buttons named "Updated task. Unmark". Inside a grid with its own arrow-key navigation set `markersFocusable={false}` (PatientList does).
