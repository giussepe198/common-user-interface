import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { InformationWindow } from './InformationWindow';

afterEach(cleanup);

const summaries = [
  { text: 'There are potential additive hypotensive effects with Lisinopril and Furosemide', source: 'Drug Interaction Checking' },
  { text: 'Dose above the usual range for age', source: 'Dose Checking' },
];

describe('InformationWindow', () => {
  it('explanation header, Summary tab first, all summaries in one window with sources (2.2, 2.3)', () => {
    render(<InformationWindow summaries={summaries} onDismiss={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Explanation' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Summary' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('(Drug Interaction Checking)')).toBeTruthy();
    expect(screen.getByText('(Dose Checking)')).toBeTruthy();
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('false');
  });

  it('hides Actions when there are none; Record Response before Dismiss, both enabled', () => {
    render(<InformationWindow summaries={summaries} />);
    expect(screen.queryByRole('button', { name: 'Actions' })).toBeNull();
    const buttons = screen.getAllByRole('button').map(b => b.textContent);
    expect(buttons.slice(-2)).toEqual(['Record Response', 'Dismiss']);
  });

  it('Details link and arrow keys switch tabs', () => {
    render(<InformationWindow summaries={summaries} details={{ rationale: 'Both lower blood pressure' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Details…' }));
    expect(screen.getByText('Both lower blood pressure')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Details' }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Summary' }).getAttribute('aria-selected')).toBe('true');
  });

  it('records the chosen action with or-type sub-options', () => {
    const onRecordResponse = vi.fn();
    render(
      <InformationWindow
        summaries={summaries}
        onRecordResponse={onRecordResponse}
        actions={[
          { id: 'a', label: 'Reduce dose', preference: 4, subOptions: [{ id: 'x', label: 'By half' }, { id: 'y', label: 'By a quarter' }], subOptionMode: 'or' },
          { id: 'b', label: 'Continue', preference: 1 },
        ]}
      />,
    );
    const toggle = screen.getByRole('button', { name: 'Actions' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect((screen.getByLabelText('By half') as HTMLInputElement).disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Reduce dose'));
    fireEvent.click(screen.getByLabelText('By half'));
    fireEvent.click(screen.getByLabelText('By a quarter'));
    fireEvent.click(screen.getByRole('button', { name: 'Record Response' }));
    expect(onRecordResponse).toHaveBeenCalledWith({ actionId: 'a', subOptionIds: ['y'] });
  });

  it('alert variant shows status, date and time; Esc dismisses', () => {
    const onDismiss = vi.fn();
    render(<InformationWindow variant="alert" status="High Priority" occurredAt={new Date(2026, 4, 27, 9, 5)} summaries={summaries} onDismiss={onDismiss} />);
    expect(screen.getByRole('heading').textContent).toBe('High Priority27-May-2026 09:05');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('resizes from the keyboard with the grip, within the minimum size, and announces the size (2.2)', () => {
    const onResize = vi.fn();
    render(<InformationWindow summaries={summaries} width={420} height={300} minWidth={320} minHeight={200} onResize={onResize} />);
    const grip = screen.getByRole('button', { name: 'Resize window' });
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(grip, { key: 'ArrowRight' });
    expect(onResize).toHaveBeenLastCalledWith({ width: 436, height: 300 });
    expect(dialog.style.width).toBe('436px');
    fireEvent.keyDown(grip, { key: 'ArrowDown', shiftKey: true });
    expect(onResize).toHaveBeenLastCalledWith({ width: 436, height: 364 });
    expect(dialog.style.height).toBe('364px');
    expect(screen.getByText('Window 436 by 364 pixels')).toBeTruthy();
    for (let i = 0; i < 10; i++) fireEvent.keyDown(grip, { key: 'ArrowLeft', shiftKey: true });
    expect(onResize).toHaveBeenLastCalledWith({ width: 320, height: 364 });
    fireEvent.keyDown(grip, { key: 'Home' });
    expect(screen.getByText('Window 320 by 200 pixels, smallest size')).toBeTruthy();
  });

  it('resizes by dragging the grip; no grip when not resizable', () => {
    const onResize = vi.fn();
    const { unmount } = render(<InformationWindow summaries={summaries} width={420} height={300} onResize={onResize} />);
    const grip = screen.getByRole('button', { name: 'Resize window' });
    fireEvent(grip, new MouseEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true }));
    fireEvent(document, new MouseEvent('pointermove', { clientX: 150, clientY: 140 }));
    fireEvent(document, new MouseEvent('pointerup'));
    expect(onResize).toHaveBeenLastCalledWith({ width: 470, height: 340 });
    unmount();
    render(<InformationWindow summaries={summaries} resizable={false} />);
    expect(screen.queryByRole('button', { name: 'Resize window' })).toBeNull();
  });
});
