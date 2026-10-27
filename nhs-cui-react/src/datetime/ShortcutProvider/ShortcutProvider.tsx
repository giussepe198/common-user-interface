import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cx, Icon } from '../../core';
import {
  ShortcutConflict,
  ShortcutDefinition,
  detectShortcutConflicts,
  normaliseKeyEvent,
  normaliseKeys,
} from '../utils/shortcuts';

export interface ShortcutBinding extends ShortcutDefinition {
  /** Runs when the keys are pressed in an active context. */
  handler?: (event: KeyboardEvent) => void;
  /** False when the function is unavailable here: pressing the keys gives feedback instead of silence (keyshorts construction). */
  enabled?: boolean;
  /** For deprecated shortcuts: the keys to use instead. */
  replacement?: string;
  /** Also fire while typing in a text field. Default: only for Ctrl/Alt combinations, function keys and Esc. */
  allowInInputs?: boolean;
  /** Longer description for the shortcut list. */
  description?: string;
}

export interface RegisteredShortcut extends ShortcutBinding {
  id: string;
  /** Normalised keys. */
  keys: string;
  /** Not bound because of an error-level conflict (reserved keys, unsafe placement). */
  refused: boolean;
}

interface ShortcutContextValue {
  register: (id: string, binding: () => ShortcutBinding, meta: ShortcutBinding) => () => void;
  shortcuts: RegisteredShortcut[];
  conflicts: ShortcutConflict[];
}

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

export interface ShortcutProviderProps {
  children?: React.ReactNode;
  /** Shortcuts defined in one place (preferred: one registry makes conflicts visible). */
  shortcuts?: ShortcutBinding[];
  /** Called with all conflicts whenever they change. Without it, conflicts are logged with console.warn. */
  onConflict?: (conflicts: ShortcutConflict[]) => void;
  /** Called with every feedback message (deprecated, unavailable, ambiguous or refused shortcuts). */
  onFeedback?: (message: string) => void;
  /** Show feedback messages in a status toast. Default true. */
  showFeedback?: boolean;
  /** Check bindings against the standard Windows shortcuts. Default true. */
  checkStandard?: boolean;
}

let nextId = 0;
const REFUSE_TYPES = new Set(['reserved', 'clinical-placement']);

function isTextEntry(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  if (!el || !el.tagName) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  if (el.tagName === 'INPUT') return !['checkbox', 'radio', 'button', 'submit', 'reset'].includes((el as HTMLInputElement).type);
  return false;
}

/**
 * Keyboard shortcut registry (keyshorts): one document-level listener, conflict detection against
 * other bindings and the standard Windows shortcuts, refusal of reserved keys (ALT+F4, F1, system
 * keys), and visible feedback instead of silent failure for deprecated, unavailable or ambiguous
 * shortcuts. Works with Sticky Keys because modifiers are read from each key event.
 */
export function ShortcutProvider({ children, shortcuts: staticShortcuts, onConflict, onFeedback, showFeedback = true, checkStandard = true }: ShortcutProviderProps) {
  const getters = useRef(new Map<string, () => ShortcutBinding>());
  const [metas, setMetas] = useState<Array<{ id: string; meta: ShortcutBinding }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const feedbackRef = useRef(onFeedback);
  feedbackRef.current = onFeedback;

  const register = useCallback((id: string, get: () => ShortcutBinding, meta: ShortcutBinding) => {
    getters.current.set(id, get);
    setMetas(m => [...m.filter(x => x.id !== id), { id, meta }]);
    return () => {
      getters.current.delete(id);
      setMetas(m => m.filter(x => x.id !== id));
    };
  }, []);

  const all = useMemo(() => {
    const list: Array<{ id: string; meta: ShortcutBinding }> = (staticShortcuts ?? []).map((s, i) => ({ id: `static-${i}`, meta: s }));
    return list.concat(metas);
  }, [staticShortcuts, metas]);

  const conflicts = useMemo(
    () => detectShortcutConflicts(all.map(a => a.meta), { standard: checkStandard ? undefined : false }),
    [all, checkStandard],
  );

  const shortcuts: RegisteredShortcut[] = useMemo(() => {
    const refusedKeys = new Map<string, Set<string>>();
    for (const c of conflicts) {
      if (c.severity === 'error' && REFUSE_TYPES.has(c.type)) {
        const set = refusedKeys.get(c.keys) ?? new Set<string>();
        c.actions.forEach(a => set.add(a));
        refusedKeys.set(c.keys, set);
      }
    }
    return all.map(a => {
      const keys = normaliseKeys(a.meta.keys);
      return { ...a.meta, id: a.id, keys, refused: !!refusedKeys.get(keys)?.has(a.meta.action) };
    });
  }, [all, conflicts]);

  const conflictKey = JSON.stringify(conflicts);
  useEffect(() => {
    if (onConflict) onConflict(conflicts);
    else if (conflicts.length) console.warn('ShortcutProvider: shortcut conflicts', conflicts.map(c => c.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conflictKey]);

  const say = useCallback((msg: string) => {
    feedbackRef.current?.(msg);
    setMessage(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 5000);
  }, []);

  const latest = useRef(shortcuts);
  latest.current = shortcuts;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const keys = normaliseKeyEvent(e);
      if (!keys) return;
      const plain = !/^(Ctrl|Alt)\+/.test(keys) && !/^F\d{1,2}$/.test(keys) && keys !== 'Esc';
      const typing = isTextEntry(e.target);
      const matches = latest.current
        .filter(s => s.keys === keys)
        .map(s => ({ s, live: (s.id.startsWith('static-') ? s : getters.current.get(s.id)?.() ?? s) as ShortcutBinding }))
        .filter(({ s, live }) => !(typing && plain && !live.allowInInputs && !s.allowInInputs));
      if (!matches.length) return;
      const refused = matches.filter(m => m.s.refused);
      const usable = matches.filter(m => !m.s.refused);
      if (!usable.length) {
        e.preventDefault();
        say(`${keys} is not assigned: ${refused.map(m => m.s.action).join(', ')} conflicts with a reserved shortcut.`);
        return;
      }
      const enabled = usable.filter(m => m.live.enabled !== false);
      if (!enabled.length) {
        e.preventDefault();
        say(`${keys} (${usable[0].s.action}) is not available here.`);
        return;
      }
      const current = enabled.filter(m => !m.live.deprecated);
      if (!current.length) {
        e.preventDefault();
        const d = enabled[0].live;
        say(`${keys} is no longer used for ${d.action}.${d.replacement ? ` Use ${normaliseKeys(d.replacement)} instead.` : ''}`);
        return;
      }
      if (current.length > 1) {
        e.preventDefault();
        say(`${keys} is assigned to more than one function (${current.map(m => m.s.action).join(', ')}). Nothing was done.`);
        return;
      }
      e.preventDefault();
      current[0].live.handler?.(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [say]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const ctx = useMemo(() => ({ register, shortcuts, conflicts }), [register, shortcuts, conflicts]);
  return (
    <ShortcutContext.Provider value={ctx}>
      {children}
      {showFeedback ? (
        <div role="status" aria-live="polite" className={cx('cui-shortcut-feedback', message && 'cui-shortcut-feedback--visible')}>
          {message ? (
            <>
              <Icon name="info" size={16} />
              <span>{message}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </ShortcutContext.Provider>
  );
}

/**
 * Register a shortcut while the calling component is mounted. The handler may change on every
 * render; registration only changes when keys, action, context or flags change.
 */
export function useShortcut(binding: ShortcutBinding): { keys: string; conflicts: ShortcutConflict[]; refused: boolean } {
  const ctx = useContext(ShortcutContext);
  const idRef = useRef<string>('');
  if (!idRef.current) idRef.current = `sc-${++nextId}`;
  const latest = useRef(binding);
  latest.current = binding;
  const keys = normaliseKeys(binding.keys);
  const { action, context, clinicallySignificant, deprecated, replacement, allowInInputs, description } = binding;
  useEffect(() => {
    if (!ctx) return;
    return ctx.register(idRef.current, () => latest.current, { keys, action, context, clinicallySignificant, deprecated, replacement, allowInInputs, description });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.register, keys, action, context, clinicallySignificant, deprecated, replacement, allowInInputs, description]);
  const conflicts = ctx ? ctx.conflicts.filter(c => c.keys.split(', ').includes(keys) && c.actions.includes(action)) : [];
  const refused = !!ctx?.shortcuts.find(s => s.id === idRef.current)?.refused;
  return { keys, conflicts, refused };
}

/** Registered shortcuts and conflicts from the nearest ShortcutProvider (null outside one). */
export function useShortcutRegistry(): { shortcuts: RegisteredShortcut[]; conflicts: ShortcutConflict[] } | null {
  const ctx = useContext(ShortcutContext);
  return ctx ? { shortcuts: ctx.shortcuts, conflicts: ctx.conflicts } : null;
}
