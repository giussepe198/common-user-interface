import React from 'react';
import { cx, Icon, useControllableState, useId } from '../../core';
import { HISO_PROTECTION_FLAGS, PROTECTED_INDICATOR_TEXT, PROTECTION_FLAG_HINT } from '../utils/regions/protection';
import type { ProtectedItemKind } from '../utils/regions/protection';

export interface ProtectionFlagInputProps {
  /** Which HISO 10046 flag: "name" (2.2.7 name protection flag), "address" (3.9 address protected flag) or "contact" (5.4). */
  kind: ProtectedItemKind;
  /** Controlled flag: true = 1 (protected), false = 0 (not protected). */
  checked?: boolean;
  /** Uncontrolled initial flag. Default false: the HISO 10046 default is 0. */
  defaultChecked?: boolean;
  /** Called with the flag and its HISO code ("1" protected, "0" not protected). */
  onChange?: (protectedFlag: boolean, code: '1' | '0') => void;
  /** Visible label. Default "Name protected", "Address protected" or "Contact details protected". */
  label?: string;
  /** Hint. Default: when to set the flag (HISO 10046: "if the person indicates they have a reason to not share"). Pass "" for none. */
  hint?: string;
  /** Show the HISO field name and stored code below the box. Default true. */
  showCode?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Checkbox for a HISO 10046:2024 protection flag (name, address or contact details "held 'in confidence'"; G12 3).
 * Default off (0). The stored code is shown in text so the recorded value is never implied by colour or position.
 */
export function ProtectionFlagInput({
  kind,
  checked,
  defaultChecked = false,
  onChange,
  label,
  hint,
  showCode = true,
  disabled,
  id: idProp,
  className,
}: ProtectionFlagInputProps) {
  const id = useId('cui-protection-flag', idProp);
  const [on, setOn] = useControllableState<boolean>(checked, defaultChecked, undefined);
  const flag = HISO_PROTECTION_FLAGS[kind];
  const hintText = hint ?? PROTECTION_FLAG_HINT[kind];
  const hintId = `${id}-hint`;
  const codeId = `${id}-code`;
  return (
    <div className={cx('cui-protection-flag', on && 'cui-protection-flag--on', className)}>
      <div className="cui-protection-flag__row">
        <input
          type="checkbox"
          id={id}
          checked={on}
          disabled={disabled}
          aria-describedby={cx(hintText && hintId, showCode && codeId) || undefined}
          onChange={(e) => {
            setOn(e.target.checked);
            onChange?.(e.target.checked, e.target.checked ? '1' : '0');
          }}
        />
        <label htmlFor={id} className="cui-protection-flag__label">
          {on ? <Icon name="lock" size={16} /> : null}
          {label ?? PROTECTED_INDICATOR_TEXT[kind]}
        </label>
      </div>
      {hintText ? (
        <div id={hintId} className="cui-protection-flag__hint">
          {hintText}
        </div>
      ) : null}
      {showCode ? (
        <div id={codeId} className="cui-protection-flag__code" title={flag.definition}>
          {`${flag.label}: ${on ? `1 (${flag.yes})` : `0 (${flag.no})`}`}
        </div>
      ) : null}
    </div>
  );
}
