import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MobileNavBar } from './MobileNavBar';

afterEach(cleanup);

describe('MobileNavBar', () => {
  it('puts Scan in the centre with a visible label', () => {
    const onScan = vi.fn();
    render(
      <MobileNavBar
        current="worklist"
        onScan={onScan}
        items={[
          { id: 'worklist', label: 'Worklist', icon: 'tick' },
          { id: 'patients', label: 'Patients', icon: 'summary' },
          { id: 'dictate', label: 'Dictate', icon: 'dictate' },
          { id: 'handover', label: 'Handover', icon: 'handover' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(Array.from(nav.querySelectorAll('button')).map(b => b.textContent)).toEqual(['Worklist', 'Patients', 'Scan', 'Dictate', 'Handover']);
    expect(screen.getByRole('button', { name: 'Worklist' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Scan' }));
    expect(onScan).toHaveBeenCalled();
  });
});
