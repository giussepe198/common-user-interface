import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { ChoiceFieldset } from '../internal/ChoiceFieldset';
import { orderChoices, type ChoiceOrdering } from '../utils/choiceOrder';
import { devWarn } from '../utils/dev';
import { toSentenceCase } from '../utils/sentenceCase';

/** One option of a clinical choice group. */
export interface ClinicalChoiceOption {
  /** Stored value. */
  value: string;
  /** Visible label: short, positive phrasing (CNA-2080), similar length to its siblings (CNA-2070). */
  label: string;
  /** Prompt shown next to the option, e.g. "Opens further details" for a revealing option (CNA-0920). */
  prompt?: string;
  /** Selecting this option reveals further fields: announced to assistive technology (CNA-1920/2010). */
  reveals?: boolean;
  /** Relative frequency of use, for `ordering="frequency"` (CNA-1890 most common first). */
  frequency?: number;
  /** A 'None' or 'All' option, always placed first (CNA-2050). */
  pinFirst?: boolean;
  disabled?: boolean;
}

export interface ClinicalRadioGroupProps {
  /** Group label rendered as the fieldset legend (sentence case, CNA-2060). */
  legend: string;
  /** Options, 2 to 7±2 (CNA-1880). */
  options: ClinicalChoiceOption[];
  /** Selected value; `null` for no selection (controlled). */
  value?: string | null;
  /** Initial value when uncontrolled. Overrides `defaultSelection`. */
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /**
   * 'none' (default, [suggested] deviation): nothing pre-selected, so no clinical value is recorded
   * without a decision (Elaboration 2.3.2 no default values; 2.2.3 'Please specify').
   * 'first': the first option is selected by default (CNA-1930), for non-clinical settings.
   */
  defaultSelection?: 'none' | 'first';
  /** 'logical' keeps the given order (CNA-1890 related/most common first); or 'frequency' / 'alphabetical'. */
  ordering?: ChoiceOrdering;
  /** Vertical is preferred (CNA-1910). */
  orientation?: 'vertical' | 'horizontal';
  /** Put the legend and labels in sentence case (CNA-2060). Default true. */
  sentenceCase?: boolean;
  /** Words kept as written by sentence casing (proper nouns). */
  preserveWords?: string[];
  /** Grey italic prompt below the legend (CNA-2090/2100). */
  prompt?: string;
  /** Required group (CNA-1080). */
  required?: boolean;
  /** Required and passed over while empty (CNA-1160..1180). */
  missed?: boolean;
  error?: string;
  /** Screen-reader message when a revealing option is chosen (CNA-1920). */
  revealAnnouncement?: string;
  /** Input name; generated when omitted. */
  name?: string;
  /** Fieldset id (used by required-field navigation). */
  id?: string;
  disabled?: boolean;
  className?: string;
}

/** Radio button group following the CUI clinical noting rules for standard controls. */
export function ClinicalRadioGroup({
  legend,
  options,
  value,
  defaultValue,
  onChange,
  defaultSelection = 'none',
  ordering = 'logical',
  orientation = 'vertical',
  sentenceCase = true,
  preserveWords,
  prompt,
  required,
  missed,
  error,
  revealAnnouncement = 'Further fields have appeared below.',
  name,
  id,
  disabled,
  className,
}: ClinicalRadioGroupProps) {
  const groupId = useId('cui-radio', id);
  const ordered = React.useMemo(() => orderChoices(options, ordering), [options, ordering]);
  const initial = defaultValue !== undefined ? defaultValue : defaultSelection === 'first' ? ordered.find((o) => !o.disabled)?.value ?? null : null;
  const [current, setCurrent] = useControllableState<string | null>(value, initial, onChange);
  const [announcement, setAnnouncement] = React.useState('');
  if (options.length < 2 || options.length > 9) devWarn(`ClinicalRadioGroup "${legend}": use 2 to 7±2 options (CNA-1880); got ${options.length}.`);
  const sc = (t: string) => (sentenceCase ? toSentenceCase(t, preserveWords) : t);

  return (
    <ChoiceFieldset
      id={groupId}
      kind="radio"
      legend={sc(legend)}
      prompt={prompt}
      required={required}
      missed={missed}
      error={error}
      orientation={orientation}
      announcement={announcement}
      disabled={disabled}
      className={className}
    >
      {ordered.map((o, i) => {
        const optId = `${groupId}-${i}`;
        return (
          <div key={o.value} className={cx('cui-choice-group__option', o.disabled && 'cui-choice-group__option--disabled')}>
            <label className="cui-choice-group__control" data-touch-target htmlFor={optId}>
              <input
                id={optId}
                type="radio"
                name={name ?? groupId}
                value={o.value}
                checked={current === o.value}
                disabled={o.disabled}
                aria-describedby={o.prompt ? `${optId}-prompt` : undefined}
                onChange={() => {
                  setCurrent(o.value);
                  setAnnouncement(o.reveals ? revealAnnouncement : '');
                }}
              />
              <span>{sc(o.label)}</span>
            </label>
            {o.prompt ? <span id={`${optId}-prompt`} className="cui-prompt cui-choice-group__option-prompt">{o.prompt}</span> : null}
          </div>
        );
      })}
    </ChoiceFieldset>
  );
}
