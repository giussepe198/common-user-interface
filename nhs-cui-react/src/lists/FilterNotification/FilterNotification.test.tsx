import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { FilterNotification } from './FilterNotification';
import type { ListAttribute } from '../utils/listTypes';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

afterEach(cleanup);

const attrs: ListAttribute[] = [{ id: 'news', label: 'NEWS2 score', dataType: 'integer' }];
const filter = { combine: 'or' as const, criteria: [{ attributeId: 'news', operator: 'greaterThanOrEqual' as const, value: '5' }] };

describe('FilterNotification', () => {
  it('starts "Data filtered to show" and removes all filters (FSG-0073, FSG-0057)', () => {
    const onRemoveAll = vi.fn();
    render(<FilterNotification filter={filter} attributes={attrs} onRemoveAll={onRemoveAll} counts={{ in: 2, out: 3, all: 5 }} rowNoun="patients" />);
    expect(screen.getByRole('status').textContent).toMatch(/^Data filtered to show/);
    expect(screen.getByText(/2 of 5 patients shown/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove all filters' }));
    expect(onRemoveAll).toHaveBeenCalled();
  });
  it('moves between result tabs with the arrow keys (FSG-0068)', () => {
    const onViewChange = vi.fn();
    render(<FilterNotification filter={filter} attributes={attrs} onRemoveAll={() => {}} counts={{ in: 2, out: 3, all: 5 }} view="in" onViewChange={onViewChange} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(onViewChange).toHaveBeenCalledWith('out');
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(onViewChange).toHaveBeenLastCalledWith('all');
  });
  it('bar is token-based and calm in both themes, text and icon at least 4.5:1 (FSG-0070)', () => {
    const css = readFileSync(resolve(__dirname, 'FilterNotification.css'), 'utf8');
    const bar = /\.cui-filter-notification__bar \{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(bar).not.toMatch(/#[0-9a-f]{3,6}|rgb/i);
    const bg = /background:\s*var\((--[a-z-]+)\)/.exec(bar)?.[1];
    const fg = /[^-]color:\s*var\((--[a-z-]+)\)/.exec(bar)?.[1];
    const icon = /__bar > \.cui-icon \{[^}]*color:\s*var\((--[a-z-]+)\)/.exec(css)?.[1];
    expect(bg).toBe('--info-surface');
    const tokens = readFileSync(resolve(__dirname, '../../styles/tokens.css'), 'utf8');
    const theme = (sel: string) => {
      const block = tokens.slice(tokens.indexOf(sel));
      const body = block.slice(block.indexOf('{') + 1, block.indexOf('}'));
      return Object.fromEntries([...body.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2]]));
    };
    const lum = (hex: string) => {
      const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    for (const sel of [':root, [data-theme="light"]', '[data-theme="dark"]']) {
      const t = theme(sel);
      expect(ratio(t[fg!], t[bg!])).toBeGreaterThanOrEqual(4.5);
      expect(ratio(t[icon!], t[bg!])).toBeGreaterThanOrEqual(4.5);
      // Calm: the bar fill is not a bright light colour in dark theme (the old --accent strip).
      if (sel.startsWith('[data-theme="dark"]')) expect(lum(t[bg!])).toBeLessThan(0.1);
    }
  });
});
