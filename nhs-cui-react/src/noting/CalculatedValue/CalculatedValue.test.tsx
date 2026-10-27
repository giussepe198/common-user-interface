import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalculatedValue, OutOfRangeMarker } from './CalculatedValue';

afterEach(cleanup);

describe('CalculatedValue', () => {
  it('shows the value as read-only output, never an editable field (CNA-1490/1500)', () => {
    render(<CalculatedValue label="NEWS2 score" value={3} meaning="Low risk" />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByText('3').tagName).toBe('OUTPUT');
    expect(screen.getByText('Low risk')).toBeTruthy();
  });
  it('labels a partial score (CNA-1640) and says when it cannot be calculated (CNA-1650)', () => {
    const { rerender } = render(<CalculatedValue label="NEWS2" value={2} status="partial" />);
    expect(screen.getByText('Partial score: values missing')).toBeTruthy();
    rerender(<CalculatedValue label="NEWS2" status="cannotCalculate" />);
    expect(screen.getByText('Cannot be calculated: values missing')).toBeTruthy();
  });
  it('opens details with contributors and focuses the details button; Escape closes (CNA-1540..1600)', () => {
    const onOpenDetails = vi.fn();
    render(<CalculatedValue label="NEWS2" value={5} contributors={[{ label: 'Pulse', value: 120, outOfRange: 'high' }, { label: 'SpO2' }]} onOpenDetails={onOpenDetails} />);
    fireEvent.click(screen.getByRole('button', { name: 'NEWS2' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.activeElement?.textContent).toBe('Details of scoring');
    expect(screen.getByText('Missing')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('out-of-range marker has text, not colour alone (CNA-1610)', () => {
    render(<OutOfRangeMarker direction="low" />);
    expect(screen.getByText('Below normal range')).toBeTruthy();
  });
});
