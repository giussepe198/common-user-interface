# AdministrationEventIcon

Symbol for one administration event, combining shape, fill, border style and a text label so each schedule state and recorded status can be told apart without colour.

## When to use

- Inside the drug administration chart, the recording form header and any summary of administration events.
- Use `onActivate` when the icon opens something (recording form or details); it then renders as a button.

## What you provide

- `state`: `future`, `next`, `due`, `overdue`, `begun`, `unscheduled` or `recorded`.
- `status` for recorded events (for example `given`, `givenLate`, `patientRefused`, `nilByMouth`, `unknown`).
- Optional `kind` (`onceOnly` draws a round icon), `time`, `detail`, `edited`, `markers`, `showLabel`, `medicationName`.

```tsx
<AdministrationEventIcon state="overdue" time={dueAt} onActivate={openForm} medicationName="Amoxicillin" />
<AdministrationEventIcon state="recorded" status="patientRefused" edited />
```

## Guidance implemented

- MEDa-0066, 0115, 0119 [M]: a status icon for every event, supporting the ePrescribing status set (fig 95).
- MEDa-0117 [M]: filled when successfully administered, unfilled with a solid border when not.
- MEDa-0118 [R]: scheduled, not yet Due events use a simple dotted-border icon.
- MEDa-0086 [M]: Due and Overdue icons look active (heavier border, clickable).
- MEDa-0089, 0122 [M], 0090, 0091 [R]: Overdue label is white on red; Due label is reverse video.
- MEDa-0250 [M]: labels "Overdue HH:mm", "Due HH:mm", "Next HH:mm".
- MEDa-0095, 0096 [M]: shows the latest status plus an always-visible edited marker.
- MEDa-0116 [M], 0278 [R], 0173, 0179, 0182, 0184 [M], 0186 [R], 0258 [R]: supplementary markers to the right (first dose, multiple entries, review, lockout, precondition, time critical, role, witness, self-administration, test result).
- MEDa-0120, 0121, 0132, 0269 [M]: colour never alone; at least 16 x 16 px; Once Only round, others square; outline symmetrical about the horizontal axis.
- MEDa-0282 [M]: no "Missed", "Not Recorded" or cross icon; unknown uses "?".

## Do and don't

- Do keep `showLabel` on in the selected day; when off, the label is still the accessible name.
- Don't use the icon colour alone to communicate; the letters inside recorded icons are [suggested] and always paired with the label.

## Accessibility

- Activatable icons are buttons (Enter or Space) with an accessible name such as "Overdue 08:00, Amoxicillin, First administration of a new drug".
- Static icons use `role="img"` with the same text.
- Markers have tooltips and are included in the accessible name.

## Regional behaviour

Pass `region` or wrap in `ClinicalLocaleProvider`; pass the recorded `reasonCode` for AU and NZ.

- GB: CUI status labels ("Patient refused"); letters inside recorded icons are [suggested] glyphs (L, E, S, R, A, C, U, N, F, D, W, P, ?).
- AU: the National Inpatient Medication Chart code is drawn in the icon and shown with its meaning, for example "W Withheld"; the full legend ("Withheld – enter reason in clinical record") is in the accessible name and tooltip (AU-MD-08, G10 9.6). Given late or early shows a tick rather than L or E, because L means "On leave" on the NIMC. `C` is not used.
- NZ: HQSC National Medication Chart codes, including two-letter CP, RV and SM (G11 8.2). CP and SM are filled because the dose was taken.
- Sources: NIMC User Guide (safetyandquality.gov.au), HQSC NMC user guide 2021 (hqsc.govt.nz).
