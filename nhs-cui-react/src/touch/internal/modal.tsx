import React from 'react';
import ReactDOM from 'react-dom';

/** Close reasons reported by sheets. */
export type SheetCloseReason = 'escape' | 'back' | 'backdrop' | 'swipe' | 'closeButton';

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Visible focusable elements inside a container, in tab order. */
export function focusableWithin(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    n => !n.hasAttribute('inert') && n.getAttribute('aria-hidden') !== 'true' && !n.closest('[inert]'),
  );
}

let openCount = 0;
let savedOverflow = '';

interface ModalOptions {
  open: boolean;
  dialogRef: React.RefObject<HTMLElement | null>;
  /** Called for Esc and the browser or Android back button. Return false when the close was refused. */
  onDismiss: (reason: SheetCloseReason) => boolean | void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Return focus to the element focused before opening. */
  returnFocus: boolean;
  /** Push a history entry while open so the back button closes the sheet instead of leaving the page. */
  closeOnBrowserBack: boolean;
  /** Lock document.body scroll while open. False when the sheet renders in place or in a host container. Default true. */
  lockScroll?: boolean;
  /** Move focus in when the sheet is already open on first render. Later opens always move focus. Default true. */
  autoFocus?: boolean;
}

/**
 * Modal behaviour shared by BottomSheet, FullScreenSheet and the hold-to-confirm dialog: focus moves in on
 * open and back on close, Tab is trapped, Esc and back request a close, and the page behind does not scroll.
 */
export function useModal({
  open,
  dialogRef,
  onDismiss,
  initialFocusRef,
  returnFocus,
  closeOnBrowserBack,
  lockScroll = true,
  autoFocus = true,
}: ModalOptions) {
  const dismissRef = React.useRef(onDismiss);
  dismissRef.current = onDismiss;
  // Open on first render with autoFocus off: leave focus where it is until the sheet has been closed once.
  const skipInitialFocus = React.useRef(open && !autoFocus);

  // Focus in, focus back.
  React.useEffect(() => {
    if (!open) {
      skipInitialFocus.current = false;
      return;
    }
    if (skipInitialFocus.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = dialogRef.current;
    if (el) {
      const target = initialFocusRef?.current ?? focusableWithin(el).find(n => !n.classList.contains('cui-sheet__close')) ?? el;
      target.focus({ preventScroll: true });
    }
    return () => {
      if (returnFocus && previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll lock (only when the sheet covers the page from document.body).
  React.useEffect(() => {
    if (!open || !lockScroll || typeof document === 'undefined') return;
    if (openCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openCount++;
    return () => {
      openCount--;
      if (openCount === 0) document.body.style.overflow = savedOverflow;
    };
  }, [open, lockScroll]);

  // Back button.
  React.useEffect(() => {
    if (!open || !closeOnBrowserBack || typeof window === 'undefined') return;
    const marker = { cuiSheet: Math.random().toString(36).slice(2) };
    let pushed = false;
    try {
      window.history.pushState({ ...(window.history.state ?? {}), ...marker }, '');
      pushed = true;
    } catch {
      pushed = false;
    }
    if (!pushed) return;
    let popped = false;
    const onPop = () => {
      if (dismissRef.current('back') === false) {
        // Refused (unsaved data): put the marker back so the next back press is caught too.
        try {
          window.history.pushState({ ...(window.history.state ?? {}), ...marker }, '');
        } catch {
          popped = true;
        }
      } else popped = true;
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      const st = window.history.state as { cuiSheet?: string } | null;
      if (!popped && st?.cuiSheet === marker.cuiSheet) {
        try {
          window.history.back();
        } catch {
          /* ignore */
        }
      }
    };
  }, [open, closeOnBrowserBack]);

  /** Keydown handler for the dialog element: Esc and Tab trapping. */
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        dismissRef.current('escape');
        return;
      }
      if (e.key !== 'Tab') return;
      const el = dialogRef.current;
      if (!el) return;
      const items = focusableWithin(el);
      if (items.length === 0) {
        e.preventDefault();
        el.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [dialogRef],
  );

  return { onKeyDown };
}

/** Render children into a `.cui-root` container on document.body (or the given container). */
export function TouchPortal({ children, container, enabled = true }: { children: React.ReactNode; container?: HTMLElement | null; enabled?: boolean }) {
  // Created during the first render so the dialog exists (and can take focus) in the first commit.
  const [own] = React.useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const div = document.createElement('div');
    div.className = 'cui-root cui-touch-portal';
    return div;
  });
  React.useLayoutEffect(() => {
    if (!enabled || container || !own) return;
    document.body.appendChild(own);
    return () => {
      own.remove();
    };
  }, [enabled, container, own]);
  if (!enabled) return <>{children}</>;
  const host = container ?? own;
  return host ? ReactDOM.createPortal(children, host) : null;
}

/** True when the user asks for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const get = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  const [reduced, setReduced] = React.useState(get);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
