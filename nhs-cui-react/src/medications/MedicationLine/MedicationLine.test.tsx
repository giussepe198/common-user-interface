import React from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MedicationLine } from './MedicationLine';
import { ClinicalLocaleProvider } from '../../core';

const amlodipine = {
  genericName: 'Amlodipine', brandName: 'Norvasc', strength: { kind: 'simple' as const, values: [5], unit: 'mg' }, form: 'tablet',
  route: 'PO', dose: { value: 5, unit: 'mg' }, frequency: 'mane',
};

/** The line keeps dashes and labels with their neighbours using no-break spaces; compare as plain spaces. */
const norm = (s: string | null | undefined) => (s ?? '').replace(/\u00a0/g, ' ');

afterEach(cleanup);

describe('MedicationLine', () => {
  it('GB: bold lower-case generic, capitals brand, labelled bold dose, dashes kept at line ends', () => {
    const { container } = render(<MedicationLine genericName="Diltiazem" brandName="Calcicard CR" form="modified-release tablet" dose={{ value: 120, unit: 'mg' }} route="oral" frequency="three times a day" />);
    expect(norm(container.querySelector('.cui-medication-line__generic')?.textContent)).toBe('diltiazem');
    expect(norm(container.querySelector('.cui-medication-line__brand')?.textContent)).toBe('CALCICARD CR');
    expect(norm(container.querySelector('.cui-medication-line__label')?.textContent)).toBe('DOSE');
    expect(norm(container.querySelector('.cui-medication-line__dose')?.textContent)).toBe('120 mg');
    expect(norm(container.textContent)).toBe('diltiazem – CALCICARD CR – modified-release tablet – DOSE 120 mg – oral – three times a day');
  });
  it('GB never adds mixed case or rewrites abbreviations', () => {
    const { container } = render(<MedicationLine {...amlodipine} />);
    expect(norm(container.textContent)).toContain('amlodipine – NORVASC – 5 mg – tablet – DOSE 5 mg – PO – mane');
  });
  it('AU from the provider: ACSQHC order, Title Case italic brand class, mixed case read as the plain name', () => {
    const { container } = render(<ClinicalLocaleProvider region="AU"><MedicationLine {...amlodipine} /></ClinicalLocaleProvider>);
    const root = container.querySelector('.cui-medication-line')!;
    expect(root.classList.contains('cui-medication-line--au')).toBe(true);
    const generic = container.querySelector('.cui-medication-line__generic')!;
    expect(generic.querySelector('[aria-hidden="true"]')?.textContent).toBe('amLODIPine');
    expect(generic.querySelector('.cui-visually-hidden')?.textContent).toBe('amlodipine');
    expect(norm(container.querySelector('.cui-medication-line__brand [aria-hidden="true"]')?.textContent)).toBe('norVASC');
    const visible = Array.from(container.querySelectorAll('.cui-medication-line__chunk')).map(c => {
      const clone = c.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.cui-visually-hidden').forEach(n => n.remove());
      return norm(clone.textContent);
    });
    expect(visible).toEqual(['amLODIPine 5 mg –', 'norVASC tablet –', 'oral –', 'DOSE 5 mg –', 'in the morning']);
  });
  it('region prop wins over the provider and tallManLettering can be turned off', () => {
    const { container } = render(<ClinicalLocaleProvider region="AU"><MedicationLine {...amlodipine} region="NZ" tallManLettering={false} /></ClinicalLocaleProvider>);
    expect(container.querySelector('.cui-medication-line--nz')).toBeTruthy();
    expect(norm(container.textContent)).toBe('amlodipine – Norvasc – 5 mg – tablet – DOSE 5 mg – oral – in the morning');
  });
  it('NZ: whole numbers, units in full', () => {
    const { container } = render(<MedicationLine region="NZ" genericName="colchicine" dose={{ value: 0.5, unit: 'mg' }} route="po" frequency="BD" />);
    expect(norm(container.textContent)).toBe('colchicine – DOSE 500 microgram – oral – twice a day');
  });
  it('AU brand-only line for 4 or more ingredients lists ingredients for hover and screen readers', () => {
    const { container } = render(<MedicationLine region="AU" brandName="Multivit Plus" ingredients={[{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }]} />);
    const chunk = container.querySelector('.cui-medication-line__chunk--has-ingredients') as HTMLElement;
    expect(chunk.title).toBe('a\nb\nc\nd');
    expect(norm(chunk.textContent)).toContain('containing a + b + c + d');
  });
  it('multi-line layout uses block lines with labels', () => {
    const { container } = render(<MedicationLine layout="multiline" genericName="paracetamol" form="tablet" dose={{ value: 1, unit: 'g' }} route="oral" frequency="every 6 hours" />);
    expect(container.querySelectorAll('.cui-medication-line__line').length).toBe(2);
  });
  it('shows status with suspended date', () => {
    const { container } = render(<MedicationLine genericName="ramipril" status="Suspended" suspendedOn="2026-10-25" />);
    expect(norm(container.textContent)).toContain('Suspended on 25-Oct-2026');
  });
});
