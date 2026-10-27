# LiveTranscript

Shows what the speech engine heard ("What I heard"), with recognised values highlighted, words that need a question marked, and interim text muted.

## When to use

- On any dictation screen, above the read-back (C1). Pair with `parseSpokenObservations(...).highlights` for observations.

## What you provide

- `text` (final text), `interim`, `highlights` (`{ start, end, kind: 'value' | 'check' | 'label' }`), `highlightLabels`, `heading`, `headingLevel`, `emptyText`, `listening`.

```tsx
<LiveTranscript text={dictation.transcript} interim={dictation.interim} highlights={parsed.highlights} />
```

## Guidance implemented

- Recognised values use the pale blue encodable highlight from CUI noting (Matching 2.3.2 colour, `--encodable`) [suggested for dictation].
- Words to check (ambiguous teen or ty numbers, not understood) have a dashed warning underline and hidden "(check)" text, so colour is not the only cue [M].
- Phase 4 mobile rules [M]: dictation is shown as text, not committed; base text 17 px.

## Regional behaviour

- None of its own. Text is shown exactly as recognised, so macrons in te reo Māori words are preserved (NZ).

## Do and don't

- Do show the read-back list as well: the transcript alone is not a check.
- Don't let users edit values in the transcript; edit them in the review step.

## Accessibility

- A labelled `section` with a heading. Only newly added final text is announced, in a polite status region; interim text is hidden from screen readers so it is not read twice.
