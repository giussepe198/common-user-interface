import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MissedRequiredFieldsPanel } from './MissedRequiredFieldsPanel';
import { useRequiredFieldTracking } from './useRequiredFieldTracking';

afterEach(cleanup);

describe('MissedRequiredFieldsPanel', () => {
  it('lists all missed fields grouped by section with links (CNA-1210, CNA-1230)', () => {
    const onNavigate = vi.fn();
    render(<MissedRequiredFieldsPanel items={[{ id: 'a', label: 'Pulse', section: 'Observations' }, { id: 'b', label: 'Allergies', section: 'History' }]} onNavigate={onNavigate} />);
    expect(screen.getByRole('heading', { name: /Required fields/ })).toBeTruthy();
    expect(screen.getByText('2 required fields not completed.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Pulse' }));
    expect(onNavigate).toHaveBeenCalledWith('a');
  });
  it('renders nothing visible when nothing is missed', () => {
    const { container } = render(<MissedRequiredFieldsPanel items={[]} />);
    expect(container.querySelector('aside')).toBeNull();
  });
  it('tracks fields passed over while empty (CNA-1150)', () => {
    function Form() {
      const t = useRequiredFieldTracking([{ id: 'f1', label: 'Pulse', empty: true }, { id: 'f2', label: 'BP', empty: true }]);
      return (
        <div {...t.formProps}>
          <input id="f1" aria-label="Pulse" />
          <input id="f2" aria-label="BP" />
          <MissedRequiredFieldsPanel items={t.missedItems} onNavigate={() => undefined} />
        </div>
      );
    }
    render(<Form />);
    fireEvent.focus(screen.getByLabelText('BP'));
    expect(screen.getByRole('button', { name: 'Pulse' })).toBeTruthy();
  });
  it('markAllMissed marks every empty required field on Save and returns them', () => {
    const saved = vi.fn();
    function Form() {
      const [pulse, setPulse] = React.useState('');
      const t = useRequiredFieldTracking([
        { id: 'f1', label: 'Pulse', section: 'Observations', empty: !pulse },
        { id: 'f2', label: 'BP', section: 'Observations', empty: true },
        { id: 'f3', label: 'Comment', required: false, empty: true },
      ]);
      return (
        <div {...t.formProps}>
          <input id="f1" aria-label="Pulse" value={pulse} onChange={(e) => setPulse(e.target.value)} />
          <input id="f2" aria-label="BP" />
          <input id="f3" aria-label="Comment" />
          <button type="button" onClick={() => saved(t.markAllMissed())}>Save</button>
          <span data-testid="missed">{t.missedIds.join(',')}</span>
          <MissedRequiredFieldsPanel items={t.missedItems} onNavigate={() => undefined} />
        </div>
      );
    }
    render(<Form />);
    expect(screen.getByTestId('missed').textContent).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(saved).toHaveBeenLastCalledWith([
      { id: 'f1', label: 'Pulse', section: 'Observations' },
      { id: 'f2', label: 'BP', section: 'Observations' },
    ]);
    expect(screen.getByTestId('missed').textContent).toBe('f1,f2');
    fireEvent.change(screen.getByLabelText('Pulse'), { target: { value: '72' } });
    expect(screen.getByTestId('missed').textContent).toBe('f2');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(saved).toHaveBeenLastCalledWith([{ id: 'f2', label: 'BP', section: 'Observations' }]);
  });
});
