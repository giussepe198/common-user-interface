import { describe, it, expect } from 'vitest';
import { EWS_ADDS_PLACEHOLDER, EWS_NEWS2, EWS_NSW_BTF, EWS_NZEWS, news2ChartDefinition, scoreEarlyWarning, type EwsChartDefinition } from '../../lists';
import { mobileEwsHeadline } from './mobileEarlyWarning';

const headlines = (def: EwsChartDefinition) => Object.fromEntries(def.responses.map(r => [r.id, mobileEwsHeadline(def, { zone: r.zone, response: r })]));

describe('mobileEwsHeadline', () => {
  it('uses the NEWS2 response label, never the parameter zone "Score 2"', () => {
    const r = scoreEarlyWarning(EWS_NEWS2, {
      time: new Date(2026, 9, 27, 14, 0),
      values: { respiratoryRate: 22, oxygenSaturation: 95, supplementalOxygen: 'air', systolicBloodPressure: 105, heartRate: 95, consciousness: 'A', temperature: 37 },
    });
    expect(r.total).toBe(5);
    expect(mobileEwsHeadline(EWS_NEWS2, r)).toBe('Medium (score 5–6)');
    expect(headlines(EWS_NEWS2)).toEqual({
      zero: 'Score 0',
      low: 'Low (score 1–4)',
      lowMedium: 'Low–medium (score 3 in a single parameter)',
      medium: 'Medium (score 5–6)',
      high: 'High (score 7 or more)',
    });
    expect(headlines(news2ChartDefinition({ spo2Scale: 2 })).medium).toBe('Medium (score 5–6)');
  });

  it('adds the colour zone name where the label does not say it (NZEWS, ADDS)', () => {
    expect(headlines(EWS_NZEWS)).toEqual({
      zero: 'EWS 0',
      yellow: 'Yellow zone: EWS 1–5',
      orange: 'Orange zone: EWS 6–7',
      red: 'EWS 8–9 or any vital sign in the red zone',
      blue: 'EWS 10 or more, or any vital sign in the blue zone',
    });
    const adds = headlines(EWS_ADDS_PLACEHOLDER);
    expect(adds.zero).toBe('Score 0');
    expect(adds.score4to5).toBe('Orange zone: Score 4–5');
    expect(adds.emergency).toBe('Score 8 or more, or any observation in a purple area');
  });

  it('keeps zone-only chart labels as they are (Between the Flags)', () => {
    expect(headlines(EWS_NSW_BTF)).toEqual({
      within: 'Within the flags',
      yellow: 'Yellow Zone: Clinical Review',
      red: 'Red Zone: Rapid Response',
    });
  });

  it('falls back to the zone label without a response', () => {
    expect(mobileEwsHeadline(EWS_NZEWS, { zone: 'orange', response: null })).toBe('Orange zone');
  });
});
