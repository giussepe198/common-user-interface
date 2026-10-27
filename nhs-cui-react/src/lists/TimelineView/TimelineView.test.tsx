import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { TimelineView, type TimelineSection } from './TimelineView';

afterEach(cleanup);

const t = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);
const now = t(27, 14);
const sections: TimelineSection[] = [
  {
    id: 'meds', title: 'Medications', defaultLevelOfDetail: 'names',
    eventSets: [
      { id: 'admin', label: 'Administrations', kind: 'administrations', defaultShown: true },
      { id: 'inr', label: 'INR results', defaultShown: true },
    ],
    rows: [
      { id: 'w', label: 'Warfarin', entries: [
        { id: 'w1', kind: 'known', start: t(27, 0), end: t(27, 20), labelFields: ['Warfarin', '3 mg', 'oral', 'once a day'],
          events: { admin: [{ id: 'a1', time: t(27, 6), label: 'Given 3 mg', status: 'given' }], inr: [{ id: 'i1', time: t(27, 9), label: 'INR 2.4', glyph: 'I' }] } },
      ] },
      { id: 'p', label: 'Paracetamol', entries: [
        { id: 'p1', kind: 'point', start: t(27, 8), labelFields: ['Paracetamol', '1 g', 'oral', 'once only'] },
        { id: 'p2', kind: 'point', start: t(27, 8, 20), labelFields: ['Paracetamol soluble', '500 mg', 'oral', 'once only'] },
      ] },
    ],
  },
];
const banner = <div>SMITH, John</div>;
const view = (extra = {}) => render(<TimelineView patientBanner={banner} sections={sections} now={now} defaultPeriod="24h" defaultViewStart={t(26, 20)} {...extra} />);

describe('TimelineView', () => {
  it('renders the banner, sections, entries and a now line', () => {
    const { container } = view();
    expect(screen.getByText('SMITH, John')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Medications/ })).toBeTruthy();
    expect(screen.getByText('26-Oct-2026 20:00 to 27-Oct-2026 20:00')).toBeTruthy();
    expect(container.querySelector('.cui-timeline__now')).toBeTruthy();
  });
  it('moves between entries with the arrow keys and activates with Enter', () => {
    const onEntryActivate = vi.fn();
    view({ onEntryActivate });
    const first = screen.getByRole('button', { name: /^Warfarin 3 mg oral once a day, from/ });
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(onEntryActivate).toHaveBeenCalledWith(expect.objectContaining({ id: 'w1' }), expect.objectContaining({ id: 'w' }));
  });
  it('related events: only the INR set at "Names"; administrations need "Full details" (TLN-1000, 1060)', () => {
    const { container } = view();
    const admin = screen.getByLabelText('Administrations') as HTMLInputElement;
    expect(admin.disabled).toBe(true);
    expect(admin.checked).toBe(false);
    expect(screen.getByRole('img', { name: /INR results: INR 2.4, 27-Oct-2026 09:00/ })).toBeTruthy();
    expect(container.querySelector('.cui-timeline__id-event')?.textContent).toBe('INR results');
    fireEvent.change(screen.getByRole('combobox', { name: 'Detail' }), { target: { value: 'full' } });
    expect((screen.getByLabelText('Administrations') as HTMLInputElement).checked).toBe(true);
    expect(screen.getByRole('img', { name: /Given, Given 3 mg/ })).toBeTruthy();
    // events are included in the entry's accessible name for keyboard users (TLN-0950)
    expect(screen.getByRole('button', { name: /Administrations: Given 3 mg, 27-Oct-2026 06:00/ })).toBeTruthy();
  });
  it('offers one-line labels from the row identifier cell when labels overlap (TLN-0630)', () => {
    view();
    const toggle = screen.getByRole('button', { name: 'Show labels on one line: Paracetamol' });
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Stack labels to show them in full: Paracetamol' }).getAttribute('aria-pressed')).toBe('false');
  });
  it('changes the period and jumps by it (TLN-1070, 1110)', () => {
    const onPeriodChange = vi.fn();
    view({ onPeriodChange });
    fireEvent.change(screen.getByRole('combobox', { name: 'Time period' }), { target: { value: '12h' } });
    expect(onPeriodChange).toHaveBeenCalledWith('12h');
    fireEvent.click(screen.getByRole('button', { name: 'Jump 12 hours earlier' }));
  });
  it('patientBanner is optional: no banner container when absent', () => {
    const { container } = render(<TimelineView sections={sections} now={now} defaultPeriod="24h" defaultViewStart={t(26, 20)} />);
    expect(container.querySelector('.cui-timeline__banner')).toBeNull();
    cleanup();
    const r = view();
    expect(r.container.querySelector('.cui-timeline__banner')?.textContent).toBe('SMITH, John');
  });
});
