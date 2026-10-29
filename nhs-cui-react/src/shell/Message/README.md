# Message

Inline message on the page or in a panel: info, success, warning or error, with icon, words and optional actions.

## When to use

- The state of the page or a task: a save failed, a draft exists, data is out of date, read-only mode.
- For a passing confirmation use Toast; for legal, restricted or consent status use the mental health extension's controls.

## What you provide

- `tone` ('info', 'success', 'warning', 'error'), `title`, `children` (detail), `actions`, `onDismiss`, `dismissLabel`.
- `live` ('status', 'alert' or 'off'; default 'alert' for error, 'status' otherwise), `toneLabel`, `layout` ('block' or 'inline').

```tsx
<Message tone="error" title="Leave not saved" actions={<Button size="sm" onClick={retry}>Try again</Button>}>
  The server did not answer. Your entry is still here.
</Message>
```

## Guidance implemented

- [suggested] Red no-go, amber caution, green acceptable, blue advisory, never colour alone: each tone has its own icon, its colour and a visually hidden tone word before the title.
- The warning glyph is the core triangle; the CUI alert symbol (AlertSymbol) stays for clinical alerts, not page messages [suggested].
- Errors are announced at once; others politely; `live="off"` for messages present when the page loads [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do say what happened and what to do next.
- Don't offer dismiss on an error that still applies.

## Accessibility

- `role="alert"` or `role="status"` by tone; icon decorative; dismiss button named; 44 px on coarse pointers.
