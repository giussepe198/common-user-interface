# PartialDateOfBirthDisplay

A labelled date of birth that may be partial, showing only the known parts, a qualifier and an age that covers every possible birth date.

## When to use

- Wherever a NZ date of birth (HISO 10046 YYYY[MM[DD]]) is displayed. `PatientBanner` uses the same rules through `partialDateOfBirth`.

## What you provide

- `value` (HISO string, ISO string, PartialDate or Date), `label` (default "Born"), `dateFormat`, `showAge`, `showQualifier`, `source` and `showSource`, `now`, `unknownText`, `onOpenRecord`.

```tsx
<PartialDateOfBirthDisplay value="197503" />   // Born Mar-1975 day not known (51y)
```

## Guidance implemented

- HISO 10046:2024 2.3.1: a partial date is year only or month and year; nothing is added.
- G11 1.4 suggested display: `1975`, `Mar-1975`, `14-Mar-1975` (G2 format) or `03/1975`, `14/03/1975`.
- Qualifier "year only" or "day not known" [suggested], so a partial date is never read as a full one.
- Age (PAB-0034 format) [suggested]: shown as usual when every possible birth date gives the same age; otherwise both, youngest first ("50y or 51y"); "up to ..." when the person may have been born after the current month began.
- Source label from HISO 10046 2.3.2, e.g. "(Proof not sighted)", when `showSource` is on.
- "Not Known" when empty (PAB-0019).

## Do and don't

- Do use this, not a date formatter, for NZ dates of birth.
- Don't calculate clinical scores from an ambiguous age without checking both ends.

## Accessibility

- Text only; the qualifier is real text, not styling.

## Regional behaviour

- NZ: HISO 10046 partial dates. GB and AU: full dates are shown exactly as `formatShortDate` would.
- Source: HISO 10046:2024 (G12 section 5).
