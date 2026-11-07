# RiskAlertList

The person's active risk alerts in severity order: high alerts always visible, moderate and low limited by `maxVisible` with an "and N more alerts" button; never dismissible.

## When to use

- The risk and alerts screen, the safety summary and side panels (alerts outside the banner).

## What you provide

- `alerts` (`RiskAlertData[]`), `heading`, `headingLevel`, `maxVisible`, `onShowAll`, `emptyText`, `unacknowledgedIds`, `onAcknowledge`, `onOpen`, `severityLabels`, `now`, `timeZone`.

```tsx
<RiskAlertList alerts={alerts} maxVisible={3} unacknowledgedIds={pendingHigh} onAcknowledge={ack} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- High, then moderate, then low; the given order is kept within a severity [suggested].
- The limit applies to moderate and low only; high alerts show past it; overflow is a button that expands in place or calls `onShowAll`; nothing is dropped silently [suggested].
- No close, snooze or "don't show again" [suggested].
- Empty is "No alerts recorded" in a dashed warning chip, never blank [suggested].
- Acknowledgement passed to the items for unacknowledged high alerts [suggested].

## Do and don't

- Do pass every active alert; let the list decide what is behind "more".
- Don't sort by date in the app; the severity order is fixed.

## Accessibility

- A `section` with a heading and a count; a `ul` of items; the overflow is a button.

## Regional behaviour

- None.
