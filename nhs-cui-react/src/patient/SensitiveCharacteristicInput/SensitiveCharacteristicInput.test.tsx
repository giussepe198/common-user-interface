import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SensitiveCharacteristicInput } from './SensitiveCharacteristicInput';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('SensitiveCharacteristicInput (G12 7)', () => {
  it('renders nothing unless enabled', () => {
    const { container } = render(<SensitiveCharacteristicInput topic="sexual-orientation" region="AU" />);
    expect(container.innerHTML).toBe('');
  });
  it('AU sexual orientation: exact ABS wording, one answer, write-in for a different term', () => {
    const onChange = vi.fn();
    const { container } = render(<SensitiveCharacteristicInput enabled topic="sexual-orientation" region="AU" onChange={onChange} />);
    expect(container.querySelector('legend')?.textContent).toBe('How do you describe your sexual orientation?');
    expect(container.textContent).toContain('Sensitive');
    expect(container.querySelectorAll('input:checked')).toHaveLength(0);
    fireEvent.click(screen.getByLabelText('I use a different term (please specify)'));
    expect(onChange).toHaveBeenLastCalledWith({ code: '4' });
    fireEvent.change(screen.getByLabelText("The person's own words"), { target: { value: 'Queer' } });
    expect(onChange).toHaveBeenLastCalledWith({ code: '4', detail: 'Queer' });
    fireEvent.click(screen.getByLabelText('Bisexual'));
    expect(onChange).toHaveBeenLastCalledWith({ code: '3' });
    fireEvent.click(screen.getByRole('button', { name: 'Clear answer' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
  it('AU variations of sex characteristics: interviewer wording', () => {
    const { container } = render(<SensitiveCharacteristicInput enabled topic="variations-of-sex-characteristics" region="AU" administration="interviewer" />);
    expect(container.querySelector('legend')?.textContent).toBe("Were you born with a variation of sex characteristics, sometimes called 'intersex' or 'DSD'?");
  });
  it('NZ wording and codes from the provider', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ClinicalLocaleProvider region="NZ">
        <SensitiveCharacteristicInput enabled topic="variations-of-sex-characteristics" onChange={onChange} />
        <SensitiveCharacteristicInput enabled topic="sexual-orientation" />
      </ClinicalLocaleProvider>,
    );
    const legends = Array.from(container.querySelectorAll('legend')).map((l) => l.textContent);
    expect(legends).toEqual([
      'Were you born with a variation of sex characteristics (otherwise known as an intersex variation)?',
      'Which of the following options best describes how you think of yourself?',
    ]);
    fireEvent.click(screen.getAllByLabelText('Prefer not to say')[0]);
    expect(onChange).toHaveBeenLastCalledWith({ code: '5' });
  });
  it('GB has no value set and renders nothing', () => {
    const { container } = render(<SensitiveCharacteristicInput enabled topic="sexual-orientation" region="GB" />);
    expect(container.innerHTML).toBe('');
  });
});
