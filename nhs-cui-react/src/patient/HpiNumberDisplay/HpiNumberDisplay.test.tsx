import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HpiNumberDisplay } from './HpiNumberDisplay';
import { ClinicalLocaleProvider } from '../../core';

afterEach(cleanup);

describe('HpiNumberDisplay', () => {
  it('AU HPI-I and HPI-O inferred from the prefix (G10 1.2)', () => {
    const { container, rerender } = render(<HpiNumberDisplay region="AU" value="8003611234567893" />);
    expect(container.textContent).toBe('HPI-I 8003 6112 3456 7893');
    rerender(<HpiNumberDisplay region="AU" value="8003621234567892" />);
    expect(container.textContent).toBe('HPI-O 8003 6212 3456 7892');
  });
  it('AU invalid Luhn flagged', () => {
    const { container } = render(<HpiNumberDisplay region="AU" type="hpi-i" value="8003611234567894" />);
    expect(container.textContent).toContain('not a valid HPI-I');
  });
  it('NZ format only, hyphen kept (G11 1.5)', () => {
    const { container, rerender } = render(
      <ClinicalLocaleProvider region="NZ">
        <HpiNumberDisplay value="fzz999-c" />
      </ClinicalLocaleProvider>,
    );
    expect(container.textContent).toBe('HPI facility FZZ999-C');
    rerender(<HpiNumberDisplay region="NZ" type="cpn" value="99ZZZ" label="" />);
    expect(container.textContent).toBe('99ZZZ not a valid HPI CPN');
  });
});
