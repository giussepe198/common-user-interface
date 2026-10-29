import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { MobileTabBar, type MobileTabBarProps } from '../../mobile';
import { Drawer } from '../Drawer/Drawer';
import { SideNav, type SideNavProps } from '../SideNav/SideNav';
import { TopBar } from '../TopBar/TopBar';
import { ShellGlyph } from '../internal/shellIcons';

/** Words used by the frame itself. */
export interface AppShellLabels {
  /** Skip link. Default "Skip to main content". */
  skipLink: string;
  /** Narrow screens: the button that opens the navigation drawer. Default "Open navigation". */
  openNavigation: string;
  /** Title of the navigation drawer. Default "Menu". */
  navigationTitle: string;
  /** Wide screens: collapse the side navigation to icons. Default "Collapse navigation". */
  collapseNavigation: string;
  /** Wide screens: expand it again. Default "Expand navigation". */
  expandNavigation: string;
  /** Word read before the environment banner text. Default "Environment". */
  environment: string;
  /** Phones: the last tab that opens the navigation drawer (`mobileMoreTab`). Default "More". */
  moreTab: string;
}

const DEFAULT_LABELS: AppShellLabels = {
  skipLink: 'Skip to main content',
  openNavigation: 'Open navigation',
  navigationTitle: 'Menu',
  collapseNavigation: 'Collapse navigation',
  expandNavigation: 'Expand navigation',
  environment: 'Environment',
  moreTab: 'More',
};

/** Container width (px) under which the side navigation becomes a drawer. Matches AppShell.css. */
export const APP_SHELL_DRAWER_BELOW = 900;
/** Container width (px) under which the phone tab bar and the compact patient banner are used. Matches AppShell.css. */
export const APP_SHELL_PHONE_BELOW = 600;

export interface AppShellProps {
  /** The side navigation (SideNav props without `collapsed`): rendered inline, as an icon rail, or in a drawer. */
  navigation?: Omit<SideNavProps, 'collapsed'>;
  /** Organisation in the top bar (logo or name). */
  brand?: React.ReactNode;
  /** Phone form of the brand, e.g. the mark alone. Used under 600 px in place of `brand` when given [suggested]. */
  brandCompact?: React.ReactNode;
  /** Working context in the top bar (unit, team or role switcher). Always shown. */
  context?: React.ReactNode;
  /** Global search in the top bar. */
  search?: React.ReactNode;
  /** Other global commands in the top bar, before help. */
  actions?: React.ReactNode;
  /** Help menu slot (a MenuButton). */
  help?: React.ReactNode;
  /** Account menu slot (a MenuButton). */
  account?: React.ReactNode;
  /**
   * Environment banner above everything, e.g. "Demo: synthetic data only". A string is shown with the warning icon
   * and words; a node is rendered as given. Never dismissible [suggested].
   */
  environmentBanner?: React.ReactNode;
  /**
   * Service notices under the environment banner and above the top bar, full width: offline, read-only or planned
   * maintenance messages. Rendered as given (pass a Message or your own banner) [suggested].
   */
  notices?: React.ReactNode;
  /**
   * A strip across the content column under the top bar and above the patient banner, e.g. an emergency access
   * notice that applies to every screen of the record. Not sticky [suggested].
   */
  contextBar?: React.ReactNode;
  /**
   * Patient banner slot, sticky above the content while it scrolls (PAB-0009: at the top, below the title bar and
   * global navigation). Pass the patient area's PatientBanner.
   */
  patientBanner?: React.ReactNode;
  /** Phone form of the patient banner, e.g. MobilePatientHeader. Used under 600 px when given. */
  patientBannerCompact?: React.ReactNode;
  /** Phone tab bar (the mobile area's MobileTabBar props). Shown under 600 px in place of nothing; the menu stays. */
  mobileTabs?: Omit<MobileTabBarProps, 'sticky'>;
  /**
   * Phones: add a last tab ("More", `labels.moreTab`) that opens the navigation drawer, and drop the top bar's menu
   * button under 600 px because the tab replaces it. Needs `navigation` and `mobileTabs`; keep `mobileTabs` to four
   * items so the bar holds five [suggested].
   */
  mobileMoreTab?: boolean;
  /** Side navigation collapsed to the icon rail on wide screens (controlled). */
  navCollapsed?: boolean;
  /** Initially collapsed (uncontrolled). Default false. */
  defaultNavCollapsed?: boolean;
  onNavCollapsedChange?: (collapsed: boolean) => void;
  /** Id of the main landmark, the skip link's target. Default "main". */
  mainId?: string;
  /** The frame's own words. */
  labels?: Partial<AppShellLabels>;
  /** Content padding: 'compact' (default) or 'none' for full-bleed screens such as a timeline. */
  contentPadding?: 'compact' | 'none';
  children?: React.ReactNode;
  className?: string;
}

/**
 * Application frame: skip link, optional environment banner, top bar (organisation, context, search, help, account),
 * collapsible side navigation, sticky patient banner slot and the main region. Responsive by container width: the
 * side navigation becomes a drawer under 900 px, and under 600 px the phone tab bar and compact banner appear.
 */
export function AppShell({
  navigation,
  brand,
  brandCompact,
  context,
  search,
  actions,
  help,
  account,
  environmentBanner,
  notices,
  contextBar,
  patientBanner,
  patientBannerCompact,
  mobileTabs,
  mobileMoreTab = false,
  navCollapsed,
  defaultNavCollapsed = false,
  onNavCollapsedChange,
  mainId = 'main',
  labels: labelsProp,
  contentPadding = 'compact',
  children,
  className,
}: AppShellProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const id = useId('cui-app-shell');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useControllableState<boolean>(navCollapsed, defaultNavCollapsed, onNavCollapsedChange);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerUsed, setDrawerUsed] = React.useState(false);
  if (drawerOpen && !drawerUsed) setDrawerUsed(true);

  // Close the drawer when the frame grows past the drawer width (the inline navigation is back).
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth >= APP_SHELL_DRAWER_BELOW) setDrawerOpen(false);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const navId = `${id}-nav`;
  const moreTabId = `${id}-more`;
  const withMoreTab = !!(mobileMoreTab && navigation && mobileTabs);
  const tabs: Omit<MobileTabBarProps, 'sticky'> | undefined = mobileTabs
    ? withMoreTab
      ? {
          ...mobileTabs,
          items: [...mobileTabs.items.slice(0, 4), { id: moreTabId, label: labels.moreTab, icon: 'dots' }],
          onSelect: (tabId, e) => {
            if (tabId === moreTabId) setDrawerOpen(true);
            else mobileTabs.onSelect?.(tabId, e);
          },
        }
      : mobileTabs
    : undefined;
  const start = navigation ? (
    <>
      <button
        type="button"
        className="cui-app-shell__nav-button cui-app-shell__nav-button--open"
        aria-label={labels.openNavigation}
        title={labels.openNavigation}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen(true)}
      >
        <ShellGlyph name="menu" size={20} />
      </button>
      <button
        type="button"
        className="cui-app-shell__nav-button cui-app-shell__nav-button--collapse"
        aria-label={collapsed ? labels.expandNavigation : labels.collapseNavigation}
        title={collapsed ? labels.expandNavigation : labels.collapseNavigation}
        aria-expanded={!collapsed}
        aria-controls={navId}
        onClick={() => setCollapsed(!collapsed)}
      >
        <ShellGlyph name={collapsed ? 'rail-expand' : 'rail-collapse'} size={20} />
      </button>
    </>
  ) : null;

  const env =
    environmentBanner === undefined || environmentBanner === null || environmentBanner === false ? null : typeof environmentBanner === 'string' ? (
      <div className="cui-app-shell__env cui-app-shell__env--text">
        <Icon name="warning" size={16} />
        <span>
          <span className="cui-visually-hidden">{labels.environment}: </span>
          {environmentBanner}
        </span>
      </div>
    ) : (
      <div className="cui-app-shell__env">{environmentBanner}</div>
    );

  return (
    <div
      ref={rootRef}
      className={cx(
        'cui-app-shell',
        collapsed && 'cui-app-shell--nav-collapsed',
        !navigation && 'cui-app-shell--no-nav',
        !!mobileTabs && 'cui-app-shell--has-tabs',
        withMoreTab && 'cui-app-shell--more-tab',
        !!patientBannerCompact && 'cui-app-shell--has-compact-banner',
        className,
      )}
    >
      <a className="cui-app-shell__skip" href={`#${mainId}`}>
        {labels.skipLink}
      </a>
      {env}
      {notices ? <div className="cui-app-shell__notices">{notices}</div> : null}
      <TopBar start={start} brand={brand} brandCompact={brandCompact} context={context} search={search} actions={actions} help={help} account={account} />
      <div className="cui-app-shell__body">
        {navigation ? (
          <div className="cui-app-shell__nav">
            <SideNav {...navigation} id={navId} collapsed={collapsed} />
          </div>
        ) : null}
        <div className="cui-app-shell__column">
          {contextBar ? <div className="cui-app-shell__context-bar">{contextBar}</div> : null}
          {patientBanner || patientBannerCompact ? (
            <div className="cui-app-shell__patient">
              {patientBanner ? <div className="cui-app-shell__patient-full">{patientBanner}</div> : null}
              {patientBannerCompact ? <div className="cui-app-shell__patient-compact">{patientBannerCompact}</div> : null}
            </div>
          ) : null}
          <main id={mainId} tabIndex={-1} className={cx('cui-app-shell__main', contentPadding === 'none' && 'cui-app-shell__main--flush')}>
            {children}
          </main>
        </div>
      </div>
      {tabs ? (
        <div className="cui-app-shell__tabbar">
          <MobileTabBar {...tabs} sticky={false} />
        </div>
      ) : null}
      {navigation && (drawerOpen || drawerUsed) ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={labels.navigationTitle}
          side="start"
          size="sm"
          sheetOnPhone={false}
          className="cui-app-shell__drawer"
        >
          <SideNav
            {...navigation}
            collapsed={false}
            onSelect={(itemId, e) => {
              navigation.onSelect?.(itemId, e);
              setDrawerOpen(false);
            }}
          />
        </Drawer>
      ) : null}
    </div>
  );
}
