import React from 'react';

/**
 * An element's content width, tracked with ResizeObserver: the drag controls switch their narrow layout from it
 * (the lists area has its own copy; areas do not share internals, CONVENTIONS).
 */
export function useInteractionWidth<T extends HTMLElement>(fallback: number): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth || fallback);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  // Typed as RefObject<T> so the ref fits a host element on React 18 and 19 types alike.
  return [ref as React.RefObject<T>, w];
}

/** True on a coarse pointer (touch): time grids make room for 44 px targets (DND-0130). */
export function useCoarsePointer(): boolean {
  const query = '(pointer: coarse)';
  const [coarse, setCoarse] = React.useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const m = window.matchMedia(query);
    const on = () => setCoarse(m.matches);
    on();
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return coarse;
}
