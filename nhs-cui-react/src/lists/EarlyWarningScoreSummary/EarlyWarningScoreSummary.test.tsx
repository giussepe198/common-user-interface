import React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { EarlyWarningScoreSummary } from './EarlyWarningScoreSummary';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

const nz = { time: '2026-10-27T02:00', values: { respiratoryRate: 26, oxygenSaturation: 97, supplementalOxygen: 'air', heartRate: 95, systolicBloodPressure: 128, temperature: 37, consciousness: 'A' } };

describe('EarlyWarningScoreSummary', () => {
  it('NZ: shows total, zone in words, required response and the mandatory escalate text (G11 12.3)', () => {
    render(<ClinicalLocaleProvider region="NZ"><EarlyWarningScoreSummary observation={nz} /></ClinicalLocaleProvider>);
    expect(screen.getByRole('heading', { name: 'EWS' })).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(screen.getByText('EWS 8–9 or any vital sign in the red zone')).toBeTruthy();
    expect(screen.getByText('Likely to deteriorate rapidly')).toBeTruthy();
    expect(screen.getByText(/Respiratory rate 26 breaths\/min in the red zone/)).toBeTruthy();
    expect(screen.getByText(/ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT/)).toBeTruthy();
  });
  it('GB: NEWS2 by default; warns when parameters are missing and the total is a minimum', () => {
    render(<EarlyWarningScoreSummary observation={{ time: '2026-10-27T08:00', values: { respiratoryRate: 22, heartRate: 115 } }} />);
    expect(screen.getByRole('heading', { name: 'NEWS2' })).toBeTruthy();
    expect(screen.getByText('4 or more')).toBeTruthy();
    expect(screen.getByText(/Incomplete: .*Temperature.* not recorded. The score may be higher./)).toBeTruthy();
    expect(screen.queryByText(/ESCALATE CARE/)).toBeNull();
  });
  it('AU: ADDS shows a placeholder warning (G10 12.3)', () => {
    render(<EarlyWarningScoreSummary region="AU" observation={{ time: '2026-10-27T08:00', values: { respiratoryRate: 36 } }} />);
    expect(screen.getByText(/Placeholder scores: not for clinical use/)).toBeTruthy();
    expect(screen.getByText('Emergency call.')).toBeTruthy();
  });
  it('lists applied and ignored modifications (G11 12.4)', () => {
    const mods = [
      { id: 'a', parameterId: 'heartRate', from: 90, to: 110, score: 0, label: 'HR 90–109', reason: 'AF', authorisedBy: 'Dr K', startedAt: '2026-10-26T00:00', durationHours: 48, signed: true },
      { id: 'b', parameterId: 'temperature', from: 38, to: 39, score: 0, label: 'Temp 38s', reason: 'x', authorisedBy: 'Dr K', startedAt: '2026-10-26T00:00', durationHours: 48, signed: false },
    ];
    render(<EarlyWarningScoreSummary region="NZ" observation={nz} modifications={mods} />);
    expect(screen.getByText(/HR: HR 90–109 scores 0. AF. Authorised by Dr K/)).toBeTruthy();
    expect(screen.getByText('Temp 38s: Not signed')).toBeTruthy();
  });
  it('says when nothing is recorded', () => {
    render(<EarlyWarningScoreSummary region="NZ" observation={null} />);
    expect(screen.getByText('No observations recorded')).toBeTruthy();
    expect(screen.getByText(/ESCALATE CARE/)).toBeTruthy();
  });
});

describe('EarlyWarningScoreSummary: NSW Between the Flags', () => {
  it('shows the zone instead of a total, the response and a local verification note', async () => {
    const { EWS_NSW_BTF } = await import('../utils/regions/earlyWarning');
    render(<EarlyWarningScoreSummary definition={EWS_NSW_BTF} observation={{ time: '2026-10-27T08:00', values: { respiratoryRate: 31, oxygenSaturation: 97, supplementalOxygen: 'none', heartRate: 80, systolicBloodPressure: 120, temperature: 37, consciousness: 'A' } }} />);
    expect(screen.getByText('Red Zone', { selector: '.cui-ews-summary__total' })).toBeTruthy();
    expect(screen.getByText('Red Zone: Rapid Response')).toBeTruthy();
    expect(screen.getByText(/Call for a Rapid Response as per your local Clinical Emergency Response System/)).toBeTruthy();
    expect(screen.getByText(/Verify the zone boundaries/)).toBeTruthy();
    expect(screen.getByText(/Respiratory rate 31 breaths\/min in the red zone/)).toBeTruthy();
  });
  it('showPlaceholderNotice={false} leaves the placeholder note to the host', () => {
    render(<EarlyWarningScoreSummary region="AU" observation={{ time: '2026-10-27T08:00', values: { respiratoryRate: 18 } }} showPlaceholderNotice={false} />);
    expect(screen.queryByText(/Placeholder scores/)).toBeNull();
  });
});
