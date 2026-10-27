import React from 'react';
import { cx, Icon } from '../../core';
import { NZ_ETHNICITY_MAX_CODES, NZ_ETHNICITY_QUESTION, NZ_ETHNICITY_RESIDUAL_CODES } from '../utils/regions/demographics';
import { ethnicityGroupLabel, ethnicityGroupsAtLevel } from '../utils/ethnicityOutput';
import { LabelledValue } from '../LabelledValue/LabelledValue';
import type { EthnicityValue } from '../EthnicityInput/EthnicityInput';

export interface EthnicityDisplayProps {
  /** Recorded ethnicities. Shown in the order recorded, never prioritised, none marked as main (HISO 10001; G11 4.1 display). */
  value: EthnicityValue | null | undefined;
  /** Label. Default "Ethnicity". */
  label?: string;
  /** Labels for codes that arrive without one (for example from a feed of codes only). */
  codeLabels?: Readonly<Record<string, string>>;
  /** Text when nothing is recorded. Default "Not recorded" [suggested: distinct from 99999 "Not stated"]. */
  unknownText?: string;
  /** "inline" or "stacked". Default "inline". */
  layout?: 'inline' | 'stacked';
  /**
   * Classification level to show (HISO 10001 output, G12 6): 4 (default) the recorded responses; 2 or 1 the distinct
   * groups those codes aggregate to ("Pacific Peoples"), in recorded order. Never prioritised: there is no principal ethnicity.
   */
  outputLevel?: 1 | 2 | 4;
  /** Note in text when more than six codes are held, so the Stats NZ reduction process is applied at source. Default true. */
  showReductionNotice?: boolean;
  className?: string;
}

const KNOWN: Record<string, string> = Object.fromEntries(
  [...NZ_ETHNICITY_QUESTION.options, ...NZ_ETHNICITY_RESIDUAL_CODES].map((o) => [o.code, o.label]),
);

/**
 * Display texts for recorded ethnicities: standard and residual labels, then the person's own words for "Other" when given,
 * otherwise the coded "Other" labels. Order as recorded.
 */
export function ethnicityDisplayTexts(value: EthnicityValue | null | undefined, codeLabels: Readonly<Record<string, string>> = {}): string[] {
  if (!value) return [];
  const standard = new Set(Object.keys(KNOWN));
  const out: string[] = [];
  const otherTexts: string[] = [];
  for (const e of value.entries ?? []) {
    const label = e.label || codeLabels[e.code] || KNOWN[e.code] || e.code;
    if (standard.has(e.code)) out.push(KNOWN[e.code]);
    else otherTexts.push(label);
  }
  const own = (value.otherText ?? '').trim();
  return [...out, ...(own ? [own] : otherTexts)];
}

/**
 * Labelled list of all recorded ethnicities (up to six), in recorded order, with macrons kept (HISO 10001). Optionally
 * aggregated to level 1 or 2 groups for output; never prioritised and never a "principal" ethnicity.
 */
export function EthnicityDisplay({
  value,
  label = 'Ethnicity',
  codeLabels,
  unknownText = 'Not recorded',
  layout = 'inline',
  outputLevel = 4,
  showReductionNotice = true,
  className,
}: EthnicityDisplayProps) {
  const codes = (value?.entries ?? []).map((e) => e.code);
  const texts =
    outputLevel === 4
      ? ethnicityDisplayTexts(value, codeLabels)
      : ethnicityGroupsAtLevel(codes, outputLevel).map((g) => ethnicityGroupLabel(g) || g);
  const tooMany = showReductionNotice && codes.length > NZ_ETHNICITY_MAX_CODES;
  const content = texts.length ? (
    <span className="cui-ethnicity-display__list">
      {texts.map((t, i) => (
        <React.Fragment key={i}>
          <span className="cui-ethnicity-display__item">
            {t}
            {i < texts.length - 1 ? ',' : ''}
          </span>
          {i < texts.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
      {outputLevel !== 4 ? <span className="cui-ethnicity-display__level">{` (level ${outputLevel} groups)`}</span> : null}
      {tooMany ? (
        <span className="cui-ethnicity-display__notice">
          <Icon name="warning" size={16} />
          {`${codes.length} recorded: more than six, so the Stats NZ reduction process applies (HISO 10001)`}
        </span>
      ) : null}
    </span>
  ) : null;
  return <LabelledValue className={cx('cui-ethnicity-display', className)} label={label} value={content} unknownText={unknownText} layout={layout} noWrap={false} />;
}
