import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { FullScreenSheet } from './FullScreenSheet';

afterEach(cleanup);

describe('FullScreenSheet', () => {
  it('has a heading, a Cancel button and no backdrop', () => {
    const onClose = vi.fn();
    render(
      <FullScreenSheet open title="When did the fall happen?" onClose={onClose} closeOnBrowserBack={false} headingLevel={1}>
        <input aria-label="Date" />
      </FullScreenSheet>,
    );
    expect(screen.getByRole('dialog', { name: 'When did the fall happen?' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1, name: 'When did the fall happen?' })).toBeTruthy();
    expect(document.querySelector('.cui-sheet-backdrop')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Date' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledWith('closeButton');
  });
  it('offers a back-style close and blocks the back button with unsaved data', () => {
    const onClose = vi.fn();
    const blocked = vi.fn();
    render(
      <FullScreenSheet open title="Details" closeStyle="back" closeLabel="Back" onClose={onClose} hasUnsavedData onCloseBlocked={blocked}>
        <p>Body</p>
      </FullScreenSheet>,
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    fireEvent(window, new PopStateEvent('popstate'));
    expect(onClose).not.toHaveBeenCalled();
    expect(blocked).toHaveBeenCalledWith('back');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith('escape');
  });
});
