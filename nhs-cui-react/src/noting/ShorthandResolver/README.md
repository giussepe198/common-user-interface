# ShorthandResolver

A small menu of possible meanings for clinicians' shorthand flagged in a note (for example "MI").

## When to use
- In a text-parser noting area when a word matches the shorthand database (Matching 2.2.5).

## What you provide
- `shorthand`, `resolutions` (id, label, optional description), `onResolve`, `onDismiss`.

```tsx
<ShorthandResolver shorthand="MI" resolutions={meanings} onResolve={expand} onDismiss={close} />
```

## Guidance implemented
- Matching 2.2.5 (low confidence) and G8 13: list of resolutions from the database; no top match chosen for the user; closes on click-away and Escape.
- Descriptions such as the specialty that uses the meaning are [suggested].

## Do and don't
- Do show it only for shorthand with more than one meaning or when the expansion matters.
- Don't expand shorthand automatically.

## Accessibility
- A listbox that takes focus on open; arrow keys move, Enter or Space chooses, Escape dismisses.
