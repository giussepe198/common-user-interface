import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { EWS_NZEWS } from '../../lists';
import { ObservationKeypadEntry } from './ObservationKeypadEntry';

afterEach(cleanup);

const press = (...keys: string[]) => keys.forEach(k => fireEvent.click(screen.getByRole('button', { name: k })));

describe('ObservationKeypadEntry', () => {
  it('shows the parameter, previous value, live score in words and the band strip (P2)', () => {
    render(
      <ObservationKeypadEntry
        definition={EWS_NZEWS}
        defaultParameterId="oxygenSaturation"
        previous={{ oxygenSaturation: { value: 93, time: new Date(2026, 9, 27, 13, 40) } }}
        now={new Date(2026, 9, 27, 14, 0)}
        chartLabel="NZEWS"
      />,
    );
    expect(screen.getByText('2 of 7 · NZEWS')).toBeTruthy();
    expect(screen.getByText('Previous 93 % at 13:40')).toBeTruthy();
    press('8', '4');
    expect(screen.getByText('Score 3 · Red zone')).toBeTruthy();
    const strip = screen.getByRole('img');
    expect(strip.getAttribute('aria-label')).toContain('84 % is in the ≤ 91 band');
    expect(strip.querySelector('.cui-obs-keypad__band--active')?.textContent).toContain('≤ 91');
  });
  it('requires Re-measure or Confirm for a critical value before moving on', () => {
    const onConfirm = vi.fn();
    const onParameterChange = vi.fn();
    render(
      <ObservationKeypadEntry
        definition={EWS_NZEWS}
        defaultParameterId="oxygenSaturation"
        criticalThresholds={[{ direction: 'low', value: 85, appliesTo: 'oxygenSaturation' }]}
        onCriticalConfirm={onConfirm}
        onParameterChange={onParameterChange}
      />,
    );
    press('8', '4');
    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('heading').textContent).toContain('Below critical limit (85 %)');
    fireEvent.click(screen.getByRole('button', { name: /Next: Oxygen/ }));
    expect(onParameterChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(alert);
    fireEvent.click(within(alert).getByRole('button', { name: 'Re-measure' }));
    expect(screen.queryByRole('alert')).toBeNull();
    press('8', '4');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm 84 %' }));
    expect(onConfirm).toHaveBeenCalledWith('oxygenSaturation', 84, expect.objectContaining({ value: 85 }));
    expect(screen.getByText(/Confirmed 84 %/).getAttribute('role')).toBe('status');
    fireEvent.click(screen.getByRole('button', { name: /Next: Oxygen/ }));
    expect(onParameterChange).toHaveBeenCalledWith('supplementalOxygen');
  });
  it('steps through the chart, uses chips for categorical parameters and finishes', () => {
    const onFinish = vi.fn();
    render(<ObservationKeypadEntry definition={EWS_NZEWS} parameterIds={['temperature', 'supplementalOxygen']} onFinish={onFinish} />);
    expect((screen.getByRole('button', { name: 'Decimal point' }) as HTMLButtonElement).disabled).toBe(false);
    press('3', '8', 'Decimal point', '4');
    expect(screen.getByText('Score 1 · Yellow zone')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next: Oxygen/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Supplement' }));
    expect(screen.getByText('Score 2 · Orange zone')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Temperature' }));
    expect(screen.getByText('38.4')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next: Oxygen/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(onFinish).toHaveBeenCalledWith({ temperature: '38.4', supplementalOxygen: 'oxygen' }, { confirmedCritical: {} });
  });
  it('uses the region chart by default and flags placeholder charts (AU ADDS)', () => {
    render(
      <ClinicalLocaleProvider region="AU">
        <ObservationKeypadEntry />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByText(/Placeholder chart/)).toBeTruthy();
    cleanup();
    render(<ObservationKeypadEntry region="GB" />);
    expect(screen.getByText(/1 of 7 · NEWS2/)).toBeTruthy();
    expect(screen.queryByText(/Placeholder chart/)).toBeNull();
  });
});
