# MedicareNumberInput

Entry of an Australian Medicare card number with the Individual Reference Number (IRN) in its own box, grouped as printed on the card.

## When to use

- Recording a patient's Medicare details (G10 1.3), for example at registration in general practice.

## What you provide

- `value`/`onChange(formatted, digits)` or `defaultValue`; `irn`/`onIrnChange` or `defaultIrn`; `required`, `irnRequired` (default true), `error`, `onValidityChange` (true only when number and IRN are valid).

```tsx
<MedicareNumberInput value={medicare} onChange={(_, d) => setMedicare(d)} irn={irn} onIrnChange={setIrn} />
```

Valid to (G12 1): `showValidTo`, `validTo`/`defaultValidTo`/`onValidToChange(text, normalised)`, `validToRequired`, `expiringWithinMonths`, `now`.

```tsx
<MedicareNumberInput value={n} onChange={(f, d) => setN(d)} irn={irn} onIrnChange={setIrn} validTo={vt} onValidToChange={(t) => setVt(t)} />
```

## Guidance implemented

- G10 1.3 [M]: 10 digits: 8-digit identifier, check digit (weights 1, 3, 7, 9, 1, 3, 7, 9, mod 10), card issue number that is not 0.
- G10 1.3 [UNCERTAIN, configurable data]: first digit 2 to 6 (`MEDICARE_FIRST_DIGITS`); 4-5-1 grouping as on the card (`MEDICARE_NUMBER_GROUPING`).
- AU-ID-03 [M]: a Medicare number is shared across a family, so the IRN (1 to 9) is required by default whenever a number is entered.
- AU-X-03 [M]: check digit and structure block; nothing is corrected.
- [suggested] Messages: "This is not a valid Medicare card number. Check the digits and try again", "The last digit, the card issue number, cannot be 0", "Enter the IRN, the number to the left of the person's name on the card".
- Not built: card "valid to" date ([UNCERTAIN] format MM/YYYY or MM/YY).
- G12 section 1 [M]: optional "Valid to" box (card wording "VALID TO 06/20XX", Services Australia). Accepts MM/YYYY and MM/YY, normalised to MM/YYYY when left; an unreadable value is an error and blocks validity.
- Expired ("Card expired: valid to Sep-2026 has passed. Ask for the current card.") and expiring ("Card expires soon: ...") are warnings in text with an icon, never colour alone; they do not block entry.
- A card is read as valid to the last day of its valid-to month [suggested]; "expiring" means within `expiringWithinMonths` (default 1, the Services Australia RHCA reminder period) [suggested].
- The box appears only when `showValidTo`, `validTo`, `defaultValidTo` or `onValidToChange` is supplied, so existing forms are unchanged.

## Do and don't

- Do record the IRN with every Medicare number.
- Don't use the Medicare number as a stand-alone patient identifier (RACGP CG2).
- Don't encode card colour (green, blue, yellow) by colour alone.

## Accessibility

- Number and IRN are a labelled group; each box has a visible label and its own error linked with `aria-describedby`.

## Regional behaviour

- AU only. Source: https://air.claiming.com.au/docs/validation-and-checks/ (secondary); RACGP Standards CG2.
- AU valid to date: G12 section 1, https://www.servicesaustralia.gov.au/sites/default/files/2026-01/talking-points-medicare-card-is-changing.docx
