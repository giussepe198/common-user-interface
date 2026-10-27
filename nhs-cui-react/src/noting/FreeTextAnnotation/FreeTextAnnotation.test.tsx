import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { FreeTextAnnotation } from './FreeTextAnnotation';

afterEach(cleanup);

const control = <label><input type="radio" name="s" defaultChecked /> Ex-smoker</label>;

describe('FreeTextAnnotation', () => {
  it('reveals the add-text control on focus and opens a two-line field (CNA-1710, CNA-1760)', () => {
    const onChange = vi.fn();
    render(<FreeTextAnnotation onChange={onChange} label="Smoking details">{control}</FreeTextAnnotation>);
    expect(screen.queryByRole('button', { name: 'Add text' })).toBeNull();
    fireEvent.focus(screen.getByRole('radio'));
    fireEvent.click(screen.getByRole('button', { name: 'Add text' }));
    const field = screen.getByRole('textbox', { name: 'Smoking details' }) as HTMLTextAreaElement;
    expect(field.rows).toBe(2);
    fireEvent.change(field, { target: { value: 'Stopped 2019' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onChange).toHaveBeenCalledWith('Stopped 2019');
  });
  it('shows entered text beside the control and reopens it on click (CNA-1790, CNA-1840)', () => {
    render(<FreeTextAnnotation defaultValue="Stopped 2019" label="Details">{control}</FreeTextAnnotation>);
    const text = screen.getByRole('button', { name: 'Details: Stopped 2019. Edit text' });
    fireEvent.click(text);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Stopped 2019');
  });
  it('does not offer the field before a selection (CNA-1720)', () => {
    render(<FreeTextAnnotation hasSelection={false}>{control}</FreeTextAnnotation>);
    fireEvent.focus(screen.getByRole('radio'));
    expect(screen.queryByRole('button', { name: 'Add text' })).toBeNull();
  });
  it('always shows the field when text is required or contingent (CNA-1860/1870)', () => {
    render(<FreeTextAnnotation revealWhen label="Please specify">{control}</FreeTextAnnotation>);
    expect(screen.getByRole('textbox', { name: 'Please specify' })).toBeTruthy();
  });
  it('asks before deleting text when the selection is cleared', () => {
    const onChange = vi.fn();
    const { rerender } = render(<FreeTextAnnotation defaultValue="Note" onChange={onChange}>{control}</FreeTextAnnotation>);
    rerender(<FreeTextAnnotation defaultValue="Note" onChange={onChange} hasSelection={false}>{control}</FreeTextAnnotation>);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.textContent).toContain('Delete the added text too?');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete text' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
  it('Escape closes the editor and keeps the text', () => {
    render(<FreeTextAnnotation defaultValue="Keep me">{control}</FreeTextAnnotation>);
    fireEvent.click(screen.getByRole('button', { name: /Keep me/ }));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.getByRole('button', { name: /Keep me/ })).toBeTruthy();
  });
});
