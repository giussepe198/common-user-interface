import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalendarPicker } from './CalendarPicker';

afterEach(cleanup);
const today = new Date(2008, 3, 10);
const focused = () => (document.activeElement as HTMLElement).getAttribute('data-date');

describe('CalendarPicker', () => {
  it('shows the month and year, Mon-Sun headings, today and Today/Close (D+Tc-0011..0015)', () => {
    render(<CalendarPicker value={{ kind: 'full', year: 2008, month: 4, day: 5 }} today={today} onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByText('April')).toBeTruthy();
    expect(screen.getByText('2008')).toBeTruthy();
    expect(screen.getAllByRole('columnheader').map(h => h.textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    expect(document.querySelector('[aria-current="date"]')?.getAttribute('data-date')).toBe('2008-04-10');
    expect(screen.getByRole('button', { name: 'Today' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
    expect(focused()).toBe('2008-04-05');
  });
  it('moves by day, week, month and year from the keyboard (D+Tc-0019)', () => {
    render(<CalendarPicker value={{ kind: 'full', year: 2008, month: 4, day: 5 }} today={today} onSelect={() => {}} />);
    const grid = screen.getByRole('grid');
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(focused()).toBe('2008-04-06');
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(focused()).toBe('2008-04-13');
    fireEvent.keyDown(grid, { key: 'ArrowUp' });
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(focused()).toBe('2008-04-05');
    fireEvent.keyDown(grid, { key: 'PageDown' });
    expect(focused()).toBe('2008-05-05');
    fireEvent.keyDown(grid, { key: 'PageUp', shiftKey: true });
    expect(focused()).toBe('2007-05-05');
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(focused()).toBe('2007-04-30');
    fireEvent.keyDown(grid, { key: 'End' });
    expect(focused()).toBe('2007-05-06');
  });
  it('navigates months and years independently and selects partial dates from the header', () => {
    const onSelect = vi.fn();
    render(<CalendarPicker value={null} today={today} allowMonthYear allowYear onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    fireEvent.click(screen.getByRole('button', { name: 'March' }));
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'monthYear', year: 2009, month: 3 });
    fireEvent.click(screen.getByRole('button', { name: '2009' }));
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'year', year: 2009 });
  });
  it('selects a day or today and closes on Esc', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<CalendarPicker value={null} today={today} onSelect={onSelect} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Friday 18 April 2008/ }));
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'full', year: 2008, month: 4, day: 18 });
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onSelect).toHaveBeenLastCalledWith({ kind: 'full', year: 2008, month: 4, day: 10 });
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
  it('uses Thur in the AU day headings', () => {
    render(<CalendarPicker value={null} today={today} onSelect={() => {}} region="AU" />);
    expect(screen.getAllByRole('columnheader')[3].textContent).toBe('Thur');
  });
});
