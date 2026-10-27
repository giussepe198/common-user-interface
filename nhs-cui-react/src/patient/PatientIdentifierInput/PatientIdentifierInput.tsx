import React from 'react';
import { useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { PATIENT_IDENTIFIER_FORM_LABELS, PRIMARY_IDENTIFIER_ORDER } from '../utils/regions/identifiers';
import type { PatientIdentifierType } from '../utils/regions/identifiers';
import { NhsNumberInput } from '../NhsNumberInput/NhsNumberInput';
import { IhiInput } from '../IhiInput/IhiInput';
import { MedicareNumberInput } from '../MedicareNumberInput/MedicareNumberInput';
import { DvaNumberInput } from '../DvaNumberInput/DvaNumberInput';
import { NhiInput } from '../NhiInput/NhiInput';
import type { NhiLookupResult } from '../NhiInput/NhiInput';
import { MRN_LABELS } from '../PatientIdentifierDisplay/PatientIdentifierDisplay';
import { IdentifierTextInput } from './IdentifierTextInput';

export interface PatientIdentifierInputProps {
  /** Identifier to enter. Default: the region's primary identifier (GB NHS Number, AU IHI, NZ NHI). */
  type?: PatientIdentifierType;
  /** Region. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Label. Default per type ("NHS Number", "IHI", "URN", "Medicare card number", "DVA file number", "NHI number"). */
  label?: string;
  /** Hint; "" for none. Default per control. */
  hint?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with the value as shown and the normalised value (digits, or upper case for NHI and DVA). */
  onChange?: (shown: string, normalised: string) => void;
  /** Empty is an error once the field is left. Default false. */
  required?: boolean;
  /** Error from the consumer; overrides built-in validation. */
  error?: string;
  /** Called when built-in validity changes. */
  onValidityChange?: (valid: boolean) => void;
  /** Medicare only: controlled IRN, initial IRN and change handler (AU-ID-03). */
  irn?: string;
  defaultIrn?: string;
  onIrnChange?: (irn: string) => void;
  /** Medicare only: label for the IRN box. Default "IRN". */
  irnLabel?: string;
  /** Medicare only: IRN required whenever a number is entered (AU-ID-03). Default true. */
  irnRequired?: boolean;
  /**
   * Medicare only: show the "Valid to" box (G12 1). Default: shown when `validTo`, `defaultValidTo` or
   * `onValidToChange` is supplied.
   */
  showValidTo?: boolean;
  /** Medicare only: controlled valid to date, "MM/YYYY" (G12 1). */
  validTo?: string;
  /** Medicare only: uncontrolled initial valid to date. */
  defaultValidTo?: string;
  /** Medicare only: called with the text in the valid to box and the normalised "MM/YYYY". */
  onValidToChange?: (text: string, normalised: string) => void;
  /** Medicare only: the valid to date is required whenever a number is entered. Default false. */
  validToRequired?: boolean;
  /** Medicare only: warn when the card expires within this many months. Default 1 [suggested]. */
  expiringWithinMonths?: number;
  /** Medicare only: "today" for the expiry check. Default now. */
  now?: DateLike;
  /** NHI only: look up a complete, valid NHI in the host's NHI service; a dormant result offers "Use live NHI" (G12 4). */
  lookupNhi?: (nhi: string) => NhiLookupResult | Promise<NhiLookupResult>;
  /** NHI only: called when the user chooses "Use live NHI". */
  onUseLiveNhi?: (liveNhi: string, dormantNhi: string) => void;
  /** MRN only: local format check (AU-ID-04: format is organisation-configurable). */
  mrnPattern?: RegExp;
  /** MRN only: message when `mrnPattern` does not match. Default "Check the record number format". */
  mrnPatternMessage?: string;
  /** NZ only: warn for Z-range test NHIs. Default true. */
  flagTestNumbers?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Picks the identifier control for the region and identifier type: NhsNumberInput, IhiInput, MedicareNumberInput,
 * DvaNumberInput, NhiInput, or a free-text local record number (URN/MRN) with an optional local pattern.
 */
export function PatientIdentifierInput({
  type: typeProp,
  region: regionProp,
  label,
  hint,
  value,
  defaultValue,
  onChange,
  required,
  error,
  onValidityChange,
  irn,
  defaultIrn,
  onIrnChange,
  irnLabel,
  irnRequired,
  showValidTo,
  validTo,
  defaultValidTo,
  onValidToChange,
  validToRequired,
  expiringWithinMonths,
  now,
  lookupNhi,
  onUseLiveNhi,
  mrnPattern,
  mrnPatternMessage = 'Check the record number format',
  flagTestNumbers,
  disabled,
  id,
  className,
}: PatientIdentifierInputProps) {
  const { region } = useClinicalLocale(regionProp);
  const type = typeProp ?? PRIMARY_IDENTIFIER_ORDER[region][0];
  const common = { id, className, disabled, required, error, onValidityChange, value, defaultValue };
  const withHint = hint === undefined ? {} : { hint };
  switch (type) {
    case 'nhs':
      return <NhsNumberInput {...common} {...withHint} label={label ?? PATIENT_IDENTIFIER_FORM_LABELS.nhs} onChange={onChange} />;
    case 'ihi':
      return <IhiInput {...common} {...withHint} label={label ?? PATIENT_IDENTIFIER_FORM_LABELS.ihi} onChange={onChange} />;
    case 'medicare':
      return (
        <MedicareNumberInput
          {...common}
          {...withHint}
          label={label ?? PATIENT_IDENTIFIER_FORM_LABELS.medicare}
          onChange={onChange}
          irn={irn}
          defaultIrn={defaultIrn}
          onIrnChange={onIrnChange}
          irnLabel={irnLabel}
          irnRequired={irnRequired}
          showValidTo={showValidTo}
          validTo={validTo}
          defaultValidTo={defaultValidTo}
          onValidToChange={onValidToChange}
          validToRequired={validToRequired}
          expiringWithinMonths={expiringWithinMonths}
          now={now}
        />
      );
    case 'dva':
      return <DvaNumberInput {...common} {...withHint} label={label ?? PATIENT_IDENTIFIER_FORM_LABELS.dva} onChange={(v) => onChange?.(v, v)} />;
    case 'nhi':
      return (
        <NhiInput
          {...common}
          {...withHint}
          label={label ?? PATIENT_IDENTIFIER_FORM_LABELS.nhi}
          onChange={onChange}
          flagTestNumbers={flagTestNumbers}
          lookupNhi={lookupNhi}
          onUseLiveNhi={onUseLiveNhi}
        />
      );
    default:
      return (
        <IdentifierTextInput
          {...common}
          blockClass="cui-mrn-input"
          label={label ?? MRN_LABELS[region]}
          hint={hint || undefined}
          widthCh={14}
          sanitise={(raw) => ({ display: raw, normalised: raw.trim() })}
          normaliseOnBlur={(shown) => shown.trim()}
          validate={(v) => (!v ? (required ? `Enter the ${label ?? MRN_LABELS[region]}` : null) : mrnPattern && !mrnPattern.test(v) ? mrnPatternMessage : null)}
          isComplete={(v) => v.length > 0}
          onChange={onChange}
        />
      );
  }
}
