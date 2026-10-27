import { describe, expect, it } from 'vitest';
import { formatTimeInputValue, parseTimeInput, spinTime } from './timeInput';

const fmt = (text: string, opts = {}) => {
  const r = parseTimeInput(text, { now: new Date(2026, 9, 27, 13, 54, 0), ...opts });
  if (r.status !== 'ok') throw new Error(`${text}: ${r.status}`);
  return formatTimeInputValue(r.value, { showSeconds: (opts as { showSeconds?: boolean }).showSeconds, approximate: r.approximate });
};

describe('parseTimeInput', () => {
  it('parses 24-hour times in common forms', () => {
    expect(fmt('13:05')).toBe('13:05');
    expect(fmt('13.05')).toBe('13:05');
    expect(fmt('1305')).toBe('13:05');
    expect(fmt('930')).toBe('09:30');
    expect(fmt('9')).toBe('09:00');
    expect(fmt('00:00')).toBe('00:00');
    expect(fmt('23:59')).toBe('23:59');
    expect(fmt('23:35:42', { showSeconds: true })).toBe('23:35:42');
    expect(fmt('23:35', { showSeconds: true })).toBe('23:35:00');
  });
  it('rejects 24:00, out-of-range values and am/pm (D+Tb-0001, D+Tb-0009)', () => {
    expect(parseTimeInput('24:00')).toMatchObject({ status: 'invalid', message: expect.stringMatching(/00:00/) });
    expect(parseTimeInput('25:00').status).toBe('invalid');
    expect(parseTimeInput('12:60').status).toBe('invalid');
    expect(parseTimeInput('2pm')).toMatchObject({ status: 'invalid', message: expect.stringMatching(/24-hour/) });
    expect(parseTimeInput('12:35 AM').status).toBe('invalid');
  });
  it('applies time shortcuts relative to the reference time (D+Tc-0025)', () => {
    const referenceTime = { hours: 13, minutes: 54 };
    expect(fmt('+3h', { referenceTime })).toBe('16:54');
    expect(fmt('-2m', { referenceTime })).toBe('13:52');
    expect(fmt('3m', { referenceTime })).toBe('13:57');
    expect(fmt('+30s', { referenceTime: { hours: 13, minutes: 54, seconds: 45 }, showSeconds: true })).toBe('13:55:15');
    expect(fmt('+3h')).toBe('16:54');
    const r = parseTimeInput('+3h', { referenceTime: { hours: 23, minutes: 0 } });
    expect(r).toMatchObject({ status: 'ok', value: { hours: 2, minutes: 0 }, dayOffset: 1 });
  });
  it('rejects date units in a time control (D+Tc-0044)', () => {
    for (const t of ['+3d', '-1w', '2y', '+1month']) {
      expect(parseTimeInput(t)).toMatchObject({ status: 'invalid', message: expect.stringMatching(/date unit/) });
    }
  });
  it('accepts Unknown and Approx', () => {
    expect(parseTimeInput('Un')).toMatchObject({ status: 'ok', value: 'unknown' });
    expect(parseTimeInput('unknown', { allowUnknown: false }).status).toBe('invalid');
    expect(fmt('approx 03:56')).toBe('Approx 03:56');
    expect(parseTimeInput('').status).toBe('empty');
  });
});

describe('spinTime', () => {
  it('steps the least significant displayed unit when no element is selected (D+Tc-0028)', () => {
    expect(spinTime({ hours: 23, minutes: 35, seconds: 1 }, null, 1, true)).toEqual({ hours: 23, minutes: 35, seconds: 2 });
    expect(spinTime({ hours: 23, minutes: 59 }, null, 1)).toEqual({ hours: 0, minutes: 0 });
    expect(spinTime({ hours: 0, minutes: 0 }, null, -1)).toEqual({ hours: 23, minutes: 59 });
    expect(spinTime({ hours: 10, minutes: 59, seconds: 59 }, null, 1, true)).toEqual({ hours: 11, minutes: 0, seconds: 0 });
  });
  it('steps only the selected element (D+Tc-0029)', () => {
    expect(spinTime({ hours: 23, minutes: 35, seconds: 1 }, 'h', -1, true)).toEqual({ hours: 22, minutes: 35, seconds: 1 });
    expect(spinTime({ hours: 10, minutes: 59 }, 'm', 1)).toEqual({ hours: 10, minutes: 0 });
    expect(spinTime({ hours: 23, minutes: 0 }, 'h', 1)).toEqual({ hours: 0, minutes: 0 });
    expect(spinTime({ hours: 1, minutes: 2, seconds: 0 }, 's', -1, true)).toEqual({ hours: 1, minutes: 2, seconds: 59 });
  });
});

describe('formatTimeInputValue', () => {
  it('formats with leading zeros and unknown text', () => {
    expect(formatTimeInputValue({ hours: 4, minutes: 5 })).toBe('04:05');
    expect(formatTimeInputValue('unknown')).toBe('Unknown');
    expect(formatTimeInputValue(null)).toBe('');
  });
});
