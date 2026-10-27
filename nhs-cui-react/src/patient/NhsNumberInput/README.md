# NhsNumberInput

A single text box for entering one NHS Number, which groups the digits as "123 456 7890" while typing or pasting and checks the number when the field is left.

## When to use

- Searching for or recording a patient's NHS Number.

## What you provide

- `value`/`onChange(formatted, digits)` or `defaultValue`, `label` (default "NHS Number"), `required`, `validateChecksum`, `error` (for example from a PDS check), `onValidityChange`.

```tsx
<NhsNumberInput
  value={nhs}
  onChange={(formatted, digits) => setNhs(digits)}
  required
/>
```

## Guidance implemented

- NUM-0010, NUM-0011 [R/M]: one box, one number; digits after the tenth are dropped with a note.
- NUM-0012, NUM-0013 [R]: the box fits the full formatted number and no more, one line high.
- NUM-0014 [R]: keyboard, paste and drop all go through the same sanitising.
- NUM-0015 [R]: grouping as you type ("1234" shows "123 4"); the caret stays after the digit just typed.
- NUM-0016, NUM-0017 [M]: the value is only ten digits and two spaces; hyphens, dashes, slashes, back slashes, full stops, commas and colons are discarded.
- NUM-0018 [M]: letters are never accepted, so old-format and temporary numbers (for example "BIR1234567") cannot be entered. A paste that contains letters is refused whole, rather than keeping its digits, and a note explains why [suggested].
- Hint "e.g. 123 456 7890" and the tooltip text from the guide are the defaults.
- [suggested] Validation when the field is left: "The NHS Number must have 10 digits" and, using the standard Modulus 11 check digit (defined by UK GDSC, outside this guide), "This is not a valid NHS Number. Check the digits and try again". An empty required field shows "Enter the NHS Number". With `required` the label reads "NHS Number (required)", as the other identifier inputs do.
- [suggested] The example is shown as a hint above the box rather than as a prompt inside it, because the box is sized to the number and a longer prompt would be cut off.

## Do and don't

- Do let users paste numbers in any common format.
- Don't split the number across three boxes.
- Don't put more than one NHS Number in a box.

## Accessibility

- Visible `<label for>`; hint, note and error are linked with `aria-describedby`.
- `inputmode="numeric"` gives a number keypad on touch devices.
- Errors set `aria-invalid` and use `role="alert"`; notes about discarded input use `role="status"`.

## Regional behaviour

- GB only. In AU use `IhiInput`, `MedicareNumberInput` or `DvaNumberInput`; in NZ use `NhiInput`; `PatientIdentifierInput` picks by region.
