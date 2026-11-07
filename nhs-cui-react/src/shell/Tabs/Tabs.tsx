import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { MenuButton } from '../MenuButton/MenuButton';

/** One tab. */
export interface TabsItem {
  id: string;
  /** Visible words; tabs are never icon-only. */
  label: string;
  /** The panel shown when the tab is selected. Omit on every item to render the tab list alone. */
  content?: React.ReactNode;
  /**
   * Link tabs: the page this tab opens. When items have `href` the tabs are page navigation (a `nav` of links with
   * `aria-current="page"` on `value`) rather than ARIA tabs with panels [suggested].
   */
  href?: string;
  /** Count after the label, e.g. open tasks. Announced with `countLabel`. */
  count?: number;
  /** Words for the count, e.g. "3 open". Default the number. */
  countLabel?: string;
  disabled?: boolean;
}

export interface TabsProps {
  /** Accessible name of the tab list, e.g. "Record sections". */
  label: string;
  /** Tabs in a fixed order; keep the same order for every person or record (MSP-1610, MSP-1620). */
  items: ReadonlyArray<TabsItem>;
  /** Selected tab id (controlled). */
  value?: string;
  /** Initially selected tab id (uncontrolled). Default the first enabled tab. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  /**
   * 'auto' (default): arrow keys select as they move. 'manual': arrows move focus and Enter or Space selects, for
   * panels that are slow to load.
   */
  activation?: 'auto' | 'manual';
  /** Most tabs shown in the bar before the rest go into the More menu. Default: as many as fit the width. */
  maxVisible?: number;
  /** Words on the overflow menu button. Default "More". */
  moreLabel?: string;
  /** Padding inside the panel: 'compact' (default) or 'none' when the panel holds its own Panel or list. */
  panelPadding?: 'none' | 'compact';
  /**
   * Link tabs: a tab or a More item was chosen, before the browser follows the link. Call `event.preventDefault()`
   * to route on the client (as SideNav `onSelect`).
   */
  onNavigate?: (id: string, event: React.SyntheticEvent) => void;
  className?: string;
  id?: string;
}

function useResizeWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** How many tabs fit: the widths of all tabs, the More button and the space available. */
export function countTabsThatFit(widths: ReadonlyArray<number>, moreWidth: number, available: number, gap = 0): number {
  if (!available || widths.every(w => !w)) return widths.length;
  const total = widths.reduce((a, w) => a + w + gap, 0);
  if (total <= available) return widths.length;
  let used = moreWidth;
  let k = 0;
  for (const w of widths) {
    if (used + w + gap > available) break;
    used += w + gap;
    k++;
  }
  return Math.max(1, k);
}

/**
 * Tabs within a page (ARIA tabs): arrow keys, Home and End move between tabs, the selected tab is marked by weight, an
 * underline and colour together. When the bar is too narrow the tabs that do not fit go into a More menu, and the
 * selected tab always stays in the bar.
 */
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onChange,
  activation = 'auto',
  maxVisible,
  moreLabel = 'More',
  panelPadding = 'compact',
  onNavigate,
  className,
  id: idProp,
}: TabsProps) {
  const links = items.some(t => t.href !== undefined);
  const id = useId('cui-tabs', idProp);
  const firstEnabled = items.find(t => !t.disabled)?.id ?? '';
  const [selected, setSelected] = useControllableState<string>(value, defaultValue ?? firstEnabled, onChange);
  const barRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef(new Map<string, HTMLElement | null>());
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const width = useResizeWidth(barRef);
  const [fit, setFit] = React.useState(items.length);

  React.useLayoutEffect(() => {
    const m = measureRef.current;
    if (!m) return;
    const spans = Array.from(m.children) as HTMLElement[];
    const widths = spans.slice(0, items.length).map(s => s.offsetWidth);
    const more = spans[items.length]?.offsetWidth ?? 0;
    const bar = barRef.current;
    const gap = bar && typeof getComputedStyle === 'function' ? parseFloat(getComputedStyle(bar).columnGap) || 0 : 0;
    setFit(countTabsThatFit(widths, more + gap, width));
  }, [width, items]);
  // The More button as drawn can be wider than its measure (a touch target, a font still loading): while the tabs
  // shown are still cut off, move one more into the menu, so a tab is never clipped.
  React.useLayoutEffect(() => {
    const list = barRef.current?.querySelector<HTMLElement>('.cui-tabs__list');
    if (list && fit > 1 && list.scrollWidth > list.clientWidth + 1) setFit(fit - 1);
  }, [fit, width, items]);

  const n = items.length;
  const count = Math.max(1, Math.min(fit, maxVisible ?? n, n));
  const selIdx = Math.max(0, items.findIndex(t => t.id === selected));
  let shown = items.map((_, i) => i).slice(0, count);
  if (selIdx >= count) shown = [...shown.slice(0, count - 1), selIdx];
  const shownSet = new Set(shown);
  const overflow = items.map((_, i) => i).filter(i => !shownSet.has(i));
  const visible = shown.map(i => items[i]);

  React.useEffect(() => {
    if (focusId) {
      tabRefs.current.get(focusId)?.focus();
      setFocusId(null);
    }
  }, [focusId]);

  const enabled = visible.filter(t => !t.disabled);
  // Link tabs: arrows only move focus (Enter follows the link); the current page is the one tab stop.
  const [focusStop, setFocusStop] = React.useState<string | null>(null);
  const onLinkKeyDown = (e: React.KeyboardEvent, current: TabsItem) => {
    const pos = enabled.findIndex(t => t.id === current.id);
    let next: TabsItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (!next) return;
    e.preventDefault();
    setFocusStop(next.id);
    tabRefs.current.get(next.id)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, current: TabsItem) => {
    const pos = enabled.findIndex(t => t.id === current.id);
    let next: TabsItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    else if ((e.key === 'Enter' || e.key === ' ') && activation === 'manual') {
      e.preventDefault();
      setSelected(current.id);
      return;
    }
    if (!next) return;
    e.preventDefault();
    tabRefs.current.get(next.id)?.focus();
    if (activation === 'auto') setSelected(next.id);
  };

  const active = items[selIdx];
  const hasPanels = items.some(t => t.content !== undefined);
  const countText = (t: TabsItem) =>
    t.count !== undefined ? (
      <>
        <span className="cui-tabs__count" aria-hidden="true">
          {t.count}
        </span>
        <span className="cui-visually-hidden">, {t.countLabel ?? String(t.count)}</span>
      </>
    ) : null;

  const measure = (
    <div ref={measureRef} className="cui-tabs__measure" aria-hidden="true">
      {items.map(t => (
        <span key={t.id} className="cui-tabs__tab">
          <span className="cui-tabs__label">{t.label}</span>
          {t.count !== undefined ? <span className="cui-tabs__count">{t.count}</span> : null}
        </span>
      ))}
      <span className="cui-tabs__tab cui-tabs__tab--more-measure">
        {moreLabel}
        <span className="cui-tabs__measure-icon" />
      </span>
    </div>
  );

  if (links) {
    const stop = focusStop && visible.some(t => t.id === focusStop) ? focusStop : active?.id;
    return (
      <div className={cx('cui-tabs', 'cui-tabs--links', className)}>
        <nav ref={barRef} aria-label={label} id={id} className="cui-tabs__bar">
          <ul
            className="cui-tabs__list"
            onBlur={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusStop(null);
            }}
          >
            {visible.map(t => {
              const isSel = t.id === active?.id && value !== undefined;
              const cls = cx('cui-tabs__tab', isSel && 'cui-tabs__tab--selected');
              const inner = (
                <>
                  <span className="cui-tabs__label">{t.label}</span>
                  {countText(t)}
                </>
              );
              return (
                <li key={t.id} className="cui-tabs__item">
                  {t.href && !t.disabled ? (
                    <a
                      ref={el => {
                        tabRefs.current.set(t.id, el);
                      }}
                      href={t.href}
                      className={cls}
                      aria-current={isSel ? 'page' : undefined}
                      tabIndex={t.id === stop ? 0 : -1}
                      onClick={e => onNavigate?.(t.id, e)}
                      onKeyDown={e => onLinkKeyDown(e, t)}
                    >
                      {inner}
                    </a>
                  ) : (
                    <span className={cx(cls, 'cui-tabs__tab--disabled')} aria-disabled="true">
                      {inner}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {overflow.length ? (
            <MenuButton
              className="cui-tabs__more"
              variant="quiet"
              size="sm"
              align="end"
              label={moreLabel}
              items={overflow.map(i => ({
                id: items[i].id,
                label: items[i].count !== undefined ? `${items[i].label} (${items[i].countLabel ?? items[i].count})` : items[i].label,
                href: items[i].href,
                disabled: items[i].disabled,
                onSelect: (e?: React.SyntheticEvent) => {
                  if (e) onNavigate?.(items[i].id, e);
                },
              }))}
            />
          ) : null}
          {measure}
        </nav>
      </div>
    );
  }

  return (
    <div className={cx('cui-tabs', className)}>
      <div ref={barRef} className="cui-tabs__bar">
        <div role="tablist" aria-label={label} className="cui-tabs__list">
          {visible.map(t => {
            const isSel = t.id === active?.id;
            return (
              <button
                key={t.id}
                ref={el => {
                  tabRefs.current.set(t.id, el);
                }}
                id={`${id}-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={isSel}
                aria-controls={hasPanels && isSel ? `${id}-panel` : undefined}
                tabIndex={isSel ? 0 : -1}
                disabled={t.disabled}
                className={cx('cui-tabs__tab', isSel && 'cui-tabs__tab--selected')}
                onClick={() => setSelected(t.id)}
                onKeyDown={e => onKeyDown(e, t)}
              >
                <span className="cui-tabs__label">{t.label}</span>
                {countText(t)}
              </button>
            );
          })}
        </div>
        {overflow.length ? (
          <MenuButton
            className="cui-tabs__more"
            variant="quiet"
            size="sm"
            align="end"
            label={moreLabel}
            items={overflow.map(i => ({
              id: items[i].id,
              label: items[i].count !== undefined ? `${items[i].label} (${items[i].countLabel ?? items[i].count})` : items[i].label,
              disabled: items[i].disabled,
              onSelect: () => {
                setSelected(items[i].id);
                setFocusId(items[i].id);
              },
            }))}
          />
        ) : null}
        {measure}
      </div>
      {hasPanels && active ? (
        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active.id}`}
          tabIndex={0}
          className={cx('cui-tabs__panel', panelPadding === 'compact' && 'cui-tabs__panel--compact')}
        >
          {active.content}
        </div>
      ) : null}
    </div>
  );
}
