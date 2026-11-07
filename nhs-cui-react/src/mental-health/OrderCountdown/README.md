# OrderCountdown

Time to a legal deadline: the absolute date, 24-hour time and zone first, then the relative time, with due-soon and overdue said in words.

## When to use

- Order expiry, review, hearing and any statutory deadline, inside `LegalOrderCard`, tables and task lists.

## What you provide

- `deadline` (computed by the host from host rules), `label` / `pastLabel` (host words, defaults "Ends" / "Ended" [suggested]), `timeZone` (default the locale's), `now`, `soonWithinMinutes` and `urgentWithinMinutes` (host thresholds), `stateLabels`, `overdueAction`, `why` and `whyLabel`.

```tsx
<OrderCountdown deadline={order.expiresAt} label={host.labels.expires} soonWithinMinutes={host.thresholds.soon}
  urgentWithinMinutes={host.thresholds.urgent} overdueAction="record the outcome" why={host.rules.expiry.text} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Absolute date, time and zone first ("Ends 14-Nov-2026 17:00 AEDT"), then "(in 17 days)"; never relative alone.
- CUI date and time display (G2, D+Ta and D+Tb): "dd-Mmm-yyyy" and 24-hour "HH:mm"; zone abbreviation as AU-DT-08 and G11 7.2, through the library's `formatZoned`.
- The instant is shown in the jurisdiction zone, not the browser's [suggested].
- Overdue is a fact and always marked; due soon and urgent come only from the host's thresholds, so the control decides no legal rule [suggested].
- Urgent and overdue add the inline-start bar; overdue says what to do [suggested].
- No animation; the clock is re-read once a minute; a change of state is announced once, politely, never on first render [suggested].
- "Why this date" disclosure for the legal basis [suggested].

## Do and don't

- Do pass the deadline the host computed; never compute it in the app.
- Don't show the relative time anywhere without the absolute one.

## Accessibility

- Words and an icon carry the state; the disclosure has `aria-expanded` and `aria-controls`; a polite live region announces threshold crossings.

## Regional behaviour

- Default zone from `ClinicalLocaleProvider` (AU Australia/Sydney, NZ Pacific/Auckland); pass the jurisdiction's zone (for Victoria, Australia/Melbourne).
