# Skeleton

Placeholder in the shape of content that is loading.

## When to use

- The first load of a list, panel or chart that takes more than a moment.
- Not for an empty result (EmptyState) or a long task with progress (ProgressBar).

## What you provide

- `variant` ('text', 'rows', 'block'), `lines`, `blockSize` ('sm', 'md', 'lg'), `label` (default "Loading").

```tsx
{loading ? <Skeleton variant="rows" lines={8} label="Loading caseload" /> : <PatientList ... />}
```

## Guidance implemented

- The shapes are hidden from screen readers; one status line says "Loading" [suggested].
- A gentle opacity pulse, no gradient (CONVENTIONS); it stops under reduced motion.
- Rows use the control height token, so the placeholder matches the dense list it stands for.

## Regional behaviour

- None.

## Do and don't

- Do match the shape and count of what will load.
- Don't leave a skeleton up after an error: replace it with a Message.

## Accessibility

- `aria-busy="true"` on the placeholder and one `role="status"` label.
