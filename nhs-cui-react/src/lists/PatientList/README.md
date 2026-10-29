# PatientList

A multi-patient list with a list header, sticky column headers, frozen row key identifiers, patient identification cells, sorting, grouping, filtering, sublists, update marking, keyboard navigation and selection.

## When to use

Ward lists, clinic lists, team lists and handover lists: one patient (or location, or appointment) per row. For a single patient's tabular data use an ordinary table with `FilterDialog` and `SortDialog`.

## What you provide

```tsx
<PatientList
  listFor="Dr Okafor"
  service="Respiratory medicine"
  locations={['Elkington Ward, North wing']}
  timestamp={lastUpdated}
  columns={[
    { id: 'bed', title: 'Location', kind: 'location', align: 'center' },
    { id: 'patient', title: 'Patient', kind: 'patient' },
    { id: 'news', title: 'NEWS2 score', dataType: 'integer', align: 'right' },
    { id: 'admitted', title: 'Admitted', dataType: 'date' },
    { id: 'tasks', title: 'Outstanding tasks', sublist: r => r.tasks },
  ]}
  rows={rows}
  getRowKey={r => r.bed}
  getPatient={r => r.patient /* null = unoccupied */}
  toolbar={<DataToolbar onFilter={openFilter} onSort={openSort} groupOptions={groupOptions} groupBy={groupBy} onGroupByChange={setGroupBy} />}
  filter={filter} onFilterChange={setFilter}
  sort={sort} onSortChange={setSort}
  groupBy={groupBy}
  updates={updates} onUnmark={ids => unmark(ids)}
  onOpenRow={openPatientRecord}
/>
```

`renderPatient(row, { patient, match })` [suggested] lets the host draw the patient cell itself, for example `PatientIdentificationCell` with `nameHref` so the name opens the record, or with a local extension such as a preferred name. It receives the identical or similar name match the list found, so the warning is never lost; sorting, filtering and the name check still use `getPatient`.

`rowNounSingular` [suggested] gives the word for one row where the plural is irregular ("person" for "people").

`getPatientId(row)` [suggested] names the patient behind each row for lists where one patient can have several rows (a person under two teams): rows of the same patient are never warned against each other as identical names.

Columns are generic over your row type. `dataType` (FSG Table 5) drives filter operators, sort words and cell formatting (dates use the CUI `dd-Mmm-yyyy` format).

`FilterDialog`, `SortDialog` and the filter and sort utilities take attributes, not columns. Build them from the same column definitions with `patientListAttributes`, which is what `PatientList` uses internally, so the dialogs and the list agree (a patient column filters and sorts by the displayed regional name):

```tsx
const attributes = patientListAttributes(columns, { getPatient: r => r.patient, region: 'AU' });
{filterOpen && <FilterDialog tableName="Ward list" rowNoun="patients" attributes={attributes} initial={filter} onOk={applyFilter} onCancel={closeFilter} />}
{sortOpen && <SortDialog tableName="Ward list" rowNoun="patients" attributes={attributes} initial={sort} onOk={applySort} onCancel={closeSort} />}
```

- Search [suggested]: the same list search as DataTable (`search`, `searchQuery`, `onSearchQueryChange`,
  `searchFields`). The patient column is searched as names (either order, close spellings, similar sounds), with the
  record number and other identifiers, and the date of birth as "born:". Keep the query in component state: never put
  a search for people in an address or in browser storage.

## Guidance implemented

Header
- PAL-0010/0020 [M] header always visible, across the full width; PAL-0030 [R] larger, bolder title.
- PAL-0040 [M] who the list is for, service, location, and last updated time or current time; PAL-0050..0070 [R] "Patient list for: Dr Okafor"; PAL-0080/0090 locations uniquely identified and joined; PAL-0100 [M] CUI date and 24-hour time.
- `headingLevel` (2, 3 or 4; default 2) sets the title's heading level so the list nests under a page section's own heading `[suggested]`.
- Handover RID 144: inclusion criteria shown under the title ("Showing: All inpatients on Elkington Ward").

Columns and rows
- PAL-0110 [R] titles top aligned; PAL-0120/0150/0160 titles wrap and are never truncated; PAL-0140 header alignment matches data; PAL-0170 [M] sticky header row.
- PAL-0180 [M] prominent vertical dividers; PAL-0190 [M] cell margins; PAL-0290 [M] prominent row dividers; PAL-0300/0310 [R] two muted alternating row colours.
- PAL-0200 [M] user-resizable widths (drag the header edge, or Alt+Left/Right on a focused header `[suggested]`); persist them with `onColumnWidthsChange`. PAL-0220 [R] resizing one column never changes the others; PAL-0230 [R] horizontal scroll.
- PAL-0240/0250 [M]/[R] "Columns out of view – scroll left and right" with arrow buttons above the viewing area at its left and right edges; PAL-0260 [R] "Hide until next session".
- PAL-0280 [M] one patient per row; PAL-0320..0350 [R] text wraps, never truncated, rows grow; PAL-0360 one vertically scrolling list; PAL-0370/0380 [R] "Start of list" and "End of list" indicators `[wording suggested]`.
- FSG-0014 unit in the header.

Sublists
- PAL-0390 [M] one item per sub-row; PAL-0400 [M] dotted sublist dividers, lighter than row dividers; PAL-0410 [R] never a subset, no in-cell scrolling.

Patient identification
- PAL-0450 [M] name, date of birth and NHS number (or the region's identifier) on separate lines in one column, rendered by `PatientIdentificationCell`; PAL-0520 [M] "FAMILY, Given (Title)"; PAL-0530 [R] preferred name, "Born" and "NHS No." labels as on the banner.
- PAL-0460..0500 [R] "UNKNOWN, Unknown, Male" style unknown names, "Unknown" date of birth and NHS number; PAL-0510 [R] temporary number while the NHS number is unknown.
- PAL-0540 [M] identical names on the list: highlighted name plus a warning triangle; PAL-0550 [M] the first differentiating element (given name, else date of birth, else NHS number) is underlined; PAL-0560/0570 [R] similar names via `similarNames`; `listNamesSoundAlike` is a ready function (family and given names the same once folded, or sounding alike: "John"/"Jon", "Smith"/"Smyth", not "John"/"Jane") `[suggested]`. Matches are checked across the whole list, including filtered-out rows.

Row key identifiers
- PAL-0580/0590 [M] unique key per row; PAL-0600 [M] key content larger and bolder (name only in the patient cell); PAL-0610/0620 [M] key columns at the left and frozen; PAL-0640 [M] use full locations in multi-location lists.
- PAL-0650/0690 [R] the location (or appointment time) column is the default sort.
- PAL-0660 [R] unoccupied locations show "UNOCCUPIED"; PAL-0670 [R] `hideUnoccupied`.
- PAL-0700 [M] when a cell has focus, that row's key cells and the column header are highlighted.

Managing the list
- PAL-0710/0720 [R]/[M] `visibleColumnIds` (see `ColumnChooser`); key columns cannot be hidden.
- PAL-0750/0760 filter with `FilterNotification` above the viewing area; FSG-0064..0068 filtered-in, filtered-out and all-data tabs.
- PAL-0770, FSG-0087 [R] click a header to sort by that column, click again to reverse; FSG-0099..0102, 0122/0123 sort indicator with rank; FSG-0098 [M] sorting by a hidden column adds it at the right.
- PAL-0780, FSG-0124 [R] prominent group headings; FSG-0125 [R] sticky group heading; FSG-0127..0130 each group expands and collapses, all expanded at first; FSG-0133 sort kept inside groups; FSG-0134 "(No value)" group `[label suggested]`.
- FSG-0004 [R] header context menu (right-click, Shift+F10 or the Menu key) with Filter, Sort, Group by (`onHeaderCommand`).
- FSG-0012, 0033, 0034, 0037, 0038 [R] with `headerFilter`, "Filter" shows `HeaderCellFilter` in the header cell for that column; "Custom…" calls `onHeaderCommand('filter', id)` to open `FilterDialog`. A header filter replaces any other filter `[suggested]`.
- PAL-0270 [R] after an update, a resized column whose longest word no longer fits is widened to fit; other columns are unchanged (`autoWidenColumns`, default on).

Updates
- PAL-0800 refresh from source; PAL-0830 [R] refresh interval shown; PAL-0840/0850 [R] count of marked updates and how many are out of view; PAL-0860/0870 [R] time since last refresh and a Refresh button for non-real-time lists.
- PAL-0880 [M] updated cell: corner triangle plus background; the triangle never covers content. PAL-0900 [M] only the updated sublist entry is marked. PAL-0910/0920 [R] "Item removed" and "2 items removed".
- PAL-0930 [R] select a triangle to unmark that update; PAL-0940 [R] added patient: whole row marked, triangle in the patient cell; PAL-0960 [R] "Unmark all" next to the count; PAL-0980 [R] confirmation that the user may not have seen every update, with "Do not ask again".
- PAL-0890/0970: marks are per user; pass only the current user's marks and omit their own updates.
- Sublists render with `SubList` and update triangles with `UpdateMarker`; both are exported for use outside the list.

Historical lists
- PAL-1010/1020 [R]/[M] `historical` adds a "Historical" tag, an emphasised "List as at" time and a distinct warning-tinted colour scheme (the tag is `HistoricalSnapshotBanner variant="tag"`). PAL-1030 [M]: never render a historical and current list together.

Further information
- PAL-1040/1050 [M] `onOpenRow` must replace the list view with the record; do not open side panels or pop-ups over the list.

## Regional behaviour

Set `region` or wrap in `ClinicalLocaleProvider`. GB is unchanged.

- AU: identification cell shows IHI (4-4-4-4) then URN, each held one on its own line, with IHI status in words when not Active and Verified (G10 1.6, AU-ID-01); family name upper case with no title (AU-PI-02); a single name shows alone (AU-NM-01); `dateOfBirthFormat="numeric"` shows DD/MM/YYYY to match the wristband (AU-PI-03); `mrnLabel` sets the local record number label (AU-ID-04). Identical names are warned (EMM business requirements 3.3, AU-PI-04).
- NZ: NHI unbroken in upper case (G11 1.3); family name as recorded with macrons kept, single name alone (G11 2.1, 2.3).
- AU and NZ: names that differ only by macrons or other diacritics ("Kāhu" and "Kahu") are flagged as similar unless `similarNames` is supplied `[suggested]`.

See `PatientIdentificationCell` for the full table and sources.

## Do and don't

- Do give every row a stable key, including unoccupied beds.
- Do keep marks per user and remove them only when the user unmarks.
- Don't use update marks to show task status, responsibility or acceptance.
- Don't truncate cells or show "5 of 8" in a sublist.
- Don't show a patient record beside the list.

## Accessibility

- `role="grid"` with a single tab stop. Arrow keys move between cells, Home/End to row ends, Ctrl+Home/End to the first and last row, Page Up/Down by ten rows. Enter opens the row (or sorts, on a header), Space selects (or toggles a group). Left/Right collapse and expand a focused group heading.
- Headers carry `aria-sort`; key cells are row headers; selection uses `aria-selected` and a visible tick, not colour alone.
- The update count is a polite live region. Update triangles are buttons named "Updated NEWS2 score. Unmark".
- The identical-name warning has visually hidden text naming the element to check.
- Colours come from tokens and work in light and dark themes.

## Narrow screens [suggested]

The list is a size container. Below 600px each row becomes a card: key columns (location, patient) head the card and every other cell is labelled with its column title (`data-label`); the column headings wrap as a row of sort buttons, so sorting and the header menu stay in reach, and the out-of-view columns bar is not needed. Table semantics stay in the markup.
