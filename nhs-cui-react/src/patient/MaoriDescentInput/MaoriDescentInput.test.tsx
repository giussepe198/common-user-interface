import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MaoriDescentInput } from './MaoriDescentInput';

afterEach(cleanup);

describe('MaoriDescentInput', () => {
  it('exact question with te reo line, options Yes, Don’t know, No, nothing selected (HISO 10094)', () => {
    const { container } = render(<MaoriDescentInput />);
    const legend = container.querySelector('legend') as HTMLElement;
    expect(legend.textContent).toContain('Are you descended from Māori (that is, did you have a Māori birth parent, grandparent or great-grandparent, etc)?');
    expect(legend.querySelector('[lang="mi"]')?.textContent).toBe('He tūpuna Māori ōu?');
    expect(Array.from(container.querySelectorAll('label')).map((l) => l.textContent)).toEqual(['Yes', "Don't know", 'No']);
    expect(container.querySelectorAll('input:checked')).toHaveLength(0);
  });
  it('reports the answer and routes to the iwi question after Yes', () => {
    const onChange = vi.fn();
    render(<MaoriDescentInput onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Yes'));
    expect(onChange).toHaveBeenCalledWith('yes');
    expect(screen.getByRole('status').textContent).toMatch(/iwi question/);
    fireEvent.click(screen.getByLabelText('No'));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
