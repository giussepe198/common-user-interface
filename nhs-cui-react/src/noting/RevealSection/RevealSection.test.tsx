import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RevealSection } from './RevealSection';

afterEach(cleanup);

describe('RevealSection', () => {
  it('reveals and hides with one labelled check box (CNA-0930) and announces it (CNA-1920)', () => {
    render(<RevealSection label="Further details: CVS examination"><input aria-label="Heart sounds" /></RevealSection>);
    const toggle = screen.getByRole('checkbox', { name: 'Further details: CVS examination' });
    expect(screen.queryByRole('textbox', { name: 'Heart sounds' })).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByRole('textbox', { name: 'Heart sounds' })).toBeTruthy();
    expect(screen.getByText(/further fields shown below/)).toBeTruthy();
  });
  it('cannot be hidden while it holds data (CNA-0960/0970)', () => {
    render(<RevealSection label="Further details" defaultOpen hasData><input aria-label="Heart sounds" /></RevealSection>);
    expect((screen.getByRole('checkbox', { name: 'Further details' }) as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByText('Contains entered data, so it cannot be hidden.')).toBeTruthy();
  });
  it('opens when triggered by data (CNA-0880)', () => {
    const { rerender } = render(<RevealSection label="Details" trigger={false}><span>Inside</span></RevealSection>);
    rerender(<RevealSection label="Details" trigger><span>Inside</span></RevealSection>);
    expect((screen.getByRole('checkbox', { name: 'Details' }) as HTMLInputElement).checked).toBe(true);
  });
});
