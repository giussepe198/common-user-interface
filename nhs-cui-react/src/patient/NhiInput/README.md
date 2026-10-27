# NhiInput

A single text box for entering a New Zealand National Health Index (NHI) number in either the legacy or the new format, checked when the field is left.

## When to use

- Recording or searching for a patient's NHI in NZ mode (G11 1.1-1.3).

## What you provide

- `value`/`onChange(shown, nhi)` or `defaultValue`; `label` (default "NHI number"), `hint`, `required`, `flagTestNumbers` (default true), `error`, `onValidityChange`.

```tsx
<NhiInput value={nhi} onChange={(_, n) => setNhi(n)} required flagTestNumbers={env === 'production'} />
```

Dormant NHI (G12 4): `lookupNhi(nhi) => { status: 'live' } | { status: 'dormant', liveNhi } | { status: 'not-found' }` (or a Promise of one), `onUseLiveNhi`.

## Guidance implemented

- G11 1.1 [M]: both formats valid indefinitely: legacy AAANNNC (mod 11 check digit) and new AAANNAX (mod 23 check letter); letters exclude I and O; 7 characters.
- G11 1.2 [M]: algorithms tested against every published example (ZAC5361, ZBN77VL, ACA31FM, ASE37QK, ARE62RS, BGJ06AS, BGA44DT, BWT41BY).
- G11 1.3 [M]: lower case and spaces accepted; upper case on leaving the field; never grouped.
- G11 1.3 [UNCERTAIN, library wording]: "Enter an NHI number", "NHI number must be 7 characters: 3 letters, then either 4 numbers, or 2 numbers and 2 letters", "NHI numbers do not use the letters I or O", "Check the NHI number. It is not a valid NHI".
- HISO 10046 [M]: Z-range NHIs are for testing; a warning "This is a test NHI number" is shown (turn off with `flagTestNumbers={false}` in test environments).
- Label "NHI number" in forms, "NHI" in banners ([UNCERTAIN] no mandated label).
- G12 section 4: with `lookupNhi`, a complete valid NHI is looked up through the host (sync or Promise; no network here). Dormant: "This NHI is dormant. The live NHI is ZBN77VL." with "Use live NHI", which replaces the value and calls `onChange` and `onUseLiveNhi(live, dormant)`. Not found: "No NHI record was found for this number." Wording is [suggested].

## Do and don't

- Do use Z-range numbers in examples and tests.
- Don't add separators or spaces to the NHI.
- Don't silently change O to 0 or I to 1.

## Accessibility

- Visible label, hint and messages linked with `aria-describedby`; errors use `role="alert"`, the test warning `role="status"`.

## Regional behaviour

- NZ only. Source: HISO 10046:2024 https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf ; https://www.tewhatuora.govt.nz/health-services-and-programmes/health-identity/national-health-index/upcoming-changes-nhi
- NZ dormant NHI lookup: G12 section 4.
