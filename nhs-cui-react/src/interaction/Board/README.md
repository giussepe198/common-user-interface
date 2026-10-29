# Board

Kanban columns: cards move between columns (and within one, if allowed) by dragging, by the keyboard, or by the Move menu on each card.

## When to use

- Items that move through states the user changes: tasks by status, a team's queue by state.
- Only for transitions the item may make and that can be confirmed or undone. Never for a triage category, a referral's priority, a bed or a legal status (G13 DND-0510).

## What you provide

```tsx
<Board
  label="Tasks by status"
  columns={[{ id: 'open', title: 'Not started' }, { id: 'progress', title: 'Partially completed', limit: 10 }, { id: 'done', title: 'Done' }]}
  items={tasks}
  getKey={t => t.id}
  getLabel={t => t.title}
  getColumn={t => t.status}
  renderCard={t => <TaskCard task={t} />}
  canMove={t => mayChange(t)}                                          // RBAC: false hides handle and menu
  canDrop={(t, to) => (to === 'done' && t.rule ? 'it closes when its work is recorded' : true)}
  onMove={(t, move) => save(t, move)}                                  // Promise; a string is a refusal; false puts it back
  itemNoun={{ one: 'task', other: 'tasks' }}
/>
```

- `reorderWithinColumn` (default false: a column keeps the order it is given), `headingLevel`, `narrowBelow` (default 600 px), `renderPreview`, `disabled`, `words`.
- A column `limit` refuses more cards in words ("Partially completed is full (10 of 10)"); `emptyText` for an empty column.

## Guidance implemented

- DND-0010 [M] [suggested] a "Move" menu on every movable card, listing every other column; the single-pointer alternative and the only route on a phone.
- DND-0020 [M] [suggested] handle keyboard: Space or Enter picks up, Left and Right change column, Up and Down (and Home and End) change place when `reorderWithinColumn`, Space or Enter drops, Escape cancels.
- DND-0030 [M] [suggested] "Picked up Phone carer, Not started." "Moved to Partially completed." "Dropped."
- DND-0210, DND-0220 [M] [suggested] while a card is carried every other column says in words whether it takes it ("Can drop in Done" or "Cannot drop here: <reason>"); the column under the pointer says "Drop in <column>". Never colour alone.
- DND-0340 [M] [suggested] the Move menu shows illegal columns disabled with the reason as their second line.
- DND-0320 [M] [suggested] "Moving" on the card while `onMove` runs; "Not moved: <reason>" when refused.
- DND-0410 [M] [suggested] `canMove` false or `disabled`: no handle and no Move menu.
- Counts in words in each heading ("3 tasks", "1 task, limit 5") [suggested]; empty columns say so ("No tasks").
- Narrow screens (below `narrowBelow`, default 600 px) [suggested]: the columns stack; all but the first start collapsed behind a disclosure button with the count beside it; handles are not shown and the Move menu moves cards.

## Regional behaviour

- None.

## Do and don't

- Do let `canDrop` say only what the item's own rules allow, using the same rules as the server; the server refuses anyway.
- Do open the same confirmation the button would for a move that cannot be undone (return `false` from `onMove` and open your form).
- Don't make a column a decision the item's owner did not take (a triage category, a priority).

## Accessibility

- A `group` named by `label`; each column a `section` named by its heading; cards in a `ul` named "<column>, <count>".
- Handle: a button "Move <label>" with the keyboard instructions; the Move menu button reads "Move <label>".
- Collapsed columns on a narrow screen use a button with `aria-expanded`.
