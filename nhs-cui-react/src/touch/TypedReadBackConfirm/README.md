# TypedReadBackConfirm

Typed read-back (P4): the person types the value they are about to give, which must match the expected value and unit before the commit is allowed.

## When to use

- High-risk doses and volumes where the value must be read from the order and typed, not just accepted.

## What you provide

- `expected`: `{ value, unit?, unitAliases? }`; `label` (required); `inputLabel`; `value` / `defaultValue` / `onChange`.
- `onMatchChange(matched, result)`: enable the commit only while `matched` is true.
- `subject` (default "the order"), `validate` (`settled` or `blur`), `inputMode`, `autoFocus`, `disabled`.

```tsx
<TypedReadBackConfirm label="Type the dose you are giving" expected={{ value: 6, unit: 'units' }} onMatchChange={setMatched} />
```

Utility: `checkReadBack`, `READ_BACK_UNSAFE_UNITS`.

## Guidance implemented

- Phase 4 mobile rules [M]: typed read-back for high-risk commits; base text 16 px or more (28 px here).
- The mismatch message does not reveal the expected value [suggested].
- Unsafe forms are refused even if numerically equal [suggested; ACSQHC terminology recommendations, ISMP]: trailing zero ("6.0"), missing leading zero (".5"), and abbreviated units ("U", "IU", "cc", "ug").

## Do and don't

- Do show the order on the same screen so the value is read, not remembered.
- Don't pre-fill the field.

## Accessibility

- The input has a name that includes the unit; the result is in a polite live region linked by `aria-describedby`; `aria-invalid` is set on a mismatch.
- Match and mismatch carry an icon and words as well as colour.
