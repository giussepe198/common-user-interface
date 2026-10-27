import { describe, expect, it } from 'vitest';
import { addToDate, dateInputValueToIso, formatDateInputValue, monthFromName, parseDateInput } from './dateInput';

const today = new Date(2026, 9, 27); // 27-Oct-2026
const ok = (text: string, opts = {}) => {
  const r = parseDateInput(text, { today, ...opts });
  if (r.status !== 'ok') throw new Error(`${text}: ${r.status} ${'message' in r ? r.message : ''}`);
  return formatDateInputValue(r.value);
};

describe('parseDateInput', () => {
  it('returns empty for blank input', () => {
    expect(parseDateInput('  ').status).toBe('empty');
  });
  it('accepts CUI short dates and text-month variants', () => {
    expect(ok('05-Apr-2008')).toBe('05-Apr-2008');
    expect(ok('5 april 2008')).toBe('05-Apr-2008');
    expect(ok('5th April 2008')).toBe('05-Apr-2008');
    expect(ok('1-sept-2008')).toBe('01-Sep-2008');
    expect(ok('April 5, 2008')).toBe('05-Apr-2008');
    expect(ok('2008-04-05')).toBe('05-Apr-2008');
    expect(ok('31-May-2008')).toBe('31-May-2008');
  });
  it('rejects dates that do not exist', () => {
    const r = parseDateInput('31-Apr-2008', { today });
    expect(r.status).toBe('invalid');
    expect(r.status === 'invalid' && r.message).toMatch(/April 2008 has 30 days/);
    expect(parseDateInput('29/02/2007', { today }).status).toBe('invalid');
    expect(ok('29/02/2008')).toBe('29-Feb-2008');
  });
  it('offers both readings of an ambiguous numeric date, UK first (D+Tc-0005, D+Tc-0040)', () => {
    const r = parseDateInput('05/04/2009', { today });
    expect(r.status).toBe('ambiguous');
    if (r.status !== 'ambiguous') return;
    expect(r.candidates.map(c => formatDateInputValue(c))).toEqual(['05-Apr-2009', '04-May-2009']);
    expect(r.candidates.length).toBeLessThanOrEqual(2);
    expect(r.message).toContain('05/04/2009');
  });
  it('accepts unambiguous numeric dates', () => {
    expect(ok('25/12/2008')).toBe('25-Dec-2008');
    expect(ok('12/25/2008')).toBe('25-Dec-2008');
    expect(ok('05/05/2009')).toBe('05-May-2009');
    expect(ok('25122008')).toBe('25-Dec-2008');
  });
  it('asks about the century for two-digit years', () => {
    const r = parseDateInput('25/12/45', { today });
    expect(r.status).toBe('ambiguous');
    if (r.status === 'ambiguous') expect(r.candidates.map(c => formatDateInputValue(c))).toEqual(['25-Dec-2045', '25-Dec-1945']);
    expect(parseDateInput('05/04/09', { today }).status).toBe('incomplete');
    expect(parseDateInput('05-Apr-08', { today }).status).toBe('ambiguous');
  });
  it('applies arithmetic shortcuts relative to the reference date (D+Tc-0007)', () => {
    const referenceDate = new Date(2008, 0, 31);
    expect(ok('+3d', { referenceDate })).toBe('03-Feb-2008');
    expect(ok('-2w', { referenceDate })).toBe('17-Jan-2008');
    expect(ok('1m', { referenceDate })).toBe('29-Feb-2008');
    expect(ok('+1y', { referenceDate })).toBe('31-Jan-2009');
    expect(ok('-3m', { referenceDate })).toBe('31-Oct-2007');
    expect(ok('+3 days', { referenceDate })).toBe('03-Feb-2008');
    expect(ok('+0d')).toBe('27-Oct-2026');
  });
  it('rejects time units in a date control (D+Tc-0041)', () => {
    for (const t of ['+3h', '-2min', '5s', '+1hr']) {
      const r = parseDateInput(t, { today });
      expect(r.status).toBe('invalid');
      expect(r.status === 'invalid' && r.message).toMatch(/time unit/);
    }
    expect(parseDateInput('+3q', { today }).status).toBe('invalid');
  });
  it('handles Unknown (D+Tc-0008)', () => {
    expect(ok('Un')).toBe('Unknown');
    expect(ok('unknown')).toBe('Unknown');
    expect(parseDateInput('unknown', { today, allowUnknown: false }).status).toBe('invalid');
    expect(parseDateInput('not rec', { today, unknownText: 'Not recorded' })).toEqual({ status: 'ok', value: { kind: 'unknown' } });
  });
  it('handles partial dates only when allowed', () => {
    expect(ok('August 2005', { allowMonthYear: true })).toBe('Aug-2005');
    expect(ok('08/2005', { allowMonthYear: true })).toBe('Aug-2005');
    expect(parseDateInput('August 2005', { today }).status).toBe('incomplete');
    expect(ok('2005', { allowYear: true })).toBe('2005');
    expect(parseDateInput('2005', { today }).status).toBe('incomplete');
    expect(parseDateInput('5 April', { today }).status).toBe('incomplete');
    expect(parseDateInput('April', { today }).status).toBe('incomplete');
    expect(parseDateInput('17', { today }).status).toBe('incomplete');
  });
  it('accepts the today shortcut only when enabled', () => {
    expect(ok('t', { allowTodayShortcut: true })).toBe('27-Oct-2026');
    expect(parseDateInput('t', { today }).status).not.toBe('ok');
  });
  it('reports unrecognised text', () => {
    expect(parseDateInput('next tuesday', { today }).status).toBe('invalid');
    expect(parseDateInput('05-Foo-2008', { today }).status).toBe('invalid');
  });
});

describe('date helpers', () => {
  it('formats partial values and ISO attributes', () => {
    expect(formatDateInputValue({ kind: 'monthYear', year: 2008, month: 3 })).toBe('Mar-2008');
    expect(formatDateInputValue({ kind: 'year', year: 2008 })).toBe('2008');
    expect(formatDateInputValue({ kind: 'unknown' }, 'Not recorded')).toBe('Not recorded');
    expect(formatDateInputValue(null)).toBe('');
    expect(dateInputValueToIso({ kind: 'full', year: 2008, month: 4, day: 5 })).toBe('2008-04-05');
    expect(dateInputValueToIso({ kind: 'monthYear', year: 2008, month: 4 })).toBe('2008-04');
  });
  it('matches month names of three or more letters', () => {
    expect(monthFromName('Sep')).toBe(9);
    expect(monthFromName('sept')).toBe(9);
    expect(monthFromName('Ju')).toBeNull();
    expect(monthFromName('may')).toBe(5);
  });
  it('clamps month arithmetic to month end', () => {
    expect(addToDate(new Date(2009, 0, 31), 1, 'm').getDate()).toBe(28);
    expect(addToDate(new Date(2008, 1, 29), 1, 'y').getDate()).toBe(28);
  });
});

describe('regional numeric date order', () => {
  const today = new Date(2026, 9, 27);
  it('AU and NZ read numeric dates day first without asking', () => {
    for (const region of ['AU', 'NZ'] as const) {
      expect(parseDateInput('05/04/2009', { region, today })).toEqual({ status: 'ok', value: { kind: 'full', year: 2009, month: 4, day: 5 } });
      expect(parseDateInput('5/4/2009', { region, today })).toEqual({ status: 'ok', value: { kind: 'full', year: 2009, month: 4, day: 5 } });
    }
  });
  it('AU and NZ never accept month-first dates', () => {
    const r = parseDateInput('04/13/2009', { region: 'AU', today });
    expect(r.status).toBe('invalid');
    expect(r.status === 'invalid' && r.message).toMatch(/day first/);
  });
  it('two-digit years still ask for the century, day first', () => {
    const r = parseDateInput('05/04/09', { region: 'NZ', today });
    expect(r.status).toBe('ambiguous');
    expect(r.status === 'ambiguous' && r.candidates).toEqual([{ kind: 'full', year: 2009, month: 4, day: 5 }, { kind: 'full', year: 1909, month: 4, day: 5 }]);
  });
  it('GB still offers both readings', () => {
    expect(parseDateInput('05/04/2009', { today }).status).toBe('ambiguous');
    expect(parseDateInput('05/04/2009', { region: 'GB', today }).status).toBe('ambiguous');
  });
});
