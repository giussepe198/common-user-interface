import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SupportPersonList } from './SupportPersonList';
import type { SupportPerson } from './SupportPersonList';

afterEach(cleanup);
const people: SupportPerson[] = [
  { id: 'a', name: 'Linh Nguyen', relationship: 'Sister', roles: [{ label: 'Carer' }, { label: 'Nominated support person', legal: true }], phones: [{ label: 'Mobile', value: '0491570159' }], sharing: { state: 'allowed', text: 'Appointments and the plan' }, primary: true },
  { id: 'b', name: 'Te Whare whānau', roles: [{ label: 'Whānau' }], members: ['Aroha', 'Māia'] },
  { id: 'c', name: 'Former guardian', roles: [{ label: 'Guardian', legal: true }], ended: { date: '2026-05-01', reason: 'Order ended' } },
];

describe('SupportPersonList', () => {
  it('shows names, role words, relationship, numbers and what each may be told', () => {
    const { container } = render(<SupportPersonList people={people} region="AU" />);
    expect(screen.getByText('Nominated support person').className).toContain('legal');
    expect(screen.getByText('0491 570 159')).toBeTruthy();
    expect(screen.getByText('Appointments and the plan')).toBeTruthy();
    expect(container.textContent).toContain('Primary contact');
    expect(container.textContent).toContain('Members: Aroha, Māia');
  });
  it('never reads missing sharing as allowed', () => {
    const { container } = render(<SupportPersonList people={people} />);
    expect(container.querySelectorAll('[data-consent-state="not-recorded"]').length).toBe(1);
    expect(screen.getByText('Sharing preferences not recorded')).toBeTruthy();
  });
  it('hides ended links with a count, and shows them with the date and reason on request', () => {
    const { rerender } = render(<SupportPersonList people={people} timeZone="Australia/Melbourne" />);
    expect(screen.getByText('1 ended not shown')).toBeTruthy();
    rerender(<SupportPersonList people={people} showEnded timeZone="Australia/Melbourne" />);
    expect(screen.getByText('Ended 01-May-2026: Order ended')).toBeTruthy();
  });
  it('opens a person from the name button and adds one', () => {
    const onOpen = vi.fn();
    const onAdd = vi.fn();
    render(<SupportPersonList people={people} onOpen={onOpen} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Linh Nguyen' }));
    expect(onOpen).toHaveBeenCalledWith(people[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Add support person' }));
    expect(onAdd).toHaveBeenCalled();
  });
  it('shows safety notices first, more facts, the host actions and content, and can leave sharing to another screen', () => {
    const person: SupportPerson = {
      id: 'd',
      name: 'Sam Lee',
      roles: [{ label: 'Emergency contact' }],
      notices: [
        { tone: 'danger', title: 'Do not contact', text: 'Not safe to contact' },
        { tone: 'warning', title: 'Do not involve' },
      ],
      phones: [{ label: 'Mobile', value: '0491570159' }],
      details: [{ id: 'since', label: 'Linked since', value: '01-Mar-2026' }],
      actions: <button type="button">End link: Sam Lee</button>,
      content: <p>Nominated person role</p>,
    };
    const { container } = render(<SupportPersonList people={[person]} showSharing={false} region="AU" />);
    const notices = container.querySelectorAll('.cui-support-people__notice');
    expect(notices).toHaveLength(2);
    expect(notices[0].className).toContain('--danger');
    expect(notices[0].textContent).toBe('Do not contactNot safe to contact');
    expect(screen.getByText('Linked since')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'End link: Sam Lee' })).toBeTruthy();
    expect(screen.getByText('Nominated person role')).toBeTruthy();
    expect(container.textContent).not.toContain('May be told');
    expect(screen.getByText('0491 570 159').closest('a')).toBeNull();
  });
});
