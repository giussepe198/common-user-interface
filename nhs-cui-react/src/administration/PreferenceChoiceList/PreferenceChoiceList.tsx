import React from 'react';
import { cx, useControllableState, useId } from '../../core';
import { InformationWindow, InformationWindowProps, InformationWindowResponse } from '../InformationWindow/InformationWindow';
import { PreferenceIcon } from '../PreferenceIcon/PreferenceIcon';

/** One option in a choice list with an optional preference rating (2.3). */
export interface PreferenceChoiceOption {
  id: string;
  label: React.ReactNode;
  /** Plain text of the label, used in accessible names when `label` is not a string. */
  textLabel?: string;
  disabled?: boolean;
  /** Preference rating, reasons for the tooltip, and the explanation shown when the icon is clicked (2.3). */
  preference?: {
    level: 1 | 2 | 3 | 4 | 5;
    reasons?: string[];
    /** Content of the explanation window. Header is "Explanation". */
    explanation?: Omit<InformationWindowProps, 'variant' | 'onDismiss' | 'onRecordResponse'>;
  };
}

export interface PreferenceChoiceListProps {
  /** Options in display order. */
  options: PreferenceChoiceOption[];
  /** Visible label of the list (fieldset legend). */
  label: React.ReactNode;
  /** Selected option id. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (id: string) => void;
  /** "Record Response" in an explanation window; it then closes. */
  onRecordResponse?: (optionId: string, response: InformationWindowResponse) => void;
  className?: string;
}

/**
 * Choice list with preference ratings: each rated option has a five-level preference icon to its
 * LEFT (2.3). Hover or focus shows the reasons; clicking opens one "Explanation" information
 * window aligned to the top right of the list. Clicking outside, Esc or Dismiss closes it.
 */
export function PreferenceChoiceList({ options, label, value, defaultValue = null, onChange, onRecordResponse, className }: PreferenceChoiceListProps) {
  const id = useId('cui-pref-list');
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, v => v != null && onChange?.(v));
  const [openId, setOpenId] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const iconRefs = React.useRef<Record<string, HTMLElement | null>>({});

  const close = React.useCallback((returnFocus: boolean) => {
    setOpenId(prev => {
      if (prev && returnFocus) requestAnimationFrame(() => iconRefs.current[prev]?.focus());
      return null;
    });
  }, []);

  React.useEffect(() => {
    if (!openId) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.cui-pref-list__window') && !el.closest('.cui-ds-pref--button')) close(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openId, close]);

  const open = options.find(o => o.id === openId);
  const optionText = (o: PreferenceChoiceOption) => o.textLabel ?? (typeof o.label === 'string' ? o.label : o.id);

  return (
    <div className={cx('cui-pref-list', className)} ref={rootRef}>
      <fieldset className="cui-pref-list__fieldset">
        <legend className="cui-pref-list__legend">{label}</legend>
        <ul className="cui-pref-list__options">
          {options.map(o => {
            const p = o.preference;
            return (
              <li key={o.id} className={cx('cui-pref-list__option', selected === o.id && 'cui-pref-list__option--selected')}>
                <span className="cui-pref-list__pref">
                  {p ? (
                    <PreferenceIcon
                      ref={el => (iconRefs.current[o.id] = el)}
                      level={p.level}
                      reasons={p.reasons}
                      optionLabel={optionText(o)}
                      expanded={p.explanation ? openId === o.id : undefined}
                      onClick={p.explanation ? () => setOpenId(openId === o.id ? null : o.id) : undefined}
                    />
                  ) : null}
                </span>
                <label className="cui-pref-list__choice">
                  <input
                    type="radio"
                    name={`${id}-choice`}
                    value={o.id}
                    disabled={o.disabled}
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                  />
                  <span>{o.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {open?.preference?.explanation ? (
        <div className="cui-pref-list__window">
          <InformationWindow
            {...open.preference.explanation}
            variant="explanation"
            onDismiss={() => close(true)}
            onRecordResponse={r => {
              onRecordResponse?.(open.id, r);
              close(true);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
