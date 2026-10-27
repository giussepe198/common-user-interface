# PatientSwitchGuard

Makes a patient change unmistakable: flashes and announces the new identity after any switch, and asks for an explicit choice when a wristband scan finds a different patient.

## When to use

- Wrap every patient-context screen in the app shell, passing the patient on screen.
- Set `pendingPatient` when a scan, deep link or list tap would change patient while work is in progress.

## What you provide

- `patient`, `children`.
- `pendingPatient`, `pendingReason` ('scanMismatch' default, or 'navigation'), `onConfirmSwitch`, `onCancelSwitch`, `differences` (default from `mobileIdentityMatch`).
- `flash` (default true), `flashDuration` (default 6000 ms, 0 = until dismissed), `region`, `now`, `portal`, `container`, `autoFocus` (defaults from `SheetContainerProvider`).
- `className`, `style`, and `fill` [suggested]: in a fixed-height parent (a flex column or a box with a height), `fill` makes the guard take the full height, keeps the flash at the top and gives the screen the rest, scrolling inside it. A single child screen is stretched to that height.

```tsx
<PatientSwitchGuard patient={patient} pendingPatient={scanned} onConfirmSwitch={switchTo} onCancelSwitch={clear}>
  <PatientScreen />
</PatientSwitchGuard>
```

## Guidance implemented

- Phase 4 rules [M]: switching patient must be unmistakable.
- The flash shows the full identity strip (name, born, identifiers) and is announced in a polite live region; it has a Dismiss button beside the heading, so the identity lines use the full width [suggested]. Separators between identity facts are glued to the fact after them, so a line never ends with a dangling "·".
- The confirmation is a BottomSheet `alertdialog` that cannot be dismissed by swipe or backdrop; both identities are shown in full with what differs in words [suggested].
- "Stay with" is listed and focused first so a stray tap never switches patient [suggested].
- Reduced motion: the flash does not animate.

## Regional behaviour

- Names and identifiers follow the region through the patient area (AU-PI-02, G10 1.6, G11 2.3, G11 12.6).

## Do and don't

- Do keep the guard mounted across patient changes so it can see the switch.
- Don't switch silently after a scan mismatch.

## Accessibility

- Flash: `role="status"`; confirmation: `alertdialog` with title and description; Esc and back choose "Stay".
