import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { FactList } from './FactList';

afterEach(cleanup);

describe('FactList', () => {
  it('lists label and value pairs through LabelledValue, removing a trailing colon (PAB-0042)', () => {
    const { container } = render(<FactList aria-label="Referral details" items={[{ label: 'Source:', value: 'GP' }, { label: 'Received', value: '20-Oct-2026' }]} />);
    expect(screen.getByRole('list', { name: 'Referral details' })).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Source')).toBeTruthy();
    expect(container.querySelectorAll('.cui-labelled-value')).toHaveLength(2);
    expect(container.querySelector('.cui-fact-list--grid')).toBeTruthy();
  });
  it('never shows "?" or a blank for a missing value (PAB-0019)', () => {
    render(<FactList items={[{ label: 'Team', value: '?' }, { label: 'Keyworker', value: '', unknownText: 'Not recorded' }]} />);
    expect(screen.getByText('Not Known')).toBeTruthy();
    expect(screen.getByText('Not recorded')).toBeTruthy();
  });
  it('opens part of the record from a value (PAB-0048) and supports the rows layout', () => {
    const onOpenRecord = vi.fn();
    const { container } = render(<FactList layout="rows" items={[{ label: 'Episode', value: 'Community', onOpenRecord }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Community' }));
    expect(onOpenRecord).toHaveBeenCalled();
    expect(container.querySelector('.cui-fact-list--rows')).toBeTruthy();
  });
});
