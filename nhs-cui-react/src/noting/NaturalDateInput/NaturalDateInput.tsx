import React from 'react';
import { Button, cx, useClinicalLocale, useControllableState, useId, type ClinicalRegion, type DateLike } from '../../core';
import {
  clinicalDateValueParts,
  formatClinicalDateValue,
  parseNaturalDuration,
  suggestNaturalDurations,
  type ClinicalDateValue,
  type NaturalDurationSuggestion,
} from '../utils/naturalDate';

/** An entry of the date menu (CNA-0630). */
export interface NaturalDateMenuOption {
  /** Phrase entered when chosen, e.g. "past 5 years". */
  text: string;
  /** Menu label. Defaults to the phrase in sentence case. */
  label?: string;
}

export interface NaturalDateInputProps {
  /** Typed text (controlled). */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called on every change of the text. */
  onChange?: (text: string) => void;
  /** The interpretation in standard form (controlled); null when the text is not understood or not yet chosen. */
  dateValue?: ClinicalDateValue | null;
  defaultDateValue?: ClinicalDateValue | null;
  /** Called when the interpretation changes (hazard mitigation: store the standard form so entries sort by date). */
  onDateValueChange?: (value: ClinicalDateValue | null) => void;
  /** Field label (CNA-0520). Default "Duration and/or date(s)". */
  label?: string;
  /** 'visible' label above the field, or 'in-field' prompt plus accessible name (CNA-0450). Default 'visible'. */
  labelMode?: 'visible' | 'in-field';
  /** "Now" for relative phrases. Default today. */
  referenceDate?: Date;
  /** Patient's date of birth, for "during childhood". */
  birthDate?: DateLike;
  /** Jurisdiction: hemisphere of seasons; AU and NZ never offer month-first dates. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Characters before suggestions appear (CNA-0540). Default 2 [suggested]. */
  minChars?: number;
  /** Maximum suggestions shown. Default 6 [suggested]. */
  maxSuggestions?: number;
  /** Offer the date menu button beside the field (CNA-0630). Default false. */
  showDateMenu?: boolean;
  /** Date menu entries. Default: past week, month, year, 5 and 10 years, during childhood, unknown [suggested]. */
  menuOptions?: NaturalDateMenuOption[];
  /**
   * Replaces the built-in parser: returns the confirmation text for typed text (for example from a
   * local lexicon). Suggestions are then not shown.
   */
  interpret?: (text: string) => string | undefined;
  /** Show a hint when the text is not recognised. Default true. */
  showNotRecognised?: boolean;
  id?: string;
  className?: string;
  /** Extra class for the input element. */
  inputClassName?: string;
}

const DEFAULT_MENU: NaturalDateMenuOption[] = [
  { text: 'past week' },
  { text: 'past month' },
  { text: 'past year' },
  { text: 'past 5 years' },
  { text: 'past 10 years' },
  { text: 'during childhood' },
  { text: 'unknown', label: 'Unknown' },
];

const sentence = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * Free-text "Duration and/or date(s)" field that understands simple natural language (CNA-0510..0630):
 * suggestions appear below while typing, an exact match is selected automatically, and the formal
 * confirmation (From, To, For) is shown to the right. There is no drop-down button on the field.
 */
export const NaturalDateInput = React.forwardRef<HTMLInputElement, NaturalDateInputProps>(function NaturalDateInput(
  {
    value,
    defaultValue = '',
    onChange,
    dateValue,
    defaultDateValue = null,
    onDateValueChange,
    label = 'Duration and/or date(s)',
    labelMode = 'visible',
    referenceDate,
    birthDate,
    region: regionProp,
    minChars = 2,
    maxSuggestions = 6,
    showDateMenu = false,
    menuOptions = DEFAULT_MENU,
    interpret,
    showNotRecognised = true,
    id,
    className,
    inputClassName,
  },
  ref,
) {
  const { region } = useClinicalLocale(regionProp);
  const baseId = useId('cui-natdate', id);
  const inputId = id ?? `${baseId}-input`;
  const listId = `${baseId}-list`;
  const confirmId = `${baseId}-confirm`;
  const [text, setText] = useControllableState<string>(value, defaultValue, onChange);
  const [chosen, setChosen] = useControllableState<ClinicalDateValue | null>(dateValue, defaultDateValue, onDateValueChange);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const ref0 = React.useMemo(() => referenceDate ?? new Date(), [referenceDate]);
  const opts = { referenceDate: ref0, region, birthDate };

  const suggestions: NaturalDurationSuggestion[] = React.useMemo(
    () => (interpret ? [] : suggestNaturalDurations(text, { ...opts, minChars, limit: maxSuggestions })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, interpret, ref0, region, birthDate, minChars, maxSuggestions],
  );
  const readings = React.useMemo(() => (interpret ? [] : parseNaturalDuration(text, opts)), [text, interpret, ref0, region, birthDate]); // eslint-disable-line react-hooks/exhaustive-deps
  const custom = interpret && text.trim() ? interpret(text.trim()) : undefined;

  const commitText = (t: string, v?: ClinicalDateValue | null) => {
    setText(t);
    if (interpret) return;
    if (v !== undefined) {
      setChosen(v);
      return;
    }
    const r = parseNaturalDuration(t, opts);
    // Exact single reading is selected automatically (CNA-0580); two readings wait for a choice.
    setChosen(r.length === 1 ? r[0] : null);
  };

  const choose = (s: NaturalDurationSuggestion) => {
    commitText(s.text, s.value);
    setOpen(false);
    setActive(-1);
  };

  // Text typed before mount or set by the parent is read the same way as typed text.
  const effective = chosen ?? (!interpret && readings.length === 1 ? readings[0] : null);
  const ambiguous = !interpret && !effective && readings.length > 1;
  const listShown = open && suggestions.length > 0 && !(suggestions.length === 1 && effective && formatClinicalDateValue(effective) === suggestions[0].confirmation && !ambiguous);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = suggestions.length;
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && n) {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
    } else if (e.key === 'Enter' && listShown && active >= 0) {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setActive(-1);
    }
  };

  React.useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [menuOpen]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      setMenuOpen(false);
      if (e.key === 'Escape') menuButtonRef.current?.focus();
    }
  };

  const confirmation = interpret ? custom : effective ? clinicalDateValueParts(effective) : undefined;
  const notRecognised = showNotRecognised && !interpret && text.trim().replace(/\s/g, '').length >= minChars && !effective && readings.length === 0 && !open;

  return (
    <div
      className={cx('cui-natural-date', className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
          setMenuOpen(false);
        }
      }}
    >
      {labelMode === 'visible' ? <label className="cui-natural-date__label" htmlFor={inputId}>{label}</label> : null}
      <div className="cui-natural-date__row">
        <div className="cui-natural-date__field">
          <input
            ref={ref}
            id={inputId}
            className={cx('cui-noting-input', 'cui-natural-date__input', inputClassName)}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={listShown}
            aria-controls={listId}
            aria-activedescendant={listShown && active >= 0 ? `${baseId}-opt-${active}` : undefined}
            aria-label={labelMode === 'in-field' ? label : undefined}
            aria-describedby={confirmation ? confirmId : undefined}
            placeholder={labelMode === 'in-field' ? label : undefined}
            autoComplete="off"
            value={text}
            onChange={(e) => {
              commitText(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
          />
          <ul id={listId} role="listbox" aria-label={`${label}: suggestions`} className="cui-natural-date__list" hidden={!listShown}>
            {suggestions.map((s, i) => (
              <li
                key={`${s.text}-${s.confirmation}`}
                id={`${baseId}-opt-${i}`}
                role="option"
                aria-selected={active === i}
                className={cx('cui-natural-date__option', active === i && 'cui-natural-date__option--active')}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(s)}
              >
                <span className="cui-natural-date__phrase">{s.text}</span>
                <span className="cui-natural-date__reading">{s.confirmation}</span>
              </li>
            ))}
          </ul>
        </div>
        {showDateMenu ? (
          <div className="cui-natural-date__menu-wrap">
            <Button
              ref={menuButtonRef}
              size="sm"
              variant="secondary"
              icon="calendar"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              Choose period
            </Button>
            {menuOpen ? (
              <div ref={menuRef} role="menu" aria-label="Choose a period" className="cui-natural-date__menu" onKeyDown={onMenuKey}>
                {menuOptions.map((o) => (
                  <button
                    key={o.text}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className="cui-natural-date__menu-item"
                    onClick={() => {
                      commitText(o.text);
                      setMenuOpen(false);
                      document.getElementById(inputId)?.focus();
                    }}
                  >
                    {o.label ?? sentence(o.text)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <span id={confirmId} className="cui-natural-date__confirm" aria-live="polite">
          {typeof confirmation === 'string' ? <strong>{confirmation}</strong> : confirmation ? confirmation.map((p, i) => (
            <span key={i} className="cui-natural-date__part">
              {p.label ? <span className="cui-natural-date__part-label">{p.label} </span> : null}
              <strong>{p.text}</strong>
            </span>
          )) : null}
          {ambiguous ? (
            <span className="cui-natural-date__choose" role="group" aria-label="Which date did you mean?">
              <span className="cui-natural-date__hint">Which did you mean?</span>
              {readings.map((r) => {
                const t = formatClinicalDateValue(r);
                return (
                  <Button key={t} size="sm" variant="secondary" onClick={() => setChosen(r)}>
                    {t}
                  </Button>
                );
              })}
            </span>
          ) : null}
          {notRecognised ? <span className="cui-natural-date__hint">Not recognised as a date or duration: it will be kept as typed.</span> : null}
        </span>
      </div>
    </div>
  );
});
