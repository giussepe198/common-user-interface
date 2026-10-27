# DrugSearch

A drug search box with results and a Quick List for choosing one drug to prescribe, following CUI Search and Prescribe sections 4 and 5.

## When to use

- The first step of prescribing a single medication.
- Pair it with PrescriptionForm once a drug is chosen. Cascading route lists and template prescriptions (sections 6 and 7) are not part of this control.

## What you provide

A catalogue of drug names (generic, brand with its generic, or brand only) and, optionally, Quick Lists.

```tsx
const catalogue: DrugCatalogueEntry[] = [
  { id: 'aten', genericName: 'atenolol', prioritised: true },
  { id: 'aten-b', genericName: 'atenolol', brandName: 'Atenix' },
  { id: 'coam', genericName: 'co-amoxiclav', ingredients: 'amoxicillin + clavulanic acid' },
  { id: 'furo', genericName: 'furosemide', synonyms: ['frusemide'] },
  { id: 'hydral', genericName: 'hydralazine', misSelectionRisk: true },
];

<DrugSearch
  catalogue={catalogue}
  quickLists={[{ id: 'gen', name: 'General Medicine', description: '10 commonly prescribed medications', items: tenItems }]}
  quickListChangedOn="2026-10-20"
  onQuickListNoticeDismiss={permanent => saveNoticePreference(permanent)}
  onSelect={entry => startPrescription(entry)}
/>
```

Use `search` to replace the built-in matcher with your own (it must keep the same matching rules).

## Guidance implemented

- MSP-0060 to MSP-0120 [M/R]: Quick List shown by default when the box is empty, with a description, flat, no scroll bar (at most 10 items), directly below the box; "Quick List" selector only when there is more than one list.
- MSP-0130 [M]: Quick List items are drug names only (they are catalogue entries).
- MSP-0140 to MSP-0160, MSP-0680, MSP-0690 [M/R]: shortcuts "Ctrl + 1" to "Ctrl + 0" in grey italics on the right, for Quick List items and prioritised matches only; alternate shading.
- MSP-0170 to MSP-0230 [M/R]: change notice beside the list, "The contents of the Quick List were updated on 20-Oct-2026." (or "...have changed."), "Close" and "Don't show this message again"; closes when a drug is chosen or text is typed; shortcuts are ignored while it is open.
- MSP-0280 to MSP-0300 [M/R]: results directly below the box; prompt "Type a drug name to search".
- MSP-0310, MSP-0320 [M]: no shorthand codes, no auto-complete (`autoComplete="off"`, only typed text is shown).
- MSP-0330, MSP-0340 [M]: focus stays in the box while typing; Tab or Down moves to the first result.
- MSP-0370 [R]: progressive matching as you type.
- MSP-0390 to MSP-0420 [M/R]: nothing below 2 characters, "Please type in at least 2 characters", "No matches were found", message area at least 3 rows high and as wide as the box.
- MSP-0430 to MSP-0490 [M]: list only as tall as needed up to `maxVisibleRows`; "Showing 10 of 40 matches." with "Show all"; then extended in place with a scroll bar; flat list, no paging.
- MSP-0500 to MSP-0520 [M]: matches generic and brand names at the start of any word; every typed term matches a different word ("sal flu" finds "fluticasone + salmeterol"); never inside a word ("can" does not find "topotecan").
- MSP-0530, MSP-0540 [M]: generic matches above brand matches, then by how close the match is to the start of the name, then alphabetically (brand matches by brand name).
- MSP-0570 to MSP-0590, MSP-0740, MSP-0770 [R/M]: spelling matches (one term of 4 or more characters, edit distance 1, or 2 from 8 characters, same first letter [suggested]) and synonyms inline; only the differing characters are highlighted; "previously named frusemide".
- MSP-0600, MSP-0610 [M]: co-drug ingredients after the name in grey italics.
- MSP-0620 to MSP-0670 [R]: "Commonly prescribed matches" above "Standard matches", bold section labels, a line between sections, labels omitted when nothing is prioritised.
- MSP-0700 to MSP-0730 [M/R]: often mis-selected names get a pale row fill and "this drug is often mis-selected" in smaller grey italics.
- MSP-0780 to MSP-0800 [M]: subtle shading restarting per section, no strong row lines.
- MSP-0810 to MSP-0840 [M/R]: "atenolol – ATENIX" (generic first, spaced dash, brand in capitals); brand rows only when the brand itself matched.
- MSP-0350, MSP-0360 [R]: `collapseOnSelect` replaces the box with the chosen name; activating it restores the search with the selection highlighted.
- Study 37: hyphens are optional, so "coamox" and "co amox" find "co-amoxiclav".

## Do and don't

- Do mark prioritised entries centrally; do not auto-generate Quick Lists from recent use (MSP-0070).
- Don't put template prescriptions or doses in a Quick List (MSP-0130).
- Group rows (MSP-0550/0560) and a busy indicator for slow searches are not implemented; the built-in search is synchronous.
- "Ctrl + digit" is reserved by some browsers for tab switching; set `shortcutModifier="Alt"` if your host cannot use Ctrl.

## Accessibility

- Visible label ("Drug search") as well as the in-field prompt [suggested], because placeholders disappear.
- Results are a `listbox` of focusable options; Up and Down move, Enter or Space choose, Esc returns to the box.
- Result counts and feedback are announced through a polite live region.
- Mis-selection and spelling matches are conveyed with text, not colour alone.

## Groups, busy state and asynchronous search

- `groups` with `groupId` on catalogue entries: matching members collapse into one row "paraffin (4)  Show" after the standard matches (MSP-0550 [R]); activating it replaces the text with the group title and lists the members flat (MSP-0560 [R]). Prioritised drugs are never hidden in a group.
- `busy` shows "Searching..." in the results area with the minimum height of 3 rows and an `aria-busy` region (feedback while processing, MSP 5.3.4).
- `searchAsync(query, signal)` runs after `debounceMs` (default 250 [suggested]); stale requests are aborted; a failure shows "The search could not be completed. Try again." [suggested]. Custom outcomes may include `groups` (with `members`).

## Regional behaviour

- AU: active ingredient first, brand in Title Case italic after an en dash (AU-MD-07, on-screen 6.1.3); active ingredient products listed before brand products in distinct styles (6.1.3.2); mixed-case lettering in results and Quick List (6.1.4).
- NZ: brand in Title Case [suggested], HQSC Tall Man lettering.
- GB: unchanged (brand in capitals, no mixed case). Matching is always case-insensitive on the plain name (AU-MD-02), so spelling-match highlights still line up.
- `tallManLettering` turns mixed case off or on; `tallManForms` adds local pairs.
