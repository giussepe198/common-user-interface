import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EthnicityDisplay, ethnicityDisplayTexts } from './EthnicityDisplay';

afterEach(cleanup);

describe('EthnicityDisplay', () => {
  it('all ethnicities in recorded order, none marked main (HISO 10001)', () => {
    const { container } = render(<EthnicityDisplay value={{ entries: [{ code: '31111', label: 'Samoan' }, { code: '21111', label: 'Māori' }] }} />);
    expect(container.textContent).toBe('Ethnicity Samoan, Māori');
  });
  it("uses the person's own words for Other", () => {
    expect(ethnicityDisplayTexts({ entries: [{ code: '11111', label: '' }, { code: '12948', label: 'Dutch' }], otherText: 'Frisian' })).toEqual([
      'New Zealand European',
      'Frisian',
    ]);
    expect(ethnicityDisplayTexts({ entries: [{ code: '12948', label: 'Dutch' }] })).toEqual(['Dutch']);
  });
  it('residuals and nothing recorded', () => {
    const { container, rerender } = render(<EthnicityDisplay value={{ entries: [{ code: '94444', label: '' }] }} />);
    expect(container.textContent).toBe("Ethnicity Don't know");
    rerender(<EthnicityDisplay value={null} />);
    expect(container.textContent).toBe('Ethnicity Not recorded');
  });
});

describe('EthnicityDisplay output levels (HISO 10001, G12 6)', () => {
  const value = {
    entries: [
      { code: '11111', label: 'New Zealand European' },
      { code: '31111', label: 'Samoan' },
      { code: '34111', label: 'Niuean' },
      { code: '21111', label: 'Māori' },
    ],
  };
  it('level 1 shows distinct groups in recorded order, never prioritised', () => {
    const { container } = render(<EthnicityDisplay value={value} outputLevel={1} />);
    const items = Array.from(container.querySelectorAll('.cui-ethnicity-display__item')).map((e) => e.textContent);
    expect(items).toEqual(['European,', 'Pacific Peoples,', 'Māori']);
    expect(container.textContent).toContain('(level 1 groups)');
    expect(container.textContent).not.toMatch(/main|principal/i);
  });
  it('level 4 is unchanged by default', () => {
    const { container } = render(<EthnicityDisplay value={value} />);
    expect(container.textContent).toBe('Ethnicity New Zealand European, Samoan, Niuean, Māori');
  });
  it('states in text when more than six are held', () => {
    const many = { entries: ['11111', '12100', '21111', '31111', '42100', '43100', '53111'].map((code) => ({ code, label: code })) };
    const { container } = render(<EthnicityDisplay value={many} />);
    expect(container.textContent).toContain('7 recorded: more than six');
  });
});
