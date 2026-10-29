import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ContactEntry, contactDurationMinutes } from './ContactEntry';

afterEach(cleanup);
const contact = {
  startAt: '2026-10-28T03:00:00Z',
  durationMinutes: 50,
  contactType: 'Face to face',
  setting: 'Home visit',
  participants: ['The person', 'Carer'],
  author: 'J Lee',
  note: 'Talked about the week.',
};
const types = [{ value: 'f2f', label: 'Face to face' }, { value: 'phone', label: 'Phone' }];

describe('ContactEntry', () => {
  it('view: one dense header line with date, time, duration, type and setting, then who and the note', () => {
    const { container } = render(<ContactEntry contact={contact} timeZone="Australia/Melbourne" />);
    expect(container.querySelector('.cui-contact-entry__line')?.textContent).toBe('28-Oct-2026 14:00 AEDT50 minFace to faceHome visit');
    expect(container.textContent).toContain('With: The person, Carer');
    expect(container.textContent).toContain('By: J Lee');
    expect(container.textContent).toContain('Talked about the week.');
  });
  it('view: entered in error stays visible with the reason and no edit', () => {
    render(<ContactEntry contact={{ ...contact, enteredInError: { reason: 'Wrong person' } }} onEdit={() => {}} />);
    expect(screen.getByText('Entered in error: Wrong person')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });
  it('edit: blocks saving until date, time, duration and type are given, with messages', () => {
    const onSave = vi.fn();
    render(<ContactEntry mode="edit" contactTypes={types} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Complete the date, start time, duration and contact type to save')).toBeTruthy();
    expect(screen.getByText('Choose the contact type')).toBeTruthy();
  });
  it('edit: saves a complete draft with participants and the note', () => {
    const onSave = vi.fn();
    render(
      <ContactEntry
        mode="edit"
        contactTypes={types}
        participantOptions={[{ value: 'person', label: 'The person' }, { value: 'carer', label: 'Carer' }]}
        defaultValue={{ date: { kind: 'full', year: 2026, month: 10, day: 28 }, time: { hours: 14, minutes: 0 }, duration: { minutes: 50 } }}
        onSave={onSave}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Contact type/), { target: { value: 'phone' } });
    fireEvent.click(screen.getByLabelText('Carer'));
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Checked in.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save contact' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ contactType: 'phone', participants: ['carer'], note: 'Checked in.' }));
  });
  it('counts duration minutes', () => {
    expect(contactDurationMinutes({ hours: 1, minutes: 5 })).toBe(65);
    expect(contactDurationMinutes(null)).toBeNull();
  });
});
