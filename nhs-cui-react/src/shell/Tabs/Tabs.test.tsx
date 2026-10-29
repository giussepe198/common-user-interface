import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { Tabs, countTabsThatFit, type TabsItem } from './Tabs';

const items: TabsItem[] = [
  { id: 'summary', label: 'Summary', content: <p>Summary panel</p> },
  { id: 'notes', label: 'Notes', content: <p>Notes panel</p>, count: 3, countLabel: '3 drafts' },
  { id: 'legal', label: 'Legal status', content: <p>Legal panel</p> },
  { id: 'contacts', label: 'Contacts', content: <p>Contacts panel</p>, disabled: true },
  { id: 'documents', label: 'Documents', content: <p>Documents panel</p> },
];

afterEach(cleanup);

describe('Tabs', () => {
  it('renders an ARIA tab list with one tab stop and a labelled panel', () => {
    render(<Tabs label="Record sections" items={items} />);
    expect(screen.getByRole('tablist', { name: 'Record sections' })).toBeTruthy();
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
    expect(tabs.filter(t => t.tabIndex === 0)).toHaveLength(1);
    expect(screen.getByRole('tabpanel', { name: 'Summary' }).textContent).toBe('Summary panel');
    expect(screen.getByRole('tab', { name: /Notes.*3 drafts/ })).toBeTruthy();
  });

  it('moves and selects with the arrow keys, skipping disabled tabs, with Home and End', () => {
    const onChange = vi.fn();
    render(<Tabs label="Record sections" items={items} onChange={onChange} />);
    const first = screen.getByRole('tab', { name: 'Summary' });
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('documents');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Documents' }));
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith('summary');
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('documents');
  });

  it('manual activation selects only on Enter', () => {
    const onChange = vi.fn();
    render(<Tabs label="S" items={items} activation="manual" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Summary' }), { key: 'ArrowRight' });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('notes');
  });

  it('puts tabs that do not fit into a More menu and keeps the selected tab in the bar', () => {
    render(<Tabs label="S" items={items} maxVisible={2} defaultValue="legal" />);
    const tabs = screen.getAllByRole('tab').map(t => t.textContent);
    expect(tabs).toEqual(['Summary', 'Legal status']);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Documents' }));
    expect(screen.getByRole('tab', { name: 'Documents' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Documents panel');
  });

  it('moves tabs into More while the tabs shown are still cut off', () => {
    const sw = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('cui-tabs__list') ? this.querySelectorAll('[role="tab"]').length * 100 : 0;
    });
    const cw = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('cui-tabs__list') ? 250 : 0;
    });
    render(<Tabs label="S" items={items} />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy();
    sw.mockRestore();
    cw.mockRestore();
  });
  it('countTabsThatFit leaves room for the More button', () => {
    expect(countTabsThatFit([80, 80, 80], 60, 300)).toBe(3);
    expect(countTabsThatFit([80, 80, 80], 60, 230)).toBe(2);
    expect(countTabsThatFit([200, 80], 60, 100)).toBe(1);
    expect(countTabsThatFit([0, 0], 0, 0)).toBe(2);
  });

  describe('link tabs', () => {
    const links: TabsItem[] = [
      { id: 'overview', label: 'Overview', href: '/people/p1' },
      { id: 'contacts', label: 'Contacts', href: '/people/p1/contacts' },
      { id: 'plans', label: 'Plans', href: '/people/p1/plans' },
    ];

    it('renders page navigation: a nav of links, the current page marked, one tab stop', () => {
      render(<Tabs label="Record sections" items={links} value="contacts" />);
      const nav = screen.getByRole('navigation', { name: 'Record sections' });
      expect(screen.queryByRole('tablist')).toBeNull();
      const a = Array.from(nav.querySelectorAll('a'));
      expect(a.map(l => l.getAttribute('href'))).toEqual(['/people/p1', '/people/p1/contacts', '/people/p1/plans']);
      expect(screen.getByRole('link', { name: 'Contacts' }).getAttribute('aria-current')).toBe('page');
      expect(a.filter(l => l.tabIndex === 0).map(l => l.textContent)).toEqual(['Contacts']);
    });

    it('moves focus with the arrow keys, Home and End, without following the link', () => {
      const onNavigate = vi.fn();
      render(<Tabs label="Record sections" items={links} value="overview" onNavigate={onNavigate} />);
      const overview = screen.getByRole('link', { name: 'Overview' });
      overview.focus();
      fireEvent.keyDown(overview, { key: 'ArrowRight' });
      expect(document.activeElement?.textContent).toBe('Contacts');
      expect((document.activeElement as HTMLElement).tabIndex).toBe(0);
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' });
      expect(document.activeElement?.textContent).toBe('Plans');
      fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
      expect(document.activeElement?.textContent).toBe('Overview');
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it('reports a chosen link so the app can route on the client', () => {
      const onNavigate = vi.fn((_id: string, e: React.SyntheticEvent) => e.preventDefault());
      render(<Tabs label="Record sections" items={links} value="overview" onNavigate={onNavigate} />);
      fireEvent.click(screen.getByRole('link', { name: 'Plans' }));
      expect(onNavigate).toHaveBeenCalledWith('plans', expect.anything());
    });

    it('puts what does not fit in More as links, keeping the current page in the bar', () => {
      const onNavigate = vi.fn((_id: string, e: React.SyntheticEvent) => e.preventDefault());
      render(<Tabs label="Record sections" items={links} value="plans" maxVisible={2} onNavigate={onNavigate} />);
      const nav = screen.getByRole('navigation', { name: 'Record sections' });
      expect(Array.from(nav.querySelectorAll('.cui-tabs__list a')).map(l => l.textContent)).toEqual(['Overview', 'Plans']);
      fireEvent.click(screen.getByRole('button', { name: 'More' }));
      const item = screen.getByRole('menuitem', { name: 'Contacts' });
      expect(item.getAttribute('href')).toBe('/people/p1/contacts');
      fireEvent.click(item);
      expect(onNavigate).toHaveBeenCalledWith('contacts', expect.anything());
    });
  });
});
