# SortIndicator

A small triangle, with an optional rank number, that shows a column is sorted and in which order.

## When to use

In the header cell of every sorted column of a table or patient list. `PatientList` renders it for you.

## What you provide

```tsx
<SortIndicator direction="desc" orderLabel="Most recent first" attributeLabel="Admitted" />
<SortIndicator direction="asc" rank={2} orderLabel="Smallest first" attributeLabel="Age" />
```

- `direction`: `asc` (up triangle) or `desc` (down triangle).
- `rank`: position in a progressive sort; omit for a single sort.
- `orderLabel`, `attributeLabel`: plain words used for the tooltip and screen reader text.

## Guidance implemented

- FSG-0099 [M] indicator in the header cell of each sorted column.
- FSG-0100 [M] up or down triangle shows the order.
- FSG-0101 [R] tooltip definition (title plus visually hidden text).
- FSG-0102 [R] fixed position: place it at the same end of every header cell.
- FSG-0122 [R] rank number shown for progressive sorts.
- FSG-0123 [M] rank sits next to the triangle, not inside it, and is boxed so it is not read with other numbers in the header.

## Do and don't

- Do use the order words from the sort dialog ("Most recent first", "A – Z"), not "Ascending".
- Don't put the rank number inside the triangle.
- Don't rely on the indicator alone: also set `aria-sort` on the header cell (PatientList does).

## Accessibility

The triangle is decorative; the visually hidden text says "Sort 2: Age, Smallest first". The boxed rank `[suggested]` keeps the number distinct for low-vision users.
