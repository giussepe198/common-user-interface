import React from 'react';
import { Icon, cx } from '../../core';
import { ShellGlyph } from '../internal/shellIcons';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

/** A button inside a toast, e.g. "Undo" or "View letter". */
export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastProps {
  /** Meaning, shown by icon and words together (colour is never the only cue). Default 'info'. */
  tone?: ToastTone;
  /** Short message, e.g. "Letter sent to the GP". */
  title: React.ReactNode;
  /** Optional second line. */
  description?: React.ReactNode;
  /** One action, at most. */
  action?: ToastAction;
  /** Shows the dismiss button and runs on Esc while focus is in the toast. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  /** Words read before the title so the tone is not carried by the icon alone. Default per tone ("Error", ...). */
  toneLabel?: string;
  className?: string;
}

/** Default words for each tone, read by screen readers before the title. */
export const TOAST_TONE_LABELS: Record<ToastTone, string> = { info: 'Information', success: 'Done', warning: 'Warning', error: 'Error' };

/** One toast. Normally created through `useToast().show(...)` inside a ToastProvider; can be rendered alone in a live region. */
export function Toast({ tone = 'info', title, description, action, onDismiss, dismissLabel = 'Dismiss', toneLabel, className }: ToastProps) {
  const glyph = tone === 'success' ? <ShellGlyph name="success" size={20} /> : <Icon name={tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'info'} size={20} />;
  return (
    <div
      className={cx('cui-toast', `cui-toast--${tone}`, className)}
      onKeyDown={e => {
        if (e.key === 'Escape' && onDismiss) {
          e.stopPropagation();
          onDismiss();
        }
      }}
    >
      <span className="cui-toast__icon">{glyph}</span>
      <div className="cui-toast__text">
        <div className="cui-toast__title">
          <span className="cui-visually-hidden">{toneLabel ?? TOAST_TONE_LABELS[tone]}: </span>
          <span className="cui-toast__message">{title}</span>
        </div>
        {description ? <div className="cui-toast__description">{description}</div> : null}
      </div>
      {action ? (
        <button type="button" className="cui-toast__action" onClick={action.onAction}>
          {action.label}
        </button>
      ) : null}
      {onDismiss ? (
        <button type="button" className="cui-toast__dismiss" aria-label={dismissLabel} title={dismissLabel} onClick={onDismiss}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}

/** What `useToast().show` takes. */
export interface ToastOptions {
  tone?: ToastTone;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastAction;
  /**
   * Milliseconds before an info or success toast leaves. Default the provider's `duration`. Errors and warnings never
   * leave by themselves: the person dismisses them [suggested].
   */
  duration?: number;
  /** Replace an earlier toast with the same id instead of adding another. */
  id?: string;
}

export interface ToastApi {
  /** Show a toast; returns its id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

const ToastContext = React.createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** Name of the notifications region. Default "Notifications". */
  regionLabel?: string;
  /** Default time on screen for info and success toasts, in ms. Default 6000. */
  duration?: number;
  /** Most toasts shown at once; the oldest info or success toast leaves first. Default 4. */
  max?: number;
  /** Accessible name of each dismiss button. Default "Dismiss". */
  dismissLabel?: string;
  /** Raise the stack above a bottom bar (for example the phone tab bar), in px. Default 0. */
  bottomOffset?: 0 | 56 | 64 | 72 | 80;
}

let seq = 0;

/**
 * Holds the toast stack and its live regions: info and success are announced politely and leave after `duration`
 * (paused while the pointer or focus is on the stack); warnings and errors are announced at once and stay until
 * dismissed. Never the only place an error is reported, and nothing clinical goes only in a toast [suggested].
 */
export function ToastProvider({ children, regionLabel = 'Notifications', duration = 6000, max = 4, dismissLabel = 'Dismiss', bottomOffset = 0 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const timers = React.useRef(new Map<string, { left: number; started: number; handle?: number }>());
  const [paused, setPaused] = React.useState(false);

  const dismiss = React.useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t?.handle) window.clearTimeout(t.handle);
    timers.current.delete(id);
    setToasts(list => list.filter(x => x.id !== id));
  }, []);

  const show = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `cui-toast-${++seq}`;
      setToasts(list => {
        const next = [...list.filter(x => x.id !== id), { ...options, id }];
        while (next.length > max) {
          const i = next.findIndex(x => x.tone !== 'error' && x.tone !== 'warning');
          if (i < 0) break;
          next.splice(i, 1);
        }
        return next;
      });
      const sticky = options.tone === 'error' || options.tone === 'warning';
      const old = timers.current.get(id);
      if (old?.handle) window.clearTimeout(old.handle);
      timers.current.delete(id);
      if (!sticky) timers.current.set(id, { left: options.duration ?? duration, started: 0 });
      return id;
    },
    [duration, max],
  );

  const clear = React.useCallback(() => {
    timers.current.forEach(t => t.handle && window.clearTimeout(t.handle));
    timers.current.clear();
    setToasts([]);
  }, []);

  // Run or pause the timers.
  React.useEffect(() => {
    const map = timers.current;
    map.forEach((t, id) => {
      if (paused) {
        if (t.handle) {
          window.clearTimeout(t.handle);
          t.handle = undefined;
          t.left -= Date.now() - t.started;
        }
      } else if (!t.handle) {
        t.started = Date.now();
        t.handle = window.setTimeout(() => dismiss(id), Math.max(0, t.left));
      }
    });
  }, [toasts, paused, dismiss]);

  React.useEffect(() => () => timers.current.forEach(t => t.handle && window.clearTimeout(t.handle)), []);

  const api = React.useMemo(() => ({ show, dismiss, clear }), [show, dismiss, clear]);
  const urgent = toasts.filter(t => t.tone === 'error' || t.tone === 'warning');
  const polite = toasts.filter(t => !(t.tone === 'error' || t.tone === 'warning'));
  const render = (t: ToastEntry) => (
    <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} action={t.action} onDismiss={() => dismiss(t.id)} dismissLabel={dismissLabel} />
  );
  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        aria-label={regionLabel}
        className={cx('cui-root', 'cui-toast-region', bottomOffset ? `cui-toast-region--offset-${bottomOffset}` : null)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
      >
        <div role="alert" aria-live="assertive" className="cui-toast-region__stack">
          {urgent.map(render)}
        </div>
        <div role="status" aria-live="polite" className="cui-toast-region__stack">
          {polite.map(render)}
        </div>
      </section>
    </ToastContext.Provider>
  );
}

const missing: ToastApi = {
  show: () => {
    console.warn('useToast: no ToastProvider above this component; the toast was not shown.');
    return '';
  },
  dismiss: () => undefined,
  clear: () => undefined,
};

/** The nearest ToastProvider's API. Outside a provider, `show` warns in the console and does nothing. */
export function useToast(): ToastApi {
  return React.useContext(ToastContext) ?? missing;
}
