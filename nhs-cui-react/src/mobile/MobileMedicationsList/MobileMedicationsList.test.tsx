import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MobileMedicationsList } from './MobileMedicationsList';
import type { MobileMedicationItem } from '../utils/mobileMedications';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const now = new Date(2026, 9, 27, 14, 6);
const at = (h: number, m = 0, d = 27) => new Date(2026, 9, d, h, m);
const meds: MobileMedicationItem[] = [
  { id: 'meto', status: 'Started', line: { genericName: 'metoprolol', route: 'oral', form: 'tablet' }, schedule: { state: 'given', lastGivenAt: at(8, 5) } },
  { id: 'para', status: 'Started', line: { genericName: 'paracetamol', route: 'oral', form: 'tablet' }, schedule: { state: 'overdue', at: at(13) } },
  { id: 'enox', status: 'Started', line: { genericName: 'enoxaparin', route: 'subcutaneous', form: 'injection' }, schedule: { state: 'next', at: at(18) } },
  { id: 'amox', status: 'Completed', endDate: at(10, 0, 22), line: { genericName: 'amoxicillin', route: 'oral' } },
];

describe('MobileMedicationsList', () => {
  it('shows current medicines due first with status words and mixed-case lettering (NZ)', () => {
    render(<MobileMedicationsList medications={meds} now={now} region="NZ" />);
    expect(screen.getByRole('radio', { name: /Current/ }).getAttribute('aria-checked')).toBe('true');
    const items = Array.from(document.querySelectorAll('[data-med-id]')).map(e => e.getAttribute('data-med-id'));
    expect(items).toEqual(['para', 'enox', 'meto']);
    expect(screen.getByText('Overdue 13:00')).toBeTruthy();
    expect(document.body.textContent).toContain('metoPROLOL');
  });
  it('switches to Past and offers sort and group in a bottom sheet with 52 px rows', () => {
    render(<MobileMedicationsList medications={meds} now={now} region="GB" />);
    fireEvent.click(screen.getByRole('radio', { name: /Past/ }));
    expect(screen.getByText('Completed 22-Oct-2026')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /Current/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Group: none' }));
    expect(screen.getByRole('dialog', { name: 'Group medicines' })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Route' }));
    expect(screen.getByRole('heading', { name: 'oral (2)' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Route' }).closest('label')?.className).toContain('cui-mobile-meds__choice');
  });
  it('names the medicines below the visible area (look-ahead, MEDv-048)', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const id = this.dataset?.medId;
      const top = id === 'para' ? 0 : id === 'enox' ? 100 : id === 'meto' ? 400 : 0;
      const bottom = this.classList?.contains('cui-mobile-meds__list') ? 300 : top + 80;
      return { top, bottom, height: bottom - top, left: 0, right: 300, width: 300, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
    });
    render(<MobileMedicationsList medications={meds} now={now} region="NZ" listHeight={300} />);
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(screen.getByRole('button', { name: /1 more medicines below: metoPROLOL/ })).toBeTruthy();
  });
  it('renders the group and sort sheet into a container or in place', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const { rerender, container } = render(<MobileMedicationsList medications={meds} now={now} container={host} closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Group: none' }));
    expect(host.contains(screen.getByRole('dialog', { name: 'Group medicines' }))).toBe(true);
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    rerender(<MobileMedicationsList medications={meds} now={now} portal={false} closeOnBrowserBack={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Group: none' }));
    expect(container.contains(screen.getByRole('dialog', { name: 'Group medicines' }))).toBe(true);
    host.remove();
  });
});
