import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import type { AdminMedication } from '../../administration';
import { MobileDrugAgenda } from './MobileDrugAgenda';

afterEach(cleanup);
const d = (h: number, m = 0, day = 27) => new Date(2026, 9, day, h, m);
const now = d(14, 6);
const meds: AdminMedication[] = [
  { id: 'enox', name: 'enoxaparin', details: '40 mg subcutaneous', kind: 'regular', startDate: d(6, 0, 20), events: [{ id: 'e1', scheduledTime: d(6), status: 'withheld', reasonCode: 'W', reasonText: 'platelets low' }] },
  { id: 'para', name: 'paracetamol', details: '1 g oral', kind: 'regular', startDate: d(8, 0, 20), events: [{ id: 'p1', scheduledTime: d(13) }, { id: 'p2', scheduledTime: d(18, 0, 28) }] },
  { id: 'fluc', name: 'flucloxacillin', details: '500 mg oral', kind: 'regular', startDate: d(8, 0, 20), events: [{ id: 'f1', scheduledTime: d(14) }] },
  { id: 'tram', name: 'tramadol', details: '50 mg oral', kind: 'asRequiredUnscheduled', startDate: d(0, 0, 20), asRequired: { minIntervalMinutes: 360 }, events: [{ id: 't1', status: 'given', administeredAt: d(12) }] },
];

describe('MobileDrugAgenda', () => {
  it('lists the day by time with a now line, region codes and words (AU)', () => {
    render(<MobileDrugAgenda medications={meds} now={now} region="AU" medicationAlerts={{ fluc: ['allergy alert'] }} />);
    expect(screen.getByRole('separator', { name: 'Now 14:06' })).toBeTruthy();
    expect(screen.getByText('W: Withheld · platelets low')).toBeTruthy();
    expect(screen.getByText('Overdue by 1hr 6min')).toBeTruthy();
    expect(screen.getByText('Due now · allergy alert')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'When required' })).toBeTruthy();
    expect(screen.getByText('Available from 18:00 · last 12:00')).toBeTruthy();
    const today = screen.getByRole('button', { name: 'Today, Tue 27-Oct-2026' });
    expect(today.getAttribute('aria-current')).toBe('date');
  });
  it('switches days and returns to today', () => {
    const onChange = vi.fn();
    render(<MobileDrugAgenda medications={meds} now={now} region="AU" onSelectedDateChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next day, Wed 28-Oct-2026' }));
    expect(onChange).toHaveBeenLastCalledWith(d(0, 0, 28));
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByText('Scheduled')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Wed 28-Oct-2026. Go to today' }));
    expect(screen.getByRole('separator')).toBeTruthy();
  });
  it('links out from events, when-required medicines and the 4-day chart hint (GB wording)', () => {
    const onOpenEvent = vi.fn();
    const onOpenAsRequired = vi.fn();
    const onOpenChart = vi.fn();
    render(<MobileDrugAgenda medications={meds} now={now} region="GB" onOpenEvent={onOpenEvent} onOpenAsRequired={onOpenAsRequired} onOpenChart={onOpenChart} />);
    expect(screen.getByRole('heading', { name: 'As Required' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /paracetamol 1 g oral Overdue/ }));
    expect(onOpenEvent).toHaveBeenCalledWith(meds[1], meds[1].events[0]);
    fireEvent.click(screen.getByRole('button', { name: /tramadol/ }));
    expect(onOpenAsRequired).toHaveBeenCalledWith(meds[3]);
    expect(screen.getByText('Turn the phone sideways for the 4-day chart.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open 4-day chart' }));
    expect(onOpenChart).toHaveBeenCalled();
    expect(screen.getByText('Withheld · platelets low')).toBeTruthy();
  });
});
