/**
 * Keyboard shortcuts (CUI Keyboard Shortcuts v1.0 "Quick Wins", keyshorts). No guideline IDs:
 * rules are cited as "keyshorts" with the section (current recommendations, potential
 * recommendations 1 to 7, construction).
 */

export interface StandardShortcut {
  /** Normalised keys, e.g. "Ctrl+S". */
  keys: string;
  action: string;
  /** general, textEditing, browser, menu, accessKeys (web), system, navigation. */
  context: 'general' | 'textEditing' | 'browser' | 'menu' | 'accessKeys' | 'system' | 'navigation';
  /** Must never be used for anything else (e.g. ALT+F4, F1). */
  reserved?: boolean;
  note?: string;
}

const s = (keys: string, action: string, context: StandardShortcut['context'], extra: Partial<StandardShortcut> = {}): StandardShortcut => ({ keys, action, context, ...extra });

/** Standard Windows shortcuts from the keyshorts "current recommendations" tables. */
export const STANDARD_WINDOWS_SHORTCUTS: StandardShortcut[] = [
  s('Alt+F4', 'Quit application', 'system', { reserved: true, note: 'Must never be used for anything else.' }),
  s('Alt+V', 'View menu', 'menu'),
  s('Alt+E', 'Edit menu', 'menu'),
  s('Alt+F', 'File menu', 'menu', { note: 'Too many existing conflicts: do not use for new functions.' }),
  s('Alt+H', 'Help menu', 'menu'),
  s('Alt+Home', 'First page or homepage', 'general'),
  s('Alt+Tab', 'Switch windows', 'system', { reserved: true }),
  s('Alt+Esc', 'Display next window', 'system', { reserved: true }),
  s('Alt+1', 'Homepage', 'accessKeys'),
  s('Alt+2', "What's new", 'accessKeys'),
  s('Alt+3', 'Site map', 'accessKeys'),
  s('Alt+4', 'Search', 'accessKeys'),
  s('Alt+5', 'Frequently asked questions', 'accessKeys'),
  s('Alt+6', 'Help', 'accessKeys'),
  s('Alt+7', 'Complaints procedure', 'accessKeys'),
  s('Alt+8', 'Terms and conditions', 'accessKeys'),
  s('Alt+9', 'Feedback form', 'accessKeys'),
  s('Alt+0', 'Access key details', 'accessKeys'),
  s('Alt+S', 'Skip navigation', 'accessKeys'),
  s('F1', 'Help', 'general', { reserved: true, note: 'Always Help, in all applications.' }),
  s('F5', 'Refresh', 'browser'),
  s('F11', 'Full screen', 'browser'),
  s('Ctrl+A', 'Select all', 'general'),
  s('Ctrl+S', 'Save', 'general'),
  s('Ctrl+F', 'Find', 'general'),
  s('Ctrl+Z', 'Undo', 'general'),
  s('Ctrl+X', 'Cut', 'general'),
  s('Ctrl+C', 'Copy', 'general'),
  s('Ctrl+V', 'Paste', 'general'),
  s('Ctrl+N', 'New', 'general'),
  s('Ctrl+W', 'Close', 'general'),
  s('Ctrl+Y', 'Redo', 'general'),
  s('Ctrl+O', 'Open', 'general'),
  s('Ctrl+P', 'Print', 'general'),
  s('Ctrl+F4', 'Close', 'general'),
  s('Ctrl+E', 'Centre', 'textEditing'),
  s('Ctrl+R', 'Right align', 'textEditing'),
  s('Ctrl+T', 'Indent', 'textEditing'),
  s('Ctrl+U', 'Underline', 'textEditing'),
  s('Ctrl+I', 'Italics', 'textEditing'),
  s('Ctrl+G', 'Go to', 'textEditing'),
  s('Ctrl+J', 'Justify', 'textEditing'),
  s('Ctrl+K', 'Hyperlink', 'textEditing'),
  s('Ctrl+L', 'Left align', 'textEditing'),
  s('Ctrl+B', 'Bold', 'textEditing'),
  s('Ctrl+Q', 'Exit', 'browser'),
  s('Ctrl+E', 'Web search', 'browser'),
  s('Ctrl+R', 'Refresh', 'browser'),
  s('Ctrl+U', 'View source', 'browser'),
  s('Ctrl+H', 'History', 'browser'),
  s('Ctrl+L', 'New location', 'browser'),
  s('Tab', 'Move to next field', 'navigation'),
  s('Shift+Tab', 'Move to previous field', 'navigation'),
  s('Up', 'Previous patient record', 'navigation', { note: 'Arrow keys move through patient records.' }),
  s('Down', 'Next patient record', 'navigation'),
  s('Esc', 'Cancel action', 'general'),
];

const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Win'] as const;
const ALIASES: Record<string, string> = {
  ctrl: 'Ctrl', control: 'Ctrl', ctl: 'Ctrl', alt: 'Alt', option: 'Alt', opt: 'Alt', shift: 'Shift',
  win: 'Win', windows: 'Win', meta: 'Win', cmd: 'Win', command: 'Win', super: 'Win', os: 'Win',
  esc: 'Esc', escape: 'Esc', enter: 'Enter', return: 'Enter', tab: 'Tab', space: 'Space', spacebar: 'Space', ' ': 'Space',
  up: 'Up', arrowup: 'Up', down: 'Down', arrowdown: 'Down', left: 'Left', arrowleft: 'Left', right: 'Right', arrowright: 'Right',
  home: 'Home', end: 'End', pageup: 'PageUp', pgup: 'PageUp', pagedown: 'PageDown', pgdn: 'PageDown',
  delete: 'Delete', del: 'Delete', insert: 'Insert', ins: 'Insert', backspace: 'Backspace',
};

function normalisePart(p: string): string {
  const lower = p.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];
  if (/^f\d{1,2}$/.test(lower)) return lower.toUpperCase();
  if (p.length === 1) return p.toUpperCase();
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}

/**
 * Canonical form of a key combination: modifiers in the order Ctrl, Alt, Shift, Win, then the key.
 * "shift+ctrl+a" gives "Ctrl+Shift+A"; "alt+f4" gives "Alt+F4"; "escape" gives "Esc".
 */
export function normaliseKeys(keys: string): string {
  const parts = keys.split(/\s*\+\s*(?=.)/).map(p => p.trim()).filter(p => p !== '');
  const mods = new Set<string>();
  let key = '';
  for (const p of parts) {
    const n = normalisePart(p);
    if ((MODIFIERS as readonly string[]).includes(n)) mods.add(n);
    else key = n;
  }
  return [...MODIFIERS.filter(m => mods.has(m)), key].filter(Boolean).join('+');
}

/** Minimal keyboard event shape (DOM KeyboardEvent or React.KeyboardEvent). */
export interface KeyEventLike {
  key: string;
  code?: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

/** Normalised keys for a keyboard event, or null when only a modifier was pressed. */
export function normaliseKeyEvent(e: KeyEventLike): string | null {
  if (['Control', 'Alt', 'Shift', 'Meta', 'OS', 'AltGraph'].includes(e.key)) return null;
  let key = e.key;
  if (e.code && /^Key[A-Z]$/.test(e.code)) key = e.code.slice(3);
  else if (e.code && /^Digit\d$/.test(e.code)) key = e.code.slice(5);
  const parts = [e.ctrlKey && 'Ctrl', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Win', key].filter(Boolean) as string[];
  return normaliseKeys(parts.join('+'));
}

/** Number of keys pressed together ("Ctrl+Shift+S" is 3). */
export function countKeyPresses(keys: string): number {
  return normaliseKeys(keys).split('+').length;
}

export interface ShortcutDefinition {
  keys: string;
  /** What it does, in a few words ("Save", "Prescribe controlled drug"). */
  action: string;
  /** Where it applies. "general" overlaps every context. Default "general". */
  context?: string;
  /** Clinically significant functions need spatial separation (keyshorts potential rec 7). */
  clinicallySignificant?: boolean;
  /** Still recognised, but the user is told it is deprecated (keyshorts construction). */
  deprecated?: boolean;
}

export type ShortcutConflictType = 'reserved' | 'duplicate-keys' | 'duplicate-action' | 'standard' | 'too-many-keys' | 'clinical-placement';

export interface ShortcutConflict {
  type: ShortcutConflictType;
  /** error: must be fixed (the binding is refused by ShortcutProvider). warning: review. */
  severity: 'error' | 'warning';
  keys: string;
  actions: string[];
  message: string;
}

const overlaps = (a?: string, b?: string) => {
  const x = a ?? 'general';
  const y = b ?? 'general';
  return x === y || x === 'general' || y === 'general' || x === 'global' || y === 'global';
};
const sameAction = (a: string, b: string) => {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return x === y || x.startsWith(y + ' ') || y.startsWith(x + ' ');
};

/**
 * Check a set of shortcut definitions (keyshorts): reserved system keys, ALT+F4 and F1 misuse,
 * ALT+F, the same keys for different actions in overlapping contexts, the same action on several
 * keys, clashes with standard Windows shortcuts, more than two keys, and clinically significant
 * functions placed in the easy zone or next to CTRL+Z.
 */
export function detectShortcutConflicts(
  defs: ShortcutDefinition[],
  options: { standard?: StandardShortcut[] | false } = {},
): ShortcutConflict[] {
  const standard = options.standard === false ? [] : options.standard ?? STANDARD_WINDOWS_SHORTCUTS;
  const out: ShortcutConflict[] = [];
  const list = defs.map(d => ({ ...d, keys: normaliseKeys(d.keys) }));
  const add = (type: ShortcutConflictType, severity: ShortcutConflict['severity'], keys: string, actions: string[], message: string) =>
    out.push({ type, severity, keys, actions, message });

  for (const d of list) {
    const k = d.keys;
    if (k === 'Alt+F4' && !/quit|exit/i.test(d.action)) add('reserved', 'error', k, [d.action], 'Alt+F4 quits the application and must never be used for anything else.');
    else if (k === 'F1' && !/help/i.test(d.action)) add('reserved', 'error', k, [d.action], 'F1 must always open Help.');
    else if (/^(Alt\+Tab|Alt\+Esc|Ctrl\+Alt\+Delete|Ctrl\+Esc)$/.test(k) || k.split('+').includes('Win')) add('reserved', 'error', k, [d.action], `${k} is a system-wide shortcut and must not be overridden.`);
    else if (k === 'Alt+F' && !/file/i.test(d.action)) add('reserved', 'error', k, [d.action], 'Alt+F has too many existing conflicts and must not be used for new functions.');

    if (countKeyPresses(k) > 2) add('too-many-keys', 'warning', k, [d.action], `${k} needs more than two key presses. Keep shortcuts simple.`);

    if (d.clinicallySignificant) {
      if (/^Ctrl\+(Shift\+)?[ASXZ]$/.test(k)) add('clinical-placement', 'error', k, [d.action], `${d.action} is clinically significant and must not sit next to Ctrl+Z (Undo).`);
      else if (!/^Alt\+F\d{1,2}$/.test(k)) add('clinical-placement', 'warning', k, [d.action], `${d.action} is clinically significant: use an Alt+function key so it is spatially separate from everyday shortcuts.`);
    }

    for (const st of standard) {
      if (st.keys !== k) continue;
      if (st.context === 'textEditing' && d.context !== 'textEditing') continue;
      if (st.context === 'browser' && d.context !== 'browser') continue;
      if (st.context === 'accessKeys' && d.context !== 'accessKeys') continue;
      if (sameAction(st.action, d.action)) continue;
      if (st.reserved || st.keys === 'Alt+F') continue; // reported above
      add('standard', 'warning', k, [d.action, st.action], `${k} is the standard shortcut for ${st.action}. Using it for ${d.action} may trigger the wrong function.`);
    }
  }

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (a.keys === b.keys && overlaps(a.context, b.context) && !sameAction(a.action, b.action)) {
        add('duplicate-keys', 'error', a.keys, [a.action, b.action], `${a.keys} is used for both ${a.action} and ${b.action}.`);
      }
      if (a.keys !== b.keys && (a.context ?? 'general') === (b.context ?? 'general') && a.action.trim().toLowerCase() === b.action.trim().toLowerCase() && !a.deprecated && !b.deprecated) {
        add('duplicate-action', 'warning', `${a.keys}, ${b.keys}`, [a.action], `${a.action} has two shortcuts (${a.keys} and ${b.keys}).`);
      }
    }
  }
  return out;
}
