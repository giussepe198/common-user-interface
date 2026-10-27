# QuickList

A centrally managed list of up to 10 drug names with shortcut keys, for use on its own (DrugSearch embeds the same behaviour under its search box).

## When to use

- Where a Quick List is needed without the search box, for example a side panel or a touch layout. Inside the prescribing flow, prefer DrugSearch with `quickLists`.

## What you provide

```tsx
<QuickList
  lists={[{ id: 'gen', name: 'General Medicine', description: '10 commonly prescribed medications', items }]}
  onSelect={entry => startPrescribing(entry)}
  changedOn="2026-10-20"
  onNoticeDismiss={permanent => saveDismissal(permanent)}
/>
```

## Guidance implemented

- MSP-0060, MSP-0070 [M/R]: centrally managed lists supplied by the consumer.
- MSP-0080, MSP-0260 [M]: one list always shown; the selector has no "None".
- MSP-0090 [M]: description of the contents at the top.
- MSP-0110, MSP-0120 [M]: flat, at most 10 items, so no scroll bar.
- MSP-0130 [M]: items are drug names (catalogue entries), not templates.
- MSP-0140, MSP-0150 [M]: shortcut keys "Ctrl + 1" to "Ctrl + 0" right-aligned in grey italics.
- MSP-0160 [R]: alternate row shading.
- MSP-0170 to MSP-0230 [M/R]: change notice beside the list, "Close", "Don't show this message again", auto-close on selection, shortcuts off while open.
- MSP-0250, MSP-0270 [M/R]: "Quick List" selector when there is more than one list.
- MSP-0700 to MSP-0730: mis-selection highlight and text.

## Do and don't

- Do persist the "Don't show this message again" choice per user until the list next changes.
- Don't build Quick Lists from recently prescribed drugs (MSP-0070).
- `globalShortcuts` listens on the whole page; use it only when no other control uses Ctrl+digit.

## Accessibility

- A `listbox` described by the list description; Up, Down, Home, End, Enter or Space; shortcut text is read after each name.

## Regional behaviour

- AU: brands in Title Case italic and mixed-case lettering (on-screen 6.1.3, 6.1.4). NZ: Title Case, HQSC Tall Man lettering. GB: unchanged (capitals, no mixed case).
