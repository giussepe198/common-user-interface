import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Fieldset } from './Fieldset';

afterEach(cleanup);

describe('Fieldset', () => {
  it('names the section with its legend and describes it', () => {
    render(<Fieldset legend="Contact details" description="How the service reaches the person."><input aria-label="x" /></Fieldset>);
    const group = screen.getByRole('group', { name: 'Contact details' });
    expect(group.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(group.getAttribute('aria-describedby')!)!.textContent).toContain('How the service');
  });
  it('can hide the legend visually and disable every control inside', () => {
    render(<Fieldset legend="Hidden" hideLegend disabled><input aria-label="x" /></Fieldset>);
    expect(screen.getByText('Hidden').className).toContain('cui-visually-hidden');
    expect((screen.getByRole('group') as HTMLFieldSetElement).disabled).toBe(true);
  });
});
