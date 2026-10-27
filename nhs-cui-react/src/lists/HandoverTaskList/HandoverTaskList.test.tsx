import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { HandoverTaskList } from './HandoverTaskList';

afterEach(cleanup);

const patients = [
  { id: 'p1', familyName: 'Smith', givenName: 'John', dateOfBirth: '1948-03-12', nhsNumber: '9990000018', responsible: { name: 'Dr A', role: 'FY1' }, handoverState: 'toHandOver' as const },
  { id: 'p2', familyName: 'Smith', givenName: 'John', dateOfBirth: '1971-07-30', nhsNumber: '9990000034' },
];
const tasks = [
  { id: 't1', patientId: 'p1', description: 'Repeat U&E', status: 'incomplete', due: '2026-10-27T10:00' },
  { id: 't2', patientId: 'p1', description: 'Chase X-ray', status: 'complete' },
];

describe('HandoverTaskList', () => {
  it('flags overdue tasks, unassigned patients and identical names for read-back (RID 53, 64, 108)', () => {
    render(<HandoverTaskList patients={patients} tasks={tasks} now="2026-10-27T12:00" />);
    expect(screen.getByText('Overdue, was due')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/1 patient has no one responsible/);
    expect(screen.getAllByText('Another patient on this list is called SMITH, John: confirm date of birth').length).toBe(2);
    expect(screen.getAllByText('NHS No.').length).toBe(2);
  });
  it('hides completed tasks on request and removes them manually (RID 104, 122)', () => {
    const onRemoveTask = vi.fn();
    render(<HandoverTaskList patients={patients} tasks={tasks} now="2026-10-27T12:00" onRemoveTask={onRemoveTask} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove from list: Chase X-ray' }));
    expect(onRemoveTask).toHaveBeenCalledWith('t2');
    fireEvent.click(screen.getByLabelText('Hide completed tasks'));
    expect(screen.queryByText('Chase X-ray')).toBeNull();
    expect(screen.getByText(/1 completed task hidden/)).toBeTruthy();
  });
  it('NZ: NHI and names as recorded; Kāhu and Kahu are flagged as similar', () => {
    render(
      <HandoverTaskList
        region="NZ"
        patients={[
          { id: 'a', familyName: 'Te Huia', givenName: 'Kāhu', nhi: 'ZAC5361', responsible: { name: 'Dr A' } },
          { id: 'b', familyName: 'Te Huia', givenName: 'Kahu', nhi: 'ZBN77VL', responsible: { name: 'Dr A' } },
        ]}
        tasks={[]}
      />,
    );
    expect(screen.getByText('ZAC5361')).toBeTruthy();
    expect(screen.getAllByText('NHI').length).toBe(2);
    expect(screen.getByText(/has a name like Te Huia, Kāhu: confirm given name/)).toBeTruthy();
  });
  it('similarNames: GB and AU flag SMITH John and SMITH Jon with the consumer test (PAL-0560)', () => {
    const jj = [
      { id: 'a', familyName: 'Smith', givenName: 'John', dateOfBirth: '1948-03-12', nhsNumber: '9990000018', ihi: '8003608166690503', responsible: { name: 'Dr A' } },
      { id: 'b', familyName: 'Smith', givenName: 'Jon', dateOfBirth: '1971-07-30', nhsNumber: '9990000034', ihi: '8003608833357361', responsible: { name: 'Dr A' } },
    ];
    const similarNames = (x: { familyName?: string | null; givenName?: string | null }, y: { familyName?: string | null; givenName?: string | null }) =>
      (x.familyName ?? '').toLowerCase() === (y.familyName ?? '').toLowerCase() &&
      (x.givenName ?? '').toLowerCase().replace(/h/g, '') === (y.givenName ?? '').toLowerCase().replace(/h/g, '');
    const { unmount } = render(<HandoverTaskList region="GB" patients={jj} tasks={[]} />);
    expect(screen.queryByText(/has a name like/)).toBeNull();
    unmount();
    render(<HandoverTaskList region="GB" patients={jj} tasks={[]} similarNames={similarNames} />);
    expect(screen.getByText('Another patient on this list has a name like SMITH, John: confirm given name')).toBeTruthy();
    expect(screen.getByText('Another patient on this list has a name like SMITH, Jon: confirm given name')).toBeTruthy();
    cleanup();
    render(<HandoverTaskList region="AU" patients={jj} tasks={[]} similarNames={similarNames} />);
    expect(screen.getAllByText(/has a name like SMITH, Jo/).length).toBe(2);
  });
  it('similarNames receives the full HandoverPatient objects', () => {
    const spy = vi.fn(() => false);
    render(<HandoverTaskList patients={[{ ...patients[0], location: 'Bay 1' }, { ...patients[1], givenName: 'Jon' }]} tasks={[]} similarNames={spy} />);
    expect(spy).toHaveBeenCalled();
    const calls = spy.mock.calls as unknown as Array<[{ location?: string }, unknown]>;
    expect(calls.some(c => c[0].location === 'Bay 1')).toBe(true);
  });
});
