# TimelineView

A timeline of a patient's record: problems, medications and observations plotted against one shared time axis, with a now line, navigation controls and keyboard access.

## When to use

To see how problems, prescriptions and observations relate over time for one patient. Always alongside other views of the same data (the timeline is never the only view).

## What you provide

```tsx
<TimelineView
  patientBanner={<PatientBanner {...patient} />}
  now={new Date()}
  defaultPeriod="24h"
  sections={[
    { id: 'problems', title: 'Problems', rows: [{ id: 'cap', label: 'Pneumonia', entries: [{ id: 'p1', kind: 'open', start: '2026-10-21T09:00', labelFields: ['Community-acquired pneumonia'] }] }] },
    { id: 'meds', title: 'Medications', defaultLevelOfDetail: 'full', rows: [{ id: 'amox', label: 'Co-amoxiclav', entries: [
      { id: 'm1', kind: 'known', start: firstDose, end: lastDose, labelFields: ['Co-amoxiclav', '625 mg', 'oral', 'three times a day'] }] }] },
    { id: 'obs', title: 'Observations', graphs: [{ id: 'pulse', label: 'Pulse rate (beats/min)', graph: { series: [pulse], yRange: { min: 40, max: 140 } } }] },
  ]}
  onEntryActivate={(entry, row) => openAdministrationView(entry.id)}
/>
```

Use `kind: 'point'` for once-only doses with no significant duration (at the planned time), `'known'` for courses from first to last planned administration, and `'open'` for ongoing items (TLN-0290, 0380, 0430).

## Guidance implemented

Layout
- Patient banner across the top (`patientBanner`). Omit it only when the host screen already shows the patient banner directly above the timeline; no empty banner container is then drawn `[suggested]`. TLN-0010/0020 [R] navigation controls together, directly above the viewing area; TLN-0030 [R] the viewing area resizes with its container.
- TLN-0040 [M] full-width rows; TLN-0050/0060 no gradients or patterns; TLN-0070/0090 [M]/[R] exactly two alternating row colours, one white; TLN-0100 margins in each row.
- TLN-0110/0120 [M] proportional time and one axis for the whole view; TLN-0130 [M] time marks at top and bottom with gridlines; TLN-0140/0150 thin gridlines, day starts heavier.
- TLN-0160 [M] prominent now line with markers on both axes; TLN-0170/0180 the future has a subtle darker shade, the past none. Entry styles never change between past and future (TLN-0370).

Entries
- TLN-0210..0280 [M] one colour and one symbol (a downward arrowhead with its centre marked) for all point entries, constant size at every period.
- TLN-0300..0360 [M] known-duration entries: unbroken thick line, no fill, different start and end symbols hanging below the line; start symbol's left edge on the start time, end symbol's right edge on the end time, so end-to-end entries show a break.
- TLN-0400..0420 open entries run to the right margin with no end symbol.
- TLN-0680..0710 [M] crowded symbols become same-height vertical lines; points closer than 3 px become a counted cluster with a message to choose a shorter period.

Labels
- TLN-0440..0490 [M] labels above entries with a leader line from the label's left edge; duration labels stick to the left edge when the start is out of view; point labels are not shown when out of view.
- TLN-0500/0510 [M] labels never wrap or shift left: they are shortened at the right edge with an ellipsis, with the full text in the tooltip and accessible name.
- TLN-0520/0530 [R] overlapping identical labels are hidden with their leader lines kept; different labels stack at higher levels (`resolveLabelOverlaps`).
- TLN-0550/0560 [M] a drug name is never partly shown and detail fields are dropped whole (`timelineFitLabel`); TLN-0570/0590 "Full details" shows complete labels except at the right edge; TLN-0580/0600 "Names" shows the drug name only, with full details in the accessible name and tooltip.

Row identifiers and sections
- TLN-0610..0620 [M] identifier cells on the left, in the row colour, text top left; TLN-0650 [M] labels and identifiers are never both hidden; TLN-0660 [R] hiding identifiers widens the plot but keeps the same period; TLN-0670 [R] collapsed identifiers keep a row menu with the identifier text and row options.
- TLN-0800..0830 [M] sections with a full-width title bar, collapse control on the left, and user-resizable height (drag the bottom edge).
- TLN-0850..0870 [M]/[R] rows with entries scrolled out of view: arrows with counts at the top and bottom of the identifier column, and the total in the title bar.
- TLN-0880..0930 [M] per-section level of detail (Overview, Entries only, Names, Full details) on the right of the title bar; defaults per section.

Graphs
- TLN-0720/0840 graphs in their own section; TLN-0730 prominent dividers between graph rows; TLN-0740 graph furniture persists with no data; TLN-0750 same time axis; TLN-0760 label in the identifier cell; TLN-0770 value scale inside the left edge of the viewing area; TLN-0790 horizontal gridlines for graphs only.

Navigation
- TLN-1070 [M] period presets from 2 hours to 3 months; TLN-1080/1090 [R] period changes keep now in place, or the old midpoint (`timelinePeriodChange`).
- TLN-1100 [R] first display includes now; TLN-1110 [R] scroll earlier and later, jump by the period ("Jump 24 hours earlier"), and "Now".
- TLN-1120..1140 [R]/[M] "Whole record" slider above the main navigation, away from the time axis; its date labels show only while it is in use.
- TLN-1150..1170 [R] per-row "Go to previous entry" and "Go to next entry", shown only when such entries exist; they recentre the whole view on the entry's start.

Row label options
- TLN-0630 [M] at "Names", rows whose labels overlap offer a row option in the identifier cell: stacked labels (default, TLN-0530) or one line with each label shortened to end before the next (fields dropped whole, the name never cut, full text in the tooltip and accessible name). Set the default per row with `defaultStackLabels`. Not offered at "Full details", where labels are never shortened (TLN-0590).

Related events
- TLN-0940 [R] `eventSets` on a section are offered as section-wide check boxes in the title bar, hidden when collapsed (TLN-0820).
- TLN-0960/0980 [M]/[R] events on a line below their entry, one line per set, icon centred on the time with a vertical connector up to the entry; TLN-0990 [R] the set name in the identifier cell aligned with its line; TLN-0970 [M] crowded icons become ticks, then a counted indicator (`timelineCrowding`).
- TLN-0950 [R] each event's value as a tooltip and accessible name, and listed in its entry's accessible name for keyboard users.
- TLN-1000 [R] a set not safe at the current level of detail is deselected and its check box disabled; TLN-1020 [R] sets only at levels with entry labels ("Names", "Full details") and only for labelled entries (`timelineEventSetAvailable`).
- TLN-1010/1060 [M] administrations only at "Full details"; TLN-1040 [M] drawn with the drug administration chart's own `AdministrationEventIcon`; TLN-1050 [M] plotted at the actual time, planned ones at the intended time with a dashed outline; TLN-1030 [M] read-only.

## Do and don't

- Do give the medication set its own section (TLN-0830) and use the Medication Line format for full labels.
- Don't plot administrations at entry time or record administrations here (TLN-1030/1050).
- Don't colour entries by type, or use red and green (TLN-0210/0220).

## Accessibility

- Entries are focusable with one tab stop for the canvas: Left and Right move along a row, Up and Down to the nearest entry in the next row, Home and End to the row ends, Enter activates.
- Each entry's accessible name gives the full label and its times ("Co-amoxiclav 625 mg oral three times a day, from 27-Oct-2026 08:00 to 29-Oct-2026 08:00").
- Sections are labelled regions with `aria-expanded` collapse buttons; the viewed range is announced politely when it changes.
