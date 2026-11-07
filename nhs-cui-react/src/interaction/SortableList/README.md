# SortableList

A list the user puts in order: drag by the handle, use the keyboard on the handle, or the move up and down buttons.

## When to use

- A short list the user owns and orders: to-do items, goals in a draft care plan, the columns of a list (`ColumnChooser` uses it), stacked graphs (GTAB-151).
- Not for sorting by a column (use sort), not for a list the reader does not own, never for a list that must keep a clinical order (MEDa-0032).

## What you provide

```tsx
<SortableList
  label="Goals"
  items={goals}
  getKey={g => g.id}
  getLabel={g => `Goal ${g.n}: ${g.domain}`}
  renderItem={g => <GoalSummary goal={g} />}
  canMove={g => mayEdit}                         // false: no handle, no buttons (RBAC)
  onReorder={(keys, move) => saveOrder(keys)}    // may return a Promise; a string is a refusal
/>
```

- `moveButtons` (default true), `moveLabels` (`handle`, `earlier`, `later`), `positionWords`, `renderPreview`, `disabled`, `as="ol"` when the order means something to the reader, `words` to override announcements.
- Controlled: show the new order once `onReorder` has it. An item with `canMove` false keeps its place and nothing can be moved across it.

## Guidance implemented

- G7 research [R] "Provide a feature to reorder the summary list"; GTAB-151 [R] reorder stacked graphs; PAL-0710 [R] column order.
- DND-0010 [M] [suggested] move up and move down buttons on every movable item, the single-pointer alternative (WCAG 2.5.7).
- DND-0020 [M] [suggested] handle keyboard: Space or Enter, Up and Down, Home and End, Space or Enter, Escape.
- DND-0030 [M] [suggested] "Picked up Call GP, position 1 of 3." "Moved to position 2 of 3." "Dropped."
- DND-0120 [M] [suggested] a long press starts a touch drag; a swipe scrolls.
- DND-0210 [M] [suggested] an insertion line with words: "Drop here: position 3 of 5". It takes no height, so the list does not jump while the pointer looks for a place (DND-0350).
- DND-0220 [M] [suggested] "Cannot drop here: Patient stays where it is" for a place across a fixed item.
- DND-0320 [M] [suggested] "Moving" while `onReorder` runs; "Not moved: <reason>" beside the item when refused.
- DND-0410 [M] [suggested] `disabled` or `canMove` false: no handle and no buttons; the content reads the same.

## Regional behaviour

- None.

## Do and don't

- Do save the order where it belongs (the API) and show the list in the saved order.
- Do give every item a short, distinct label: it names the handle and the buttons.
- Don't put a drag handle on a list whose order is a sort or a clinical rule.

## Accessibility

- A real `ul` (or `ol`) named by `label`; the insertion line is hidden from assistive technology.
- Handle: a button named "Move <label>", described by the keyboard instructions, 44 px on a coarse pointer.
- Move buttons: "Move <label> up" and "Move <label> down" (or your words), disabled at the ends; focus stays on the button after a move.
