# MobileDrugAgenda

One-day drug chart for phones (concept P3): doses by time with a now line, a day switcher, each dose's state by shape and words, a when-required section with availability, and a slot for the 4-day chart in landscape.

## When to use

- The drug chart view of the patient record in portrait. In landscape pass DrugAdministrationChart as `landscapeChart`.

## What you provide

- `medications` (`AdminMedication[]`, the same data as DrugAdministrationChart), `now`, `selectedDate` / `defaultSelectedDate` / `onSelectedDateChange`.
- Link-outs: `onOpenEvent(med, event)`, `onOpenAsRequired(med)`, `onOpenChart()`.
- `medicationAlerts` (words per medication id), `landscapeChart`, `showLandscapeHint`, `label`, `region`.

```tsx
<MobileDrugAgenda medications={meds} onOpenEvent={openDose} onOpenAsRequired={givePrn}
  landscapeChart={<DrugAdministrationChart medications={meds} />} onOpenChart={openChart} />
```

Utility: `mobileAgendaSlots(medications, day, now, region)`.

## Guidance implemented

- MEDa-0117 / MEDa-0120 [M]: given = filled square with tick or code; not given = solid-border square with the code; overdue = filled circle "!"; due = square with clock; scheduled = dashed square; once-only events are round (MEDa-0132). Every mark has words beside it.
- MEDa-0250 / MEDa-0252: "Overdue by 1hr 6min" (D+Tb duration format), "Due now", "Next dose" only when nothing is due or overdue.
- AU-MD-08 [M]: codes shown with meaning ("R: Refused") and the written reason.
- Now line [suggested placement]: before the first slot later than now or holding a due dose, so overdue doses stay above and due doses sit just below (concept P3).
- MEDa-0136: when-required availability is advisory ("Available from 18:00 · last 12:00").
- Day switcher: previous, today (or "Go to today"), next; 48 px targets.
- Landscape hint with an "Open 4-day chart" button, because rotation may be locked [suggested].

## Regional behaviour

- GB: statuses in words without codes; section "As Required".
- AU: NIMC code and meaning; "When required" (ACSQHC 2024 terminology); drug names in mixed-case lettering.
- NZ: NMC code and meaning; "When required"; HQSC mixed-case lettering.

## Do and don't

- Do refresh `now` every minute.
- Don't record from this view by swipe; open the event instead.

## Accessibility

- Section named "Drug chart"; day buttons named in full ("Next day, Wed 28-Oct-2026") with `aria-current="date"` on today; slots are an ordered list; the now line is a separator named "Now 14:06".
