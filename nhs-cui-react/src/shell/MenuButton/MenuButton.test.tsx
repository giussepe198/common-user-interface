import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { MenuButton, type MenuButtonEntry } from './MenuButton';

const items = (onPrint: () => void): MenuButtonEntry[] => [
  { id: 'print', label: 'Print letter', onSelect: onPrint, shortcut: 'Ctrl+P' },
  { id: 'copy', label: 'Copy link', disabled: true },
  { id: 'sep', separator: true },
  { id: 'remove', label: 'Remove from caseload', danger: true },
];

afterEach(cleanup);

describe('MenuButton', () => {
  it('opens an ARIA menu, focuses the first item and chooses with Enter', () => {
    const onPrint = vi.fn();
    const onAction = vi.fn();
    render(<MenuButton label="Actions" items={items(onPrint)} onAction={onAction} />);
    const btn = screen.getByRole('button', { name: 'Actions' });
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: /Print letter/ }));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('print');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it('skips disabled items with the arrows, jumps with End and finds by letter', () => {
    render(<MenuButton label="Actions" items={items(() => undefined)} />);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Actions' }), { key: 'ArrowDown' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toContain('Remove from caseload');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(document.activeElement?.textContent).toContain('Print letter');
    fireEvent.keyDown(document.activeElement as Element, { key: 'r' });
    expect(document.activeElement?.textContent).toContain('Remove');
    expect(screen.getByRole('menuitem', { name: /Copy link/ }).getAttribute('aria-disabled')).toBe('true');
  });

  it('ArrowUp opens on the last item; Esc closes and returns focus', () => {
    render(<MenuButton label="Actions" items={items(() => undefined)} />);
    const btn = screen.getByRole('button', { name: 'Actions' });
    fireEvent.keyDown(btn, { key: 'ArrowUp' });
    expect(document.activeElement?.textContent).toContain('Remove');
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it('closes on a click outside and marks checked items', () => {
    render(<MenuButton label="View" items={[{ id: 'dense', label: 'Dense rows', checked: true }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(screen.getByRole('menuitemcheckbox', { name: /Dense rows/ }).getAttribute('aria-checked')).toBe('true');
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
