import React from 'react';
import { Icon } from '../../core';
import { isTestNhi, isValidNhi, nhiError, nhiFormat, normaliseNhi, TEST_NHI_WARNING } from '../utils/identifiers';
import { IdentifierTextInput } from '../PatientIdentifierInput/IdentifierTextInput';

export interface NhiInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size' | 'maxLength' | 'type'> {
  /** Visible label. Default "NHI number" (forms; banners use "NHI", G11 1.3). */
  label?: string;
  /** Hint. Default "7 characters, e.g. ZAC5361 or ZBN77VL". Pass "" for none. */
  hint?: string;
  /** Tooltip on the box. */
  tooltip?: string;
  /** Controlled value. Lower case and spaces are accepted and normalised to upper case when the field is left (G11 1.3). */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the text as shown and the normalised NHI (upper case, no spaces). */
  onChange?: (shown: string, nhi: string) => void;
  /** Empty is an error once the field is left. Default false. */
  required?: boolean;
  /** Warn "This is a test NHI number" for the Z range (HISO 10046). Turn off in test environments. Default true. */
  flagTestNumbers?: boolean;
  /** Error from the consumer, for example after an NHI search. Overrides built-in validation. */
  error?: string;
  /** Called when validity changes: either format with a correct check character. */
  onValidityChange?: (valid: boolean) => void;
  /**
   * Looks up a complete, valid NHI in the host's NHI service (the control makes no network calls). A dormant result shows
   * a warning that names the live NHI, with a "Use live NHI" button (HISO 10046 2.1.2, G12 4).
   */
  lookupNhi?: (nhi: string) => NhiLookupResult | Promise<NhiLookupResult>;
  /** Called when the user chooses "Use live NHI"; the box is then set to the live NHI. */
  onUseLiveNhi?: (liveNhi: string, dormantNhi: string) => void;
}

/** Result of the host's NHI lookup. */
export type NhiLookupResult = { status: 'live' } | { status: 'dormant'; liveNhi?: string | null } | { status: 'not-found' };

/**
 * National Health Index number input (G11 1.1-1.3). Accepts both formats, legacy AAANNNC (mod 11) and new AAANNAX
 * (mod 23), 7 characters, never grouped. I and O get their own message because users often type them for 1 and 0.
 * With `lookupNhi`, a dormant NHI is reported with its live NHI and a "Use live NHI" action (G12 4).
 */
export const NhiInput = React.forwardRef<HTMLInputElement, NhiInputProps>(function NhiInput(
  {
    label = 'NHI number',
    hint = '7 characters, e.g. ZAC5361 or ZBN77VL',
    tooltip = 'Enter the National Health Index (NHI) number',
    onChange,
    required = false,
    flagTestNumbers = true,
    lookupNhi,
    onUseLiveNhi,
    value,
    defaultValue = '',
    ...rest
  },
  ref,
) {
  const [own, setOwn] = React.useState(defaultValue);
  const shown = value ?? own;
  const nhi = normaliseNhi(shown);
  const [lookup, setLookup] = React.useState<{ nhi: string; result: NhiLookupResult | 'pending' } | null>(null);
  const lookupRef = React.useRef(lookupNhi);
  lookupRef.current = lookupNhi;
  const lookable = !!lookupNhi && nhi.length === 7 && isValidNhi(nhi);
  React.useEffect(() => {
    if (!lookable || !lookupRef.current) {
      setLookup(null);
      return;
    }
    let live = true;
    const r = lookupRef.current(nhi);
    if (r && typeof (r as Promise<NhiLookupResult>).then === 'function') {
      setLookup({ nhi, result: 'pending' });
      (r as Promise<NhiLookupResult>).then(
        (res) => live && setLookup({ nhi, result: res }),
        () => live && setLookup(null),
      );
    } else setLookup({ nhi, result: r as NhiLookupResult });
    return () => {
      live = false;
    };
  }, [nhi, lookable]);
  const current = lookup && lookup.nhi === nhi ? lookup.result : null;
  const applyLiveNhi = (liveNhi: string) => {
    setOwn(liveNhi);
    onChange?.(liveNhi, liveNhi);
    onUseLiveNhi?.(liveNhi, nhi);
  };
  const statusNode =
    current === 'pending' ? (
      <div className="cui-nhi-input__lookup" role="status">
        Checking the NHI...
      </div>
    ) : current && current.status === 'dormant' ? (
      <div className="cui-nhi-input__lookup cui-id-input__warning" role="status">
        <Icon name="warning" size={16} />
        <span>
          {current.liveNhi ? `This NHI is dormant. The live NHI is ${normaliseNhi(current.liveNhi)}.` : 'This NHI is dormant. The live NHI is not known.'}
        </span>
        {current.liveNhi ? (
          <button type="button" className="cui-nhi-input__use-live" onClick={() => applyLiveNhi(normaliseNhi(current.liveNhi))}>
            Use live NHI
          </button>
        ) : null}
      </div>
    ) : current && current.status === 'not-found' ? (
      <div className="cui-nhi-input__lookup cui-id-input__warning" role="status">
        <Icon name="warning" size={16} />
        <span>No NHI record was found for this number.</span>
      </div>
    ) : null;
  const input = (
    <IdentifierTextInput
      {...rest}
      value={shown}
      ref={ref}
      blockClass="cui-nhi-input"
      label={label}
      hint={hint || undefined}
      tooltip={tooltip}
      required={required}
      widthCh={8}
      sanitise={(raw) => {
        const kept = raw.replace(/[^A-Za-z0-9]/g, '');
        const shown = kept.slice(0, 7);
        return {
          display: shown,
          normalised: normaliseNhi(shown),
          note: /[^A-Za-z0-9\s]/.test(raw) ? 'Only letters and numbers can be entered in an NHI number.' : kept.length > 7 ? 'An NHI number has 7 characters.' : undefined,
        };
      }}
      normaliseOnBlur={(shown) => normaliseNhi(shown)}
      validate={(nhi) => nhiError(nhi, { required })}
      warn={(nhi) => (flagTestNumbers && nhiFormat(nhi) && isTestNhi(nhi) ? TEST_NHI_WARNING : null)}
      isComplete={(nhi) => nhi.length === 7}
      onChange={(display, normalised) => {
        setOwn(display);
        onChange?.(display, normalised);
      }}
    />
  );
  if (!lookupNhi) return input;
  return (
    <div className="cui-nhi-input-group">
      {input}
      {statusNode}
    </div>
  );
});
