import React from 'react';
import { Icon, cx, useControllableState, useId } from '../../core';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'type' | 'size'> {
  /** Controlled text. */
  value?: string;
  /** Initial text when uncontrolled. */
  defaultValue?: string;
  /** Called with the text on every change (for progressive filtering). */
  onChange?: (value: string) => void;
  /** Called on Enter with the text (for searches that run on request). */
  onSearch?: (value: string) => void;
  /** Called when the clear button or Escape empties the box. */
  onClear?: () => void;
  /** Name of the clear button. Default "Clear search". */
  clearLabel?: string;
  /** Width in characters. Default: fill the column. */
  widthChars?: number;
  className?: string;
}

/**
 * Search text box with a search icon and a clear button inside the box. Enter runs `onSearch`; Escape clears. Name it
 * with a FormField label, or `aria-label` when a visible heading already says what is searched [suggested].
 * For terminology use TerminologySearch; for patients use the patient search of the host.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value: valueProp, defaultValue = '', onChange, onSearch, onClear, clearLabel = 'Clear search', widthChars, className, id, disabled, readOnly, onKeyDown, ...rest },
  ref,
) {
  const inputId = useId('cui-search-input', id);
  const [value, setValue] = useControllableState<string>(valueProp, defaultValue, onChange);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setRefs = (el: HTMLInputElement | null) => {
    inputRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
  };
  const clear = () => {
    setValue('');
    onClear?.();
    inputRef.current?.focus();
  };
  const style = widthChars ? ({ '--cui-field-width': `calc(${widthChars}ch + 2 * var(--control-height))` } as React.CSSProperties) : undefined;
  const editable = !disabled && !readOnly;
  return (
    <span className={cx('cui-field-box', 'cui-search-input', disabled && 'cui-field-box--disabled', className)} style={style} data-cui-box="" data-cui-control="">
      <span className="cui-field-box__icon" aria-hidden="true">
        <Icon name="search" size={16} />
      </span>
      <input
        {...rest}
        ref={setRefs}
        id={inputId}
        type="search"
        className="cui-field-box__input cui-search-input__input"
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        data-cui-boxed=""
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            onSearch?.(value);
          } else if (e.key === 'Escape' && value && editable) {
            e.preventDefault();
            clear();
          }
        }}
      />
      {value && editable ? (
        <button type="button" className="cui-field-box__button cui-field-box__button--plain" aria-label={clearLabel} title={clearLabel} onClick={clear}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </span>
  );
});
