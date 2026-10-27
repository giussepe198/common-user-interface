# TouchButton

Large button for phone and tablet screens, with the same variants as the core Button and heights of 48, 56 or 64 px.

## When to use

- Any action on a mobile screen. Use 56 px (default) for commit actions, 64 px for high-risk commits, 48 px for secondary actions.
- For the bottom commit bar of a screen use ActionBar, which places and pads the buttons for you.

## What you provide

- `children`: a verb label in sentence case. `variant`: primary, secondary (default), quiet or danger.
- `size` 48, 56 or 64; `fullWidth`; `icon` with `iconPosition`; `iconOnly` (children become the accessible name).
- `bottomAction` when the button sits alone at the bottom of the screen: adds the iOS safe-area inset below it.

```tsx
<TouchButton variant="primary" fullWidth bottomAction onClick={save}>Record dose</TouchButton>
```

## Guidance implemented

- Phase 4 mobile rules [M]: touch targets at least 48 x 48 px; primary commit actions at least 56 px high and in the thumb zone with safe-area padding.
- Core Button semantics [M]: one primary action per view, verbs in sentence case, visible text label unless icon only.
- No hover-only information: hover styles apply only on devices that hover; pressed state uses `:active` [suggested].

## Do and don't

- Do keep labels short enough to read at 320 px; they wrap at word boundaries rather than truncate.
- Don't use a TouchButton for navigation that changes the URL; use a link.
- Don't put two primary buttons on one screen.

## Accessibility

- Real `button` element, `type="button"` by default, visible focus ring, disabled state is the native attribute.
- Icon-only buttons keep a visually hidden text name and remain 48 x 48 px.
