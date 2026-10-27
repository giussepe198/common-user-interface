# UndoToast

Time-limited undo after a normal commit, announced politely and pausable.

## When to use

- After a routine single-button commit where reversing is safe (Phase 4: "a single clear button with an undo window where safe").
- Not for high-risk commits: those use HoldToConfirmButton, TypedReadBackConfirm and SecondCheckField before committing.

## What you provide

- `open`, `message`, `onUndo`, `onTimeout` (the commit is final), `duration` (default 10 s), `undoLabel`, `paused`, `dismissible`, `position` (`fixed` above the ActionBar, or `inline`), `bottomOffset`.

```tsx
<UndoToast open={!!last} message={`Recorded ${last?.text}`} onUndo={undo} onTimeout={finalise} />
```

## Guidance implemented

- Phase 4 mobile rules [M]: undo window for normal commits; 48 px buttons; clear of the bottom safe area.
- WCAG 2.2.1 timing adjustable [M]: the countdown pauses while the toast has focus or a pointer over it, and with its own Pause button.
- Default 10 seconds [suggested].

## Do and don't

- Do keep the commit provisional (or reversible) until `onTimeout`.
- Don't show more than one undo toast at a time.

## Accessibility

- A persistent polite live region announces the message and the time available once; the countdown text is not announced every second.
- Undo, Pause and Dismiss are named buttons; Pause has `aria-pressed`.
