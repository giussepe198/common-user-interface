import React from 'react';
import { cx, Icon } from '../../core';

/** One selection made so far, e.g. the drug, then the route. */
export interface SelectionTrailItem {
  id: string;
  /** What the selection is, for assistive technology: "Drug", "Route", "Form". */
  kind: string;
  /** The selected value as shown, e.g. "clarithromycin" or a MedicationLine element. */
  label: React.ReactNode;
  /** Plain text of the value, for the accessible name when `label` is not a string. */
  text?: string;
}

export interface SelectionTrailProps {
  /** Selections in order (MSP-1060). */
  items: SelectionTrailItem[];
  /**
   * Any item was activated: reopen the lists for all trail items as they were before templates were shown,
   * with selections highlighted and search text restored (MSP-1080 to MSP-1100). Hide the template list if
   * no template was chosen (MSP-1090).
   */
  onReopen: (itemId: string) => void;
  /** Accessible name. Default "Selections so far". */
  label?: string;
  className?: string;
}

/**
 * The selections made so far, shown after the last cascading list: each in its own text-box-like control,
 * not breadcrumb text such as "clarithromycin > oral" (MSP-1060). Activating any item reopens the lists
 * (MSP-1080); editing in place replaces back and undo buttons.
 */
export function SelectionTrail({ items, onReopen, label = 'Selections so far', className }: SelectionTrailProps) {
  return (
    <div className={cx('cui-selection-trail', className)} role="group" aria-label={label}>
      {items.map(it => (
        <button
          key={it.id}
          type="button"
          className="cui-selection-trail__item"
          aria-label={`${it.kind}: ${it.text ?? (typeof it.label === 'string' ? it.label : '')}. Change`}
          onClick={() => onReopen(it.id)}
        >
          <span className="cui-selection-trail__value">{it.label}</span>
          <Icon name="chevron-down" size={16} className="cui-selection-trail__chevron" />
        </button>
      ))}
    </div>
  );
}
