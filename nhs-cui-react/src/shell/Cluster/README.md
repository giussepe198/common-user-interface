# Cluster

Horizontal layout helper: children side by side with a token gap, wrapping when space runs out.

## When to use

- Button groups, chips, facts in a line, toolbars that may wrap.
- Not for form fields: use FormRow or FormGrid, which keep controls aligned.

## What you provide

- `gap` (space token step, default 2), `align` (default 'center'), `justify` ('start', 'center', 'end', 'between'), `nowrap`, `as` (div, ul, ol, span).

```tsx
<Cluster justify="end"><Button>Cancel</Button><Button variant="primary">Save leave</Button></Cluster>
```

## Guidance implemented

- Wraps by default, so nothing scrolls sideways at 320 px.
- Spacing from tokens only [suggested].

## Regional behaviour

- None.

## Do and don't

- Do keep reading order and visual order the same.
- Don't use `nowrap` for content whose length you do not control.

## Accessibility

- Presentational; choose `as="ul"` for a real list of items.
