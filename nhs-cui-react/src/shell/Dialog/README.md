# Dialog

Modal dialog: a titled card over a dimmed page, focus trapped and returned, closed by its button or Esc; a full-screen sheet on phones.

## When to use

- A short task or decision that must be finished or cancelled before going back to the page (record leave, confirm discharge).
- For a side panel of detail or filters use Drawer; for a passing confirmation use Toast.

## What you provide

- `open`, `onClose(reason)` (required), `title` (required, the accessible name), `description` (the record or list it acts on), `children`, `footer` (Buttons: Cancel then the primary action).
- `size` ('sm' 400, 'md' 560, 'lg' 800), `role` ('dialog' or 'alertdialog'), `dismissible`, `closeOnBackdrop` (default false), `closeLabel`, `initialFocusRef`, `returnFocus`, `autoFocus`, `headingLevel`.
- Phones: `sheetOnPhone` (default true), `phoneBreakpoint` (600), `closeOnBrowserBack` (default false).
- `portal`, `container` (defaults from the touch area's SheetContainerProvider).

```tsx
<Dialog open={open} onClose={() => setOpen(false)} title="Record leave" description="CHEN, Wei"
  footer={<><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={save}>Save leave</Button></>}>
  ...
</Dialog>
```

## Guidance implemented

- FSG-0015, FSG-0079 [M]: never larger than the screen; the body scrolls between a fixed header and footer.
- FSG-0008 [R]: the description line names what the dialog acts on.
- FSG-0003 [M]: dialogs are tab-ordered; Tab and Shift+Tab stay inside.
- Focus moves in on open (first field, not the close button) and returns to the opener on close [suggested, WAI-ARIA dialog pattern].
- No close on a stray backdrop click by default, so input is not lost [suggested].
- Phones: the touch area's FullScreenSheet (P1 pattern) is reused, not forked; footer actions stack full width with the primary action at the bottom in the thumb zone (Phase 4 rules).

## Global shortcuts while open

App shortcuts must not fire behind an open dialog. This control stops global shortcut handling while it is open, in two layers:

1. **Keys pressed inside the overlay.** The overlay is wrapped in an internal `OverlayScope` whose React `onKeyDown` calls `stopPropagation()`. React key events bubble through portals to it, so handlers inside the overlay (fields, buttons, Tab trapping, Esc) run first, and the native event then stops at the React root and never reaches `document`. Document-level listeners such as the datetime area's `ShortcutProvider` and an app's own shortcut hook never see it.
2. **Keys pressed anywhere else** (focus left on the page body after a click on the backdrop, for example). While any shell overlay is open a capture-phase `keydown` listener on `document` stops keys whose target is outside every modal surface (`[aria-modal="true"]`); Esc still closes the top overlay.

The overlay also sets `aria-modal="true"`, so a shortcut hook that checks for an open modal (such as an app-wide shortcut hook) keeps working. Your own document-level handlers can call `isShellOverlayOpen()` or the `useShellOverlayOpen()` hook. Consequence: shortcuts registered with `useShortcut` inside the overlay do not fire either; give overlay commands visible buttons [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do label the primary action with a verb ("Save leave"), never "OK".
- Do use `role="alertdialog"` and `dismissible={false}` only for a decision that must be answered (an idle lock).
- Don't open a dialog from a dialog unless the second one is a short confirmation.

## Accessibility

- `role="dialog"` (or `alertdialog`) with `aria-modal="true"`, `aria-labelledby` the title and `aria-describedby` the description.
- Esc closes when dismissible; the close button is a named icon button with a tooltip; 44 px on coarse pointers.
- The page behind does not scroll while open (when portalled to the body); motion is cut under reduced motion.
