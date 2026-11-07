import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';
import type { FormOption } from '../utils/formOptions';
import { OptionList, optionDomId } from '../internal/OptionList';
import { useOptionSearch, type FormOptionLoader } from '../internal/useOptionSearch';

export interface MultiSelectProps {
  /** Static options in a logical order (CNA-1890), filtered as the user types. Give this or `loadOptions`. */
  options?: readonly FormOption[];
  /** Asynchronous options for the typed text; out-of-order responses are ignored. */
  loadOptions?: FormOptionLoader;
  /** Chosen options (controlled), in the order chosen. */
  value?: FormOption[];
  /** Initial options when uncontrolled. Default none. */
  defaultValue?: FormOption[];
  /** Called with the new list after each change. */
  onChange?: (options: FormOption[]) => void;
  /** In-field prompt while nothing is chosen (CNA-2130). */
  placeholder?: string;
  /** Characters typed before options load. Default 0 for static options, 2 for `loadOptions`. */
  minChars?: number;
  debounceMs?: number;
  busyDelayMs?: number;
  /** Default "No matches found" (CNA-0340). */
  noMatchesText?: string;
  /** Rows visible before the list scrolls. Default 8. */
  visibleRows?: number;
  /** Accessible name of the list. Default "Options". */
  listLabel?: string;
  /** Adds one hidden input per chosen value for native form posts. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Id of the text box (FormField passes it so its label reaches the input). */
  id?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
  className?: string;
}

const nextEnabled = (list: readonly FormOption[], from: number, step: 1 | -1) => {
  for (let i = from; i >= 0 && i < list.length; i += step) if (!list[i].disabled) return i;
  return -1;
};

/**
 * Several choices from a list: chosen options show as chips inside the box, a text box filters a multi-select
 * popup list (ARIA 1.2 combobox with aria-multiselectable listbox). Enter or a click toggles an option and the list
 * stays open; Backspace in the empty text box removes the last chip. Changes are announced politely [suggested].
 */
export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(function MultiSelect(props, ref) {
  const {
    options, loadOptions, value: valueProp, defaultValue = [], onChange, placeholder, minChars, debounceMs = 200, busyDelayMs = 1000,
    noMatchesText = 'No matches found', visibleRows = 8, listLabel = 'Options', name, disabled, readOnly, required, invalid, id, className,
  } = props;
  const inputId = useId('cui-multi-select', id);
  const listId = `${inputId}-list`;
  const summaryId = `${inputId}-summary`;
  const [value, setValue] = useControllableState<FormOption[]>(valueProp, defaultValue, onChange);
  const [text, setText] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const isAsync = !!loadOptions;
  const s = useOptionSearch({ options, loadOptions, minChars: minChars ?? (isAsync ? 2 : 0), debounceMs, busyDelayMs, noMatchesText });
  const results = s.results;
  const editable = !disabled && !readOnly;
  const chosen = new Set(value.map((o) => o.value));

  const openList = (q: string) => {
    if (!editable) return;
    if (!s.search(q)) return;
    setOpen(true);
    setActive(-1);
  };
  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const toggle = (o: FormOption) => {
    if (o.disabled || !editable) return;
    if (chosen.has(o.value)) {
      setValue(value.filter((v) => v.value !== o.value));
      s.setAnnouncement(`${o.label} removed. ${value.length - 1} selected`);
    } else {
      setValue([...value, o]);
      s.setAnnouncement(`${o.label} added. ${value.length + 1} selected`);
    }
  };
  const remove = (o: FormOption) => {
    if (!editable) return;
    setValue(value.filter((v) => v.value !== o.value));
    s.setAnnouncement(`${o.label} removed. ${value.length - 1} selected`);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editable) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) return openList(text);
      if (!e.altKey) setActive((a) => { const n = nextEnabled(results, a + 1, 1); return n === -1 ? a : n; });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) setActive((a) => { const n = nextEnabled(results, a - 1, -1); return n === -1 ? a : n; });
      return;
    }
    if (e.key === 'Enter') {
      if (open && active >= 0 && results[active]) {
        e.preventDefault();
        toggle(results[active]);
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
      }
      return;
    }
    if (e.key === 'Backspace' && !text && value.length) {
      e.preventDefault();
      const last = value[value.length - 1];
      setValue(value.slice(0, -1));
      s.setAnnouncement(`${last.label} removed. ${value.length - 1} selected`);
    }
  };

  const activeId = open && active >= 0 && results[active] ? optionDomId(listId, active) : undefined;
  const describedBy = [props['aria-describedby'], summaryId].filter(Boolean).join(' ');
  const ariaInvalid = invalid || props['aria-invalid'] === true || props['aria-invalid'] === 'true' ? true : undefined;
  const ariaRequired = required || props['aria-required'] === true || props['aria-required'] === 'true' ? true : undefined;

  return (
    <div
      ref={rootRef}
      className={cx('cui-multi-select', className)}
      data-cui-control=""
      data-multiline=""
      onBlur={(e) => {
        if (rootRef.current?.contains(e.relatedTarget as Node | null)) return;
        close();
        s.cancel();
        setText('');
      }}
    >
      <div
        className={cx('cui-field-box', 'cui-multi-select__box', disabled && 'cui-field-box--disabled', readOnly && 'cui-field-box--readonly', invalid && 'cui-field-box--invalid')}
        data-cui-box=""
        onMouseDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('cui-multi-select__values')) {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        <div className="cui-multi-select__values">
        {value.length ? (
          <ul className="cui-multi-select__chips" aria-hidden="true">
            {value.map((o) => (
              <li key={o.value} className="cui-multi-select__chip">
                <span className="cui-multi-select__chip-label" lang={o.lang}>{o.label}</span>
                {editable ? (
                  <button
                    type="button"
                    tabIndex={-1}
                    className="cui-multi-select__chip-remove"
                    aria-label={`Remove ${o.label}`}
                    title={`Remove ${o.label}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => remove(o)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <input
          ref={setRefs}
          id={inputId}
          type="text"
          role="combobox"
          className="cui-field-box__input cui-multi-select__input"
          value={text}
          placeholder={value.length ? undefined : placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={readOnly}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeId}
          aria-describedby={describedBy}
          aria-labelledby={props['aria-labelledby']}
          aria-label={props['aria-label']}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          data-cui-boxed=""
          onChange={(e) => {
            setText(e.target.value);
            openList(e.target.value);
          }}
          onClick={() => !open && openList(text)}
          onKeyDown={onKeyDown}
        />
        </div>
        <button
          type="button"
          tabIndex={-1}
          className="cui-field-box__button cui-multi-select__toggle"
          aria-label={open ? 'Hide options' : 'Show options'}
          aria-expanded={open}
          disabled={!editable}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            inputRef.current?.focus();
            if (open) close();
            else openList('');
          }}
        >
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
        </button>
      </div>
      <span id={summaryId} className="cui-visually-hidden">
        {value.length ? `${value.length} selected: ${value.map((o) => o.label).join(', ')}.` : 'None selected.'}
      </span>
      {open ? (
        <OptionList
          listId={listId}
          label={listLabel}
          options={results}
          activeIndex={active}
          selected={chosen}
          multiselectable
          query={text}
          status={s.status}
          busy={s.busy}
          noMatchesText={noMatchesText}
          visibleRows={visibleRows}
          onPick={(i) => toggle(results[i])}
          onHover={setActive}
        />
      ) : null}
      <span className="cui-visually-hidden" aria-live="polite">{s.announcement}</span>
      {name ? value.map((o) => <input key={o.value} type="hidden" name={name} value={o.value} />) : null}
    </div>
  );
});
