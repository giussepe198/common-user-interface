# DrugAdministrationChart

Single-patient electronic drug chart showing four days of administration events per medication line, used to review the schedule and history and to record administrations in inpatient care.

## When to use

- The main drug administration view for one patient, replacing the paper drug chart.
- Use alongside the medications list: every line here must match one line there.
- Do not use for HDU or ITU infusion management or pump-linked infusions (out of scope of the guidance).

## What you provide

- `medications`: `AdminMedication[]` with name, details, kind (`regular`, `onceOnly`, `asRequiredUnscheduled`, `asRequiredIndicative`, `asRequiredScheduled`, `significantDuration`), dates, scheduled times, events and optional `infusion`, `asRequired`, `verification` and tolerance.
- `now` (defaults to a live clock), `selectedDate` or `defaultSelectedDate` (defaults to today), `grouping`.
- `onRecord(medication, event | null, payload)` to save an administration; `event` is null for a new As Required dose. Without it the chart is read-only.
- Optional: `nilByMouth`, `onClearEvent`, `onOpenSignificantDurationDetail`, `renderMedicationLine`, `pendingUpdates` with `onAcknowledgeUpdates`, `currentUser`, `sites`.

```tsx
<DrugAdministrationChart
  medications={meds}
  now={new Date()}
  nilByMouth={{ since: nbmStart, reason: 'For theatre' }}
  currentUser="Staff Nurse A Example"
  onRecord={(med, event, payload) => save(med.id, event?.id, payload)}
/>
```

## Guidance implemented

- MEDa-0001, 0002, 0003 [M]: one bordered line per drug, separated by white space.
- MEDa-0007, 0262 [M], 0263 [R]: lines shown when current at any point in the visible days, plus drugs current now.
- MEDa-0012 [M], 0013 [M], 0218 [R], 0219 [R], 0261 [R], 0249 [M]: no grouping by default; group by Once Only, Regular, As Required, Significant Duration with collapsible headings; static "Start date and time list order"; "Remove grouping".
- MEDa-0023 to 0031 [M], 0252 [M], 0280 [M]: list ordered by Next administration (Overdue, Due, infusions due to start, Begun, available As Required, Next, locked out, past). Order is not clinical priority.
- MEDa-0032 [M], 0038 [M], 0020 [M], 0021 [M]: order is kept until "Update list order", which is enabled only when a change affects the order; a newly added drug also re-sorts.
- MEDa-0015 to 0018 [M], 0257 [R]: status bar counts Overdue, Due, As Required (available of total) and Begun, with the same Overdue (white on red) and Due (reverse video) styles as the chart and look-ahead.
- MEDa-0247 [M], 0248 [R]: status bar and grouping on the toolbar; no filtering.
- MEDa-0033, 0034, 0035 [M]: previous and next day arrows either side of the columns; calendar in the selected day heading with "Go to today".
- MEDa-0036 [R], 0037 [M]: edge markers with tooltip when a line has no visible events; selecting one moves to that day.
- MEDa-0039, 0041 [M], 0040 [R]: look-ahead areas above and below the list name out-of-view drugs (never past drugs), with Overdue and Due formatting; selecting a name scrolls to it. A line counts as out of view when less than its first 40 px (the drug name and first detail line) is visible, so a line cut off at the top or bottom edge is always named; the areas update on scroll and when the list is resized `[suggested]`.
- MEDa-0042 to 0046 [M], 0043 [R], 0222 [M], 0223 [R], 0224 [M], 0225 [R]: left-hand panel with drug details, prescriber, start, end or review, reverse-video "Completed" or "Discontinued", and distinct As Required and Once Only lines with a text label.
- MEDa-0050, 0051, 0053, 0054, 0058, 0227, 0266, 0268 [M], 0229, 0267, 0298 [R]: status icons in a fixed place, verification leftmost with a green tick when verified and hidden when not used; icons open the information panel.
- MEDa-0060, 0062 [M], 0063 [R]: information panel with text and icon tabs in icon order then Prescriber, extending down from the left-hand panel.
- MEDa-0064, 0065, 0067, 0068, 0082, 0084, 0097 [M], 0083 [R]: four days, selected day third and widest with a border across all lines, time running top to bottom.
- MEDa-0069 to 0071, 0231, 0233, 0235, 0237, 0255, 0276 [M], 0073, 0236 [R]: per-line 24-hour linear time scale labelled with only that drug's scheduled times, 00:00 at top and bottom, moving current-time line and shaded past; no times for unscheduled As Required.
- Midnight schedules (MEDa-0235, 0237; D+Tb-0009): `scheduledTimes` may give midnight as "00:00", "24:00" or "2400" (chart forms, G10 9.6). It is never dropped from the scale and never shown as 24:00: both edge labels "00:00" turn from muted to bold with a keyline and the tooltip "Scheduled at midnight", because the dose sits at the bottom of one day's line and the top of the next [suggested marking]. Other scheduled times are bold too, so edges that are only ruler ends stay muted. `adminScaleLabels(times)` and `adminScheduleMinutes(time)` are exported.
- MEDa-0079, 0080 [M], 0081 [R]: today's heading has an icon, "Today: " and a distinct style even when not selected; a now line crosses today's column.
- MEDa-0232, 0270, 0273, 0274 [M], 0275 [R]: icons centred on their time, scheduled events at intended time, unscheduled As Required at recorded time; lines grow so events never overlap or clip.
- MEDa-0271 [M]: every available unscheduled As Required drug shows one event at the current time.
- MEDa-0277 [M]: past shaded, future unshaded, line for now.
- MEDa-0098, 0100, 0101, 0103, 0104, 0105, 0106 [M], 0256 [R]: selected day shows more detail (times as "Approx HH:mm" or "HH:mm", none when within tolerance, doses, notes), truncated with an ellipsis; other days show only what differs from the plan.
- MEDa-0108, 0109, 0111, 0112, 0113 [M]: recorded event details open on click, keyboard or delayed hover, details above actions ("Change"), closed by Esc or clicking elsewhere.
- MEDa-0134, 0136, 0137 [M]: As Required criteria shown; time restrictions and their end strongly indicated but never block recording.
- MEDa-0142 to 0148, 0150, 0285, 0286, 0287 [M/R], 0149 [R]: Significant Duration bar (dashed until started, solid after), estimated stop marked "(estimate)", interruptions marked, no elapsed-time fill, status box ("Start at", "Due at", "Begun", "Completed", "Discontinued") with a Details control.
- MEDa-0163, 0164 [M]: Nil by Mouth notification below the headings; recording is never disabled.
- MEDa-0190 to 0194, 0245 [M]: activating a Due, Overdue or Future event opens the recording form next to the line without covering the drug details or event, dims other lines and days, and scrolls it fully into view.
- MEDa-0288 to 0293 [M]: dose criteria, ranges, intended and actual doses shown by events as specified.
- MEDa-0294 [M], 0295, 0296, 0297 [R]: prescription changes freeze the chart behind a message describing them until acknowledged.
- MEDa-0299 [R]: activating an event in another day makes that day the selected day first.

## Do and don't

- Do record AU and NZ outcomes with `reasonCode` (and `reasonText`) on the event so the code shows in the cell.

- Do supply every event with a stable `id`, and keep recorded history so the edited marker can be shown.
- Do configure `tolerance` per local governance. The default (Due from 1 hour before, Overdue 1 hour after) is [suggested].
- Don't add filtering or live re-sorting; both are prohibited by the guidance.
- Don't change an Overdue event automatically; if your system must, record "Unknown", never "Missed" or "Not Recorded".
- [suggested] The live clock updates every minute when `now` is omitted.

## Accessibility

- ARIA grid with one tab stop: arrow keys move between the left-hand panel, day cells and events (Up and Down step through events in a cell, then to the next line), Home and End jump to the row ends, Enter or Space activates.
- Each event has an accessible name with its status, time, drug and date; colour is never the only cue (shape, fill, border style and text).
- Status counts are announced politely; Esc closes the calendar, details and the recording form, returning focus to the event.
- [suggested] Enter on the left-hand panel opens the information panel, since its icons are not separate tab stops.

## Regional behaviour

- Drug details: the medications area's `MedicationLine` renders `medication.line` (structured data) or `name` as the generic name followed by `details`, so regional medicine name rules (for example AU and NZ mixed-case lettering, AU no truncation) come from that component. `renderMedicationLine` still overrides it.
- GB: as described above.
- AU: NIMC reason codes in the cells and popover (code, meaning and full legend), "When required" instead of "As Required" and "Once only" (no abbreviations on screen, ACSQHC 2024), a code legend under the chart, the paediatric P code with `paediatric`, and a note on any line scheduled at "00:00" or "24:00" because the 2024 recommendations say avoid midnight (G10 9.6).
- NZ: HQSC non-administration codes and legend, "When required" (G11 8.1, 8.2).
- `showCodeLegend` turns the legend off [suggested default on for AU and NZ].
