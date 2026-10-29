import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Panel } from './Panel';

afterEach(cleanup);

describe('Panel', () => {
  it('is a section named by its heading, with actions and footer', () => {
    render(<Panel title="Alerts" headingLevel={3} actions={<button type="button">Add alert</button>} footer={<a href="#all">Show all</a>}>Body</Panel>);
    expect(screen.getByRole('region', { name: 'Alerts' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Alerts' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Show all' })).toBeTruthy();
  });

  it('collapses with its heading button and shows the count only while collapsed when asked', () => {
    const onChange = vi.fn();
    render(<Panel title="Contacts" collapsible count={3} countLabel="3 contacts" countWhenCollapsed onCollapsedChange={onChange}>Body text</Panel>);
    const toggle = screen.getByRole('button', { name: 'Contacts' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Body text')).toBeTruthy();
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    const collapsed = screen.getByRole('button', { name: /Contacts.*3 contacts/ });
    expect(collapsed.getAttribute('aria-expanded')).toBe('false');
    expect((document.getElementById(collapsed.getAttribute('aria-controls') as string) as HTMLElement).hidden).toBe(true);
  });
  it('takes the section appearance for form sections and overview cards', () => {
    const { container } = render(<Panel title="Name" appearance="section">Fields</Panel>);
    expect(container.querySelector('section')?.classList.contains('cui-panel--section')).toBe(true);
    expect(screen.getByRole('region', { name: 'Name' })).toBeTruthy();
  });
});
