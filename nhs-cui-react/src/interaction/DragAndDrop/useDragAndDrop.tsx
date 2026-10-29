import React from 'react';
import { useId } from '../../core';
import { dragAutoScrollDelta, dragKeyOf, type DragKey } from '../utils/dragDrop';

/** A point in viewport (client) coordinates. */
export interface DragPoint {
  x: number;
  y: number;
}

/** Plain words for every step of a drag (DND-0030). Override for another language or a more specific noun. */
export interface DragWords {
  /** The handle's description: how to move with the keyboard. */
  instructions: string;
  pickedUp: (item: string, at: string) => string;
  movedTo: (target: string) => string;
  cannotDrop: (reason: string) => string;
  dropped: (item: string, target: string) => string;
  cancelled: (item: string) => string;
  moving: (item: string) => string;
  refused: (item: string, reason: string) => string;
}

export const DRAG_WORDS: DragWords = {
  instructions: 'To move with the keyboard, press Space or Enter to pick up, the arrow keys to move, Space or Enter to drop, Escape to cancel.',
  pickedUp: (item, at) => `Picked up ${item}, ${at}.`,
  movedTo: target => `Moved to ${target}.`,
  cannotDrop: reason => `Cannot drop here: ${reason}`,
  dropped: (item, target) => `Dropped. ${item}, ${target}.`,
  cancelled: item => `Move cancelled. ${item} is back where it was.`,
  moving: item => `Moving ${item}.`,
  refused: (item, reason) => `${item} was not moved: ${reason}`,
};

/** What `onDrop` may give back: nothing (done), a reason the move was refused, or false (put back without words). */
export type DragDropResult = void | string | false;

export interface UseDragAndDropOptions<T> {
  /** Where the item is now. The keyboard starts here and a cancel returns here. */
  origin: (itemId: string) => T;
  /** The target under a pointer at `point` (viewport coordinates), or null where nothing can take the item. */
  targetAt: (point: DragPoint, itemId: string, grab: DragPoint) => T | null;
  /** The target one key press away from `from`, or null to stay (DND-0020). */
  step: (from: T, key: DragKey, itemId: string) => T | null;
  /** Whether two targets are the same place. Default: equal JSON. Dropping where the item started is a cancel. */
  same?: (a: T, b: T) => boolean;
  /** True, or the reason in words that the item may not go there (DND-0220). */
  canDrop?: (itemId: string, target: T) => true | string;
  /** The item in words for announcements and the handle ("Review, Mon 10:00"). */
  itemWords: (itemId: string) => string;
  /** A target in words ("position 3 of 5", "Partially completed", "Tue 31-Oct-2026 11:00 to 12:00"). */
  targetWords: (target: T, itemId: string) => string;
  /** Commit the move. May be asynchronous; nothing is final until it resolves (DND-0320). A string is a refusal. */
  onDrop: (itemId: string, target: T) => DragDropResult | Promise<DragDropResult>;
  /** The scrolling frame to auto-scroll (DND-0140). Default: the page. */
  scrollContainer?: () => HTMLElement | null;
  /** Long press before a touch drag starts (DND-0120). Default 400 ms. */
  longPressMs?: number;
  /** No drag at all (read only, DND-0410). */
  disabled?: boolean;
  /** Words for announcements. */
  words?: Partial<DragWords>;
}

/** The drag in progress. */
export interface DragState<T> {
  itemId: string;
  /** The current target, or null when the pointer is over nothing that takes the item. */
  target: T | null;
  /** True, or the reason the current target refuses the item. */
  valid: true | string;
  via: 'pointer' | 'keyboard';
  /** The pointer (pointer drags only). */
  point: DragPoint | null;
  /** Where the pointer took hold of the item, relative to the item's top left corner. */
  grab: DragPoint;
  /** The item's size when picked up (for the preview). */
  size: { width: number; height: number };
}

/** Props for the element that starts a drag: spread them on a DragHandle (or any button). */
export interface DragHandleBindings {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  onClickCapture: (e: React.MouseEvent<HTMLElement>) => void;
  onBlur: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
  'aria-describedby': string;
  'aria-pressed': boolean;
  'data-drag-handle': string;
}

export interface UseDragAndDropResult<T> {
  drag: DragState<T> | null;
  /** The item whose drop is being committed (onDrop has not resolved). */
  busyId: string | null;
  /** The last refusal, shown beside the item until the next drag. */
  refusal: { itemId: string; reason: string } | null;
  /** The latest announcement, for DragAnnouncer. */
  announcement: string;
  /** Id of the element holding the keyboard instructions (render DragAnnouncer with it). */
  instructionsId: string;
  /** Props for an item's handle. `itemId` must be unique among the items. */
  handleProps: (itemId: string) => DragHandleBindings;
  /** Say something in the live region (move buttons and menus use it). */
  announce: (text: string) => void;
  /** Stop the current drag and put the item back. */
  cancel: () => void;
  /** Run a move that did not come from a drag (move buttons, a Move menu) through the same busy and refusal handling. */
  commit: (itemId: string, target: T) => Promise<boolean>;
  words: DragWords;
}

const MOVE_THRESHOLD = 4;
const TOUCH_SLOP = 8;

function scrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  for (let n = el?.parentElement ?? null; n; n = n.parentElement) {
    const s = getComputedStyle(n);
    if (/(auto|scroll)/.test(s.overflowY + s.overflowX) && (n.scrollHeight > n.clientHeight || n.scrollWidth > n.clientWidth)) return n;
  }
  return null;
}

/**
 * The drag and drop engine (G13): pointer and touch drags with a long press, keyboard pick up and drop, plain-word
 * announcements, auto-scroll near the edge, a refusal reason from `canDrop` and an `onDrop` that may be asynchronous.
 * It holds no layout: the control says where things are through `origin`, `targetAt` and `step` and draws the
 * preview and the drop indicator from `drag`.
 */
export function useDragAndDrop<T>(options: UseDragAndDropOptions<T>): UseDragAndDropResult<T> {
  const opts = React.useRef(options);
  opts.current = options;
  const words = React.useMemo(() => ({ ...DRAG_WORDS, ...options.words }), [options.words]);
  const wordsRef = React.useRef(words);
  wordsRef.current = words;
  const instructionsId = useId('cui-drag-help');
  const [drag, setDragState] = React.useState<DragState<T> | null>(null);
  const dragRef = React.useRef<DragState<T> | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [refusal, setRefusal] = React.useState<{ itemId: string; reason: string } | null>(null);
  const [announcement, setAnnouncement] = React.useState('');
  const cleanup = React.useRef<(() => void) | null>(null);
  const swallowClick = React.useRef(false);
  const handleEl = React.useRef<HTMLElement | null>(null);

  const setDrag = (d: DragState<T> | null) => {
    dragRef.current = d;
    setDragState(d);
  };
  const announce = React.useCallback((text: string) => {
    // A trailing non-breaking space alternates so the same words are announced again.
    setAnnouncement(prev => (prev === text ? `${text}\u00a0` : text));
  }, []);
  const same = (a: T, b: T) => (opts.current.same ? opts.current.same(a, b) : JSON.stringify(a) === JSON.stringify(b));
  const validity = (itemId: string, target: T | null): true | string => {
    if (target === null) return 'nothing here takes it';
    return opts.current.canDrop ? opts.current.canDrop(itemId, target) : true;
  };

  const stopListening = () => {
    cleanup.current?.();
    cleanup.current = null;
  };
  React.useEffect(() => stopListening, []);

  const cancel = React.useCallback(() => {
    const d = dragRef.current;
    stopListening();
    if (!d) return;
    setDrag(null);
    announce(wordsRef.current.cancelled(opts.current.itemWords(d.itemId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announce]);

  const commit = React.useCallback(
    async (itemId: string, target: T): Promise<boolean> => {
      const o = opts.current;
      const w = wordsRef.current;
      const v = validity(itemId, target);
      if (v !== true) {
        setRefusal({ itemId, reason: v });
        announce(w.refused(o.itemWords(itemId), v));
        return false;
      }
      setRefusal(null);
      const out = o.onDrop(itemId, target);
      let result: DragDropResult;
      if (out && typeof (out as Promise<DragDropResult>).then === 'function') {
        setBusyId(itemId);
        announce(w.moving(o.itemWords(itemId)));
        try {
          result = await out;
        } catch (err) {
          result = err instanceof Error && err.message ? err.message : 'the change was not saved';
        } finally {
          setBusyId(null);
        }
      } else result = out as DragDropResult;
      if (typeof result === 'string') {
        setRefusal({ itemId, reason: result });
        announce(w.refused(o.itemWords(itemId), result));
        return false;
      }
      if (result === false) return false;
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [announce],
  );

  /** After a keyboard move the handle keeps focus, even when the item was redrawn in another place. */
  const refocus = (itemId: string) => {
    if (typeof document === 'undefined') return;
    requestAnimationFrame(() => {
      const key = `${instructionsId}:${itemId}`;
      const el = Array.from(document.querySelectorAll<HTMLElement>('[data-drag-handle]')).find(x => x.dataset.dragHandle === key);
      if (el && document.activeElement !== el) el.focus();
    });
  };

  const finish = (d: DragState<T>) => {
    stopListening();
    setDrag(null);
    if (d.via === 'keyboard') refocus(d.itemId);
    const o = opts.current;
    const w = wordsRef.current;
    if (d.target === null || same(d.target, o.origin(d.itemId))) {
      announce(w.cancelled(o.itemWords(d.itemId)));
      return;
    }
    if (d.valid !== true) {
      setRefusal({ itemId: d.itemId, reason: d.valid });
      announce(`${w.cannotDrop(d.valid)} ${w.cancelled(o.itemWords(d.itemId))}`);
      return;
    }
    const where = o.targetWords(d.target, d.itemId);
    const item = o.itemWords(d.itemId);
    void commit(d.itemId, d.target).then(ok => {
      if (ok) announce(w.dropped(item, where));
      if (d.via === 'keyboard') refocus(d.itemId);
    });
  };

  const update = (d: DragState<T>, target: T | null, point: DragPoint | null) => {
    const changed = d.target === null ? target !== null : target === null || !same(d.target, target);
    const next: DragState<T> = { ...d, target, point, valid: validity(d.itemId, target) };
    setDrag(next);
    if (changed && target !== null) {
      const w = wordsRef.current;
      const words = w.movedTo(opts.current.targetWords(target, d.itemId));
      announce(next.valid === true ? words : `${words} ${w.cannotDrop(next.valid)}`);
    }
  };

  const begin = (itemId: string, via: 'pointer' | 'keyboard', el: HTMLElement | null, point: DragPoint | null) => {
    const o = opts.current;
    const item = (el?.closest('[data-drag-item]') as HTMLElement | null) ?? el;
    const rect = item?.getBoundingClientRect();
    const grab = point && rect ? { x: point.x - rect.left, y: point.y - rect.top } : { x: 0, y: 0 };
    const origin = o.origin(itemId);
    const d: DragState<T> = { itemId, target: origin, valid: true, via, point, grab, size: { width: rect?.width ?? 0, height: rect?.height ?? 0 } };
    setRefusal(null);
    setDrag(d);
    announce(wordsRef.current.pickedUp(o.itemWords(itemId), o.targetWords(origin, itemId)));
    return d;
  };

  const onPointerDown = (itemId: string) => (e: React.PointerEvent<HTMLElement>) => {
    if (opts.current.disabled || busyId || e.button !== 0 || dragRef.current) return;
    const el = e.currentTarget;
    handleEl.current = el;
    const start = { x: e.clientX, y: e.clientY };
    const touch = e.pointerType === 'touch';
    const pointerId = e.pointerId;
    let active = false;
    let last = start;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let raf = 0;
    const frame = () => (opts.current.scrollContainer?.() ?? scrollableAncestor(el));
    const activate = () => {
      active = true;
      swallowClick.current = true;
      try {
        el.setPointerCapture?.(pointerId);
      } catch {
        /* the pointer may already be gone */
      }
      begin(itemId, 'pointer', el, last);
      const tick = () => {
        const d = dragRef.current;
        if (!d || d.via !== 'pointer') return;
        const f = frame();
        const r = f ? f.getBoundingClientRect() : { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };
        const dy = dragAutoScrollDelta(last.y, r.top, r.bottom);
        const dx = dragAutoScrollDelta(last.x, r.left, r.right);
        if (dx || dy) {
          const scroller = f ?? (document.scrollingElement as HTMLElement | null);
          if (scroller && typeof scroller.scrollBy === 'function') scroller.scrollBy(dx, dy);
          update(d, opts.current.targetAt(last, itemId, d.grab), last);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      last = { x: ev.clientX, y: ev.clientY };
      const dist = Math.hypot(last.x - start.x, last.y - start.y);
      if (!active) {
        if (touch) {
          // Moving before the long press ends is a scroll, not a drag (DND-0120).
          if (dist > TOUCH_SLOP) end();
          return;
        }
        if (dist < MOVE_THRESHOLD) return;
        activate();
      }
      const d = dragRef.current;
      if (d) update(d, opts.current.targetAt(last, itemId, d.grab), last);
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const d = dragRef.current;
      end();
      if (active && d) finish(d);
    };
    const cancelled = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const was = active;
      end();
      if (was) cancel();
    };
    const blockScroll = (ev: TouchEvent) => {
      if (active) ev.preventDefault();
    };
    const key = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && active) {
        ev.preventDefault();
        end();
        cancel();
      }
    };
    function end() {
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancelled);
      window.removeEventListener('touchmove', blockScroll);
      window.removeEventListener('keydown', key, true);
      cleanup.current = null;
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancelled);
    window.addEventListener('touchmove', blockScroll, { passive: false });
    window.addEventListener('keydown', key, true);
    cleanup.current = end;
    if (touch) timer = setTimeout(activate, opts.current.longPressMs ?? 400);
  };

  const onKeyDown = (itemId: string) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (opts.current.disabled) return;
    const d = dragRef.current;
    const carrying = d && d.itemId === itemId && d.via === 'keyboard';
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (busyId) return;
      if (carrying) finish(d);
      else if (!d) begin(itemId, 'keyboard', e.currentTarget, null);
      return;
    }
    if (!carrying) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === 'Tab') {
      cancel();
      return;
    }
    const k = dragKeyOf(e.key);
    if (!k) return;
    e.preventDefault();
    const from = d.target ?? opts.current.origin(itemId);
    const next = opts.current.step(from, k, itemId);
    if (next !== null) update(d, next, null);
  };

  const handleProps = (itemId: string): DragHandleBindings => ({
    onPointerDown: onPointerDown(itemId),
    onKeyDown: onKeyDown(itemId),
    onClickCapture: e => {
      // The click that ends a pointer drag is not a click on the handle.
      if (swallowClick.current) {
        swallowClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }
    },
    onBlur: () => {
      const d = dragRef.current;
      if (d && d.itemId === itemId && d.via === 'keyboard') cancel();
    },
    onContextMenu: e => {
      // A long press on touch opens no context menu over the handle.
      if (dragRef.current || cleanup.current) e.preventDefault();
    },
    'aria-describedby': instructionsId,
    'aria-pressed': !!drag && drag.itemId === itemId,
    'data-drag-handle': `${instructionsId}:${itemId}`,
  });

  return { drag, busyId, refusal, announcement, instructionsId, handleProps, announce, cancel, commit, words };
}
