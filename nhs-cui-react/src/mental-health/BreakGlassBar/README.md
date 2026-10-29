# BreakGlassBar

The emergency access bar above the banner while a break-glass grant is active: end time with zone, time left, reason, "Every view is recorded", and "End access now".

## When to use

- On every screen for a person under an emergency access grant; `MhPatientBanner` renders it from `emergencyAccess`.

## What you provide

- `endsAt`, `reason`, `onEnd`, `busy`, `now`, `timeZone`, `labels`.

```tsx
<BreakGlassBar endsAt={grant.endsAt} reason={grant.reasonLabel} onEnd={endGrant} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Restricted surface, key glyph, inline-start bar, "Emergency access ends 15:32 AEDT (in 58 minutes). Reason: .... Every view is recorded." with "End access now" [suggested].
- Never dismissible; no close control [suggested].
- The end time in the jurisdiction's zone with the zone named, then the relative time [suggested].
- Re-read once a minute, no animation [suggested].
- Once ended it says so and offers no action [suggested].

## Do and don't

- Do end the grant on the server when "End access now" is pressed.
- Don't hide the bar on any screen about the person while the grant lasts.

## Accessibility

- A `region` named "Emergency access"; the end time and reason in text; one button.

## Regional behaviour

- Default zone from `ClinicalLocaleProvider`.
