# ScheduleGrid

A day or week time grid where appointments and blocks are moved and their length changed by dragging, by the keyboard or through "Move to...", always confirmed with the consequences before anything is saved.

## When to use

- Diaries, clinic sessions, room diaries: anywhere blocks of time are moved.
- Not for clinical event times recorded in the past (a contact, an administration): those are corrected in the record with a reason.

## What you provide

```tsx
<ScheduleGrid
  label="Diary, week of 26-Oct-2026"
  days={['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']}
  events={[{ id: 'a1', title: 'Review', detail: 'Interview room 2', start: '2026-10-25T23:00:00Z', end: '2026-10-26T00:00:00Z' }]}
  timeZone="Australia/Melbourne"
  canMove={e => mayBook(e)}                                   // RBAC: false hides grips and options
  checkMove={(e, p) => api.checkReschedule(e.id, p.start, p.end)}  // { warnings, stops, notes }
  onMove={(e, p) => api.reschedule(e.id, p.start, p.end)}      // Promise; a string is a refusal
  onOpenEvent={e => openAppointment(e.id)}
/>
```

- `dayStart` and `dayEnd` (minutes, default 07:00 to 19:00), `slotMinutes` (default 15), `hourHeight` (default 64 px; at least 96 px on a coarse pointer so a 30-minute block holds a 44 px grip), `timeZoneNote`, `eventNoun` (default "appointment"), `region`, `words`.
- An event's `title` and `detail` are the only words on the block: never a reason, a diagnosis or an address (screens may be overlooked). `status` adds a state in words; `kind: 'block'` draws a calendar block; `movable` and `resizable` per event.

## Guidance implemented

- DND-0010 [M] [suggested] each movable block has a "Move options" button that opens "Move to...": quick changes (15 minutes earlier or later, longer or shorter) and the day, start and end (CUI DateInput and TimeInput). It is a dialog, not a menu, so it is never clipped by the grid's scrolling frame [suggested].
- DND-0020 [M] [suggested] the grip: Space or Enter picks up, Up and Down move a slot, Left and Right a day, Home and End the start or end of the day, Space or Enter drops, Escape cancels. The bar at the bottom of a block changes its end the same way with Up and Down. The bar is drawn on a fine pointer where the block is tall enough for it (24 px, WCAG 2.5.8); on touch and on short blocks the length changes through "Move options" [suggested].
- DND-0310 [M] [suggested] a drop, a quick change or "Move to..." never saves: it opens a confirmation with From, To and the length, and the result of `checkMove` while it checks ("Checking the new time"): stops ("Cannot move: ...") disable the move, warnings ("Warning: ...") change the button to "Move anyway", notes are listed.
- DND-0320 [M] [suggested] `onMove` runs only after the user confirms; a refusal stays in the dialog ("Not moved: ...") and the block keeps its time.
- DND-0610 [M] [suggested] every time is read and drawn in one zone, named above the grid; wall times convert through the platform time zone database, so a move across a daylight saving change keeps the clock time chosen; a time in a spring-forward gap resolves to after the gap, a repeated autumn time to the first.
- DND-0620 [M] [suggested] snap to the slot; never shorter than one slot or outside the day.
- DND-0630 [M] D+Ta-0006 and D+Tb: "Tue 27-Oct-2026 11:00 to 12:00" in day headings, the dialog and announcements.
- DND-0640 [R] TLN-0140: thin hour lines, no alternating column colours.
- Overlapping blocks sit side by side so a double booking is never hidden behind another block [suggested].
- DND-0410 [M] [suggested] no `onMove`, `canMove` false or `movable: false`: no grip, no end bar and no options button.

## Regional behaviour

- AU (AU-DT-06): a move or a change of length to 00:00 adds the warning "A time of 00:00 can be misread. Consider 23:59 or 00:01." GB and NZ: no warning.
- The zone defaults to the locale's (`ClinicalLocaleProvider`, Europe/London, Australia/Sydney, Pacific/Auckland); pass the site's zone where it differs.

## Do and don't

- Do pass the same checks the booking form uses to `checkMove` (clinician and person clashes warn; a room clash stops).
- Do keep event words minimal: the grid may be seen by others.
- Don't call `onMove` from anywhere but the confirmation.

## Accessibility

- A `group` named by `label`; each day's blocks are a list labelled by the day heading.
- The grip is a button "Move <title>, <day> <time>"; the end bar "Change the end of <title>, now <time>"; the options button "Move options for <title>, <time>".
- The confirmation is an `alertdialog`; the check results are in a polite live list; a refusal is an alert.
- The grid's frame scrolls sideways on a narrow screen and says so above it.
