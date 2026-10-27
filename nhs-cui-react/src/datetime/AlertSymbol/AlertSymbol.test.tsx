import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AlertSymbol } from './AlertSymbol';

afterEach(cleanup);

describe('AlertSymbol', () => {
  it('has a functional text equivalent (alertsymbdes 8)', () => {
    render(<AlertSymbol kind="warning" label="Warning: above recommended dose" />);
    expect(screen.getByRole('img', { name: 'Warning: above recommended dose' })).toBeTruthy();
  });
  it('draws each class with its own shape; warning keeps the black border', () => {
    const { container } = render(
      <>
        <AlertSymbol kind="prohibition" label="Do not crush" />
        <AlertSymbol kind="mandatory" label="Must be witnessed" />
        <AlertSymbol kind="warning" label="Caution" />
      </>,
    );
    expect(container.querySelector('.cui-alert-symbol__prohibition-bar')?.getAttribute('d')).toBe('M4.75 4.75L19.25 19.25');
    expect(container.querySelector('.cui-alert-symbol__mandatory-fill')).toBeTruthy();
    expect(container.querySelector('.cui-alert-symbol--warning path')?.getAttribute('stroke')).toBe('#000000');
  });
  it('shows a modifier and a visible label when asked, and sizes per Table 4', () => {
    const { container } = render(<AlertSymbol kind="information" label="3 new results" modifier={3} showLabel size={24} />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.textContent).toContain('3 new results');
    expect(container.querySelector('.cui-alert-symbol__modifier')?.textContent).toBe('3');
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('24');
  });
});
