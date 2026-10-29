import React from 'react';
import { Icon, VisuallyHidden, cx, useId } from '../../core';
import { MenuButton, type MenuButtonEntry } from '../../shell';
import { DragAnnouncer, DragHandle, DragPreview, DropRefusal } from '../DragAndDrop/DragAndDrop';
import { useDragAndDrop, type DragDropResult, type DragWords } from '../DragAndDrop/useDragAndDrop';
import { dragCountWords, dragInsertionIndex, dragPositionWords } from '../utils/dragDrop';
import { useInteractionWidth } from '../internal/useInteractionWidth';

/** A column of the board: a state the items can be in. */
export interface BoardColumn {
  id: string;
  /** Heading, a state in words ("Not started", "Partially completed", "Done"). */
  title: string;
  /** A short line under the heading. */
  description?: string;
  /** Most items the column takes; a full column refuses more in words [suggested]. */
  limit?: number;
  /** Words when the column is empty. Default "No <items>". */
  emptyText?: string;
}

/** One move, as `onMove` receives it. */
export interface BoardMove {
  key: string;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  toIndex: number;
}

export interface BoardProps<T> {
  /** Accessible name of the board ("Tasks by status"). */
  label: string;
  columns: readonly BoardColumn[];
  /** Every item, in display order; each column shows its own in this order. */
  items: readonly T[];
  getKey: (item: T) => string;
  /** The item in a few words for the handle, the Move menu and announcements. DND-0040. */
  getLabel: (item: T) => string;
  /** The column the item is in now. */
  getColumn: (item: T) => string;
  /** The card's content. The handle and the Move menu are drawn around it. */
  renderCard: (item: T, state: { dragging: boolean }) => React.ReactNode;
  /** What the lifted copy shows. Default: the label. Never more than the card shows (DND-0230). */
  renderPreview?: (item: T) => React.ReactNode;
  /** Whether this user may move this item. False: no handle and no Move menu on it (DND-0410). */
  canMove?: (item: T) => boolean;
  /** True, or the reason in words the item may not go to `toColumn` (DND-0220, DND-0340): only legal transitions. */
  canDrop?: (item: T, toColumn: string, fromColumn: string) => true | string;
  /** Commit a move. May return a Promise; a string is a refusal; false puts the card back quietly (DND-0320). */
  onMove?: (item: T, move: BoardMove) => DragDropResult | Promise<DragDropResult>;
  /** Allow putting cards in order inside a column. Default false: a column keeps the order it is given. */
  reorderWithinColumn?: boolean;
  /** Noun for counts. Default item and items. */
  itemNoun?: { one: string; other: string };
  /** Heading level of the column titles. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Read only: no handles and no Move menus (DND-0410). */
  disabled?: boolean;
  /** Below this width (px) the columns stack, collapse and moves go through the Move menu only. Default 600. */
  narrowBelow?: number;
  /** Override the drag announcements. */
  words?: Partial<DragWords>;
  className?: string;
  id?: string;
}

interface Spot {
  column: string;
  index: number;
}

/**
 * Kanban columns (G13): cards move between columns (and, if allowed, within one) by dragging the handle, by the
 * keyboard on the handle (Left and Right change column, Up and Down change place, Space or Enter drops, Escape
 * cancels) or by the Move menu on every card. A column that would refuse the card says why in words while it is
 * carried. Counts are in words; a column limit refuses more. On a narrow screen the columns stack and collapse and
 * the Move menu is the way to move.
 */
export function Board<T>({
  label,
  columns,
  items,
  getKey,
  getLabel,
  getColumn,
  renderCard,
  renderPreview,
  canMove,
  canDrop,
  onMove,
  reorderWithinColumn = false,
  itemNoun = { one: 'item', other: 'items' },
  headingLevel = 3,
  disabled = false,
  narrowBelow = 600,
  words,
  className,
  id,
}: BoardProps<T>) {
  const uid = useId('cui-board', id);
  const [frameRef, width] = useInteractionWidth<HTMLDivElement>(1000);
  const narrow = width < narrowBelow;
  const byKey = new Map(items.map(i => [getKey(i), i] as const));
  const keysIn = (col: string) => items.filter(i => getColumn(i) === col).map(getKey);
  const colOf = (k: string) => {
    const it = byKey.get(k);
    return it === undefined ? '' : getColumn(it);
  };
  const title = (col: string) => columns.find(c => c.id === col)?.title ?? col;
  const movable = (item: T) => !disabled && !!onMove && (canMove ? canMove(item) : true);
  const labelOf = (k: string) => {
    const it = byKey.get(k);
    return it === undefined ? k : getLabel(it);
  };
  const columnRefs = React.useRef(new Map<string, HTMLElement | null>());

  // Collapsed columns on a narrow screen: all but the first start collapsed; the user opens what they need.
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const wasNarrow = React.useRef(false);
  React.useEffect(() => {
    if (narrow && !wasNarrow.current) setCollapsed(new Set(columns.slice(1).map(c => c.id)));
    if (!narrow && wasNarrow.current) setCollapsed(new Set());
    wasNarrow.current = narrow;
  }, [narrow, columns]);

  const rule = (k: string, to: Spot): true | string => {
    const item = byKey.get(k);
    if (item === undefined) return 'it is no longer on the board';
    const from = getColumn(item);
    if (to.column === from) return true;
    const col = columns.find(c => c.id === to.column);
    const count = keysIn(to.column).length;
    if (col?.limit !== undefined && count >= col.limit) return `${col.title} is full (${count} of ${col.limit})`;
    return canDrop ? canDrop(item, to.column, from) : true;
  };
  const endOf = (col: string, k: string) => keysIn(col).filter(x => x !== k).length;

  const dnd = useDragAndDrop<Spot>({
    origin: k => ({ column: colOf(k), index: keysIn(colOf(k)).indexOf(k) }),
    targetAt: (p, k) => {
      for (const c of columns) {
        const el = columnRefs.current.get(c.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (p.x < r.left || p.x > r.right || p.y < r.top || p.y > r.bottom) continue;
        const home = colOf(k) === c.id;
        if (!reorderWithinColumn || collapsed.has(c.id)) return { column: c.id, index: home ? keysIn(c.id).indexOf(k) : endOf(c.id, k) };
        const spans: Array<{ start: number; size: number }> = [];
        for (const li of Array.from(el.querySelectorAll<HTMLElement>('[data-drag-item]'))) {
          if (li.dataset.dragItem === k) continue;
          const b = li.getBoundingClientRect();
          spans.push({ start: b.top, size: b.height });
        }
        return { column: c.id, index: dragInsertionIndex(p.y, spans) };
      }
      return null;
    },
    step: (from, key, k) => {
      const ci = columns.findIndex(c => c.id === from.column);
      const home = colOf(k);
      if (key === 'left' || key === 'right') {
        const next = columns[ci + (key === 'left' ? -1 : 1)];
        if (!next) return null;
        if (next.id === home) return { column: home, index: keysIn(home).indexOf(k) };
        return { column: next.id, index: reorderWithinColumn ? Math.min(from.index, endOf(next.id, k)) : endOf(next.id, k) };
      }
      if (!reorderWithinColumn) return null;
      const last = from.column === home ? keysIn(home).length - 1 : endOf(from.column, k);
      if (key === 'up') return { ...from, index: Math.max(0, from.index - 1) };
      if (key === 'down') return { ...from, index: Math.min(last, from.index + 1) };
      if (key === 'home') return { ...from, index: 0 };
      if (key === 'end') return { ...from, index: last };
      return null;
    },
    canDrop: rule,
    itemWords: labelOf,
    targetWords: (t, k) => {
      if (!reorderWithinColumn) return title(t.column);
      const n = t.column === colOf(k) ? keysIn(t.column).length : endOf(t.column, k) + 1;
      return `${title(t.column)}, ${dragPositionWords(t.index, n)}`;
    },
    onDrop: (k, to) => {
      const item = byKey.get(k);
      if (item === undefined || !onMove) return false;
      const fromColumn = getColumn(item);
      return onMove(item, { key: k, fromColumn, toColumn: to.column, fromIndex: keysIn(fromColumn).indexOf(k), toIndex: to.index });
    },
    disabled: disabled || !onMove,
    words,
  });

  const drag = dnd.drag;
  const Heading = `h${headingLevel}` as 'h3';

  const menuFor = (item: T, k: string): MenuButtonEntry[] => {
    const home = getColumn(item);
    const entries: MenuButtonEntry[] = columns
      .filter(c => c.id !== home)
      .map(c => {
        const ok = rule(k, { column: c.id, index: endOf(c.id, k) });
        return {
          id: `to-${c.id}`,
          label: `Move to ${c.title}`,
          disabled: ok !== true,
          ...(ok !== true ? { description: ok } : {}),
          onSelect: () => {
            void dnd.commit(k, { column: c.id, index: endOf(c.id, k) }).then(done => {
              if (done) dnd.announce(`${labelOf(k)} moved to ${c.title}.`);
            });
          },
        };
      });
    if (reorderWithinColumn) {
      const at = keysIn(home).indexOf(k);
      const n = keysIn(home).length;
      entries.push({ id: 'sep', separator: true });
      entries.push({ id: 'up', label: 'Move up', disabled: at === 0, onSelect: () => void dnd.commit(k, { column: home, index: at - 1 }) });
      entries.push({ id: 'down', label: 'Move down', disabled: at === n - 1, onSelect: () => void dnd.commit(k, { column: home, index: at + 1 }) });
    }
    return entries;
  };

  return (
    <div className={cx('cui-board', narrow && 'cui-board--narrow', className)} id={uid}>
      <div className="cui-board__frame" ref={frameRef} role="group" aria-label={label}>
        {columns.map(col => {
          const keys = keysIn(col.id);
          const headingId = `${uid}-${col.id}`;
          const isCollapsed = narrow && collapsed.has(col.id);
          const count = dragCountWords(keys.length, itemNoun);
          const limitWords = col.limit !== undefined ? (keys.length >= col.limit ? `, full (limit ${col.limit})` : `, limit ${col.limit}`) : '';
          const carried = drag ? byKey.get(drag.itemId) : undefined;
          const homeCol = carried !== undefined ? getColumn(carried) : null;
          const verdict = drag && homeCol !== col.id ? rule(drag.itemId, { column: col.id, index: endOf(col.id, drag.itemId) }) : true;
          const isTarget = !!drag && drag.target?.column === col.id;
          const showLine = isTarget && reorderWithinColumn && !isCollapsed && drag.valid === true;
          const others = drag ? keys.filter(k => k !== drag.itemId) : keys;
          const lineBefore = showLine && drag.target ? (others[drag.target.index] ?? null) : null;
          const lineEl = (
            <li className="cui-board__line" aria-hidden="true" key="cui-board-line">
              <span className="cui-drop-label">Drop here</span>
            </li>
          );
          return (
            <section
              key={col.id}
              ref={el => {
                columnRefs.current.set(col.id, el);
              }}
              className={cx(
                'cui-board__column',
                drag && 'cui-board__column--dragging',
                drag && verdict !== true && 'cui-board__column--refuses',
                isTarget && 'cui-board__column--target',
                isTarget && drag.valid !== true && 'cui-board__column--refused',
                isCollapsed && 'cui-board__column--collapsed',
              )}
              aria-labelledby={headingId}
            >
              <header className="cui-board__head">
                <Heading className="cui-board__title" id={headingId}>
                  {narrow ? (
                    <button
                      type="button"
                      className="cui-board__toggle"
                      aria-expanded={!isCollapsed}
                      onClick={() =>
                        setCollapsed(s => {
                          const n = new Set(s);
                          if (n.has(col.id)) n.delete(col.id);
                          else n.add(col.id);
                          return n;
                        })
                      }
                    >
                      <Icon name={isCollapsed ? 'chevron-right' : 'chevron-down'} />
                      {col.title}
                    </button>
                  ) : (
                    col.title
                  )}
                </Heading>
                <span className="cui-board__count">
                  {count}
                  {limitWords}
                </span>
              </header>
              {col.description ? <p className="cui-board__description">{col.description}</p> : null}
              {drag && homeCol !== col.id ? (
                <p className={cx('cui-board__drop', verdict !== true && 'cui-board__drop--refused')} aria-hidden="true">
                  {verdict === true ? (
                    <span className="cui-drop-label">{isTarget ? `Drop in ${col.title}` : `Can drop in ${col.title}`}</span>
                  ) : (
                    <span className="cui-drop-label cui-drop-label--refused">
                      <Icon name="error" /> Cannot drop here: {verdict}
                    </span>
                  )}
                </p>
              ) : null}
              {isCollapsed ? null : keys.length ? (
                <ul className="cui-board__cards" aria-label={`${col.title}, ${count}`}>
                  {keys.map(k => {
                    const item = byKey.get(k) as T;
                    const can = movable(item);
                    const isDragged = drag?.itemId === k;
                    const busy = dnd.busyId === k;
                    const itemLabel = getLabel(item);
                    return (
                      <React.Fragment key={k}>
                        {lineBefore === k ? lineEl : null}
                        <li data-drag-item={k} className={cx('cui-board__card', isDragged && 'cui-board__card--lifted', busy && 'cui-board__card--busy')} aria-busy={busy || undefined}>
                          {can && !narrow ? <DragHandle bindings={dnd.handleProps(k)} label={`Move ${itemLabel}`} busy={busy} /> : null}
                          <div className="cui-board__content">
                            {renderCard(item, { dragging: isDragged })}
                            {busy ? <span className="cui-board__status">Moving</span> : null}
                            {dnd.refusal?.itemId === k ? <DropRefusal reason={dnd.refusal.reason} /> : null}
                          </div>
                          {can ? (
                            <MenuButton
                              className="cui-board__menu"
                              size="sm"
                              variant="quiet"
                              align="end"
                              disabled={busy}
                              label={
                                <>
                                  Move
                                  <VisuallyHidden>{` ${itemLabel}`}</VisuallyHidden>
                                </>
                              }
                              items={menuFor(item, k)}
                            />
                          ) : null}
                        </li>
                      </React.Fragment>
                    );
                  })}
                  {showLine && lineBefore === null ? lineEl : null}
                </ul>
              ) : (
                <p className="cui-board__empty">{col.emptyText ?? `No ${itemNoun.other}`}</p>
              )}
            </section>
          );
        })}
      </div>
      <DragPreview drag={drag}>{drag ? <div className="cui-board__preview">{renderPreview && byKey.has(drag.itemId) ? renderPreview(byKey.get(drag.itemId) as T) : labelOf(drag.itemId)}</div> : null}</DragPreview>
      <DragAnnouncer announcement={dnd.announcement} instructionsId={dnd.instructionsId} instructions={dnd.words.instructions} />
    </div>
  );
}
