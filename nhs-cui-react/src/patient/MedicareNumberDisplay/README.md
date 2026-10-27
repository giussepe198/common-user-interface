# MedicareNumberDisplay

Read-only Australian Medicare card number shown as printed on the card, "2123 45670 1", always with the IRN.

## When to use

- Banners and summaries in Australian mode, as a secondary identifier (G10 1.6).

## What you provide

- `value` (10 digits; an 11th digit is read as the IRN), `irn`, optional `label` ("Medicare" in banners), `flagInvalid`, `onOpenRecord`.

```tsx
<MedicareNumberDisplay label="Medicare" value="2123456701" irn="1" />
```

## Guidance implemented

- G10 1.3 [UNCERTAIN, configurable]: 4-5-1 grouping as on the card.
- AU-ID-03 [M]: shown with "IRN n"; a missing IRN is flagged "IRN not recorded" in text.
- [suggested] A number that fails the check digit is shown as supplied with "not a valid Medicare number".
- PAB-0019 [M]: missing value shows "Not Known".
- G12 section 1 [M]: `validTo` shows "Valid to 06/2028" after the IRN; "Card expired", "Card expires soon" or "Valid to date not readable" are warnings in text with an icon.

## Do and don't

- Do show it as a secondary identifier after the IHI or URN (G10 1.6).
- Don't show the number without its IRN.

## Accessibility

- Warnings are text with a decorative icon; the number stays on one line.

## Regional behaviour

- AU only.
- AU valid to date: G12 section 1.
