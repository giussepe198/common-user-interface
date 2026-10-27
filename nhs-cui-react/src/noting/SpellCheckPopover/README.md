# SpellCheckPopover

Spelling suggestions for a word flagged in a free-text note, with OK, Ignore and Cancel.

## When to use
- In a text-parser noting area when full-word matching flags an unrecognised word (Matching 2.2.4).

## What you provide
- `word`, `suggestions` (from the terminology and a dictionary), `onAccept`, `onIgnore`, `onCancel`.

```tsx
<SpellCheckPopover word="pnuemonia" suggestions={[{ text: 'pneumonia', source: 'terminology' }]}
  onAccept={replace} onIgnore={ignore} onCancel={close} />
```

## Guidance implemented
- Matching 2.2.4 and G8 13: suggestions from the terminology and a dictionary; buttons "OK", "Ignore" and "Cancel"; nothing is auto-confirmed: no suggestion is pre-selected and OK is disabled until one is chosen.
- Dictionary suggestions are marked "dictionary" [suggested].
- Closes on Escape and click-away (Cancel).

## Do and don't
- Do position it next to the flagged word without covering it.
- Don't replace the word without the user's choice.

## Accessibility
- A labelled non-modal dialog; choices are radio buttons; focus moves into it on open.

## Regional behaviour
- Suggestions are shown exactly as supplied, so te reo Māori words keep their macrons ("whānau").
