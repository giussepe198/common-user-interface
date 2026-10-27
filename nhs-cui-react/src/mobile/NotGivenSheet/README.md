# NotGivenSheet

"Why was it not given?" bottom sheet (concept B3): the region's codes, a required reason where the code needs one, a "Prescriber notified" prompt and a commit button that names the code.

## When to use

- From "Not given" in DoseAdministrationFlow (built in) or from a drug chart event.

## What you provide

- `open`, `onClose`, `onRecord(value, code)`, `description` (e.g. "CHEN, Wei · paracetamol 1 g, due 13:00"), `title`.
- `region`, `paediatric`, `codes`, `excludeCodes`, `legend`, `reasonHint`, `requirePrescriberPrompt`, `value` / `defaultValue` / `onChange`, `portal`, `container`, `closeOnBrowserBack`, `initialFocusRef`, `autoFocus` (see BottomSheet; defaults from `SheetContainerProvider`).

```tsx
<NotGivenSheet open={open} onClose={close} onRecord={record} description="CHEN, Wei · paracetamol 1 g, due 13:00" />
```

## Guidance implemented

- Built on BottomSheet and ReasonCodePicker with `adminReasonCodes(region)` (G10 9.6, G11 8.2, MEDa-0119).
- AU-MD-09 [M]: W needs a reason; R and N add "Prescriber notified". NZ codes that need an explanation (D, N, W) require it (NMC Figure 22).
- AU-MD-08 [M]: codes are always shown with their meaning; the commit button says "Record W: Withheld".
- Recording is blocked until a code is chosen and required parts are complete; problems are shown after the first attempt.
- Swipe and backdrop cannot close the sheet once something is entered (Phase 4: no swipe to commit or discard data).
- "Prescriber notified" is optional unless `requirePrescriberPrompt` [suggested].

## Regional behaviour

- GB: statuses without code letters (no code set in the guidance), legend "Reason".
- AU: NIMC codes A F R V L N W S (P on paediatric charts), legend "NIMC code".
- NZ: NMC codes CP D N R RV SM U W, legend "NMC code" [suggested short form].
- Data: `MOBILE_NOT_GIVEN_LEGEND`, `ADMIN_REASON_CODES`.

## Do and don't

- Do pass a dictation hint only when dictation is available.
- Don't auto-select a code.

## Accessibility

- `dialog` titled and described; native radios in a fieldset with legend; reason field `aria-required` when needed.
