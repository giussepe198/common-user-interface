import React from 'react';
import { Button, cx, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import { ModalFrame } from '../internal/ModalFrame';
import { termCollator } from '../utils/searchText';
import { refinedHierarchyAttributes, renderHierarchyRefinement } from '../utils/hierarchy';

/** A concept in the hierarchy browser. The id is never displayed (SCT-044). */
export interface HierarchyConcept {
  id: string;
  /** Display term (preferred term in the region's language reference set), macrons kept. */
  term: string;
}

type Lookup = (id: string) => Promise<HierarchyConcept[]> | HierarchyConcept[];

/**
 * A defining attribute of the concept, refined on its own tab (G8 Matching 2.5.1: "COULD refine
 * defining attributes via tabs", e.g. associated morphology "Fracture", finding site "Bone structure of forearm").
 */
export interface HierarchyDefiningAttribute {
  /** Attribute type id (e.g. 363698007 Finding site). Never displayed. */
  id: string;
  /** Tab label, e.g. "Finding site". */
  label: string;
  /** User-friendly phrase used in the result, e.g. "site of" gives "Fracture, site of Bone structure of radius" (G8 2.5.1). Default: the label in lower case. */
  phrase?: string;
  /** This attribute's value leads the rendered result (e.g. associated morphology). */
  lead?: boolean;
  /** Value defined for the concept. */
  value: HierarchyConcept;
  /** Lookups for the value's hierarchy. Default: the dialog's lookups. */
  getParents?: Lookup;
  getChildren?: Lookup;
  getSiblings?: Lookup;
  /** Values allowed for this attribute (sanctioned values, G8 2.5.1 "MUST limit hierarchy to concepts allowed to post-coordinate"). Others are shown but cannot be chosen. */
  canSelect?: (c: HierarchyConcept) => boolean;
}

/** What OK returns when defining attributes were refined. */
export interface HierarchyRefinement {
  /** Every attribute whose value was changed, with its new value. */
  attributes: Array<{ attributeId: string; label: string; value: HierarchyConcept }>;
  /** Rendered with friendly labels, e.g. "Fracture, site of Bone structure of radius". */
  text: string;
}

export interface HierarchyBrowserDialogProps {
  /** Concept to start from. */
  concept: HierarchyConcept;
  /** Less specific concepts (parents). */
  getParents: Lookup;
  /** More specific concepts (children). */
  getChildren: Lookup;
  /** Siblings: other children of all the parents. */
  getSiblings: Lookup;
  /** Limit what can be chosen (e.g. sanctioned post-coordination values). Others are shown but cannot be selected. */
  canSelect?: (c: HierarchyConcept) => boolean;
  /**
   * Defining attributes of a concept, each refined on its own tab (G8 Matching 2.5.1, COULD). Called
   * for the starting concept and again whenever the user moves to another concept. Omit for no tabs.
   */
  getAttributes?: (conceptId: string) => Promise<HierarchyDefiningAttribute[]> | HierarchyDefiningAttribute[];
  /** The concept is negated ("No ..."): browsing is not offered (Post-coordination 2.1.2). */
  negated?: boolean;
  /** Chosen concept. When attributes were refined, `refinement` carries the new values and the rendered text; `concept` is the concept they refine. */
  onOk: (concept: HierarchyConcept, refinement?: HierarchyRefinement) => void;
  onCancel: () => void;
  /** Dialog title. Default "Browse related concepts". */
  title?: string;
  /** Jurisdiction for sorting (ā sorts with a in NZ). Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Render in place instead of as a modal overlay (for previews or a host dialog). */
  inline?: boolean;
}

interface Lists {
  parents: HierarchyConcept[];
  siblings: HierarchyConcept[];
  children: HierarchyConcept[];
}

const RELATED = '__related';

/** One step of browsing, kept for Back. */
interface Snapshot {
  base: HierarchyConcept;
  values: Record<string, HierarchyConcept>;
  tab: string;
}

/**
 * Modal hierarchy browser (Matching 2.5.1, SCT-058): three alphabetical lists from left to right,
 * less specific, similar and more specific concepts. Choosing a concept re-centres the lists on it;
 * double-click, or Select then OK, chooses it. A Back button returns to the previous step. With
 * `getAttributes`, defining attributes are refined on tabs; once one is refined the "Browse related
 * concepts" tab is hidden until Back undoes the refinement.
 */
export function HierarchyBrowserDialog({
  concept,
  getParents,
  getChildren,
  getSiblings,
  canSelect,
  getAttributes,
  negated = false,
  onOk,
  onCancel,
  title = 'Browse related concepts',
  region: regionProp,
  inline,
}: HierarchyBrowserDialogProps) {
  const { region } = useClinicalLocale(regionProp);
  const baseId = useId('cui-hier');
  const [history, setHistory] = React.useState<Snapshot[]>([{ base: concept, values: {}, tab: RELATED }]);
  const step = history[history.length - 1];
  const [attrs, setAttrs] = React.useState<{ baseId: string; list: HierarchyDefiningAttribute[] } | null>(null);
  const [lists, setLists] = React.useState<Lists | null>(null);
  const [status, setStatus] = React.useState('');
  const collator = React.useMemo(() => termCollator(region), [region]);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const attributes = attrs && attrs.baseId === step.base.id ? attrs.list : [];
  const refined = refinedHierarchyAttributes(attributes, step.values);
  const isRefined = refined.length > 0;
  const tab = step.tab !== RELATED && !attributes.some((a) => a.id === step.tab) ? RELATED : isRefined && step.tab === RELATED ? refined[0].id : step.tab;
  const activeAttr = attributes.find((a) => a.id === tab);
  const centre = activeAttr ? step.values[activeAttr.id] ?? activeAttr.value : step.base;
  const lookups = {
    parents: activeAttr?.getParents ?? getParents,
    siblings: activeAttr?.getSiblings ?? getSiblings,
    children: activeAttr?.getChildren ?? getChildren,
  };

  // Load defining attributes for the base concept.
  React.useEffect(() => {
    if (negated || !getAttributes) return;
    let live = true;
    Promise.resolve(getAttributes(step.base.id)).then(
      (list) => live && setAttrs({ baseId: step.base.id, list }),
      () => live && setAttrs({ baseId: step.base.id, list: [] }),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.base.id, negated]);

  React.useEffect(() => {
    if (negated) return;
    let live = true;
    setLists(null);
    setStatus('Loading related concepts');
    const sort = (xs: HierarchyConcept[]) => [...xs].sort((a, b) => collator.compare(a.term, b.term));
    Promise.all([lookups.parents(centre.id), lookups.siblings(centre.id), lookups.children(centre.id)]).then(
      ([p, s, c]) => {
        if (!live) return;
        setLists({ parents: sort(p), siblings: sort(s.filter((x) => x.id !== centre.id)), children: sort(c) });
        setStatus(`${activeAttr ? `${activeAttr.label}: ` : ''}${centre.term}: ${p.length} less specific, ${c.length} more specific concepts`);
      },
      () => live && setStatus('Related concepts could not be loaded.'),
    );
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centre.id, tab, negated]);

  const selectable = (c: HierarchyConcept) => (activeAttr ? (activeAttr.canSelect ? activeAttr.canSelect(c) : true) : canSelect ? canSelect(c) : true);
  const baseSelectable = canSelect ? canSelect(step.base) : true;
  const allSelectable = activeAttr || isRefined
    ? baseSelectable && attributes.every((a) => !step.values[a.id] || !a.canSelect || a.canSelect(step.values[a.id]))
    : selectable(centre);

  const valuesWith = (c: HierarchyConcept) => (activeAttr ? { ...step.values, [activeAttr.id]: c } : step.values);
  const recentre = (c: HierarchyConcept) =>
    setHistory((h) => [...h, activeAttr ? { base: step.base, values: valuesWith(c), tab } : { base: c, values: {}, tab: RELATED }]);
  const setTab = (t: string) => setHistory((h) => [...h.slice(0, -1), { ...h[h.length - 1], tab: t }]);

  const refinementFor = (values: Record<string, HierarchyConcept>): HierarchyRefinement | undefined => {
    const changed = refinedHierarchyAttributes(attributes, values);
    if (!changed.length) return undefined;
    return {
      attributes: changed.map((a) => ({ attributeId: a.id, label: a.label, value: values[a.id] })),
      text: renderHierarchyRefinement(step.base, attributes, values),
    };
  };
  const choose = (values: Record<string, HierarchyConcept>, picked?: HierarchyConcept) => {
    if (!activeAttr && !isRefined) onOk(picked ?? centre);
    else onOk(step.base, refinementFor(values));
  };

  const visibleTabs = [...(isRefined ? [] : [{ id: RELATED, label: 'Browse related concepts' }]), ...attributes.map((a) => ({ id: a.id, label: a.label }))];
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = visibleTabs.length;
    const to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    setTab(visibleTabs[to].id);
    tabRefs.current[visibleTabs[to].id]?.focus();
  };

  const column = (key: keyof Lists, heading: string) => (
    <section className="cui-hierarchy__column" aria-labelledby={`${baseId}-${key}`}>
      <h3 id={`${baseId}-${key}`} className="cui-hierarchy__heading">{heading}</h3>
      {lists ? (
        lists[key].length ? (
          <ul className="cui-hierarchy__list">
            {lists[key].map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={cx('cui-hierarchy__item', !selectable(c) && 'cui-hierarchy__item--blocked')}
                  title={selectable(c) ? 'Show related concepts. Double-click to choose.' : 'Cannot be chosen here'}
                  onClick={() => recentre(c)}
                  onDoubleClick={() => selectable(c) && choose(valuesWith(c), c)}
                >
                  {c.term}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cui-hierarchy__empty">None</p>
        )
      ) : (
        <p className="cui-hierarchy__empty">Loading</p>
      )}
    </section>
  );

  const browser = (
    <>
      <div className="cui-hierarchy__selected">
        <label htmlFor={`${baseId}-selected`} className="cui-hierarchy__selected-label">{activeAttr ? activeAttr.label : 'Selected'}</label>
        <output id={`${baseId}-selected`} className="cui-hierarchy__selected-term">{centre.term}</output>
        <Button size="sm" variant="quiet" icon="chevron-left" disabled={history.length < 2} onClick={() => setHistory((h) => h.slice(0, -1))}>
          Back
        </Button>
      </div>
      <div className="cui-hierarchy__columns">
        {column('parents', 'Less specific concepts')}
        {column('siblings', 'Similar concepts')}
        {column('children', 'More specific concepts')}
      </div>
    </>
  );

  return (
    <ModalFrame labelledBy={`${baseId}-title`} onEscape={onCancel} inline={inline} className="cui-hierarchy">
      <h2 id={`${baseId}-title`} className="cui-noting-modal__title">{title}</h2>
      {negated ? (
        <p>Related concepts cannot be browsed for a term recorded as absent.</p>
      ) : (
        <>
          {attributes.length ? (
            <>
              <div className="cui-hierarchy__tabs" role="tablist" aria-label="Browse or refine">
                {visibleTabs.map((t, i) => {
                  const a = attributes.find((x) => x.id === t.id);
                  const changed = a && refined.includes(a);
                  return (
                    <button
                      key={t.id}
                      ref={(el) => (tabRefs.current[t.id] = el)}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${i}`}
                      aria-selected={tab === t.id}
                      aria-controls={`${baseId}-panel`}
                      tabIndex={tab === t.id ? 0 : -1}
                      className={cx('cui-hierarchy__tab', tab === t.id && 'cui-hierarchy__tab--on')}
                      onClick={() => setTab(t.id)}
                      onKeyDown={(e) => onTabKey(e, i)}
                    >
                      <span className="cui-hierarchy__tab-label">{t.label}</span>
                      {a ? (
                        <span className="cui-hierarchy__tab-value">
                          {(step.values[a.id] ?? a.value).term}
                          {changed ? <span className="cui-hierarchy__tab-changed"> (refined)</span> : null}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${Math.max(0, visibleTabs.findIndex((t) => t.id === tab))}`} className="cui-hierarchy__panel">
                {browser}
              </div>
              {isRefined ? (
                <div className="cui-hierarchy__result">
                  <span className="cui-hierarchy__selected-label">Result</span>
                  <output className="cui-hierarchy__result-text" aria-live="polite">{renderHierarchyRefinement(step.base, attributes, step.values)}</output>
                </div>
              ) : null}
            </>
          ) : (
            browser
          )}
          <p className="cui-prompt cui-hierarchy__help">
            Choose a concept to see its related concepts. Double-click a concept, or choose it and select OK, to use it.
            {attributes.length ? ' Use the tabs to refine a part of the concept, such as the site.' : ''}
          </p>
        </>
      )}
      <span className="cui-visually-hidden" aria-live="polite">{status}</span>
      <div className="cui-noting-modal__actions">
        <Button onClick={onCancel}>Cancel</Button>
        {!negated ? (
          <Button variant="primary" disabled={!allSelectable} onClick={() => choose(step.values)}>
            OK
          </Button>
        ) : null}
      </div>
    </ModalFrame>
  );
}
