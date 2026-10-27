import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PreviousValuesPopover } from './PreviousValuesPopover';

afterEach(cleanup);

const values = [
  { value: 140, recordedAt: '2026-10-20T08:00:00' },
  { value: 128, recordedAt: '2026-10-26T08:15:00' },
  { value: 133, recordedAt: '2026-10-26T14:30:00' },
  { value: 150, recordedAt: '2026-01-01T09:00:00' },
];

describe('PreviousValuesPopover', () => {
  it('shows the most recent values on focus, in ascending order, with times for same-day values (CNA-1260..1450)', () => {
    const { container } = render(<PreviousValuesPopover values={values} unit="mmHg"><input aria-label="Systolic" /></PreviousValuesPopover>);
    const panel = container.querySelector('.cui-previous-values__panel') as HTMLElement;
    expect(panel.hidden).toBe(true);
    fireEvent.focus(screen.getByLabelText('Systolic'));
    expect(panel.hidden).toBe(false);
    expect(screen.getByText('Previous values (mmHg)')).toBeTruthy();
    const shown = Array.from(container.querySelectorAll('.cui-previous-values__value')).map((e) => e.textContent);
    expect(shown).toEqual(['128', '133', '140']);
    expect(screen.getByText('26-Oct-2026 08:15')).toBeTruthy();
    expect(screen.getByText('20-Oct-2026')).toBeTruthy();
  });
  it('shows nothing when there are no previous values (CNA-1270)', () => {
    const { container } = render(<PreviousValuesPopover values={[]}><input aria-label="Pulse" /></PreviousValuesPopover>);
    expect(container.querySelector('.cui-previous-values__panel')).toBeNull();
  });
});
