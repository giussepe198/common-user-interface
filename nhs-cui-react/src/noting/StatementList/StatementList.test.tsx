import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StatementList } from './StatementList';

afterEach(cleanup);

const statements = [
  { id: 'a', pattern: 'PMH' as const, segments: [{ type: 'coded' as const, text: 'Asthma' }], observationTime: { year: 2001 } },
  { id: 'b', pattern: 'FH' as const, subject: 'family', segments: [{ type: 'coded' as const, text: 'Diabetes' }], observationTime: { year: 2010 } },
];

describe('StatementList', () => {
  it('groups by pattern under full headings', () => {
    render(<StatementList statements={statements} />);
    expect(screen.getByRole('heading', { name: 'Past medical history' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Family history' })).toBeTruthy();
  });
  it('orders chronologically with context at the start of each statement', () => {
    const { container } = render(<StatementList statements={statements} grouping="chronological" />);
    const items = Array.from(container.querySelectorAll('li')).map((li) => li.textContent);
    expect(items[0]).toContain('Family history of');
  });
  it('offers a highlight toggle and an empty message', () => {
    const { container, rerender } = render(<StatementList statements={statements} />);
    fireEvent.click(screen.getByLabelText('Highlight coded terms'));
    expect(container.querySelector('.cui-clinical-statement--highlight')).toBeTruthy();
    rerender(<StatementList statements={[]} />);
    expect(screen.getByText('No statements recorded.')).toBeTruthy();
  });
});
