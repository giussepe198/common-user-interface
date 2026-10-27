import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { IndigenousStatusInput, indigenousStatusFromBoxes } from './IndigenousStatusInput';

afterEach(cleanup);

describe('IndigenousStatusInput', () => {
  it('standard question and tick boxes in order, nothing selected (METeOR 602543, AU-IS-02)', () => {
    const { container } = render(<IndigenousStatusInput />);
    expect(container.querySelector('legend')?.textContent).toBe('Are you of Aboriginal or Torres Strait Islander origin?');
    const labels = Array.from(container.querySelectorAll('.cui-patient-question__options label')).map((l) => l.textContent);
    expect(labels).toEqual(['No', 'Yes, Aboriginal', 'Yes, Torres Strait Islander']);
    expect(container.querySelectorAll('input:checked')).toHaveLength(0);
    expect(screen.getByText('Not yet answered')).toBeTruthy();
  });
  it('both Yes boxes give code 3 (AU-IS-01)', () => {
    const onChange = vi.fn();
    render(<IndigenousStatusInput onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Yes, Aboriginal'));
    expect(onChange).toHaveBeenLastCalledWith('1');
    fireEvent.click(screen.getByLabelText('Yes, Torres Strait Islander'));
    expect(onChange).toHaveBeenLastCalledWith('3');
    expect(screen.getByText(/Both Aboriginal and Torres Strait Islander origin \(code 3\)/)).toBeTruthy();
  });
  it('No excludes Yes; not answered gives 9', () => {
    const onChange = vi.fn();
    render(<IndigenousStatusInput defaultValue="3" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('No'));
    expect(onChange).toHaveBeenLastCalledWith('4');
    expect((screen.getByLabelText('Yes, Aboriginal') as HTMLInputElement).checked).toBe(false);
    fireEvent.click(screen.getByLabelText(/Not answered/));
    expect(onChange).toHaveBeenLastCalledWith('9');
    fireEvent.click(screen.getByLabelText(/Not answered/));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
  it('mapping helper', () => {
    expect(indigenousStatusFromBoxes({ tsi: true })).toBe('2');
    expect(indigenousStatusFromBoxes({})).toBeNull();
  });
});

describe('IndigenousStatusInput interviewer version (METeOR 602543, G12 8)', () => {
  it('asks Q1 then Q2 with the METeOR wording', () => {
    const onChange = vi.fn();
    const { container } = render(<IndigenousStatusInput variant="interviewer" onChange={onChange} />);
    expect(container.querySelector('legend')?.textContent).toBe('Q1. Are you of Aboriginal or Torres Strait Islander origin?');
    expect(screen.queryByText(/Q2\./)).toBeNull();
    fireEvent.click(screen.getByLabelText('Yes'));
    expect(screen.getByText('Q2. Are you of Aboriginal origin, Torres Strait Islander origin, or both?')).toBeTruthy();
    expect(screen.getByText('Ask Q2')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Both Aboriginal and Torres Strait Islander'));
    expect(onChange).toHaveBeenLastCalledWith('3');
    fireEvent.click(screen.getByLabelText('Torres Strait Islander'));
    expect(onChange).toHaveBeenLastCalledWith('2');
  });
  it('No records code 4 and ends the question', () => {
    const onChange = vi.fn();
    render(<IndigenousStatusInput variant="interviewer" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('No (no more questions)'));
    expect(onChange).toHaveBeenLastCalledWith('4');
    expect(screen.queryByText(/Q2\./)).toBeNull();
  });
  it('third-party wording and optional Both category', () => {
    render(<IndigenousStatusInput variant="interviewer" personName="Jo" includeBoth={false} defaultValue="1" />);
    expect(screen.getByText('Q1. Is Jo of Aboriginal or Torres Strait Islander origin?')).toBeTruthy();
    expect(screen.getByText('Q2. Is Jo of Aboriginal origin, Torres Strait Islander origin, or both?')).toBeTruthy();
    expect(screen.queryByLabelText('Both Aboriginal and Torres Strait Islander')).toBeNull();
    expect((screen.getByLabelText('Aboriginal') as HTMLInputElement).checked).toBe(true);
  });
});
