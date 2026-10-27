import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PatientIdentifierDisplay, patientIdentifierLabel } from './PatientIdentifierDisplay';

afterEach(cleanup);
const txt = (el: Element) => {
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
  return c.textContent;
};

describe('PatientIdentifierDisplay', () => {
  it('labels and formats per type (G10 1.6: never unlabelled)', () => {
    const cases: Array<[React.ReactElement, string]> = [
      [<PatientIdentifierDisplay type="nhs" value="9990000018" />, 'NHS No. 999 000 0018'],
      [<PatientIdentifierDisplay type="ihi" value="8003601234567894" />, 'IHI 8003 6012 3456 7894'],
      [<PatientIdentifierDisplay type="medicare" value="2123456701" irn="3" />, 'Medicare 2123 45670 1 IRN 3'],
      [<PatientIdentifierDisplay type="dva" value="nbur9080" dvaCardType="Gold" />, 'DVA NBUR9080 Gold card'],
      [<PatientIdentifierDisplay type="nhi" value="ACA31FM" />, 'NHI ACA31FM'],
      [<PatientIdentifierDisplay type="mrn" region="AU" value="0042137" />, 'URN 0042137'],
      [<PatientIdentifierDisplay type="mrn" region="NZ" value="H123456" label="Hospital number" />, 'Hospital number H123456'],
    ];
    for (const [el, text] of cases) {
      const { container, unmount } = render(el);
      expect(txt(container)).toBe(text);
      unmount();
    }
  });
  it('unknown value after the label', () => {
    const { container } = render(<PatientIdentifierDisplay type="nhi" value="" />);
    expect(txt(container)).toBe('NHI Not Known');
  });
  it('label helper', () => {
    expect(patientIdentifierLabel('mrn', 'AU')).toBe('URN');
    expect(patientIdentifierLabel('mrn', 'GB')).toBe('MRN');
    expect(patientIdentifierLabel('ihi', 'AU', 'IHI number')).toBe('IHI number');
  });
});

describe('PatientIdentifierDisplay extensions (G12)', () => {
  it('forwards Medicare valid to and dormant NHI details', () => {
    const onUse = vi.fn();
    const { container, rerender } = render(
      <PatientIdentifierDisplay type="medicare" value="2123456701" irn="1" medicareValidTo="09/2026" now={new Date(2026, 9, 27)} />,
    );
    expect(container.textContent).toContain('Valid to 09/2026');
    expect(container.textContent).toContain('Card expired');
    rerender(<PatientIdentifierDisplay type="nhi" value="ZAC5361" nhiStatus="dormant" liveNhi="ZBN77VL" onUseLiveNhi={onUse} flagTestNumbers={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use live NHI' }));
    expect(onUse).toHaveBeenCalledWith('ZBN77VL');
  });
});
