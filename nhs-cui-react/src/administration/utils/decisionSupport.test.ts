import { describe, expect, it } from 'vitest';
import {
  decisionSupportAlertIndicatorState,
  decisionSupportClampToastDuration,
  decisionSupportOverallState,
  decisionSupportPreferenceLabel,
  formatDecisionSupportServiceTooltip,
  sortDecisionSupportAlerts,
  sortDecisionSupportServices,
} from './decisionSupport';

const at = (h: number, m = 0) => new Date(2007, 0, 12, h, m);

describe('sortDecisionSupportAlerts', () => {
  it('puts High Priority first, newest first within each group', () => {
    const r = sortDecisionSupportAlerts([
      { id: 'p1', status: 'Priority', occurredAt: at(9) },
      { id: 'h1', status: 'High Priority', occurredAt: at(8) },
      { id: 'p2', status: 'Priority', occurredAt: at(11) },
      { id: 'h2', status: 'High Priority', occurredAt: at(10) },
    ]);
    expect(r.map(a => a.id)).toEqual(['h2', 'h1', 'p2', 'p1']);
  });
});

describe('decisionSupportAlertIndicatorState', () => {
  const p = { id: 'p', status: 'Priority' as const, occurredAt: at(9) };
  const h = { id: 'h', status: 'High Priority' as const, occurredAt: at(9) };
  it('covers the five states', () => {
    expect(decisionSupportAlertIndicatorState([], [])).toBe('none');
    expect(decisionSupportAlertIndicatorState([p], [])).toBe('priorityUnviewed');
    expect(decisionSupportAlertIndicatorState([p], ['p'])).toBe('priorityViewed');
    expect(decisionSupportAlertIndicatorState([p, h], ['h'])).toBe('highUnviewed');
    expect(decisionSupportAlertIndicatorState([p, h], ['h', 'p'])).toBe('highViewed');
  });
});

describe('services', () => {
  it('sorts alphabetically ignoring case', () => {
    expect(sortDecisionSupportServices([{ name: 'licensed use' }, { name: 'Dose Calculations' }, { name: 'Allergy Checking' }]).map(s => s.name)).toEqual([
      'Allergy Checking', 'Dose Calculations', 'licensed use',
    ]);
  });
  it('formats the tooltip with date and 24-hour time', () => {
    expect(formatDecisionSupportServiceTooltip('unavailable', at(10, 42))).toBe('This service has been unavailable since 12-Jan-2007; 10:42');
    expect(formatDecisionSupportServiceTooltip('notRunning', at(9, 5))).toBe('This service has been not running since 12-Jan-2007; 09:05');
    expect(formatDecisionSupportServiceTooltip('running')).toBe('This service is running');
  });
  it('derives the overall state', () => {
    expect(decisionSupportOverallState([{ id: 'a', name: 'a', state: 'running' }, { id: 'b', name: 'b', state: 'unavailable' }])).toBe('full');
    expect(decisionSupportOverallState([{ id: 'a', name: 'a', state: 'notRunning' }])).toBe('degraded');
  });
});

describe('misc', () => {
  it('labels preference levels', () => {
    expect(decisionSupportPreferenceLabel(4)).toBe('High preference option');
    expect(decisionSupportPreferenceLabel(1)).toBe('Lowest preference option');
  });
  it('clamps toast duration to 5 to 10 seconds', () => {
    expect(decisionSupportClampToastDuration(undefined)).toBe(7000);
    expect(decisionSupportClampToastDuration(1000)).toBe(5000);
    expect(decisionSupportClampToastDuration(20000)).toBe(10000);
  });
});
