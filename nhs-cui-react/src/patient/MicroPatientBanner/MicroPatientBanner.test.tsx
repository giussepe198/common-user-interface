import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MicroPatientBanner } from './MicroPatientBanner';

afterEach(cleanup);

/** Text without tooltip definitions. */
function txt(el: Element | null): string {
  if (!el) return '';
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
  return c.textContent ?? '';
}
const now = new Date(2026, 9, 27, 10, 0);

describe('MicroPatientBanner', () => {
  it('GB: name, Born with age and NHS No.; gender only in Zone 2 (MPB-0017, MPB-0028)', () => {
    const { container } = render(<MicroPatientBanner now={now} name={{ familyName: 'Evans', givenName: 'anne', title: 'Dr' }} dateOfBirth="2025-08-01" nhsNumber="9990000026" gender="Female" />);
    const z1 = container.querySelector('.cui-micro-banner__zone1') as HTMLElement;
    expect(txt(z1)).toContain('EVANS, Anne (Dr)');
    expect(txt(z1)).toContain('NHS No. 999 000 0026');
    expect(txt(z1)).not.toContain('Female');
    const toggle = screen.getByRole('button', { name: /Gender and address/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(txt(container)).toContain('Gender Female');
  });
  it('hides the title and its parentheses when asked (MPB-0051)', () => {
    const { container } = render(<MicroPatientBanner now={now} showTitle={false} name={{ familyName: 'Evans', givenName: 'Anne', title: 'Dr' }} />);
    expect(txt(container)).not.toContain('(Dr)');
  });
  it('AU: IHI and URN, gender code shown in words, DD/MM/YYYY option', () => {
    const { container } = render(
      <MicroPatientBanner
        region="AU"
        now={now}
        dateFormat="dd/mm/yyyy"
        name={{ familyName: "O'Brien", givenName: 'liam', title: 'Mr' }}
        dateOfBirth="1972-11-30"
        gender="1"
        defaultZone2Expanded
        identifiers={[{ type: 'ihi', value: '8003601234567894' }, { type: 'mrn', value: '0042137' }]}
      />,
    );
    expect(txt(container)).toContain("O'BRIEN, Liam");
    expect(txt(container)).not.toContain('(Mr)');
    expect(txt(container)).toContain('Born 30/11/1972');
    expect(txt(container)).toContain('IHI 8003 6012 3456 7894');
    expect(txt(container)).toContain('Gender Man or male');
  });
  it('NZ: NHI and as-recorded family name', () => {
    const { container } = render(<MicroPatientBanner region="NZ" now={now} name={{ familyName: 'Ngāwai', givenName: 'Aroha' }} identifiers={[{ type: 'nhi', value: 'ACA31FM' }]} />);
    expect(txt(container)).toContain('Ngāwai, Aroha');
    expect(txt(container)).toContain('NHI ACA31FM');
    expect(txt(container)).not.toContain('Test NHI');
  });
});
