# DataTable

A dense table for lists that are not patient lists (referrals, tasks, reports, admin lists) with the same interaction model as PatientList.

## When to use

Use it for any list of records that people scan, sort, filter or group: referrals waiting, tasks, report runs, users, codes. Use `PatientList` when each row is a patient or a bed, because that adds patient identification, duplicate name warnings and frozen location columns. Use `FactList` for the facts of one record.

## What you provide

```tsx
<DataTable
  caption="Open referrals"
  rowNoun="referrals"
  columns={[
    { id: 'id', title: 'Referral', isRowKey: true },
    { id: 'received', title: 'Received', dataType: 'date' },
    { id: 'priority', title: 'Priority', dataType: 'ordinal', options: ['Urgent', 'Routine'], groupable: true },
    { id: 'waiting', title: 'Waiting', unit: 'days', dataType: 'integer', align: 'right' },
    { id: 'tasks', title: 'Tasks', sublist: r => r.tasks, sortable: false },
  ]}
  rows={referrals}
  getRowKey={r => r.id}
  defaultSort={[{ attributeId: 'received', direction: 'desc' }]}
  cardColumnIds={['priority', 'waiting']}
  onOpenRow={openReferral}
/>
```

Sort, filter, group, visible columns and selection are each controlled (`sort` and `onSortChange`, and so on) or uncontrolled (`defaultSort`). With `processing="server"` the table never sorts or filters the rows itself: it reports the user's choices through the callbacks, you fetch the page and pass `rows`, `totalCount` and `filterCounts`. `dataTableAttributes(columns)` gives the attribute list the lists utilities take, for building the server query.

Other props: `selectionMode` ('none', 'single', 'multiple' with a checkbox column), `updates` and `onUnmark` (marks since the user last looked), `loading`, `emptyText`, `maxHeight` (sticky header inside a scrolling area), `layout` ('auto', 'table', 'cards'), `columnPresets`, `toolbarExtra`, `showToolbar`, `columnChooser`, `pageSize` (client processing: that many rows at a time with `Pagination` underneath; `page`, `defaultPage`, `onPageChange`, `pageLabel`).

- Search [suggested]: `search` ('auto' shows the box from 8 rows), `searchQuery`, `defaultSearchQuery`,
  `onSearchQueryChange`, `searchFields`, and per column `searchable`, `searchKind` and `searchValue`. See
  `search/ListSearch/README.md`: words in any order, close spellings, identifiers, dates and field scopes, run before
  the filter.

## Guidance implemented

- FSG-0001/0002 [R] Filter, Sort and Group by commands in that order (DataToolbar), plus Columns. FSG-0004 [R] the same commands from the header context menu (right-click, Shift+F10 or the context menu key).
- FSG-0012, FSG-0033/0034 [R] filter one column from its header cell (HeaderCellFilter); "Custom..." opens the FilterDialog (FSG-0037/0038).
- FSG-0064 [M] filtered-out rows are not shown; FSG-0065..0068 [R] filtered in, filtered out and all tabs (client processing); FSG-0070..0073 [M] the notification sits above the table and starts "Data filtered to show".
- FSG-0087 [R] click a header to sort, again to reverse; FSG-0099..0102 [M] SortIndicator in the sorted header with `aria-sort`; FSG-0121 progressive sorts from the SortDialog; FSG-0098 [M] sorting by a hidden column shows it.
- FSG-0131..0134 [R] Group by with "None", sort kept inside groups, a last group for rows with no value; groups collapse with the arrow keys.
- PAL-0120/0150, PAL-0320..0350 [R] headers and cells wrap, never truncated; a row key, date or number shown as its value never breaks inside itself, while a cell with `render` lays out and wraps its own parts [suggested]; PAL-0140 [R] header alignment matches the data; PAL-0170 [M] sticky header; PAL-0300 [R] two-colour banding.
- PAL-0390..0410 [R] sublists show every item; PAL-0700 [M] keyboard focus highlights the column header and the row key cell.
- PAL-0710..0730 [R] ColumnChooser with row key columns locked and role presets.
- PAL-0880..0940 [R] UpdateMarker on updated cells, sublist entries and new rows, unmarked one by one (PAL-0930) or all with a confirmation (PAL-0980).
- Client paging [suggested]: filter and sort apply to every row before the page is cut, so a sort is never of one page only; the page returns to 1 when the filter, sort or grouping changes; `Pagination` says what the page shows in words ("Tasks 26 to 50 of 60").
- Stacked cards below 600px, and with `layout="auto"` also whenever the columns cannot fit the list's width (the table returns once the list is as wide as the table needed), server processing, the loading state, multiple selection checkboxes and "Showing 25 of 340" are [suggested].

## Regional behaviour

None. Dates use the core formatters ("20-Oct-2026"); words for rows come from `rowNoun`.

## Do and don't

- Do give every table a `caption`, even when it is visually hidden, and a plural `rowNoun`.
- Do mark the identifying column `isRowKey`: it is never hidden, heads each card and names checkboxes.
- Do pass `emptyText` that says what was looked for ("No open referrals for the North team").
- Don't use it for patients (use PatientList), and don't shorten cell text to make it fit.
- Don't put commands inside cells that compete with row selection; open the row with `onOpenRow`.

## Accessibility

A `grid` named by the caption, roving tab stop (never a cell that holds its own links or buttons: Tab reaches those, and a focusable cell round them would wrap targets in a target) [suggested], arrow keys between cells, Home and End, Ctrl+Home and Ctrl+End, Page Up and Page Down, Enter to sort a header or open a row, Space to select, Shift+F10 for the header menu. Result counts and sort changes are announced in a polite live region. `aria-busy` while loading. In the card layout the markup stays a table: every cell carries its column heading in `data-label`, shown before the value, and the headings stay a wrapping row of sort buttons. Under a coarse pointer headers, group toggles, checkboxes and a link that is a cell's whole value grow to touch size.
