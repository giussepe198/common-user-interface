import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { LeaveCard } from './LeaveCard';
import type { LeaveEpisode } from './LeaveCard';

afterEach(cleanup);
const now = '2026-10-28T03:00:00Z';
const base: LeaveEpisode = {
  id: 'l1',
  person: { familyName: 'Nguyen', givenName: 'Thi Lan', dateOfBirth: '1990-03-12', mrn: '004512' },
  sex: 'Female',
  status: 'on-leave',
  leaveType: 'Day leave',
  authorisedBy: 'Dr A Okafor',
  startAt: '2026-10-27T23:00:00Z',
  expectedReturnAt: '2026-10-28T06:00:00Z',
};
const tz = 'Australia/Melbourne';

describe('LeaveCard', () => {
  it('shows on leave with departure and expected return absolute then relative', () => {
    const { container } = render(<LeaveCard leave={base} now={now} timeZone={tz} region="AU" />);
    expect(container.textContent).toContain('On leave');
    expect(container.textContent).toContain('Day leave');
    expect(container.textContent).toContain('Left28-Oct-2026 10:00 AEDT');
    expect(container.textContent).toContain('Due back 28-Oct-2026 17:00 AEDT');
    expect(container.textContent).toContain('(in 3 hours)');
    expect(container.textContent).toContain('Female');
  });
  it('says overdue in words with the escalation and offers to record absence', () => {
    const onAbsent = vi.fn();
    const { container } = render(<LeaveCard leave={{ ...base, expectedReturnAt: '2026-10-28T02:00:00Z' }} now={now} timeZone={tz} onRecordAbsent={onAbsent} onRecordReturn={() => {}} />);
    expect(container.querySelector('[data-leave-state="overdue"]')).toBeTruthy();
    expect(container.textContent).toContain('Not back: overdue');
    expect(container.textContent).toContain('Was due back 28-Oct-2026 13:00 AEDT');
    expect(container.textContent).toContain('record absence without leave if they cannot be reached');
    fireEvent.click(screen.getByRole('button', { name: 'Record absence without leave' }));
    expect(onAbsent).toHaveBeenCalled();
  });
  it('shows absence without leave with elapsed time and the notification words', () => {
    const { container } = render(<LeaveCard leave={{ ...base, status: 'absent', absentSince: '2026-10-28T01:00:00Z' }} now={now} timeZone={tz} absentAction="Notify police and the nominated support person (example host words)." />);
    expect(container.textContent).toContain('Absent without leave');
    expect(container.textContent).toContain('Absent since28-Oct-2026 12:00 AEDT (2 h)');
    expect(screen.getByRole('note').textContent).toContain('Notify police');
  });
  it('takes state words from props and shows returned without a countdown', () => {
    const { container } = render(<LeaveCard leave={{ ...base, status: 'returned', returnedAt: '2026-10-28T02:30:00Z' }} now={now} timeZone={tz} stateLabels={{ returned: 'Back on the ward' }} />);
    expect(container.textContent).toContain('Back on the ward');
    expect(container.querySelector('.cui-order-countdown')).toBeNull();
  });
  it('uses the host dueState and never its own clock: past the return time but within the grace period stays on leave [suggested]', () => {
    const { container } = render(<LeaveCard leave={{ ...base, expectedReturnAt: '2026-10-28T02:00:00Z', dueState: 'on-leave' }} now={now} timeZone={tz} onRecordAbsent={() => {}} />);
    expect(container.querySelector('[data-leave-state="on-leave"]')).toBeTruthy();
    expect(container.querySelector('[data-deadline-state="calm"]')).toBeTruthy();
    expect(container.textContent).not.toContain('Not back: overdue');
    expect(screen.queryByRole('button', { name: 'Record absence without leave' })).toBeNull();
  });
  it('host dueState overdue before the clock says so is shown as overdue [suggested]', () => {
    const { container } = render(<LeaveCard leave={{ ...base, dueState: 'overdue' }} now={now} timeZone={tz} />);
    expect(container.querySelector('[data-leave-state="overdue"]')).toBeTruthy();
    expect(container.querySelector('[data-deadline-state="overdue"]')).toBeTruthy();
    expect(container.textContent).toContain('Not back: overdue');
  });
  it('showPerson false leaves the identification to the page (on the person\'s own record) [suggested]', () => {
    const { container } = render(<LeaveCard leave={base} now={now} timeZone={tz} showPerson={false} />);
    expect(container.textContent).not.toContain('NGUYEN');
    expect(container.textContent).toContain('On leave');
  });
});
