import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SpellCheckPopover } from './SpellCheckPopover';

afterEach(cleanup);
const s = [{ text: 'pneumonia', source: 'terminology' as const }, { text: 'pneumonic', source: 'dictionary' as const }];

describe('SpellCheckPopover', () => {
  it('needs a deliberate choice before OK (Matching 2.2.4: never auto-confirm)', () => {
    const onAccept = vi.fn();
    render(<SpellCheckPopover word="pnuemonia" suggestions={s} onAccept={onAccept} onIgnore={vi.fn()} onCancel={vi.fn()} />);
    const ok = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement;
    expect(ok.disabled).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: /pneumonia/ }));
    fireEvent.click(ok);
    expect(onAccept).toHaveBeenCalledWith('pneumonia');
  });
  it('Ignore and Cancel (Escape) are separate', () => {
    const onIgnore = vi.fn();
    const onCancel = vi.fn();
    render(<SpellCheckPopover word="x" suggestions={[]} onAccept={vi.fn()} onIgnore={onIgnore} onCancel={onCancel} />);
    expect(screen.getByText('No suggestions found.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ignore' }));
    expect(onIgnore).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
  it('keeps macrons in suggestions', () => {
    render(<SpellCheckPopover word="Maori" suggestions={[{ text: 'Māori' }]} onAccept={vi.fn()} onIgnore={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Māori' })).toBeTruthy();
  });
});
