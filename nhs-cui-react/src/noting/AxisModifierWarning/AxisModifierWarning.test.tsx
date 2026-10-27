import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AxisModifierWarning } from './AxisModifierWarning';

afterEach(cleanup);

describe('AxisModifierWarning', () => {
  it('offers exactly two resolutions, never Yes/No/Cancel', () => {
    render(<AxisModifierWarning conceptLabel="Breast cancer" modifierText="Mother" onConfirmModifier={vi.fn()} onLeaveAsIs={vi.fn()} />);
    const buttons = screen.getAllByRole('button').map((b) => b.textContent);
    expect(buttons).toEqual(['Leave note as it is', 'Confirm mother has breast cancer']);
    expect(screen.getByRole('alertdialog').getAttribute('aria-modal')).toBe('true');
  });
  it('calls the chosen resolution; Escape leaves the note as it is', () => {
    const confirm = vi.fn();
    const leave = vi.fn();
    render(<AxisModifierWarning conceptLabel="Breast cancer" modifierText="Mother" onConfirmModifier={confirm} onLeaveAsIs={leave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm mother has breast cancer' }));
    expect(confirm).toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(leave).toHaveBeenCalled();
  });
  it('moves focus into the dialog', () => {
    render(<AxisModifierWarning conceptLabel="X" modifierText="Father" onConfirmModifier={vi.fn()} onLeaveAsIs={vi.fn()} />);
    expect(document.activeElement?.textContent).toBe('Leave note as it is');
  });
});
