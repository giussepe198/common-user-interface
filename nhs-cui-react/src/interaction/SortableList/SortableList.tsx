import React from 'react';
import { Button, cx } from '../../core';
import { DragAnnouncer, DragHandle, DragPreview, DropRefusal } from '../DragAndDrop/DragAndDrop';
import { useDragAndDrop, type DragDropResult, type DragWords } from '../DragAndDrop/useDragAndDrop';
import { dragInsertionIndex, dragPositionWords, dragReorder, dragStepIndex } from '../utils/dragDrop';

/** One move, as `onReorder` receives it. */
export interface SortableListMove {
  key: string;
  from: number;
  to: number;
}

export interface SortableListProps<T> {
  /** The items in their current order. Controlled: show the new order once `onReorder` has it. */
  items: readonly T[];
  /** A stable key per item. */
  getKey: (item: T) => string;
  /** The item in a few words, for the handle, the move buttons and announcements ("Tasks", "Goal 2: housing"). DND-0040. */
  getLabel: (item: T) => string;
  /** The item's own content. The handle and the move buttons are drawn around it. */
  renderItem: (item: T, state: { index: number; dragging: boolean }) => React.ReactNode;
  /** What the lifted copy shows under the pointer. Default: the label. Never more than the item shows (DND-0230). */
  renderPreview?: (item: T) => React.ReactNode;
  /**
   * The new order. May return a Promise; nothing is final until it resolves, and a string it gives (or throws) is
   * the reason the move was refused (DND-0320).
   */
  onReorder?: (keys: string[], move: SortableListMove) => DragDropResult | Promise<DragDropResult>;
  /** Whether this item may be moved by this user. False: no handle and no move buttons for it (DND-0410). */
  canMove?: (item: T) => boolean;
  /** Read only: no handles and no move buttons at all (DND-0410). */
  disabled?: boolean;
  /** Accessible name of the list ("Shown columns", "Goals"). */
  label: string;
  /** Show the move up and move down buttons, the single-pointer alternative to dragging (DND-0010). Default true. */
  moveButtons?: boolean;
  /** Words for the controls. Defaults: "Move <label>", "Move <label> up", "Move <label> down". */
  moveLabels?: { handle?: (label: string) => string; earlier?: (label: string) => string; later?: (label: string) => string };
  /** A position in words. Default "position 3 of 5". */
  positionWords?: (index: number, count: number) => string;
  /** Override the drag announcements. */
  words?: Partial<DragWords>;
  /** Numbered list (`ol`) when the order means something to the reader. Default `ul`. */
  as?: 'ul' | 'ol';
  className?: string;
  id?: string;
}

/**
 * A list the user puts in order (G13): drag by the handle (mouse, pen, or a long press on touch), the keyboard on the
 * handle (Space or Enter to pick up, Up and Down, Home and End, Space or Enter to drop, Escape to cancel) or the move
 * up and down buttons. An insertion line says where the item will land, in words. To-do items, goals in a draft
 * plan, list columns (ColumnChooser).
 */
export function SortableList<T>({
  items,
  getKey,
  getLabel,
  renderItem,
  renderPreview,
  onReorder,
  canMove,
  disabled = false,
  label,
  moveButtons = true,
  moveLabels,
  positionWords = dragPositionWords,
  words,
  as = 'ul',
  className,
  id,
}: SortableListProps<T>) {
  const keys = items.map(getKey);
  const byKey = new Map(items.map(i => [getKey(i), i] as const));
  const listRef = React.useRef<HTMLUListElement & HTMLOListElement>(null);
  const movable = (item: T) => !disabled && !!onReorder && (canMove ? canMove(item) : true);
  const labelOf = (k: string) => {
    const it = byKey.get(k);
    return it === undefined ? k : getLabel(it);
  };
  const earlierLabel = moveLabels?.earlier ?? ((l: string) => `Move ${l} up`);
  const laterLabel = moveLabels?.later ?? ((l: string) => `Move ${l} down`);
  const handleLabel = moveLabels?.handle ?? ((l: string) => `Move ${l}`);
  const buttonRefs = React.useRef(new Map<string, HTMLButtonElement | null>());

  const reorder = (key: string, to: number) => {
    const from = keys.indexOf(key);
    return onReorder ? onReorder(dragReorder(keys, from, to), { key, from, to }) : undefined;
  };

  const dnd = useDragAndDrop<number>({
    origin: k => keys.indexOf(k),
    targetAt: (p, k) => {
      const list = listRef.current;
      if (!list) return null;
      const r = list.getBoundingClientRect();
      // Well outside the list sideways or past its ends: no target, the drop puts the item back.
      if (p.x < r.left - 48 || p.x > r.right + 48 || p.y < r.top - 48 || p.y > r.bottom + 48) return null;
      const spans: Array<{ start: number; size: number }> = [];
      for (const li of Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-drag-item]'))) {
        if (li.dataset.dragItem === k) continue;
        const b = li.getBoundingClientRect();
        spans.push({ start: b.top, size: b.height });
      }
      return dragInsertionIndex(p.y, spans);
    },
    step: (from, key) => dragStepIndex(from, keys.length, key),
    canDrop: (k, to) => {
      // Items that may not move hold their places: nothing may land between them and the start or end.
      const order = dragReorder(keys, keys.indexOf(k), to);
      const fixed = items.filter(i => !movable(i)).map(getKey);
      for (const f of fixed) if (order.indexOf(f) !== keys.indexOf(f)) return `${labelOf(f)} stays where it is`;
      return true;
    },
    itemWords: labelOf,
    targetWords: to => positionWords(to, keys.length),
    onDrop: (k, to) => reorder(k, to),
    disabled: disabled || !onReorder,
    words,
  });

  const buttonMove = async (key: string, dir: -1 | 1) => {
    const from = keys.indexOf(key);
    const to = from + dir;
    if (to < 0 || to >= keys.length) return;
    const ok = await dnd.commit(key, to);
    if (ok) dnd.announce(`${labelOf(key)} moved to ${positionWords(to, keys.length)}.`);
    // Focus stays on the button that moved it, or its partner when it reached an end.
    requestAnimationFrame(() => {
      const same = buttonRefs.current.get(`${key}:${dir}`);
      const other = buttonRefs.current.get(`${key}:${-dir}`);
      (same && !same.disabled ? same : other)?.focus();
    });
  };

  const drag = dnd.drag;
  const from = drag ? keys.indexOf(drag.itemId) : -1;
  // The insertion line sits before the item that will follow the moved one (among the others), or after the last.
  const others = drag ? keys.filter(k => k !== drag.itemId) : keys;
  const showLine = drag && drag.target !== null && drag.target !== from;
  const lineBefore = showLine ? (others[drag.target as number] ?? null) : null;
  const lineWords = drag && drag.target !== null ? (drag.valid === true ? `Drop here: ${positionWords(drag.target, keys.length)}` : `Cannot drop here: ${drag.valid}`) : '';
  const line = (
    <li className="cui-sortable-list__line" aria-hidden="true" key="cui-sortable-line">
      <span className={cx('cui-drop-label', drag?.valid !== true && 'cui-drop-label--refused')}>{lineWords}</span>
    </li>
  );
  const List = as;

  return (
    <div className={cx('cui-sortable-list', disabled && 'cui-sortable-list--read-only', className)} id={id}>
      <List ref={listRef} className="cui-sortable-list__items" aria-label={label}>
        {items.map((item, index) => {
          const key = getKey(item);
          const can = movable(item);
          const isDragged = drag?.itemId === key;
          const busy = dnd.busyId === key;
          const itemLabel = getLabel(item);
          return (
            <React.Fragment key={key}>
              {showLine && lineBefore === key ? line : null}
              <li
                data-drag-item={key}
                className={cx('cui-sortable-list__item', isDragged && 'cui-sortable-list__item--lifted', busy && 'cui-sortable-list__item--busy')}
                aria-busy={busy || undefined}
              >
                {can ? <DragHandle bindings={dnd.handleProps(key)} label={handleLabel(itemLabel)} busy={busy} /> : null}
                <div className="cui-sortable-list__content">
                  {renderItem(item, { index, dragging: isDragged })}
                  {busy ? <span className="cui-sortable-list__status">Moving</span> : null}
                  {dnd.refusal?.itemId === key ? <DropRefusal reason={dnd.refusal.reason} /> : null}
                </div>
                {can && moveButtons ? (
                  <span className="cui-sortable-list__moves">
                    <Button
                      ref={el => {
                        buttonRefs.current.set(`${key}:-1`, el);
                      }}
                      size="sm"
                      variant="quiet"
                      iconOnly
                      icon="arrow-up"
                      disabled={index === 0 || busy || !movable(items[index - 1] as T)}
                      onClick={() => void buttonMove(key, -1)}
                    >
                      {earlierLabel(itemLabel)}
                    </Button>
                    <Button
                      ref={el => {
                        buttonRefs.current.set(`${key}:1`, el);
                      }}
                      size="sm"
                      variant="quiet"
                      iconOnly
                      icon="arrow-down"
                      disabled={index === items.length - 1 || busy || !movable(items[index + 1] as T)}
                      onClick={() => void buttonMove(key, 1)}
                    >
                      {laterLabel(itemLabel)}
                    </Button>
                  </span>
                ) : null}
              </li>
            </React.Fragment>
          );
        })}
        {showLine && lineBefore === null ? line : null}
      </List>
      <DragPreview drag={drag}>{drag ? <div className="cui-sortable-list__preview">{renderPreview && byKey.has(drag.itemId) ? renderPreview(byKey.get(drag.itemId) as T) : labelOf(drag.itemId)}</div> : null}</DragPreview>
      <DragAnnouncer announcement={dnd.announcement} instructionsId={dnd.instructionsId} instructions={dnd.words.instructions} />
    </div>
  );
}
