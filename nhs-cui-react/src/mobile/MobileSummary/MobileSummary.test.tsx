import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MobileSummary } from './MobileSummary';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 14, 6);
const at = (h: number, m = 0) => new Date(2026, 9, 27, h, m);
const patient = { name: { familyName: 'Ngata', givenName: 'Mereana', title: 'Ms' }, dateOfBirth: '1958-03-14', identifiers: [{ type: 'nhi' as const, value: 'ZZZ0016' }], allergies: { status: 'none-known' as const } };
const obs = { time: at(13, 40), values: { respiratoryRate: 22, oxygenSaturation: 94, supplementalOxygen: 'oxygen', heartRate: 112, systolicBloodPressure: 120, temperature: 37.2, consciousness: 'A' } };

describe('MobileSummary', () => {
  it('NZ: early warning score with the zone in words, next due and record button', () => {
    const onRecord = vi.fn();
    render(<MobileSummary region="NZ" now={now} patient={patient} earlyWarning={{ observation: obs, nextDueAt: at(14, 40), onRecord }} headerProps={{ detailsSheetProps: { closeOnBrowserBack: false } }} />);
    expect(screen.getByLabelText('EWS 7')).toBeTruthy();
    expect(screen.getByText('Orange zone: EWS 6–7')).toBeTruthy();
    expect(screen.getByText('Last 13:40')).toBeTruthy();
    expect(screen.getByText('14:40')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Record observations' }));
    expect(onRecord).toHaveBeenCalled();
    expect(screen.getByRole('banner', { name: 'Patient' })).toBeTruthy();
  });
  it('lists medicines due by shape and word, alerts, and the tab bar', () => {
    const onOpen = vi.fn();
    const onTab = vi.fn();
    render(
      <MobileSummary
        region="GB"
        now={now}
        patient={patient}
        medicinesDue={[{ id: 'p', state: 'overdue', at: at(13), line: { genericName: 'paracetamol', dose: { value: 1, unit: 'g' } } }]}
        onOpenMedicine={onOpen}
        alerts={[{ id: 'a', message: 'flucloxacillin is a penicillin.', onAction: () => {} }]}
        onTabSelect={onTab}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Overdue 13:00 paracetamol/ }));
    expect(onOpen).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'High priority alert' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Review alert' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Summary' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Medicines' }));
    expect(onTab).toHaveBeenCalledWith('medicines');
  });
  it('GB: NEWS2 shows the response label for the total, not a parameter zone ("Score 2")', () => {
    const news = { time: at(13, 40), values: { respiratoryRate: 22, oxygenSaturation: 95, supplementalOxygen: 'air', systolicBloodPressure: 105, heartRate: 95, consciousness: 'A', temperature: 37 } };
    render(<MobileSummary region="GB" now={now} patient={patient} earlyWarning={{ observation: news }} headerProps={{ detailsSheetProps: { closeOnBrowserBack: false } }} />);
    expect(screen.getByLabelText('NEWS2 5')).toBeTruthy();
    expect(screen.getByText('Medium (score 5–6)')).toBeTruthy();
    expect(screen.queryByText('Score 2')).toBeNull();
  });
  it('no observations and nothing due say so in words', () => {
    render(<MobileSummary now={now} patient={patient} earlyWarning={{}} />);
    expect(screen.getByText('No observations recorded')).toBeTruthy();
    expect(screen.getByText('No medicines due')).toBeTruthy();
  });
});
