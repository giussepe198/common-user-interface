# Icon

Line icon drawn in the current text colour, always paired with a text equivalent.

## When to use

Use icons to support a label or to mark state next to text. Use the 16px size in lists and table rows, 24px in menus and toolbars, 32px and 48px only on larger surfaces.

## What you provide

```tsx
<Icon name="calendar" label="Open calendar" />   // stands alone: label is required
<Button icon="filter">Filter</Button>            // text next to it: no label needed
```

Names: search, close, check, plus, minus, chevron-left, chevron-right, chevron-up, chevron-down, arrow-up, arrow-down, calendar, clock, filter, sort, group, info, warning, error, pencil, trash, user, free-text, link, history, pill, refresh, more, lock, bell.

## Guidance implemented

- Icons and Symbols: explanatory text is mandatory (visible label or accessible name) [M].
- Accessible name describes the function, not the picture ("Save", not "Disk") [M].
- Colour is never the only indicator of meaning [M]; icons inherit text colour and carry no colour of their own.
- No text baked into the graphic; no hands, eyes or faces.
- Sizes 16, 24, 32, 48 follow the icon size guidance; 20 is a [suggested] in-between for dense inputs.

## Do and don't

- Do keep the same icon for the same meaning across the application.
- Don't use an icon as the only way to reach a function; provide a menu item or keyboard shortcut too.
- Don't use blue or green icons for high-importance items (they read as low urgency).

## Accessibility

With `label`, the SVG has `role="img"`, `aria-label` and a `title`. Without it, the SVG is `aria-hidden`.
