# TextArea

Multi-line free text that wraps, scrolls vertically and can show a character count.

## When to use
- Notes, descriptions and reasons longer than one line.
- For clinical free text attached to a fixed choice use FreeTextAnnotation (noting area).

## What you provide
- Put it in a `FormField`. `value` and `onChange(value)` or `defaultValue`; `rows` (default 3, never under 2); `autoGrow` with `maxRows`; `maxLength` with `limitMode` (`'block'` or `'warn'`) and `showCount`.

```tsx
<FormGridSpan span="full">
  <FormField label="Reason for referral" required>
    <TextArea maxLength={2000} autoGrow />
  </FormField>
</FormGridSpan>
```

## Guidance implemented
- CNA-1760 [R] multi-line free text at least two lines high.
- CNA-1770 [R] no horizontal scroll bar (text wraps, `overflow-x: hidden`).
- CNA-1780 [R] vertical scroll bar when the text is longer than the area (and an auto-growing area scrolls after `maxRows`).
- [suggested] Character count "120 of 500 characters" linked to the area; announced politely when the remainder enters the last 10% (at least 10), at the limit and when going over, not on every key. In `'warn'` mode the user may go over and the field is marked invalid with the excess in words.

## Regional behaviour
None.

## Do and don't
- Do span it across the grid (`FormGridSpan span="full"`) so it has room.
- Don't use a character limit to cut clinical content short without saying so; prefer `'warn'` when the limit is soft.

## Accessibility
- A real `textarea` named by FormField. Count text is a linked description; limit changes go to a polite live region.
- Marked `data-multiline`, so alignment checks only compare its top with the controls beside it.
