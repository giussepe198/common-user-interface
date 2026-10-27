import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AddressDisplay } from './AddressDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const lines = (c: HTMLElement) => Array.from(c.querySelectorAll('.cui-address__line')).map((l) => l.textContent);

describe('AddressDisplay', () => {
  it('GB vertical without empty lines, postcode formatted (ADR-0002, ADR-0006, ADR-0007)', () => {
    const { container } = render(<AddressDisplay address={{ lines: ['3 Mill Lane', ''], town: 'Ipswich', postcode: 'ns31ab' }} />);
    expect(lines(container)).toEqual(['3 Mill Lane', 'Ipswich', 'NS3 1AB']);
  });
  it('horizontal truncation keeps the full text for screen readers (ADR-0004)', () => {
    const { container } = render(<AddressDisplay orientation="horizontal" maxLength={15} address={{ lines: ['340 Gloucester Road'], town: 'Tewkesbury' }} />);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('340 Gloucest...');
    expect(container.querySelector('.cui-visually-hidden')?.textContent).toBe('340 Gloucester Road, Tewkesbury');
  });
  it('unknown text and view-all button', () => {
    const onViewAll = vi.fn();
    render(<AddressDisplay address={null} onViewAll={onViewAll} />);
    expect(screen.getByText('Not Known')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View all addresses' }));
    expect(onViewAll).toHaveBeenCalled();
  });
  it('AU: last line upper case (Australia Post)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="AU">
        <AddressDisplay address={{ lines: ['54 Stockton Rd'], unit: 'Unit 2', town: 'Bunbury', state: 'WA', postcode: '6230' }} />
      </ClinicalLocaleProvider>,
    );
    expect(lines(container)).toEqual(['Unit 2, 54 Stockton Rd', 'BUNBURY WA 6230']);
  });
  it('NZ: RD and town with postcode; no fixed address', () => {
    const { container, rerender } = render(<AddressDisplay region="NZ" address={{ lines: ['123 Rural Road'], suburb: 'RD 2', town: 'Rangiora', postcode: '7472' }} />);
    expect(lines(container)).toEqual(['123 Rural Road', 'RD 2', 'Rangiora 7472']);
    rerender(<AddressDisplay region="NZ" address={null} noFixedAddress />);
    expect(lines(container)).toEqual(['No fixed address']);
  });
});

describe('AddressDisplay address protection (HISO 10046 3.9, G12 3)', () => {
  const addr = { lines: ['12 Kōwhai Street'], suburb: 'Riccarton', town: 'Christchurch', postcode: '8011' };
  it('masks a protected address by default and hides "View all"', () => {
    const { container } = render(<AddressDisplay region="NZ" address={addr} addressProtected onViewAll={() => {}} />);
    expect(container.textContent).toContain('Address protected');
    expect(container.textContent).not.toContain('Kōwhai');
    expect(screen.queryByRole('button', { name: 'View all addresses' })).toBeNull();
  });
  it('reveals with a reason when the host allows it', () => {
    const onReveal = vi.fn();
    const { container } = render(<AddressDisplay region="NZ" address={addr} addressProtected onRevealProtected={onReveal} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    fireEvent.change(screen.getByLabelText('Reason for viewing (recorded)'), { target: { value: 'Home visit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    expect(onReveal).toHaveBeenCalledWith('Home visit');
    expect(container.textContent).toContain('12 Kōwhai Street');
    expect(container.textContent).toContain('Address protected');
  });
  it('indicator mode shows the address with the marker', () => {
    const { container } = render(<AddressDisplay region="NZ" address={addr} addressProtected protectedDisplay="indicator" />);
    expect(container.textContent).toContain('12 Kōwhai Street');
    expect(container.textContent).toContain('Address protected');
  });
});
