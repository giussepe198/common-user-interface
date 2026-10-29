import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { Dialog } from './Dialog';
import { ShortcutProvider, useShortcut } from '../../datetime';
import { isShellOverlayOpen } from '../internal/overlay';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Global({ onFire }: { onFire: () => void }) {
  useShortcut({ keys: 'Ctrl+K', action: 'Find person', handler: onFire });
  return null;
}

function Harness({ onFire, onClose = () => undefined }: { onFire: () => void; onClose?: () => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <ShortcutProvider showFeedback={false} checkStandard={false}>
      <Global onFire={onFire} />
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Record leave"
        description="CHEN, Wei"
        footer={<button type="button">Save leave</button>}
      >
        <input aria-label="Reason" />
      </Dialog>
    </ShortcutProvider>
  );
}

describe('Dialog', () => {
  it('is a labelled, described modal dialog that takes focus and returns it on close', () => {
    render(<Harness onFire={() => undefined} />);
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Record leave' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Reason'));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('stops global shortcuts while open and lets them work again after (the shortcut-behind-dialog bug)', () => {
    const onFire = vi.fn();
    render(<Harness onFire={onFire} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(isShellOverlayOpen()).toBe(true);
    // Pressed inside the dialog.
    fireEvent.keyDown(screen.getByLabelText('Reason'), { key: 'k', ctrlKey: true });
    // Pressed with focus left on the page body.
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(isShellOverlayOpen()).toBe(false);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(onFire).toHaveBeenCalledTimes(2);
  });

  it('traps Tab inside the dialog', () => {
    render(<Harness onFire={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const save = screen.getByRole('button', { name: 'Save leave' });
    save.focus();
    fireEvent.keyDown(save, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('a dialog that must be answered has no close button and ignores Esc', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Session locked" dismissible={false} role="alertdialog">
        <button type="button">Unlock</button>
      </Dialog>,
    );
    expect(screen.getByRole('alertdialog', { name: 'Session locked' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Unlock' }), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('becomes a full-screen sheet on phones', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('max-width'), addEventListener: () => undefined, removeEventListener: () => undefined }));
    render(
      <Dialog open onClose={() => undefined} title="Record leave">
        <p>Body</p>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Record leave' });
    expect(dialog.className).toContain('cui-sheet--full');
    // The close button keeps its word on a phone (2026-10-28), so it never doubles a footer Cancel.
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('closes on backdrop click only when asked', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog open onClose={onClose} title="T" />);
    act(() => {
      fireEvent.click(document.querySelector('.cui-dialog-backdrop') as Element);
    });
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Dialog open onClose={onClose} title="T" closeOnBackdrop />);
    fireEvent.click(document.querySelector('.cui-dialog-backdrop') as Element);
    expect(onClose).toHaveBeenCalledWith('backdrop');
  });
});
