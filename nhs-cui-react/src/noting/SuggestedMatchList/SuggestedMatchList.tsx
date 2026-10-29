import React from 'react';
import { Button, Icon, cx, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import { selectPreferredTerm, type TermDescription } from '../utils/preferredTerm';
import { terminologyEditionFor, type SnomedEditionInfo } from '../utils/regions/terminology';

/** A qualifier or other attribute matched with the base concept. */
export interface SuggestedAttribute {
  /** Stable key. Hidden unless `showConceptIds` is set. */
  id: string;
  /** Matched label, e.g. "Left" or "Severe". Attribute names such as "Severity" are not shown before confirmation (Post-coordination 2.1.4). */
  label: string;
  /** Friendly attribute name shown after confirmation, e.g. "site". */
  friendlyName?: string;
  /** Mandatory qualifier (e.g. laterality): once confirmed it is ticked and cannot be cleared on its own (Elaboration 2.2.3). */
  mandatory?: boolean;
  confirmed?: boolean;
}

/** One suggested encoding for a stretch of typed text. */
export interface SuggestedMatch {
  /** Stable key. Hidden unless `showConceptIds` is set. */
  id: string;
  /** The typed text this match came from (shown to link the suggestion to the note). */
  sourceText?: string;
  /** Base concept label (matched Preferred term or synonym). */
  label: string;
  /** Concept identifier, shown only when `showConceptIds` is true (for coders, never by default). */
  conceptId?: string;
  /** Negation ('No') or uncertainty ('?'), rendered bold before the base (Post-coordination 2.1.2). */
  modifier?: 'none' | 'knownAbsent' | 'knownPossible';
  /** Qualifiers and attribute values, indented below the base. */
  attributes?: SuggestedAttribute[];
  /** Text left unstructured: each chunk shown on its own line with a free-text icon (Elaboration 2.1.2). */
  freeText?: string[];
  /** The user has ticked the base concept (B2.6: nothing is coded without confirmation). */
  confirmed?: boolean;
  /** An alternative with the same spelling exists: confirmation is disabled until alternatives are viewed (Matching 2.3.2). */
  sameSpellingAlternatives?: boolean;
  /** The user has opened the alternatives list. */
  alternativesViewed?: boolean;
  /** Name of an unresolved mandatory qualifier (e.g. "Laterality"): confirmation is disabled (Elaboration 2.2.3). */
  unresolvedMandatory?: string;
  /** Warnings such as "More specific matches are available" (Matching 2.3.2) or negation scope (Post-coordination 2.1.2). */
  warnings?: string[];
  /** Descriptions of the base concept: when given, the label is the region's preferred term (AU 11, NZ 10, SCT-007). */
  descriptions?: TermDescription[];
}

export interface SuggestedMatchListProps {
  suggestions: SuggestedMatch[];
  /** Area label (Matching 2.2.1). Default "Tick to confirm that this is what you mean:". */
  label?: string;
  /** Tick or untick a base concept. Ticking the base can tick its attributes (Post-coordination 2.1.4). */
  onConfirmChange?: (suggestionId: string, confirmed: boolean) => void;
  /** Tick or untick an attribute (only possible once the base is ticked). */
  onAttributeConfirmChange?: (suggestionId: string, attributeId: string, confirmed: boolean) => void;
  /** Open the alternatives for a suggestion (or for one of its attributes). */
  onOpenAlternatives?: (suggestionId: string, attributeId?: string) => void;
  /** Highlight the suggestion matching the focus in the text area (Matching 2.3.3 synchronisation). */
  focusedId?: string;
  /** Called when a suggestion gains focus or is hovered, so the text area can follow. */
  onFocusSuggestion?: (suggestionId: string) => void;
  /** Show concept identifiers. Default false: hidden from clinicians (Matching 2.3.2, SCT-044). */
  showConceptIds?: boolean;
  /** Text when there are no suggestions yet [suggested]. */
  emptyText?: string;
  /** Jurisdiction: chooses preferred terms by the region's language reference set. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Overrides of the region's edition data. */
  edition?: Partial<SnomedEditionInfo>;
  /** Show the edition the codes come from under the list (e.g. "Codes from: NZ Edition"). Default false. [suggested] */
  showEdition?: boolean;
  className?: string;
}

const modifierText = (m?: SuggestedMatch['modifier']) => (m === 'knownAbsent' ? 'No' : m === 'knownPossible' ? '?' : '');

/**
 * Suggested matches column for a text-parser noting area: each suggestion in a bounded box with a
 * confirmation check box, attributes indented beneath, and unencoded text chunks marked with an icon.
 */
export function SuggestedMatchList({
  suggestions,
  label = 'Tick to confirm that this is what you mean:',
  onConfirmChange,
  onAttributeConfirmChange,
  onOpenAlternatives,
  focusedId,
  onFocusSuggestion,
  showConceptIds = false,
  emptyText = 'Suggested matches appear here as you type.',
  region: regionProp,
  edition: editionOverrides,
  showEdition = false,
  className,
}: SuggestedMatchListProps) {
  const baseId = useId('cui-suggest');
  const { region } = useClinicalLocale(regionProp);
  const edition = terminologyEditionFor(region, editionOverrides);
  const labelOf = (s: SuggestedMatch): { text: string; lang?: string } => {
    const p = s.descriptions?.length ? selectPreferredTerm(s.descriptions, { region, edition }) : undefined;
    return p ? { text: p.term, lang: p.lang && !/^en\b/.test(p.lang) ? p.lang : undefined } : { text: s.label };
  };
  const empty = suggestions.length === 0;
  return (
    <section className={cx('cui-suggested-matches', empty && 'cui-suggested-matches--empty', className)} aria-labelledby={`${baseId}-label`}>
      <h3 id={`${baseId}-label`} className="cui-suggested-matches__label">{label}</h3>
      {empty ? <p className="cui-suggested-matches__empty">{emptyText}</p> : null}
      <ul className="cui-suggested-matches__list">
        {suggestions.map((s) => {
          const mod = modifierText(s.modifier);
          const blockedBySpelling = !!s.sameSpellingAlternatives && !s.alternativesViewed;
          const blocked = blockedBySpelling || !!s.unresolvedMandatory;
          const reasonId = `${baseId}-${s.id}-reason`;
          const shown = labelOf(s);
          const fullLabel = `${mod ? `${mod} ` : ''}${shown.text}`;
          return (
            <li
              key={s.id}
              className={cx('cui-suggested-matches__item', focusedId === s.id && 'cui-suggested-matches__item--focused', s.confirmed && 'cui-suggested-matches__item--confirmed')}
              onMouseEnter={() => onFocusSuggestion?.(s.id)}
              onFocus={() => onFocusSuggestion?.(s.id)}
            >
              {s.sourceText ? <span className="cui-suggested-matches__source">From: “{s.sourceText}”</span> : null}
              <div className="cui-suggested-matches__base">
                <label className="cui-suggested-matches__check" data-touch-target>
                  <input
                    type="checkbox"
                    checked={!!s.confirmed}
                    disabled={blocked && !s.confirmed}
                    aria-describedby={blocked ? reasonId : undefined}
                    onChange={(e) => onConfirmChange?.(s.id, e.target.checked)}
                  />
                  <span className="cui-suggested-matches__term">
                    {mod ? <strong className="cui-suggested-matches__modifier">{mod} </strong> : null}
                    <span lang={shown.lang}>{shown.text}</span>
                  </span>
                </label>
                {showConceptIds && s.conceptId ? <code className="cui-suggested-matches__id">{s.conceptId}</code> : null}
                {onOpenAlternatives && s.modifier !== 'knownAbsent' ? (
                  <Button size="sm" variant="quiet" icon="chevron-down" iconOnly onClick={() => onOpenAlternatives(s.id)}>
                    {`Show alternatives for ${fullLabel}`}
                  </Button>
                ) : null}
              </div>
              {blocked ? (
                <p id={reasonId} className="cui-suggested-matches__reason">
                  <Icon name="info" />
                  {s.unresolvedMandatory
                    ? `You must select ${s.unresolvedMandatory.toLowerCase()} to be able to encode '${shown.text}'.`
                    : 'Another match has the same spelling. View the alternatives before confirming.'}
                </p>
              ) : null}
              {s.attributes?.length ? (
                <ul className="cui-suggested-matches__attributes" aria-label={`Details for ${shown.text}`}>
                  {s.attributes.map((a) => {
                    const lockedMandatory = !!a.mandatory && !!a.confirmed && !!s.confirmed;
                    return (
                      <li key={a.id} className="cui-suggested-matches__attribute">
                        <label className="cui-suggested-matches__check" data-touch-target>
                          <input
                            type="checkbox"
                            checked={!!a.confirmed && !!s.confirmed}
                            disabled={!s.confirmed || lockedMandatory}
                            title={!s.confirmed ? 'Confirm the main term first' : lockedMandatory ? 'Required detail: untick the main term to change it' : undefined}
                            onChange={(e) => onAttributeConfirmChange?.(s.id, a.id, e.target.checked)}
                          />
                          <span className="cui-suggested-matches__term">
                            {a.confirmed && s.confirmed && a.friendlyName ? <span className="cui-suggested-matches__attr-name">{a.friendlyName} </span> : null}
                            {a.label}
                          </span>
                        </label>
                        {showConceptIds ? <code className="cui-suggested-matches__id">{a.id}</code> : null}
                        {onOpenAlternatives && !lockedMandatory ? (
                          <Button size="sm" variant="quiet" icon="chevron-down" iconOnly onClick={() => onOpenAlternatives(s.id, a.id)}>
                            {`Show alternatives for ${a.label}`}
                          </Button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {s.freeText?.length ? (
                <ul className="cui-suggested-matches__free" aria-label="Text not coded">
                  {s.freeText.map((t, i) => (
                    <li key={i}>
                      <Icon name="free-text" />
                      <span className="cui-visually-hidden">Free text, not coded: </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {s.warnings?.length ? (
                <ul className="cui-suggested-matches__warnings">
                  {s.warnings.map((w, i) => (
                    <li key={i}>
                      <Icon name="warning" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      {showEdition ? <p className="cui-suggested-matches__edition">Codes from: {edition.label}</p> : null}
    </section>
  );
}
