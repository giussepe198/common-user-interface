import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RequiredFieldIndicator, RequiredKey } from './RequiredFieldIndicator';

afterEach(cleanup);

describe('RequiredFieldIndicator and RequiredKey', () => {
  it('shows a hidden-from-AT asterisk with text for screen readers (CNA-1080)', () => {
    const { container } = render(<label>Pulse<RequiredFieldIndicator /></label>);
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('*');
    expect(screen.getByText('(required)', { exact: false })).toBeTruthy();
  });
  it('renders the key on the same page (CNA-1100)', () => {
    render(<RequiredKey />);
    expect(screen.getByText('Required field')).toBeTruthy();
  });
});
