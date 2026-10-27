import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { PrescriptionDetailForm } from './PrescriptionDetailForm';

afterEach(cleanup);

const o = (value: string) => ({ value });
const options = {
  route: [o('oral')],
  strength: [{ value: '250 mg', doses: ['250 mg', '500 mg'] }, { value: '500 mg', doses: ['500 mg', '1 g'] }],
  form: [o('tablet')],
  dose: [o('250 mg'), o('500 mg'), o('1 g')],
  frequency: [o('twice a day'), o('every 6 hours as required')],
  giveWhen: [o('for pain')],
  administrationTimes: [o('08:00; 20:00')],
  firstDose: [o('Today 20:00')],
  duration: [o('7 days')],
};
const drug = { genericName: 'clarithromycin' };
const pick = (field: RegExp, value: string) => {
  fireEvent.click(screen.getByRole('button', { name: field }));
  fireEvent.click(screen.getByRole('option', { name: value }));
};

describe('PrescriptionDetailForm', () => {
  it('nothing but drug and route until the route is chosen (MSP-1580)', () => {
    render(<PrescriptionDetailForm drug={drug} options={options} />);
    expect(screen.queryByRole('tablist')).toBeNull();
    pick(/^Route/, 'oral');
    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Drug Details/ }).getAttribute('aria-selected')).toBe('true');
  });
  it('tabs switch with arrow keys and show what is left to complete (MSP-1610/1620)', () => {
    render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={{ route: 'oral' }} />);
    const t1 = screen.getByRole('tab', { name: /Drug Details/ });
    expect(screen.getByRole('tab', { name: /Administration Schedule/ }).textContent).toContain('3 to complete');
    fireEvent.keyDown(t1, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Administration Schedule/ }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Course Duration');
  });
  it('a strength that does not fit the dose clears the dose, which must be selected again (MSP-1990)', () => {
    const onChange = vi.fn();
    render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={{ route: 'oral', dose: '250 mg' }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /^Strength/ }));
    const list = screen.getByRole('listbox');
    expect(list.textContent).toContain('For other doses');
    fireEvent.click(within(list).getByRole('option', { name: '500 mg' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ strength: '500 mg', dose: undefined }), 'strength', ['dose']);
    expect(screen.getByText('Cleared: select again')).toBeTruthy();
    expect(screen.getByText(/Dose cleared because it did not match the Strength/)).toBeTruthy();
  });
  it('dose list puts doses for other strengths in their own section (MSP-1980)', () => {
    render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={{ route: 'oral', strength: '250 mg' }} />);
    fireEvent.click(screen.getByRole('button', { name: /^Dose/ }));
    const list = screen.getByRole('listbox');
    expect(list.textContent).toMatch(/250 mg.*500 mg.*For other strengths.*1 g/);
  });
  it('without dose data any strength change clears the dose (MSP-2010)', () => {
    const onChange = vi.fn();
    render(<PrescriptionDetailForm drug={drug} options={{ ...options, strength: [{ value: '250 mg' }, { value: '500 mg' }] }} defaultValues={{ route: 'oral', dose: '250 mg', strength: '250 mg' }} onChange={onChange} />);
    pick(/^Strength/, '500 mg');
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), 'strength', ['dose']);
  });
  it('Authorise needs completion and a preview after the last change (MSP-2220, MSP-2310)', () => {
    const onAuthorise = vi.fn();
    const values = { route: 'oral', dose: '500 mg', frequency: 'twice a day', administrationTimes: '08:00; 20:00', firstDose: 'Today 20:00', duration: '7 days' };
    render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={values} onAuthorise={onAuthorise} />);
    const auths = () => screen.getAllByRole('button', { name: 'Authorise' }) as HTMLButtonElement[];
    expect(auths()[0].disabled).toBe(true);
    expect(screen.getByText('Preview the prescription before authorising.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(auths()[0].disabled).toBe(false);
    fireEvent.click(auths()[0]);
    expect(onAuthorise).toHaveBeenCalled();
  });
  it('template control highlights the fields it defined (MSP-1280) and Go Back is offered (MSP-1360)', () => {
    const onBack = vi.fn();
    const { container } = render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={{ route: 'oral' }} templateFieldIds={['dose', 'frequency']} onOpenTemplates={() => {}} onGoBack={onBack} />);
    fireEvent.focus(screen.getByRole('button', { name: /Template Prescriptions/ }));
    expect(container.querySelectorAll('.cui-template-defined').length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(onBack).toHaveBeenCalled();
  });
  it('drug and route combined, edit offered (MSP-1640/1650); AU mixed case', () => {
    const onEdit = vi.fn();
    const { container } = render(<PrescriptionDetailForm region="AU" drug={{ genericName: 'clarithromycin' }} options={options} defaultValues={{ route: 'PO' }} onEditDrugAndRoute={onEdit} />);
    const b = screen.getByRole('button', { name: /cLARITHROMYcin|clarithromycin/ });
    expect(container.querySelector('.cui-rx-detail__drug')?.textContent).toContain('cLARITHROMYcin');
    expect(container.querySelector('.cui-rx-detail__drug')?.textContent).toContain('oral');
    fireEvent.click(b);
    expect(onEdit).toHaveBeenCalled();
  });
  it('authoriseBlockedReason holds Authorise even after preview', () => {
    const onAuthorise = vi.fn();
    const values = { route: 'oral', dose: '500 mg', frequency: 'twice a day', administrationTimes: '08:00; 20:00', firstDose: 'Today 20:00', duration: '7 days' };
    render(<PrescriptionDetailForm drug={drug} options={options} defaultValues={values} onAuthorise={onAuthorise} authoriseBlockedReason="Answer the High Priority alert first" />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    const auths = screen.getAllByRole('button', { name: 'Authorise' }) as HTMLButtonElement[];
    expect(auths.every((b) => b.disabled)).toBe(true);
    expect(document.getElementById(auths[0].getAttribute('aria-describedby')!)?.textContent).toBe('Answer the High Priority alert first');
    expect(screen.getByText('Not yet prescribed: authorise on hold')).toBeTruthy();
    expect(screen.queryByText(/preview, then authorise/)).toBeNull();
  });
});
