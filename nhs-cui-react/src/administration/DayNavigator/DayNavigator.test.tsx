import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DayNavigator } from './DayNavigator';

afterEach(cleanup);

const TODAY = new Date(2026, 4, 27, 10, 0);
const headings = (c: HTMLElement) => Array.from(c.querySelectorAll('.cui-day-nav__date')).map(e => e.textContent);

describe('DayNavigator', () => {
  it('shows two days back, the selected day third, one forward, today labelled (MEDa-0064, 0079)', () => {
    const { container } = render(<DayNavigator today={TODAY} />);
    expect(headings(container)).toEqual(['25-May-2026', '26-May-2026', 'Today: 27-May-2026(selected day)', '28-May-2026']);
    expect(container.querySelectorAll('.cui-day-nav__day')[2].className).toContain('--selected');
    expect(container.querySelectorAll('.cui-day-nav__day')[2].getAttribute('aria-current')).toBe('date');
  });

  it('moves a day at a time; today keeps its style when not selected (MEDa-0033, 0080)', () => {
    const onChange = vi.fn();
    const { container } = render(<DayNavigator today={TODAY} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next day' }));
    expect(onChange.mock.calls[0][0].getDate()).toBe(28);
    expect(headings(container)[1]).toBe('Today: 27-May-2026');
    expect(container.querySelectorAll('.cui-day-nav__day')[1].className).toContain('--today');
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    expect(headings(container)[2]).toBe('26-May-2026(selected day)');
  });

  it('calendar opens from the selected heading; keyboard moves and selects; Go to today (MEDa-0034, 0035)', () => {
    const { container } = render(<DayNavigator today={TODAY} defaultSelectedDate={new Date(2026, 4, 20)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose a day' }));
    const grid = screen.getByRole('grid');
    expect((document.activeElement as HTMLElement).textContent).toBe('20');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect((document.activeElement as HTMLElement).textContent).toBe('21');
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect((document.activeElement as HTMLElement).textContent).toBe('28');
    fireEvent.click(document.activeElement as HTMLElement);
    expect(headings(container)[2]).toBe('28-May-2026(selected day)');
    fireEvent.click(screen.getByRole('button', { name: 'Choose a day' }));
    fireEvent.click(screen.getByRole('button', { name: 'Go to today' }));
    expect(headings(container)[2]).toBe('Today: 27-May-2026(selected day)');
  });

  it('Esc closes the calendar', () => {
    render(<DayNavigator today={TODAY} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose a day' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
