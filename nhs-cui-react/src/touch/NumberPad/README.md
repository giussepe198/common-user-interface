# NumberPad

Large number pad (P2): 60 px keys in a 3 by 4 grid with decimal point and delete, and a value display with unit and previous value.

## When to use

- Entering a clinical number on a phone without the system keyboard (observations, doses, volumes). ObservationKeypadEntry uses it.

## What you provide

- `value` / `defaultValue` / `onChange` (text, so "36." survives while typing), `label` (required), `unit`, `previous`, `aside`.
- Rules: `allowDecimal` (default false), `maxDecimals` (default 2), `maxLength` (default 6). `hideDisplay` to show the value elsewhere; `keyboard` (default true).

```tsx
<NumberPad label="Temperature" unit="°C" allowDecimal maxDecimals={1} previous="Previous 37.2 °C at 09:55" onChange={setText} />
```

Utilities: `applyNumberPadKey`, `parseNumberPadValue`, `numberPadKeyFromKeyboard`.

## Guidance implemented

- Phase 4 mobile rules [M]: keys 60 px high (well above 48 px), 26 px digits, value at 52 px with tabular numbers.
- Safe number entry [suggested; ACSQHC terminology recommendations, ISMP]: a leading point becomes "0.", no second point, no leading zeros, decimal places limited; the point key is disabled where decimals are not allowed.

## Do and don't

- Do always give a `unit`.
- Don't use it for identifiers (NHS number, NHI); use the patient area's inputs.

## Accessibility

- Keys are buttons with names ("Decimal point", "Delete last digit"); the group is named "<label> number pad".
- The value is an `output` labelled by the visible label and announced politely; "No value" is read when empty.
- Digits, point, Backspace and Delete on a hardware keyboard work while focus is in the pad.
