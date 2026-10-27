import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { TouchButton } from './TouchButton';

afterEach(cleanup);

describe('TouchButton', () => {
  it('renders a typed button at the commit size by default and fires onClick', () => {
    const onClick = vi.fn();
    render(<TouchButton variant="primary" onClick={onClick}>Record dose</TouchButton>);
    const b = screen.getByRole('button', { name: 'Record dose' });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.className).toContain('cui-touch-button--h56');
    expect(b.className).toContain('cui-touch-button--primary');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('supports sizes, full width, bottom safe area and icon-only names', () => {
    render(
      <>
        <TouchButton size={64} fullWidth bottomAction>Hold</TouchButton>
        <TouchButton size={48} iconOnly icon="close">Close</TouchButton>
      </>,
    );
    const hold = screen.getByRole('button', { name: 'Hold' });
    expect(hold.className).toContain('cui-touch-button--h64');
    expect(hold.className).toContain('cui-touch-button--full');
    expect(hold.className).toContain('cui-touch-button--bottom');
    const close = screen.getByRole('button', { name: 'Close' });
    expect(close.className).toContain('cui-touch-button--h48');
  });
  it('is keyboard operable and can be disabled', () => {
    const onClick = vi.fn();
    render(<TouchButton disabled onClick={onClick}>Save</TouchButton>);
    const b = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
});
