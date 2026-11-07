# LegalOrderCard

One legal order as a card: order type and status as the heading, start, expiry with countdown, review and hearing dates, conditions, responsible clinician and actions.

## When to use

- The legal status screen and the order history. In the banner use `LegalStatusBadge`.
- A record overview's legal status panel, with `facts={['expires']}`.

## What you provide

- `orderType` (host words), `state`, `unconfirmedWarning`, `startedAt`, `expiresAt`, `reviewAt`, `hearingAt`, `conditions`, `responsibleClinician` (`name`, `role` in the host's words), `source`, `countdown` (host thresholds and words), `labels`, `timeZone`, `now`, `headerExtra`, `actions`.
- `facts` to show only some facts, in the card's order (default all six). A summary, such as a record overview that
  holds only the order and its end, passes `['expires']` so it never shows "Not recorded" for a fact it was not given.

```tsx
<LegalOrderCard orderType={host.labels['order.cto']} startedAt={o.start} expiresAt={o.expiry} hearingAt={o.hearing}
  conditions={o.conditions} responsibleClinician={{ name: o.psychiatrist, role: host.labels['role.ap'] }}
  labels={{ hearing: host.labels['tribunal.hearing'] }} actions={<Button size="sm">Record outcome</Button>} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- An order received as information shows its source line [suggested].
- The heading is a `LegalStatusBadge`, so an unconfirmed order says so in the heading [suggested].
- The expiry uses `OrderCountdown`; thresholds come from the host [suggested].
- Responsible clinician with the statutory role in the host's words [suggested].
- Every date and time in the jurisdiction's zone, with the zone named [suggested].
- PAB-0019: no slot is blank ("Not recorded", "No conditions recorded").
- Every label overridable from the host; defaults are [suggested].
- Facts in two columns from 520px container width, one below; label above value under 360px [suggested].

## Do and don't

- Do supply actions as library buttons; the card holds no business rules.
- Don't put legal reasoning in app code; pass the host's words and dates.

## Accessibility

- An `article` labelled by its heading; facts are a description list; conditions are a list.

## Regional behaviour

- None in the control. Previews show illustrative Victorian and NZ wording.
