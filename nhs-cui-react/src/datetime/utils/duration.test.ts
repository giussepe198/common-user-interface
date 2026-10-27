import { describe, expect, it } from 'vitest';
import { addClinicalDuration, describeClinicalDuration, formatClinicalDuration, parseDurationInput } from './duration';

describe('formatClinicalDuration', () => {
  it('formats the source examples (D+Tb-0017..0029)', () => {
    expect(formatClinicalDuration({ seconds: 20 })).toBe('20sec');
    expect(formatClinicalDuration({ minutes: 15, seconds: 55 })).toBe('15min 55sec');
    expect(formatClinicalDuration({ hours: 2, minutes: 40 })).toBe('2hr 40min');
    expect(formatClinicalDuration({ months: 1, days: 2, hours: 3, minutes: 17 })).toBe('1m 2d 3hr 17min');
    expect(formatClinicalDuration({ days: 3, minutes: 40 })).toBe('3d 40min');
    expect(formatClinicalDuration({ weeks: 26, days: 5 })).toBe('26w 5d');
    expect(formatClinicalDuration({ years: 1, months: 10, weeks: 2, days: 12, hours: 20, minutes: 12 })).toBe('1y 10m 2w 12d 20hr 12min');
    expect(formatClinicalDuration({ hours: 8, minutes: 0, seconds: 10 })).toBe('8hr 10sec');
  });
  it('uses the same symbol for singular and plural and prefixes Approx', () => {
    expect(formatClinicalDuration({ hours: 1 })).toBe('1hr');
    expect(formatClinicalDuration({ hours: 2, minutes: 40 }, { approximate: true })).toBe('Approx 2hr 40min');
  });
  it('rejects decimals and negative values (D+Tb-0018)', () => {
    expect(() => formatClinicalDuration({ hours: 1.5 })).toThrow(RangeError);
    expect(() => formatClinicalDuration({ minutes: -1 })).toThrow(RangeError);
  });
  it('allows unique extended symbols only (D+Tb-0034)', () => {
    expect(formatClinicalDuration({ hours: 8, minutes: 5 }, { units: { hours: 'hrs', minutes: 'mins' } })).toBe('8hrs 5mins');
    expect(() => formatClinicalDuration({ minutes: 5 }, { units: { minutes: 'm' } })).toThrow(/more than one unit/);
  });
  it('shows zero as 0sec', () => {
    expect(formatClinicalDuration({})).toBe('0sec');
  });
  it('describes durations in words for screen readers', () => {
    expect(describeClinicalDuration({ hours: 2, minutes: 1 })).toBe('2 hours 1 minute');
  });
});

describe('parseDurationInput', () => {
  it('parses single and combined units, with or without spaces (D+Tc-0032, D+Tc-0036)', () => {
    expect(parseDurationInput('3hr 5min')).toMatchObject({ status: 'ok', value: { hours: 3, minutes: 5 } });
    expect(parseDurationInput('3 hr 5 min')).toMatchObject({ status: 'ok', value: { hours: 3, minutes: 5 } });
    expect(parseDurationInput('30 sec')).toMatchObject({ status: 'ok', value: { seconds: 30 } });
    expect(parseDurationInput('5y 6m 7d 4hrs')).toMatchObject({ status: 'ok', value: { years: 5, months: 6, days: 7, hours: 4 } });
    expect(parseDurationInput('15min 30sec')).toMatchObject({ status: 'ok', value: { minutes: 15, seconds: 30 } });
    expect(parseDurationInput('1m 5d 12hr')).toMatchObject({ status: 'ok', value: { months: 1, days: 5, hours: 12 } });
    expect(parseDurationInput('Approx 2hr')).toMatchObject({ status: 'ok', approximate: true });
    expect(parseDurationInput('').status).toBe('empty');
  });
  it('asks whether a bare m means months or minutes (D+Tc-0037)', () => {
    const r = parseDurationInput('6m');
    expect(r.status).toBe('ambiguous');
    if (r.status === 'ambiguous') expect(r.candidates).toEqual([{ months: 6 }, { minutes: 6 }]);
    expect(parseDurationInput('2hr 30m').status).toBe('ambiguous');
  });
  it('resolves m as minutes when months would duplicate a unit', () => {
    expect(parseDurationInput('1mo 30m')).toMatchObject({ status: 'ok', value: { months: 1, minutes: 30 } });
  });
  it('rejects unknown units, decimals, bare numbers and repeated units', () => {
    expect(parseDurationInput('3 fortnights').status).toBe('invalid');
    expect(parseDurationInput('1.5hr')).toMatchObject({ status: 'invalid', message: expect.stringMatching(/whole numbers/) });
    expect(parseDurationInput('3/4hr').status).toBe('invalid');
    expect(parseDurationInput('30').status).toBe('invalid');
    expect(parseDurationInput('2hr 3hr').status).toBe('invalid');
    expect(parseDurationInput('2hr 40').status).toBe('invalid');
  });
  it('accepts unique custom aliases and refuses clashes (D+Tc-0035)', () => {
    expect(parseDurationInput('2 fortnight', { aliases: { weeks: ['fortnight'] } }).status).toBe('ok');
    expect(() => parseDurationInput('2hr', { aliases: { minutes: ['hr'] } })).toThrow(/both/);
  });
});

describe('addClinicalDuration', () => {
  it('adds calendar and clock units', () => {
    const start = new Date(2010, 0, 31, 10, 0);
    const end = addClinicalDuration(start, { months: 1, hours: 2, minutes: 30 });
    expect([end.getMonth(), end.getDate(), end.getHours(), end.getMinutes()]).toEqual([1, 28, 12, 30]);
  });
});
