# EthnicityDisplay

Labelled list of all recorded ethnicities in the order recorded, with none marked as main.

## When to use

- Patient summaries in NZ mode.

## What you provide

- `value` (`EthnicityValue` from `EthnicityInput`), `label` (default "Ethnicity"), `codeLabels` for codes that arrive without a label, `unknownText` (default "Not recorded").

```tsx
<EthnicityDisplay value={{ entries: [{ code: '21111', label: 'Māori' }, { code: '31111', label: 'Samoan' }] }} />
```

## Guidance implemented

- HISO 10001 [M]: all recorded ethnicities shown (up to six); none labelled main; macrons kept ("Māori", "Cook Islands Māori").
- G11 4.1 [UNCERTAIN]: shown in recorded order, not prioritised order, because prioritised order implies a principal ethnicity.
- [M] The person's own words are used for "Other" when given; otherwise the coded label.
- Residual codes shown in words ("Don't know", "Refused to answer" ...).
- HISO 10001 output (G12 section 6): `outputLevel` 1 or 2 shows the distinct groups the level 4 codes aggregate to ("Codes can be aggregated by removing the last digits"), in recorded order, with "(level n groups)". Residual codes are dropped when a real response exists [suggested].
- Never prioritised and never a principal ethnicity: prioritisation is "only appropriate on output when using the ethnicity data for analysis and reporting". `prioritisedEthnicityForReporting` exists for reports only.
- More than six codes: a text warning that the Stats NZ reduction process applies. Utilities: `reduceEthnicityToSix` (Appendix A random method, injectable random source), `reduceEthnicityToThree` (level 2 priority, transitional systems; ties keep recorded order [UNCERTAIN]).

## Do and don't

- Don't sort by the prioritised output order on screen.

## Accessibility

- Plain text; items wrap only between groups.

## Regional behaviour

- NZ only.
- NZ output levels and reduction: HISO 10001:2017 sections 4.3.2, 5.5.2 and Appendix A (G12 section 6).
