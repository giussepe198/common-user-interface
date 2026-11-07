import React from 'react';
import { Icon, cx } from '../../core';
import type { DragHandleBindings, DragState } from './useDragAndDrop';

export interface DragHandleProps {
  /** The bindings from `useDragAndDrop().handleProps(itemId)`. */
  bindings: DragHandleBindings;
  /** Accessible name: what pressing it picks up ("Move Review, Mon 10:00"). DND-0040. */
  label: string;
  /** While the item's move is being saved: the handle is inert. */
  busy?: boolean;
  className?: string;
}

/**
 * The grip a person takes hold of (G13 DND-0040, DND-0130): a real button, named for what it moves, described by the
 * keyboard instructions, 44 px on a coarse pointer. It takes no part in layout beyond its own box.
 */
export function DragHandle({ bindings, label, busy, className }: DragHandleProps) {
  return (
    <button
      type="button"
      className={cx('cui-drag-handle', bindings['aria-pressed'] && 'cui-drag-handle--active', className)}
      aria-label={label}
      title={label}
      aria-disabled={busy || undefined}
      {...bindings}
    >
      <svg viewBox="0 0 12 16" width="10" height="14" aria-hidden="true" focusable="false">
        <path d="M3 3h1M8 3h1M3 8h1M8 8h1M3 13h1M8 13h1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export interface DragAnnouncerProps {
  /** `useDragAndDrop().announcement`. */
  announcement: string;
  /** `useDragAndDrop().instructionsId`: the handles' description points here. */
  instructionsId: string;
  /** The keyboard instructions (DND-0020), `useDragAndDrop().words.instructions`. */
  instructions: string;
}

/** The polite live region and the hidden keyboard instructions every drag control renders once (DND-0030). */
export function DragAnnouncer({ announcement, instructionsId, instructions }: DragAnnouncerProps) {
  return (
    <>
      <span id={instructionsId} className="cui-visually-hidden">
        {instructions}
      </span>
      <span className="cui-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  );
}

export interface DragPreviewProps<T> {
  /** `useDragAndDrop().drag`. Shown only for pointer drags; a keyboard move shows the drop indicator instead. */
  drag: DragState<T> | null;
  /** What the preview shows: the item's own fields and no more (DND-0230, privacy). */
  children: React.ReactNode;
  className?: string;
}

/**
 * The lifted copy that follows the pointer. Position fixed in the viewport: render it outside any size container
 * (CONVENTIONS "Containers and fixed layers"). It is hidden from assistive technology: the live region speaks.
 */
export function DragPreview<T>({ drag, children, className }: DragPreviewProps<T>) {
  if (!drag || drag.via !== 'pointer' || !drag.point) return null;
  const x = drag.point.x - drag.grab.x;
  const y = drag.point.y - drag.grab.y;
  return (
    <div
      className={cx('cui-drag-preview', drag.valid !== true && 'cui-drag-preview--refused', className)}
      aria-hidden="true"
      style={{ transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`, width: drag.size.width || undefined }}
    >
      {children}
      {drag.valid !== true && drag.target !== null ? (
        <span className="cui-drag-preview__refusal">
          <Icon name="error" /> Cannot drop here
        </span>
      ) : null}
    </div>
  );
}

export interface DropRefusalProps {
  /** Why the last move was refused, from `useDragAndDrop().refusal`. */
  reason: string;
  className?: string;
}

/** The reason a move was refused, in words beside the item (DND-0220, DND-0320). */
export function DropRefusal({ reason, className }: DropRefusalProps) {
  return (
    <p className={cx('cui-drop-refusal', className)}>
      <Icon name="error" /> Not moved: {reason}
    </p>
  );
}
