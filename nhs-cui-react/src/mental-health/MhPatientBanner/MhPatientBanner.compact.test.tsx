import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MhPatientBanner } from './MhPatientBanner';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';
const name = { familyName: 'Nguyen', givenName: 'Thi Lan' };

/** The compact form while a panel or dialog opens below the banner [suggested]. */
describe('MhPatientBanner compact', () => {
  it('compact on a phone keeps every identity and safety item, holds the open details closed and gives them back after', async () => {
    const props = { layout: 'phone' as const, name, preferredName: 'Lan', now: NOW, dateOfBirth: '1990-03-12', sex: 'Female', recordNumber: '004512', legalStatuses: [{ state: 'current' as const, label: 'Treatment order' }], alerts: [{ id: '1', severity: 'high' as const, text: 'x' }, { id: '2', severity: 'low' as const, text: 'y' }], onShowAllAlerts: () => {}, allergies: { status: 'known' as const, items: [{ name: 'Penicillin' }] } };
    const { container, rerender } = render(<MhPatientBanner {...props} />);
    await waitFor(() => expect(container.querySelector('.cui-mobile-header')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Show all patient details' }));
    const alerts = container.querySelector<HTMLElement>('[data-banner-item="alerts"]')!;
    alerts.focus();
    rerender(<MhPatientBanner {...props} compact />);
    const root = container.querySelector('.cui-mh-banner')!;
    expect(root.classList.contains('cui-mh-banner--compact')).toBe(true);
    expect(root.classList.contains('cui-mh-banner--open')).toBe(false);
    expect(container.querySelector('.cui-mh-banner__phone-details')!.hasAttribute('hidden')).toBe(true);
    // Every identity and safety item is still there, the same element, so focus on a band item stays put.
    for (const id of ['sex', 'record-number', 'legal-status', 'alerts']) expect(container.querySelector(`[data-banner-item="${id}"]`)).toBeTruthy();
    expect(container.querySelector('[data-banner-item="alerts"]')).toBe(alerts);
    expect(document.activeElement).toBe(alerts);
    expect(alerts.textContent).toContain('1 high, 1 other');
    expect(root.textContent).toContain('NGUYEN');
    expect(root.textContent).toContain('12-Mar-1990');
    expect(root.textContent).toContain('Penicillin');
    rerender(<MhPatientBanner {...props} />);
    expect(container.querySelector('.cui-mh-banner__phone-details')!.hasAttribute('hidden')).toBe(false);
  });
  it('compact on a wide banner keeps Zone 2 collapsed and restores it after', () => {
    const props = { layout: 'desktop' as const, name, now: NOW, alerts: [{ id: '1', severity: 'high' as const, text: 'x' }], address: { lines: ['14 Smith St'], town: 'Fitzroy', state: 'VIC', postcode: '3065' } };
    const { container, rerender } = render(<MhPatientBanner {...props} />);
    const toggle = () => screen.getByRole('button', { name: /patient details/ });
    fireEvent.click(toggle());
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    rerender(<MhPatientBanner {...props} compact />);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-banner-item="alerts"]')?.textContent).toContain('1 high');
    rerender(<MhPatientBanner {...props} />);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });
});
