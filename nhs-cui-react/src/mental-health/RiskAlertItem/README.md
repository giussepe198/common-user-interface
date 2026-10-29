# RiskAlertItem

One risk alert or risk category: the severity word and category with the CUI alert symbol, the alert in words, the clinician's own word for the level when recorded, the review date and who recorded it.

## When to use

- Inside `RiskAlertList`, the risk screen and the safety summary.

## What you provide

- `alert`: `id`, `category` (alert type words), `severity` (`high`, `moderate`, `low`), `text`, `levelLabel` (words only), `reviewDue`, `recordedBy`, `recordedAt`.
- `severityLabels`, `needsAcknowledgement` and `onAcknowledge`, `onOpen`, `now`, `timeZone`.

```tsx
<RiskAlertItem alert={{ id, category: 'Safety to staff', severity: 'high', text: 'Two staff for home visits', reviewDue }}
  needsAcknowledgement={!acknowledged} onAcknowledge={recordAck} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- CUI alert symbols (alertsymbdes s7 and s8) (CUI `AlertSymbol`): high uses the prohibition circle (red, no-go), moderate the warning triangle (yellow, caution), low the information bubble (blue, advisory), each with a text equivalent [suggested mapping].
- The severity word first ("High alert:", "Medium alert:", "Low alert:"); high and moderate differ in symbol shape, not hue alone [suggested].
- Never a numeric score; a numeric `levelLabel` ("7/10", "Score 4") is not shown and a note says why [suggested behaviour]. Never green: no success tokens are used.
- Past its review date the alert stays and says "Review overdue (due dd-Mmm-yyyy)" in words [suggested].
- An unacknowledged high alert shows expanded with "High alert. Read before you continue." and "Acknowledge alert", whose accessible name names the alert; acknowledging collapses, never dismisses [suggested].
- AlertItem and AlertContainer from the CUI administration area are decision support alerts (summary, details, override); they do not fit person alerts, so they are not reused [suggested].

## Do and don't

- Do use the service's alert types and wording guidance for `category` and `text`.
- Don't add a close or snooze control.

## Accessibility

- A `group` labelled by its title; the symbol has a text equivalent; review state in words; acknowledgement is a real button named after the alert.

## Regional behaviour

- None; dates in the locale's zone.
