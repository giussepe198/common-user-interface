# DvaNumberInput

Entry of an Australian Department of Veterans' Affairs (DVA) file number, upper case without spaces, with the card type recorded as text.

## When to use

- Recording a veteran's DVA file number (G10 1.4).

## What you provide

- `value`/`onChange(value)` or `defaultValue`; `showCardType` (default true) with `cardType`/`onCardTypeChange`; `required`, `error`.

```tsx
<DvaNumberInput value={dva} onChange={setDva} cardType={card} onCardTypeChange={setCard} />
```

## Guidance implemented

- G10 1.4 [M]: upper case, no spaces, exactly as on the Veteran Card; at most 9 characters.
- G10 1.4 [UNCERTAIN]: state letter N, V, Q, S, W or T, war code, digits and optional dependant letter. The format check is advisory: it shows a warning, never an error (AU-X-03: blocking only for check digits and fixed structure).
- G10 1.4 [M]: card type (Gold, White, Orange) is a separate attribute shown as text, not colour.

## Do and don't

- Do copy the number from the card as shown.
- Don't block saving because of the advisory format warning.

## Accessibility

- Visible label; card type select has an accessible name "Card type"; warning uses `role="status"`.

## Regional behaviour

- AU only. Source: https://hl7.org.au/fhir/StructureDefinition-au-dvanumber.html
