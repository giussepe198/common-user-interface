import { describe, it, expect } from 'vitest';
import { refinedHierarchyAttributes, renderHierarchyRefinement } from './hierarchy';

const attrs = [
  { id: 'morph', label: 'Associated morphology', lead: true, value: { id: 'f', term: 'Fracture' } },
  { id: 'site', label: 'Finding site', phrase: 'site of', value: { id: 'fa', term: 'Bone structure of forearm' } },
];

describe('hierarchy refinement', () => {
  it('returns the base term while nothing is refined', () => {
    expect(renderHierarchyRefinement({ id: 'x', term: 'Fracture of forearm' }, attrs, {})).toBe('Fracture of forearm');
    expect(renderHierarchyRefinement({ id: 'x', term: 'Fracture of forearm' }, attrs, { site: attrs[1].value })).toBe('Fracture of forearm');
  });
  it('renders the G8 example with friendly labels', () => {
    const values = { site: { id: 'r', term: 'Bone structure of radius' } };
    expect(refinedHierarchyAttributes(attrs, values).map((a) => a.id)).toEqual(['site']);
    expect(renderHierarchyRefinement({ id: 'x', term: 'Fracture of forearm' }, attrs, values)).toBe('Fracture, site of Bone structure of radius');
  });
  it('uses the base term and lower-case labels when no attribute leads', () => {
    const plain = [{ id: 'sev', label: 'Severity', value: { id: 'm', term: 'Moderate' } }];
    expect(renderHierarchyRefinement({ id: 'a', term: 'Asthma' }, plain, { sev: { id: 's', term: 'Severe' } })).toBe('Asthma, severity Severe');
  });
});
