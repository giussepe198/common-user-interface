# InfusionDetailView

Detailed view of a Significant Duration administration such as an infusion, where its bag changes, rates, checks, issues and notes are recorded.

## When to use

- From the status box "Details" on `DrugAdministrationChart` (`onOpenSignificantDurationDetail`). Infusions are recorded here, not in the main chart (MEDa-0160).

## What you provide

- `medication` with `infusion` and `infusion.log` entries (`AdminInfusionEntry`: kind, at, by, rate, volume, `volumeApprox`, `pumpSetting`, category, text, and for issues `resolved`, `instruction`, `actions`).
- `onRecord(entry)` to save a new entry; `onIssueAction(entryId, actionId)`, `onResolveIssue`, `onClose`, `categories` (your limited list).

```tsx
<InfusionDetailView medication={med} now={now} currentUser={user} onRecord={add} onIssueAction={act} onClose={close} />
```

## Guidance implemented

- MEDa-0152 [R]: full record of start, bag changes, rates, pump settings, interruptions, checks, issues and notes.
- MEDa-0153 [R]: static graphic with distinct marker shapes for notes (circle), checks (diamond), issues (warning triangle), bag changes and rate changes, plus interruptions, with a key.
- MEDa-0157 [R]: checks with recorded volumes; rates in the record and the current rate.
- MEDa-0159 [R]: outstanding issues with the instruction and action buttons.
- MEDa-0160 [R]: recording form in this view.
- MEDa-0161 [R]: "Volume is approximate", shown as "Approx" in the record.
- MEDa-0162 [R]: issues (required) and notes (optional) classified from a limited list.
- MEDa-0145 [M], 0146 [M], 0285 [M]: no elapsed-time fill or progress; the stop is labelled "Estimated stop" and includes recorded interruptions.
- MEDa-0239 [M]: recorded times cannot be in the future.
- [suggested] Default category list and entry labels; times are entered for today.

## Do and don't

- Do keep the log as an audit trail; resolve issues rather than deleting them.
- Don't animate the graphic or show running totals.

## Accessibility

- The graphic is described by its caption and every entry is in the table, so the markers are decorative.
- Form fields are labelled; errors are listed in an alert and fields have `aria-invalid`; a polite status announces each recorded entry.

## Regional behaviour

No differences between GB, AU and NZ. "Estimated stop" is written in full, which also meets the AU rule of no abbreviations on screen. Drug details come from `MedicationLine`, which applies regional name rules.
