import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SensitiveCharacteristicDisplay } from './SensitiveCharacteristicDisplay';

afterEach(cleanup);

describe('SensitiveCharacteristicDisplay (G12 7)', () => {
  it('renders nothing unless enabled', () => {
    const { container } = render(<SensitiveCharacteristicDisplay topic="sexual-orientation" region="AU" value={{ code: '2' }} />);
    expect(container.innerHTML).toBe('');
  });
  it('marked sensitive and hidden until shown', () => {
    const { container } = render(<SensitiveCharacteristicDisplay enabled topic="sexual-orientation" region="AU" value={{ code: 'T', detail: 'Queer' }} />);
    expect(container.textContent).toContain('Sensitive');
    expect(container.textContent).toContain('Recorded, hidden');
    const b = screen.getByRole('button', { name: 'Show' });
    fireEvent.click(b);
    expect(container.textContent).toContain('Different term: Queer');
    expect(screen.getByRole('button', { name: 'Hide' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('NZ label and supplementary codes; not recorded', () => {
    const { container, rerender } = render(
      <SensitiveCharacteristicDisplay enabled concealed={false} topic="sexual-orientation" region="NZ" value={{ code: '99' }} />,
    );
    expect(container.textContent).toContain('Sexual identity');
    expect(container.textContent).toContain('Not stated');
    rerender(<SensitiveCharacteristicDisplay enabled topic="variations-of-sex-characteristics" region="NZ" value={null} />);
    expect(container.textContent).toContain('Not recorded');
  });
});
