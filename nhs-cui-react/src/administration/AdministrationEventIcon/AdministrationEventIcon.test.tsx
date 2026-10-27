import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { AdministrationEventIcon, administrationEventLabel } from './AdministrationEventIcon';
import { ClinicalLocaleProvider } from '../../core/locale';

afterEach(cleanup);

const T = new Date(2026, 4, 27, 8, 0);

describe('AdministrationEventIcon', () => {
  it('labels states with their due time (MEDa-0250)', () => {
    render(<AdministrationEventIcon state="overdue" time={T} medicationName="Amoxicillin" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('aria-label')).toBe('Overdue 08:00, Amoxicillin');
    expect(img.className).toContain('cui-admin-event-icon--overdue');
    expect(administrationEventLabel('next', undefined, T)).toBe('Next 08:00');
    expect(administrationEventLabel('future', undefined, T)).toBe('Scheduled 08:00');
  });

  it('uses filled for given and unfilled for not given (MEDa-0117)', () => {
    const { container, rerender } = render(<AdministrationEventIcon state="recorded" status="given" />);
    expect(container.firstElementChild!.className).toContain('--given');
    rerender(<AdministrationEventIcon state="recorded" status="patientRefused" />);
    expect(container.firstElementChild!.className).toContain('--not-given');
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Patient refused');
  });

  it('is a button when activatable and shows markers and the edited marker in its name', () => {
    const onActivate = vi.fn();
    render(<AdministrationEventIcon state="due" time={T} onActivate={onActivate} markers={['witnessRequired']} edited />);
    const b = screen.getByRole('button');
    expect(b.getAttribute('aria-label')).toBe('Due 08:00, Witness required, Edited');
    fireEvent.click(b);
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('round shape for Once Only (MEDa-0132)', () => {
    const { container } = render(<AdministrationEventIcon state="future" kind="onceOnly" />);
    expect(container.querySelector('circle.cui-admin-event-icon__shape')).toBeTruthy();
  });

  it('GB draws the letter L for Given late', () => {
    const { container } = render(<AdministrationEventIcon state="recorded" status="givenLate" />);
    expect(container.querySelector('text')!.textContent).toBe('L');
  });

  it('AU shows the NIMC code with its meaning, and never L for a late dose (AU-MD-08)', () => {
    const { container, rerender } = render(
      <ClinicalLocaleProvider region="AU">
        <AdministrationEventIcon state="recorded" status="withheld" reasonCode="W" />
      </ClinicalLocaleProvider>,
    );
    const img = screen.getByRole('img');
    expect(img.textContent).toContain('W Withheld');
    expect(img.getAttribute('aria-label')).toBe('W Withheld (Withheld – enter reason in clinical record)');
    expect(img.getAttribute('title')).toBe('Withheld – enter reason in clinical record');
    expect(container.querySelector('text')!.textContent).toBe('W');
    rerender(
      <ClinicalLocaleProvider region="AU">
        <AdministrationEventIcon state="recorded" status="givenLate" />
      </ClinicalLocaleProvider>,
    );
    expect(container.querySelector('text')).toBeNull();
    expect(container.querySelector('path.cui-admin-event-icon__glyph-line')).toBeTruthy();
  });

  it('NZ two-letter codes, region prop overriding the provider', () => {
    const { container } = render(
      <ClinicalLocaleProvider region="AU">
        <AdministrationEventIcon region="NZ" state="recorded" status="carerAdministered" reasonCode="CP" />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByRole('img').textContent).toContain('CP Carer/parent administered');
    const t = container.querySelector('text')!;
    expect(t.textContent).toBe('CP');
    expect(t.getAttribute('class')).toContain('--pair');
    expect(container.firstElementChild!.className).toContain('--given');
  });
});
