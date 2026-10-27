import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RepeatableFieldGroup } from './RepeatableFieldGroup';

afterEach(cleanup);
const now = new Date(2026, 9, 27, 15, 0);

describe('RepeatableFieldGroup', () => {
  it('labels each set with its time of entry, not first or second (Theme 8)', () => {
    render(<RepeatableFieldGroup label="Vital signs" now={now} instances={[{ id: 'a', recordedAt: new Date(2026, 9, 26, 9, 5) }, { id: 'b', recordedAt: new Date(2026, 9, 27, 14, 32) }]} renderInstance={(i) => <input aria-label={`Pulse ${i.id}`} />} onAdd={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Vital signs, Recorded 26-Oct-2026 09:05' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Vital signs, Recorded 14:32' })).toBeTruthy();
  });
  it('adds another next to the most recent set and respects a maximum', () => {
    const onAdd = vi.fn();
    const { rerender } = render(<RepeatableFieldGroup label="BP" now={now} instances={[{ id: 'a', recordedAt: now }]} renderInstance={() => null} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add another' }));
    expect(onAdd).toHaveBeenCalled();
    rerender(<RepeatableFieldGroup label="BP" now={now} maxInstances={1} instances={[{ id: 'a', recordedAt: now }]} renderInstance={() => null} onAdd={onAdd} />);
    expect((screen.getByRole('button', { name: 'Add another' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
