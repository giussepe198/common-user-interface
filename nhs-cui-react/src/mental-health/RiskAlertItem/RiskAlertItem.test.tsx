import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RiskAlertItem } from './RiskAlertItem';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';
const base = { id: 'a1', category: 'Safety to staff', severity: 'high' as const, text: 'Two staff for home visits' };

describe('RiskAlertItem', () => {
  it('leads with the severity word and the category, with the CUI alert symbol', () => {
    const { container } = render(<RiskAlertItem alert={base} now={NOW} timeZone="Australia/Melbourne" />);
    expect(screen.getByText('High alert:')).toBeTruthy();
    expect(screen.getByText('Safety to staff')).toBeTruthy();
    expect(container.querySelector('.cui-alert-symbol--prohibition')).toBeTruthy();
  });
  it('high and moderate differ in symbol shape, not hue alone', () => {
    const { container } = render(<RiskAlertItem alert={{ ...base, severity: 'moderate' }} now={NOW} />);
    expect(container.querySelector('.cui-alert-symbol--warning')).toBeTruthy();
    expect(screen.getByText('Medium alert:')).toBeTruthy();
  });
  it('never shows a numeric risk level', () => {
    const { container } = render(<RiskAlertItem alert={{ ...base, levelLabel: '7/10' }} now={NOW} />);
    expect(container.textContent).not.toContain('7/10');
    expect(screen.getByText(/never shown as a number/)).toBeTruthy();
  });
  it('shows the clinician word when it is words', () => {
    render(<RiskAlertItem alert={{ ...base, levelLabel: 'High (clinician judgement)' }} now={NOW} />);
    expect(screen.getByText('High (clinician judgement)')).toBeTruthy();
  });
  it('never uses the success (green) tokens', () => {
    const { container } = render(<RiskAlertItem alert={{ ...base, severity: 'low' }} now={NOW} />);
    expect(container.innerHTML).not.toMatch(/success/);
  });
  it('says "Review overdue" once the review date has passed, and who recorded it', () => {
    render(<RiskAlertItem alert={{ ...base, reviewDue: '2026-10-01T00:00:00Z', recordedBy: 'J Clinician', recordedAt: '2026-07-01T00:00:00Z' }} now={NOW} timeZone="Australia/Melbourne" />);
    expect(screen.getByText('Review overdue (due 01-Oct-2026)')).toBeTruthy();
    expect(screen.getByText('Recorded by J Clinician 01-Jul-2026 10:00 AEST')).toBeTruthy();
  });
  it('an unacknowledged high alert is expanded and acknowledged by name', () => {
    const onAck = vi.fn();
    render(<RiskAlertItem alert={base} needsAcknowledgement onAcknowledge={onAck} now={NOW} />);
    expect(screen.getByText('High alert. Read before you continue.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Acknowledge alert: Safety to staff: Two staff for home visits' }));
    expect(onAck).toHaveBeenCalledWith('a1');
  });
});
