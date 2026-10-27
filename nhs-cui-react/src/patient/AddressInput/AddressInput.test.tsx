import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { AddressInput, addressInputToValue } from './AddressInput';
import type { AddressInputValue } from './AddressInput';
import { formatAddress } from '../utils/patient';
import { AddressDisplay } from '../AddressDisplay/AddressDisplay';

afterEach(cleanup);
const flush = () => act(async () => { await Promise.resolve(); });

describe('AddressInput', () => {
  it('GB: UK fields and disallowed characters removed with a note (ADR-0012, ADR-0021)', () => {
    const onChange = vi.fn();
    render(<AddressInput onChange={onChange} />);
    expect(screen.getByLabelText('County')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Line 1'), { target: { value: '3 Mill Lane #' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ line1: '3 Mill Lane ' }));
    expect(screen.getByRole('status').textContent).toMatch(/Only letters/);
  });
  it('GB: postcode formatted on blur and Find Postcode lookup with arrow keys', async () => {
    const onFind = vi.fn(() => [{ address: { line1: '3 Mill Lane', town: 'Ipswich', postcode: 'ns31ab' } }, { address: { line1: '5 Mill Lane', town: 'Ipswich', postcode: 'NS3 1AB' } }]);
    render(<AddressInput onFindPostcode={onFind} defaultValue={{ line1: '3 Mill Lane', line2: '', line3: '', town: 'Ipswich', postcode: '' }} />);
    fireEvent.click(screen.getByRole('button', { name: /Find Postcode/ }));
    await flush();
    const results = screen.getAllByRole('button', { name: /Mill Lane/ });
    expect(results).toHaveLength(2);
    results[0].focus();
    fireEvent.keyDown(results[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(results[1]);
    fireEvent.click(results[0]);
    expect((screen.getByLabelText('Postcode') as HTMLInputElement).value).toBe('NS3 1AB');
  });
  it('AU: state select, 4-digit postcode and a postcode/state warning that never blocks (AU-AD-02)', () => {
    const onChange = vi.fn();
    render(<AddressInput region="AU" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('State or territory'), { target: { value: 'VIC' } });
    const pc = screen.getByLabelText('Postcode');
    fireEvent.change(pc, { target: { value: '2000' } });
    fireEvent.blur(pc);
    expect(screen.getByText(/not usually in VIC/)).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'VIC', postcode: '2000' }));
    fireEvent.change(pc, { target: { value: '20' } });
    expect(screen.getByText('Enter a 4-digit postcode')).toBeTruthy();
  });
  it('AU: "2/14 Smith Street" is split into unit and street (AU-AD-01)', () => {
    const onChange = vi.fn();
    render(<AddressInput region="AU" onChange={onChange} />);
    const street = screen.getByLabelText('Street address');
    fireEvent.change(street, { target: { value: '2/14 Smith Street' } });
    fireEvent.blur(street);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ unit: 'Unit 2', line1: '14 Smith Street' }));
  });
  it('AU: no fixed address hides the fields (AU-AD-03)', () => {
    const onChange = vi.fn();
    render(<AddressInput region="AU" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('No fixed address'));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ noFixedAddress: true }));
    expect(screen.queryByLabelText('Street address')).toBeNull();
  });
  it('NZ: suburb or RD normalised, macrons accepted, lookup hook fills fields with an id', async () => {
    const onChange = vi.fn();
    const search = vi.fn(async () => [{ address: { line1: '23 Main Street', suburb: 'Kaiapoi', town: 'Kaiapoi', postcode: '7630', addressId: 'DPID-0001' } }]);
    render(<AddressInput region="NZ" onChange={onChange} onSearchAddress={search} />);
    const rd = screen.getByLabelText('Suburb or RD');
    fireEvent.change(rd, { target: { value: 'r.d.2' } });
    fireEvent.blur(rd);
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ suburb: 'RD 2' }));
    fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: 'Ōtautahi' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ town: 'Ōtautahi' }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '23 Main' } });
    fireEvent.click(screen.getByRole('button', { name: /Find address/ }));
    await flush();
    expect(search).toHaveBeenCalledWith('23 Main');
    fireEvent.click(screen.getByRole('button', { name: /23 Main Street/ }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ addressId: 'DPID-0001', postcode: '7630' }));
  });
  it('addressInputToValue feeds formatAddress per region', () => {
    const v: AddressInputValue = { line1: '14 Smith Street', line2: '', line3: '', town: 'Bunbury', state: 'WA', postcode: '6230', unit: 'Unit 2' };
    expect(formatAddress(addressInputToValue(v, 'AU'), 'horizontal', 'AU')).toBe('Unit 2, 14 Smith Street, BUNBURY WA 6230');
  });
  it('addressInputToValue maps every region and no fixed address', () => {
    const gb: AddressInputValue = { line1: '18 Orchard Cottage', line2: "King's Road", line3: '', town: 'Ipswich', county: 'Northshire', postcode: 'ns338kr' };
    expect(formatAddress(addressInputToValue(gb, 'GB'), 'horizontal', 'GB')).toBe("18 Orchard Cottage, King's Road, Ipswich, Northshire, NS33 8KR");
    expect(addressInputToValue(gb)).toEqual({ lines: ['18 Orchard Cottage', "King's Road", '', ''], town: 'Ipswich', county: 'Northshire', postcode: 'ns338kr', country: undefined });
    const nz: AddressInputValue = { line1: '23 Main Street', line2: '', line3: '', town: 'Kaiapoi', postcode: '7630', suburb: 'RD 2', buildingName: 'Te Whare' };
    expect(formatAddress(addressInputToValue(nz, 'NZ'), 'vertical', 'NZ')).toEqual(['Te Whare', '23 Main Street', 'RD 2', 'Kaiapoi 7630']);
    const nfa: AddressInputValue = { line1: '', line2: '', line3: '', town: '', postcode: '', noFixedAddress: true };
    for (const r of ['GB', 'AU', 'NZ'] as const) {
      expect(formatAddress(addressInputToValue(nfa, r), 'horizontal', r)).toBe('No fixed address');
    }
  });
  it('addressInputToValue output feeds PatientBanner and AddressDisplay', () => {
    const v: AddressInputValue = { line1: '14 Smith Street', line2: '', line3: '', town: 'Bunbury', state: 'WA', postcode: '6230', unit: 'Unit 2' };
    render(<AddressDisplay region="AU" address={addressInputToValue(v, 'AU')} />);
    expect(document.body.textContent).toContain('BUNBURY WA 6230');
    cleanup();
    render(<AddressDisplay region="AU" address={addressInputToValue({ ...v, noFixedAddress: true }, 'AU')} />);
    expect(document.body.textContent).toContain('No fixed address');
  });
});
