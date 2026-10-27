import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { TimeDisplay } from './TimeDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

const utc = (iso: string) => new Date(iso);

describe('TimeDisplay', () => {
  it('shows 24-hour HH:mm with an indicator (D+Tb-0001, D+Tb-0032)', () => {
    const { container, rerender } = render(<TimeDisplay value="9:05" />);
    expect(container.textContent).toBe('09:05');
    expect(container.querySelector('time')?.getAttribute('title')).toBe('24-hour clock');
    rerender(<TimeDisplay value={{ hours: 0, minutes: 0, seconds: 7 }} showSeconds clockIndicator="visible" />);
    expect(container.textContent).toBe('00:00:0724-hour clock');
  });
  it('prefixes Approx and shows Unknown for missing values', () => {
    const { container, rerender } = render(<TimeDisplay value="03:56" approximate />);
    expect(container.textContent).toBe('Approx 03:56');
    rerender(<TimeDisplay value={null} nullText="Not recorded" />);
    expect(container.textContent).toBe('Not recorded');
    rerender(<TimeDisplay value="unknown" />);
    expect(container.textContent).toBe('Unknown');
  });
  it('shows an instant in a named zone with its abbreviation (AU-DT-07, AU-DT-08)', () => {
    const t = utc('2026-01-15T03:30:00Z');
    const { container, rerender } = render(<TimeDisplay value={t} timeZone="Australia/Sydney" showZone />);
    expect(container.textContent).toBe('14:30 AEDTAustralian Eastern Daylight Time');
    expect(container.querySelector('abbr')?.textContent).toBe('AEDT');
    rerender(<TimeDisplay value={t} timeZone="Australia/Brisbane" showZone />);
    expect(container.querySelector('abbr')?.textContent).toBe('AEST');
    rerender(<TimeDisplay value={t} timeZone="Australia/Perth" />);
    expect(container.textContent).toBe('11:30');
  });
  it('"auto" labels only times from another zone or in the repeated hour', () => {
    const t = utc('2026-01-15T03:30:00Z');
    const { container, rerender } = render(
      <ClinicalLocaleProvider region="AU" timeZone="Australia/Sydney"><TimeDisplay value={t} timeZone="Australia/Melbourne" showZone="auto" /></ClinicalLocaleProvider>,
    );
    expect(container.querySelector('abbr')).toBeNull();
    rerender(<ClinicalLocaleProvider region="AU" timeZone="Australia/Sydney"><TimeDisplay value={t} timeZone="Australia/Brisbane" showZone="auto" /></ClinicalLocaleProvider>);
    expect(container.querySelector('abbr')?.textContent).toBe('AEST');
    // 02:30 NZDT on 05-Apr-2026, the first of two
    rerender(<ClinicalLocaleProvider region="NZ"><TimeDisplay value={utc('2026-04-04T13:30:00Z')} showZone="auto" /></ClinicalLocaleProvider>);
    expect(container.textContent).toContain('02:30');
    expect(container.querySelector('abbr')?.textContent).toBe('NZDT');
  });
});
