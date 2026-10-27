# FilterNotification

A prominent bar attached to the top of a filtered table that says what the data is filtered to show, with a single "Remove all filters" control and optional tabs for filtered-in, filtered-out and all data.

## When to use

Whenever a filter is active on a table or list. `PatientList` renders it automatically when you pass `filter`.

## What you provide

```tsx
<FilterNotification
  filter={filter}
  attributes={attributes}
  onRemoveAll={() => setFilter(null)}
  counts={{ in: 4, out: 26, all: 30 }}
  view={view}
  onViewChange={setView}
  rowNoun="patients"
/>
```

The text comes from `filterNotificationText(filter, attributes)`.

## Guidance implemented

- FSG-0070 [M] prominent notification whenever a filter is active; PAL-0760 [M] strong visual differentiation above the viewing area: an info-tinted bar (`--info-surface`) with a heavy `--info` top rule, filter icon and bold text, calm in both themes with text at least 4.5:1 `[suggested]`.
- FSG-0071 [R] attached to the table; FSG-0072 [M] never below the table.
- FSG-0073 [R] text starts "Data filtered to show" followed by the criteria; criteria are joined with "or" / "and" to match the combinator `[suggested wording]`.
- FSG-0057/0063 [R] remove all filters in one action, labelled "Remove all filters", inside the notification.
- FSG-0064 [M] filtered-out rows are not shown in the filtered view; FSG-0065..0068 [R] access to filtered-in, filtered-out and all data through tabs across the top ("Data filtered in", "Data filtered out", "All data" `[suggested label]`); FSG-0069 [R] never a left-hand panel.
- The "4 of 30 patients shown" count is `[suggested]`.

## Do and don't

- Do place it directly above the table it describes.
- Don't show filtered-out rows greyed out in the filtered view.
- Don't animate it continuously; the guidance only discusses animation after inactivity, and it is not implemented here.

## Accessibility

- The text is a polite live region, so screen reader users hear the new criteria when the filter changes.
- Tabs use `role="tablist"`, with Left and Right arrows to move between them.
- The filter icon is decorative; the meaning is in the text.
