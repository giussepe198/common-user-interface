# IwiInput

The HISO 10094:2022 iwi affiliation question with entry of any number of iwi through an as-you-type list that ignores macrons, and free text for an iwi not on the list.

## When to use

- After `MaoriDescentInput` in NZ mode.

## What you provide

- `value`/`onChange` or `defaultValue`: `{ knows: 'yes' | 'no' | null, iwi: [{ code?, name, rohe? }] }`.
- `iwiList` (reference list filtered in the browser) or `searchIwi(query)` (your look-up); `showTeReo`, `purpose`, `maxSuggestions`, `error`.

```tsx
<IwiInput iwiList={iwiClassification} value={iwi} onChange={setIwi} />
```

## Guidance implemented

- HISO 10094 [M]: question "Do you know the name(s) of your iwi (tribe or tribes)?" with "Kei te mōhio koe ko wai tō iwi, ō iwi rānei?"; Yes leads to "Name(s) of iwi and rohe/region (if known)", No ends the question.
- [M] As-you-type list ignores macrons ("ngapuhi" finds "Ngāpuhi"); text is stored with macrons.
- [M] Free text is accepted for an iwi not on the list (marked "not on the list").
- [M] Adding another iwi needs no extra clicks: Enter adds, the box clears and keeps focus.
- [M] At least six iwi can be recorded (no limit); never a "main" iwi.
- [M] The list carries a "for guidance only" note.
- Rohe or region is recorded per iwi.
- Iwi residual codes (`NZ_IWI_RESIDUAL_CODES`) are exported for your mapping; the control does not assign them.

## Do and don't

- Do treat iwi data as taonga: show it only where needed and control access (G11 11.3).
- Don't make the list restrict entry.

## Accessibility

- The entry is an ARIA combobox (arrow keys, Enter, Esc) with `aria-activedescendant`; result counts are announced; recorded iwi are a table with labelled rohe boxes and named Remove buttons; te reo text is `lang="mi"`.

## Regional behaviour

- NZ only.
