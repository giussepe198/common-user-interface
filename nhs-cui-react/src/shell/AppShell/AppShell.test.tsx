import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { AppShell } from './AppShell';
import type { SideNavGroup } from '../SideNav/SideNav';

afterEach(cleanup);

const groups: SideNavGroup[] = [{ id: 'work', label: 'Work', items: [{ id: 'caseload', label: 'Caseload', href: '#caseload', icon: 'user' }, { id: 'diary', label: 'Diary', href: '#diary', icon: 'calendar' }] }];

describe('AppShell', () => {
  it('puts the skip link first, then the environment banner, top bar, navigation and main', () => {
    render(
      <AppShell navigation={{ groups, current: 'caseload' }} brand="Riverside" environmentBanner="Demo: synthetic data only" patientBanner={<div>CHEN, Wei</div>}>
        <p>Page</p>
      </AppShell>,
    );
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip.getAttribute('href')).toBe('#main');
    expect(document.querySelector('.cui-app-shell')?.firstElementChild).toBe(skip);
    expect(screen.getByText('Demo: synthetic data only').closest('.cui-app-shell__env')?.textContent).toBe('Environment: Demo: synthetic data only');
    expect(screen.getByRole('main').id).toBe('main');
    expect(screen.getByRole('main').textContent).toBe('Page');
    expect(screen.getByText('CHEN, Wei').closest('.cui-app-shell__patient')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
  });

  it('collapses the side navigation to an icon rail and back', () => {
    const onChange = vi.fn();
    render(<AppShell navigation={{ groups }} onNavCollapsedChange={onChange}>x</AppShell>);
    const toggle = screen.getByRole('button', { name: 'Collapse navigation' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(document.querySelector('.cui-app-shell--nav-collapsed')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Expand navigation' }).getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the navigation in a drawer and closes it when a destination is chosen', async () => {
    const onSelect = vi.fn();
    render(<AppShell navigation={{ groups, onSelect }}>x</AppShell>);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog', { name: 'Menu' });
    expect(drawer.className).toContain('cui-drawer--start');
    const links = screen.getAllByRole('link', { name: 'Diary' });
    fireEvent.click(links[links.length - 1]);
    expect(onSelect).toHaveBeenCalledWith('diary', expect.anything());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('adds the phone tab bar and the compact banner for narrow widths', () => {
    render(
      <AppShell mobileTabs={{ items: [{ id: 'a', label: 'Worklist' }, { id: 'b', label: 'Patients' }], current: 'a', label: 'Phone' }} patientBanner={<div>Full</div>} patientBannerCompact={<div>Compact</div>}>
        x
      </AppShell>,
    );
    expect(screen.getByRole('navigation', { name: 'Phone' }).closest('.cui-app-shell__tabbar')).toBeTruthy();
    const root = document.querySelector('.cui-app-shell') as HTMLElement;
    expect(root.className).toContain('cui-app-shell--has-tabs');
    expect(root.className).toContain('cui-app-shell--has-compact-banner');
    expect(root.className).toContain('cui-app-shell--no-nav');
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
  });

  it('puts service notices above the top bar and the context bar above the patient banner', () => {
    render(
      <AppShell navigation={{ groups }} environmentBanner="Demo" notices={<p>You are offline</p>} contextBar={<p>Emergency access ends 15:32</p>} patientBanner={<div>CHEN, Wei</div>}>
        x
      </AppShell>,
    );
    const notice = screen.getByText('You are offline').closest('.cui-app-shell__notices') as HTMLElement;
    expect(notice.previousElementSibling?.className).toContain('cui-app-shell__env');
    expect(notice.nextElementSibling?.className).toContain('cui-top-bar');
    const bar = screen.getByText('Emergency access ends 15:32').closest('.cui-app-shell__context-bar') as HTMLElement;
    expect(bar.parentElement?.className).toContain('cui-app-shell__column');
    expect(bar.nextElementSibling?.className).toContain('cui-app-shell__patient');
  });

  it('adds a More tab that opens the navigation drawer when mobileMoreTab is set', async () => {
    const onSelect = vi.fn();
    render(
      <AppShell navigation={{ groups }} mobileMoreTab mobileTabs={{ items: [{ id: 'caseload', label: 'Caseload', href: '#caseload' }], onSelect, label: 'Destinations' }}>
        x
      </AppShell>,
    );
    const tabs = screen.getByRole('navigation', { name: 'Destinations' });
    expect(Array.from(tabs.querySelectorAll('.cui-mobile-tab__label')).map(t => t.textContent)).toEqual(['Caseload', 'More']);
    expect((document.querySelector('.cui-app-shell') as HTMLElement).className).toContain('cui-app-shell--more-tab');
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(await screen.findByRole('dialog', { name: 'Menu' })).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps at most four tabs before More', () => {
    const items = ['a', 'b', 'c', 'd', 'e'].map(id => ({ id, label: id.toUpperCase() }));
    render(<AppShell navigation={{ groups }} mobileMoreTab mobileTabs={{ items, label: 'Destinations' }}>x</AppShell>);
    const tabs = screen.getByRole('navigation', { name: 'Destinations' });
    expect(Array.from(tabs.querySelectorAll('.cui-mobile-tab__label')).map(t => t.textContent)).toEqual(['A', 'B', 'C', 'D', 'More']);
  });

  it('passes the compact brand to the top bar', () => {
    render(<AppShell brand={<span>Riverside Mental Health</span>} brandCompact={<span>RM</span>}>x</AppShell>);
    expect(screen.getByText('RM').closest('.cui-top-bar__brand--compact')).toBeTruthy();
    expect(screen.getByText('Riverside Mental Health').closest('.cui-top-bar__brand--full')).toBeTruthy();
  });
});
