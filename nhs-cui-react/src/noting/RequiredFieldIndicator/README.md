# RequiredFieldIndicator

A red asterisk placed right after a field label to mark it as required, with `RequiredKey` to explain the asterisk on the same page.

## When to use
- On every required field label (`FormField` and the choice groups add it for you with `required`).
- `RequiredKey` once per page or dialog that shows asterisks.

## What you provide
- `RequiredFieldIndicator`: optional `srText` (default "required").
- `RequiredKey`: optional children (default "Required field").

```tsx
<label htmlFor="consultant">Consultant<RequiredFieldIndicator /></label>
<RequiredKey />
```

## Guidance implemented
- CNA-1060 [M] clear distinction between required and optional; CNA-1070 [M] shown before the user starts (proactive).
- CNA-1080 [R] red asterisk; CNA-1090 [R] per field, not per section; CNA-1110 [R] immediately right of the label; CNA-1120 [M] consistent position.
- CNA-1100 [M] a key on the same page when asterisks are used (`RequiredKey`).
- CNA-1130 [R] the asterisk stays after the field is filled.

## Do and don't
- Do keep the indicator visible after filling the field.
- Don't mark whole sections as required; mark each field.

## Accessibility
- The asterisk is `aria-hidden`; screen readers hear "(required)" instead. The key reads "Asterisk: Required field".
- Red is never the only signal: the asterisk shape and the key carry the meaning.
