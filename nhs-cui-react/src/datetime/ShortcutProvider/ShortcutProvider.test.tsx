import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ShortcutProvider, useShortcut } from './ShortcutProvider';

afterEach(cleanup);

function Registered({ onSave, enabled = true }: { onSave: () => void; enabled?: boolean }) {
  const r = useShortcut({ keys: 'Ctrl+S', action: 'Save', handler: onSave, enabled });
  return <span>{`registered ${r.keys}`}</span>;
}

describe('ShortcutProvider', () => {
  it('runs a registered shortcut from the keyboard', () => {
    const onSave = vi.fn();
    render(<ShortcutProvider checkStandard={false}><Registered onSave={onSave} /></ShortcutProvider>);
    expect(screen.getByText('registered Ctrl+S')).toBeTruthy();
    fireEvent.keyDown(document, { key: 's', code: 'KeyS', ctrlKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
  });
  it('gives feedback instead of failing silently when a function is unavailable', () => {
    const onSave = vi.fn();
    const onFeedback = vi.fn();
    render(<ShortcutProvider checkStandard={false} onFeedback={onFeedback}><Registered onSave={onSave} enabled={false} /></ShortcutProvider>);
    fireEvent.keyDown(document, { key: 's', code: 'KeyS', ctrlKey: true });
    expect(onSave).not.toHaveBeenCalled();
    expect(onFeedback).toHaveBeenCalledWith('Ctrl+S (Save) is not available here.');
    expect(screen.getByRole('status').textContent).toContain('not available here');
  });
  it('tells the user when a deprecated shortcut is used', () => {
    const onFeedback = vi.fn();
    render(<ShortcutProvider checkStandard={false} onFeedback={onFeedback} shortcuts={[{ keys: 'F9', action: 'Refresh results', deprecated: true, replacement: 'F5' }]} />);
    fireEvent.keyDown(document, { key: 'F9' });
    expect(onFeedback).toHaveBeenCalledWith('F9 is no longer used for Refresh results. Use F5 instead.');
  });
  it('refuses reserved keys and reports conflicts', () => {
    const onConflict = vi.fn();
    const handler = vi.fn();
    render(<ShortcutProvider onConflict={onConflict} shortcuts={[{ keys: 'Alt+F4', action: 'Close patient', handler }]} />);
    expect(onConflict.mock.calls[0][0][0]).toMatchObject({ type: 'reserved', severity: 'error' });
    fireEvent.keyDown(document, { key: 'F4', altKey: true });
    expect(handler).not.toHaveBeenCalled();
  });
  it('does not fire plain keys while typing in a text field', () => {
    const handler = vi.fn();
    render(<ShortcutProvider checkStandard={false} shortcuts={[{ keys: 'N', action: 'Next patient', handler }]}><input aria-label="Note" /></ShortcutProvider>);
    fireEvent.keyDown(screen.getByLabelText('Note'), { key: 'n', code: 'KeyN' });
    expect(handler).not.toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: 'n', code: 'KeyN' });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
