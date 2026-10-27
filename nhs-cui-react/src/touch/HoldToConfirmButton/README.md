# HoldToConfirmButton

Hold-to-confirm button for high-risk commits (P4): press and hold while a fill shows progress; a tap, keyboard or screen reader activation opens a confirmation dialog instead.

## When to use

- The final commit of a high-risk action (insulin, opioids, anticoagulants), after TypedReadBackConfirm and SecondCheckField where required.

## What you provide

- `actionLabel` (required, e.g. "Record 6 units given"): the dialog title is "Record 6 units given?".
- `onConfirm`, `holdDuration` (default 1500 ms), `tapOpensConfirm` (default true), `hint` (null to hide), `confirmDescription`, `cancelLabel`, `size` (56 or 64), `disabled`.
- `portal`, `container`: where the confirmation dialog renders (default from `SheetContainerProvider`, otherwise `document.body`) [suggested].

```tsx
<HoldToConfirmButton actionLabel="Record 6 units given" disabled={!matched || !secondCheck} onConfirm={record} />
```

Utilities: `holdProgress`, `holdDurationText`.

## Guidance implemented

- Phase 4 mobile rules [M]: hold-to-confirm with an accessible alternative; long-press is never the only route.
- Releasing early cancels and says "Released too early. Hold for 1.5 seconds." [suggested].
- Reduced motion [M]: with `prefers-reduced-motion` the fill moves in four steps rather than continuously.
- The long-press context menu is suppressed on the button [suggested].

## Do and don't

- Do disable it until the read-back and second check are complete.
- Don't use it for routine commits; use a single button with UndoToast.

## Accessibility

- One real button; the hint is linked with `aria-describedby`.
- Enter, Space, switch access and screen reader double-tap open an `alertdialog` (BottomSheet) with Cancel and the action.
- The result is announced in a polite status region.
