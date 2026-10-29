# Stack

Vertical layout helper: children one under another with a token gap, as classes (no inline style).

## When to use

- Spacing blocks in a page or panel when the app bans `style=`.
- Not for form fields side by side: use FormRow or FormGrid.

## What you provide

- `gap` (0, 1, 2, 3, 4, 6, 8: the space token steps; default 2 = 8 px), `align`, `as` (div, section, ul, ol, form, fieldset), any HTML attributes except `style`.

```tsx
<Stack gap={3}><PageHeader title="Diary" /><Panel title="Today">...</Panel></Stack>
```

## Guidance implemented

- Spacing from tokens only (CONVENTIONS, dense by default) [suggested].
- Children get `min-width: 0` so long content wraps instead of widening the page.

## Regional behaviour

- None.

## Do and don't

- Do use the smallest gap that separates the groups.
- Don't nest stacks to fake a grid.

## Accessibility

- Purely presentational; the element you choose keeps its semantics (lists reset their bullets visually only).
