# Drag and drop primitives

The engine every drag control in this library is built on: `useDragAndDrop` (pointer, touch, keyboard, announcements, auto-scroll, refusals and asynchronous drops) and the small parts a control draws with it: `DragHandle`, `DragAnnouncer`, `DragPreview` and `DropRefusal`.

## When to use

- To build a new control where people move things: a list, a board, a time grid, a tree. Use `SortableList`, `Board` or `ScheduleGrid` first; reach for the engine only when none of them fits.
- Not for moves with legal or safety consequence (a bed move, a legal status, identity, a medicine's schedule, a referral's priority): see G13 DND-0510. A drop there may at most open the reviewed form with the destination filled in.

## What you provide

The engine holds no layout. The control tells it where things are and draws from `drag`:

```tsx
const dnd = useDragAndDrop<number>({
  origin: id => keys.indexOf(id),                          // where the item is now
  targetAt: (point, id, grab) => indexUnder(point),        // the target under the pointer, or null
  step: (from, key) => dragStepIndex(from, keys.length, key), // one key press away
  canDrop: (id, to) => (to === 0 ? 'the first place is fixed' : true), // true, or the reason in words
  itemWords: id => labelOf(id),                            // "Call GP"
  targetWords: to => dragPositionWords(to, keys.length),   // "position 3 of 5"
  onDrop: (id, to) => save(id, to),                        // may return a Promise; a string is a refusal
});

<li data-drag-item={id}>
  <DragHandle bindings={dnd.handleProps(id)} label={`Move ${labelOf(id)}`} busy={dnd.busyId === id} />
  ...
</li>
<DragPreview drag={dnd.drag}>{labelOf(dnd.drag?.itemId)}</DragPreview>
<DragAnnouncer announcement={dnd.announcement} instructionsId={dnd.instructionsId} instructions={dnd.words.instructions} />
```

`commit(id, target)` runs a move that did not come from a drag (move buttons, a menu) through the same refusal, busy and announcement handling. `words` overrides any announcement.

## Guidance implemented

All rules are this library's own (G13), built on WCAG 2.2; the NHS CUI guidance has no drag and drop document.

- DND-0010 [M] [suggested] the engine never stands alone: every control built on it offers a single-pointer alternative (WCAG 2.5.7).
- DND-0020 [M] [suggested] keyboard on the handle: Space or Enter picks up, arrows and Home and End move, Space or Enter drops, Escape cancels, Tab cancels and moves on (WCAG 2.1.1).
- DND-0030 [M] [suggested] every step in plain words in a polite live region: "Picked up Review, Mon 10:00. Moved to Tue 11:00. Dropped." (WCAG 4.1.3).
- DND-0040 [R] [suggested] the handle is a real button named for what it moves and described by the instructions.
- DND-0110 [M] [suggested] pointer events, not the HTML drag and drop API; a mouse drag starts after 4 px so a click still clicks.
- DND-0120 [M] [suggested] touch drags start with a 400 ms long press; moving first is a scroll. A long press opens no context menu on the handle.
- DND-0130 [M] [suggested] the handle is 44 px on a coarse pointer.
- DND-0140 [R] [suggested] the scrolling frame (or the page) scrolls towards the pointer near its edge.
- DND-0150 [M] [suggested] nothing animates under reduced motion.
- DND-0220 [M] [suggested] `canDrop` returns the reason in words; the drop is refused with it.
- DND-0230 [R] [suggested] the preview shows what you give it: give it the item's own fields and no more.
- DND-0320 [M] [suggested] `onDrop` may be asynchronous; the item is busy ("Moving") until it resolves; a string (or a thrown error) puts it back with the reason; `false` puts it back quietly (for a drop that opens a form instead).
- DND-0410 [M] [suggested] `disabled` turns everything off; controls show no handle for an item the user may not move.

## Regional behaviour

- None: the words are UK, AU and NZ English and every one can be overridden through `words`.

## Do and don't

- Do mark the moving element with `data-drag-item` so the preview takes its size and the grab point is right.
- Do render the preview outside any size container (a container is the containing block for a fixed layer).
- Don't commit a clinical or scheduling change from `onDrop` without showing its consequences first (DND-0310): open a confirmation and return.
- Don't use drag for anything in G13 section "Never drag for high-consequence moves".

## Accessibility

- Handle: `button`, `aria-describedby` the instructions, `aria-pressed` while carried.
- Live region: `role="status"`, polite, atomic; the same words twice are still announced.
- After a keyboard drop the handle keeps focus, even when the item is redrawn somewhere else.
- The preview is `aria-hidden`; the announcements carry the meaning.
