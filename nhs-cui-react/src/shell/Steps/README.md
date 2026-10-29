# Steps

Numbered steps of a multi-step task, with done, current and not started shown in words.

## When to use

- A task split over several screens that is done in order (record leave, import data).

## What you provide

- `label` (accessible name), `items`: `{ id, label, description?, error? }[]`, `current` (index), `onStepSelect(index, id)` for going back, `orientation`, `stateLabels`.

```tsx
<Steps label="Steps to record leave" current={1} items={[{ id: 'who', label: 'Choose person' }, { id: 'details', label: 'Leave details' }, { id: 'check', label: 'Check and save' }]} />
```

## Guidance implemented

- MSP-1440 [R]: minimise navigation controls: only finished steps are buttons, later steps are not links [suggested].
- State in words, a tick or number, weight and colour together; `aria-current="step"` on the current step.
- A step with a problem shows the error icon and "needs attention".
- [suggested] Horizontal steps stack vertically in containers under 520 px.

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do keep to five steps or fewer.
- Don't use Steps as tabs for sections people move between freely: use Tabs.

## Accessibility

- An ordered list named by `label`; each step reads "(step n of m, state)".
