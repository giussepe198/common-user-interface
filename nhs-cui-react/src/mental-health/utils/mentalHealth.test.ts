import { describe, it, expect } from 'vitest';
import {
  mhDeadlineState,
  mhFormatZonedDate,
  mhFormatZonedDateTime,
  mhIsNumericRiskLabel,
  mhIsReviewOverdue,
  mhKnownAs,
  mhRelativeTime,
  mhSortBySeverity,
  mhSplitAlerts,
} from './mentalHealth';

const NOW = '2026-10-28T03:00:00Z';

describe('mhRelativeTime', () => {
  it('counts minutes, hours under 48 hours, then days, rounded down', () => {
    expect(mhRelativeTime('2026-10-28T03:12:30Z', NOW)).toBe('in 12 minutes');
    expect(mhRelativeTime('2026-10-28T07:59:00Z', NOW)).toBe('in 4 hours');
    expect(mhRelativeTime('2026-10-29T04:00:00Z', NOW)).toBe('in 25 hours');
    expect(mhRelativeTime('2026-11-25T03:00:00Z', NOW)).toBe('in 28 days');
    expect(mhRelativeTime('2026-10-26T03:00:00Z', NOW)).toBe('2 days ago');
    expect(mhRelativeTime('2026-10-28T02:00:00Z', NOW)).toBe('1 hour ago');
    expect(mhRelativeTime('2026-10-28T03:00:20Z', NOW)).toBe('now');
  });
});

describe('mhDeadlineState', () => {
  it('is overdue once passed, whatever the thresholds', () => {
    expect(mhDeadlineState('2026-10-28T02:59:00Z', NOW)).toBe('overdue');
  });
  it('uses the host thresholds only when given', () => {
    expect(mhDeadlineState('2026-10-28T05:00:00Z', NOW)).toBe('calm');
    expect(mhDeadlineState('2026-10-28T05:00:00Z', NOW, { soonWithinMinutes: 72 * 60, urgentWithinMinutes: 24 * 60 })).toBe('urgent');
    expect(mhDeadlineState('2026-10-30T05:00:00Z', NOW, { soonWithinMinutes: 72 * 60, urgentWithinMinutes: 24 * 60 })).toBe('soon');
  });
});

describe('mhFormatZonedDateTime', () => {
  it('shows the date, 24-hour time and zone of the jurisdiction, not the browser', () => {
    expect(mhFormatZonedDateTime('2026-11-14T06:00:00Z', 'Australia/Melbourne')).toBe('14-Nov-2026 17:00 AEDT');
    expect(mhFormatZonedDateTime('2026-11-14T06:00:00Z', 'Pacific/Auckland')).toBe('14-Nov-2026 19:00 NZDT');
    expect(mhFormatZonedDateTime(null, 'Australia/Melbourne')).toBe('');
  });
  it('never shifts a date-only value by a zone', () => {
    expect(mhFormatZonedDate('2027-01-19', 'Pacific/Auckland')).toBe('19-Jan-2027');
    expect(mhFormatZonedDate('2027-01-19', 'Australia/Perth')).toBe('19-Jan-2027');
  });
});

describe('mhKnownAs', () => {
  it('shows the preferred name and pronouns when they differ', () => {
    expect(mhKnownAs({ givenName: 'Thi Lan', preferredName: 'Lan', pronouns: 'she/her' })?.text).toBe('Known as Lan (she/her)');
    expect(mhKnownAs({ givenName: 'Robert', preferredName: 'Bobbie' })?.text).toBe('Known as Bobbie');
  });
  it('keeps the preferred name whole, macrons and all', () => {
    expect(mhKnownAs({ givenName: 'Aroha', preferredName: 'Māia Rose' })?.text).toBe('Known as Māia Rose');
  });
  it('shows pronouns alone when the preferred name equals the given name', () => {
    expect(mhKnownAs({ givenName: 'Alex', preferredName: 'alex', pronouns: 'they/them' })?.text).toBe('Pronouns they/them');
  });
  it('returns null when nothing differs', () => {
    expect(mhKnownAs({ givenName: 'Alex', preferredName: 'Alex' })).toBeNull();
    expect(mhKnownAs({ givenName: 'Alex' })).toBeNull();
  });
});

describe('mhIsNumericRiskLabel', () => {
  it('flags numbers and scores', () => {
    for (const s of ['7', '3/5', '12 points', 'Score 4', '80%', '2.5']) expect(mhIsNumericRiskLabel(s)).toBe(true);
  });
  it('accepts words', () => {
    for (const s of ['High (clinician judgement)', 'Low', '', 'Seen 2 times']) expect(mhIsNumericRiskLabel(s)).toBe(false);
  });
});

describe('alert ordering and overflow', () => {
  const alerts = [
    { id: 'a', severity: 'low' as const },
    { id: 'b', severity: 'high' as const },
    { id: 'c', severity: 'moderate' as const },
    { id: 'd', severity: 'high' as const },
    { id: 'e', severity: 'moderate' as const },
  ];
  it('sorts high, moderate, low and keeps the given order within a severity', () => {
    expect(mhSortBySeverity(alerts).map((a) => a.id)).toEqual(['b', 'd', 'c', 'e', 'a']);
  });
  it('never hides a high alert and hides nothing silently', () => {
    const { shown, hidden } = mhSplitAlerts(alerts, 1);
    expect(shown.map((a) => a.id)).toEqual(['b', 'd', 'c']);
    expect(hidden.map((a) => a.id)).toEqual(['e', 'a']);
    const none = mhSplitAlerts(alerts, 0);
    expect(none.shown.map((a) => a.id)).toEqual(['b', 'd']);
    expect(none.shown.length + none.hidden.length).toBe(alerts.length);
  });
});

describe('mhIsReviewOverdue', () => {
  it('is true only once the review date has passed', () => {
    expect(mhIsReviewOverdue('2026-10-01', NOW)).toBe(true);
    expect(mhIsReviewOverdue('2026-12-01', NOW)).toBe(false);
    expect(mhIsReviewOverdue(null, NOW)).toBe(false);
  });
});
