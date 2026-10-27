# DoseAdministrationFlow

Giving one dose on a phone (concepts B2 and P4): scan results, the dose in large text with the unit breakdown, checks before giving, the time given, then "Record as given" with an undo window or "Not given" with a code. High-risk medicines add a second check, a typed read-back and hold-to-confirm.

## When to use

- After Start on a worklist medication task, or from a due dose in the drug agenda.

## What you provide

- `patient`, `medication` (MedicationLineData), `dose`, `unitDose` (e.g. 500 mg tablet, or 120 mg in 5 mL), `scheduledAt`, `kind`, `tolerance`.
- Scans: `wristband` (`{ status, scannedAt, matched, differences, scannedPatient }`), `onScanWristband`, `onSwitchToScannedPatient`, `requireWristbandScan` (default true), `productScan` (`{ status, productText, differences }`), `onScanProduct`, `requireProductScan` (default false).
- Checks: `lastGivenAt`, `minIntervalMinutes`, `givenIn24Hours`, `maximumIn24Hours`, `checks` (extra cards such as blood glucose).
- High risk: `highRisk`, `onScanSecondChecker`, `resolveSecondChecker`, `currentUserId`.
- Commit: `onRecordGiven(record)`, `onUndo`, `onFinal`, `onNotGiven(value, code)`, `undoDuration`; navigation `onBack`, `backLabel`, `onNotNow`; `notGivenSheetProps`, `now`, `region`, `dateFormat`, `closeOnBrowserBack`.
- `showUndoToast` (default true) [suggested]: set false when the host leaves this screen on `onRecordGiven` (for example back to the worklist) and shows its own `UndoToast` there; the host then owns the undo window, and `onUndo` / `onFinal` are not called by the flow.
- `notGivenOpen` / `defaultNotGivenOpen` / `onNotGivenOpenChange`: control the built-in Not given sheet (for documentation, or to restore it after navigation). Pass `notGivenSheetProps={{ autoFocus: false }}` when it is shown open on a documentation page.
- `portal`, `container`: where every sheet renders (time given, Not given, patient details, the hold-to-confirm dialog). Both default to the nearest `SheetContainerProvider`.

```tsx
<DoseAdministrationFlow patient={p} medication={line} dose={{ value: 1, unit: 'g' }} unitDose={{ value: 500, unit: 'mg', form: 'tablet' }}
  scheduledAt={due} wristband={scan} productScan={product} onRecordGiven={save} onUndo={reverse} onNotGiven={saveNotGiven} />
```

Utilities: `mobileDoseBreakdown`, `mobileLastGivenCheck`, `mobileMaxDoseCheck`, `mobileProductMatch`, `mobileIdentityMatch`.

## Guidance implemented

- Phase 4 rules [M]: header always visible (sticky); commit actions 56 px at the bottom with safe-area padding; normal commits are one button with an undo window (UndoToast); high-risk commits use SecondCheckField, TypedReadBackConfirm and HoldToConfirmButton (with an accessible tap-then-confirm route).
- Recording is blocked, with reasons listed, when the wristband is not a match, the product scan does not match (or is required and missing), the time is in the future (MEDa-0239), or a high-risk check is incomplete.
- MEDa-0136: minimum interval and 24-hour maximum are advisory; they are shown as warnings that must be acknowledged before recording, never a hard block [suggested].
- Dose breakdown "2 tablets = 1 g, 500 mg each"; halves allowed; any other fraction is flagged for checking, never rounded [suggested].
- Status recorded from the due state: given, given late, given early or given once only (Table 6, `adminDeriveGivenStatus`).
- Time given defaults to now and changes through TouchDateTimePicker (approximate allowed, "time not known" not allowed, future refused).
- MedicationLine for the order; numbers per MEDi rules.

## Regional behaviour

- Header, identifiers and scan results follow the region; Not given uses AU NIMC, NZ NMC or GB statuses (G10 9.6, G11 8.2); quantities use the medications area's regional rules.
- The time picker uses the device's own time zone so it agrees with the 24-hour times shown elsewhere.

## Do and don't

- Do pass `highRisk` for insulin, opioids, anticoagulants and other locally listed medicines.
- Don't record before the wristband matches; don't hide the undo window for high-risk records you cannot reverse (set `undoDuration` to suit).

## Accessibility

- Steps are an ordered list with headings; problems appear in an alert that receives focus after a blocked attempt; the undo toast is announced and can be paused.
