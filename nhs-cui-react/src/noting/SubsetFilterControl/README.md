# SubsetFilterControl

Shows and changes the subset, reference set or value set that terminology matches are limited to.

## When to use
- Above a terminology search field, or level with a clerking heading, when matches are filtered by context.

## What you provide
- `levels` (up to three, with human-readable labels), `nested`, `value`/`onChange` (ids in force).
- Optional `instruction`, `maxButtonChars` (default 20), `region`.

```tsx
<SubsetFilterControl levels={[{ id: 'resp', label: 'Respiratory findings' }]} value={ids} onChange={setIds} />
```

## Guidance implemented
- Matching 2.4.1: MUST filter by subsets where available and let users adjust them; button opened with a down arrow; panel never obscures the results (it opens below the button); human-readable labels; several subsets at once where not nested.
- SHOULD slider when subsets are nested, "Filter"/"No filter" radio buttons when not; never more than three levels.
- Single concept: the current subset shown on a button above the field, truncated with '…' after 20 characters with the full label inside the panel and in the tooltip.
- Closes on click-away and Escape; changes apply immediately.
- "Current filter: <label>" heading in the panel.

## Do and don't
- Do pass the chosen ids to your search (the `subset` passed to `TerminologySearch`).
- Don't hide the filter: users must be able to switch it off.

## Accessibility
- The button names the current filter; the panel is a labelled non-modal dialog; the slider has `aria-valuetext` with the level name.

## Regional behaviour
- Without `levels`, the region's default subsets are offered: none for GB; AU the NCTS value sets used for allergy recording (G10 10, AU Core AllergyIntolerance); NZ the NZ Edition allergy reference sets (G11 9, S19). NZ identifiers are placeholders: set the SCTIDs from the current release.
