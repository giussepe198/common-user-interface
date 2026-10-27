import { describe, it, expect } from 'vitest';
import { scoreEarlyWarning } from './earlyWarning';
import { EWS_DEFAULT_CHARTS, EWS_ADDS_PLACEHOLDER, EWS_NSW_BTF } from './regions/earlyWarning';

const within = { respiratoryRate: 16, oxygenSaturation: 97, supplementalOxygen: 'none', systolicBloodPressure: 128, heartRate: 78, temperature: 36.9, consciousness: 'A' };
const at = (values: Record<string, unknown>) => scoreEarlyWarning(EWS_NSW_BTF, { time: '2026-10-27T08:00', values: { ...within, ...values } as never });

describe('NSW Between the Flags preset (SAGO calling criteria)', () => {
  it('is zone based, AU, sourced and marked for local verification', () => {
    expect(EWS_NSW_BTF.scoring).toBe('zones');
    expect(EWS_NSW_BTF.region).toBe('AU');
    expect(EWS_NSW_BTF.localVerificationRequired).toBe(true);
    expect(EWS_NSW_BTF.sources[0].url).toMatch(/^https:\/\/cec\.health\.nsw\.gov\.au\/.*Standard-Adult-General-Observation-Chart/);
    expect(EWS_DEFAULT_CHARTS.AU).toBe(EWS_ADDS_PLACEHOLDER);
  });
  it('within the flags: no response above rank 0', () => {
    const r = at({});
    expect(r.zone).toBe('none');
    expect(r.response?.id).toBe('within');
    expect(r.complete).toBe(true);
  });
  it('Yellow Zone: Clinical Review for any yellow observation', () => {
    expect(at({ respiratoryRate: 26 }).response?.id).toBe('yellow');
    expect(at({ heartRate: 45 }).response?.id).toBe('yellow');
    expect(at({ systolicBloodPressure: 185 }).response?.id).toBe('yellow');
    expect(at({ temperature: 38.5 }).response?.id).toBe('yellow');
    expect(at({ temperature: 35.5 }).response?.id).toBe('yellow');
    expect(at({ consciousness: 'C' }).response?.id).toBe('yellow');
    expect(at({ supplementalOxygen: 'increasing' }).response?.id).toBe('yellow');
    expect(at({ oxygenSaturation: 93 }).triggers[0]).toBe('Oxygen saturation 93 % in the yellow zone');
  });
  it('Red Zone: Rapid Response; shared boundaries fall in the Red Zone (safer reading)', () => {
    for (const v of [{ respiratoryRate: 30 }, { respiratoryRate: 5 }, { oxygenSaturation: 90 }, { systolicBloodPressure: 90 }, { systolicBloodPressure: 200 }, { heartRate: 40 }, { heartRate: 140 }, { consciousness: 'P' }, { supplementalOxygen: 'increasingToKeepAbove90' }]) {
      expect(at(v).response?.id).toBe('red');
    }
    expect(at({ respiratoryRate: 29, heartRate: 150 }).response?.label).toBe('Red Zone: Rapid Response');
  });
  it('missing observations make the result incomplete', () => {
    const r = scoreEarlyWarning(EWS_NSW_BTF, { time: '2026-10-27T08:00', values: { respiratoryRate: 18 } });
    expect(r.complete).toBe(false);
    expect(r.missing).toContain('Heart rate');
  });
});
