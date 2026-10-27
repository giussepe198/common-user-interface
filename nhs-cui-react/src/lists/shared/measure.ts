import React from 'react';

let ctx: CanvasRenderingContext2D | null | undefined;
/** Measure text width in px for the given font. Falls back to an estimate when canvas is unavailable. */
export function listMeasureText(text: string, font = '12px "Segoe UI", "Helvetica Neue", Arial, sans-serif'): number {
  if (ctx === undefined) {
    try {
      // jsdom (tests) has no canvas: fall back to the estimate without its "not implemented" error.
      const jsdom = typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent);
      ctx = typeof document !== 'undefined' && !jsdom ? document.createElement('canvas').getContext('2d') : null;
    } catch {
      ctx = null;
    }
  }
  if (!ctx) return text.length * 6.6;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/** Track an element's content width with ResizeObserver. */
export function useElementWidth<T extends HTMLElement>(fallback: number): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // Content width: clientWidth includes padding, which the content must not draw into.
      const cs = typeof getComputedStyle === 'function' ? getComputedStyle(el) : null;
      const pad = cs ? (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) : 0;
      setW(el.clientWidth ? Math.max(0, el.clientWidth - pad) : fallback);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w];
}
