import React from 'react';
import { cx, formatDateTime, Icon, useClinicalLocale, useId, VisuallyHidden } from '../../core';
import type { ClinicalRegion } from '../../core';
import type { AdrRisk, AdrStatus} from '../utils/adr';
import {
  ADR_REGION_ABSENCE_TEXT,
  adrAbsenceText, duplicateAdrAgents, formatAdrEventDate, formatAdrPastReactions, sortAdrRisks,
} from '../utils/adr';

export interface AdrRiskListProps {
  /** The patient's ADR risks, or an absence state (ADR-0051 to ADR-0054). */
  status: AdrStatus;
  /** Jurisdiction for absence wording and the default title. AU: "Nil known" / "Unknown"; NZ: three explicit states. An empty list is never shown as "no known" in any region. */
  region?: ClinicalRegion;
  /** table: Level 1 list with Level 2 events (default). narrative: one risk per line for letters and summaries (ADR-0058 to ADR-0062). */
  variant?: 'table' | 'narrative';
  /** List title (ADR-0028/0029). Default "Adverse drug reaction risks". */
  title?: string;
  /** Causative agent column heading (ADR-0024/0025). Default "Drug / substance". */
  agentHeading?: string;
  /** Past reactions column heading (ADR-0026/0027). Default "Past reactions". */
  reactionsHeading?: string;
  /** Joiner for reactions in the same event (ADR-0022). Default " + ". */
  simultaneousJoiner?: ' + ' | ' AND ';
  /** Text beside agents that will not trigger decision support (ADR-0055 to ADR-0057). Default "Will not trigger decision support alerts" [suggested]. */
  noDecisionSupportText?: string;
  /** Risk ids whose supporting events are open (controlled). */
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  className?: string;
}

function AgentName({ agent }: { agent: AdrRisk['agent'] }) {
  // Encoded agents bold lower case (ADR-0037); free text normal weight lower case (ADR-0038). Text otherwise as recorded (ADR-0012).
  return (
    <span className={cx('cui-adr__agent', agent.encoded ? 'cui-adr__agent--coded' : 'cui-adr__agent--free')}>
      {agent.text.toLowerCase()}
      {!agent.encoded ? <VisuallyHidden> (free text)</VisuallyHidden> : null}
    </span>
  );
}

function NoDss({ text }: { text: string }) {
  return (
    <span className="cui-adr__nodss">
      <Icon name="info" size={16} />
      <span>{text}</span>
    </span>
  );
}

/**
 * A patient's adverse drug reaction risks (Display of Adverse Drug Reaction Risks v1.0.0.0):
 * Level 1 lists each causative agent with its past reactions only, sorted alphabetically; selecting
 * a risk reveals its Level 2 supporting events with date, source and author. Absence states use
 * the exact wording "No known adverse drug reaction risks" or "Risk status unknown".
 */
export function AdrRiskList({
  status, region: regionProp, variant = 'table', title: titleProp, agentHeading = 'Drug / substance',
  reactionsHeading = 'Past reactions', simultaneousJoiner = ' + ', noDecisionSupportText = 'Will not trigger decision support alerts',
  expandedIds, onExpandedChange, className,
}: AdrRiskListProps) {
  const { region } = useClinicalLocale(regionProp);
  const title = titleProp ?? (region === 'GB' ? 'Adverse drug reaction risks' : ADR_REGION_ABSENCE_TEXT[region].title);
  const uid = useId('cui-adr');
  const [innerExpanded, setInnerExpanded] = React.useState<string[]>([]);
  const expanded = expandedIds ?? innerExpanded;
  const setExpanded = (ids: string[]) => { if (!expandedIds) setInnerExpanded(ids); onExpandedChange?.(ids); };
  const toggle = (id: string) => setExpanded(expanded.includes(id) ? expanded.filter(x => x !== id) : [...expanded, id]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const risks = status.kind === 'risks' ? sortAdrRisks(status.risks) : [];
  const absence = adrAbsenceText(status, region);
  React.useEffect(() => {
    const dups = duplicateAdrAgents(risks);
    if (dups.length && typeof console !== 'undefined') console.warn(`AdrRiskList: one risk phrase per agent (ADR-0013). Duplicates: ${dups.join(', ')}`);
  }, [risks]);

  const absenceBlock = absence ? (
    <div className={cx('cui-adr__absence', status.kind === 'unknown' || (status.kind === 'risks' && !risks.length) ? 'cui-adr__absence--unknown' : 'cui-adr__absence--none')}>
      <Icon name={status.kind === 'noKnownRisks' ? 'check' : 'warning'} size={16} />
      <span className="cui-adr__absence-text">{absence}</span>
      {status.kind === 'noKnownRisks' ? (
        <span className="cui-adr__absence-meta">
          Recorded {formatDateTime(status.recordedAt)} by {status.author.name}, {status.author.role}
          {status.author.location ? `, ${status.author.location}` : ''}
        </span>
      ) : null}
    </div>
  ) : null;

  if (variant === 'narrative') {
    // Structured, one risk per line, with a lead-in that names the list (ADR-0058 to ADR-0062).
    return (
      <div className={cx('cui-adr', 'cui-adr--narrative', className)}>
        <p className="cui-adr__narrative-heading"><strong>{title}:</strong>{absence ? ` ${absence}` : ''}</p>
        {risks.length ? (
          <ul className="cui-adr__narrative">
            {risks.map(r => (
              <li key={r.id}>
                <AgentName agent={r.agent} />
                {' – past reactions: '}
                {formatAdrPastReactions(r.pastReactions, simultaneousJoiner).replace(/^Not known$/, 'not known')}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <section className={cx('cui-adr', className)} aria-labelledby={`${uid}-title`}>
      <h3 id={`${uid}-title`} className="cui-adr__title">{title}</h3>
      {absenceBlock}
      {risks.length ? (
        <table className="cui-adr__table" aria-labelledby={`${uid}-title`}>
          <colgroup>
            <col className="cui-adr__col-agent" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{agentHeading}</th>
              <th scope="col">{reactionsHeading}</th>
            </tr>
          </thead>
          {risks.map((r, i) => {
            const open = expanded.includes(r.id);
            const hasEvents = !!r.events && r.events.length > 0;
            const reactions = formatAdrPastReactions(r.pastReactions, simultaneousJoiner);
            return (
              <tbody key={r.id} className={cx('cui-adr__risk', i % 2 === 1 && 'is-shaded', open && 'is-open', selectedId === r.id && 'is-selected')}>
                <tr className="cui-adr__row" onClick={() => { setSelectedId(r.id); if (hasEvents) toggle(r.id); }}>
                  <td className="cui-adr__agent-cell">
                    {hasEvents ? (
                      <button
                        type="button"
                        className="cui-adr__disclose"
                        aria-expanded={open}
                        aria-controls={`${uid}-${r.id}-events`}
                        onClick={e => { e.stopPropagation(); setSelectedId(r.id); toggle(r.id); }}
                      >
                        {/* Chevron, never a black triangle (ADR-0041) */}
                        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} />
                        <AgentName agent={r.agent} />
                        <VisuallyHidden>{open ? ', hide supporting events' : ', show supporting events'}</VisuallyHidden>
                      </button>
                    ) : (
                      <span className="cui-adr__nodisclose"><AgentName agent={r.agent} /></span>
                    )}
                    {r.agent.triggersDecisionSupport === false ? <NoDss text={noDecisionSupportText} /> : null}
                  </td>
                  <td className={cx('cui-adr__reactions', !r.pastReactions?.length && 'is-unknown')}>{reactions}</td>
                </tr>
                {open && hasEvents ? (
                  <tr className="cui-adr__events-row">
                    <td colSpan={2} id={`${uid}-${r.id}-events`}>
                      <table className="cui-adr__events">
                        <caption className="cui-visually-hidden">Supporting events for {r.agent.text}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Event</th>
                            <th scope="col">Source</th>
                            <th scope="col">Recorded by</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.events!.map(ev => (
                            <tr key={ev.id}>
                              <td className="cui-adr__date" data-label="Date">{formatAdrEventDate(ev.date)}{ev.time ? ` ${ev.time}` : ''}</td>
                              <td className={cx(ev.encoded && 'cui-adr__event--coded')} data-label="Event">{ev.description}</td>
                              <td data-label="Source">{ev.source ? <>{ev.source.who}{ev.source.encounter ? <span className="cui-adr__meta">, {ev.source.encounter}</span> : null}</> : <span className="cui-adr__meta">Not recorded</span>}</td>
                              <td data-label="Recorded by">
                                {ev.author.name}, {ev.author.role}
                                {ev.author.location ? <span className="cui-adr__meta">, {ev.author.location}</span> : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button type="button" className="cui-adr__back" onClick={() => toggle(r.id)}>
                        <Icon name="chevron-up" size={16} />
                        Back to risk list
                      </button>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </table>
      ) : null}
    </section>
  );
}
