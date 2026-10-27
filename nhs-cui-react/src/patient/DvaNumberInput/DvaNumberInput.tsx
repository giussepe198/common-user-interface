import React from 'react';
import { useControllableState, useId } from '../../core';
import { dvaNumberWarning, isValidDvaNumber, normaliseDvaNumber } from '../utils/identifiers';
import { DVA_CARD_TYPES } from '../utils/regions/identifiers';
import { IdentifierTextInput } from '../PatientIdentifierInput/IdentifierTextInput';

export interface DvaNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'type'> {
  /** Label. Default "DVA file number". */
  label?: string;
  /** Hint. Default "As on the Veteran Card, e.g. NBUR9080". Pass "" for none. */
  hint?: string;
  /** Controlled value; shown upper case without spaces, exactly as on the card (G10 1.4). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the normalised value (upper case, no spaces). */
  onChange?: (value: string) => void;
  /** Show the card type select (Gold, White, Orange), recorded as text (G10 1.4). Default true. */
  showCardType?: boolean;
  /** Controlled card type. */
  cardType?: string;
  /** Uncontrolled initial card type. */
  defaultCardType?: string;
  /** Called when the card type changes. */
  onCardTypeChange?: (cardType: string) => void;
  /** Empty is an error once the field is left. Default false. */
  required?: boolean;
  /** Error from the consumer. */
  error?: string;
  /** Called when the value has the expected (advisory) shape or not. */
  onValidityChange?: (valid: boolean) => void;
}

/**
 * Department of Veterans' Affairs file number (G10 1.4). Upper case, no spaces, at most 9 characters. The format check is
 * advisory ([UNCERTAIN] war code and padding vary), so it gives a warning, not an error (AU-X-03).
 */
export const DvaNumberInput = React.forwardRef<HTMLInputElement, DvaNumberInputProps>(function DvaNumberInput(
  {
    label = 'DVA file number',
    hint = 'As on the Veteran Card, e.g. NBUR9080',
    onChange,
    showCardType = true,
    cardType,
    defaultCardType = '',
    onCardTypeChange,
    required = false,
    id: idProp,
    disabled,
    ...rest
  },
  ref,
) {
  const id = useId('cui-dva', idProp);
  const [card, setCard] = useControllableState<string>(cardType, defaultCardType, onCardTypeChange);
  return (
    <IdentifierTextInput
      {...rest}
      ref={ref}
      id={id}
      blockClass="cui-dva-input"
      label={label}
      hint={hint || undefined}
      disabled={disabled}
      required={required}
      widthCh={10}
      sanitise={(raw) => {
        const v = normaliseDvaNumber(raw).replace(/[^A-Z0-9]/g, '');
        return { display: v.slice(0, 9), normalised: v.slice(0, 9), note: v.length > 9 ? 'A DVA file number has at most 9 characters.' : undefined };
      }}
      validate={(v) => (!v && required ? 'Enter the DVA file number' : null)}
      warn={dvaNumberWarning}
      isComplete={isValidDvaNumber}
      onChange={(_, v) => onChange?.(v)}
      after={
        showCardType ? (
          <>
            <label className="cui-visually-hidden" htmlFor={`${id}-card`}>
              Card type
            </label>
            <select
              id={`${id}-card`}
              className="cui-id-input__select"
              value={card}
              disabled={disabled}
              onChange={(e) => setCard(e.target.value)}
            >
              <option value="">Card type</option>
              {DVA_CARD_TYPES.map((c) => (
                <option key={c} value={c}>
                  {`${c} card`}
                </option>
              ))}
            </select>
          </>
        ) : null
      }
    />
  );
});
