import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within, cleanup } from '@testing-library/react';
import { DecisionSupportStatusIndicator } from './DecisionSupportStatusIndicator';

afterEach(cleanup);

const services = [
  { id: 'b', name: 'Licensed use of Drug Checking', state: 'running' as const },
  { id: 'a', name: 'Drug to Disease Contraindications Checking', state: 'notRunning' as const, since: new Date(2007, 0, 12, 10, 42) },
  { id: 'c', name: 'Dose Calculations', state: 'unavailable' as const },
];

describe('DecisionSupportStatusIndicator', () => {
  it('derives degraded state and says so in text (2.1.1)', () => {
    render(<DecisionSupportStatusIndicator services={services} changedSinceViewed />);
    const b = screen.getByRole('button', { name: /Decision Support/ });
    expect(b.textContent).toContain('not all services running, changed since last viewed');
    expect(b.className).toContain('--degraded');
  });

  it('expands to an alphabetical list with status text and tooltip, Esc closes (2.1.2)', () => {
    const onOpenHelp = vi.fn();
    render(<DecisionSupportStatusIndicator services={services} onOpenHelp={onOpenHelp} />);
    const b = screen.getByRole('button', { name: /Decision Support/ });
    fireEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('true');
    const region = screen.getByRole('region');
    const items = within(region).getAllByRole('listitem');
    expect(items.map(i => i.textContent!.split('.')[0])).toEqual([
      expect.stringContaining('Dose Calculations'),
      expect.stringContaining('Drug to Disease'),
      expect.stringContaining('Licensed use'),
    ]);
    expect(items[1].getAttribute('title')).toBe('This service has been not running since 12-Jan-2007; 10:42');
    fireEvent.click(within(items[1]).getByRole('button'));
    expect(onOpenHelp).toHaveBeenCalledWith('a');
    fireEvent.keyDown(region, { key: 'Escape' });
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('full state when everything runs', () => {
    render(<DecisionSupportStatusIndicator services={[services[0]]} />);
    expect(screen.getByRole('button').className).toContain('--full');
  });
});
