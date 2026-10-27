# FullScreenSheet

Modal screen that covers the viewport for a focused task, with a title, Cancel, a scrolling body and a bottom action area.

## When to use

- Tasks that need the whole screen (P1 "When did the fall happen?" with TouchDateTimePicker, a dictation review).
- For short tasks in context use BottomSheet.

## What you provide

- Everything BottomSheet takes except backdrop and swipe (`open`, `onClose`, `title`, `description`, `children`, `footer`, `hasUnsavedData`, `closeOnBrowserBack`, `initialFocusRef`, `autoFocus`, `portal`, `container`, ...). `portal`, `container` and `autoFocus` default to the nearest `SheetContainerProvider`; the page is scroll-locked only while the sheet renders on `document.body`.
- `closeStyle`: `text` (default, "Cancel" on the right, as in P1) or `back` (chevron and text on the left); `headerAction` for one extra control.

```tsx
<FullScreenSheet open={open} title="When did the fall happen?" headingLevel={1} hasUnsavedData={dirty} onClose={close}>
  <TouchDateTimePicker onConfirm={save} />
</FullScreenSheet>
```

## Guidance implemented

- Same modal behaviour as BottomSheet [M]: labelled, focus trapped and returned, Esc and back close, back refused while unsaved data is held.
- Phase 4 mobile rules [M]: header controls are 48 px targets; respects the top safe area.

## Do and don't

- Do keep the patient header visible inside the sheet on patient-context screens (Phase 4 rule).
- Don't use it for a one-question confirmation; use a BottomSheet with `role="alertdialog"`.

## Accessibility

- `role="dialog"`, `aria-modal="true"`, labelled by the visible title (use `headingLevel={1}` when it is the screen title).
- The Cancel or Back button is a real button and always present unless `showCloseButton={false}`.
