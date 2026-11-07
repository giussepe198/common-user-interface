import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import { foldFormText, type FormOption } from '../utils/formOptions';
import { OptionList, optionDomId } from '../internal/OptionList';
import { useOptionSearch, type FormOptionLoader } from '../internal/useOptionSearch';

export interface ComboboxProps {
  /** Static options, filtered as the user types (every word, ignoring case and macrons). Give this or `loadOptions`. */
  options?: readonly FormOption[];
  /** Asynchronous options for the typed text; out-of-order responses are ignored, superseded requests aborted. */
  loadOptions?: FormOptionLoader;
  /** Matching for static options (a ranked, typo-tolerant search). Default: every word, ignoring case and macrons. */
  filterOptions?: (options: readonly FormOption[], query: string) => FormOption[];
  /**
   * Options offered while the box is empty (the user's recent choices), under the heading `recentLabel`. They open
   * with Down arrow or a click in the empty box [suggested].
   */
  recentOptions?: readonly FormOption[];
  /** Heading of the recent options. Default "Recent". */
  recentLabel?: string;
  /** Chosen option (controlled); `null` for none. */
  value?: FormOption | null;
  /** Initial option when uncontrolled. */
  defaultValue?: FormOption | null;
  /** Called with the chosen option, or null when the text is cleared or edited. */
  onChange?: (option: FormOption | null) => void;
  /** In-field prompt: grey italic, no examples (CNA-2130, CNA-2160). */
  placeholder?: string;
  /** Characters typed before options load. Default 0 for static options, 2 for `loadOptions` (SCT-011 pattern). */
  minChars?: number;
  /** Delay after typing stops before `loadOptions` runs. Default 200 ms (Matching 2.2.2). */
  debounceMs?: number;
  /** Show "Searching" only after this delay. Default 1000 ms (CNA-0090). */
  busyDelayMs?: number;
  /** Message when nothing matches (CNA-0340). Default "No matches found". */
  noMatchesText?: string;
  /** Rows visible before the list scrolls. Default 8. */
  visibleRows?: number;
  /** Accessible name of the list. Default "Options". */
  listLabel?: string;
  /**
   * Show a button inside the box that opens the full list. Default true for static options, false for
   * `loadOptions` (a drop-down button on a search field invites clicks before typing, CNA-0550).
   */
  showToggle?: boolean;
  /** Adds a hidden input with the chosen value for native form posts. */
  name?: string;
  /** Width in characters. Default: fill the column. */
  widthChars?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Marks the value invalid (FormField sets aria-invalid for you when it has an error). */
  invalid?: boolean;
  autoFocus?: boolean;
  /** Id of the text box (FormField passes it so its label reaches the input). */
  id?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
  className?: string;
}

const firstEnabled = (list: readonly FormOption[], from: number, step: 1 | -1) => {
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i;
  return -1;
};

/**
 * Text box with a popup list of options (ARIA 1.2 combobox, list autocomplete). Focus stays in the text box; the
 * highlighted option is announced through aria-activedescendant; the number of options is announced politely.
 * Text that does not match a chosen option is cleared when focus leaves, so the field never shows a value that was
 * not chosen [suggested].
 */
export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(props, ref) {
  const {
    options, loadOptions, filterOptions, recentOptions, recentLabel = 'Recent', value: valueProp, defaultValue = null, onChange, placeholder, minChars, debounceMs = 200, busyDelayMs = 1000,
    noMatchesText = 'No matches found', visibleRows = 8, listLabel = 'Options', showToggle, name, widthChars, disabled, readOnly, required,
    invalid, autoFocus, id, className,
  } = props;
  const inputId = useId('cui-combobox', id);
  const listId = `${inputId}-list`;
  const [value, setValue] = useControllableState<FormOption | null>(valueProp, defaultValue, onChange);
  const [text, setText] = React.useState(value?.label ?? '');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const [query, setQuery] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const isAsync = !!loadOptions;
  const s = useOptionSearch({ options, loadOptions, filter: filterOptions, minChars: minChars ?? (isAsync ? 2 : 0), debounceMs, busyDelayMs, noMatchesText });
  const recents = React.useMemo(() => (recentOptions ?? []).map((o) => ({ ...o, group: o.group ?? recentLabel })), [recentOptions, recentLabel]);
  const editable = !disabled && !readOnly;
  const toggle = showToggle ?? !isAsync;

  // Follow a value set from outside.
  const valueKey = value ? value.value : null;
  React.useEffect(() => {
    setText(value?.label ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey]);

  const showRecent = recents.length > 0 && !query.trim();
  const results = showRecent ? recents : s.results;
  const openList = (q: string, at: 'selected' | 'first' | 'last' | 'none') => {
    if (!editable) return;
    const searchable = s.search(q);
    setQuery(q);
    if (!searchable && !(recents.length && !q.trim())) return;
    setOpen(true);
    // -2 selected, -3 first, -4 last: resolved by the effect below once the results are known.
    setActive(at === 'none' ? -1 : -2 - ['selected', 'first', 'last'].indexOf(at));
  };

  // Resolve a pending starting row (-2 selected, -3 first, -4 last) once the results are known.
  React.useEffect(() => {
    if (!open || active > -2) return;
    if (!results.length) return;
    if (active === -2) {
      const i = value ? results.findIndex((o) => o.value === value.value) : -1;
      setActive(i >= 0 ? i : firstEnabled(results, 0, 1));
    } else if (active === -3) setActive(firstEnabled(results, 0, 1));
    else setActive(firstEnabled(results, results.length - 1, -1));
  }, [open, active, results, value]);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const choose = (o: FormOption) => {
    if (o.disabled) return;
    setValue(o);
    setText(o.label);
    close();
    s.cancel();
    s.setAnnouncement(`${o.label} selected`);
  };

  const commitOnLeave = () => {
    close();
    s.cancel();
    if (text === (value?.label ?? '')) return;
    const typed = foldFormText(text.trim());
    const pool = results.length ? results : options ?? [];
    const exact = typed ? pool.find((o) => !o.disabled && foldFormText(o.label) === typed) : undefined;
    if (exact) choose(exact);
    else {
      setText(value?.label ?? '');
      if (!typed && value) setValue(null);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editable) return;
    const count = results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return openList(isAsync ? text : value ? '' : text, e.altKey ? 'none' : 'selected');
      if (!e.altKey && count) setActive((a) => (a < 0 ? firstEnabled(results, 0, 1) : firstEnabled(results, a + 1, 1) === -1 ? a : firstEnabled(results, a + 1, 1)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openList(isAsync ? text : value ? '' : text, 'last');
      if (e.altKey) {
        if (active >= 0 && results[active]) choose(results[active]);
        else close();
        return;
      }
      if (count) setActive((a) => (a <= 0 ? a : firstEnabled(results, a - 1, -1) === -1 ? a : firstEnabled(results, a - 1, -1)));
      return;
    }
    if (e.key === 'Enter') {
      if (open && active >= 0 && results[active]) {
        e.preventDefault();
        choose(results[active]);
      }
      return;
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        close();
      } else if (text) {
        e.preventDefault();
        setText('');
        if (value) setValue(null);
      }
    }
  };

  const activeId = open && active >= 0 && results[active] ? optionDomId(listId, active) : undefined;
  const style = widthChars ? ({ '--cui-field-width': `calc(${widthChars}ch + var(--control-height) + var(--space-2) * 2)` } as React.CSSProperties) : undefined;
  const ariaInvalid = invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true' ? true : undefined;
  const ariaRequired = required || props['aria-required'] === true || props['aria-required'] === 'true' ? true : undefined;

  return (
    <div
      ref={rootRef}
      className={cx('cui-combobox', className)}
      data-cui-control=""
      onBlur={(e) => {
        if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
        commitOnLeave();
      }}
    >
      <span className={cx('cui-field-box', disabled && 'cui-field-box--disabled', readOnly && 'cui-field-box--readonly', invalid && 'cui-field-box--invalid')} style={style} data-cui-box="">
        <input
          ref={setRefs}
          id={inputId}
          type="text"
          role="combobox"
          className="cui-field-box__input"
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          disabled={disabled}
          readOnly={readOnly}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeId}
          aria-describedby={props['aria-describedby']}
          aria-labelledby={props['aria-labelledby']}
          aria-label={props['aria-label']}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          data-cui-boxed=""
          onChange={(e) => {
            const t = e.target.value;
            setText(t);
            if (value) setValue(null);
            openList(t, isAsync ? 'none' : t ? 'first' : 'none');
          }}
          onKeyDown={onKeyDown}
          onClick={() => {
            if (!open && !text && recents.length) openList('', 'none');
          }}
        />
        {toggle ? (
          <button
            type="button"
            tabIndex={-1}
            className="cui-field-box__button"
            aria-label={open ? 'Hide options' : 'Show options'}
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            disabled={!editable}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              inputRef.current?.focus();
              if (open) close();
              else openList('', 'selected');
            }}
          >
            <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
          </button>
        ) : null}
      </span>
      {open ? (
        <OptionList
          listId={listId}
          label={listLabel}
          options={results}
          activeIndex={active}
          selected={new Set(value ? [value.value] : [])}
          query={query}
          status={s.status}
          busy={s.busy}
          noMatchesText={noMatchesText}
          visibleRows={visibleRows}
          onPick={(i) => choose(results[i])}
          onHover={setActive}
        />
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">{s.announcement}</span>
      {name ? <input type="hidden" name={name} value={value?.value ?? ''} /> : null}
    </div>
  );
});
