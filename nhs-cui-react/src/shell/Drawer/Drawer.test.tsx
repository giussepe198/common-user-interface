import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Drawer } from './Drawer';
import { ShortcutProvider, useShortcut } from '../../datetime';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Global({ onFire }: { onFire: () => void }) {
  useShortcut({ keys: 'Alt+N', action: 'New note', handler: onFire });
  return null;
}

describe('Drawer', () => {
  it('is a labelled modal side panel with the close button and Esc', () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Filters" description="Caseload">
        <input aria-label="Team" />
      </Drawer>,
    );
    const d = screen.getByRole('dialog', { name: 'Filters' });
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.className).toContain('cui-drawer--end');
    expect(document.activeElement).toBe(screen.getByLabelText('Team'));
    fireEvent.keyDown(screen.getByLabelText('Team'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith('escape');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledWith('closeButton');
  });

  it('refuses the backdrop while it holds unsaved data', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Drawer open onClose={onClose} title="Note" hasUnsavedData />);
    fireEvent.click(document.querySelector('.cui-drawer-backdrop') as Element);
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Drawer open onClose={onClose} title="Note" />);
    fireEvent.click(document.querySelector('.cui-drawer-backdrop') as Element);
    expect(onClose).toHaveBeenCalledWith('backdrop');
  });

  it('stops global shortcuts while open', () => {
    const onFire = vi.fn();
    render(
      <ShortcutProvider showFeedback={false} checkStandard={false}>
        <Global onFire={onFire} />
        <Drawer open onClose={() => undefined} title="Detail">
          <input aria-label="Field" />
        </Drawer>
      </ShortcutProvider>,
    );
    fireEvent.keyDown(screen.getByLabelText('Field'), { key: 'n', altKey: true });
    fireEvent.keyDown(document.body, { key: 'n', altKey: true });
    expect(onFire).not.toHaveBeenCalled();
  });

  it('becomes a bottom sheet on phones, but not when sheetOnPhone is off', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('max-width'), addEventListener: () => undefined, removeEventListener: () => undefined }));
    const { rerender } = render(<Drawer open onClose={() => undefined} title="Detail" />);
    expect(screen.getByRole('dialog', { name: 'Detail' }).className).toContain('cui-sheet--bottom');
    rerender(<Drawer open onClose={() => undefined} title="Detail" side="start" sheetOnPhone={false} />);
    expect(screen.getByRole('dialog', { name: 'Detail' }).className).toContain('cui-drawer--start');
  });

  it('keeps what was typed when the window crosses the phone breakpoint (drawer to sheet and back)', () => {
    let phone = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', (q: string) => ({ get matches() { return phone && q.includes('max-width'); }, addEventListener: (_: string, fn: () => void) => listeners.add(fn), removeEventListener: (_: string, fn: () => void) => listeners.delete(fn) }));
    function Field() {
      const [v, setV] = React.useState('');
      return <input aria-label="Reason" value={v} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Drawer open onClose={() => undefined} title="Detail"><Field /></Drawer>);
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Typed before the resize' } });
    const flip = (to: boolean) => React.act(() => { phone = to; for (const fn of [...listeners]) fn(); });
    flip(true);
    expect(screen.getByRole('dialog', { name: 'Detail' }).className).toContain('cui-sheet--bottom');
    expect((screen.getByLabelText('Reason') as HTMLInputElement).value).toBe('Typed before the resize');
    flip(false);
    expect(screen.getByRole('dialog', { name: 'Detail' }).className).toContain('cui-drawer');
    expect((screen.getByLabelText('Reason') as HTMLInputElement).value).toBe('Typed before the resize');
  });

  it('non-modal: no backdrop, no trap, the page stays usable; Esc closes and focus returns', () => {
    const onClose = vi.fn();
    const opener = document.createElement('button');
    opener.textContent = 'Open';
    document.body.appendChild(opener);
    opener.focus();
    const { rerender } = render(
      <>
        <button type="button">On the page</button>
        <Drawer open modal={false} onClose={onClose} title="Contact detail">
          <a href="#x">Open the contact</a>
        </Drawer>
      </>,
    );
    const d = screen.getByRole('dialog', { name: 'Contact detail' });
    expect(d.getAttribute('aria-modal')).toBe('false');
    expect(document.querySelector('.cui-drawer-backdrop')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(d.closest('.cui-drawer-layer')?.className).toContain('cui-drawer-layer--nonmodal');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Open the contact' }));
    // Tab is not trapped: the last control does not wrap back to the first.
    const tab = fireEvent.keyDown(screen.getByRole('button', { name: 'Close' }), { key: 'Tab' });
    expect(tab).toBe(true);
    fireEvent.keyDown(screen.getByRole('link', { name: 'Open the contact' }), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith('escape');
    rerender(
      <>
        <button type="button">On the page</button>
        <Drawer open={false} modal={false} onClose={onClose} title="Contact detail" />
      </>,
    );
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('non-modal leaves global shortcuts working on the page', () => {
    const onFire = vi.fn();
    render(
      <ShortcutProvider showFeedback={false} checkStandard={false}>
        <Global onFire={onFire} />
        <Drawer open modal={false} onClose={() => undefined} title="Detail" />
      </ShortcutProvider>,
    );
    fireEvent.keyDown(document.body, { key: 'n', altKey: true });
    expect(onFire).toHaveBeenCalled();
  });
});
