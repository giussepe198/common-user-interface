import { useCallback, useId as useReactId, useLayoutEffect, useRef, useState } from 'react';

/** Stable id, optionally overridden by a caller-supplied id. */
export function useId(prefix: string, override?: string): string {
  const id = useReactId().replace(/:/g, '');
  return override ?? `${prefix}-${id}`;
}

/** Controlled/uncontrolled value helper. */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : inner;
  const cb = useRef(onChange);
  cb.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInner(next);
      cb.current?.(next);
    },
    [isControlled],
  );
  return [current, set];
}

/**
 * Keeps an open popover (a menu, a note, an anchored toast) inside the viewport sideways: after each render
 * while `active`, it measures the element and shifts it left by as much as it overflows the right edge, never past
 * the left gutter. Only computed geometry goes inline (a negative left margin, which unlike a transform also takes it
 * out of the page's scrollable width), so stylesheets still place it.
 */
export function useKeepInView(ref: { current: HTMLElement | null }, active: boolean, gutter = 8): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    el.style.marginLeft = '';
    const r = el.getBoundingClientRect();
    const over = r.right - (document.documentElement.clientWidth - gutter);
    if (over > 0) el.style.marginLeft = `${-Math.min(over, Math.max(0, r.left - gutter))}px`;
  });
}
