import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RiskFormulation } from './RiskFormulation';
import type { RiskFormulationValue } from './RiskFormulation';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';
const value: RiskFormulationValue = {
  staticFactors: ['Previous admission'],
  dynamicFactors: ['Recent loss of housing', 'Not sleeping'],
  protectiveFactors: [],
  summary: 'Risk is raised while housing is uncertain.',
  plan: 'Daily contact this week.',
};

describe('RiskFormulation', () => {
  it('read mode shows the three factor lists, summary and plan in words', () => {
    render(<RiskFormulation value={value} recordedBy="J Clinician" recordedAt="2026-10-20T00:00:00Z" reviewDue="2026-10-01T00:00:00Z" now={NOW} timeZone="Australia/Melbourne" />);
    expect(screen.getByText('Static risk factors')).toBeTruthy();
    expect(screen.getByText('Not sleeping')).toBeTruthy();
    expect(screen.getByText('None recorded')).toBeTruthy();
    expect(screen.getByText(value.summary)).toBeTruthy();
    expect(screen.getByText('Review overdue (due 01-Oct-2026)')).toBeTruthy();
  });
  it('says "No risk formulation recorded" when empty', () => {
    render(<RiskFormulation />);
    expect(screen.getByText('No risk formulation recorded')).toBeTruthy();
  });
  it('never renders a score or numeric level', () => {
    const { container } = render(<RiskFormulation value={value} now={NOW} />);
    expect(container.textContent).not.toMatch(/score|\/10/i);
  });
  it('edit mode: adds, edits and removes factors by keyboard-reachable buttons', () => {
    const onChange = vi.fn();
    render(<RiskFormulation mode="edit" defaultValue={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add protective factor' }));
    const box = screen.getByLabelText('Protective factor 1');
    fireEvent.change(box, { target: { value: 'Close to sister' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ protectiveFactors: ['Close to sister'] }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove dynamic factor 1' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ dynamicFactors: ['Not sleeping'] }));
  });
  it('save needs a summary and returns cleaned values', () => {
    const onSave = vi.fn();
    render(<RiskFormulation mode="edit" defaultValue={{ ...value, summary: ' ', staticFactors: ['  ', 'A'] }} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Save formulation' }));
    expect(screen.getByRole('alert').textContent).toContain('Enter a plain-language summary');
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Summary'), { target: { value: 'Summary' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save formulation' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ summary: 'Summary', staticFactors: ['A'] }));
  });
  it('shows only the factor lists the form records, judgements by area in words and extra content', () => {
    const judgements = [
      { id: 'self', area: 'Harm to self', judgement: 'Some concern', rationale: 'Said they feel hopeless.' },
      { id: 'others', area: 'Harm to others', judgement: 'No apparent concern' },
    ];
    render(
      <RiskFormulation
        value={{ ...value, staticFactors: [], dynamicFactors: [], protectiveFactors: ['Close to sister'] }}
        factorGroups={['protectiveFactors']}
        judgements={judgements}
        labels={{ summary: 'Formulation', reviewNotSet: 'Next review not set' }}
        now={NOW}
      >
        <p>For information, not a decision</p>
      </RiskFormulation>,
    );
    expect(screen.queryByText('Static risk factors')).toBeNull();
    expect(screen.queryByText('Dynamic risk factors')).toBeNull();
    expect(screen.getByText('Close to sister')).toBeTruthy();
    expect(screen.getByText('Judgement by area')).toBeTruthy();
    expect(screen.getByText('Harm to self')).toBeTruthy();
    expect(screen.getByText('Said they feel hopeless.')).toBeTruthy();
    expect(screen.getByText('Formulation')).toBeTruthy();
    expect(screen.getByText('Next review not set')).toBeTruthy();
    expect(screen.getByText('For information, not a decision')).toBeTruthy();
  });
  it('a formulation with only judgements is not empty', () => {
    render(<RiskFormulation judgements={[{ id: 'a', area: 'Harm to self', judgement: 'Some concern' }]} />);
    expect(screen.queryByText('No risk formulation recorded')).toBeNull();
  });
});
