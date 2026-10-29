import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MhPatientBanner } from './MhPatientBanner';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const NOW = '2026-10-28T03:00:00Z';
const name = { familyName: 'Nguyen', givenName: 'Thi Lan' };
const item = (c: HTMLElement, id: string) => c.querySelector(`[data-banner-item="${id}"]`);

describe('MhPatientBanner', () => {
  it('is one CUI PatientBanner band: the legal name "FAMILY, Given" with "Known as" beside it in Zone 1', () => {
    const { container } = render(<MhPatientBanner name={name} preferredName="Lan" pronouns="she/her" now={NOW} />);
    expect(container.querySelectorAll('.cui-patient-banner')).toHaveLength(1);
    expect(container.querySelector('.cui-patient-name')?.textContent).toContain('NGUYEN, Thi Lan');
    const known = screen.getByText('Known as Lan (she/her)');
    expect(known.closest('.cui-patient-banner__zone1')).toBeTruthy();
    expect(known.closest('[hidden]')).toBeNull();
  });
  it('omits "Known as" when nothing differs', () => {
    render(<MhPatientBanner name={name} preferredName="Thi Lan" now={NOW} />);
    expect(screen.queryByText(/Known as/)).toBeNull();
  });
  it('Born with the CUI age, then Sex in the host words, then the record number, in Zone 1', () => {
    const { container } = render(<MhPatientBanner name={name} dateOfBirth="1990-03-12" sex="Female (example host words)" recordNumber="004512" now={NOW} />);
    const ids = Array.from(container.querySelector('.cui-patient-banner__ids')!.children);
    expect(ids[0]!.textContent).toContain('12-Mar-1990 (36y)');
    expect(ids[1]!.textContent).toBe('Sex Female (example host words)');
    expect(ids[2]!.textContent).toBe('Record number 004512');
  });
  it('says "Not Known" for a missing sex and "No record number", never blank', () => {
    const { container } = render(<MhPatientBanner name={name} now={NOW} />);
    expect(item(container, 'sex')?.textContent).toBe('Sex Not Known');
    expect(item(container, 'record-number')?.textContent).toBe('Record number No record number');
  });
  it('the record number label comes from props', () => {
    const { container } = render(<MhPatientBanner name={name} recordNumber="004512" labels={{ recordNumber: 'URN' }} now={NOW} />);
    expect(item(container, 'record-number')?.textContent).toBe('URN 004512');
  });
  it('legal status in the band: the most restrictive order with its countdown, the unconfirmed words named by the symbol and listed in Zone 2, never as current', () => {
    const open = vi.fn();
    const { container, rerender } = render(
      <MhPatientBanner
        name={name}
        now={NOW}
        onOpenLegalStatus={open}
        legalStatuses={[
          { state: 'unconfirmed', label: 'Treatment order', warning: 'Order may have expired, status not confirmed', countdown: 'passed 3 days ago', countdownTone: 'expired' },
          { state: 'current', label: 'Second order' },
        ]}
      />,
    );
    const legal = item(container, 'legal-status')!;
    expect(legal.textContent).toContain('Legal status Treatment order · passed 3 days ago · and 1 more');
    expect(legal.className).toContain('--warning');
    // The reason is not printed in the band (shared screens): the warning symbol names it and Zone 2 lists it.
    expect(legal.querySelector('[aria-label], [role="img"], title')?.textContent ?? legal.textContent).toContain('Order may have expired, status not confirmed');
    expect(container.querySelector('.cui-patient-banner__zone2-body')!.textContent).toContain('Order may have expired, status not confirmed');
    expect(legal.closest('.cui-patient-banner__zone1')).toBeTruthy();
    fireEvent.click(legal);
    expect(open).toHaveBeenCalled();
    rerender(<MhPatientBanner name={name} now={NOW} legalStatuses={[{ state: 'current', label: 'Order', countdown: 'in 30 days', countdownTone: 'calm' }]} />);
    expect(item(container, 'legal-status')?.textContent).toBe('Legal status Order');
    rerender(<MhPatientBanner name={name} now={NOW} />);
    expect(item(container, 'legal-status')?.textContent).toBe('Legal status No order recorded');
  });
  it('alerts are a count in words with the highest severity symbol, a button to all alerts', () => {
    const onShowAll = vi.fn();
    const { container } = render(
      <MhPatientBanner
        name={name}
        now={NOW}
        onShowAllAlerts={onShowAll}
        alerts={[
          { id: '1', severity: 'moderate', text: 'Prefers female clinicians' },
          { id: '2', severity: 'high', text: 'Two staff for home visits' },
          { id: '3', severity: 'high', text: 'Do not visit alone' },
          { id: '4', severity: 'low', text: 'Hearing aid' },
        ]}
      />,
    );
    const alerts = item(container, 'alerts')!;
    expect(alerts.textContent).toContain('Alerts 2 high, 2 other');
    expect(alerts.querySelector('.cui-alert-symbol')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Alerts: 2 high, 2 other. Show all alerts' }));
    expect(onShowAll).toHaveBeenCalled();
    expect(container.textContent).not.toContain('Two staff for home visits');
  });
  it('says "No alerts recorded" when there are none', () => {
    const { container } = render(<MhPatientBanner name={name} now={NOW} />);
    expect(item(container, 'alerts')?.textContent).toBe('Alerts No alerts recorded');
  });
  it('allergies in Zone 2: known lists them, none known says when checked, missing is "not recorded", never "none known"', () => {
    const { container, rerender } = render(<MhPatientBanner name={name} now={NOW} allergies={{ status: 'known', items: [{ name: 'Penicillin', reaction: 'rash' }] }} />);
    const zone2 = () => container.querySelector('.cui-patient-banner__zone2-titles')!;
    expect(zone2().textContent).toContain('Allergy: Penicillin');
    // Collapsed is one line of names; the reaction and any note are in the expanded list (PAB-0006).
    expect(zone2().textContent).not.toContain('rash');
    expect(container.querySelector('.cui-patient-banner__zone2-body')!.textContent).toContain('Penicillin: rash');
    rerender(<MhPatientBanner name={name} now={NOW} allergies={{ status: 'known', items: [{ name: 'Penicillin', reaction: 'anaphylaxis', note: 'Not yet verified' }, { name: 'Latex' }] }} />);
    expect(zone2().textContent).toContain('Allergies: Penicillin and 1 more');
    const body = container.querySelector('.cui-patient-banner__zone2-body')!.textContent ?? '';
    expect(body).toContain('Penicillin: anaphylaxis');
    expect(body).toContain('Not yet verified');
    expect(body).toContain('Latex');
    rerender(<MhPatientBanner name={name} now={NOW} allergies={{ status: 'none-known', checkedAt: '2026-10-03T00:00:00Z' }} timeZone="Australia/Melbourne" />);
    expect(zone2().textContent).toContain('No known allergies (checked 03-Oct-2026)');
    rerender(<MhPatientBanner name={name} now={NOW} />);
    expect(zone2().textContent).toContain('Allergies not recorded');
    expect(container.textContent).not.toMatch(/No known allergies|Nil known/);
    rerender(<MhPatientBanner name={name} now={NOW} allergies={{ status: 'known', items: [] }} />);
    expect(zone2().textContent).toContain('Allergies not recorded');
  });
  it('Zone 2 is collapsed by default and holds the address, contacts and care team (PAB-0004)', () => {
    const { container } = render(
      <MhPatientBanner
        name={name}
        now={NOW}
        address={{ lines: ['14 Smith St'], town: 'Fitzroy', state: 'VIC', postcode: '3065' }}
        contacts={{ mobile: '0491570156' }}
        careTeam={{ title: 'Care team Adult community', content: 'Key clinician: Jordan Lee' }}
      />,
    );
    expect(container.querySelector('.cui-patient-banner__zone2-body')?.hasAttribute('hidden')).toBe(true);
    expect(container.querySelector('.cui-patient-banner__zone2-titles')?.textContent).toContain('Care team Adult community');
    fireEvent.click(screen.getByRole('button', { name: 'Show more patient details' }));
    expect(container.querySelector('.cui-patient-banner__zone2-body')?.hasAttribute('hidden')).toBe(false);
    expect(screen.getByText('Key clinician: Jordan Lee')).toBeTruthy();
  });
  it('restricted information, a sharing restriction and an interpreter sit in the dark band, never a white chip row', () => {
    const { container } = render(<MhPatientBanner name={name} now={NOW} restricted consent={{ state: 'restricted', text: 'Do not share with father' }} interpreter="Vietnamese" />);
    for (const id of ['restricted', 'consent', 'interpreter']) expect(item(container, id)?.closest('.cui-patient-banner__zone1')).toBeTruthy();
    expect(item(container, 'interpreter')?.textContent).toBe('Interpreter needed Vietnamese');
    expect(container.querySelector('.cui-mh-banner__sections, .cui-mh-banner__chip')).toBeNull();
  });
  it('actions sit at the end of Zone 1', () => {
    const { container } = render(<MhPatientBanner name={name} now={NOW} actions={<button type="button">Safety summary</button>} />);
    expect(container.querySelector('.cui-patient-banner__zone1 .cui-patient-banner__actions')?.textContent).toBe('Safety summary');
  });
  it('identifiers and names are never truncated', () => {
    const long = { familyName: 'Wolfeschlegelsteinhausenbergerdorff', givenName: 'Hubert Blaine Maximilian' };
    const { container } = render(<MhPatientBanner name={long} preferredName="Max" recordNumber="00451200000099" now={NOW} />);
    expect(container.textContent).toContain('WOLFESCHLEGELSTEINHAUSENBERGERDORFF, Hubert Blaine Maximilian');
    expect(container.textContent).toContain('00451200000099');
  });
  it('a deceased person shows Died in words with the deceased look', () => {
    const { container } = render(<MhPatientBanner name={name} now={NOW} dateOfBirth="1990-03-12" deceased="02-Oct-2026" />);
    expect(container.querySelector('.cui-patient-banner--deceased')).toBeTruthy();
    expect(container.querySelector('.cui-patient-banner__death')?.textContent).toContain('02-Oct-2026');
    expect(container.querySelector('.cui-patient-banner__death')?.textContent).toMatch(/^Died/);
  });
  it('shows the emergency access bar at the top of the banner when a grant is active', () => {
    render(<MhPatientBanner name={name} now={NOW} emergencyAccess={{ endsAt: '2026-10-28T04:32:00Z', now: '2026-10-28T03:34:00Z', reason: 'Crisis' }} timeZone="Australia/Melbourne" />);
    expect(screen.getByRole('region', { name: 'Emergency access' }).textContent).toContain('15:32 AEDT');
  });
  it('phone: the CUI MobilePatientHeader with the same items; the expand button opens the details in place', async () => {
    const { container } = render(
      <MhPatientBanner layout="phone" name={name} preferredName="Lan" now={NOW} sex="Female" recordNumber="004512" interpreter="Vietnamese" alerts={[{ id: '1', severity: 'high', text: 'x' }]} address={{ lines: ['14 Smith St'], town: 'Fitzroy', state: 'VIC', postcode: '3065' }} />,
    );
    // The phone header replaces the desktop band.
    await waitFor(() => expect(container.querySelector('.cui-mobile-header')).toBeTruthy());
    expect(container.querySelector('.cui-patient-banner')).toBeNull();
    expect(screen.getByText('Known as Lan')).toBeTruthy();
    expect(item(container, 'alerts')?.textContent).toContain('1 high');
    const details = container.querySelector('.cui-mh-banner__phone-details')!;
    expect(details.hasAttribute('hidden')).toBe(true);
    const toggle = screen.getByRole('button', { name: 'Show all patient details' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(details.hasAttribute('hidden')).toBe(false);
    expect(details.textContent).toContain('Interpreter needed Vietnamese');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('phone: onBack puts a back button before the name; the desktop banner has none [suggested]', async () => {
    const onBack = vi.fn();
    const { unmount } = render(<MhPatientBanner layout="phone" name={name} now={NOW} onBack={onBack} backLabel="Back to today's visits" />);
    fireEvent.click(await screen.findByRole('button', { name: "Back to today's visits" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    unmount();
    render(<MhPatientBanner layout="desktop" name={name} now={NOW} onBack={onBack} backLabel="Back to today's visits" />);
    expect(screen.queryByRole('button', { name: "Back to today's visits" })).toBeNull();
  });
  it('print: light, not sticky, nothing interactive', () => {
    const { container } = render(<MhPatientBanner print name={name} now={NOW} showZone2={false} alerts={[{ id: '1', severity: 'high', text: 'x' }]} onShowAllAlerts={() => {}} actions={<button type="button">Safety summary</button>} />);
    expect(container.querySelector('.cui-mh-banner--print')).toBeTruthy();
    expect(container.querySelector('.cui-mh-banner--sticky')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('NZ: the family name is shown as recorded (G11 2.3)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="NZ">
        <MhPatientBanner name={{ familyName: 'Te Whare', givenName: 'Aroha' }} preferredName="Māia" now={NOW} />
      </ClinicalLocaleProvider>,
    );
    expect(container.querySelector('.cui-patient-name')?.textContent).toContain('Te Whare, Aroha');
    expect(screen.getByText('Known as Māia')).toBeTruthy();
  });
});
