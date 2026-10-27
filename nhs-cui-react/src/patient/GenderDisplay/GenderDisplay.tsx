import React from 'react';
import { cx, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import {
  CURRENT_GENDER_DEFINITIONS,
  CURRENT_GENDER_VALUES,
  PATIENT_UNKNOWN_TEXT,
  SEX_DEFINITIONS,
  SEX_VALUES,
} from '../utils/patient';
import type { CurrentGenderValue, SexValue } from '../utils/patient';
import {
  AU_GENDER_VALUES,
  AU_SEX_AT_BIRTH_VALUES,
  AU_SEX_GENDER_QUESTIONS,
  NZ_GENDER_VALUES,
  NZ_SEX_AT_BIRTH_VALUES,
  NZ_SEX_GENDER_QUESTIONS,
} from '../utils/regions/demographics';
import type { PatientCodedValue } from '../utils/regions/demographics';
import { BANNER_GENDER_DEFINITIONS } from '../utils/regions/banner';
import { LabelledValue } from '../LabelledValue/LabelledValue';
import { DefinitionTip } from '../LabelledValue/DefinitionTip';

/** Value sets, labels and definitions for AU and NZ sex and gender (G10 4.1-4.2, G11 3.1-3.2). */
export const REGIONAL_SEX_GENDER: Record<
  'AU' | 'NZ',
  Record<'currentGender' | 'sex', { values: ReadonlyArray<PatientCodedValue>; label: string; definition: string }>
> = {
  AU: {
    currentGender: { values: AU_GENDER_VALUES, label: 'Gender', definition: AU_SEX_GENDER_QUESTIONS.genderNote },
    sex: { values: AU_SEX_AT_BIRTH_VALUES, label: 'Sex recorded at birth', definition: AU_SEX_GENDER_QUESTIONS.sexDefinition },
  },
  NZ: {
    currentGender: { values: NZ_GENDER_VALUES, label: 'Gender', definition: BANNER_GENDER_DEFINITIONS.NZ },
    sex: { values: NZ_SEX_AT_BIRTH_VALUES, label: 'Sex at birth', definition: `Sex at birth ${NZ_SEX_GENDER_QUESTIONS.sexNote}` },
  },
};

/** Finds a coded value by code or alternative code (for example METeOR "M" for code 1). Case-insensitive. */
export function findSexGenderValue(values: ReadonlyArray<PatientCodedValue>, value: string | null | undefined): PatientCodedValue | undefined {
  const v = (value ?? '').trim().toUpperCase();
  if (!v) return undefined;
  return values.find((x) => x.code.toUpperCase() === v || x.altCode?.toUpperCase() === v);
}

export interface GenderDisplayProps {
  /** Which concept to show: "currentGender" (self-assigned) or "sex" (GB as registered; AU sex recorded at birth; NZ sex at birth). Default "currentGender". */
  kind?: 'currentGender' | 'sex';
  /**
   * GB: the value in full text only (CGS-0005, CGS-0012); codes such as "1" or "M" are never shown (CGS-0006, CGS-0014).
   * AU: METeOR code ("1".."5", "9") or letter code ("M", "F", "X", "T", "Z"). NZ: HISO 10046 gender code F, M, O, U, or Stats NZ sex code 1, 2.
   * AU and NZ codes are shown as their full label, never as the code (AU-SG-01). Unrecognised values show `unknownText`.
   */
  value: CurrentGenderValue | SexValue | string | null | undefined;
  /** The person's own words for "different term" / "another gender" (ABS 2020; HISO 10046 gender detail), shown in brackets. */
  detail?: string | null;
  /** Region. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** NZ: show te reo Māori labels alongside English (e.g. "Female / Wahine"). Default from the provider's `teReoLabels`. */
  teReoLabels?: boolean;
  /** Label. Default "Current Gender" (CGS-0007) or "Sex" (CGS-0016) in GB; "Gender", "Sex recorded at birth" (AU) or "Sex at birth" (NZ). */
  label?: string;
  /** Show label and value definitions as keyboard-accessible tooltips (CGS-0004, CGS-0015, CGS-0017, CGS-0018). Default true. */
  showDefinitions?: boolean;
  /** Override the label definition (for example the banner text in PAB-0047). */
  definition?: string;
  /** Text when no value is held. Default "Not Known" (PAB-0019). */
  unknownText?: string;
  /** "inline" (label then value) or "stacked". Default "inline". */
  layout?: 'inline' | 'stacked';
  /** Makes the value open the record (PAB-0048). */
  onOpenRecord?: () => void;
  className?: string;
}

/** Labelled display of gender or sex, in full words with definitions (CGS-0001..0019; AU ABS 2020; NZ HISO 10046 and Stats NZ). */
export function GenderDisplay({
  kind = 'currentGender',
  value,
  detail,
  region: regionProp,
  teReoLabels,
  label,
  showDefinitions = true,
  definition,
  unknownText = PATIENT_UNKNOWN_TEXT,
  layout = 'inline',
  onOpenRecord,
  className,
}: GenderDisplayProps) {
  const locale = useClinicalLocale(regionProp);
  const region = locale.region;
  if (region !== 'GB') {
    const set = REGIONAL_SEX_GENDER[region][kind];
    const found = findSexGenderValue(set.values, value);
    const teReo = region === 'NZ' && (teReoLabels ?? locale.teReoLabels) && found?.teReo;
    const d = (detail ?? '').trim();
    const shown: React.ReactNode = found ? (
      <>
        {found.displayLabel ?? found.label}
        {teReo ? (
          <>
            {' / '}
            <span lang="mi">{found.teReo}</span>
          </>
        ) : null}
        {d && found.specify ? ` (${d})` : null}
      </>
    ) : null;
    return (
      <LabelledValue
        className={cx('cui-gender-display', className)}
        label={label ?? set.label}
        definition={showDefinitions ? definition ?? set.definition : undefined}
        value={shown}
        unknownText={unknownText}
        layout={layout}
        onOpenRecord={onOpenRecord}
      />
    );
  }
  const defs = kind === 'sex' ? SEX_DEFINITIONS : CURRENT_GENDER_DEFINITIONS;
  const allowed: ReadonlyArray<string> = kind === 'sex' ? SEX_VALUES : CURRENT_GENDER_VALUES;
  const valid = value != null && allowed.includes(value);
  const valueDef = valid ? (defs.values as Record<string, string>)[value as string] : undefined;
  const shown: React.ReactNode = !valid
    ? null
    : showDefinitions && valueDef && !onOpenRecord
      ? <DefinitionTip definition={valueDef}>{value}</DefinitionTip>
      : value;
  return (
    <LabelledValue
      className={cx('cui-gender-display', className)}
      label={label ?? defs.label}
      definition={showDefinitions ? definition ?? defs.short : undefined}
      value={shown}
      unknownText={unknownText}
      layout={layout}
      onOpenRecord={onOpenRecord}
    />
  );
}
