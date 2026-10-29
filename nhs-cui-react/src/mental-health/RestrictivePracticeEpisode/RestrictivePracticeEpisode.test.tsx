import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { RestrictivePracticeEpisode } from './RestrictivePracticeEpisode';
import type { RestrictivePracticeEpisodeData } from './RestrictivePracticeEpisode';

afterEach(cleanup);
const tz = 'Australia/Melbourne';
const now = '2026-10-28T03:00:00Z';
const episode: RestrictivePracticeEpisodeData = {
  id: 'ri1',
  typeLabel: 'Seclusion',
  startedAt: '2026-10-28T01:35:00Z',
  authorisedBy: 'Dr A Okafor',
  observationIntervalMinutes: 15,
  reviewIntervalMinutes: 60,
  observations: [{ id: 'o1', at: '2026-10-28T02:30:00Z', by: 'J Lee', findings: 'Settled, breathing normally' }],
  reviews: [{ id: 'r1', at: '2026-10-28T02:10:00Z', by: 'Dr A Okafor', outcome: 'Continue' }],
  missedObservations: [{ dueAt: '2026-10-28T02:05:00Z' }],
  authorisationExpiresAt: '2026-10-28T05:35:00Z',
};

describe('RestrictivePracticeEpisode', () => {
  it('shows type, start, elapsed time and the chain', () => {
    const { container } = render(<RestrictivePracticeEpisode episode={episode} now={now} timeZone={tz} />);
    expect(screen.getByRole('heading', { name: 'Seclusion' })).toBeTruthy();
    expect(container.textContent).toContain('In progress');
    expect(container.textContent).toContain('Started28-Oct-2026 12:35 AEDT');
    expect(container.textContent).toContain('Elapsed1 h 25 min');
    expect(container.textContent).toContain('Authorised byDr A Okafor');
  });
  it('times the next observation from the last one at the host interval and says overdue in words', () => {
    const { container } = render(<RestrictivePracticeEpisode episode={episode} now={now} timeZone={tz} />);
    expect(container.textContent).toContain('Observation every 15 minutes');
    expect(container.textContent).toContain('Overdue:Was due 28-Oct-2026 13:45 AEDT(15 minutes ago)record the observation');
    expect(container.textContent).toContain('Clinical review every hour');
    expect(container.textContent).toContain('Due soon:Next due 28-Oct-2026 14:10 AEDT');
  });
  it('keeps missed observations in view and lists each record with who', () => {
    const { container } = render(<RestrictivePracticeEpisode episode={episode} now={now} timeZone={tz} />);
    expect(screen.getByRole('note').textContent).toBe('1 observation missed: due 13:05 AEDT');
    expect(container.textContent).toContain('Observations (1)');
    expect(container.textContent).toContain('J Lee');
  });
  it('says continuous observation without a timer, and shows the end with the duration', () => {
    const { container, rerender } = render(<RestrictivePracticeEpisode episode={{ ...episode, continuousObservation: true }} now={now} timeZone={tz} />);
    expect(container.textContent).toContain('Continuous observation');
    rerender(<RestrictivePracticeEpisode episode={{ ...episode, endedAt: '2026-10-28T02:50:00Z' }} now={now} timeZone={tz} onEnd={() => {}} />);
    expect(container.textContent).toContain('Ended28-Oct-2026 13:50 AEDT (lasted 1 h 15 min)');
    expect(container.querySelector('.cui-order-countdown')).toBeNull();
    expect(screen.queryByRole('button', { name: 'End episode' })).toBeNull();
  });
  it('offers the actions as named buttons', () => {
    const rec = vi.fn();
    render(<RestrictivePracticeEpisode episode={episode} now={now} timeZone={tz} onRecordObservation={rec} onRecordReview={() => {}} onEnd={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Record observation' }));
    expect(rec).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'End episode' })).toBeTruthy();
  });
  it('uses the host next due times and never works out its own [suggested]', () => {
    const { container } = render(<RestrictivePracticeEpisode episode={{ ...episode, nextObservationDueAt: '2026-10-28T03:05:00Z', nextReviewDueAt: '2026-10-28T03:35:00Z' }} now={now} timeZone={tz} />);
    expect(container.textContent).toContain('Next due 28-Oct-2026 14:05 AEDT');
    expect(container.textContent).not.toContain('Was due 28-Oct-2026 13:45 AEDT');
    expect(container.textContent).toContain('Next due 28-Oct-2026 14:35 AEDT');
  });
  it('an expired authorisation from the host is overdue even before the clock passes the limit, and said without a limit [suggested]', () => {
    const { container, unmount } = render(<RestrictivePracticeEpisode episode={{ ...episode, authorisationExpired: true }} now={now} timeZone={tz} />);
    expect(container.textContent).toContain('Authorisation ended 28-Oct-2026 16:35 AEDT');
    unmount();
    render(<RestrictivePracticeEpisode episode={{ ...episode, authorisationExpiresAt: null, authorisationExpired: true }} now={now} timeZone={tz} />);
    expect(screen.getByText(/Authorisation expired: renew or end the intervention/)).toBeTruthy();
  });
  it('keeps missed reviews in view [suggested]', () => {
    render(<RestrictivePracticeEpisode episode={{ ...episode, missedReviews: [{ dueAt: '2026-10-28T02:35:00Z' }] }} now={now} timeZone={tz} />);
    expect(screen.getByText(/1 review missed:/)).toBeTruthy();
  });
  it('a host that says nothing is due gets "None due", not "No interval set" [suggested]', () => {
    render(<RestrictivePracticeEpisode episode={{ ...episode, nextObservationDueAt: null, nextReviewDueAt: null }} now={now} timeZone={tz} />);
    expect(screen.getAllByText('None due').length).toBe(2);
  });
});
