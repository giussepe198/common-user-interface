import React from 'react';
import { cx, useControllableState, useId } from '../../core';

export type SectionOrderMode = 'added' | 'standard';

export interface SectionOrderToggleProps {
  /** Current order (controlled). Default 'added' (Theme 9: sections in the order the user added them). */
  value?: SectionOrderMode;
  defaultValue?: SectionOrderMode;
  onChange?: (mode: SectionOrderMode) => void;
  /** Label of the standard order, e.g. "Standard order (RCP headings)". Default "Standard order". */
  standardLabel?: string;
  /** Label of the user's order. Default "Order added". */
  addedLabel?: string;
  /** Group label. Default "Order of sections". */
  legend?: string;
  className?: string;
}

/**
 * Switch between the order sections were added and the standard heading order (Noting Using
 * Templates, Theme 9; experimental). Reordering never changes the order of items inside sections
 * (use `orderTemplateSections`); the record keeps the added order.
 */
export function SectionOrderToggle({ value, defaultValue = 'added', onChange, standardLabel = 'Standard order', addedLabel = 'Order added', legend = 'Order of sections', className }: SectionOrderToggleProps) {
  const id = useId('cui-sorder');
  const [mode, setMode] = useControllableState<SectionOrderMode>(value, defaultValue, onChange);
  const [announcement, setAnnouncement] = React.useState('');
  const options: Array<[SectionOrderMode, string]> = [
    ['added', addedLabel],
    ['standard', standardLabel],
  ];
  return (
    <fieldset className={cx('cui-section-order', className)}>
      <legend className="cui-section-order__legend">{legend}</legend>
      <div className="cui-section-order__options">
        {options.map(([m, text]) => (
          <label key={m} className={cx('cui-section-order__option', mode === m && 'cui-section-order__option--on')} data-touch-target>
            <input
              type="radio"
              name={id}
              value={m}
              checked={mode === m}
              onChange={() => {
                setMode(m);
                setAnnouncement(`Sections shown in ${m === 'added' ? 'the order they were added' : 'the standard order'}. Items inside sections are unchanged.`);
              }}
            />
            {text}
          </label>
        ))}
      </div>
      <span className="cui-prompt cui-section-order__note">Items inside each section keep their order.</span>
      <span className="cui-visually-hidden" aria-live="polite">{announcement}</span>
    </fieldset>
  );
}
