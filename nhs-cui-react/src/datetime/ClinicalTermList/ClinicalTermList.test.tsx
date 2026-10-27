import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ClinicalTermList } from './ClinicalTermList';

const measure = (s: string) => s.length * 7;
const ITEMS = [
  { id: '1', term: 'Asthma' },
  { id: '2', term: 'Chronic obstructive pulmonary disease with acute lower respiratory infection' },
  { id: '3', term: 'Fracture of neck of femur' },
];

describe('ClinicalTermList', () => {
  let restore = () => {};
  beforeEach(() => {
    const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 300 });
    restore = () => d && Object.defineProperty(HTMLElement.prototype, 'clientWidth', d);
  });
  afterEach(() => {
    cleanup();
    restore();
  });

  it('shows full terms by default in a listbox (T1)', () => {
    render(<ClinicalTermList label="Diagnosis" items={ITEMS} />);
    const lb = screen.getByRole('listbox', { name: 'Diagnosis' });
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(lb.textContent).toContain('acute lower respiratory infection');
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('truncates at word boundaries with an ellipsis and keeps the full term for screen readers (T2, T5)', () => {
    render(<ClinicalTermList label="Diagnosis" items={ITEMS} truncation="end" measure={measure} />);
    const opt = screen.getAllByRole('option')[1];
    expect(opt.querySelector('.cui-term-list__text')?.textContent).toMatch(/…$/);
    expect(opt.textContent).toContain(`${ITEMS[1].term} (shortened on screen)`);
    fireEvent.click(screen.getByRole('button', { name: 'Show all terms in full' }));
    expect(screen.getAllByRole('option')[1].querySelector('.cui-term-list__text--full')).toBeTruthy();
  });
  it('moves with arrow keys and needs the full term shown before acting on a shortened item (T7)', () => {
    const onActivate = vi.fn();
    const onChange = vi.fn();
    render(<ClinicalTermList label="Diagnosis" items={ITEMS} truncation="end" measure={measure} onActivate={onActivate} onChange={onChange} />);
    const lb = screen.getByRole('listbox');
    fireEvent.keyDown(lb, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('2');
    expect(lb.getAttribute('aria-activedescendant')).toMatch(/opt-2$/);
    fireEvent.keyDown(lb, { key: 'Enter' });
    expect(onActivate).not.toHaveBeenCalled();
    expect(screen.getAllByRole('option')[1].querySelector('.cui-term-list__text--full')).toBeTruthy();
    fireEvent.keyDown(lb, { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledWith(ITEMS[1]);
    fireEvent.keyDown(lb, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('3');
    fireEvent.keyDown(lb, { key: 'Home' });
    fireEvent.keyDown(lb, { key: 'Enter' });
    expect(onActivate).toHaveBeenLastCalledWith(ITEMS[0]);
  });
  it('shows everything in full when shortened terms would look identical (T6)', () => {
    const twins = [
      { id: 'a', term: 'Closed fracture of shaft of left femur with displacement' },
      { id: 'b', term: 'Closed fracture of shaft of left femur without displacement' },
    ];
    render(<ClinicalTermList label="Diagnosis" items={twins} truncation="end" measure={measure} />);
    expect(screen.getByRole('status').textContent).toMatch(/looked the same when shortened/);
    expect(document.querySelectorAll('.cui-term-list__text--full')).toHaveLength(2);
  });
  it('shows an empty state', () => {
    render(<ClinicalTermList label="Diagnosis" items={[]} />);
    expect(screen.getByText('No terms to show')).toBeTruthy();
  });
});
