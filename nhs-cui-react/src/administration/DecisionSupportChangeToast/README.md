# DecisionSupportChangeToast

Small non-modal pop-up announcing a change in decision support availability or a new alert, fading out after 5 to 10 seconds.

## When to use

- Near the decision support title when a service changes state (the status indicator renders it for you via `notification`).
- Near the alert indicator when a new alert arrives; clicking it opens the alert container.

## What you provide

- `dateTime`, `message`; optional `status` (`'High Priority' | 'Priority'`), `durationMs`, `onClose`, `onClick`, `anchored`.

```tsx
<DecisionSupportChangeToast dateTime={alert.occurredAt} status="High Priority"
  message="The potassium level is 7.7 mmol/L" onClick={openAlerts} />
```

## Guidance implemented

- 2.1.1: pop-up with date (dd-Mmm-yyyy) and 24-hour time and the change text, fading out after about 5 to 10 seconds without obstructing the application.
- 2.4: new alert pop-up with status, date and time in the header, alert icon and description; clicking it opens the alert container.

## Do and don't

- Do keep the information available elsewhere (service list or alert container); the pop-up is transient.
- Don't make it modal or block input.
- [suggested] Duration is clamped to 5 to 10 seconds and pauses while hovered or focused.

## Accessibility

- Announced through a polite live region; when `onClick` is set it is a button (Enter or Space).
- Fade respects reduced motion.

## Regional behaviour

No differences between GB, AU and NZ: the decision support and Nil by Mouth guidance has no AU or NZ counterpart in G10 or G11. Dates and times use the shared formats.
