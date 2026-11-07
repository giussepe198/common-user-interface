# ObservationLevel

The prescribed engagement and observation level as a badge: the level in words, the interval for intermittent checks and any detail.

## When to use

- Beside a person on ward lists, observation rounds, the bed board, handover and the person's summary.
- Not for recording a check (use `ObservationRound`).

## What you provide

- `level` (`constant`, `close`, `intermittent`, `general`), `labels` (the host's words), `intervalMinutes` or `intervalText`, `detail`, `size`.

```tsx
<ObservationLevel level="intermittent" intervalMinutes={15} labels={policy.observationLabels} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Observation levels are part of the mental health extension; level names and intervals come from the service's policy or the host's configuration. Defaults are [suggested].
- Status always has words and an icon; the more intensive levels add the inline-start bar; colour is never the only carrier [suggested mapping: constant danger, close warning, intermittent info, general neutral].
- Interval in words ("every 15 minutes") [suggested].

## Do and don't

- Do pass the words your observation policy uses; the defaults are placeholders.
- Don't treat the badge as the prescription itself; it shows what the host recorded.

## Accessibility

- Plain text; the eye icon is decorative. Works in forced colours (border kept).

## Regional behaviour

- None in the control; level names differ between services and come in through `labels`.
