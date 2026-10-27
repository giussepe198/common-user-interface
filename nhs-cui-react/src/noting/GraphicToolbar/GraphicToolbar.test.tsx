import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { GraphicToolbar } from './GraphicToolbar';
import { DEFAULT_GRAPHIC_SYMBOLS } from '../AnnotatedGraphicCanvas/AnnotatedGraphicCanvas';

afterEach(cleanup);
const props = { symbols: DEFAULT_GRAPHIC_SYMBOLS, canUndo: false, canRedo: false, onUndo: vi.fn(), onRedo: vi.fn(), onRemoveAll: vi.fn(), canRemoveAll: true };

describe('GraphicToolbar', () => {
  it('groups tools and gives each a text label and tooltip (NwG-0075/0076)', () => {
    render(<GraphicToolbar tool="select" onToolChange={vi.fn()} {...props} />);
    for (const g of ['Select', 'Symbols', 'Draw', 'Text', 'Edit']) expect(screen.getByRole('group', { name: g })).toBeTruthy();
    const pen = screen.getByRole('button', { name: 'Pen' });
    expect(pen.getAttribute('title')).toBe('Draw free-hand');
    expect(screen.getByRole('button', { name: 'Select' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('changes tool and disables undo when nothing to undo (NwG-0067)', () => {
    const onTool = vi.fn();
    render(<GraphicToolbar tool="select" onToolChange={onTool} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Exact location (X)' }));
    expect(onTool).toHaveBeenCalledWith('symbol:x');
    expect((screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('is one tab stop with arrow-key movement', () => {
    render(<GraphicToolbar tool="select" onToolChange={vi.fn()} {...props} />);
    const tabbable = screen.getAllByRole('button').filter((b) => b.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    tabbable[0].focus();
    fireEvent.keyDown(tabbable[0], { key: 'ArrowRight' });
    expect(document.activeElement?.textContent).toBe('Exact location (X)');
  });
});
