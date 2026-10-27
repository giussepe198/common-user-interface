import React from 'react';
import { useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { formatHpiNumber, isValidHpiI, isValidHpiO, nzHpiFormat } from '../utils/identifiers';
import { HPI_I_PREFIX, HPI_O_PREFIX } from '../utils/regions/identifiers';
import type { NzHpiIdentifierType } from '../utils/regions/identifiers';
import { IdentifierDisplayBase } from '../PatientIdentifierDisplay/IdentifierDisplayBase';
import type { IdentifierFlag } from '../PatientIdentifierDisplay/IdentifierDisplayBase';

/** AU: HPI-I (practitioner) and HPI-O (organisation). NZ: CPN, organisation, facility, practitioner role. */
export type HpiIdentifierType = 'hpi-i' | 'hpi-o' | NzHpiIdentifierType;

/** Default labels [suggested wording]. */
export const HPI_IDENTIFIER_LABELS: Record<HpiIdentifierType, string> = {
  'hpi-i': 'HPI-I',
  'hpi-o': 'HPI-O',
  cpn: 'HPI CPN',
  organisation: 'HPI organisation',
  facility: 'HPI facility',
  'practitioner-role': 'HPI practitioner role',
};

export interface HpiNumberDisplayProps {
  /** The identifier. AU HPI-I/HPI-O: 16 digits shown 4-4-4-4. NZ: shown as issued, upper case, with the hyphen before the check character (G11 1.5). */
  value: string | null | undefined;
  /** Identifier type. When omitted it is inferred: AU from the 800361/800362 prefix, NZ from the published format. */
  type?: HpiIdentifierType;
  /** Region used to infer the type. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Label. Default per type ("HPI-I", "HPI-O", "HPI CPN" ...). Pass "" for none. */
  label?: string;
  /** Definition for the label tooltip. */
  definition?: string;
  /** Text when no identifier is held. Default "Not Known". */
  unknownText?: string;
  /** Flag a value that fails the check: AU prefix and Luhn; NZ format only (the check character algorithm is not published). Default true. */
  flagInvalid?: boolean;
  className?: string;
}

function inferType(raw: string, region: ClinicalRegion): HpiIdentifierType | undefined {
  const d = raw.replace(/\s+/g, '');
  if (region !== 'NZ' && /^\d{16}$/.test(d)) return d.startsWith(HPI_O_PREFIX) ? 'hpi-o' : d.startsWith(HPI_I_PREFIX) ? 'hpi-i' : undefined;
  return nzHpiFormat(raw) ?? undefined;
}

/** Health provider identifier display: AU HPI-I and HPI-O (G10 1.2); NZ HPI CPN, organisation, facility and practitioner role IDs (G11 1.5). */
export function HpiNumberDisplay({
  value,
  type: typeProp,
  region: regionProp,
  label,
  definition,
  unknownText,
  flagInvalid = true,
  className,
}: HpiNumberDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const raw = (value ?? '').trim();
  const type = typeProp ?? inferType(raw, region) ?? (region === 'NZ' ? 'cpn' : 'hpi-i');
  let valid: boolean;
  let formatted: string | null;
  if (type === 'hpi-i' || type === 'hpi-o') {
    valid = type === 'hpi-i' ? isValidHpiI(raw) : isValidHpiO(raw);
    formatted = valid ? formatHpiNumber(raw) : null;
  } else {
    valid = nzHpiFormat(raw) === type;
    formatted = valid ? raw.toUpperCase() : null;
  }
  const flags: IdentifierFlag[] = raw && flagInvalid && !valid ? [{ text: `not a valid ${HPI_IDENTIFIER_LABELS[type]}`, tone: 'warning' }] : [];
  return (
    <IdentifierDisplayBase
      kind="hpi"
      raw={raw}
      formatted={formatted}
      flags={flags}
      label={label === undefined ? HPI_IDENTIFIER_LABELS[type] : label || undefined}
      definition={definition}
      unknownText={unknownText}
      className={className}
    />
  );
}
