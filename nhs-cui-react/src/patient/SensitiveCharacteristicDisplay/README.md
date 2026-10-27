# SensitiveCharacteristicDisplay

A read-only sensitive characteristic (variations of sex characteristics, sexual orientation or sexual identity), marked "Sensitive" and hidden until the user chooses to show it.

## When to use

- Demographic detail views where the host has enabled display for this user (`enabled`). It renders nothing otherwise; keep it out of banners and lists.

## What you provide

- `topic`, `value` (`{ code, detail? }` or null), `enabled`, `region`, `label`, `concealed` (default true), `questionSet`, `unknownText`.

```tsx
<SensitiveCharacteristicDisplay enabled={canSee} topic="variations-of-sex-characteristics" value={vsc} />
```

## Guidance implemented

- Labels from the ABS 2020 output (AU) and Stats NZ classifications (NZ); letter codes (S, G, B, T, U, Z, Y, N) are accepted as well as numbers.
- "Different term" and "Other" show the person's own words.
- Supplementary codes show their label ("Not stated").
- Opt-in, "Sensitive" marker in text and "Recorded, hidden" with Show/Hide are [suggested] (screen privacy).

## Do and don't

- Do restrict `enabled` to users with a need to know.
- Don't use the value to infer sex for clinical calculations.

## Accessibility

- The Show/Hide button is a toggle with `aria-pressed`; the marker is text plus icon.

## Regional behaviour

- AU: ABS 2020. NZ: Stats NZ VSC and sexual identity ("Sexual identity" label). GB: no value set; renders nothing unless `questionSet` is given.
- Sources: G12 section 7.
