# MobileMedicationsList

Patient medicines list for phones (concept A3): current and past, group and sort from bottom sheets, medication lines that wrap, status lines in words and a look-ahead strip.

## When to use

- The Medicines tab of the patient record on a phone.

## What you provide

- `medications`: `MobileMedicationItem[]` (a medications-area `MedicationRecord` plus `schedule?: { state, at?, lastGivenAt?, nextAt?, availableFrom? }` and `alerts?`).
- `view` / `defaultView` / `onViewChange`, `sort` / `onSortChange`, `grouping` / `onGroupingChange`, `groupingOptions` (default route and form), `onOpen`, `title`, `headingLevel`, `listHeight` (number, CSS length or 'fill' to scroll inside and show the look-ahead strip), `now`, `region`.
- `portal`, `container`, `closeOnBrowserBack`: where the group and sort sheet renders (default from `SheetContainerProvider`, otherwise `document.body`).

```tsx
<MobileMedicationsList medications={meds} listHeight="fill" onOpen={openMedicine} />
```

Utilities: `mobileMedicationStatusParts`, `mobileSortMedications`, `MOBILE_MEDICATION_SORT_LABELS`, `mobileRelativeTime`.

## Guidance implemented

- MEDv current / past split; counts in the segmented control ("Current (7)").
- MEDv-084 [M]: no grouping by default; grouping uses `groupMedications` (MEDv-087, MEDv-091).
- Sort "due first" [suggested]: overdue, due, available, next, given, then suspended; also name A to Z and newest started (MEDv-099), most recently stopped for past (MEDv-100).
- MedicationLine renders each order and wraps; mixed-case lettering per region (AU on-screen 6.1.4, NZ HQSC list).
- Status lines in words with icons: "Overdue 13:00", "Due 14:00", "Given 08:05", "Next 08:00 tomorrow", "Suspended on 26-Oct-2026", "Last given 06:30 · Available now".
- MEDv-048 to MEDv-055: look-ahead strip names the medicines below the visible area, nearest first; a name that does not fit is counted, never truncated; past lists show a count only. Tapping it scrolls to the next one [suggested].
- Group and sort choices are 52 px radio rows in a BottomSheet (Phase 4 rules).

## Regional behaviour

- MedicationLine follows the region (GB CUI Medication Line, AU ACSQHC on-screen order, NZ HQSC rules) and mixed-case lettering defaults on for AU and NZ.

## Do and don't

- Do supply `schedule` so status lines are meaningful.
- Don't truncate medication lines to fit.

## Accessibility

- Segmented control is a radiogroup; cards are buttons when `onOpen` is given; the scrolling list is a labelled, focusable region; the look-ahead button names every medicine below.
