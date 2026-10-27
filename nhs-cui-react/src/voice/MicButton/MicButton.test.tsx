import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MicButton } from './MicButton';

afterEach(cleanup);

describe('MicButton', () => {
  it('is a 72 px button named by its action, pressed while listening', () => {
    const { rerender, container } = render(<MicButton status="idle" />);
    const b = screen.getByRole('button', { name: 'Start listening' });
    expect(b.getAttribute('aria-pressed')).toBe('false');
    expect(container.querySelector('.cui-mic-button--72')).toBeTruthy();
    rerender(<MicButton status="listening" />);
    const s = screen.getByRole('button', { name: 'Stop listening' });
    expect(s.getAttribute('aria-pressed')).toBe('true');
    expect(s.textContent).toContain('STOP');
  });
  it('works by click and by keyboard (native button)', () => {
    const onPress = vi.fn();
    render(<MicButton status="idle" onPress={onPress} />);
    const b = screen.getByRole('button');
    b.focus();
    expect(document.activeElement).toBe(b);
    fireEvent.click(b);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(b.tagName).toBe('BUTTON');
    expect(b.getAttribute('type')).toBe('button');
  });
  it('announces state changes politely', () => {
    const { rerender } = render(<MicButton status="idle" />);
    const live = screen.getByRole('status');
    expect(live.getAttribute('aria-live')).toBe('polite');
    expect(live.textContent).toBe('');
    rerender(<MicButton status="listening" />);
    expect(live.textContent).toBe('Listening');
    rerender(<MicButton status="processing" />);
    expect(live.textContent).toBe('Processing what was heard');
    expect(screen.getByRole('button', { name: 'Processing' }).hasAttribute('disabled')).toBe(true);
  });
  it('shows and describes error and unavailable states', () => {
    const onPress = vi.fn();
    const { rerender } = render(<MicButton status="error" errorMessage="Nothing was heard." onPress={onPress} />);
    const b = screen.getByRole('button', { name: 'Try listening again' });
    expect(document.getElementById(b.getAttribute('aria-describedby') as string)?.textContent).toBe('Nothing was heard.');
    fireEvent.click(b);
    expect(onPress).toHaveBeenCalled();
    rerender(<MicButton status="unavailable" onPress={onPress} />);
    const u = screen.getByRole('button', { name: 'Start listening' });
    expect(u.hasAttribute('disabled')).toBe(true);
    expect(document.getElementById(u.getAttribute('aria-describedby') as string)?.textContent).toContain('not available');
  });
  it('has a 56 px size for secondary use', () => {
    const { container } = render(<MicButton status="idle" size={56} startLabel="Dictate more" />);
    expect(container.querySelector('.cui-mic-button--56')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dictate more' })).toBeTruthy();
  });
});
