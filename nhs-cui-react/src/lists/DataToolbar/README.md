# DataToolbar

The Filter, Sort and Group by commands for a table or patient list, in that order, with keyboard commands.

## When to use

Above any table of homogeneous data that users can filter, sort or group, including `PatientList` (pass it as the `toolbar` prop).

## What you provide

```tsx
<DataToolbar
  label="Patient list tools"
  onFilter={() => setFilterOpen(true)}
  onSort={() => setSortOpen(true)}
  groupOptions={[{ id: 'ward', label: 'Ward' }, { id: 'consultant', label: 'Consultant' }]}
  groupBy={groupBy}
  onGroupByChange={setGroupBy}
  filterActive={!!filter}
  onRemoveAllFilters={() => setFilter(null)}
/>
```

## Guidance implemented

- FSG-0001 [R] commands in the order Filter, Sort, Group.
- FSG-0002 [R] labels "Filter", "Sort", "Group by".
- FSG-0003 [M] keyboard commands for all three: Alt+Shift+F, Alt+Shift+S, Alt+Shift+G `[suggested]` (the guidance does not name keys). Exposed with `aria-keyshortcuts` and in tooltips.
- FSG-0004 [R] multiple entry points: this toolbar, plus the header-cell context menu in `PatientList` (`onHeaderCommand`).
- FSG-0131 [R] "None" removes grouping; FSG-0132 [R] group attribute chosen from the "Group by" menu.
- Remove all filters is offered next to Filter when a filter is active, not only in a context menu (FSG 3.6.8).
- PAL-0750, PAL-0770, PAL-0780 [R] patient lists support filter, sort and group.

## Do and don't

- Do keep the three commands together and in this order in menus too.
- Don't rename "Group by" to "Group" or "Categorise".
- Don't use "Reset" or "Undo" for removing filters.

## Accessibility

- `role="toolbar"` with one tab stop; Left and Right arrows move between commands `[suggested]`. FSG-0003 says the toolbar is reached by keyboard commands rather than Tab order; a single tab stop keeps it reachable for users who do not know the shortcuts.
- The Group by menu is a `menu` of `menuitemradio` items: arrows move, Enter or Space chooses, Esc closes and returns focus.
- The current grouping is shown as text on the button, not by colour.
