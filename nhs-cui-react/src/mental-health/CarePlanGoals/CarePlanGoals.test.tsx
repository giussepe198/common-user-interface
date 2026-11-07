import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CarePlanGoals } from './CarePlanGoals';
import type { CarePlanGoal } from './CarePlanGoals';

afterEach(cleanup);
const goals: CarePlanGoal[] = [
  {
    id: 'g1',
    ownWords: 'I want to get back to my course',
    domain: 'Education',
    strengths: 'Loves art',
    reviewDue: '2026-09-01',
    progress: 'some',
    progressNote: 'Enrolled for next term',
    actions: [
      { id: 'a1', text: 'Call the student support office', who: 'Lan', byWhen: '2026-11-04' },
      { id: 'a2', text: 'Write a letter of support', who: 'Case manager', done: true },
    ],
  },
  { id: 'g2', ownWords: 'Sleep through the night' },
];

describe('CarePlanGoals', () => {
  it('leads with the person own words and lists actions with who and by when', () => {
    const { container } = render(<CarePlanGoals goals={goals} now="2026-10-28T00:00:00Z" timeZone="Australia/Melbourne" />);
    expect(screen.getByRole('heading', { name: /Goal 1, in the person's words: .*I want to get back to my course/ })).toBeTruthy();
    expect(container.textContent).toContain('Call the student support office');
    expect(container.textContent).toContain('by 04-Nov-2026');
    expect(container.textContent).toContain('Write a letter of support (done)');
  });
  it('says progress and review overdue in words', () => {
    const { container } = render(<CarePlanGoals goals={goals} now="2026-10-28T00:00:00Z" />);
    expect(container.textContent).toContain('Some progress');
    expect(container.textContent).toContain('Review overdue: was due 01-Sep-2026');
    expect(container.textContent).toContain('Progress not recorded');
    expect(container.textContent).toContain('No actions recorded');
  });
  it('changes progress with a labelled select', () => {
    const onChange = vi.fn();
    render(<CarePlanGoals goals={goals} onProgressChange={onChange} />);
    const selects = screen.getAllByLabelText('Progress');
    fireEvent.change(selects[1], { target: { value: 'achieved' } });
    expect(onChange).toHaveBeenCalledWith('g2', 'achieved');
  });
  it('takes service progress words and shows agreement', () => {
    render(<CarePlanGoals goals={goals} agreement="Agreed with Lan, 20-Oct-2026" progressOptions={[{ value: 'some', label: 'On the way (co-designed words)', tone: 'some' }]} />);
    expect(screen.getByText('On the way (co-designed words)')).toBeTruthy();
    expect(screen.getByText('Agreed with Lan, 20-Oct-2026')).toBeTruthy();
  });
});
