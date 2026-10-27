# IndigenousStatusDisplay

Labelled Australian Indigenous status in words, never as a bare code.

## When to use

- Patient summaries, Zone 2 of the banner (for example in `section3`) or wherever Indigenous status is shown (AU-IS-03).

## What you provide

- `value` (METeOR code), `label` (default "Indigenous status"), `variant` ("short" or "full"), `showCode`, `unknownText` (default "Not recorded").

```tsx
<IndigenousStatusDisplay value="3" />
```

## Guidance implemented

- AU-IS-03 [R]: full meaning text, e.g. "Aboriginal and Torres Strait Islander"; `variant="full"` shows the METeOR wording.
- METeOR 602543: codes 1-4 and 9 ("Not stated").
- [suggested] Nothing recorded shows "Not recorded", distinct from code 9 "Not stated".
- AU-IS-03 [C]: showing it in the banner is an organisation choice; many show it in Zone 2 only.

## Do and don't

- Don't show the numeric code on its own.

## Accessibility

- Plain text with a label.

## Regional behaviour

- AU only.
