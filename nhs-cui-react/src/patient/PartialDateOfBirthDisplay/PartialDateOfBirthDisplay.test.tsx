import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { PartialDateOfBirthDisplay } from './PartialDateOfBirthDisplay';

afterEach(cleanup);
const now = new Date(2026, 9, 27);
const txt = (el: Element) => {
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('.cui-deftip__tip').forEach((t) => t.remove());
  return c.textContent;
};

describe('PartialDateOfBirthDisplay (G12 5)', () => {
  it('year only with qualifier and both possible ages', () => {
    const { container } = render(<PartialDateOfBirthDisplay value="1975" now={now} />);
    expect(txt(container)).toBe('Born 1975year only (50y or 51y)');
  });
  it('month and year; full date as usual', () => {
    const { container, rerender } = render(<PartialDateOfBirthDisplay value="197503" now={now} />);
    expect(txt(container)).toBe('Born Mar-1975day not known (51y)');
    rerender(<PartialDateOfBirthDisplay value="1975-03-14" now={now} />);
    expect(txt(container)).toBe('Born 14-Mar-1975 (51y)');
  });
  it('numeric format, source, and unknown', () => {
    const { container, rerender } = render(<PartialDateOfBirthDisplay value="197503" dateFormat="dd/mm/yyyy" showAge={false} source="NPRF" showSource now={now} />);
    expect(txt(container)).toBe('Born 03/1975day not known(Proof not sighted)');
    rerender(<PartialDateOfBirthDisplay value={null} />);
    expect(txt(container)).toBe('Born Not Known');
  });
});
