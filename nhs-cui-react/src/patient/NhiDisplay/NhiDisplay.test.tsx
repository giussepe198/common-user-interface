import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NhiDisplay } from './NhiDisplay';

afterEach(cleanup);

describe('NhiDisplay', () => {
  it('7 characters, upper case, ungrouped (G11 1.3)', () => {
    const { container } = render(<NhiDisplay label="NHI" value="aca31fm" />);
    expect(container.textContent).toBe('NHI ACA31FM');
  });
  it('flags test-range and invalid numbers in text', () => {
    const { container, rerender } = render(<NhiDisplay value="ZAC5361" />);
    expect(container.textContent).toBe('ZAC5361 Test NHI');
    rerender(<NhiDisplay value="ZAC5362" />);
    expect(container.textContent).toBe('ZAC5362 not a valid NHI');
    rerender(<NhiDisplay value="ZAC5361" flagTestNumbers={false} />);
    expect(container.textContent).toBe('ZAC5361');
  });
  it('can show the format', () => {
    const { container } = render(<NhiDisplay value="ACA31FM" showFormat />);
    expect(container.textContent).toBe('ACA31FM (new format)');
  });
});

describe('NhiDisplay dormant NHI (HISO 10046 2.1.2, G12 4)', () => {
  it('flags a dormant NHI and names the live one', () => {
    const { container } = render(<NhiDisplay label="NHI" value="ZAC5361" status="dormant" liveNhi="zbn77vl" flagTestNumbers={false} />);
    expect(container.textContent).toContain('Dormant NHI');
    expect(container.textContent).toContain('Live NHI: ZBN77VL');
  });
  it('"Use live NHI" calls back with the live NHI and is keyboard operable', () => {
    const onUse = vi.fn();
    render(<NhiDisplay value="ZAC5361" status="dormant" liveNhi="ZBN77VL" onUseLiveNhi={onUse} flagTestNumbers={false} />);
    const b = screen.getByRole('button', { name: 'Use live NHI' });
    b.focus();
    expect(document.activeElement).toBe(b);
    fireEvent.click(b);
    expect(onUse).toHaveBeenCalledWith('ZBN77VL');
  });
  it('a live NHI shows no link', () => {
    const { container } = render(<NhiDisplay value="ZBN77VL" flagTestNumbers={false} />);
    expect(container.textContent).toBe('ZBN77VL');
  });
});
