/**
 * Hierarchy browser refinement of defining attributes (G8 Matching 2.5.1: "COULD refine defining
 * attributes via tabs"; result "Fracture, site of Bone structure of radius"). Pure functions.
 */

/** Minimal concept shape used by the refinement helpers. */
export interface RefinementConcept {
  id: string;
  term: string;
}

/** A defining attribute as the refinement helpers need it. */
export interface RefinementAttribute {
  id: string;
  /** Tab label, e.g. "Finding site". */
  label: string;
  /** Friendly phrase used in the rendered result, e.g. "site of". Default: the label in lower case. */
  phrase?: string;
  /** The attribute leads the rendered result (e.g. associated morphology "Fracture"). */
  lead?: boolean;
  /** Value defined for the concept. */
  value: RefinementConcept;
}

/** Attributes whose current value differs from the defined value. */
export function refinedHierarchyAttributes<A extends RefinementAttribute>(attributes: readonly A[], values: Readonly<Record<string, RefinementConcept | undefined>>): A[] {
  return attributes.filter((a) => {
    const v = values[a.id];
    return !!v && v.id !== a.value.id;
  });
}

/**
 * Render a refined concept with user-friendly attribute labels (G8 Matching 2.5.1): the lead
 * attribute's value (or the base term when no attribute leads), then each other attribute as
 * "<phrase> <value>", separated by commas. Attribute names such as "Associated morphology" are never
 * shown (Post-coordination 2.2).
 */
export function renderHierarchyRefinement(base: RefinementConcept, attributes: readonly RefinementAttribute[], values: Readonly<Record<string, RefinementConcept | undefined>>): string {
  if (!refinedHierarchyAttributes(attributes, values).length) return base.term;
  const valueOf = (a: RefinementAttribute) => values[a.id] ?? a.value;
  const lead = attributes.find((a) => a.lead);
  const parts = [lead ? valueOf(lead).term : base.term];
  for (const a of attributes) {
    if (a === lead) continue;
    parts.push(`${a.phrase ?? a.label.toLowerCase()} ${valueOf(a).term}`);
  }
  return parts.join(', ');
}
