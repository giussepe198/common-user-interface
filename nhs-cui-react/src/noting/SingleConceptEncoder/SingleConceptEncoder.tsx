import React from 'react';
import { Button, Icon, cx, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import { AxisModifierWarning } from '../AxisModifierWarning/AxisModifierWarning';
import { MandatoryQualifierSelect, type MandatoryQualifierOption } from '../MandatoryQualifierSelect/MandatoryQualifierSelect';
import { RequiredKey } from '../RequiredFieldIndicator/RequiredFieldIndicator';
import { SubsetFilterControl } from '../SubsetFilterControl/SubsetFilterControl';
import { TerminologySearch, type TerminologyResult, type TerminologySearchFn } from '../TerminologySearch/TerminologySearch';
import { SNOMED_EDITIONS, type SnomedEditionInfo, type TerminologySubsetInfo } from '../utils/regions/terminology';

/** A qualifier the concept cannot be encoded without (e.g. laterality). */
export interface MandatoryQualifierDef {
  id: string;
  label: string;
  options: MandatoryQualifierOption[];
}

/** What the encoder returns on OK. Concept and description ids come from the selected result. */
export interface EncodedConceptResult {
  concept: TerminologyResult;
  /** Values of mandatory qualifiers by qualifier id. */
  qualifiers: Record<string, string>;
  /** Additional text, kept when the concept is changed (Elaboration 2.1.1). */
  additionalText: string;
  /** The last search text, to reopen the results later (CNA-0760). */
  lastQuery: string;
  /** The axis modifier the user confirmed (e.g. "Mother"), if any. */
  axisModifier?: string;
  /** Subset ids in force when the concept was chosen. */
  subsetIds: string[];
}

export interface SingleConceptEncoderProps {
  /** Terminology search (receives region, edition and subset). */
  search: TerminologySearchFn;
  /** Dialog heading. Default "Encode a term". */
  title?: string;
  /** Label of the search field. Default "Search for a term". */
  searchLabel?: string;
  /** Subsets offered in the filter above the field (Matching 2.4.1). Default: none, or the region defaults when `useRegionSubsets`. */
  subsets?: TerminologySubsetInfo[];
  /** Offer the region's default subsets (AU NCTS value sets, NZ Edition reference sets) when `subsets` is not given. Default false. */
  useRegionSubsets?: boolean;
  /** Subsets are nested (slider). */
  subsetsNested?: boolean;
  /** Subset ids in force at first. */
  defaultSubsetIds?: string[];
  /** Mandatory qualifiers required by a concept (Elaboration 2.2.3). */
  getMandatoryQualifiers?: (concept: TerminologyResult) => MandatoryQualifierDef[];
  /**
   * Words in the additional text that suggest a different subject (axis modifiers). A match shows
   * `AxisModifierWarning` on OK. Default: family members [suggested].
   */
  axisModifierWords?: string[];
  /** Start with a previous result (editing). */
  initialValue?: EncodedConceptResult;
  onOk: (result: EncodedConceptResult) => void;
  onCancel: () => void;
  /** Jurisdiction (edition, language reference set, default subsets). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Overrides of the region's edition data. */
  edition?: Partial<SnomedEditionInfo>;
  /** Show the edition in the details flyout. */
  showEdition?: boolean;
  className?: string;
}

const DEFAULT_AXIS_WORDS = ['mother', 'father', 'brother', 'sister', 'son', 'daughter', 'grandmother', 'grandfather', 'aunt', 'uncle', 'parent', 'sibling', 'family history'];

function findAxisModifier(text: string, words: readonly string[]): string | undefined {
  for (const w of words) {
    const m = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').exec(text);
    if (m) return m[0];
  }
  return undefined;
}

/**
 * Single concept encoding dialog content (Matching 2.1.1, 2.2.2, 2.2.3; Elaboration 2.1.1, 2.2):
 * subset filter above the field, results with details, the selected concept shown as a label that
 * reopens the search, mandatory qualifiers, additional text, and OK disabled until complete.
 */
export function SingleConceptEncoder({
  search,
  title = 'Encode a term',
  searchLabel = 'Search for a term',
  subsets,
  useRegionSubsets = false,
  subsetsNested = false,
  defaultSubsetIds = [],
  getMandatoryQualifiers,
  axisModifierWords = DEFAULT_AXIS_WORDS,
  initialValue,
  onOk,
  onCancel,
  region: regionProp,
  edition,
  showEdition,
  className,
}: SingleConceptEncoderProps) {
  const { region } = useClinicalLocale(regionProp);
  const id = useId('cui-encoder');
  const [concept, setConcept] = React.useState<TerminologyResult | null>(initialValue?.concept ?? null);
  const [lastQuery, setLastQuery] = React.useState(initialValue?.lastQuery ?? '');
  const [searching, setSearching] = React.useState(!initialValue);
  const [qualifiers, setQualifiers] = React.useState<Record<string, string>>(initialValue?.qualifiers ?? {});
  const [text, setText] = React.useState(initialValue?.additionalText ?? '');
  const [subsetIds, setSubsetIds] = React.useState<string[]>(initialValue?.subsetIds ?? defaultSubsetIds);
  const [warning, setWarning] = React.useState<string | null>(null);
  const okRef = React.useRef<HTMLButtonElement>(null);
  const firstQualRef = React.useRef<HTMLSelectElement>(null);
  const labelRef = React.useRef<HTMLButtonElement>(null);
  const focusNext = React.useRef(false);

  const subsetLevels = subsets ?? (useRegionSubsets ? SNOMED_EDITIONS[region].defaultSubsets : []);
  const chosenSubsets = subsetLevels.filter((l) => subsetIds.includes(l.id));
  const subset: TerminologySubsetInfo | null = chosenSubsets.length === 1 ? chosenSubsets[0] : chosenSubsets.length ? { id: chosenSubsets.map((l) => l.id).join(','), label: chosenSubsets.map((l) => l.label).join(', ') } : null;
  const quals = concept && getMandatoryQualifiers ? getMandatoryQualifiers(concept) : [];
  const unresolved = quals.filter((q) => !qualifiers[q.id]);
  const canOk = !!concept && unresolved.length === 0;

  React.useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    (firstQualRef.current ?? okRef.current)?.focus();
  });

  const finish = (axisModifier?: string) => {
    if (!concept) return;
    onOk({ concept, qualifiers, additionalText: text, lastQuery, axisModifier, subsetIds });
  };

  return (
    <section className={cx('cui-concept-encoder', className)} aria-labelledby={`${id}-title`} data-region={region}>
      <h2 id={`${id}-title`} className="cui-concept-encoder__title">{title}</h2>
      {searching ? (
        <div className="cui-concept-encoder__search">
          {subsetLevels.length ? (
            <SubsetFilterControl levels={subsetLevels} nested={subsetsNested} value={subsetIds} onChange={setSubsetIds} region={region} />
          ) : null}
          <TerminologySearch
            key={subsetIds.join('|')}
            search={search}
            label={searchLabel}
            defaultQuery={lastQuery}
            searchOnMount={!!lastQuery}
            autoFocus
            region={region}
            edition={edition}
            showEdition={showEdition}
            subset={subset}
            onQueryChange={setLastQuery}
            onSelectionChange={(r, q) => {
              if (!r) return;
              setConcept(r);
              setLastQuery(q);
              setSearching(false);
              setQualifiers({});
              focusNext.current = true;
            }}
          />
        </div>
      ) : concept ? (
        <div className="cui-concept-encoder__selected">
          <span className="cui-concept-encoder__selected-key">Selected term</span>
          <button
            ref={labelRef}
            type="button"
            className="cui-concept-encoder__selected-label"
            aria-label={`${concept.term}. Change the term`}
            onClick={() => setSearching(true)}
          >
            <span>{concept.term}</span>
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      ) : null}
      {concept && !searching && quals.length ? (
        <div className="cui-concept-encoder__qualifiers">
          {quals.map((q, i) => (
            <MandatoryQualifierSelect
              key={q.id}
              ref={i === 0 ? firstQualRef : undefined}
              label={q.label}
              options={q.options}
              conceptName={concept.term}
              value={qualifiers[q.id] ?? null}
              onChange={(v) => setQualifiers((x) => ({ ...x, [q.id]: v ?? '' }))}
            />
          ))}
        </div>
      ) : null}
      <label className="cui-concept-encoder__text">
        <span className="cui-visually-hidden">Additional text</span>
        <textarea className="cui-noting-input" rows={3} placeholder="Additional text" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      {quals.length && !searching ? <RequiredKey>Mandatory: you must select a value to encode this term</RequiredKey> : null}
      <div className="cui-concept-encoder__actions">
        {!canOk ? (
          <span id={`${id}-why`} className="cui-concept-encoder__why">
            {!concept ? 'Select a term to continue.' : `Select ${unresolved.map((q) => q.label.toLowerCase()).join(' and ')} to continue.`}
          </span>
        ) : null}
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          ref={okRef}
          variant="primary"
          disabled={!canOk}
          aria-describedby={!canOk ? `${id}-why` : undefined}
          onClick={() => {
            const mod = findAxisModifier(text, axisModifierWords);
            if (mod) setWarning(mod);
            else finish();
          }}
        >
          OK
        </Button>
      </div>
      {warning && concept ? (
        <AxisModifierWarning
          conceptLabel={concept.term}
          modifierText={warning}
          onConfirmModifier={() => {
            const m = warning;
            setWarning(null);
            finish(m);
          }}
          onLeaveAsIs={() => {
            setWarning(null);
            finish();
          }}
        />
      ) : null}
    </section>
  );
}
