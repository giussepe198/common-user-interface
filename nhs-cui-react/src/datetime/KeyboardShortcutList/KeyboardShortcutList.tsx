import React, { useMemo } from 'react';
import { cx, Icon } from '../../core';
import type {
  ShortcutConflict,
  ShortcutDefinition} from '../utils/shortcuts';
import {
  STANDARD_WINDOWS_SHORTCUTS,
  detectShortcutConflicts,
  normaliseKeys,
} from '../utils/shortcuts';
import { useShortcutRegistry } from '../ShortcutProvider/ShortcutProvider';

export interface KeyboardShortcutListItem extends ShortcutDefinition {
  description?: string;
  replacement?: string;
}

export interface KeyboardShortcutListProps {
  /** Shortcuts to list. Default: the shortcuts registered in the surrounding ShortcutProvider. */
  shortcuts?: KeyboardShortcutListItem[];
  /** Add the standard Windows shortcuts table from the keyboard shortcuts guidance. Default false. */
  showStandard?: boolean;
  /** Show conflict and placement problems next to each shortcut. Default true. */
  showConflicts?: boolean;
  /** Table caption. Default "Keyboard shortcuts". */
  caption?: string;
  className?: string;
}

const CONTEXT_LABELS: Record<string, string> = {
  general: 'General',
  textEditing: 'Text editing',
  browser: 'Browser',
  menu: 'Menus',
  accessKeys: 'Web access keys',
  system: 'System (reserved)',
  navigation: 'Navigation',
};
const contextLabel = (c?: string) => CONTEXT_LABELS[c ?? 'general'] ?? (c ? c.charAt(0).toUpperCase() + c.slice(1) : 'General');

/** Render "Ctrl+S" as <kbd>Ctrl</kbd>+<kbd>S</kbd>. */
export function KeyCombination({ keys }: { keys: string }) {
  const parts = normaliseKeys(keys).split(/\+(?=.)/);
  return (
    <span className="cui-shortcut-list__keys">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i ? '+' : null}
          <kbd>{p}</kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

interface Row {
  keys: string;
  action: string;
  context: string;
  description?: string;
  notes: Array<{ tone: 'error' | 'warning' | 'info'; text: string }>;
  source: 'app' | 'standard';
}

/**
 * Table of keyboard shortcuts grouped by context, with conflicts flagged by icon and text (not
 * colour alone), and optionally the standard Windows shortcuts from the keyboard shortcuts guidance.
 */
export function KeyboardShortcutList({ shortcuts, showStandard = false, showConflicts = true, caption = 'Keyboard shortcuts', className }: KeyboardShortcutListProps) {
  const registry = useShortcutRegistry();
  const items: KeyboardShortcutListItem[] = shortcuts ?? registry?.shortcuts ?? [];

  const rows = useMemo(() => {
    const conflicts: ShortcutConflict[] = showConflicts ? (shortcuts ? detectShortcutConflicts(items) : registry?.conflicts ?? []) : [];
    const out: Row[] = items.map(s => {
      const keys = normaliseKeys(s.keys);
      const notes: Row['notes'] = conflicts
        .filter(c => c.keys.split(', ').includes(keys) && c.actions.includes(s.action))
        .map(c => ({ tone: c.severity, text: c.message }));
      if (s.deprecated) notes.push({ tone: 'info', text: `Deprecated${s.replacement ? `: use ${normaliseKeys(s.replacement)}` : ''}.` });
      if (s.clinicallySignificant && !notes.length) notes.push({ tone: 'info', text: 'Clinically significant.' });
      return { keys, action: s.action, context: s.context ?? 'general', description: s.description, notes, source: 'app' as const };
    });
    if (showStandard) {
      for (const st of STANDARD_WINDOWS_SHORTCUTS) {
        out.push({
          keys: st.keys, action: st.action, context: st.context, source: 'standard',
          notes: st.note ? [{ tone: st.reserved ? 'warning' : 'info', text: st.note }] : [],
        });
      }
    }
    const groups = new Map<string, Row[]>();
    for (const r of out) {
      const g = groups.get(r.context) ?? [];
      g.push(r);
      groups.set(r.context, g);
    }
    return [...groups.entries()];
  }, [items, shortcuts, registry?.conflicts, showStandard, showConflicts]);

  const anyNotes = rows.some(([, rs]) => rs.some(r => r.notes.length));

  return (
    <table className={cx('cui-shortcut-list', className)}>
      <caption className="cui-shortcut-list__caption">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Keys</th>
          <th scope="col">Function</th>
          {anyNotes ? <th scope="col">Notes</th> : null}
        </tr>
      </thead>
      {rows.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan={anyNotes ? 3 : 2} className="cui-shortcut-list__empty">No shortcuts are defined.</td>
          </tr>
        </tbody>
      ) : (
        rows.map(([context, rs]) => (
          <tbody key={context}>
            <tr className="cui-shortcut-list__group">
              <th scope="colgroup" colSpan={anyNotes ? 3 : 2}>{contextLabel(context)}</th>
            </tr>
            {rs.map((r, i) => (
              <tr key={`${r.keys}-${r.action}-${i}`}>
                <td><KeyCombination keys={r.keys} /></td>
                <td>
                  {r.action}
                  {r.description ? <div className="cui-shortcut-list__desc">{r.description}</div> : null}
                </td>
                {anyNotes ? (
                  <td>
                    {r.notes.map((n, j) => (
                      <div key={j} className={cx('cui-shortcut-list__note', `cui-shortcut-list__note--${n.tone}`)}>
                        <Icon name={n.tone === 'error' ? 'error' : n.tone === 'warning' ? 'warning' : 'info'} size={16} />
                        <span>{n.tone === 'error' ? 'Conflict: ' : n.tone === 'warning' ? 'Check: ' : ''}{n.text}</span>
                      </div>
                    ))}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        ))
      )}
    </table>
  );
}
