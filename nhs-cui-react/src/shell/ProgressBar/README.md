# ProgressBar

Progress of a task in words with a thin bar.

## When to use

- A task that takes noticeable time and reports progress (an import, a report run, a questionnaire).
- Indeterminate (no `value`) when the amount is unknown.

## What you provide

- `label` (always visible unless `hideLabel`), `value`, `max` (default 100), `valueText` (e.g. "4 of 10 questions"), `tone` ('accent', 'success', 'error').

```tsx
<ProgressBar label="Importing contacts" value={120} max={480} valueText="120 of 480" />
```

## Guidance implemented

- Words lead and the bar supports them; no count-down time estimates [suggested].
- The fill width snaps to 5 % steps through classes, so no inline style is needed [suggested].
- Reduced motion stops the indeterminate animation and shows a static bar.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do change `tone` and the label together when the task stops ("Import stopped").
- Don't use a progress bar for a clinical score.

## Accessibility

- `role="progressbar"` labelled by the visible label, with `aria-valuenow`, `aria-valuemax` and `aria-valuetext`.
