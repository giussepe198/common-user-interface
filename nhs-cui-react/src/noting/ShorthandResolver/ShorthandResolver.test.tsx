import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ShorthandResolver } from './ShorthandResolver';

afterEach(cleanup);
const res = [{ id: 'mi1', label: 'Myocardial infarction' }, { id: 'mi2', label: 'Mitral incompetence', description: 'Cardiology' }];

describe('ShorthandResolver', () => {
  it('pre-selects nothing (no top match) and resolves with the keyboard', () => {
    const onResolve = vi.fn();
    render(<ShorthandResolver shorthand="MI" resolutions={res} onResolve={onResolve} onDismiss={vi.fn()} />);
    const list = screen.getByRole('listbox');
    expect(screen.getAllByRole('option').every((o) => o.getAttribute('aria-selected') === 'false')).toBe(true);
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onResolve).toHaveBeenCalledWith(res[1]);
  });
  it('closes on Escape and on click-away', () => {
    const onDismiss = vi.fn();
    render(<div><button>Outside</button><ShorthandResolver shorthand="MI" resolutions={res} onResolve={vi.fn()} onDismiss={onDismiss} /></div>);
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Outside' }));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });
});
