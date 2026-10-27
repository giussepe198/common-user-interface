# ChipGroup

Large filter and quick-pick chips (44 px or more) with `aria-pressed`, a tick on pressed chips, and one sideways-scrolling line with a visible overflow cue.

## When to use

- Quick picks (P1 Today / Yesterday), list filters (A3), and one-off action chips (P1 Now, −15 min, −1 hr).
- For two to five mutually exclusive views use SegmentedControl; for long single-choice lists with meanings use ReasonCodePicker.

## What you provide

- `options`: `{ value, label, ariaLabel?, icon?, count?, disabled? }`. `label`: group name (required); `labelVisible` to show it.
- `selectionMode`: `single` (default), `multi` or `none` (action chips with no pressed state).
- `value` / `defaultValue` / `onChange` (string array), `onChipClick` for every tap, `allowDeselect` for single.
- `overflow`: `scroll` (default) or `wrap`; `size` 44 or 48; `align`.

```tsx
<ChipGroup label="Show" selectionMode="multi" options={[{ value: 'overdue', label: 'Overdue', count: 3 }]} onChange={setFilters} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: targets at least 44 px high and 44 px wide (chip height from the approved concepts; spacing keeps neighbouring targets 48 px apart), base text at least 15 px.
- Colour is never the only carrier of meaning [M]: pressed chips show a tick as well as the inverted fill.
- Overflow cue [suggested]: a chevron at the edge shows while chips are hidden; tapping it scrolls. Swipe only scrolls (it never selects).

## Do and don't

- Do give action chips an `ariaLabel` when the label is a symbol ("−15 min" is read as "15 minutes ago").
- Don't use chips to commit clinical data on their own; pair with a commit button.

## Accessibility

- `role="group"` with a name; each chip is a `button` with `aria-pressed` (single and multi).
- Left and Right arrows, Home and End move focus between chips; each chip is also in the Tab order.
- The overflow cue is decorative (`aria-hidden`); keyboard users reach hidden chips by Tab or arrows, which scroll them into view.
