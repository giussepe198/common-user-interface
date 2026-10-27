import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { EthnicityInput, ethnicityNeedsReduction } from './EthnicityInput';
import type { EthnicityValue } from './EthnicityInput';

afterEach(cleanup);
const flush = () => act(async () => { await Promise.resolve(); });

describe('EthnicityInput', () => {
  it('standard question, instruction and options in order (HISO 10001)', () => {
    const { container } = render(<EthnicityInput />);
    expect(container.querySelector('legend')?.textContent).toBe('Which ethnic group do you belong to?');
    expect(container.textContent).toContain('Mark the space or spaces that apply to you.');
    const labels = Array.from(container.querySelectorAll('.cui-patient-question__options label')).map((l) => l.textContent);
    expect(labels.slice(0, 8)).toEqual(['New Zealand European', 'Māori', 'Samoan', 'Cook Islands Māori', 'Tongan', 'Niuean', 'Chinese', 'Indian']);
    expect(labels[8]).toMatch(/^Other/);
    expect(container.textContent).not.toMatch(/main|principal/i);
  });
  it('multiple selection kept in the order recorded', () => {
    const onChange = vi.fn();
    render(<EthnicityInput onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Samoan'));
    fireEvent.click(screen.getByLabelText('Māori'));
    expect(onChange).toHaveBeenLastCalledWith({ entries: [{ code: '31111', label: 'Samoan' }, { code: '21111', label: 'Māori' }] });
  });
  it('"Other" shows a visible entry; classification suggestions add coded entries without restricting text', async () => {
    const onChange = vi.fn();
    const lookup = vi.fn(() => [{ code: '12948', label: 'Dutch' }]);
    render(<EthnicityInput onChange={onChange} classification={lookup} />);
    fireEvent.click(screen.getByLabelText(/^Other/));
    const other = screen.getByRole('combobox');
    fireEvent.change(other, { target: { value: 'Dutch' } });
    await flush();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ otherText: 'Dutch' }));
    fireEvent.keyDown(other, { key: 'ArrowDown' });
    fireEvent.keyDown(other, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entries: [{ code: '12948', label: 'Dutch' }] }));
    expect(screen.getByRole('button', { name: 'Remove Dutch' })).toBeTruthy();
  });
  it('nothing entered: offers the two responses after leaving the question', () => {
    const onChange = vi.fn();
    const { container } = render(<><EthnicityInput onChange={onChange} /><button>next</button></>);
    const first = screen.getByLabelText('New Zealand European');
    first.focus();
    fireEvent.blur(container.querySelector('fieldset') as HTMLElement, { relatedTarget: screen.getByText('next') });
    fireEvent.click(screen.getByLabelText('I do not want to state my ethnicity'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ entries: [{ code: '95555', label: 'I do not want to state my ethnicity' }] }));
  });
  it('more than six: reduction notice, nothing dropped', () => {
    const many: EthnicityValue = { entries: ['11111', '21111', '31111', '32100', '33111', '34111', '42100'].map((code) => ({ code, label: code })) };
    render(<EthnicityInput value={many} />);
    expect(ethnicityNeedsReduction(many)).toBe(true);
    expect(screen.getByText(/More than six/)).toBeTruthy();
  });
});
