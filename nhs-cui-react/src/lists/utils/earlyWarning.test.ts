import { describe, it, expect } from 'vitest';
import {
  configureEwsChart,
  ewsBandIndex,
  ewsGraphZones,
  ewsModificationProblem,
  ewsNormaliseValue,
  ewsObservationAnnotator,
  scoreEarlyWarning,
  scoreEarlyWarningSeries,
  type EwsModification,
  type EwsObservationSet,
} from './earlyWarning';
import { EWS_ADDS_PLACEHOLDER, EWS_DEFAULT_CHARTS, EWS_NEWS2, EWS_NZEWS, ewsDefaultChart, news2ChartDefinition } from './regions/earlyWarning';

const nzNormal: EwsObservationSet = {
  time: '2026-10-27T08:00:00',
  values: { respiratoryRate: 16, oxygenSaturation: 97, supplementalOxygen: 'air', heartRate: 72, systolicBloodPressure: 128, temperature: 36.8, consciousness: 'A' },
};
const nzParam = (id: string) => EWS_NZEWS.parameters.find(p => p.id === id)!;
const score = (id: string, v: number | string) => {
  const r = scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { ...nzNormal.values, [id]: v } });
  return r.parameters.find(p => p.parameterId === id)!;
};

describe('NZEWS bands (G11 12.2)', () => {
  it('scores respiratory rate per the chart', () => {
    const cases: Array<[number, number | null, string]> = [
      [4, null, 'blue'], [5, 3, 'red'], [8, 3, 'red'], [9, 1, 'yellow'], [11, 1, 'yellow'], [12, 0, 'none'], [20, 0, 'none'],
      [21, 2, 'orange'], [24, 2, 'orange'], [25, 3, 'red'], [35, 3, 'red'], [36, null, 'blue'],
    ];
    for (const [v, s, z] of cases) {
      const r = score('respiratoryRate', v);
      expect([v, r.score, r.zone]).toEqual([v, s, z]);
    }
  });
  it('scores heart rate by decade with 120s = 2 and < 40 blue', () => {
    const cases: Array<[number, number | null, string]> = [
      [39, null, 'blue'], [40, 2, 'orange'], [49, 2, 'orange'], [50, 0, 'none'], [89, 0, 'none'], [90, 1, 'yellow'], [109, 1, 'yellow'],
      [110, 2, 'orange'], [129, 2, 'orange'], [130, 3, 'red'], [139, 3, 'red'], [140, null, 'blue'],
    ];
    for (const [v, s, z] of cases) expect([v, score('heartRate', v).score, score('heartRate', v).zone]).toEqual([v, s, z]);
  });
  it('scores systolic BP, temperature, SpO2, oxygen and consciousness', () => {
    expect([69, 70, 89, 90, 99, 100, 109, 110, 219, 220].map(v => score('systolicBloodPressure', v).score)).toEqual([null, 3, 3, 2, 2, 1, 1, 0, 0, 3]);
    expect(score('systolicBloodPressure', 69).zone).toBe('blue');
    expect([34.9, 35, 35.9, 36, 37.9, 38, 38.9, 39, 40.2].map(v => score('temperature', v).score)).toEqual([2, 1, 1, 0, 0, 1, 1, 2, 2]);
    expect([91, 92, 93, 94, 95, 96, 100].map(v => score('oxygenSaturation', v).score)).toEqual([3, 2, 2, 1, 1, 0, 0]);
    expect(score('supplementalOxygen', 'oxygen').score).toBe(2);
    expect(score('supplementalOxygen', 'air').score).toBe(0);
    expect(['A', 'V', 'P', 'U'].map(v => score('consciousness', v).score)).toEqual([0, 3, 3, null]);
    expect(score('consciousness', 'U').zone).toBe('blue');
  });
  it('maps booleans to the first or second option', () => {
    expect(ewsNormaliseValue(nzParam('supplementalOxygen'), true)).toEqual({ value: 'oxygen', display: 'Supplement' });
    expect(ewsNormaliseValue(nzParam('supplementalOxygen'), false).value).toBe('air');
    expect(ewsNormaliseValue(nzParam('temperature'), { value: 37, display: '37.0' }).display).toBe('37.0');
  });
});

describe('NZEWS escalation (G11 12.3)', () => {
  it('total 0 is the routine response', () => {
    const r = scoreEarlyWarning(EWS_NZEWS, nzNormal);
    expect(r.total).toBe(0);
    expect(r.complete).toBe(true);
    expect(r.response?.id).toBe('zero');
  });
  it('totals 1-5 yellow, 6-7 orange, 8-9 red, 10+ blue', () => {
    const at = (vals: Record<string, number | string>) => scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { ...nzNormal.values, ...vals } });
    expect(at({ heartRate: 95 }).zone).toBe('yellow'); // 1
    expect(at({ heartRate: 115, supplementalOxygen: 'oxygen', oxygenSaturation: 95, temperature: 38.2 }).total).toBe(6);
    expect(at({ heartRate: 115, supplementalOxygen: 'oxygen', oxygenSaturation: 95, temperature: 38.2 }).zone).toBe('orange');
    const red = at({ heartRate: 115, supplementalOxygen: 'oxygen', oxygenSaturation: 93, temperature: 39.2 });
    expect(red.total).toBe(8);
    expect(red.zone).toBe('red');
    const blue = at({ heartRate: 115, supplementalOxygen: 'oxygen', oxygenSaturation: 93, temperature: 39.2, respiratoryRate: 22 });
    expect(blue.total).toBe(10);
    expect(blue.zone).toBe('blue');
  });
  it('a single red parameter triggers red even with a low total; any blue triggers blue', () => {
    const r = scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { ...nzNormal.values, respiratoryRate: 26, heartRate: 95 } });
    expect(r.total).toBe(4);
    expect(r.zone).toBe('red');
    expect(r.triggers.join(' ')).toMatch(/Respiratory rate 26 breaths\/min in the red zone/);
    const b = scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { ...nzNormal.values, heartRate: 38 } });
    expect(b.total).toBe(0);
    expect(b.zone).toBe('blue');
    expect(b.response?.response).toMatch(/Rapid response call/);
  });
  it('four red parameters (total 12) trigger the blue response', () => {
    const r = scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { ...nzNormal.values, respiratoryRate: 26, heartRate: 132, oxygenSaturation: 90, systolicBloodPressure: 85 } });
    expect(r.total).toBe(12);
    expect(r.zone).toBe('blue');
  });
  it('marks missing parameters and keeps the total as a minimum', () => {
    const r = scoreEarlyWarning(EWS_NZEWS, { time: nzNormal.time, values: { respiratoryRate: 22, heartRate: 95 } });
    expect(r.complete).toBe(false);
    expect(r.total).toBe(3);
    expect(r.missing).toContain('Temperature');
  });
  it('carries the mandatory escalate-if-worried text', () => {
    expect(EWS_NZEWS.mandatoryText?.[0]).toBe('ESCALATE CARE FOR ANY PATIENT YOU, THEY OR THEIR FAMILY ARE WORRIED ABOUT, REGARDLESS OF VITAL SIGNS OR EWS');
  });
});

describe('modifications (G11 12.4, AU-OB-05)', () => {
  const mod: EwsModification = {
    id: 'm1', parameterId: 'oxygenSaturation', from: 88, to: 93, score: 0, label: 'SpO2 88–92%', reason: 'COPD', authorisedBy: 'Dr A Ngata, ext 4410',
    startedAt: '2026-10-26T10:00:00', durationHours: 48, signed: true,
  };
  const set = { time: '2026-10-27T08:00:00', values: { ...nzNormal.values, oxygenSaturation: 90 } };
  it('applies an active signed modification', () => {
    const r = scoreEarlyWarning(EWS_NZEWS, set, [mod]);
    expect(r.parameters.find(p => p.parameterId === 'oxygenSaturation')?.score).toBe(0);
    expect(r.appliedModifications).toHaveLength(1);
    expect(r.zone).toBe('none');
  });
  it('ignores unsigned, undated-duration and expired modifications', () => {
    expect(ewsModificationProblem({ ...mod, signed: false }, set.time)).toBe('Not signed');
    expect(ewsModificationProblem({ ...mod, durationHours: undefined }, set.time)).toBe('No duration or review date');
    expect(ewsModificationProblem({ ...mod, durationHours: 12 }, set.time)).toBe('Expired');
    expect(ewsModificationProblem({ ...mod, startedAt: '2026-10-28T00:00:00' }, set.time)).toBe('Not started');
    const r = scoreEarlyWarning(EWS_NZEWS, set, [{ ...mod, signed: false }]);
    expect(r.parameters.find(p => p.parameterId === 'oxygenSaturation')?.score).toBe(3);
    expect(r.ignoredModifications[0].reason).toBe('Not signed');
  });
});

describe('NEWS2 (GB)', () => {
  const normal = { respiratoryRate: 16, oxygenSaturation: 97, supplementalOxygen: 'air', systolicBloodPressure: 125, heartRate: 70, consciousness: 'A', temperature: 37 };
  const at = (v: Record<string, number | string>, def = EWS_NEWS2) => scoreEarlyWarning(def, { time: '2026-10-27T08:00:00', values: { ...normal, ...v } });
  it('scores the published bands', () => {
    expect([8, 9, 11, 12, 20, 21, 24, 25].map(v => at({ respiratoryRate: v }).total)).toEqual([3, 1, 1, 0, 0, 2, 2, 3]);
    expect([40, 41, 50, 51, 90, 91, 110, 111, 130, 131].map(v => at({ heartRate: v }).total)).toEqual([3, 1, 1, 0, 0, 1, 1, 2, 2, 3]);
    expect([90, 91, 100, 101, 110, 111, 219, 220].map(v => at({ systolicBloodPressure: v }).total)).toEqual([3, 2, 2, 1, 1, 0, 0, 3]);
    expect([35.0, 35.1, 36.0, 36.1, 38.0, 38.1, 39.0, 39.1].map(v => at({ temperature: v }).total)).toEqual([3, 1, 1, 0, 0, 1, 1, 2]);
    expect(at({ consciousness: 'C' }).total).toBe(3);
    expect(at({ supplementalOxygen: 'oxygen' }).total).toBe(2);
  });
  it('applies the thresholds: 1-4 low, single 3 low-medium, 5-6 medium, 7+ high', () => {
    expect(at({ heartRate: 95 }).response?.id).toBe('low');
    expect(at({ respiratoryRate: 26 }).response?.id).toBe('lowMedium');
    expect(at({ respiratoryRate: 22, heartRate: 95, temperature: 38.5, systolicBloodPressure: 108 }).response?.id).toBe('medium');
    expect(at({ respiratoryRate: 26, heartRate: 115, temperature: 38.5, systolicBloodPressure: 108 }).response?.id).toBe('high');
  });
  it('SpO2 scale 2 depends on oxygen', () => {
    const s2 = news2ChartDefinition({ spo2Scale: 2 });
    expect(at({ oxygenSaturation: 90 }, s2).total).toBe(0);
    expect(at({ oxygenSaturation: 95 }, s2).total).toBe(0);
    expect(at({ oxygenSaturation: 95, supplementalOxygen: 'oxygen' }, s2).total).toBe(4);
    expect(at({ oxygenSaturation: 97, supplementalOxygen: 'oxygen' }, s2).total).toBe(5);
    expect(at({ oxygenSaturation: 83 }, s2).total).toBe(3);
  });
});

describe('ADDS placeholder (AU)', () => {
  it('is marked as placeholder and is configurable', () => {
    expect(EWS_ADDS_PLACEHOLDER.status).toBe('placeholder');
    const r = scoreEarlyWarning(EWS_ADDS_PLACEHOLDER, { time: '2026-10-27T08:00:00', values: { respiratoryRate: 36 } });
    expect(r.placeholder).toBe(true);
    expect(r.zone).toBe('purple');
    const local = configureEwsChart(EWS_ADDS_PLACEHOLDER, { status: 'published', bands: { respiratoryRate: [undefined, { score: 2 }] }, responses: { emergency: { response: 'MET call' } } });
    expect(local.parameters[0].bands[1].score).toBe(2);
    expect(local.responses.find(x => x.id === 'emergency')?.response).toBe('MET call');
    expect(EWS_ADDS_PLACEHOLDER.parameters[0].bands[1].score).toBe(3);
  });
  it('covers the published row bands', () => {
    const t = EWS_ADDS_PLACEHOLDER.parameters.find(p => p.id === 'temperature')!;
    expect(t.bands.map(b => b.label)).toEqual(['≥ 39.1', '38.5–39.0', '38.0–38.4', '37.5–37.9', '37.0–37.4', '36.5–36.9', '36.0–36.4', '35.5–35.9', '≤ 35.4']);
    expect(ewsBandIndex(EWS_ADDS_PLACEHOLDER, t, 38.45)).toBe(2);
    const bp = EWS_ADDS_PLACEHOLDER.parameters.find(p => p.id === 'systolicBloodPressure')!;
    expect(bp.bands[1].label).toBe('190s');
    expect(ewsBandIndex(EWS_ADDS_PLACEHOLDER, bp, 30)).toBe(bp.bands.length - 1);
  });
});

describe('helpers', () => {
  it('returns default charts per region', () => {
    expect(ewsDefaultChart()).toBe(EWS_NEWS2);
    expect(ewsDefaultChart('NZ')).toBe(EWS_NZEWS);
    expect(EWS_DEFAULT_CHARTS.AU).toBe(EWS_ADDS_PLACEHOLDER);
  });
  it('builds graph zones for non-zero bands', () => {
    const z = ewsGraphZones(EWS_NZEWS, 'heartRate');
    expect(z.map(x => x.zone)).toEqual(['blue', 'red', 'orange', 'yellow', 'orange', 'blue']);
    expect(z[1]).toMatchObject({ from: 130, to: 140, colourVar: '--ews-zone-red', label: 'Red zone, score 3' });
    expect(ewsGraphZones(EWS_NZEWS, 'consciousness')).toEqual([]);
  });
  it('annotates observation table values with score and zone', () => {
    const a = ewsObservationAnnotator(EWS_NZEWS, { pulse: 'heartRate' });
    expect(a('pulse', { value: 115 })).toEqual({ text: '2', description: 'score 2, orange zone', colourVar: '--ews-zone-orange' });
    expect(a('pulse', { value: 38 })).toEqual({ text: 'RRT', description: 'unscored, blue zone', colourVar: '--ews-zone-blue' });
    expect(a('unknown', { value: 1 })).toBeNull();
  });
  it('scores a series oldest first', () => {
    const r = scoreEarlyWarningSeries(EWS_NZEWS, [{ ...nzNormal, time: '2026-10-27T12:00:00' }, nzNormal]);
    expect(r[0].time?.getHours()).toBe(8);
  });
});
