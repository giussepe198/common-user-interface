import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClinicalStatement, statementDateText } from './ClinicalStatement';

afterEach(cleanup);

describe('ClinicalStatement', () => {
  it('puts negation and family context first and never shows concept ids', () => {
    const { container } = render(<ClinicalStatement inMixedList statement={{ id: 's1', pattern: 'FH', subject: 'family', segments: [{ type: 'coded', text: 'Myocardial infarction' }, { type: 'free', text: 'father, aged 55' }] }} />);
    expect(container.textContent).toMatch(/Family history of.*myocardial infarction/i);
  });
  it('flags unbound statements and offers Add terms', () => {
    const onAdd = vi.fn();
    render(<ClinicalStatement statement={{ id: 's2', pattern: 'PMH', segments: [{ type: 'free', text: 'Fell off ladder' }] }} onAddEncoding={onAdd} />);
    expect(screen.getByText('No terms available')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Add terms' }));
    expect(onAdd).toHaveBeenCalled();
  });
  it('shows dates at captured precision with approximation', () => {
    expect(statementDateText({ id: 'x', pattern: 'PMH', segments: [], observationTime: { year: 1987, approximate: true } })).toBe('1987 (approximate)');
  });
});
