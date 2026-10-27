# ActionBar

Bottom commit bar for mobile screens: one to three large actions with the primary action on the right, padded for the iOS safe area.

## When to use

- At the bottom of a task screen or sheet footer (P1 "Use this date and time", B3 "Cancel / Record W: Withheld", P2 previous and next parameter).

## What you provide

- `actions`: up to three `{ label, onClick, variant, icon, iconPosition, disabled, type, form, grow }`.
- `summary`: a line above the actions (announced politely when it changes).
- `layout`: `row` (primary on the right) or `stack` (full width, primary on top). `size`: 48, 56 (default) or 64. `sticky` (default true).
- `children`: custom content such as a HoldToConfirmButton.

```tsx
<ActionBar
  actions={[{ label: 'Cancel', onClick: cancel }, { label: 'Record W: Withheld', variant: 'primary', onClick: save }]}
/>
```

## Guidance implemented

- Phase 4 mobile rules [M]: primary commit actions at least 56 px high, placed at the bottom, `padding-bottom: max(16px, env(safe-area-inset-bottom))`.
- Primary action on the right in a row, on top in a stack [suggested, follows the concepts P1 and B3].
- More than three actions are not shown [suggested]: move the rest into the screen.

## Do and don't

- Do pass `sticky={false}` when the bar is already inside a sheet footer or a fixed layout.
- Don't use it for navigation tabs.

## Accessibility

- `role="group"` with an accessible name (default "Actions").
- DOM order matches visual order, so Tab reaches the primary action last in a row.
