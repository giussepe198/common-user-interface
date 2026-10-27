import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TemplateSearch } from './TemplateSearch';
import type { TemplateDefinition } from '../utils/templates';

afterEach(cleanup);
const T: TemplateDefinition[] = [
  { id: 'pmh', title: 'Past medical history', abbreviations: ['PMH'], generic: true, metadata: [{ label: 'Version', value: '2.1' }, { label: 'Last used', value: '12-Oct-2026' }] },
  { id: 'chest', title: 'Chest pain assessment', contexts: ['Cardiology'], suggested: true, sections: [{ id: 's1', title: 'Pain history' }] },
  { id: 'wells', title: "Wells' score for DVT", contexts: ['Acute medicine'], additional: true },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `x${i}`, title: `Assessment form ${i + 1}`, generic: true })),
];

function type(v: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Find a template' }), { target: { value: v } });
}

describe('TemplateSearch', () => {
  it('puts abbreviation matches first and shows metadata on focus (Themes 1, 4)', () => {
    render(<TemplateSearch templates={T} onSelect={vi.fn()} />);
    type('pmh');
    const title = screen.getByRole('button', { name: /Past medical history/ });
    expect(title.textContent).toContain('(abbreviation)');
    const fly = document.getElementById(title.getAttribute('aria-describedby')!)!;
    expect(fly.hidden).toBe(true);
    fireEvent.focus(title);
    expect(fly.hidden).toBe(false);
    expect(fly.textContent).toContain('Version');
  });
  it('shows the context filter, keeps generic templates and can be switched off (Theme 1)', () => {
    render(<TemplateSearch templates={T} onSelect={vi.fn()} context="Cardiology" />);
    type('wells');
    expect(screen.getByText('No matching templates')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: /Filter: Cardiology/ }));
    expect(screen.getByRole('button', { name: /Wells' score/ })).toBeTruthy();
    expect(screen.getByText('Opens separately')).toBeTruthy();
  });
  it('limits results with "Show more" and marks suggested templates', () => {
    render(<TemplateSearch templates={T} onSelect={vi.fn()} maxResults={5} />);
    type('assess');
    fireEvent.click(screen.getByRole('button', { name: /Show \d+ more/ }));
    expect(screen.getAllByRole('button', { name: /Assess ?ment form/ }).length).toBe(12);
    expect(screen.getByText('Suggested')).toBeTruthy();
  });
  it('expands a template structure but selects only the whole template', () => {
    const onSelect = vi.fn();
    render(<TemplateSearch templates={T} onSelect={onSelect} />);
    type('chest');
    fireEvent.click(screen.getByRole('button', { name: 'Show sections of Chest pain assessment' }));
    expect(screen.getByText('Pain history')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Chest pain assessment/ }));
    expect(onSelect).toHaveBeenCalledWith(T[1]);
  });
});
