# NhiDisplay

Read-only New Zealand NHI number: 7 upper-case characters, never grouped, with invalid and test numbers flagged in words.

## When to use

- Banners, headers and lists in NZ mode, in place of the NHS Number (G11 12.6).

## What you provide

- `value`, optional `label` ("NHI" in banners), `flagInvalid`, `flagTestNumbers` (default true), `showFormat`, `onOpenRecord`.

```tsx
<NhiDisplay label="NHI" value="ZBN77VL" flagTestNumbers={false} />
```

## Guidance implemented

- G11 1.3 [M]: upper case, 7 contiguous characters ([UNCERTAIN] no NZ grouping exists; the NHS 3-3-4 grouping is not used).
- G11 1.1-1.2 [M]: checked with mod 11 (legacy) or mod 23 (new); failures shown as supplied with "not a valid NHI".
- HISO 10046 [M]: Z-range numbers flagged "Test NHI".
- G11 1.1 [suggested]: `showFormat` adds "(legacy format)" or "(new format)" so users can tell them apart.
- Not built: linking a dormant NHI to its live NHI ([UNCERTAIN] not specified).
- HISO 10046:2024 2.1.2 [M]: where a person has more than one NHI, one is live and the others dormant. `status="dormant"` shows "Dormant NHI" in text and "Live NHI: ZBN77VL"; `onUseLiveNhi` adds a "Use live NHI" button (G12 section 4). Wording is [suggested]; no source specifies it.
- HL7 NZ Base: the live NHI is `identifier.use = "official"`, dormant NHIs `"old"`; map these to `status`.

## Do and don't

- Do turn off `flagTestNumbers` only in test environments.

## Accessibility

- Flags are text; icons are decorative.

## Regional behaviour

- NZ only.
- NZ dormant and live NHIs: G12 section 4.
