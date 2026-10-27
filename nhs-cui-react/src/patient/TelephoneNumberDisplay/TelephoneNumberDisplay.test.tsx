import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TelephoneNumberDisplay } from './TelephoneNumberDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('TelephoneNumberDisplay', () => {
  it('GB formats and extension (TID-0001, TID-0008)', () => {
    const { container } = render(<TelephoneNumberDisplay value="+44 20 7946 0472" extension="1234" />);
    expect(container.textContent).toBe('020 7946 0472 x1234');
  });
  it('labelled unknown (PAB-0019)', () => {
    const { container } = render(<TelephoneNumberDisplay label="Home" value="" />);
    expect(container.textContent).toBe('Home Not Known');
  });
  it('AU national format from E.164 and international tel link (Style Manual)', () => {
    render(
      <ClinicalLocaleProvider region="AU">
        <TelephoneNumberDisplay value="+61491570156" asLink />
      </ClinicalLocaleProvider>,
    );
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('0491 570 156');
    expect(link.getAttribute('href')).toBe('tel:+61491570156');
  });
  it('NZ format and foreign numbers keep +CC', () => {
    const { container, rerender } = render(<TelephoneNumberDisplay region="NZ" value="+6421234567" />);
    expect(container.textContent).toBe('021 234 567');
    rerender(<TelephoneNumberDisplay region="NZ" value="+61 2 5550 4321" />);
    expect(container.textContent).toBe('+61 2 5550 4321');
  });
});
