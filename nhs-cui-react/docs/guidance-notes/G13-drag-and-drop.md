# Drag and drop: moving, reordering and rescheduling

Conformance key as in G1 to G9: **[M]** = Mandatory, **[R]** = Recommended. The NHS CUI guidance has no document on drag and drop. It touches the subject in a few places (listed in section 1); everything else here is a library rule built on WCAG 2.2 and those fragments, so every `DND-` rule is **[suggested]** unless a source ID is given beside it. Research date: 29-Oct-2026.

Purpose: one interaction model for every control that lets a person move something by dragging it: reordering a list (to-do items, goals, columns), moving a card between the columns of a board (tasks by status, a triage queue) and moving or resizing a block on a day or week time grid (appointments, calendar blocks). The model makes dragging a shortcut, never the only way, and puts the consequences of a move in front of the user before anything is saved.

---

## 1. What the sources say

### NHS CUI fragments

- G7 Clinical noting, research on the summary list: clinicians want to reorder the list ("e.g. drag and drop"); conclusion: "Provide a feature to reorder the summary list". Not a numbered guideline.
- G9 GTAB-149 to GTAB-151 [R](L): the user can reorder stacked graphs. The method is not specified.
- G3 PAL-0710 [R]: users choose the displayed columns and their order, except the row key identifier columns (PAL-0720 [M]: those cannot be removed or moved).
- G2 and G8 encodable text: marquee boundaries are draggable, with "corresponding keyboard actions where appropriate" and a hover message that says what the drag does. A1.1: encoding solely by keyboard must be possible.
- G6 MEDa-0032 [M]: keep the list order until manually refreshed; no live re-sorting while the list is open. A list the user is reading never reorders under them.
- G2 D+Ta-0006 [M]: short date format for appointment dates; day of week encouraged for appointments and scheduling. D+Tb: 24-hour time.
- G9 TLN-0140 [R]: thin time gridlines in a colour that does not reduce legibility; never alternating coloured columns.
- G10 AU-DT-06 (R): scheduling controls warn when 00:00 is chosen (ACSQHC).
- Phase 4 mobile rules (CONVENTIONS): never use swipe to commit, delete or change clinical data; long-press is never the only route; touch targets at least 44 px (48 px on mobile screens).

### WCAG 2.2 (the library target, G11 section on accessibility)

- 2.5.7 Dragging Movements (AA): every function that uses a dragging movement can be done with a single pointer without dragging.
- 2.1.1 Keyboard (A): all functionality operable through a keyboard.
- 2.5.8 Target Size (Minimum) (AA): 24 by 24 px at least; the library's own rule is 44 px on a coarse pointer.
- 4.1.3 Status Messages (AA): results of a move are announced without moving focus.
- 1.4.1 Use of Color (A): a drop target, an insertion point or a refusal is never shown by colour alone.
- 2.4.11 Focus Not Obscured (Minimum) (AA): the item being moved and its focus ring stay in view (auto-scroll).
- 2.3.3 Animation from Interactions (AAA, followed where cheap): no motion that carries meaning when the user asks for reduced motion.

---

## 2. Library rules

### Never the only way

- **DND-0010 [M] [suggested]** Every drag has a single-pointer alternative on the same item: move up and move down buttons in a list, a "Move to" menu on a board card, a "Move to..." dialog on a time grid. (WCAG 2.5.7)
- **DND-0020 [M] [suggested]** Every drag has a keyboard model on the drag handle: Space or Enter picks the item up, the arrow keys move it, Space or Enter drops it, Escape cancels and puts it back. Tab while carrying cancels. Home and End move to the start or end of a list. (WCAG 2.1.1)
- **DND-0030 [M] [suggested]** Each step is announced in plain words through a polite live region: "Picked up Review, Mon 10:00. Moved to Tue 11:00. Dropped." A refusal is announced with its reason. Instructions are the handle's description, not hidden in a tooltip. (WCAG 4.1.3)
- **DND-0040 [R] [suggested]** The handle is a real button with a name that says what it moves ("Move Review, Mon 10:00"), so a screen reader user knows what they would pick up.

### Touch and pointer

- **DND-0110 [M] [suggested]** Pointer events, not the HTML drag and drop API (which has no touch support and no keyboard). A mouse or pen drag starts after the pointer moves 4 px with the button down, so a click on the handle still clicks.
- **DND-0120 [M] [suggested]** On touch a drag starts with a long press on the handle (400 ms without moving more than 8 px), so a swipe across the list still scrolls the page. The press shows that it has started (the item lifts and says "Picked up"). Long-press is never the only route (DND-0010).
- **DND-0130 [M] [suggested]** The handle is at least 44 by 44 px on a coarse pointer (`var(--target-coarse)`); on a fine pointer it may be as small as the control height.
- **DND-0140 [R] [suggested]** Near the edge of the scrolling area (48 px) the area scrolls towards the pointer, faster the closer it is, so a target out of view can be reached. (WCAG 2.4.11)
- **DND-0150 [M] [suggested]** Under `prefers-reduced-motion: reduce` the lifted item does not animate and nothing slides into place; the result is shown at once.

### Clear drop targets

- **DND-0210 [M] [suggested]** The place an item will land is shown by an insertion line or a target outline and by words: "Drop here: position 3 of 5", "Drop in Partially completed", "Tue 31-Oct 11:00 to 12:00". (WCAG 1.4.1)
- **DND-0220 [M] [suggested]** A place the item may not go is marked "Cannot drop here" with the reason in words ("A done task cannot be reopened"). The control asks the consumer through `canDrop`, which returns `true` or the reason.
- **DND-0230 [R] [suggested]** The preview of a dragged item shows the same fields as the item itself and no more (privacy: glanceable signals, detail one deliberate click away). It never reveals detail that the resting item keeps one click away.

### Consequences before commit

- **DND-0310 [M] [suggested]** A drop that changes clinical or scheduling data first shows what will happen and asks to confirm, using the same checks the form would use: a moved appointment shows clash warnings (the user may move anyway) and stops (the move cannot be made) before the user confirms.
- **DND-0320 [M] [suggested]** Nothing is final until the consumer's `onDrop` (or `onMove`) resolves. While it runs the item says "Moving". A refusal puts the item back where it was and says why.
- **DND-0330 [R] [suggested]** Show the new position at once (optimistic) only where the change is safe and can be reversed; offer Undo in the confirmation toast for those moves. A move that cannot be reversed (marking a task done) opens the same confirmation the button would.
- **DND-0340 [M] [suggested]** A drop follows the item's own rules: a task moved to Done follows its completion rule (a rule task closes only when its work is recorded); a board offers as drop targets only the transitions the item may make.
- **DND-0350 [M] (MEDa-0032 by analogy)** A list never reorders itself under the user while they are dragging or reading; a move the user did not make is not animated into their list.

### Permission

- **DND-0410 [M] [suggested]** An item is draggable only when the user may make that change. A user who may not sees no handle, no move buttons and no Move menu; the content reads the same. The server refuses the change anyway.

### Never drag for high-consequence moves

- **DND-0510 [M] [suggested]** Never use drag to commit a move with legal or safety consequence: a bed move (a transfer), a legal status, a merge or anything about identity, a medicine's schedule, a referral's priority or triage category. For those, a drag may at most open the reviewed form with the destination filled in; the form commits, never the drop.
- **DND-0520 [M] (Phase 4 mobile rule)** Swipe never commits, deletes or changes clinical data. A long press that starts a drag is not a swipe: it only lifts the item, and the move still needs a drop and, for clinical data, a confirmation.

### Time grids

- **DND-0610 [M] [suggested]** A time grid draws and reads every time in one stated time zone (the locale's, or the site's) and says which ("Times are Australia/Melbourne time"). Moves across a daylight saving change keep the wall-clock time the user chose.
- **DND-0620 [M] [suggested]** Moves and resizes snap to the grid's slot length (15 minutes by default) and never make a block shorter than one slot.
- **DND-0630 [M] (D+Ta-0006, D+Tb)** Times and dates in previews and announcements use the CUI short date with day of week and 24-hour time: "Tue 31-Oct-2026 11:00 to 12:00".
- **DND-0640 [R] (TLN-0140)** Gridlines are thin and quiet; no alternating coloured columns.
- **DND-0650 [R] (AU-DT-06)** A move to 00:00 warns in AU.

---

## 3. Keyboard model (all drag controls)

| Key | Resting on a handle | Carrying an item |
| --- | --- | --- |
| Space, Enter | Pick up | Drop here (then confirm where the control asks) |
| Up, Down | (focus moves as the control's own arrow keys do) | Previous or next position; on a time grid one slot earlier or later |
| Left, Right | | Previous or next column on a board; previous or next day on a time grid |
| Home, End | | First or last position in the list or column |
| Escape | | Cancel: the item goes back, "Move cancelled" |
| Tab | Next control | Cancels, then moves focus |

---

## 4. Choosing the right control

| Job | Control | Alternative to dragging |
| --- | --- | --- |
| Order a short list the user owns (to-do items, goals in a draft plan, list columns, stacked graphs) | `SortableList` | Move up and move down buttons; Home and End |
| Move items between states (tasks by status, a team's queue) | `Board` | A "Move to" menu on every card, the only route on a phone |
| Move or resize blocks in time (appointments, calendar blocks, clinic sessions) | `ScheduleGrid` | "Move to..." dialog with date, start and end |
| Add files | `FileInput` (forms) | The "Choose file" button; dropping files is a shortcut |

Do not use drag for: sorting a list by a column (use sort), changing a list the user does not own, anything in section 2 "Never drag".
