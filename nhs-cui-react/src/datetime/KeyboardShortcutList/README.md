# KeyboardShortcutList

A table of keyboard shortcuts grouped by context, with conflicts flagged, and optionally the standard Windows shortcuts from the keyboard shortcuts guidance.

## When to use

Help pages, a shortcut reference panel, or a development check of an application's shortcut map.

## What you provide

- `shortcuts` (default: those registered in the surrounding ShortcutProvider), `showStandard`, `showConflicts` (default true), `caption`.

```tsx
<KeyboardShortcutList caption="Shortcuts in this view" />
<KeyboardShortcutList shortcuts={[]} showStandard caption="Standard Windows shortcuts" />
```

## Guidance implemented

- keyshorts current recommendations: the full standard mapping table (Alt menu keys, Alt+F4, UK Government access keys, function keys, Ctrl general, text editing and browser keys, Tab, Shift+Tab, arrow keys, Esc) via `STANDARD_WINDOWS_SHORTCUTS`.
- keyshorts conflicts: each problem shown next to the shortcut with an icon and the words "Conflict" or "Check", never colour alone.
- keyshorts deprecated shortcuts show their replacement.
- Context-dependent overlaps (Ctrl+E, R, U, L in text editing and browser contexts) are listed in separate groups.

## Do and don't

- Do show the shortcut list from Help (F1).
- Don't list shortcuts that the application does not support.

## Accessibility

A real `table` with a caption, column headers and `colgroup` headers for each context; keys are shown with `kbd` elements.
