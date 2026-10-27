import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { VitalSignsChart } from './VitalSignsChart';
import { ClinicalLocaleProvider } from '../../core';
import { EWS_NEWS2 } from '../utils/regions/earlyWarning';

afterEach(cleanup);

const sets = [
  { time: '2026-10-27T08:00', values: { respiratoryRate: 16, oxygenSaturation: 97, supplementalOxygen: 'air', heartRate: 72, systolicBloodPressure: 130, temperature: 36.8, consciousness: 'A' } },
  { time: '2026-10-27T12:00', values: { respiratoryRate: 26, oxygenSaturation: 93, supplementalOxygen: 'oxygen', heartRate: 112, systolicBloodPressure: 98, temperature: 38.4, consciousness: 'A' } },
];

describe('VitalSignsChart', () => {
  it('NZ: draws the NZEWS bands with each value in its band and the total with its zone in words', () => {
    const { container } = render(<ClinicalLocaleProvider region="NZ"><VitalSignsChart observations={sets} showSummary={false} /></ClinicalLocaleProvider>);
    expect(screen.getByText('Time (24 hour)')).toBeTruthy();
    expect(screen.getAllByText('25–35').length).toBe(1);
    const marked = container.querySelectorAll('.cui-vsc__cell--marked');
    expect(marked.length).toBe(14);
    expect(screen.getByText(/breaths\/min, score 3, Red zone/)).toBeTruthy();
    const total = container.querySelectorAll('.cui-vsc__total');
    expect(total[0].textContent).toBe('0');
    expect(total[1].textContent).toMatch(/^12Blue \(RRT\)/);
    expect(screen.getByText(/ESCALATE CARE FOR ANY PATIENT/)).toBeTruthy();
  });
  it('switches to the compact table with the layout button', () => {
    const { container } = render(<VitalSignsChart observations={sets} definition={EWS_NEWS2} showSummary={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show compact table' }));
    expect(container.querySelector('.cui-vsc__table--compact')).toBeTruthy();
    const rows = container.querySelectorAll('.cui-vsc__compact-row');
    expect(rows).toHaveLength(EWS_NEWS2.parameters.length);
    expect(within(rows[0] as HTMLElement).getByText('26')).toBeTruthy();
  });
  it('shows a modification next to its parameter and marks the cell', () => {
    const mods = [{ id: 'm', parameterId: 'heartRate', from: 110, to: 120, score: 0, label: 'HR 110–119', reason: 'Beta-agonist', authorisedBy: 'Dr P', startedAt: '2026-10-27T00:00', durationHours: 24, signed: true }];
    const { container } = render(<VitalSignsChart region="NZ" observations={sets} modifications={mods} showSummary={false} />);
    expect(screen.getByText(/Modified trigger:/)).toBeTruthy();
    expect(container.querySelector('.cui-vsc__cell--modified')).toBeTruthy();
  });
  it('AU: placeholder notice and the additional observations rows (AU-OB-02)', () => {
    render(<VitalSignsChart region="AU" observations={[{ time: '2026-10-27T08:00', values: { respiratoryRate: 18 }, notes: { concern: 'Daughter worried' } }]} showSummary={false} />);
    expect(screen.getByText(/placeholder scores and colours/)).toBeTruthy();
    expect(screen.getByText('Staff, patient or family concern')).toBeTruthy();
    expect(screen.getByText('Daughter worried')).toBeTruthy();
    expect(screen.getByText('Incomplete')).toBeTruthy();
  });
  it('says when there are no observations', () => {
    render(<VitalSignsChart observations={[]} />);
    expect(screen.getAllByText('No observations recorded').length).toBeGreaterThan(0);
  });
});

describe('VitalSignsChart: critical thresholds and NSW Between the Flags', () => {
  it('boxes critical values and lists the limits without changing the score (GTAB-177)', () => {
    const { container } = render(<VitalSignsChart observations={sets} defaultLayout="compact" criticalThresholds={[{ direction: 'high', value: 38, appliesTo: 'temperature' }]} />);
    expect(container.querySelectorAll('.cui-vsc__table .cui-vsc__mark--critical')).toHaveLength(1);
    expect(screen.getByText(/Critical limits: Temperature: Critical high ≥ 38 °C/)).toBeTruthy();
    expect(container.querySelector('.cui-vsc__table .cui-vsc__mark--critical')?.textContent).toMatch(/38.4.*critical high/);
  });
  it('shows zones instead of totals for the BTF preset and asks for local verification', async () => {
    const { EWS_NSW_BTF } = await import('../utils/regions/earlyWarning');
    const btf = [
      { time: '2026-10-27T08:00', values: { respiratoryRate: 16, oxygenSaturation: 97, supplementalOxygen: 'none', heartRate: 72, systolicBloodPressure: 130, temperature: 36.8, consciousness: 'A' } },
      { time: '2026-10-27T12:00', values: { respiratoryRate: 26, oxygenSaturation: 97, supplementalOxygen: 'none', heartRate: 72, systolicBloodPressure: 130, temperature: 36.8, consciousness: 'A' } },
    ];
    const { container } = render(<ClinicalLocaleProvider region="AU"><VitalSignsChart observations={btf} definition={EWS_NSW_BTF} defaultLayout="compact" /></ClinicalLocaleProvider>);
    expect(screen.getAllByText(/Verify the zone boundaries/).length).toBeGreaterThan(0);
    const totals = [...container.querySelectorAll('.cui-vsc__total-num')].map(e => e.textContent);
    expect(totals).toEqual(['Within the flags', 'Yellow']);
    expect(screen.getAllByText('Yellow Zone: Clinical Review').length).toBeGreaterThan(0);
  });
  it('AU: the ADDS placeholder warning is shown once, with the summary embedded', () => {
    const { container } = render(<VitalSignsChart region="AU" observations={[{ time: '2026-10-27T08:00', values: { respiratoryRate: 18, heartRate: 90 } }]} />);
    expect(container.querySelector('.cui-ews-summary')).toBeTruthy();
    expect(screen.getAllByText(/placeholder scores/i).length).toBe(1);
  });
});
