# Tabs

Tabs within a page (ARIA tabs) with a More menu for the tabs that do not fit.

## When to use

- Switching between sections of one record or form (Summary, Notes, Legal status).
- Not for site navigation (use SideNav), and never to split the groups of one list into tabs (FSG-0126). Filtered-in and filtered-out data views (FSG-0068) are the lists area's job.

## What you provide

- `label` (accessible name of the tab list), `items`: `{ id, label, content?, count?, countLabel?, disabled? }[]`.
- `value` / `defaultValue` / `onChange`, `activation` ('auto' or 'manual'), `maxVisible`, `moreLabel` (default "More"), `panelPadding`.
- Without `content` on any item only the tab list renders, for routed panels.

```tsx
<Tabs label="Record sections" items={[{ id: 'summary', label: 'Summary', content: <Summary /> }, { id: 'notes', label: 'Notes', count: 3, countLabel: '3 drafts', content: <Notes /> }]} />
```

## Guidance implemented

- MSP-1610 [M]: tabs navigate between areas of a record or form; MSP-1620 [M]: every area keeps a dedicated control (overflowing tabs stay reachable in the More menu).
- Fixed order across records; the selected tab always stays in the bar (it replaces the last visible tab when chosen from More), so the bar never reorders [suggested].
- The fit counts the gap before More, and while the tabs shown are still cut off (the More button drawn wider than its measure, a touch target, a late font) one more moves into the menu, so no tab is ever clipped [suggested].
- [suggested] How many tabs fit is measured from the container width (ResizeObserver); `maxVisible` caps it.
- The selected tab is shown by weight, an underline and colour together.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do keep labels short and in the same order for every person.
- Don't put a primary action inside a tab label.

## Accessibility

- WAI-ARIA tabs: one tab stop, Left and Right arrows, Home and End; automatic or manual activation; disabled tabs are skipped.
- The panel is `role="tabpanel"`, labelled by its tab and focusable.
- Counts carry words for screen readers; the More menu is a MenuButton.
