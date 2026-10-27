# PatientIdentifierDisplay

Labelled read-only identifier that applies the right label, grouping and checks for its type; the banners use it for every identifier.

## When to use

- Anywhere a patient identifier is shown and its type varies by region or record.

## What you provide

- `type`, `value`; optional `label` (e.g. "UR number" for an AU `mrn`), `irn` (Medicare), `ihiNumberStatus`, `ihiRecordStatus`, `dvaCardType`, `region`, `showLabel`, `flagInvalid`, `flagTestNumbers`, `onOpenRecord`.

```tsx
<PatientIdentifierDisplay type="medicare" value="2123456701" irn="1" />
```

## Guidance implemented

- G10 1.6 [M]: never an unlabelled number: labels "NHS No.", "IHI", "URN", "Medicare", "DVA", "NHI".
- NUM-0002, G10 1.1, G10 1.3, G10 1.4, G11 1.3: grouping per type (3-3-4; 4-4-4-4; 4-5-1 with IRN; DVA as on the card; NHI ungrouped).
- AU-ID-01, AU-ID-03, HISO 10046: status qualifiers, IRN pairing and test-NHI flag in text.
- PAB-0019 [M]: missing value shows "Not Known" after the label.
- G12: forwards `medicareValidTo` (Medicare valid to and expiry flags), `nhiStatus`, `liveNhi` and `onUseLiveNhi` (dormant NHI), and `now`.

## Do and don't

- Do pass the IHI statuses and Medicare IRN when you have them.

## Accessibility

- Each label has a keyboard-accessible definition tooltip; flags are text.

## Regional behaviour

- The `mrn` default label is "URN" in AU (NIMC, AU-ID-04) and "MRN" in GB and NZ [suggested]; everything else depends on the type, not the region.
- AU Medicare valid to and NZ dormant NHI: G12 sections 1 and 4.
