# IhiInput

A single text box for entering an Australian Individual Healthcare Identifier (IHI), which groups the 16 digits as you type and checks the prefix and check digit when the field is left.

## When to use

- Recording or searching for a patient's IHI in Australian mode (G10 1.1).
- Use `PatientIdentifierInput` when the identifier type is chosen at run time.

## What you provide

- `value`/`onChange(formatted, digits)` or `defaultValue`; `label` (default "IHI"), `hint`, `required`, `error` (for example from an HI Service search), `onValidityChange`.

```tsx
<IhiInput value={ihi} onChange={(formatted, digits) => setIhi(digits)} required />
```

## Guidance implemented

- G10 1.1 [M]: exactly 16 digits, prefix 800360, Luhn check digit over all 16 digits (HL7 AU Base inv-ihi-value-0..2).
- AU-X-03 [M]: the check digit and structure block entry; nothing is ever corrected for the user.
- G10 1.1 [C]: digits grouped 4-4-4-4 as you type ([UNCERTAIN]: common practice, no primary display rule; the grouping constant `HEALTHCARE_IDENTIFIER_GROUPING` can be changed).
- Letters are refused; a paste containing letters is refused whole with a note, the same approach as `NhsNumberInput` (NUM-0018) [suggested].
- Messages [suggested]: "Enter the IHI", "The IHI must have 16 digits", "An IHI starts with 8003 60. Check the number", "This is not a valid IHI. Check the digits and try again".

## Do and don't

- Do show the IHI status next to the number wherever it is displayed (`IhiDisplay`).
- Don't use the IHI as the only identifier on screen; show at least three approved identifiers (AU-PI-01).
- Don't accept an IHI that fails the Luhn check, even if the user insists.

## Accessibility

- Visible `<label for>`; hint, note, error and warning linked with `aria-describedby`.
- `inputmode="numeric"`; errors use `role="alert"` and `aria-invalid`.

## Regional behaviour

- AU only. GB uses `NhsNumberInput`; NZ uses `NhiInput`.
- Source: HL7 AU Base IHI profile https://hl7.org.au/fhir/5.0.0/StructureDefinition-au-ihi.html
