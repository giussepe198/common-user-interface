import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MedicareNumberDisplay } from './MedicareNumberDisplay';

afterEach(cleanup);

describe('MedicareNumberDisplay', () => {
  it('shows the number as on the card with the IRN (AU-ID-03)', () => {
    const { container } = render(<MedicareNumberDisplay label="Medicare" value="2123456701" irn="1" />);
    expect(container.textContent).toBe('Medicare 2123 45670 1 IRN 1');
  });
  it('reads an 11th digit as the IRN', () => {
    const { container } = render(<MedicareNumberDisplay value="21234567012" />);
    expect(container.textContent).toBe('2123 45670 1 IRN 2');
  });
  it('flags a missing IRN and an invalid number in text', () => {
    const { container, rerender } = render(<MedicareNumberDisplay value="2123456701" />);
    expect(container.textContent).toContain('IRN not recorded');
    rerender(<MedicareNumberDisplay value="2123456711" irn="1" />);
    expect(container.textContent).toContain('not a valid Medicare number');
  });
});

describe('MedicareNumberDisplay valid to (G12 1)', () => {
  const now = new Date(2026, 9, 27);
  it('shows the valid to month as printed', () => {
    const { container } = render(<MedicareNumberDisplay value="2123456701" irn="1" validTo="6/28" now={now} />);
    expect(container.textContent).toBe('2123 45670 1 IRN 1, Valid to 06/2028');
  });
  it('flags expired and expiring cards in text with an icon', () => {
    const { container, rerender } = render(<MedicareNumberDisplay value="2123456701" irn="1" validTo="09/2026" now={now} />);
    expect(container.textContent).toContain('Card expired');
    expect(container.querySelector('.cui-identifier__flag--warning svg, .cui-identifier__flag--warning .cui-icon')).toBeTruthy();
    rerender(<MedicareNumberDisplay value="2123456701" irn="1" validTo="11/2026" now={now} />);
    expect(container.textContent).toContain('Card expires soon');
    rerender(<MedicareNumberDisplay value="2123456701" irn="1" validTo="bad" now={now} />);
    expect(container.textContent).toContain('Valid to date not readable');
  });
});
