import React from 'react';
import { useClinicalLocale } from '../../core';
import type { ClinicalRegion, DateLike } from '../../core';
import { isValidDvaNumber, normaliseDvaNumber } from '../utils/identifiers';
import { PATIENT_IDENTIFIER_DEFINITIONS, PATIENT_IDENTIFIER_LABELS } from '../utils/regions/identifiers';
import type { IhiNumberStatus, IhiRecordStatus, PatientIdentifierType } from '../utils/regions/identifiers';
import { NhsNumberDisplay } from '../NhsNumberDisplay/NhsNumberDisplay';
import { IhiDisplay } from '../IhiDisplay/IhiDisplay';
import { MedicareNumberDisplay } from '../MedicareNumberDisplay/MedicareNumberDisplay';
import { NhiDisplay } from '../NhiDisplay/NhiDisplay';
import { IdentifierDisplayBase } from './IdentifierDisplayBase';
import type { IdentifierFlag } from './IdentifierDisplayBase';

/** One patient identifier as held in the record. */
export interface PatientIdentifier {
  type: PatientIdentifierType;
  value: string;
  /** Overrides the label, e.g. "UR number" or "MRN" for an AU `mrn` (AU-ID-04). */
  label?: string;
  /** Medicare: Individual Reference Number (AU-ID-03). */
  irn?: string;
  /** IHI number status (AU-ID-01). */
  ihiNumberStatus?: IhiNumberStatus;
  /** IHI record status (AU-ID-01). */
  ihiRecordStatus?: IhiRecordStatus;
  /** DVA card type, e.g. "Gold", shown as text (G10 1.4). */
  dvaCardType?: string;
  /** Medicare: card valid to month "MM/YYYY"; expired or expiring cards are flagged in text (G12 1). */
  medicareValidTo?: string;
  /** NZ NHI: "live" (default) or "dormant" (HISO 10046 2.1.2). */
  nhiStatus?: 'live' | 'dormant';
  /** NZ NHI: the live NHI a dormant NHI is linked to. */
  liveNhi?: string;
}

/** Default label for a local record number per region: AU "URN" (NIMC, AU-ID-04); GB and NZ "MRN" [suggested]. */
export const MRN_LABELS: Record<ClinicalRegion, string> = { GB: 'MRN', AU: 'URN', NZ: 'MRN' };

export interface PatientIdentifierDisplayProps extends Partial<Omit<PatientIdentifier, 'type' | 'value'>> {
  /** Identifier type; picks the display rules (NHS 3-3-4, IHI 4-4-4-4, Medicare 4-5-1 with IRN, DVA as on the card, NHI ungrouped). */
  type: PatientIdentifierType;
  /** The identifier. Missing shows `unknownText` after the label. */
  value: string | null | undefined;
  /** Region for the default `mrn` label. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Show the label. Never show an unlabelled number in a banner (G10 1.6). Default true. */
  showLabel?: boolean;
  /** Definition for the label tooltip (PAB-0047). Default per type. */
  definition?: string;
  /** Text when the value is missing. Default "Not Known". */
  unknownText?: string;
  /** Flag invalid values in text. Default true. */
  flagInvalid?: boolean;
  /** NZ: flag Z-range test NHIs. Default true. */
  flagTestNumbers?: boolean;
  /** Makes the value a button that opens the record (PAB-0048). */
  onOpenRecord?: () => void;
  /** NZ: shows "Use live NHI" after a dormant NHI with a known live NHI (G12 4). */
  onUseLiveNhi?: (liveNhi: string) => void;
  /** "Today" for the Medicare card expiry check. Default: now. */
  now?: DateLike;
  className?: string;
}

/** Label for an identifier: its own label, else the region's MRN label for `mrn`, else the standard label. */
export function patientIdentifierLabel(type: PatientIdentifierType, region: ClinicalRegion, label?: string): string {
  if (label) return label;
  return type === 'mrn' ? MRN_LABELS[region] : PATIENT_IDENTIFIER_LABELS[type];
}

/** Labelled patient identifier that picks the right display rules for its type (G1 NUM, G10 section 1, G11 section 1). */
export function PatientIdentifierDisplay({
  type,
  value,
  region: regionProp,
  label,
  showLabel = true,
  definition,
  unknownText,
  flagInvalid = true,
  flagTestNumbers = true,
  irn,
  ihiNumberStatus,
  ihiRecordStatus,
  dvaCardType,
  medicareValidTo,
  nhiStatus,
  liveNhi,
  onOpenRecord,
  onUseLiveNhi,
  now,
  className,
}: PatientIdentifierDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const shownLabel = showLabel ? patientIdentifierLabel(type, region, label) : undefined;
  const def = showLabel ? definition ?? PATIENT_IDENTIFIER_DEFINITIONS[type] : undefined;
  const common = { label: shownLabel, definition: def, unknownText, onOpenRecord, className };
  switch (type) {
    case 'nhs':
      return <NhsNumberDisplay {...common} value={value} flagInvalid={flagInvalid} />;
    case 'ihi':
      return <IhiDisplay {...common} value={value} numberStatus={ihiNumberStatus} recordStatus={ihiRecordStatus} flagInvalid={flagInvalid} />;
    case 'medicare':
      return <MedicareNumberDisplay {...common} value={value} irn={irn} flagInvalid={flagInvalid} validTo={medicareValidTo} now={now} />;
    case 'nhi':
      return (
        <NhiDisplay
          {...common}
          value={value}
          flagInvalid={flagInvalid}
          flagTestNumbers={flagTestNumbers}
          status={nhiStatus}
          liveNhi={liveNhi}
          onUseLiveNhi={onUseLiveNhi}
        />
      );
    case 'dva': {
      const raw = (value ?? '').trim();
      const v = normaliseDvaNumber(raw);
      const flags: IdentifierFlag[] = [];
      if (raw && flagInvalid && !isValidDvaNumber(v)) flags.push({ text: 'check DVA number', tone: 'warning' });
      return (
        <IdentifierDisplayBase {...common} kind="dva" raw={raw} formatted={v} flags={flags} suffix={raw && dvaCardType ? `${dvaCardType} card` : undefined} />
      );
    }
    default: {
      const raw = (value ?? '').trim();
      return <IdentifierDisplayBase {...common} kind="mrn" raw={raw} formatted={raw} />;
    }
  }
}
