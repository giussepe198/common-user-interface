# MedicationsList

A table of one patient's current or past medications with Current/Past buttons, a past filter, Group by, sortable columns, look-ahead notifications and keyboard selection, following the CUI Medications List guidance.

## When to use

- The main medications view for an inpatient record, for reviewing medications and checking prescriptions.
- Not for a single medication's full details (show those on demand, without covering the list).

## What you provide

All medications (current and past) as `MedicationRecord` rows. The status decides which list a row belongs to.

```tsx
<MedicationsList
  medications={[
    { id: '1', status: 'Started', startDate: '2026-10-26', statusSupplement: 'Verified',
      line: { genericName: 'amoxicillin', form: 'capsule', dose: { value: 500, unit: 'mg' }, route: 'oral', frequency: 'three times a day' } },
    { id: '2', status: 'Suspended', startDate: '2026-10-20', suspendedOn: '2026-10-26', hasAlert: true,
      line: { genericName: 'ramipril', form: 'capsule', dose: { value: 5, unit: 'mg' }, route: 'oral', frequency: 'once a day' } },
    { id: '3', status: 'Completed', startDate: '2026-10-19', endDate: '2026-10-26T14:00',
      line: { genericName: 'co-amoxiclav', form: 'tablet', route: 'oral', frequency: 'three times a day' } },
  ]}
  onSelectionChange={ids => setSelected(ids)}
  onRowContextMenu={(rows, at) => openMenu(rows, at)}
/>
```

Optional: `view`/`defaultView`, `pastFilters`, `pastFilterId`, `groupingOptions` (each with `getValues`, `nullLabel`, `compare`), `defaultGroupBy`, `selectedIds`, `now`, `recentPastWindowHours` (default 48), `maxHeight`, `startDateHeading`, `endDateHeading`, `showEndDateInCurrent`, `emptyMessages`, `onRowActivate`.

Per row: `hasAlert` shows a warning icon with the text "Decision support alert" (or the row's `alertLabel`, e.g. "Interaction alert: High Priority") after its Drug Details and in the look-ahead strips; `icons` appends your own labelled icons after the Drug Details. `showRowAlerts={false}` keeps alerts to the look-ahead strips only.

## Guidance implemented

- MEDv-020, MEDv-141 [M/R]: one medication per row; Drug Details is a composite MedicationLine.
- MEDv-023 [M]: icons appended after the Drug Details text inside the same cell (`icons`), including the row's decision support alert icon with a text equivalent (shape plus text, not colour alone) [suggested: alert icon in the row].
- MEDv-021, MEDv-022, MEDv-143 to MEDv-145 [M/R]: no vertical grid lines, thin pale row lines, subtle alternate shading using tokens that keep text contrast.
- MEDv-142 [R]: one line of blank space at the end of the list.
- MEDv-146 [M]: "There are no current medications for this patient" (past: "There are no past medications for this patient" [suggested]).
- MEDv-147 to MEDv-150 [M]: Status, Drug Details, start date (current) and end date (past) columns are always present.
- MEDv-151 to MEDv-154, MEDv-161 [M/R]: start date left of and next to end date, fixed-width date columns, same placement in both lists.
- MEDv-155, MEDv-156 [R/M]: headings "Drug Details", "Status", "Start Date", "End Date" (Title Case as in the guidance examples).
- MEDv-159, MEDv-160 [M]: Drug Details is the widest column; no horizontal scrolling (the line wraps).
- MEDv-162 to MEDv-165, MEDv-042 [M/R]: status never blank, bold, with a second-line supplement such as "Verified"; Not Started and Started are distinct; "Suspended on dd-Mmm-yyyy".
- MEDv-024, MEDv-025, MEDv-166 [M]: suspended status highlighted (text plus fill) and included in current; past list differs (status first, italic muted status, sunken header).
- MEDv-062 to MEDv-065, MEDv-174 (3.3.15) [M]: buttons labelled exactly "Current" and "Past", Current by default, exactly one selected, shown by fill, weight and a tick.
- MEDv-066, MEDv-067, MEDv-069 [M]: split drop-down on Past with "Show All Past", "Past week", "Past month", "Past 3 months", "Past 2 years"; choosing a filter selects Past.
- MEDv-099, MEDv-100, MEDv-173 (3.3.16), MEDv-175 [M/R]: current sorted by start date and past by end date, most recent first; Drug Details first in current, Status first in past.
- MEDv-074, MEDv-075, MEDv-077, MEDv-174 (3.3.17) [M/R]: last row of the current list, "2 past medications were completed or discontinued in the last 48 hours", formatted differently from rows; hidden when the count is 0 [suggested].
- MEDv-068, MEDv-070 to MEDv-072, MEDv-176 [M/R]: filter row directly under the headings, "The total list (54) is filtered to show: Past 2 months (3)", with "Remove Filter" inside it. The current list is never filtered.
- MEDv-177 to MEDv-189, MEDv-043 to MEDv-059 [M/R]: permanent reserved strips above and below the rows inside the scroll area; names of out-of-view drugs in list order with the nearest rightmost; "N more" at the far left; long names counted, never truncated; alert icons next to names and the count; bold names, normal-weight count; " ● " delimiter with no leading or trailing delimiter; strips update on scroll and resize, are single line, shrink to fit, right-aligned and not interactive. Past lists show counts only (MEDv-054). A drug is listed when part of its name text is cut by the list edge (MEDv-183, using a 20% inset for ascenders and descenders [suggested]).
- MEDv-084, MEDv-085, MEDv-190, MEDv-083 [M/R]: native drop-down labelled "Group by", first option "None", no grouping by default.
- MEDv-086, MEDv-087, MEDv-089 to MEDv-092, MEDv-191 to MEDv-200 [M/R]: prominent headings with the toggle at the start, count only when collapsed ("Oral (2)"), expanded by default, sort kept within groups, shading restarts per group, null group in brackets at the top, combined groups "A; B" in sort order, each row in exactly one group, empty groups not shown; heading context menu (right-click, Shift+F10 or the Menu key) with "Collapse All Groups" and "Expand All Groups".
- MEDv-101 to MEDv-105 [M/R]: click a heading to sort, click again to reverse; active heading bold with an arrow; the default sort is kept as the secondary sort.
- MEDv-193, MEDv-125 [M]: after changing grouping the list returns to the top so a heading shows; after sort or grouping changes the selection is kept and scrolled into view.
- MEDv-202, MEDv-122, MEDv-123, MEDv-126, MEDv-127 [M]: nothing selected on open; click or Space selects; Ctrl+click and Ctrl+Space toggle; Shift+click and Shift+Arrow extend; selected rows are clearly highlighted.
- MEDv-128 [M]: `onRowContextMenu` fires on right-click, Shift+F10 or the Menu key with the selected rows. The menu itself is the consumer's.

## Do and don't

- Do supply `now` when testing or replaying, so filters and the recent past notification are stable.
- Do keep the default sort and no grouping as the opening state.
- Don't add an "All" view without a risk assessment (3.3.15 notes).
- Group headings for route and frequency are shown with an initial capital ("Oral") [suggested]; drug names keep their lower case.
- Sort direction uses arrow icons (down = descending, up = ascending) rather than black triangles, which ADR-0041 reserves [suggested].

## Accessibility

- `role="grid"` table (`role="treegrid"` with `aria-level` on rows when grouped, so a group heading can carry `aria-expanded`) with `aria-multiselectable`, `aria-selected` rows, `aria-sort` on headings and `aria-expanded` group headings; roving focus with Up, Down, Home and End; Left and Right collapse and expand a focused group.
- Look-ahead strips are not focusable; each has visually hidden text such as "5 medications above:".
- Status, suspension and selection never rely on colour alone (text, weight, tick, side bar).
- Not implemented here: MEDv-203 multi-selection summary before an action, MEDv-129 to MEDv-136 menu contents, MEDv-201 levels of detail, MEDv-124 cross-view selection (pass `selectedIds` to share it).

## Levels of detail and actions

- `detailLevels` adds a "Detail" select to the toolbar (MEDv-201 [R]). `DEFAULT_MEDICATION_DETAIL_LEVELS` [suggested]: Summary (no status supplements), Standard, Full (multi-line Drug Details, end date column). Mandatory columns never go.
- `contextActions` gives the list its own context menu (MEDv-128 to MEDv-136): groups information, direct, add information in that order with dividers; "Details..." added first if missing; actions unavailable for any selected row are greyed out (MEDv-131). An action on more than one row shows `MedicationActionSummaryDialog` before `onAction` is called (MEDv-203 [M]). `onRowContextMenu` still replaces the built-in menu.

## Regional behaviour

- Drug Details use MedicationLine with the list's region (see MedicationLine README): AU ACSQHC order and mixed-case lettering, NZ HQSC rules, GB unchanged.
- Look-ahead names use the same mixed-case lettering (AU on-screen 6.1.4 applies to every display).
- List structure, statuses and wording follow NHS CUI in all regions; G10 and G11 give no list-specific overrides.

## Narrow screens [suggested]

The scroll area is the size container (the row and heading menus are fixed layers, which a container on the root would trap). Below 600px each row becomes a card: drug details first, then status and dates labelled from their headings; the headings wrap as sort buttons.
