import { describe, it, expect } from 'vitest';
import { EWS_NZEWS, news2ChartDefinition } from '../../lists';
import { touchEwsBandStrip, touchObservationSet, touchScoreEntry } from './ewsBandStrip';

describe('touchEwsBandStrip', () => {
  it('orders bands lowest first and marks the active band (P2)', () => {
    const s = touchEwsBandStrip(EWS_NZEWS, 'oxygenSaturation', 84);
    expect(s.cells.map(c => c.label)).toEqual(['≤ 91', '92–93', '94–95', '≥ 96']);
    expect(s.cells.map(c => c.score)).toEqual([3, 2, 1, 0]);
    expect(s.cells[0]).toMatchObject({ active: true, zoneLabel: 'Red zone', colourVar: '--ews-zone-red' });
    expect(s.description).toContain('84 % is in the ≤ 91 band');
  });
  it('includes unscored bands by zone (NZEWS blue)', () => {
    const s = touchEwsBandStrip(EWS_NZEWS, 'respiratoryRate', 40);
    expect(s.cells[s.cells.length - 1]).toMatchObject({ score: null, zoneShortLabel: 'RRT', active: true });
  });
  it('waits for the condition of conditional bands (NEWS2 scale 2)', () => {
    const def = news2ChartDefinition({ spo2Scale: 2 });
    const none = touchEwsBandStrip(def, 'oxygenSaturation', 95);
    expect(none.pendingConditions).toEqual(['Air or oxygen?']);
    expect(none.cells.some(c => c.active)).toBe(false);
    const set = touchObservationSet(def, { supplementalOxygen: 'oxygen' });
    const o2 = touchEwsBandStrip(def, 'oxygenSaturation', 95, set);
    expect(o2.pendingConditions).toEqual([]);
    expect(o2.cells.find(c => c.active)).toMatchObject({ label: '95–96 on O2', score: 2 });
  });
  it('is empty for categorical parameters', () => {
    expect(touchEwsBandStrip(EWS_NZEWS, 'supplementalOxygen', null).cells).toEqual([]);
  });
});

describe('touchScoreEntry', () => {
  it('scores a typed value', () => {
    const p = EWS_NZEWS.parameters.find(x => x.id === 'temperature')!;
    expect(touchScoreEntry(EWS_NZEWS, p, { temperature: '38.4' })).toMatchObject({ score: 1, zone: 'yellow' });
    expect(touchScoreEntry(EWS_NZEWS, p, { temperature: '' })).toBeNull();
  });
});
