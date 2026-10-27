import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NaturalDateInput } from './NaturalDateInput';

afterEach(cleanup);
const ref = new Date(2026, 9, 27);

describe('NaturalDateInput', () => {
  it('auto-selects an exact reading and shows From/To/For to the right (CNA-0580..0610)', () => {
    const onValue = vi.fn();
    render(<NaturalDateInput referenceDate={ref} onDateValueChange={onValue} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Duration and/or date(s)' }), { target: { value: 'past 10 years' } });
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ duration: { amount: 10, unit: 'year' } }));
    expect(screen.getByText('2016 (approximate)')).toBeTruthy();
    expect(screen.getByText('present')).toBeTruthy();
    expect(document.querySelector('.cui-natural-date__part-label')?.textContent).toBe('From ');
  });
  it('offers suggestions below the field and selects one with the keyboard (CNA-0530)', () => {
    render(<NaturalDateInput referenceDate={ref} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'past 3' } });
    expect(screen.getAllByRole('option').length).toBeGreaterThan(1);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect((input as HTMLInputElement).value).toBe('past 3 years');
  });
  it('has no drop-down button on the field (CNA-0550) but can offer a separate date menu (CNA-0630)', () => {
    const { rerender } = render(<NaturalDateInput referenceDate={ref} />);
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<NaturalDateInput referenceDate={ref} showDateMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose period' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Past 5 years' }));
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('past 5 years');
    expect(screen.getByText('2021 (approximate)')).toBeTruthy();
  });
  it('asks for a choice when a numeric date is ambiguous in GB; AU and NZ read day first', () => {
    const { rerender } = render(<NaturalDateInput referenceDate={ref} region="GB" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '05/04/2008' } });
    fireEvent.click(screen.getByRole('button', { name: '04-May-2008' }));
    expect(screen.queryByRole('group', { name: 'Which date did you mean?' })).toBeNull();
    cleanup();
    render(<NaturalDateInput referenceDate={ref} region="NZ" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '05/04/2008' } });
    expect(screen.getAllByText('05-Apr-2008').length).toBeGreaterThan(0);
    expect(screen.queryByRole('group', { name: 'Which date did you mean?' })).toBeNull();
    void rerender;
  });
  it('uses the hemisphere of the region for seasons', () => {
    render(<NaturalDateInput referenceDate={ref} region="AU" defaultValue="summer 2019" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'summer 2019' } });
    expect(screen.getByText('Dec-2019 (approximate)')).toBeTruthy();
  });
  it('uses an interpret override instead of the parser', () => {
    render(<NaturalDateInput interpret={(t) => (t === 'x' ? 'Custom reading' : undefined)} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'x' } });
    expect(screen.getByText('Custom reading')).toBeTruthy();
    expect(screen.queryByRole('option')).toBeNull();
  });
});
