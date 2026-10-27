# BottomSheet

Modal sheet that rises from the bottom of the screen for a short task in context, such as choosing a reason code or a date.

## When to use

- Short tasks that keep the screen behind in context (B3 "Why was it not given?", the calendar in TouchDateTimePicker, the HoldToConfirmButton dialog).
- For a task that needs the whole screen use FullScreenSheet.

## What you provide

- `open`, `onClose(reason)` with reason `closeButton`, `escape`, `back`, `backdrop` or `swipe`; `title` (required), `description`, `children`, `footer` (usually `<ActionBar sticky={false} />`).
- `hasUnsavedData`, `allowDismissWithUnsavedData`, `onCloseBlocked`, `unsavedMessage`.
- `closeOnBackdrop` (true), `swipeToClose` (true), `closeOnBrowserBack` (true), `showCloseButton`, `closeLabel`, `initialFocusRef`, `autoFocus` (true), `returnFocus`, `headingLevel`, `role` (`alertdialog` for confirmations), `portal` / `container`.
- `portal`, `container` and `autoFocus` default to the nearest `SheetContainerProvider`; a prop on the sheet wins.

```tsx
<BottomSheet open={open} title="Why was it not given?" description="CHEN, Wei · paracetamol 1 g, due 13:00"
  hasUnsavedData={dirty} onClose={() => setOpen(false)}
  footer={<ActionBar sticky={false} actions={[{ label: 'Cancel', onClick: cancel }, { label: 'Record W: Withheld', variant: 'primary', onClick: save }]} />}>
  <ReasonCodePicker options={codes} />
</BottomSheet>
```

## Guidance implemented

- Phase 4 mobile rules [M]: gestures only navigate or reveal; a swipe never commits, and never dismisses a sheet holding unsaved data unless the consumer allows it. Long-press and swipe are never the only route: the close button, Esc and back always exist.
- Modal dialog behaviour [M]: labelled by its title, focus moves in on open and back to the opener on close, Tab is trapped, Esc closes.
- Page scroll is locked only while the sheet renders on `document.body`; a sheet in a host `container` or in place (`portal={false}`) leaves the page scrollable [suggested].
- `autoFocus={false}` [suggested]: a sheet that is already open on first render (documentation pages, restored state) leaves focus where it is; opening it later always moves focus in, and Tab is still trapped once inside.
- Back button [suggested]: while open, a history entry is pushed so the Android or browser back button closes the sheet instead of leaving the page. Refused (and re-armed) when there is unsaved data. Turn off with `closeOnBrowserBack={false}` if your router manages this.
- Respects `prefers-reduced-motion` (no slide animation); content scrolls inside, header and footer stay put; safe-area padding at the bottom.

## Do and don't

- Do set `hasUnsavedData` as soon as the user has typed or chosen something.
- Do pass `container` if your theme attribute is on an element rather than on `<html>`: the sheet renders into `document.body` by default. To set it once for a whole embedded app, wrap it in `SheetContainerProvider`.
- Don't turn `autoFocus` off in a real app: it is for pages that render a sheet open as an illustration.
- Don't stack sheets more than one deep.

## Accessibility

- `role="dialog"` (or `alertdialog`), `aria-modal="true"`, `aria-labelledby` the title, `aria-describedby` the description.
- The drag handle is decorative (`aria-hidden`); the close button is a 48 px target named "Close".
- The unsaved-data notice is a polite status message.
