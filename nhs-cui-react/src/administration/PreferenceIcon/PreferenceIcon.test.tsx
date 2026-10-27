import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreferenceIcon } from './PreferenceIcon';

afterEach(cleanup);

describe('PreferenceIcon', () => {
  it('five distinct levels with text alternatives (2.3)', () => {
    const { container } = render(
      <>
        {([1, 2, 3, 4, 5] as const).map(l => (
          <PreferenceIcon key={l} level={l} />
        ))}
      </>,
    );
    expect(screen.getAllByRole('img').map(i => i.getAttribute('aria-label'))).toEqual([
      'Lowest preference option',
      'Low preference option',
      'Medium preference option',
      'High preference option',
      'Highest preference option',
    ]);
    const on = Array.from(container.querySelectorAll('.cui-ds-pref')).map(e => e.querySelectorAll('.cui-ds-pref__bar--on').length);
    expect(on).toEqual([1, 2, 3, 4, 5]);
  });

  it('is focusable and describes one reason, or several as a bulleted list', () => {
    const { rerender } = render(<PreferenceIcon level={2} reasons={['Potential drug-drug interaction with Furosemide']} />);
    const img = screen.getByRole('img');
    expect(img.tabIndex).toBe(0);
    expect(document.getElementById(img.getAttribute('aria-describedby')!)!.textContent).toContain('Furosemide');
    rerender(<PreferenceIcon level={2} reasons={['A', 'B']} />);
    expect(screen.getByRole('tooltip').querySelectorAll('li').length).toBe(2);
  });

  it('is a button when clickable', () => {
    const onClick = vi.fn();
    render(<PreferenceIcon level={4} onClick={onClick} optionLabel="Atenolol" expanded={false} />);
    const b = screen.getByRole('button', { name: 'High preference option for Atenolol. Show explanation' });
    expect(b.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalled();
  });
});
