import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { IhiDisplay, ihiStatusQualifiers } from './IhiDisplay';

afterEach(cleanup);

describe('IhiDisplay', () => {
  it('formats 4-4-4-4 with a label', () => {
    const { container } = render(<IhiDisplay label="IHI" value="8003601234567894" />);
    expect(container.textContent).toBe('IHI 8003 6012 3456 7894');
  });
  it('status qualifiers in text, not colour (AU-ID-01)', () => {
    const { container } = render(<IhiDisplay value="8003601234567894" numberStatus="Deceased" recordStatus="Unverified" />);
    expect(container.textContent).toBe('8003 6012 3456 7894 (Deceased, Unverified)');
    expect(ihiStatusQualifiers('Active', 'Verified')).toEqual([]);
  });
  it('invalid value shown as supplied with a warning', () => {
    const { container } = render(<IhiDisplay value="8003601234567895" />);
    expect(container.textContent).toBe('8003601234567895 not a valid IHI');
  });
  it('unknown text', () => {
    const { container } = render(<IhiDisplay label="IHI" value={null} />);
    expect(container.textContent).toBe('IHI Not Known');
  });
});
