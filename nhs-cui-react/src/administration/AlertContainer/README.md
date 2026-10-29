# AlertContainer

Non-modal container listing all active decision support alerts for the patient, grouped with High Priority above Priority.

## When to use

- Opened from the alert indicator or from a new-alert pop-up, alongside the patient record.

## What you provide

- `alerts`: `DecisionSupportAlert[]` (`id`, `status`, `occurredAt`, `summary`, `source`, `details`, `actions`).
- Optional `onRecordResponse(alertId, response)`, `onDismiss(alertId)`, `onAlertExpanded`, `height`, `resizable`, `minWidth`, `minHeight`, `heading`.

```tsx
<AlertContainer alerts={alerts} onRecordResponse={(id, r) => record(id, r)} onDismiss={dismiss} />
```

## Guidance implemented

- 2.4: grouped by status, High Priority group above Priority, never mixed; newest first within each group (`sortDecisionSupportAlerts`).
- 2.4: High Priority alerts expanded by default, Priority collapsed to the header; headers toggle.
- 2.4: no resize control on individual alerts; one on the container (bottom right) that resizes all; vertical scroll when alerts exceed the space.
- 2.2: fixed minimum dimensions.
- 2.4: alerts demand attention without modal behaviour.

## Other alert kinds [suggested]

`children` lists host-rendered alert items of another kind in the same frame (for example risk alerts that must be acknowledged); `alerts` is then not rendered and `count` gives the words beside the heading. `height="auto"` sizes the container to its content (with `--cui-ds-alerts-max-height` as an optional cap) and `headingLevel` sets the heading level.

## Do and don't

- Do use `onAlertExpanded` to track viewed alerts for `decisionSupportAlertIndicatorState`.
- Don't show the container as a modal dialog.
- [suggested] A count of active and High Priority alerts is shown in the header and announced.

## Accessibility

- Labelled region with a polite count; the scrolling list is keyboard focusable.
- Each alert is an article with a heading button using `aria-expanded`.

## Regional behaviour

No differences between GB, AU and NZ: the decision support and Nil by Mouth guidance has no AU or NZ counterpart in G10 or G11. Dates and times use the shared formats.

## Narrow screens [suggested]

`height`, `minWidth` and `minHeight` are passed as CSS variables (`--cui-ds-alerts-height`, `--cui-ds-alerts-min-width`, `--cui-ds-alerts-min-height`); the minimum width never exceeds the space available, so the container fits a 320px screen. The resize handle is turned off on a coarse pointer.
