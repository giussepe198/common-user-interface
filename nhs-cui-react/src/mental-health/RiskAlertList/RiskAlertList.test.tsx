import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { RiskAlertList } from './RiskAlertList';
import type { RiskAlertData } from '../RiskAlertItem/RiskAlertItem';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';
const alerts: RiskAlertData[] = [
  { id: 'l1', category: 'Communication', severity: 'low', text: 'Hearing aid' },
  { id: 'm1', category: 'Risk to self', severity: 'moderate', text: 'Recent self-harm' },
  { id: 'h1', category: 'Safety to staff', severity: 'high', text: 'Two staff for home visits' },
  { id: 'm2', category: 'Risk from others', severity: 'moderate', text: 'Family violence' },
  { id: 'h2', category: 'Risk to others', severity: 'high', text: 'Do not visit alone' },
];

describe('RiskAlertList', () => {
  it('orders high, moderate, low', () => {
    render(<RiskAlertList alerts={alerts} now={NOW} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem').map((li) => li.textContent ?? '');
    expect(items[0]).toContain('Safety to staff');
    expect(items[1]).toContain('Risk to others');
    expect(items[2]).toContain('Risk to self');
    expect(items[4]).toContain('Communication');
  });
  it('limits only moderate and low alerts and offers the rest as a button', () => {
    render(<RiskAlertList alerts={alerts} maxVisible={1} now={NOW} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    const more = screen.getByRole('button', { name: 'and 2 more alerts' });
    fireEvent.click(more);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
  it('hands overflow to the host when onShowAll is given', () => {
    const onShowAll = vi.fn();
    render(<RiskAlertList alerts={alerts} maxVisible={0} onShowAll={onShowAll} now={NOW} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'and 3 more alerts' }));
    expect(onShowAll).toHaveBeenCalled();
  });
  it('says "No alerts recorded" when empty, never a blank', () => {
    render(<RiskAlertList alerts={[]} />);
    expect(screen.getByText('No alerts recorded')).toBeTruthy();
  });
  it('has no dismiss control', () => {
    render(<RiskAlertList alerts={alerts} now={NOW} />);
    expect(screen.queryByRole('button', { name: /dismiss|close|hide/i })).toBeNull();
  });
  it('passes acknowledgement through for unacknowledged high alerts', () => {
    const onAck = vi.fn();
    render(<RiskAlertList alerts={alerts} unacknowledgedIds={['h2']} onAcknowledge={onAck} now={NOW} />);
    fireEvent.click(screen.getByRole('button', { name: /^Acknowledge alert: Risk to others/ }));
    expect(onAck).toHaveBeenCalledWith('h2');
  });
});
