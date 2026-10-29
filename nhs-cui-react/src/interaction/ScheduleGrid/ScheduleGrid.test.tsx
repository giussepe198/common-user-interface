import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { ScheduleGrid, type ScheduleEvent } from './ScheduleGrid';

afterEach(cleanup);

const ZONE = 'Australia/Melbourne';
// Mon 26-Oct-2026 10:00 to 11:00 Melbourne (AEDT, +11).
const review: ScheduleEvent = { id: 'e1', title: 'Review', detail: 'Interview room 2', start: '2026-10-25T23:00:00Z', end: '2026-10-26T00:00:00Z' };
const leave: ScheduleEvent = { id: 'e2', title: 'Leave', kind: 'block', start: '2026-10-27T02:00:00Z', end: '2026-10-27T03:00:00Z', movable: false };
const days = ['2026-10-26', '2026-10-27'];
const status = () => screen.getAllByRole('status').map(s => s.textContent).join(' ');

function Grid(props: Partial<React.ComponentProps<typeof ScheduleGrid>>) {
  return <ScheduleGrid label="Diary" days={days} events={[review, leave]} timeZone={ZONE} onMove={() => undefined} {...props} />;
}

describe('ScheduleGrid', () => {
  it('draws times in the stated zone and says which (DND-0610)', () => {
    render(<Grid />);
    expect(screen.getByText('Times are Australia/Melbourne time.')).toBeTruthy();
    expect(screen.getByText('10:00 to 11:00')).toBeTruthy();
    expect(screen.getByText('Mon 26-Oct-2026')).toBeTruthy();
  });

  it('a keyboard move previews the new time and asks to confirm with the warnings and stops (DND-0020, DND-0310)', async () => {
    const onMove = vi.fn();
    const checkMove = vi.fn().mockResolvedValue({ warnings: ['Alex Chen already has an appointment 11:00 to 11:30.'] });
    render(<Grid onMove={onMove} checkMove={checkMove} />);
    const handle = screen.getByRole('button', { name: 'Move Review, Mon 26-Oct 10:00' });
    fireEvent.keyDown(handle, { key: ' ' });
    expect(status()).toMatch(/Picked up Review, Mon 26-Oct 10:00, Mon 26-Oct-2026 10:00 to 11:00\./);
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(status()).toMatch(/Moved to Tue 27-Oct-2026 11:00 to 12:00\./);
    await act(async () => {
      fireEvent.keyDown(handle, { key: 'Enter' });
    });
    const dialog = screen.getByRole('alertdialog', { name: 'Move this appointment?' });
    expect(within(dialog).getByText('Mon 26-Oct-2026 10:00 to 11:00')).toBeTruthy();
    expect(within(dialog).getByText(/Tue 27-Oct-2026 11:00 to 12:00/)).toBeTruthy();
    expect(within(dialog).getByText(/Warning: Alex Chen already has an appointment/)).toBeTruthy();
    expect(onMove).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Move anyway' }));
    });
    expect(onMove).toHaveBeenCalledTimes(1);
    const proposal = onMove.mock.calls[0]![1];
    expect(proposal.start.toISOString()).toBe('2026-10-27T00:00:00.000Z');
    expect(proposal.end.toISOString()).toBe('2026-10-27T01:00:00.000Z');
    expect(checkMove.mock.calls[0]![1].span).toEqual({ date: '2026-10-27', start: 660, end: 720 });
  });

  it('a stop blocks the move (a room clash)', async () => {
    const onMove = vi.fn();
    render(<Grid onMove={onMove} checkMove={() => ({ stops: ['Interview room 2 is booked 10:15 to 11:15.'] })} />);
    fireEvent.click(screen.getByRole('button', { name: /Move options for Review/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '15 minutes later' }));
    });
    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText(/Cannot move: Interview room 2 is booked/)).toBeTruthy();
    expect((within(dialog).getByRole('button', { name: 'Move' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the refusal and keeps the old time when onMove refuses (DND-0320)', async () => {
    render(<Grid onMove={() => Promise.resolve('someone changed this appointment; reload to see it')} />);
    fireEvent.click(screen.getByRole('button', { name: /Move options for Review/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '15 minutes earlier' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Move' }));
    });
    expect(screen.getByRole('alert').textContent).toMatch(/Not moved: someone changed this appointment/);
    expect(screen.getByText('10:00 to 11:00')).toBeTruthy();
  });

  it('Escape cancels a keyboard move and nothing is proposed', () => {
    render(<Grid />);
    const handle = screen.getByRole('button', { name: 'Move Review, Mon 26-Oct 10:00' });
    fireEvent.keyDown(handle, { key: 'Enter' });
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    fireEvent.keyDown(handle, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(status()).toMatch(/Move cancelled/);
  });

  it('the end handle changes the length by a slot with the keyboard (DND-0620)', async () => {
    const onMove = vi.fn();
    render(<Grid onMove={onMove} />);
    const end = screen.getByRole('button', { name: 'Change the end of Review, now 11:00' });
    fireEvent.keyDown(end, { key: ' ' });
    fireEvent.keyDown(end, { key: 'ArrowUp' });
    fireEvent.keyDown(end, { key: 'ArrowUp' });
    fireEvent.keyDown(end, { key: 'ArrowUp' });
    fireEvent.keyDown(end, { key: 'ArrowUp' });
    fireEvent.keyDown(end, { key: 'ArrowUp' });
    expect(status()).toMatch(/Moved to ends 10:15\./);
    await act(async () => {
      fireEvent.keyDown(end, { key: ' ' });
    });
    const dialog = screen.getByRole('alertdialog', { name: 'Change the length of this appointment?' });
    expect(within(dialog).getByText(/10:00 to 10:15 \(15 minutes\)/)).toBeTruthy();
  });

  it('opens Move to... as the alternative to dragging (WCAG 2.5.7)', () => {
    render(<Grid />);
    fireEvent.click(screen.getByRole('button', { name: /Move options for Review/ }));
    expect(screen.getByRole('dialog', { name: 'Move this appointment to' })).toBeTruthy();
    expect(screen.getByLabelText('Day')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Quick changes' })).toBeTruthy();
  });

  it('a user who may not move sees no handle and no Move options (DND-0410)', () => {
    render(<Grid onMove={undefined} />);
    expect(screen.queryByRole('button', { name: /^Move / })).toBeNull();
    expect(screen.queryByRole('button', { name: /Move options/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Change the end/ })).toBeNull();
    expect(screen.getByText('Review')).toBeTruthy();
  });

  it('in AU a move to 00:00 warns (AU-DT-06)', async () => {
    const late: ScheduleEvent = { id: 'e3', title: 'Call', start: '2026-10-26T12:15:00Z', end: '2026-10-26T12:45:00Z' };
    render(
      <ClinicalLocaleProvider region="AU" timeZone={ZONE}>
        <ScheduleGrid label="Diary" days={['2026-10-26']} events={[late]} dayStart={20 * 60} dayEnd={24 * 60} onMove={() => undefined} />
      </ClinicalLocaleProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Move options for Call/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '15 minutes longer' }));
    });
    expect(screen.getByText(/Warning: A time of 00:00 can be misread/)).toBeTruthy();
  });
});
