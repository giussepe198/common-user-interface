import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { BottomSheet } from './BottomSheet';

afterEach(cleanup);

// jsdom has no PointerEvent: give pointer events their coordinates and id.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
    }
  }
  (window as unknown as { PointerEvent: typeof PointerEventPolyfill }).PointerEvent = PointerEventPolyfill;
}

function Harness(props: Partial<React.ComponentProps<typeof BottomSheet>> & { onCloseSpy?: (r: string) => void }) {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <BottomSheet
        open={open}
        title="Why was it not given?"
        description="CHEN, Wei · paracetamol 1 g, due 13:00"
        closeOnBrowserBack={false}
        {...props}
        onClose={r => {
          props.onCloseSpy?.(r);
          setOpen(false);
        }}
      >
        <button type="button">First</button>
        <button type="button">Last</button>
      </BottomSheet>
    </>
  );
}

describe('BottomSheet', () => {
  it('is a labelled modal dialog with focus moved inside', () => {
    render(<Harness />);
    const d = screen.getByRole('dialog', { name: 'Why was it not given?' });
    expect(d.getAttribute('aria-modal')).toBe('true');
    expect(d.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.activeElement?.textContent).toBe('First');
    expect(d.closest('.cui-root')).toBeTruthy();
  });
  it('traps Tab and closes on Esc', () => {
    const spy = vi.fn();
    render(<Harness onCloseSpy={spy} />);
    const last = screen.getByRole('button', { name: 'Last' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: 'Escape' });
    expect(spy).toHaveBeenCalledWith('escape');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('closes from the close button (48 px target) and the backdrop', () => {
    const spy = vi.fn();
    render(<Harness onCloseSpy={spy} />);
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.className).toContain('cui-sheet__close');
    fireEvent.click(close);
    expect(spy).toHaveBeenCalledWith('closeButton');
  });
  it('refuses swipe and backdrop dismissal while it holds unsaved data, unless allowed', () => {
    const spy = vi.fn();
    const blocked = vi.fn();
    render(<Harness hasUnsavedData onCloseSpy={spy} onCloseBlocked={blocked} />);
    const top = document.querySelector('.cui-sheet__top') as HTMLElement;
    fireEvent.pointerDown(top, { clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(top, { clientY: 260, pointerId: 1 });
    fireEvent.pointerUp(top, { clientY: 260, pointerId: 1 });
    fireEvent.click(document.querySelector('.cui-sheet-backdrop')!);
    expect(spy).not.toHaveBeenCalled();
    expect(blocked).toHaveBeenCalledWith('swipe');
    expect(blocked).toHaveBeenCalledWith('backdrop');
    expect(screen.getByRole('status').textContent).toContain('unsaved changes');
    cleanup();
    const spy2 = vi.fn();
    render(<Harness hasUnsavedData allowDismissWithUnsavedData onCloseSpy={spy2} />);
    const top2 = document.querySelector('.cui-sheet__top') as HTMLElement;
    fireEvent.pointerDown(top2, { clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(top2, { clientY: 260, pointerId: 1 });
    fireEvent.pointerUp(top2, { clientY: 260, pointerId: 1 });
    expect(spy2).toHaveBeenCalledWith('swipe');
  });
  it('closes on the browser back button when enabled', () => {
    const spy = vi.fn();
    render(<Harness closeOnBrowserBack onCloseSpy={spy} />);
    fireEvent(window, new PopStateEvent('popstate'));
    expect(spy).toHaveBeenCalledWith('back');
  });
  it('returns focus to the opener', () => {
    function Opener() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open sheet</button>
          <BottomSheet open={open} title="Sheet" onClose={() => setOpen(false)} closeOnBrowserBack={false}>
            <p>Body</p>
          </BottomSheet>
        </>
      );
    }
    render(<Opener />);
    const opener = screen.getByRole('button', { name: 'Open sheet' });
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(document.activeElement).toBe(opener);
  });
});
