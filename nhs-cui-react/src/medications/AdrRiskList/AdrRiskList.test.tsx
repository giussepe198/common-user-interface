import React from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdrRiskList } from './AdrRiskList';

const risks = [
  { id: 'r1', agent: { text: 'Penicillin', encoded: true }, pastReactions: [['urticaria', 'nausea'], ['anaphylaxis']],
    events: [{ id: 'e1', description: 'Risk identified', date: { year: 2019, month: 3 }, source: { who: 'Patient' }, author: { name: 'Sam Okafor', role: 'Nurse' } }] },
  { id: 'r2', agent: { text: 'sticking plaster adhesive', encoded: false, triggersDecisionSupport: false }, pastReactions: null },
  { id: 'r3', agent: { text: 'codeine', encoded: true }, pastReactions: [['vomiting']] },
];

afterEach(cleanup);

describe('AdrRiskList', () => {
  it('lists agents alphabetically in lower case with reactions (ADR-0009, ADR-0023, ADR-0037)', () => {
    const { container } = render(<AdrRiskList status={{ kind: 'risks', risks }} />);
    const agents = Array.from(container.querySelectorAll('.cui-adr__agent')).map(a => a.textContent);
    expect(agents).toEqual(['codeine', 'penicillin', 'sticking plaster adhesive (free text)']);
    expect(screen.getByText('urticaria + nausea, anaphylaxis')).toBeTruthy();
    expect(screen.getByText('Will not trigger decision support alerts')).toBeTruthy();
  });
  it('opens Level 2 events by keyboard-operable button and returns (ADR-0002/0003)', () => {
    render(<AdrRiskList status={{ kind: 'risks', risks }} />);
    const btn = screen.getByRole('button', { name: /penicillin.*show supporting events/ });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Risk identified')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Back to risk list/ }));
    expect(screen.queryByText('Risk identified')).toBeNull();
  });
  it('absence states use the exact wording (ADR-0051, ADR-0054)', () => {
    const { rerender } = render(<AdrRiskList status={{ kind: 'unknown' }} />);
    expect(screen.getByText('Risk status unknown')).toBeTruthy();
    rerender(<AdrRiskList status={{ kind: 'noKnownRisks', recordedAt: '2026-10-26T09:15:00', author: { name: 'Dr Tom Hale', role: 'F2' } }} />);
    expect(screen.getByText('No known adverse drug reaction risks')).toBeTruthy();
    expect(screen.getByText(/Recorded 26-Oct-2026 09:15 by Dr Tom Hale, F2/)).toBeTruthy();
  });
  it('narrative variant: one risk per line with a lead-in', () => {
    const { container } = render(<AdrRiskList variant="narrative" status={{ kind: 'risks', risks }} />);
    expect(container.querySelectorAll('li').length).toBe(3);
    expect(container.textContent).toContain('Adverse drug reaction risks:');
  });
});
