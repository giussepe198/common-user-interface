import React from 'react';
import { Icon, cx, formatDateTime, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import {
  ewsDescribeParameter,
  ewsModificationEnd,
  ewsZone,
  scoreEarlyWarning,
  type EwsChartDefinition,
  type EwsModification,
  type EwsObservationSet,
  type EwsResult,
} from '../utils/earlyWarning';
import { ewsDefaultChart } from '../utils/regions/earlyWarning';
import { ewsZoneStyle } from '../shared/ewsStyle';

export interface EarlyWarningScoreSummaryProps {
  /** Observation set to score (usually the latest). Either this or `result`. */
  observation?: EwsObservationSet | null;
  /** A result already scored with `scoreEarlyWarning`. */
  result?: EwsResult | null;
  /**
   * Chart definition (bands, scores, zones, responses as data, AU-OB-01). Default: the region's chart, GB NEWS2,
   * AU ADDS (placeholder scores), NZ NZEWS.
   */
  definition?: EwsChartDefinition;
  /** Jurisdiction; otherwise read from ClinicalLocaleProvider. Chooses the default chart. */
  region?: ClinicalRegion;
  /** Patient-specific modifications; unsigned, undated or expired ones are listed but never applied (G11 12.4, AU-OB-05). */
  modifications?: EwsModification[];
  /** List each parameter that triggered the response. Default true. */
  showTriggers?: boolean;
  /** Heading level for the summary title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Announce changes to the score politely to screen readers [suggested]. Default false. */
  live?: boolean;
  /**
   * Show the "Placeholder scores: not for clinical use" note when the chart's scores are placeholders (AU ADDS).
   * Default true. Set false only when the host already shows the same notice next to this summary, as VitalSignsChart does.
   */
  showPlaceholderNotice?: boolean;
  className?: string;
}

/**
 * Early warning score summary: the total, its zone (colour plus words), the required response next to the
 * triggered value (AU-OB-06), why it was triggered, missing parameters, active modifications and any text the
 * chart requires, such as the NZEWS "escalate if worried" banner (G11 12.3).
 */
export function EarlyWarningScoreSummary(props: EarlyWarningScoreSummaryProps) {
  const { observation, modifications = [], showTriggers = true, headingLevel = 3, live = false, showPlaceholderNotice = true, className } = props;
  const { region } = useClinicalLocale(props.region);
  const def = props.definition ?? ewsDefaultChart(region);
  const id = useId('cui-ews-sum');
  const result = React.useMemo(
    () => props.result ?? (observation ? scoreEarlyWarning(def, observation, modifications) : null),
    [props.result, observation, def, modifications],
  );
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const mandatory = def.mandatoryText ?? [];

  if (!result) {
    return (
      <section className={cx('cui-ews-summary', className)} aria-labelledby={`${id}-t`}>
        <H id={`${id}-t`} className="cui-ews-summary__title">{def.totalLabel}</H>
        <p className="cui-ews-summary__empty">No observations recorded</p>
        {mandatory.map(t => (
          <p key={t} className="cui-ews-summary__mandatory"><Icon name="warning" /> {t}</p>
        ))}
      </section>
    );
  }
  const zone = ewsZone(def, result.zone);
  const rule = result.response;
  const zonesOnly = def.scoring === 'zones';
  // Zone-based charts (NSW Between the Flags) have no total: the zone is the result.
  const totalText = zonesOnly ? zone.label : result.complete ? String(result.total) : `${result.total} or more`;
  const appliedText = (m: EwsModification) => {
    const end = ewsModificationEnd(m);
    return `${def.parameters.find(p => p.id === m.parameterId)?.shortLabel ?? m.parameterId}: ${m.label} scores ${m.score}. ${m.reason}. Authorised by ${m.authorisedBy}${end ? `, until ${formatDateTime(end)}` : ''}.`;
  };

  return (
    <section className={cx('cui-ews-summary', zone.colourVar && 'cui-ews-summary--zoned', className)} aria-labelledby={`${id}-t`} style={ewsZoneStyle(zone)}>
      {result.placeholder && showPlaceholderNotice ? (
        <p className="cui-ews-summary__placeholder" role="note">
          <Icon name="warning" /> Placeholder scores: not for clinical use. Set the scores from your local chart.
        </p>
      ) : null}
      {def.localVerificationRequired ? (
        <p className="cui-ews-summary__placeholder" role="note">
          <Icon name="warning" /> Verify the zone boundaries against the chart in use locally before clinical use.
        </p>
      ) : null}
      <div className="cui-ews-summary__head" aria-live={live ? 'polite' : undefined} aria-atomic={live ? true : undefined}>
        <H id={`${id}-t`} className="cui-ews-summary__title">{def.totalLabel}</H>
        <span className="cui-ews-summary__total cui-tabular">{totalText}</span>
        {rule ? (
          <span className={cx('cui-ews-zone-chip', zone.colourVar && 'cui-ews-zone-chip--filled')} style={ewsZoneStyle(zone)}>
            {rule.label}
            {zone.rank > 0 ? <span className="cui-visually-hidden">{`, ${zone.label}`}</span> : null}
          </span>
        ) : null}
        {result.time ? <span className="cui-ews-summary__time cui-tabular">{formatDateTime(result.time)}</span> : null}
      </div>
      {!result.complete ? (
        <p className="cui-ews-summary__incomplete">
          <Icon name="warning" /> Incomplete: {result.missing.join(', ')} not recorded. {zonesOnly ? 'The zone may be more severe.' : 'The score may be higher.'}
        </p>
      ) : null}
      {rule ? (
        <div className="cui-ews-summary__response">
          {rule.descriptor ? <p className="cui-ews-summary__descriptor">{rule.descriptor}</p> : null}
          <p className="cui-ews-summary__action">{rule.response}</p>
          {rule.frequency ? <p className="cui-ews-summary__frequency">Observations: {rule.frequency}</p> : null}
        </div>
      ) : null}
      {showTriggers && result.triggers.length && zone.rank > 0 ? (
        <div className="cui-ews-summary__triggers">
          <span className="cui-ews-summary__label">Triggered by</span>
          <ul>
            {result.triggers.map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {showTriggers ? (
        <ul className="cui-visually-hidden">
          {result.parameters.map(p => (
            <li key={p.parameterId}>{ewsDescribeParameter(def, p)}</li>
          ))}
        </ul>
      ) : null}
      {result.appliedModifications.length ? (
        <div className="cui-ews-summary__mods">
          <span className="cui-ews-summary__label">Modified triggers in use</span>
          <ul>
            {result.appliedModifications.map(m => (
              <li key={m.id}>{appliedText(m)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {result.ignoredModifications.length ? (
        <div className="cui-ews-summary__mods cui-ews-summary__mods--ignored">
          <span className="cui-ews-summary__label">Modifications not applied</span>
          <ul>
            {result.ignoredModifications.map(({ modification: m, reason }) => (
              <li key={m.id}>{`${m.label}: ${reason}`}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {mandatory.map(t => (
        <p key={t} className="cui-ews-summary__mandatory"><Icon name="warning" /> {t}</p>
      ))}
    </section>
  );
}
