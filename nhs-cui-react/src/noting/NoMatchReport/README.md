# NoMatchReport

A two-step form for reporting text the terminology could not match.

## When to use
- From a "No match found" button in a noting area, so the terminology team can consider a new term.

## What you provide
- `text` (the unmatched text), optional `context`, `onSubmit(report)`, `onCancel`, `title`.

```tsx
<NoMatchReport text="post covid brain fog" context="Problem list" onSubmit={send} onCancel={close} />
```

## Guidance implemented
- G8 7 and 13: a wizard capturing unmatched text. The guidance leaves the process undefined, so the steps (describe; check and send), labels and wording are [suggested].
- The note keeps the text as typed; reporting does not change the record.

## Do and don't
- Do send `context` (heading, subset in use) with the report.
- Don't block the user from carrying on with the note.

## Accessibility
- Labelled fields; the step is stated in text; focus moves to the heading on each step; the result is announced with `role="status"`.
