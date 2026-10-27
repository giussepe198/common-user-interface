import { describe, expect, it } from 'vitest';
import { STANDARD_WINDOWS_SHORTCUTS, countKeyPresses, detectShortcutConflicts, normaliseKeyEvent, normaliseKeys } from './shortcuts';

describe('normaliseKeys', () => {
  it('orders modifiers Ctrl, Alt, Shift and capitalises keys', () => {
    expect(normaliseKeys('ctrl+shift+a')).toBe('Ctrl+Shift+A');
    expect(normaliseKeys('Shift + Ctrl + a')).toBe('Ctrl+Shift+A');
    expect(normaliseKeys('alt+f4')).toBe('Alt+F4');
    expect(normaliseKeys('escape')).toBe('Esc');
    expect(normaliseKeys('CTRL+F4')).toBe('Ctrl+F4');
    expect(normaliseKeys('ctrl++')).toBe('Ctrl++');
  });
  it('normalises keyboard events', () => {
    expect(normaliseKeyEvent({ key: 's', code: 'KeyS', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false })).toBe('Ctrl+S');
    expect(normaliseKeyEvent({ key: '!', code: 'Digit1', ctrlKey: false, altKey: true, shiftKey: true, metaKey: false })).toBe('Alt+Shift+1');
    expect(normaliseKeyEvent({ key: 'F2', ctrlKey: false, altKey: true, shiftKey: false, metaKey: false })).toBe('Alt+F2');
    expect(normaliseKeyEvent({ key: 'Control', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false })).toBeNull();
    expect(normaliseKeyEvent({ key: 'ArrowUp', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false })).toBe('Up');
  });
  it('counts key presses', () => {
    expect(countKeyPresses('Ctrl+Shift+S')).toBe(3);
    expect(countKeyPresses('F1')).toBe(1);
  });
});

describe('STANDARD_WINDOWS_SHORTCUTS', () => {
  it('contains the keyshorts mappings in normalised form', () => {
    for (const s of STANDARD_WINDOWS_SHORTCUTS) expect(normaliseKeys(s.keys)).toBe(s.keys);
    expect(STANDARD_WINDOWS_SHORTCUTS.find(s => s.keys === 'Ctrl+X')?.action).toBe('Cut');
    expect(STANDARD_WINDOWS_SHORTCUTS.find(s => s.keys === 'F1')?.action).toBe('Help');
  });
});

describe('detectShortcutConflicts', () => {
  const types = (defs: Parameters<typeof detectShortcutConflicts>[0]) => detectShortcutConflicts(defs).map(c => `${c.type}:${c.severity}`);
  it('accepts consistent standard use', () => {
    expect(detectShortcutConflicts([{ keys: 'ctrl+s', action: 'Save' }, { keys: 'F1', action: 'Help' }, { keys: 'Alt+F4', action: 'Quit application' }])).toEqual([]);
  });
  it('flags reserved keys', () => {
    expect(types([{ keys: 'Alt+F4', action: 'Close patient record' }])).toEqual(['reserved:error']);
    expect(types([{ keys: 'F1', action: 'Search' }])).toEqual(['reserved:error']);
    expect(types([{ keys: 'Alt+Tab', action: 'Next tab' }])).toEqual(['reserved:error']);
    expect(types([{ keys: 'Alt+F', action: 'Find patient' }])).toEqual(['reserved:error']);
  });
  it('flags the same keys for different actions in overlapping contexts', () => {
    const c = detectShortcutConflicts([
      { keys: 'Alt+F2', action: 'Prescribe', context: 'medications' },
      { keys: 'alt+f2', action: 'Discharge', context: 'general' },
    ]);
    expect(c.map(x => x.type)).toEqual(['duplicate-keys']);
    expect(detectShortcutConflicts([
      { keys: 'Alt+F2', action: 'Prescribe', context: 'medications' },
      { keys: 'Alt+F2', action: 'Discharge', context: 'admissions' },
    ])).toEqual([]);
  });
  it('flags the same action on two keys', () => {
    expect(types([{ keys: 'Alt+F2', action: 'Add note' }, { keys: 'Alt+F3', action: 'Add note' }])).toEqual(['duplicate-action:warning']);
    expect(types([{ keys: 'Alt+F2', action: 'Prescribe' }, { keys: 'Alt+F3', action: 'Prescribe controlled drug' }])).toEqual([]);
  });
  it('flags clashes with standard shortcuts', () => {
    const c = detectShortcutConflicts([{ keys: 'Ctrl+P', action: 'Prescribe' }]);
    expect(c[0]).toMatchObject({ type: 'standard', actions: ['Prescribe', 'Print'] });
    expect(detectShortcutConflicts([{ keys: 'Ctrl+B', action: 'Book appointment' }])).toEqual([]);
    expect(detectShortcutConflicts([{ keys: 'Ctrl+B', action: 'Book appointment', context: 'textEditing' }])[0].type).toBe('standard');
  });
  it('flags long combinations and clinically significant placement', () => {
    expect(types([{ keys: 'Ctrl+Shift+Q', action: 'Queue' }])).toEqual(['too-many-keys:warning']);
    expect(types([{ keys: 'Ctrl+M', action: 'Give morphine', clinicallySignificant: true }])).toEqual(['clinical-placement:warning']);
    expect(types([{ keys: 'Ctrl+X', action: 'Give morphine', clinicallySignificant: true }])).toContain('clinical-placement:error');
    expect(types([{ keys: 'Alt+F7', action: 'Give morphine', clinicallySignificant: true }])).toEqual([]);
  });
});
