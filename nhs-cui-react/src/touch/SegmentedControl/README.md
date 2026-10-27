# SegmentedControl

Two to five equal segments for switching views or modes, built as a radio group with a tick on the chosen segment.

## When to use

- Switching between views of the same data (A3 "Current (7) | Past") or a short exclusive choice (which 02:30 in the repeated hour).

## What you provide

- `options`: `{ value, label, ariaLabel?, icon?, count?, disabled? }`; `label` (required) and `labelVisible`.
- `value` / `defaultValue` / `onChange`; `size` 48 (default) or 56; `fullWidth` (default true).

```tsx
<SegmentedControl label="Show" options={[{ value: 'current', label: 'Current', count: 7 }, { value: 'past', label: 'Past' }]} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: 48 px segments, 16 px text.
- Colour never the only cue [M]: the chosen segment shows a tick and a heavier border as well as the fill.
- Radio semantics instead of the concept's pressed buttons [suggested]: one tab stop and arrow keys, as screen reader users expect for an exclusive choice.

## Do and don't

- Do keep labels short (one or two words) so segments stay equal at 320 px.
- Don't use more than five segments; use ChipGroup or a list.

## Accessibility

- `role="radiogroup"` with a name; segments are `role="radio"` with `aria-checked`.
- Roving tab index: Tab enters on the chosen segment; arrows, Home and End move and select.
