import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AbbreviationCheckedTextArea } from './AbbreviationCheckedTextArea';
import { ClinicalLocaleProvider } from '../../core';
import { FormField } from '../../noting';

afterEach(cleanup);

describe('AbbreviationCheckedTextArea', () => {
  it('alerts on leaving the field and reports invalid while a dangerous item remains (abbracs 3.1)', () => {
    const onValidity = vi.fn();
    render(<AbbreviationCheckedTextArea label="Instructions" defaultValue="Give 10U insulin" onValidityChange={onValidity} />);
    expect(onValidity).toHaveBeenLastCalledWith(false, expect.any(Array));
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.blur(screen.getByLabelText('Instructions'));
    expect(screen.getByRole('alert').textContent).toMatch(/1 dangerous item must be resolved/);
  });
  it('offers replacements with none pre-selected and applies the chosen one', () => {
    const onValidity = vi.fn();
    render(<AbbreviationCheckedTextArea label="Instructions" defaultValue="Give 10U insulin" onValidityChange={onValidity} showAlerts />);
    const options = screen.getAllByRole('button').filter(b => ['unit', 'units'].includes(b.textContent ?? ''));
    expect(options.map(b => b.textContent)).toEqual(['unit', 'units']);
    fireEvent.click(options[1]);
    expect((screen.getByLabelText('Instructions') as HTMLTextAreaElement).value).toBe('Give 10units insulin');
    expect(onValidity).toHaveBeenLastCalledWith(true, []);
  });
  it('moves to the next item with F8', () => {
    render(<AbbreviationCheckedTextArea label="Notes" defaultValue="Known AE and ST" />);
    const area = screen.getByLabelText('Notes') as HTMLTextAreaElement;
    area.focus();
    area.setSelectionRange(0, 0);
    fireEvent.keyDown(area, { key: 'F8' });
    expect([area.selectionStart, area.selectionEnd]).toEqual([6, 8]);
    fireEvent.keyDown(area, { key: 'F8' });
    expect([area.selectionStart, area.selectionEnd]).toEqual([13, 15]);
  });
  it('uses the AU list with full-word replacements and the NZ list', () => {
    render(<ClinicalLocaleProvider region="AU"><AbbreviationCheckedTextArea label="Order" defaultValue="500 mcg Q4H" showAlerts /></ClinicalLocaleProvider>);
    expect(screen.getByRole('button', { name: 'microgram' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'every 4 hours' })).toBeTruthy();
    cleanup();
    render(<AbbreviationCheckedTextArea label="Order" region="NZ" defaultValue="500 mcg q4h" showAlerts />);
    expect(screen.getByRole('alert').textContent).toMatch(/1 dangerous item/);
    expect(screen.getByRole('button', { name: 'microgram' })).toBeTruthy();
  });
  it('warns later readers in read-only mode', () => {
    render(<AbbreviationCheckedTextArea label="Notes" value="Known AE" readOnly />);
    expect(screen.getByRole('note').textContent).toMatch(/1 unexpanded abbreviation \(AE\)/);
  });
  it('shows required and missed states on its own (CNA-1080, CNA-1160..1180)', () => {
    const { container } = render(<AbbreviationCheckedTextArea label="Summary" id="sum" required missed value="" aria-describedby="extra" />);
    const area = screen.getByLabelText(/Summary/) as HTMLTextAreaElement;
    expect(area.id).toBe('sum');
    expect(container.querySelector('.cui-abbr-text__required')?.textContent).toBe('*');
    expect(area.getAttribute('aria-required')).toBe('true');
    expect(area.getAttribute('aria-invalid')).toBe('true');
    const ids = (area.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toContain('extra');
    expect(document.getElementById(ids[1])?.textContent).toBe('Required field not completed.');
    expect(container.querySelector('.cui-abbr-text--missed .cui-abbr-text__missed-icon')).toBeTruthy();
  });
  it('works inside FormField: the field label, missed text and prompt reach the text area', () => {
    render(
      <FormField label="Summary and plan" id="f-summary" required missed prompt="Free text" promptPlacement="in-field">
        <AbbreviationCheckedTextArea value="" rows={3} />
      </FormField>,
    );
    const area = screen.getByLabelText(/Summary and plan/) as HTMLTextAreaElement;
    expect(area.tagName).toBe('TEXTAREA');
    expect(area.id).toBe('f-summary');
    expect(area.getAttribute('aria-required')).toBe('true');
    expect(area.getAttribute('aria-invalid')).toBe('true');
    expect(area.placeholder).toBe('Free text');
    const described = (area.getAttribute('aria-describedby') ?? '').split(' ').map(id => document.getElementById(id)?.textContent);
    expect(described).toContain('Required field not completed.');
    // FormField labels the field; the text area adds no second label.
    expect(document.querySelectorAll('label')).toHaveLength(1);
  });
  it('keeps FormField ids when the abbreviation alert is shown', () => {
    render(
      <FormField label="Plan" id="f-plan" prompt="What happens next">
        <AbbreviationCheckedTextArea defaultValue="Give 10U insulin" showAlerts />
      </FormField>,
    );
    const area = screen.getByLabelText('Plan');
    const ids = (area.getAttribute('aria-describedby') ?? '').split(' ');
    expect(ids).toContain('f-plan-prompt');
    expect(ids.some(id => document.getElementById(id)?.getAttribute('role') === 'alert')).toBe(true);
    expect(area.getAttribute('aria-invalid')).toBe('true');
  });
});
