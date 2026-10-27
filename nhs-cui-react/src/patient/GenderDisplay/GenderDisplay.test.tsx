import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { GenderDisplay } from './GenderDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);
const txt = (el: Element) => {
  const c = el.cloneNode(true) as Element;
  c.querySelectorAll('[role="tooltip"]').forEach((t) => t.remove());
  return c.textContent;
};

describe('GenderDisplay', () => {
  it('GB: full words with label "Current Gender" (CGS-0005, CGS-0007)', () => {
    const { container } = render(<GenderDisplay value="Female" />);
    expect(txt(container)).toBe('Current Gender Female');
  });
  it('GB: codes are never shown (CGS-0006)', () => {
    const { container } = render(<GenderDisplay value="M" />);
    expect(txt(container)).toBe('Current Gender Not Known');
  });
  it('GB sex label (CGS-0016)', () => {
    const { container } = render(<GenderDisplay kind="sex" value="Indeterminate" />);
    expect(txt(container)).toBe('Sex Indeterminate');
  });
  it('AU: METeOR code or letter shown as the ABS label (AU-SG-01)', () => {
    const { container, rerender } = render(<GenderDisplay region="AU" value="3" />);
    expect(txt(container)).toBe('Gender Non-binary');
    rerender(<GenderDisplay region="AU" value="t" detail="genderqueer" />);
    expect(txt(container)).toBe('Gender Different term (genderqueer)');
    rerender(<GenderDisplay region="AU" kind="sex" value="1" />);
    expect(txt(container)).toBe('Sex recorded at birth Male');
  });
  it('NZ: HISO codes with te reo labels when enabled', () => {
    const { container, rerender } = render(
      <ClinicalLocaleProvider region="NZ" teReoLabels>
        <GenderDisplay value="M" />
      </ClinicalLocaleProvider>,
    );
    expect(txt(container)).toBe('Gender Male / Tāne');
    expect(container.querySelector('[lang="mi"]')?.textContent).toBe('Tāne');
    rerender(<GenderDisplay region="NZ" value="O" detail="non-binary" />);
    expect(txt(container)).toBe('Gender Another gender (non-binary)');
    rerender(<GenderDisplay region="NZ" value="X" />);
    expect(txt(container)).toBe('Gender Not Known');
  });
});
