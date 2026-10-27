import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { KeyboardShortcutList } from './KeyboardShortcutList';
import { ShortcutProvider } from '../ShortcutProvider/ShortcutProvider';

afterEach(cleanup);

describe('KeyboardShortcutList', () => {
  it('lists shortcuts grouped by context with keys as kbd', () => {
    const { container } = render(
      <KeyboardShortcutList shortcuts={[{ keys: 'ctrl+shift+p', action: 'Print chart', context: 'general' }, { keys: 'Alt+F9', action: 'Prescribe controlled drug', clinicallySignificant: true }]} />,
    );
    expect(screen.getByRole('table', { name: 'Keyboard shortcuts' })).toBeTruthy();
    expect([...container.querySelectorAll('kbd')].slice(0, 3).map(k => k.textContent)).toEqual(['Ctrl', 'Shift', 'P']);
    expect(screen.getByText('General')).toBeTruthy();
    expect(screen.getByText('Clinically significant.')).toBeTruthy();
  });
  it('flags conflicts with icon and text, not colour alone', () => {
    render(<KeyboardShortcutList shortcuts={[{ keys: 'Ctrl+P', action: 'Prescribe' }, { keys: 'Ctrl+P', action: 'Print' }]} />);
    expect(screen.getAllByText(/^Conflict: Ctrl\+P is used for both Prescribe and Print\./).length).toBeGreaterThan(0);
  });
  it('reads shortcuts from the provider and shows an empty state', () => {
    render(<ShortcutProvider checkStandard={false} shortcuts={[{ keys: 'F5', action: 'Refresh' }]}><KeyboardShortcutList /></ShortcutProvider>);
    expect(screen.getByText('Refresh')).toBeTruthy();
    cleanup();
    render(<KeyboardShortcutList shortcuts={[]} />);
    expect(screen.getByText('No shortcuts are defined.')).toBeTruthy();
  });
  it('adds the standard Windows shortcuts on request', () => {
    render(<KeyboardShortcutList shortcuts={[]} showStandard />);
    expect(screen.getByText('Quit application')).toBeTruthy();
  });
});
