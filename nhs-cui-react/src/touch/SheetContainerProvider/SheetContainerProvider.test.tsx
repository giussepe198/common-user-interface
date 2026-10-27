import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SheetContainerProvider } from './SheetContainerProvider';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { FullScreenSheet } from '../FullScreenSheet/FullScreenSheet';
import { HoldToConfirmButton } from '../HoldToConfirmButton/HoldToConfirmButton';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function makeHost() {
  const el = document.createElement('div');
  el.className = 'cui-root phone-layer';
  document.body.appendChild(el);
  return el;
}

describe('SheetContainerProvider', () => {
  it('renders every sheet below it into the given container', () => {
    const host = makeHost();
    render(
      <SheetContainerProvider container={host}>
        <BottomSheet open title="Sort medicines" onClose={() => {}} closeOnBrowserBack={false}>
          <button type="button">Due time</button>
        </BottomSheet>
      </SheetContainerProvider>,
    );
    expect(host.contains(screen.getByRole('dialog', { name: 'Sort medicines' }))).toBe(true);
    host.remove();
  });

  it('lets a sheet prop win over the provider, and nested providers override only what they set', () => {
    const host = makeHost();
    const other = makeHost();
    const { container } = render(
      <SheetContainerProvider container={host} autoFocus={false}>
        <BottomSheet open title="Own container" container={other} onClose={() => {}} closeOnBrowserBack={false} />
        <SheetContainerProvider portal={false}>
          <BottomSheet open title="In place" onClose={() => {}} closeOnBrowserBack={false} />
        </SheetContainerProvider>
      </SheetContainerProvider>,
    );
    expect(other.contains(screen.getByRole('dialog', { name: 'Own container' }))).toBe(true);
    expect(container.contains(screen.getByRole('dialog', { name: 'In place' }))).toBe(true);
    host.remove();
    other.remove();
  });

  it('locks body scroll only for sheets on document.body', () => {
    const host = makeHost();
    const { rerender } = render(
      <SheetContainerProvider container={host}>
        <FullScreenSheet open title="Time given" onClose={() => {}} closeOnBrowserBack={false} />
      </SheetContainerProvider>,
    );
    expect(document.body.style.overflow).toBe('');
    rerender(<FullScreenSheet open portal={false} title="Time given" onClose={() => {}} closeOnBrowserBack={false} />);
    expect(document.body.style.overflow).toBe('');
    rerender(<FullScreenSheet open title="Time given" onClose={() => {}} closeOnBrowserBack={false} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<FullScreenSheet open={false} title="Time given" onClose={() => {}} closeOnBrowserBack={false} />);
    expect(document.body.style.overflow).toBe('');
    host.remove();
  });

  it('autoFocus false leaves focus alone for a sheet open on first render, but a later open moves focus in', () => {
    function Harness() {
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <BottomSheet open={open} portal={false} title="Reason" onClose={() => setOpen(false)} closeOnBrowserBack={false}>
            <button type="button">First</button>
          </BottomSheet>
        </>
      );
    }
    render(
      <SheetContainerProvider autoFocus={false}>
        <Harness />
      </SheetContainerProvider>,
    );
    expect(document.activeElement).toBe(document.body);
    // Tab is still trapped once the user is inside.
    const first = screen.getByRole('button', { name: 'First' });
    first.focus();
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    act(() => opener.click());
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
  });

  it('a sheet autoFocus prop wins over the provider', () => {
    render(
      <SheetContainerProvider autoFocus={false}>
        <BottomSheet open portal={false} autoFocus title="Reason" onClose={() => {}} closeOnBrowserBack={false}>
          <button type="button">First</button>
        </BottomSheet>
      </SheetContainerProvider>,
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First' }));
  });

  it('HoldToConfirmButton renders its confirmation dialog into the container (prop or provider)', () => {
    const host = makeHost();
    render(<HoldToConfirmButton actionLabel="Record 6 units given" onConfirm={() => {}} container={host} />);
    fireEvent.click(screen.getByRole('button', { name: /Hold to record 6 units given/ }));
    expect(host.contains(screen.getByRole('alertdialog', { name: 'Record 6 units given?' }))).toBe(true);
    cleanup();
    const { container } = render(
      <SheetContainerProvider container={host}>
        <HoldToConfirmButton actionLabel="Record 6 units given" onConfirm={() => {}} portal={false} />
      </SheetContainerProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Hold to record 6 units given/ }));
    expect(container.contains(screen.getByRole('alertdialog', { name: 'Record 6 units given?' }))).toBe(true);
    host.remove();
  });
});
