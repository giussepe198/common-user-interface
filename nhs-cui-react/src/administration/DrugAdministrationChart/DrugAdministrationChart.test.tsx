import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { DrugAdministrationChart } from './DrugAdministrationChart';
import type { AdminMedication } from '../utils/adminEvents';

afterEach(cleanup);
beforeAll(() => {
  const g = globalThis as unknown as { CSS?: { escape?: (s: string) => string } };
  if (!g.CSS) g.CSS = {};
  if (!g.CSS.escape) g.CSS.escape = (s: string) => s.replace(/["\\]/g, '\\$&');
  Element.prototype.scrollIntoView = function () {};
});

const at = (d: number, h: number, m = 0) => new Date(2026, 4, d, h, m);
const NOW = at(27, 10, 20);
const meds: AdminMedication[] = [
  {
    id: 'amox',
    name: 'Amoxicillin',
    details: '500 mg capsules, oral, three times a day',
    kind: 'regular',
    route: 'oral',
    prescriber: 'Dr J Fictional',
    startDate: at(25, 8),
    startIsActual: true,
    scheduledTimes: ['08:00', '14:00', '22:00'],
    events: [
      { id: 'a1', scheduledTime: at(26, 8), status: 'given', administeredAt: at(26, 8, 5) },
      { id: 'a2', scheduledTime: at(26, 14), status: 'withheld', reasonCode: 'W', reasonText: 'Diarrhoea' },
      { id: 'a3', scheduledTime: at(27, 8) },
      { id: 'a4', scheduledTime: at(27, 14) },
    ],
  },
  {
    id: 'para',
    name: 'Paracetamol',
    details: '1 g, oral, up to every 4 hours',
    kind: 'asRequiredUnscheduled',
    route: 'oral',
    startDate: at(24, 9),
    asRequired: { criteria: 'For pain', minIntervalMinutes: 240 },
    events: [],
  },
  {
    id: 'enox',
    name: 'Enoxaparin',
    details: '40 mg, subcutaneous, every 6 hours',
    kind: 'regular',
    startDate: at(20, 18),
    startIsActual: true,
    scheduledTimes: ['06:00', '12:00', '18:00', '24:00'],
    events: [{ id: 'e1', scheduledTime: at(27, 12) }],
  },
];

describe('DrugAdministrationChart', () => {
  it('shows four days with today labelled, and the status counts (MEDa-0016, 0079)', () => {
    render(<DrugAdministrationChart medications={meds} now={NOW} />);
    const heads = screen.getAllByRole('columnheader').map(h => h.textContent);
    expect(heads).toEqual(['Medication', '25-May-2026', '26-May-2026', 'Today: 27-May-2026(selected day)Choose a day', '28-May-2026']);
    const status = document.querySelector('.cui-dac__status')!;
    expect(status.textContent).toContain('Overdue 1');
    expect(status.textContent).toContain('As Required 1 of 1 available');
  });

  it('renders the drug details with MedicationLine by default (MEDa-0265)', () => {
    const { container } = render(<DrugAdministrationChart medications={meds} now={NOW} />);
    expect(container.querySelectorAll('.cui-dac-lhp__line .cui-medication-line').length).toBe(3);
    expect(container.querySelector('.cui-dac-lhp__line')!.textContent!.toLowerCase()).toContain('amoxicillin');
  });

  it('uses renderMedicationLine when given', () => {
    render(<DrugAdministrationChart medications={meds} now={NOW} renderMedicationLine={m => <span data-testid="custom">{m.id}</span>} />);
    expect(screen.getAllByTestId('custom').map(e => e.textContent)).toEqual(['amox', 'para', 'enox']);
  });

  it('moves through the grid with arrow keys, Home and End (keyboard)', () => {
    const { container } = render(<DrugAdministrationChart medications={meds} now={NOW} />);
    const first = container.querySelector<HTMLElement>('[data-nav="0:0:0"]')!;
    expect(first.tabIndex).toBe(0);
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect((document.activeElement as HTMLElement).dataset.nav).toBe('0:1:0');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect((document.activeElement as HTMLElement).dataset.nav).toBe('0:3:0');
    expect(document.activeElement!.getAttribute('aria-label')).toContain('Overdue 08:00');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect((document.activeElement as HTMLElement).dataset.nav).toBe('0:3:1');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect((document.activeElement as HTMLElement).dataset.nav!.startsWith('1:3')).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect((document.activeElement as HTMLElement).dataset.nav).toBe('1:0:0');
    fireEvent.keyDown(document.activeElement!, { key: 'End', ctrlKey: true });
    expect((document.activeElement as HTMLElement).dataset.nav!.startsWith('2:4')).toBe(true);
  });

  it('opens the recording form from an Overdue event and closes it with Esc (MEDa-0190)', () => {
    const onRecord = vi.fn();
    render(<DrugAdministrationChart medications={meds} now={NOW} onRecord={onRecord} />);
    fireEvent.click(screen.getByRole('button', { name: /^Overdue 08:00, Amoxicillin/ }));
    const form = screen.getByRole('dialog', { name: 'Record administration' });
    expect(form).toBeTruthy();
    expect(document.querySelectorAll('.cui-dac__row--dimmed').length).toBe(2); // MEDa-0194
    fireEvent.keyDown(form, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Record administration' })).toBeNull();
  });

  it('keeps the list order until "Update list order" (MEDa-0021, 0032)', () => {
    render(<DrugAdministrationChart medications={meds} now={NOW} />);
    expect((screen.getByRole('button', { name: 'Update list order' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('navigates days with the arrows (MEDa-0033)', () => {
    render(<DrugAdministrationChart medications={meds} now={NOW} />);
    fireEvent.click(screen.getByRole('button', { name: 'Previous day' }));
    expect(screen.getAllByRole('columnheader')[3].textContent).toContain('26-May-2026');
  });

  it('AU: "When required", NIMC codes in cells and legend, midnight note', () => {
    const { container } = render(<DrugAdministrationChart medications={meds} now={NOW} region="AU" />);
    expect(container.querySelector('.cui-dac__status')!.textContent).toContain('When required 1 of 1 available');
    expect(screen.getByRole('button', { name: /^W Withheld \(Withheld – enter reason in clinical record\)/ })).toBeTruthy();
    const legend = screen.getByRole('note', { name: 'Reason for not administering' });
    expect(within(legend).getAllByText(/./).length).toBeGreaterThan(5);
    expect(legend.textContent).toContain('Not available');
    expect(legend.textContent).not.toContain('Parent');
    expect(container.querySelector('.cui-dac-lhp__midnight')!.textContent).toContain('Avoid midnight');
    expect(container.querySelector('.cui-dac-lhp__tag')!.textContent).toBe('When required');
  });

  it('NZ: code legend, no midnight note; GB: no legend', () => {
    const { container, unmount } = render(<DrugAdministrationChart medications={meds} now={NOW} region="NZ" />);
    expect(screen.getByRole('note', { name: 'Non-administration codes' }).textContent).toContain('RV');
    expect(container.querySelector('.cui-dac-lhp__midnight')).toBeNull();
    unmount();
    render(<DrugAdministrationChart medications={meds} now={NOW} />);
    expect(screen.queryByRole('note', { name: /codes|administering/ })).toBeNull();
  });

  it('shows the code legend wording in the event details popover (AU-MD-08)', () => {
    render(<DrugAdministrationChart medications={meds} now={NOW} region="AU" defaultSelectedDate={at(26, 0)} />);
    fireEvent.click(screen.getByRole('button', { name: /^W Withheld/ }));
    const pop = screen.getByRole('dialog', { name: /Administration details/ });
    expect(pop.textContent).toContain('W Withheld');
    expect(pop.textContent).toContain('Withheld – enter reason in clinical record');
    expect(pop.textContent).toContain('Reason: Diarrhoea');
    fireEvent.keyDown(pop, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Administration details/ })).toBeNull();
  });

  it('labels a 24:00 schedule on the time scale as 00:00 at both edges, never 24:00 (MEDa-0235, 0237; D+Tb-0009)', () => {
    const { container } = render(<DrugAdministrationChart medications={meds} now={NOW} />);
    const scales = Array.from(container.querySelectorAll('.cui-dac__scale'));
    const texts = scales.map(sc => Array.from(sc.querySelectorAll('.cui-dac__scale-label')).map(l => l.textContent));
    const enox = scales[texts.findIndex(t => t.includes('06:00') && t.includes('18:00'))];
    expect(Array.from(enox.querySelectorAll('.cui-dac__scale-label')).map(l => l.textContent)).toEqual(['00:00', '06:00', '12:00', '18:00', '00:00']);
    const edges = enox.querySelectorAll('.cui-dac__scale-label--midnight');
    expect(edges.length).toBe(2);
    expect(edges[0].getAttribute('title')).toMatch(/Scheduled at midnight/);
    expect(container.textContent).not.toContain('24:00');
    const other = scales.find(sc => sc !== enox && sc.querySelectorAll('.cui-dac__scale-label').length > 2)!;
    expect(other.querySelectorAll('.cui-dac__scale-label--midnight').length).toBe(0);
  });
});

describe('look-ahead cut-line rule (MEDa-0039)', () => {
  const amlo: AdminMedication = {
    id: 'amlo', name: 'amlodipine', kind: 'regular', route: 'oral', prescriber: 'Dr J Fictional', startDate: at(25, 8), startIsActual: true,
    scheduledTimes: ['08:00'], events: [{ id: 'm1', scheduledTime: at(27, 8), status: 'given', administeredAt: at(27, 8, 2) }],
  };
  /** Fake layout: each medication row is 100 px tall, stacked; the body viewport is `viewport` px high. */
  const withLayout = (viewport: number, scrollTop: number, run: () => void) => {
    const proto = HTMLElement.prototype;
    const saved = ['offsetTop', 'offsetHeight', 'clientHeight', 'scrollTop'].map(k => [k, Object.getOwnPropertyDescriptor(proto, k)] as const);
    const rowIndex = (el: HTMLElement) => [...(el.parentElement?.querySelectorAll('[data-med-row]') ?? [])].indexOf(el);
    Object.defineProperty(proto, 'offsetTop', { configurable: true, get(this: HTMLElement) { return this.dataset.medRow ? rowIndex(this) * 100 : 0; } });
    Object.defineProperty(proto, 'offsetHeight', { configurable: true, get(this: HTMLElement) { return this.dataset.medRow ? 100 : 0; } });
    Object.defineProperty(proto, 'clientHeight', { configurable: true, get(this: HTMLElement) { return this.classList.contains('cui-dac__body') ? viewport : 0; } });
    Object.defineProperty(proto, 'scrollTop', { configurable: true, get(this: HTMLElement) { return this.classList.contains('cui-dac__body') ? scrollTop : 0; }, set() {} });
    try {
      run();
    } finally {
      saved.forEach(([k, d]) => (d ? Object.defineProperty(proto, k, d) : delete (proto as unknown as Record<string, unknown>)[k]));
    }
  };
  const below = () => screen.queryByRole('navigation', { name: 'Medications below' });

  it('names the last line when only a sliver of it is in view (reported: amlodipine almost hidden, Below empty)', () => {
    withLayout(310, 0, () => {
      render(<DrugAdministrationChart medications={[...meds, amlo]} now={NOW} />);
      const rows = [...document.querySelectorAll<HTMLElement>('[data-med-row]')].map(r => r.dataset.medRow);
      const last = rows[rows.length - 1]!;
      const nav = below();
      expect(nav).toBeTruthy();
      const name = [...meds, amlo].find(m => m.id === last)!.name;
      expect(within(nav!).getByRole('button', { name: new RegExp(name, 'i') })).toBeTruthy();
    });
  });
  it('does not name a line whose name and first line are in view', () => {
    withLayout(250, 0, () => {
      render(<DrugAdministrationChart medications={meds} now={NOW} />);
      // Two rows: the second (top at 100) shows 150 px, so nothing is out of view.
      expect(below()).toBeNull();
    });
  });
  it('names a line above when only a sliver of it remains at the top', () => {
    withLayout(150, 90, () => {
      render(<DrugAdministrationChart medications={meds} now={NOW} />);
      expect(screen.getByRole('navigation', { name: 'Medications above' })).toBeTruthy();
    });
  });
});
