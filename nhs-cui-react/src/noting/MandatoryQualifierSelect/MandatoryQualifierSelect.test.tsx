import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MandatoryQualifierSelect } from './MandatoryQualifierSelect';

afterEach(cleanup);
const opts = [{ value: 'L', label: 'Left' }, { value: 'R', label: 'Right' }, { value: 'B', label: 'Both' }];

describe('MandatoryQualifierSelect', () => {
  it('starts on "Please specify" with no default value and explains why (Elaboration 2.2.3)', () => {
    const { container } = render(<MandatoryQualifierSelect label="Laterality" options={opts} conceptName="Fracture of radius" />);
    const select = screen.getByRole('combobox', { name: /Laterality/ }) as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.options[0].text).toBe('Please specify');
    expect(select.getAttribute('aria-required')).toBe('true');
    expect(screen.getByText("You must select from this list to be able to encode 'Fracture of radius'.")).toBeTruthy();
    expect(container.querySelector('.cui-mandatory-qualifier--unresolved')).toBeTruthy();
  });
  it('clears the warning once a value is chosen', () => {
    const onChange = vi.fn();
    const { container } = render(<MandatoryQualifierSelect label="Laterality" options={opts} conceptName="X" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'R' } });
    expect(onChange).toHaveBeenCalledWith('R');
    expect(container.querySelector('.cui-mandatory-qualifier--unresolved')).toBeNull();
  });
  it('is locked after confirmation with the term', () => {
    render(<MandatoryQualifierSelect label="Laterality" options={opts} conceptName="X" value="L" locked />);
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(true);
  });
});
