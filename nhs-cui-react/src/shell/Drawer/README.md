# Drawer

Side panel over the page for detail, filters or navigation; a bottom sheet on phones.

## When to use

- Detail that keeps the page in view behind it (a contact's details, filter options), or the navigation drawer on narrow screens (AppShell uses it).
- For a decision that must be answered use Dialog.

## What you provide

- `open`, `onClose(reason)`, `title`, `description`, `children`, `footer`.
- `side` ('end' default, 'start' for navigation), `size` ('sm' 320, 'md' 400, 'lg' 560), `closeOnBackdrop` (default true), `hasUnsavedData`, `closeLabel`, `initialFocusRef`, `returnFocus`, `autoFocus`, `headingLevel`.
- `modal` (default true). `modal={false}` makes a non-modal side panel for read-only detail and quick edits beside a list: no dimmed page, no scroll lock, no focus trap and no global shortcut guard, so the page stays visible and usable; focus moves in on open and back to the opener on close (unless the user has moved on to another control), and Esc closes while focus is in the panel. `role="dialog"` with `aria-modal="false"`.
- Phones: `sheetOnPhone` (default true; set false for navigation), `phoneBreakpoint` (600).

```tsx
<Drawer open={open} onClose={() => setOpen(false)} title="Filters" description="Caseload" footer={<Button variant="primary">Apply filters</Button>}>
  ...
</Drawer>
```

## Guidance implemented

- Modal like Dialog: focus trapped and returned, Esc closes, `aria-modal` set [suggested].
- Non-modal (`modal={false}`): detail that does not stop the work beside it, such as a contact opened from a list, so the list keeps its context [suggested]. Decisions, confirmations and multi-step forms that must not be left half done stay modal.
- With `hasUnsavedData`, the backdrop, swipe and back no longer close it; the close button and Esc still ask the consumer (same rule as the touch sheets) [suggested].
- Phones: the touch area's BottomSheet is reused, not forked (Phase 4 rules: 48 px targets, swipe never commits, unsaved data guarded).
- Crossing the phone breakpoint while open (a resize, a turned tablet, page zoom) swaps the frame but not the content: the content is rendered once and moved between frames, so typed values and focus state survive (same for Dialog) [suggested].
- FSG-0015 [M]: never wider than the screen; the body scrolls between a fixed header and footer.

## Global shortcuts while open

App shortcuts must not fire behind an open overlay. This control stops global shortcut handling while it is open, in two layers:

1. **Keys pressed inside the overlay.** The overlay is wrapped in an internal `OverlayScope` whose React `onKeyDown` calls `stopPropagation()`. React key events bubble through portals to it, so handlers inside the overlay (fields, buttons, Tab trapping, Esc) run first, and the native event then stops at the React root and never reaches `document`. Document-level listeners such as the datetime area's `ShortcutProvider` and an app's own shortcut hook never see it.
2. **Keys pressed anywhere else** (focus left on the page body after a click on the backdrop, for example). While any shell overlay is open a capture-phase `keydown` listener on `document` stops keys whose target is outside every modal surface (`[aria-modal="true"]`); Esc still closes the top overlay.

The overlay also sets `aria-modal="true"`, so a shortcut hook that checks for an open modal (such as an app-wide shortcut hook) keeps working. Your own document-level handlers can call `isShellOverlayOpen()` or the `useShellOverlayOpen()` hook. Consequence: shortcuts registered with `useShortcut` inside the overlay do not fire either; give overlay commands visible buttons [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do use `side="start"` only for navigation.
- Don't stack a Drawer on a Drawer.

## Accessibility

- `role="dialog"`, `aria-modal="true"` (or `"false"` when non-modal), labelled by its title, described by its description.
- Close button named, 44 px on coarse pointers; slide-in motion is cut under reduced motion.
