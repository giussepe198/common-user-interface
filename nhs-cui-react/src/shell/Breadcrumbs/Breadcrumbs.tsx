import React from 'react';
import { Icon, cx } from '../../core';

/** One level of the trail. */
export interface BreadcrumbsItem {
  id: string;
  label: string;
  /** Link to the level. The last item is the current page and is never a link. */
  href?: string;
  /** Called on click (for client-side routing); call `preventDefault` on the event to stop the browser following href. */
  onSelect?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface BreadcrumbsProps {
  /** Levels from the top down to the current page. */
  items: ReadonlyArray<BreadcrumbsItem>;
  /** Accessible name of the navigation. Default "Breadcrumb". */
  label?: string;
  /** Words before the parent's name in narrow containers. Default "Back to". */
  backLabel?: string;
  className?: string;
}

/**
 * Where the page sits in the hierarchy, for administration and reports. The current page is the last item, marked
 * aria-current="page". In narrow containers only a "Back to <parent>" link remains. Not used for the patient record,
 * which keeps its banner and tabs unless the product chooses a trail from the record section [suggested]; not for the selection trail of a prescription (MSP-1060).
 */
export function Breadcrumbs({ items, label = 'Breadcrumb', backLabel = 'Back to', className }: BreadcrumbsProps) {
  if (!items.length) return null;
  const parent = items.length > 1 ? items[items.length - 2] : undefined;
  const hasBack = !!parent && !!(parent.href || parent.onSelect);
  return (
    <nav aria-label={label} className={cx('cui-breadcrumbs', hasBack && 'cui-breadcrumbs--has-back', className)}>
      <ol className="cui-breadcrumbs__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.id} className="cui-breadcrumbs__item">
              {last ? (
                <span aria-current="page" className="cui-breadcrumbs__current">
                  {item.label}
                </span>
              ) : item.href || item.onSelect ? (
                <a href={item.href} className="cui-breadcrumbs__link" onClick={item.onSelect}>
                  {item.label}
                </a>
              ) : (
                <span className="cui-breadcrumbs__text">{item.label}</span>
              )}
              {!last ? <Icon name="chevron-right" size={16} className="cui-breadcrumbs__sep" /> : null}
            </li>
          );
        })}
      </ol>
      {hasBack && parent ? (
        <a href={parent.href} className="cui-breadcrumbs__back" onClick={parent.onSelect}>
          <Icon name="chevron-left" size={16} />
          <span>
            {backLabel} {parent.label}
          </span>
        </a>
      ) : null}
    </nav>
  );
}
