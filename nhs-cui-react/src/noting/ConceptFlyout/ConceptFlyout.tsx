import React from 'react';
import { Button, cx, useClinicalLocale, type ClinicalRegion } from '../../core';
import { selectConsumerTerm, selectPreferredTerm, type TermDescription } from '../utils/preferredTerm';

/** What the flyout knows about a concept. Concept identifiers are deliberately absent (SCT-044). */
export interface ConceptDetail {
  /** The label shown in the list (matched Preferred term or synonym). */
  term: string;
  /** Fully specified name, e.g. "Asthma (disorder)" (Matching 2.3.1 must allow viewing the FSN). */
  fsn?: string;
  /** The matched description is a synonym (Matching 2.3.1 must communicate this; SCT-045). */
  isSynonym?: boolean;
  /** Preferred term, shown when the label is a synonym. */
  preferredTerm?: string;
  /** Parent concepts ("is a" relationships), first is labelled "Is a", others "And a" (Matching 2.3.2). */
  parents?: string[];
  /** Child concepts (more specific), for hierarchy context (SCT-058). */
  moreSpecific?: string[];
  /** Short plain-English definition, when the terminology provides one (B4.4). */
  definition?: string;
  /**
   * All descriptions with language reference set acceptability. Used for the consumer-friendly
   * terms (NZ: NZ English and te reo Māori patient and consumer friendly terms, G11 section 10).
   */
  descriptions?: TermDescription[];
}

export interface ConceptFlyoutProps {
  concept: ConceptDetail;
  /**
   * Context modifier of an entered expression: 'knownAbsent' links the label to the FSN with
   * "known absence of" and hides browsing (Post-coordination 2.1.2); 'knownPossible' uses "possibly present".
   */
  modifier?: 'none' | 'knownAbsent' | 'knownPossible';
  /** Opens hierarchy browsing. Shown as the "Browse for related concepts" button (Matching 2.3.2). */
  onBrowseRelated?: () => void;
  /** Label of the browse button. Default "Browse for related concepts". */
  browseLabel?: string;
  /** How many more specific concepts to list before "and N more". Default 6 [suggested]. */
  maxMoreSpecific?: number;
  /** Jurisdiction (edition and reference sets). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Edition label shown at the foot, e.g. "NZ Edition" (display metadata, never "SNOMED CT"). */
  edition?: string;
  /**
   * Show consumer-friendly terms from `concept.descriptions` (NZ). Default: true when the provider has
   * `teReoLabels` on, otherwise false. Te reo Māori terms are marked `lang="mi"`.
   */
  showConsumerTerms?: boolean;
  id?: string;
  className?: string;
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

/**
 * Definition panel for a highlighted or selected concept: full name, synonym status, parents and
 * more specific concepts, with access to hierarchy browsing. Never shows concept identifiers or the
 * phrase "SNOMED CT" (SCT-044, Clinical statements). It holds no OK button or additional text field.
 */
export function ConceptFlyout({
  concept,
  modifier = 'none',
  onBrowseRelated,
  browseLabel = 'Browse for related concepts',
  maxMoreSpecific = 6,
  region: regionProp,
  edition,
  showConsumerTerms,
  id,
  className,
}: ConceptFlyoutProps) {
  const { region, teReoLabels } = useClinicalLocale(regionProp);
  const descs = concept.descriptions ?? [];
  const consumerOn = (showConsumerTerms ?? teReoLabels) && descs.length > 0;
  const consumerEn = consumerOn ? selectPreferredTerm(descs, { region, audience: 'consumer' }) : undefined;
  const consumerMi = consumerOn ? selectConsumerTerm(descs, 'mi', { region }) : undefined;
  const consumerTerms = [
    consumerEn && consumerEn.refsetId && consumerEn.term !== concept.term ? { key: 'Patient-friendly term', ...consumerEn } : null,
    consumerMi ? { key: 'Te reo Māori term', ...consumerMi } : null,
  ].filter((x): x is NonNullable<typeof x> => !!x);
  const prefix = modifier === 'knownAbsent' ? 'No ' : modifier === 'knownPossible' ? '? ' : '';
  const link = modifier === 'knownAbsent' ? 'known absence of' : modifier === 'knownPossible' ? 'possibly present' : null;
  const parents = concept.parents ?? [];
  const children = concept.moreSpecific ?? [];
  return (
    <div id={id} className={cx('cui-concept-flyout', className)} role="group" aria-label={`Details: ${prefix}${concept.term}`}>
      <p className="cui-concept-flyout__term">
        {prefix ? <strong>{prefix.trim()} </strong> : null}
        {concept.term}
      </p>
      {concept.fsn ? (
        <p className="cui-concept-flyout__fsn">
          <span className="cui-concept-flyout__key">{link ? `${link[0].toUpperCase()}${link.slice(1)}` : 'Full name'}</span>
          <span>{concept.fsn}</span>
        </p>
      ) : null}
      {concept.isSynonym ? (
        <p className="cui-concept-flyout__synonym">
          <span className="cui-concept-flyout__key">Synonym for</span>
          <span>{concept.preferredTerm ?? concept.fsn ?? 'another term'}</span>
        </p>
      ) : null}
      {concept.definition ? <p className="cui-concept-flyout__definition">{concept.definition}</p> : null}
      {parents.length ? (
        <ul className="cui-concept-flyout__parents" aria-label="Less specific concepts">
          {parents.map((p, i) => (
            <li key={i}>
              <span className="cui-concept-flyout__key">{i === 0 ? `Is ${article(p)}` : `And ${article(p)}`}</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children.length ? (
        <div className="cui-concept-flyout__children">
          <span className="cui-concept-flyout__key">More specific concepts</span>
          <ul aria-label="More specific concepts">
            {children.slice(0, maxMoreSpecific).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          {children.length > maxMoreSpecific ? <span className="cui-concept-flyout__more">and {children.length - maxMoreSpecific} more</span> : null}
        </div>
      ) : null}
      {consumerTerms.length ? (
        <ul className="cui-concept-flyout__consumer" aria-label="Consumer-friendly terms">
          {consumerTerms.map((c) => (
            <li key={c.key}>
              <span className="cui-concept-flyout__key">{c.key}</span>
              <span lang={c.lang && !/^en\b/.test(c.lang) ? c.lang : undefined}>{c.term}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {onBrowseRelated && modifier !== 'knownAbsent' ? (
        <Button size="sm" variant="secondary" onClick={onBrowseRelated} onMouseDown={(e) => e.preventDefault()}>
          {browseLabel}
        </Button>
      ) : null}
      {edition ? <p className="cui-concept-flyout__edition">Edition: {edition}</p> : null}
    </div>
  );
}
