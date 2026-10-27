import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PatientIdentifierInput } from './PatientIdentifierInput';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('PatientIdentifierInput', () => {
  it('defaults to the region primary identifier', () => {
    const { rerender } = render(<PatientIdentifierInput />);
    expect(screen.getByLabelText('NHS Number')).toBeTruthy();
    rerender(<PatientIdentifierInput region="AU" />);
    expect(screen.getByLabelText('IHI')).toBeTruthy();
    rerender(
      <ClinicalLocaleProvider region="NZ">
        <PatientIdentifierInput />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByLabelText('NHI number')).toBeTruthy();
  });
  it('picks Medicare with IRN and DVA by type', () => {
    const { rerender } = render(<PatientIdentifierInput region="AU" type="medicare" />);
    expect(screen.getByLabelText('IRN')).toBeTruthy();
    rerender(<PatientIdentifierInput region="AU" type="dva" />);
    expect(screen.getByLabelText('DVA file number')).toBeTruthy();
  });
  it('MRN: AU label URN with a local pattern (AU-ID-04)', () => {
    const onChange = vi.fn();
    render(<PatientIdentifierInput region="AU" type="mrn" mrnPattern={/^\d{7}$/} onChange={onChange} />);
    const box = screen.getByLabelText('URN');
    fireEvent.change(box, { target: { value: '12345' } });
    expect(onChange).toHaveBeenLastCalledWith('12345', '12345');
    fireEvent.blur(box);
    expect(screen.getByRole('alert').textContent).toBe('Check the record number format');
  });
  it('passes validation through', () => {
    render(<PatientIdentifierInput region="NZ" defaultValue="ZAC5362" />);
    fireEvent.blur(screen.getByLabelText('NHI number'));
    expect(screen.getByRole('alert').textContent).toMatch(/not a valid NHI/);
  });
  it('marks required on the label for every type (GB nhs, AU ihi, NZ nhi)', () => {
    const { rerender } = render(<PatientIdentifierInput region="GB" required />);
    expect(screen.getByLabelText('NHS Number (required)')).toBeTruthy();
    rerender(<PatientIdentifierInput region="AU" required />);
    expect(screen.getByLabelText('IHI (required)')).toBeTruthy();
    rerender(<PatientIdentifierInput region="NZ" required />);
    expect(screen.getByLabelText('NHI number (required)')).toBeTruthy();
  });
  it('Medicare: passes valid to through (G12 1)', () => {
    const onValidToChange = vi.fn();
    render(
      <PatientIdentifierInput
        region="AU"
        type="medicare"
        defaultValue="2123456701"
        defaultIrn="1"
        validTo="01/2020"
        onValidToChange={onValidToChange}
        now="2026-10-27"
      />,
    );
    const box = screen.getByLabelText(/Valid to/) as HTMLInputElement;
    expect(box.value).toBe('01/2020');
    fireEvent.change(box, { target: { value: '06/2030' } });
    expect(onValidToChange).toHaveBeenCalled();
    expect(onValidToChange.mock.calls[0][0]).toBe('06/2030');
    expect(document.body.textContent).toMatch(/expired/i);
  });
  it('Medicare: IRN label passes through', () => {
    render(<PatientIdentifierInput region="AU" type="medicare" irnLabel="Ref" />);
    expect(screen.getByLabelText('Ref')).toBeTruthy();
  });
  it('NHI: lookupNhi and onUseLiveNhi pass through (G12 4)', () => {
    const onUseLiveNhi = vi.fn();
    const onChange = vi.fn();
    render(
      <PatientIdentifierInput
        region="NZ"
        defaultValue="ZAC5361"
        flagTestNumbers={false}
        lookupNhi={() => ({ status: 'dormant', liveNhi: 'ZBN77VL' })}
        onUseLiveNhi={onUseLiveNhi}
        onChange={onChange}
      />,
    );
    expect(screen.getByText(/The live NHI is ZBN77VL/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Use live NHI' }));
    expect(onUseLiveNhi).toHaveBeenCalledWith('ZBN77VL', 'ZAC5361');
    expect(onChange).toHaveBeenLastCalledWith('ZBN77VL', 'ZBN77VL');
  });
});
