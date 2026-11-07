import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LegalOrderCard } from './LegalOrderCard';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';

describe('LegalOrderCard', () => {
  it('shows the order, dates in the jurisdiction zone, conditions, clinician and actions', () => {
    render(
      <LegalOrderCard
        orderType="Community treatment order"
        startedAt="2026-08-14T00:00:00Z"
        expiresAt="2026-11-14T06:00:00Z"
        reviewAt="2026-11-01T00:00:00Z"
        hearingAt="2026-11-05T23:30:00Z"
        conditions={['Attend appointments', 'Take medicine as prescribed']}
        responsibleClinician={{ name: 'Dr A Example', role: 'Authorised psychiatrist' }}
        timeZone="Australia/Melbourne"
        now={NOW}
        actions={<button type="button">Record outcome</button>}
      />,
    );
    expect(screen.getByRole('heading', { name: /Community treatment order/ })).toBeTruthy();
    expect(screen.getByText('14-Aug-2026 10:00 AEST')).toBeTruthy();
    expect(screen.getByText('Expires 14-Nov-2026 17:00 AEDT')).toBeTruthy();
    expect(screen.getByText('06-Nov-2026 10:30 AEDT')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('(Authorised psychiatrist)', { exact: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Record outcome' })).toBeTruthy();
  });
  it('never leaves a slot blank', () => {
    render(<LegalOrderCard orderType="Assessment order" timeZone="Australia/Melbourne" now={NOW} />);
    expect(screen.getAllByText('Not recorded').length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText('No conditions recorded')).toBeTruthy();
  });
  it('an unconfirmed order says so in the heading', () => {
    render(<LegalOrderCard orderType="Treatment order" state="unconfirmed" unconfirmedWarning="Order may have expired, status not confirmed" timeZone="Australia/Melbourne" now={NOW} />);
    expect(screen.getByRole('heading').textContent).toContain('Order may have expired, status not confirmed');
  });
  it('takes label words from the host', () => {
    render(<LegalOrderCard orderType="Compulsory treatment order" labels={{ hearing: 'Tribunal hearing' }} timeZone="Pacific/Auckland" now={NOW} />);
    expect(screen.getByText('Tribunal hearing')).toBeTruthy();
  });
  it('shows only the facts asked for, so a summary never says "Not recorded" for a fact it was not given', () => {
    render(<LegalOrderCard orderType="Treatment order" expiresAt="2026-11-14T06:00:00Z" facts={['expires']} timeZone="Australia/Melbourne" now={NOW} />);
    expect(screen.getByText('Expires 14-Nov-2026 17:00 AEDT')).toBeTruthy();
    expect(screen.queryByText('Not recorded')).toBeNull();
    expect(screen.queryByText('No conditions recorded')).toBeNull();
  });
});
