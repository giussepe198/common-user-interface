import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import type { ClinicalChoiceOption } from '../ClinicalRadioGroup/ClinicalRadioGroup';
import { ChoiceFieldset } from '../internal/ChoiceFieldset';
import { isNegativelyPhrased, orderChoices, type ChoiceOrdering } from '../utils/choiceOrder';
import { devWarn } from '../utils/dev';
import { toSentenceCase } from '../utils/sentenceCase';

export interface ClinicalCheckboxGroupProps {
  /** Group label rendered as the fieldset legend (sentence case, CNA-2060). */
  legend: string;
  /** Options, 10 or fewer (CNA-1980). Every check box has a label (CNA-2020). */
  options: ClinicalChoiceOption[];
  /** Selected values (controlled). */
  value?: string[];
  /** Initial selection when uncontrolled. Default none: nothing is ticked for the user. */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** 'logical' keeps the given order (CNA-1990); or 'frequency' / 'alphabetical'. */
  ordering?: ChoiceOrdering;
  /** Vertical is preferred (CNA-2000). */
  orientation?: 'vertical' | 'horizontal';
  /** Put the legend and labels in sentence case (CNA-2060). Default true. */
  sentenceCase?: boolean;
  preserveWords?: string[];
  /** Grey italic prompt below the legend. */
  prompt?: string;
  required?: boolean;
  missed?: boolean;
  error?: string;
  /** Screen-reader message when a revealing option is ticked (CNA-2010). */
  revealAnnouncement?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Independent check boxes (CNA-1970) with an unambiguous cleared state (CNA-1950). There is no
 * mixed or indeterminate state: it is not offered (CNA-2020 note).
 */
export function ClinicalCheckboxGroup({
  legend,
  options,
  value,
  defaultValue = [],
  onChange,
  ordering = 'logical',
  orientation = 'vertical',
  sentenceCase = true,
  preserveWords,
  prompt,
  required,
  missed,
  error,
  revealAnnouncement = 'Further fields have appeared below.',
  id,
  disabled,
  className,
}: ClinicalCheckboxGroupProps) {
  const groupId = useId('cui-check', id);
  const ordered = React.useMemo(() => orderChoices(options, ordering), [options, ordering]);
  const [current, setCurrent] = useControllableState<string[]>(value, defaultValue, onChange);
  const [announcement, setAnnouncement] = React.useState('');
  if (options.length > 10) devWarn(`ClinicalCheckboxGroup "${legend}": use 10 or fewer check boxes (CNA-1980); got ${options.length}.`);
  options.forEach((o) => {
    if (isNegativelyPhrased(o.label)) devWarn(`ClinicalCheckboxGroup: phrase "${o.label}" positively (CNA-2080).`);
  });
  const sc = (t: string) => (sentenceCase ? toSentenceCase(t, preserveWords) : t);

  return (
    <ChoiceFieldset
      id={groupId}
      kind="checkbox"
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
        const checked = current.includes(o.value);
        return (
          <div key={o.value} className={cx('cui-choice-group__option', o.disabled && 'cui-choice-group__option--disabled')}>
            <label className="cui-choice-group__control" htmlFor={optId}>
              <input
                id={optId}
                type="checkbox"
                value={o.value}
                checked={checked}
                disabled={o.disabled}
                aria-describedby={o.prompt ? `${optId}-prompt` : undefined}
                onChange={(e) => {
                  const on = e.target.checked;
                  const next = on ? ordered.filter((x) => x.value === o.value || current.includes(x.value)).map((x) => x.value) : current.filter((v) => v !== o.value);
                  setCurrent(next);
                  setAnnouncement(on && o.reveals ? revealAnnouncement : '');
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
