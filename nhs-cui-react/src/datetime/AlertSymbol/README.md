# AlertSymbol

An alert symbol whose shape and tone show its class: prohibition, mandatory action, warning or information.

## When to use

Next to safety information such as dose limits, required steps, warnings and advisory notes. Combine with words for safety-critical alerts.

## What you provide

- `kind` (`"prohibition"`, `"mandatory"`, `"warning"`, `"information"`), `label` (required functional text), `pictogram` (SVG content on a 24 by 24 grid), `modifier` (for example a count), `size` (16, 24, 32, 48), `showLabel`.

```tsx
<AlertSymbol kind="warning" label="Warning: above recommended dose" showLabel />
<AlertSymbol kind="prohibition" label="Do not exceed 4 g in 24 hours" />
```

## Guidance implemented

- alertsymbdes s7 prohibition: circle with white fill, red border and a single red diagonal from top left to bottom right.
- alertsymbdes s7 mandatory action: solid blue circle with a white pictogram (white per standards [suggested]).
- alertsymbdes s7 warning: yellow triangle with a black (#000000) border and black pictogram.
- alertsymbdes s7 each sign distinct by colour and tone, so it works in greyscale and for colour-blind users; shapes also differ.
- alertsymbdes Appendix A objective symbol, container and modifier (a small badge).
- alertsymbdes s8 text equivalents describe the alert, not the picture; required `label`.
- iconssymb sizes 16, 24, 32 and 48; labels of two or three words; no flashing (2 to 59 Hz).
- Information as a speech bubble [suggested: the source does not formally recommend a suggestion or information symbol yet].
- Exact colours are not specified by the source; theme tokens `--danger`, `--mandatory-symbol` and `--warning-fill` are used [suggested].

## Do and don't

- Do use `showLabel` for safety-critical alerts.
- Do use the same symbol for the same meaning throughout the application.
- Don't invent new container shapes (diamonds, octagons, rectangles were rejected).
- Don't use the prohibition circle without its diagonal.

## Accessibility

`role="img"` with the label as accessible name, or decorative when the label is shown as text. Meaning is never carried by colour alone.
