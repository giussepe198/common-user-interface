# TruncatedText

Text that is shortened only when it does not fit, cutting between whole words, never inside numbers or units, with a separate control to see the full text.

## When to use

Coded clinical terms in single-line cells or summaries where wrapping is not possible. Wrapping is preferred: use `mode="wrap"` wherever space allows.

## What you provide

- `text` (required), `mode` (`"end"` default, `"middle"`, `"wrap"`), `reveal` (`"inline"` default or `"flyout"`), `showSymbol` (default true), `onTruncationChange`.

```tsx
<TruncatedText text={term.preferredTerm} />
<TruncatedText text={term.preferredTerm} mode="middle" reveal="flyout" />
```

## Guidance implemented

The truncation document is a consultation: these are emerging recommendations without IDs or mandatory status.

- T1 truncation as a last resort: `wrap` mode wraps without hyphenation and keeps numbers with their units (no-break spaces).
- T2 middle truncation only on a single line (the component is single line in `end` and `middle` modes).
- T3 never cut inside a number or unit, and never fragment words: cuts fall between whole atoms such as "1-24 hours".
- T4 the truncation point comes from the measured width, not a character count.
- T5 an ellipsis directly after the text with no space; a separate truncation symbol; the ellipsis is not a control.
- T7 full text available: inline expansion (preferred by users) or a fly-out after a short hover delay or on keyboard focus; the full text is always available to screen readers.
- T6 apparent duplicates are a list concern: use `findIdenticalTruncations` and show the list in full or warn.
- If even the first word does not fit it is kept whole and clipped by the container [suggested].

## Do and don't

- Do prefer wrapping with a vertical scroll bar in selection lists.
- Do make the full text visible and acknowledged before an action is taken on a truncated term (host responsibility).
- Don't truncate terms in a fixed-width list by character count.
- Don't use the ellipsis as a button.

## Accessibility

The shortened text is hidden from screen readers and the full text is read instead, followed by "(shortened on screen)". The inline reveal is a real button with `aria-expanded`; the fly-out target is focusable and Esc hides it.
