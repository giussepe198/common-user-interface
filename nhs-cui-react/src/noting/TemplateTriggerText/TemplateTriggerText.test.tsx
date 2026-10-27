import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { TemplateTriggerText, type TemplateTextTrigger } from './TemplateTriggerText';

afterEach(cleanup);

const TRIGGERS: TemplateTextTrigger[] = [
  { id: 'bp', term: 'Blood pressure', phrases: ['blood pressure', 'BP'], templates: [{ id: 'vitals', title: 'Vital signs' }, { id: 'abpm', title: 'Ambulatory BP monitoring', additional: true }] },
  { id: 'smoking', term: 'Smoking', templates: [{ id: 'smk', title: 'Smoking history' }] },
];
const TEXT = 'Blood pressure raised at 168/94. Smokes 10 a day.';

describe('TemplateTriggerText', () => {
  it('tags whole phrases (fuzzy endings) and reports them for the panel', () => {
    const onMatched = vi.fn();
    render(<TemplateTriggerText text={TEXT} triggers={TRIGGERS} onOpenTemplate={vi.fn()} onMatchedTriggersChange={onMatched} />);
    expect(screen.getByRole('button', { name: 'Blood pressure: 2 suggested templates' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Smokes: 1 suggested template' })).toBeTruthy();
    expect(onMatched).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'bp', source: 'free text' }),
      expect.objectContaining({ id: 'smoking', source: 'free text' }),
    ]);
    expect(screen.getByRole('group', { name: 'Note text' }).textContent).toBe(TEXT);
  });
  it('opens a floating drop-down on focus, moves in with Down, closes with Escape, and opens a template', () => {
    const onOpen = vi.fn();
    render(<TemplateTriggerText text={TEXT} triggers={TRIGGERS} onOpenTemplate={onOpen} />);
    const tag = screen.getByRole('button', { name: /Blood pressure/ });
    fireEvent.focus(tag);
    expect(tag.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('group', { name: 'Templates for Blood pressure' })).toBeTruthy();
    expect(screen.getByText('Optional templates for Blood pressure')).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Vital signs' }), { key: 'Escape' });
    expect(tag.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(tag);
    fireEvent.click(screen.getByRole('button', { name: /Ambulatory BP monitoring.*opens separately/ }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'abpm' }), expect.objectContaining({ id: 'bp' }), expect.objectContaining({ text: 'Blood pressure', start: 0 }));
  });
  it('can switch free-text triggering off (Theme 6)', () => {
    const onEnabled = vi.fn();
    render(<TemplateTriggerText text={TEXT} triggers={TRIGGERS} onOpenTemplate={vi.fn()} onEnabledChange={onEnabled} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Suggest templates from words in the text' }));
    expect(onEnabled).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('button', { name: /Blood pressure/ })).toBeNull();
    expect(screen.getByText('Template suggestions from free text are off.')).toBeTruthy();
  });
});
