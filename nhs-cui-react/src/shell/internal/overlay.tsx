import React from 'react';
import ReactDOM from 'react-dom';

/** Why an overlay asked to close. */
export type ShellCloseReason = 'escape' | 'closeButton' | 'backdrop' | 'back' | 'swipe';

interface OverlayEntry {
  close: (reason: ShellCloseReason) => void;
}

const stack: OverlayEntry[] = [];
const subscribers = new Set<() => void>();
let guardInstalled = false;

function notify() {
  subscribers.forEach(fn => fn());
}

/** Inside an open modal surface (ours, a touch sheet, or any aria-modal element), keys are handled by that surface. */
function insideModal(target: EventTarget | null): boolean {
  const el = target as Element | null;
  return !!(el && typeof el.closest === 'function' && el.closest('[aria-modal="true"], [data-cui-overlay]'));
}

/**
 * Document capture listener installed while a shell overlay is open: a key pressed outside every modal surface (focus
 * left on the body, for example) never reaches the page behind or a document-level shortcut listener. Esc still
 * closes the top overlay.
 */
function guard(e: KeyboardEvent) {
  if (!stack.length || insideModal(e.target)) return;
  e.stopPropagation();
  if (e.key === 'Escape') {
    e.preventDefault();
    stack[stack.length - 1].close('escape');
  }
}

function setGuard(on: boolean) {
  if (typeof document === 'undefined' || on === guardInstalled) return;
  if (on) document.addEventListener('keydown', guard, true);
  else document.removeEventListener('keydown', guard, true);
  guardInstalled = on;
}

/** Register an open overlay; returns the function that unregisters it. */
export function registerShellOverlay(entry: OverlayEntry): () => void {
  stack.push(entry);
  setGuard(true);
  notify();
  return () => {
    const i = stack.indexOf(entry);
    if (i >= 0) stack.splice(i, 1);
    if (!stack.length) setGuard(false);
    notify();
  };
}

/** True while any shell Dialog or Drawer is open. Use it in your own document-level key handlers. */
export function isShellOverlayOpen(): boolean {
  return stack.length > 0;
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

/** React hook form of isShellOverlayOpen: re-renders when a shell Dialog or Drawer opens or closes. */
export function useShellOverlayOpen(): boolean {
  return React.useSyncExternalStore(subscribe, isShellOverlayOpen, () => false);
}

/** Keep the overlay registered while `open`. */
export function useOverlayRegistration(open: boolean, close: (reason: ShellCloseReason) => void) {
  const ref = React.useRef(close);
  ref.current = close;
  React.useEffect(() => {
    if (!open) return;
    return registerShellOverlay({ close: r => ref.current(r) });
  }, [open]);
}

/**
 * Wraps an overlay. React key events bubble through portals to this element, and stopping them here stops the
 * native event at the React root, so document listeners (ShortcutProvider, app shortcut hooks) never see a key that
 * was pressed inside the overlay. Handlers inside the overlay run first.
 */
export function OverlayScope({ children }: { children: React.ReactNode }) {
  return (
    <div className="cui-overlay-scope" onKeyDown={e => e.stopPropagation()}>
      {children}
    </div>
  );
}

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Focusable elements inside a container, in DOM order. */
export function shellFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    n => !n.closest('[inert]') && n.getAttribute('aria-hidden') !== 'true' && !n.closest('[hidden]'),
  );
}

let lockCount = 0;
let savedOverflow = '';

interface ModalOptions {
  open: boolean;
  ref: React.RefObject<HTMLElement | null>;
  onEscape: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocus: boolean;
  autoFocus: boolean;
  lockScroll: boolean;
}

/** Focus in on open and back on close, Tab trapped, Esc requests a close, page scroll locked. */
export function useShellModal({ open, ref, onEscape, initialFocusRef, returnFocus, autoFocus, lockScroll }: ModalOptions) {
  const escRef = React.useRef(onEscape);
  escRef.current = onEscape;
  const skipFirst = React.useRef(open && !autoFocus);

  React.useEffect(() => {
    if (!open) {
      skipFirst.current = false;
      return;
    }
    if (skipFirst.current) return;
    const previous = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
    const el = ref.current;
    if (el) {
      const target = initialFocusRef?.current ?? shellFocusable(el).find(n => !n.hasAttribute('data-cui-close')) ?? el;
      target.focus({ preventScroll: true });
    }
    return () => {
      if (returnFocus && previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    if (!open || !lockScroll || typeof document === 'undefined') return;
    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
    return () => {
      lockCount--;
      if (lockCount === 0) document.body.style.overflow = savedOverflow;
    };
  }, [open, lockScroll]);

  return React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        escRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const el = ref.current;
      if (!el) return;
      const items = shellFocusable(el);
      if (!items.length) {
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
    [ref],
  );
}

/** Render into a `.cui-root` element on document.body, or into `container`, or in place when disabled. */
export function ShellPortal({ children, container, enabled = true }: { children: React.ReactNode; container?: HTMLElement | null; enabled?: boolean }) {
  const [own] = React.useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const div = document.createElement('div');
    div.className = 'cui-root cui-shell-portal';
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

/** True when the media query matches (false on the server and where matchMedia is missing). */
export function useShellMediaQuery(query: string): boolean {
  const sub = React.useCallback(
    (fn: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => undefined;
      const mq = window.matchMedia(query);
      mq.addEventListener?.('change', fn);
      return () => mq.removeEventListener?.('change', fn);
    },
    [query],
  );
  const get = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
  return React.useSyncExternalStore(sub, get, () => false);
}

/**
 * Content that keeps its state when its frame changes: a drawer or dialog that becomes a bottom sheet below the phone
 * breakpoint (a window resized, a tablet turned, a page zoomed) renders a different frame, and content rendered inside
 * each frame would be mounted afresh, losing what the person had typed. The content is rendered once, at a fixed place
 * in the React tree, into its own element, and `slot` is placed in whichever frame shows; the element moves, the
 * content does not remount. `portal` must be rendered after the frame (so the slot is in place before the content's
 * effects run).
 */
export function useStableContent(children: React.ReactNode): { portal: React.ReactNode; slot: React.ReactNode } {
  const [el] = React.useState<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const div = document.createElement('div');
    div.className = 'cui-overlay-content';
    return div;
  });
  if (!el) return { portal: null, slot: children };
  return { portal: ReactDOM.createPortal(children, el), slot: <ContentSlot el={el} /> };
}

function ContentSlot({ el }: { el: HTMLElement }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.appendChild(el);
    return () => {
      if (el.parentNode === host) host.removeChild(el);
    };
  }, [el]);
  return <div ref={ref} className="cui-overlay-content-slot" />;
}
