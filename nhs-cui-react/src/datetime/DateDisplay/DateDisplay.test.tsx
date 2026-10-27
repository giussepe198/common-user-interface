import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DateDisplay } from './DateDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

const visible = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]')?.textContent ?? c.textContent;

describe('DateDisplay', () => {
  it('shows the short format with a textual month and spoken long form (D+Ta-0002, D+Ta-0015)', () => {
    const { container } = render(<DateDisplay value="2008-04-05" />);
    expect(visible(container)).toBe('05-Apr-2008');
    expect(container.textContent).toContain('05 April 2008');
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe('2008-04-05');
  });
  it('shows May in full, the day of week and the long ordinal form', () => {
    const { container, rerender } = render(<DateDisplay value="2008-05-06" dayOfWeek />);
    expect(visible(container)).toBe('Tue 06-May-2008');
    rerender(<DateDisplay value="2008-01-01" format="long" ordinal />);
    expect(container.textContent).toBe('1st January 2008');
    expect(container.querySelector('sup')?.textContent).toBe('st');
  });
  it('never leaves a missing date blank (D+Ta-0022)', () => {
    const { container, rerender } = render(<DateDisplay value={null} />);
    expect(container.textContent).toBe('Unknown');
    rerender(<DateDisplay value="" nullText="Not recorded" />);
    expect(container.textContent).toBe('Not recorded');
    rerender(<DateDisplay value={{ kind: 'monthYear', year: 2005, month: 8 }} />);
    expect(container.textContent).toBe('Aug-2005');
  });
  it('uses the AU day abbreviation Thur (ACSQHC 2024); NZ and GB keep Thu', () => {
    const { container, rerender } = render(<ClinicalLocaleProvider region="AU"><DateDisplay value="2026-03-05" dayOfWeek /></ClinicalLocaleProvider>);
    expect(visible(container)).toBe('Thur 05-Mar-2026');
    rerender(<ClinicalLocaleProvider region="NZ"><DateDisplay value="2026-03-05" dayOfWeek /></ClinicalLocaleProvider>);
    expect(visible(container)).toBe('Thu 05-Mar-2026');
    rerender(<DateDisplay value="2026-03-05" dayOfWeek region="AU" format="long" longDateStyle="cui" />);
    expect(container.textContent).toBe('Thur 05 March 2026');
  });

  it('AU long dates follow the Australian Government Style Manual; the short form stays DD-Mmm-YYYY', () => {
    const { container, rerender } = render(<DateDisplay value="2026-03-05" format="long" region="AU" />);
    expect(container.textContent).toBe('5 March 2026');
    rerender(<DateDisplay value="2026-03-05" format="long" dayOfWeek ordinal region="AU" />);
    expect(container.textContent).toBe('Thursday 5 March 2026');
    expect(container.querySelector('sup')).toBeNull();
    rerender(<DateDisplay value="2026-03-05" region="AU" />);
    expect(visible(container)).toBe('05-Mar-2026');
    expect(container.textContent).toBe('05-Mar-20265 March 2026');
    rerender(<DateDisplay value="2026-03-05" format="long" region="NZ" />);
    expect(container.textContent).toBe('05 March 2026');
    rerender(<DateDisplay value="2026-03-05" format="long" region="GB" longDateStyle="style-manual" />);
    expect(container.textContent).toBe('5 March 2026');
  });
});
