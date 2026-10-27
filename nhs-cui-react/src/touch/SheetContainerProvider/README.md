# SheetContainerProvider

Sets, once, where every touch sheet below it renders and whether a sheet open on first render takes focus, for hosts that embed mobile screens in a frame or a documentation page [suggested].

## When to use

- A phone frame, design-system card or split view that shows mobile screens inside a box rather than the whole window: sheets should cover that box, not `document.body`.
- A documentation page that renders sheets open as illustrations and should not load with a focus ring inside one.
- Not needed in a normal full-screen app: the defaults (portal to `document.body`, focus moves in) are right there.

## What you provide

- `container`: the element sheets render into (it should be, or sit inside, a `.cui-root` element with the theme). The sheet layer is `position: fixed`, so give the frame a `transform` or `contain: layout` to keep the layer inside it.
- `portal`: false renders every sheet in place instead.
- `autoFocus`: false leaves focus where it is for sheets that are already open on first render. A sheet opened later always moves focus in.
- `children`.

Every sheet in the library reads it: BottomSheet, FullScreenSheet, and the sheets inside HoldToConfirmButton, TouchDateTimePicker, NotGivenSheet, PatientDetailsSheet, MobilePatientHeader, PatientSwitchGuard, MobileMedicationsList, DoseAdministrationFlow and DictationReview. A `portal`, `container` or `autoFocus` prop on a sheet still wins. Nested providers override only the settings they give.

```tsx
const [layer, setLayer] = React.useState<HTMLElement | null>(null);
<div className="phone" style={{ transform: 'translateZ(0)' }}>
  <div className="cui-root" ref={setLayer} />
  <SheetContainerProvider container={layer}>
    <DoseAdministrationFlow {...dose} />
  </SheetContainerProvider>
</div>
```

`useSheetContainer()` returns the current settings, for hosts building their own overlays.

## Guidance implemented

- Phase 4 mobile rules [M]: sheets keep their modal behaviour wherever they render (labelled dialog, Tab trapped, Esc and back close, focus returns to the opener).
- Page scroll is locked only for a sheet that covers the page from `document.body`; a sheet in a host container or in place leaves the page scrollable [suggested].
- `autoFocus={false}` only affects a sheet that is open on its first render [suggested]; real use, where a user action opens the sheet, keeps full focus management.

## Do and don't

- Do set the provider at the frame, around everything that can open a sheet.
- Do keep the default `autoFocus` in a real app.
- Don't use it to render sheets into an element without the theme: put the container inside `.cui-root` (or give it the class).

## Accessibility

- No markup of its own. Sheets below it keep `role="dialog"` (or `alertdialog`), `aria-modal`, their labels and focus trapping.
- With `autoFocus={false}` and a sheet open on load, keyboard users reach the sheet with Tab as normal; once inside, Tab stays in the sheet.
