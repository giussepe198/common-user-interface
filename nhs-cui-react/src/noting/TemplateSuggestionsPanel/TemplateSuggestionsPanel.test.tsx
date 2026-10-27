import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TemplateSuggestionsPanel, type TemplateTrigger } from './TemplateSuggestionsPanel';

afterEach(cleanup);
const triggers: TemplateTrigger[] = [
  { id: 'dvt', term: 'Deep vein thrombosis', templates: [{ id: 'wells', title: "Wells' score", additional: true }] },
  { id: 'abg', term: 'Arterial blood gas', source: 'free text', templates: [] },
];

describe('TemplateSuggestionsPanel', () => {
  it('marks suggestions as optional and shows the latest trigger (Theme 5)', () => {
    render(<TemplateSuggestionsPanel triggers={triggers} onOpenTemplate={vi.fn()} />);
    expect(screen.getByText(/Optional: these are suggestions only/)).toBeTruthy();
    expect((screen.getByRole('combobox', { name: 'Suggestions for' }) as HTMLSelectElement).value).toBe('abg');
    expect(screen.getByText('No templates found for Arterial blood gas.')).toBeTruthy();
  });
  it('switches trigger term and opens a template', () => {
    const onOpen = vi.fn();
    render(<TemplateSuggestionsPanel triggers={triggers} onOpenTemplate={onOpen} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dvt' } });
    fireEvent.click(screen.getByRole('button', { name: /Wells' score/ }));
    expect(onOpen).toHaveBeenCalledWith(triggers[0].templates[0], triggers[0]);
  });
  it('lets the user switch off free-text triggering (Theme 6)', () => {
    const onToggle = vi.fn();
    render(<TemplateSuggestionsPanel triggers={[]} onOpenTemplate={vi.fn()} freeTextTriggering onFreeTextTriggeringChange={onToggle} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Suggest from words in free text' }));
    expect(onToggle).toHaveBeenCalledWith(false);
  });
});
