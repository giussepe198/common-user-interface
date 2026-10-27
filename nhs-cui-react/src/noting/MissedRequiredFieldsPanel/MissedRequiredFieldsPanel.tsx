import React from 'react';
import { Icon, cx, useId } from '../../core';
import type { MissedRequiredField } from './useRequiredFieldTracking';

export interface MissedRequiredFieldsPanelProps {
  /** Missed fields, in tab order (from `useRequiredFieldTracking`). */
  items: MissedRequiredField[];
  /** Heading that expresses importance (CNA-1240). Default "Required fields". */
  title?: string;
  /** Short explanation under the heading. */
  intro?: string;
  /**
   * Called when a link is chosen. Default: scroll the field into view and focus it (CNA-1230).
   */
  onNavigate?: (id: string) => void;
  /** Keep the panel in view while the form scrolls (CNA-1220). Default true. */
  sticky?: boolean;
  /** Render nothing when no field is missed. Default true. */
  hideWhenEmpty?: boolean;
  className?: string;
}

function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  const focusable = el.matches('input, select, textarea, button, [tabindex]') ? el : el.querySelector<HTMLElement>('input:not([disabled]), select, textarea, button, [tabindex]');
  focusable?.focus({ preventScroll: true });
}

/**
 * Non-modal side panel listing every missed required field, grouped by form section, with links
 * that move to the field (CNA-1190..1240). It never blocks entry and never forces completion.
 */
export function MissedRequiredFieldsPanel({
  items,
  title = 'Required fields',
  intro = 'These required fields have not been completed. You can continue and come back to them.',
  onNavigate = focusField,
  sticky = true,
  hideWhenEmpty = true,
  className,
}: MissedRequiredFieldsPanelProps) {
  const headingId = useId('cui-missed');
  const groups: Array<{ section: string; items: MissedRequiredField[] }> = [];
  for (const item of items) {
    const section = item.section ?? '';
    const g = groups.find((x) => x.section === section);
    if (g) g.items.push(item);
    else groups.push({ section, items: [item] });
  }
  const count = items.length;
  const status = count === 0 ? '' : `${count} required ${count === 1 ? 'field' : 'fields'} not completed.`;
  if (count === 0 && hideWhenEmpty) return <span className="cui-visually-hidden" aria-live="polite" />;
  return (
    <aside className={cx('cui-missed-required', sticky && 'cui-missed-required--sticky', className)} aria-labelledby={headingId}>
      <h2 id={headingId} className="cui-missed-required__title">
        <Icon name="warning" />
        {title}
        {count ? <span className="cui-missed-required__count">{count}</span> : null}
      </h2>
      <span className="cui-visually-hidden" aria-live="polite">{status}</span>
      {count === 0 ? (
        <p className="cui-missed-required__intro">All required fields are complete.</p>
      ) : (
        <>
          <p className="cui-missed-required__intro">{intro}</p>
          {groups.map((g) => (
            <div key={g.section || '_'} className="cui-missed-required__group">
              {g.section ? <h3 className="cui-missed-required__section">{g.section}</h3> : null}
              <ul className="cui-missed-required__list">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="cui-missed-required__link" onClick={() => onNavigate(item.id)}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </aside>
  );
}
