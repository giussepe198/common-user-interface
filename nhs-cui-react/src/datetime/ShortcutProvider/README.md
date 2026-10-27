# ShortcutProvider

A keyboard shortcut registry that checks for conflicts, refuses reserved keys and gives visible feedback instead of failing silently. Includes the `useShortcut` hook.

## When to use

Wrap an application or module that defines keyboard shortcuts. Register each shortcut with `useShortcut` in the component that owns the function, or pass a central list in `shortcuts`.

## What you provide

- `ShortcutProvider`: `children`, `shortcuts` (static bindings), `onConflict`, `onFeedback`, `showFeedback` (default true), `checkStandard` (default true).
- `useShortcut({ keys, action, handler, context?, clinicallySignificant?, deprecated?, replacement?, enabled?, allowInInputs?, description? })` returns `{ keys, conflicts, refused }`.
- `useShortcutRegistry()` returns the registered shortcuts and conflicts.

```tsx
function NoteEditor() {
  useShortcut({ keys: 'Ctrl+S', action: 'Save', handler: save });
  useShortcut({ keys: 'Alt+F7', action: 'Prescribe controlled drug', clinicallySignificant: true, handler: openPrescribe });
  return <Editor />;
}

<ShortcutProvider onConflict={c => report(c)}>
  <NoteEditor />
  <KeyboardShortcutList />
</ShortcutProvider>
```

## Guidance implemented

From keyshorts (no guideline IDs):

- Conflicting shortcuts are detected: the same keys for different functions in overlapping contexts, the same function on two keys, and clashes with the standard Windows shortcuts (see `STANDARD_WINDOWS_SHORTCUTS`).
- Alt+F4 must only quit, F1 must only open Help; system shortcuts (Alt+Tab, Alt+Esc, Windows key) are not overridden. Such bindings are refused.
- Alt+F has too many existing conflicts: refused for new functions.
- Shortcuts must not fail silently: deprecated shortcuts tell the user the replacement; unavailable (disabled) shortcuts say so; keys assigned to two functions do nothing and say why.
- More than two key presses are flagged; keep shortcuts simple.
- Clinically significant functions should use Alt with a function key and must not sit next to Ctrl+Z (Ctrl+A, S, X, Z refused).
- Sticky Keys supported: modifiers are read from each key event.
- No user remapping is offered (avoid customisable layouts).
- Plain keys do not fire while typing in a text field unless `allowInInputs` [suggested].
- Deprecated shortcuts do not run their old function [suggested].

## Do and don't

- Do keep F1 for Help in every application.
- Do give every function another route (menu or button) as well as a shortcut.
- Don't map close-and-save to a key another application uses for close-without-saving.

## Accessibility

One document-level listener that does not interfere with operating system accessibility features. Feedback appears in a `role="status"` live region so it is both visible and announced.
