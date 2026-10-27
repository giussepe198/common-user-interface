import React from 'react';
import { cx } from '../../core';

/** Internal: modal dialog frame with backdrop, focus trap, Escape handling and focus return. */
export function ModalFrame(props: {
  labelledBy: string;
  describedBy?: string;
  role?: 'dialog' | 'alertdialog';
  /** Called on Escape. Omit to ignore Escape. */
  onEscape?: () => void;
  /** Selector of the element to focus first (inside the dialog). Default: first focusable. */
  initialFocus?: string;
  /** Render in place without backdrop or fixed positioning (for previews or a host's own dialog). */
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { labelledBy, describedBy, role = 'dialog', onEscape, initialFocus, inline, className, children } = props;
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const target = (initialFocus ? el?.querySelector<HTMLElement>(initialFocus) : null) ?? focusables(el)[0] ?? el;
    target?.focus();
    return () => {
      if (previous && document.contains(previous)) previous.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={cx('cui-noting-modal', inline && 'cui-noting-modal--inline')}>
      {inline ? null : <div className="cui-noting-modal__backdrop" aria-hidden="true" />}
      <div
        ref={ref}
        role={role}
        aria-modal={inline ? undefined : true}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cx('cui-noting-modal__dialog', className)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && onEscape) {
            e.preventDefault();
            e.stopPropagation();
            onEscape();
          } else if (e.key === 'Tab') {
            const f = focusables(ref.current);
            if (!f.length) return;
            const first = f[0];
            const last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

function focusables(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]')).filter((e) => !e.hasAttribute('hidden'));
}

/** Internal: close a popover when the pointer goes down outside it. */
export function useClickAway(ref: React.RefObject<HTMLElement>, active: boolean, onAway: () => void) {
  const cb = React.useRef(onAway);
  cb.current = onAway;
  React.useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, active]);
}
