import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { CascadeLevel} from './CascadeSelector';
import { CascadeSelector, cascadeLevelsForPath } from './CascadeSelector';

afterEach(cleanup);

const formLevel: CascadeLevel = { id: 'form', label: 'Form', options: [{ id: 'tab', label: 'tablet' }, { id: 'liq', label: 'oral liquid' }] };
const root: CascadeLevel = {
  id: 'route', label: 'Route',
  options: [
    { id: 'aten-oral', label: 'oral', drug: { genericName: 'atenolol' }, kind: 'generic', next: formLevel },
    { id: 'brand-oral', label: 'oral', drug: { brandName: 'Tenormin' }, kind: 'brand' },
    { id: 'aten-iv', label: 'intravenous', drug: { genericName: 'atenolol' }, kind: 'generic' },
  ],
};

describe('CascadeSelector', () => {
  it('generic part above brand part, "other..." last below a line (MSP-0940/0950, MSP-1010/1020)', () => {
    render(<CascadeSelector root={root} />);
    const list = screen.getByRole('listbox', { name: 'Route' });
    const items = within(list).getAllByRole('option').map(o => o.textContent);
    expect(items).toEqual(['atenolol – oral', 'atenolol – intravenous', 'TENORMIN – oral', 'other...']);
    expect(within(list).getAllByRole('option')[3].className).toContain('has-divider');
  });
  it('next list appears only after a selection, then completes (MSP-0860, MSP-1040)', () => {
    const onComplete = vi.fn();
    render(<CascadeSelector root={root} onComplete={onComplete} />);
    expect(screen.queryByRole('listbox', { name: 'Form' })).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: 'atenolol – oral' }));
    expect(screen.getByRole('listbox', { name: 'Form' })).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('option', { name: 'tablet' }), { key: 'Enter' });
    expect(onComplete).toHaveBeenCalledWith(['aten-oral', 'tab'], [root.options[0], formLevel.options[0]]);
    expect(screen.getByRole('option', { name: 'atenolol – oral' }).getAttribute('aria-selected')).toBe('true');
  });
  it('keyboard arrows within and between lists; other... calls onOther', () => {
    const onOther = vi.fn();
    render(<CascadeSelector root={root} defaultValue={['aten-oral']} onOther={onOther} />);
    const first = screen.getByRole('option', { name: 'atenolol – oral' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('atenolol – intravenous');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe('tablet');
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(document.activeElement?.textContent).toBe('atenolol – oral');
    fireEvent.click(within(screen.getByRole('listbox', { name: 'Form' })).getByRole('option', { name: 'other...' }));
    expect(onOther).toHaveBeenCalledWith('form', ['aten-oral']);
  });
  it('AU: brand in Title Case', () => {
    render(<CascadeSelector root={root} region="AU" />);
    expect(screen.getByRole('option', { name: 'Tenormin – oral' })).toBeTruthy();
  });
  it('cascadeLevelsForPath', () => {
    expect(cascadeLevelsForPath(root, ['aten-oral']).map(l => l.level.id)).toEqual(['route', 'form']);
  });
});
