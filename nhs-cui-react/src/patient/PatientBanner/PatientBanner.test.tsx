import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { PatientBanner } from './PatientBanner';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

/** Text without tooltip definitions. */
function txt(el: Element | null): string {
  if (!el) return '';
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
  return c.textContent ?? '';
}
const now = new Date(2026, 9, 27, 10, 0);
const zone1 = (c: HTMLElement) => c.querySelector('.cui-patient-banner__zone1') as HTMLElement;

describe('PatientBanner (GB)', () => {
  it('renders name, Born with age, Gender and NHS No. (PAB-0016, PAB-0034, PAB-0036)', () => {
    const { container } = render(
      <PatientBanner now={now} name={{ familyName: 'Chandrasekhar', givenName: 'subramanyan', title: 'Mr' }} dateOfBirth="1945-07-14" gender="Male" nhsNumber="9990000018" />,
    );
    const z1 = zone1(container);
    expect(txt(z1)).toContain('CHANDRASEKHAR, Subramanyan (Mr)');
    expect(txt(z1)).toContain('Born 14-Jul-1945 (81y)');
    expect(txt(z1)).toContain('Gender Male');
    expect(txt(z1)).toContain('NHS No. 999 000 0018');
    expect(screen.getByRole('region', { name: 'Patient banner: CHANDRASEKHAR, Subramanyan (Mr)' })).toBeTruthy();
  });
  it('shows Not Known for missing items and "Allergies unavailable" without allergy data (PAB-0019)', () => {
    const { container } = render(<PatientBanner now={now} name={{ familyName: 'Smith', givenName: 'John' }} />);
    expect(txt(zone1(container))).toContain('NHS No. Not Known');
    expect(txt(container)).toContain('Allergies unavailable');
    expect(txt(container)).not.toMatch(/\?/);
  });
  it('deceased state shows Died and Age at Death, no living age (PAB-0057..0060)', () => {
    const { container } = render(<PatientBanner now={now} name={{ familyName: 'Oliver', givenName: 'James' }} dateOfBirth="1945-07-14" dateOfDeath="2006-12-06" />);
    expect(txt(container)).toContain('Died 06-Dec-2006');
    expect(txt(container)).toContain('Age at Death 61y');
    expect(container.querySelector('.cui-patient-banner--deceased')).toBeTruthy();
    expect(screen.getByRole('region').getAttribute('aria-label')).toMatch(/deceased$/);
  });
  it('Zone 2 toggles with the keyboard-operable button (PAB-0004, PAB-0006)', () => {
    const onChange = vi.fn();
    render(<PatientBanner now={now} name={{ familyName: 'Smith', givenName: 'John' }} allergies={{ status: 'known', items: [{ name: 'Latex', lastUpdated: '1961-11-14' }] }} onZone2ExpandedChange={onChange} />);
    const btn = screen.getByRole('button', { name: 'Show more patient details' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Hide more patient details' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Latex')).toBeTruthy();
  });
  it('a collapsed title cut with an ellipsis carries its full text as a tooltip (PAB-0025)', () => {
    const sw = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('cui-patient-banner__section-title--address') ? 300 : 0;
    });
    const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    const { container } = render(<PatientBanner now={now} name={{ familyName: 'Smith', givenName: 'John' }} address={{ lines: ['1 Long Street Name'], postcode: 'LS1 1AA' }} />);
    const cut = container.querySelector('.cui-patient-banner__section-title--address') as HTMLElement;
    expect(cut.title).toMatch(/1 Long Street Name/);
    expect(container.querySelector('.cui-patient-banner__section-title--allergies')?.hasAttribute('title')).toBe(false);
    sw.mockRestore();
    cw.mockRestore();
  });
  it('hides clinical information when not permitted (PAB-0008)', () => {
    const { container } = render(<PatientBanner now={now} name={{ familyName: 'Smith', givenName: 'John' }} allergies={{ status: 'none-known' }} showClinicalInformation={false} />);
    expect(txt(container)).not.toContain('No known allergies');
  });
  it('record links call onOpenRecord (PAB-0048)', () => {
    const open = vi.fn();
    render(<PatientBanner now={now} name={{ familyName: 'Smith', givenName: 'John' }} nhsNumber="9990000018" onOpenRecord={open} />);
    fireEvent.click(screen.getByRole('button', { name: /999 000 0018/ }));
    expect(open).toHaveBeenCalledWith('nhsNumber');
  });
});

describe('PatientBanner (AU)', () => {
  const base = { now, name: { familyName: 'Nguyen', givenName: 'mia rose', title: 'Ms' }, dateOfBirth: '1988-03-02', gender: '2' };
  it('IHI and URN labelled, family name upper case, no title (G10 1.6, AU-PI-02)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="AU">
        <PatientBanner {...base} identifiers={[{ type: 'ihi', value: '8003601234567894' }, { type: 'mrn', value: '0042137' }]} />
      </ClinicalLocaleProvider>,
    );
    const z1 = zone1(container);
    expect(txt(z1)).toContain('NGUYEN, Mia Rose');
    expect(txt(z1)).not.toContain('(Ms)');
    expect(txt(z1)).toContain('IHI 8003 6012 3456 7894');
    expect(txt(z1)).toContain('URN 0042137');
    expect(txt(z1)).toContain('Gender Woman or female');
    expect(txt(z1)).not.toContain('NHS');
  });
  it('IHI status qualifier in text and Medicare paired with IRN (AU-ID-01, AU-ID-03)', () => {
    const { container } = render(
      <PatientBanner
        {...base}
        region="AU"
        identifiers={[
          { type: 'ihi', value: '8003601234567894', ihiRecordStatus: 'Unverified' },
          { type: 'medicare', value: '2123456701', irn: '1' },
        ]}
      />,
    );
    expect(txt(zone1(container))).toContain('(Unverified)');
    expect(txt(zone1(container))).toContain('Medicare 2123 45670 1 IRN 1');
  });
  it('allergy wording Nil known / Unknown / Not recorded, not recorded as a warning (AU-AL-01)', () => {
    const { container, rerender } = render(<PatientBanner {...base} region="AU" allergies={{ status: 'none-known', recordedBy: 'RN Kate Lee', recordedAt: '2026-10-20' }} defaultZone2Expanded />);
    expect(txt(container)).toContain('AllergiesNil known');
    expect(txt(container)).toContain('Recorded by RN Kate Lee, 20-Oct-2026');
    rerender(<PatientBanner {...base} region="AU" allergies={{ status: 'not-recorded' }} />);
    expect(container.querySelector('.cui-patient-banner__allergy--warn')?.textContent).toContain('Not recorded');
    rerender(<PatientBanner {...base} region="AU" allergies={{ status: 'unknown' }} />);
    expect(txt(container)).toContain('AllergiesUnknown');
    rerender(<PatientBanner {...base} region="AU" allergies={{ status: 'none-known' }} allergyLabels={{ 'none-known': 'No known allergies' }} />);
    expect(txt(container)).toContain('No known allergies');
  });
  it('single name alone, DD/MM/YYYY option and similar-name warning (AU-NM-01, AU-PI-03, AU-PI-04)', () => {
    const { container } = render(
      <PatientBanner {...base} region="AU" name={{ familyName: 'Ngapanji', givenName: '' }} dateFormat="dd/mm/yyyy" similarNameWarning="Another patient with a similar name is on this ward" />,
    );
    const z1 = zone1(container);
    expect(z1.querySelector('.cui-patient-name')?.textContent).toBe('NGAPANJI');
    expect(txt(z1)).toContain('Born 02/03/1988');
    expect(txt(screen.getByRole('note'))).toContain('similar name');
  });
});

describe('PatientBanner (NZ)', () => {
  it('NHI label, family name as recorded with macrons, te reo gender label (G11 12.6)', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="NZ" teReoLabels>
        <PatientBanner now={now} name={{ familyName: 'Te Huia', givenName: 'Kāhu' }} dateOfBirth="1990-05-01" gender="F" identifiers={[{ type: 'nhi', value: 'zbn77vl' }]} flagTestIdentifiers={false} />
      </ClinicalLocaleProvider>,
    );
    const z1 = zone1(container);
    expect(txt(z1)).toContain('Te Huia, Kāhu');
    expect(txt(z1)).toContain('NHI ZBN77VL');
    expect(txt(z1)).toContain('Female / Wahine');
    expect(z1.querySelector('[lang="mi"]')?.textContent).toBe('Wahine');
  });
  it('flags test NHIs and missing NHI shows Not Known', () => {
    const { container, rerender } = render(<PatientBanner region="NZ" now={now} name={{ familyName: 'Te Huia', givenName: 'Kāhu' }} identifiers={[{ type: 'nhi', value: 'ZAC5361' }]} />);
    expect(txt(zone1(container))).toContain('Test NHI');
    rerender(<PatientBanner region="NZ" now={now} name={{ familyName: 'Te Huia', givenName: 'Kāhu' }} />);
    expect(txt(zone1(container))).toContain('NHI Not Known');
  });
  it('an allergy list is never hidden and an empty list is never "no known" (G11 9.2)', () => {
    const { container, rerender } = render(
      <PatientBanner region="NZ" now={now} name={{ familyName: 'Te Huia', givenName: 'Kāhu' }} allergies={{ status: 'none-known', items: [{ name: 'Penicillin', reaction: 'rash', lastUpdated: '2025-01-02', newThisAdmission: true }] }} defaultZone2Expanded />,
    );
    expect(txt(container)).toContain('Allergies and adverse reactions');
    expect(txt(container)).toContain('Penicillin: rash');
    expect(txt(container)).toContain('New this admission');
    rerender(<PatientBanner region="NZ" now={now} name={{ familyName: 'Te Huia', givenName: 'Kāhu' }} allergies={{ status: 'not-recorded', items: [] }} />);
    expect(txt(container)).not.toMatch(/No known allergies/);
    const section = container.querySelector('.cui-patient-banner__section-title--allergies') as HTMLElement;
    expect(within(section).getByText('Not recorded')).toBeTruthy();
  });
  it('unidentified patient qualifier (G11 2.5)', () => {
    render(<PatientBanner region="NZ" now={now} name={{ familyName: 'Unknown', givenName: 'Male 3' }} unidentified />);
    expect(screen.getByText('Unidentified patient')).toBeTruthy();
    expect(screen.getByRole('region').getAttribute('aria-label')).toContain('unidentified patient');
  });
});

describe('PatientBanner identity extensions (G12)', () => {
  const nz = { familyName: 'Te Huia', givenName: 'Kāhu' };
  it('partial date of birth: no invented day, qualifier and age range (G12 5)', () => {
    const { container, rerender } = render(<PatientBanner region="NZ" now={now} name={nz} dateOfBirth="1975" />);
    expect(txt(zone1(container))).toContain('Born 1975year only (50y or 51y)');
    expect(txt(zone1(container))).not.toContain('01-Jan-1975');
    rerender(<PatientBanner region="NZ" now={now} name={nz} partialDateOfBirth="197503" />);
    expect(txt(zone1(container))).toContain('Born Mar-1975day not known (51y)');
    rerender(<PatientBanner region="NZ" now={now} name={nz} partialDateOfBirth="19750314" />);
    expect(txt(zone1(container))).toContain('Born 14-Mar-1975 (51y)');
  });
  it('name protection indicator, and protected address and contacts masked (G12 3)', () => {
    const onReveal = vi.fn();
    const { container } = render(
      <PatientBanner
        region="NZ"
        now={now}
        name={nz}
        nameProtected
        address={{ lines: ['12 Kōwhai Street'], town: 'Christchurch', postcode: '8011', protected: true }}
        contacts={{ mobile: '021 123 4567', protected: true }}
        onRevealProtected={onReveal}
        defaultZone2Expanded
      />,
    );
    expect(txt(zone1(container))).toContain('Te Huia, Kāhu');
    expect(txt(zone1(container))).toContain('Name protected');
    expect(screen.getByRole('region', { name: /name protected/ })).toBeTruthy();
    expect(txt(container)).toContain('Address protected');
    expect(txt(container)).toContain('Contact details protected');
    expect(txt(container)).not.toContain('Kōwhai');
    expect(txt(container)).not.toContain('021');
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    fireEvent.change(screen.getByLabelText('Reason for viewing (recorded)'), { target: { value: 'Ambulance dispatch' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show address' }));
    expect(onReveal).toHaveBeenCalledWith('address', 'Ambulance dispatch');
    expect(txt(container)).toContain('12 Kōwhai Street');
  });
  it('dormant NHI points to the live NHI (G12 4)', () => {
    const onUse = vi.fn();
    const { container } = render(
      <PatientBanner
        region="NZ"
        now={now}
        name={nz}
        identifiers={[{ type: 'nhi', value: 'ZAC5361', nhiStatus: 'dormant', liveNhi: 'ZBN77VL' }]}
        flagTestIdentifiers={false}
        onUseLiveNhi={onUse}
      />,
    );
    expect(txt(zone1(container))).toContain('Dormant NHI');
    expect(txt(zone1(container))).toContain('Live NHI: ZBN77VL');
    fireEvent.click(screen.getByRole('button', { name: 'Use live NHI' }));
    expect(onUse).toHaveBeenCalledWith('ZBN77VL');
  });
  it('AU Medicare valid to with expired card in text (G12 1)', () => {
    const { container } = render(
      <PatientBanner
        region="AU"
        now={now}
        name={{ familyName: 'Nguyen', givenName: 'Lan' }}
        identifiers={[
          { type: 'mrn', value: '1234567' },
          { type: 'medicare', value: '2123456701', irn: '1', medicareValidTo: '09/2026' },
        ]}
      />,
    );
    expect(txt(zone1(container))).toContain('Medicare 2123 45670 1 IRN 1, Valid to 09/2026');
    expect(txt(zone1(container))).toContain('Card expired');
  });
  it('AU My Health Record: compact state, access options and emergency indicator (AU-PV-01, AU-PV-02)', async () => {
    const onEmergency = vi.fn();
    const { container, rerender } = render(
      <PatientBanner
        region="AU"
        now={now}
        name={{ familyName: 'Nguyen', givenName: 'Lan' }}
        myHealthRecord={{ state: 'access-code-required', onSubmitAccessCode: () => {}, onEmergencyAccess: onEmergency }}
      />,
    );
    await waitFor(() => expect(txt(zone1(container))).toContain('My Health RecordAccess code required'));
    fireEvent.click(screen.getByRole('button', { name: 'Access options' }));
    expect(screen.getByLabelText('Record access code')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Emergency access' })).toBeTruthy();
    rerender(
      <PatientBanner
        region="AU"
        now={now}
        name={{ familyName: 'Nguyen', givenName: 'Lan' }}
        myHealthRecord={{ state: 'emergency-access', emergencyAccessFrom: now }}
      />,
    );
    expect(txt(zone1(container))).toContain('Emergency access');
    expect(txt(zone1(container))).toContain('until 01-Nov-2026 10:00');
  });
});

describe('PatientBanner layout (CONVENTIONS Responsive)', () => {
  it('passes the identifier column count as a CSS variable, so the narrow layout can wrap the identifiers', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="AU">
        <PatientBanner now={now} name={{ familyName: 'Nguyen', givenName: 'Mia' }} identifiers={[{ type: 'ihi', value: '8003601234567894' }, { type: 'mrn', value: '0042137' }]} />
      </ClinicalLocaleProvider>,
    );
    const ids = container.querySelector('.cui-patient-banner__ids') as HTMLElement;
    expect(ids.style.gridTemplateColumns).toBe('');
    expect(ids.style.getPropertyValue('--cui-banner-id-columns')).toBe('4');
  });

  describe('host extensions', () => {
    it('adds labelled items after Born or after the identifiers, a name extension, a leading slot and actions', () => {
      const onSelect = vi.fn();
      const { container } = render(
        <PatientBanner
          region="AU"
          name={{ familyName: 'Chen', givenName: 'Wei' }}
          dateOfBirth="1949-09-02"
          now="2026-10-27"
          showGender={false}
          requirePrimaryIdentifier={false}
          identifiers={[{ type: 'medicare', value: '2123456701', irn: '1' }]}
          nameExtension={<span>Known as Wei (he/him)</span>}
          leading={<span data-testid="lead">L</span>}
          actions={<button type="button">Safety summary</button>}
          items={[
            { id: 'sex', label: 'Sex', value: 'Male', placement: 'after-born' },
            { id: 'count', label: 'Alerts', value: '2 high', tone: 'alert', onSelect, selectLabel: 'Alerts: 2 high' },
            { id: 'empty', label: 'Interpreter', value: '' },
          ]}
        />,
      );
      const ids = Array.from(container.querySelector('.cui-patient-banner__ids')!.children).map((c) => txt(c));
      expect(ids[0]).toMatch(/^Born/);
      expect(ids[1]).toBe('Sex Male');
      expect(ids[2]).toMatch(/^Medicare/);
      expect(ids.some((t) => t === 'Interpreter Not Known')).toBe(true);
      expect(container.textContent).not.toContain('Gender');
      expect(container.textContent).not.toContain('IHI');
      expect(screen.getByText('Known as Wei (he/him)').closest('.cui-patient-banner__name-block')).toBeTruthy();
      expect(screen.getByTestId('lead').closest('.cui-patient-banner__leading')).toBeTruthy();
      expect(container.querySelector('.cui-patient-banner__actions')?.textContent).toBe('Safety summary');
      const count = screen.getByRole('button', { name: 'Alerts: 2 high' });
      expect(count.getAttribute('data-banner-item')).toBe('count');
      expect(count.className).toContain('cui-patient-banner__item--alert');
      fireEvent.click(count);
      expect(onSelect).toHaveBeenCalled();
    });
    it('shows host-formatted Born and Died values and a host-rendered name', () => {
      const { container } = render(
        <PatientBanner name={{ familyName: 'Chen', givenName: 'Wei' }} nameContent={<h2>CHEN, Wei</h2>} dateOfBirthDisplay="02-Sep-1949 (77y)" dateOfDeathDisplay="02-Oct-2026" now="2026-10-27" />,
      );
      expect(screen.getByRole('heading', { name: 'CHEN, Wei' })).toBeTruthy();
      expect(txt(container.querySelector('.cui-patient-banner__born'))).toBe('Born 02-Sep-1949 (77y)');
      expect(container.querySelector('.cui-patient-banner--deceased')).toBeTruthy();
      expect(txt(container.querySelector('.cui-patient-banner__death'))).toBe('Died 02-Oct-2026');
    });
    it('a similar-name warning may hold a link', () => {
      render(<PatientBanner name={{ familyName: 'Chen', givenName: 'Wei' }} similarNameWarning={<a href="#compare">Similar name on the ward</a>} />);
      expect(screen.getByRole('link', { name: 'Similar name on the ward' })).toBeTruthy();
    });
  });
});
