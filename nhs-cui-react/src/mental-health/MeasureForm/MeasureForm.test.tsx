import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MeasureForm } from './MeasureForm';
import type { MhMeasureInstrument } from '../utils/mentalHealthCare';

afterEach(cleanup);
// Placeholder labels only: no licensed item wording (HoNOS-like shape: 0 to 4 plus 9 not known).
const inst: MhMeasureInstrument = {
  id: 'ex',
  name: 'Clinician rated example',
  items: [1, 2, 3].map((n) => ({ id: `i${n}`, label: `Item ${n}` })),
  options: [
    ...[0, 1, 2, 3, 4].map((v) => ({ value: v, label: String(v) })),
    { value: 9, label: 'Not known', excludeFromTotal: true },
  ],
  maxMissingItems: 1,
  bands: [{ from: 0, to: 4, label: 'Lower (example band)' }, { from: 5, to: 12, label: 'Higher (example band)' }],
};

describe('MeasureForm', () => {
  it('renders one radio group per item with the options and a total', () => {
    render(<MeasureForm instrument={inst} defaultValue={{ i1: 2, i2: 3, i3: 1 }} />);
    expect(screen.getAllByRole('radiogroup').length).toBe(3);
    expect(screen.getByRole('radiogroup', { name: 'Item 2' })).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('Higher (example band)')).toBeTruthy();
    expect(screen.getByText('3 of 3 answered')).toBeTruthy();
  });
  it('excludes not known from the total and says the total is partial', () => {
    const { container } = render(<MeasureForm instrument={inst} defaultValue={{ i1: 2, i2: 9, i3: 1 }} />);
    expect(container.textContent).toContain('Partial total: 1 not counted');
    expect(container.textContent).toContain('3');
  });
  it('blocks saving when too many items are missing and lists them with links', () => {
    const onSubmit = vi.fn();
    render(<MeasureForm instrument={inst} defaultValue={{ i1: 2 }} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save measure' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('Total not valid: 2 not answered; at most 1 allowed');
    expect(screen.getByRole('button', { name: 'Item 2' })).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: /Not answered: Item 3/ }).getAttribute('aria-invalid')).toBe('true');
  });
  it('saves with the answers and the score when valid', () => {
    const onSubmit = vi.fn();
    render(<MeasureForm instrument={inst} onSubmit={onSubmit} />);
    const [first] = screen.getAllByRole('radio');
    fireEvent.click(first);
    const groups = screen.getAllByRole('radiogroup');
    fireEvent.click(groups[1].querySelectorAll('input')[4]);
    fireEvent.click(groups[2].querySelectorAll('input')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Save measure' }));
    expect(onSubmit).toHaveBeenCalledWith({ i1: 0, i2: 4, i3: 0 }, expect.objectContaining({ total: 4, status: 'complete' }));
  });
  it('moves between rows in the same column with the up and down arrows', () => {
    render(<MeasureForm instrument={inst} />);
    const groups = screen.getAllByRole('radiogroup');
    const r = groups[0].querySelectorAll('input')[2] as HTMLInputElement;
    r.focus();
    fireEvent.keyDown(r, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(groups[1].querySelectorAll('input')[2]);
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(r);
  });
  it('with totalPending shows the host words in place of a total and never blocks saving on its own count', () => {
    const onSubmit = vi.fn();
    const { container } = render(<MeasureForm instrument={inst} defaultValue={{ i1: 2 }} onSubmit={onSubmit} totalPending="Worked out when the measure is recorded" />);
    expect(container.textContent).toContain('Worked out when the measure is recorded');
    expect(container.textContent).not.toContain('Total not valid');
    fireEvent.click(screen.getByRole('button', { name: 'Save measure' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Items not answered');
  });
});
