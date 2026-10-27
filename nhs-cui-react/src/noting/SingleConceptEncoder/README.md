# SingleConceptEncoder

The content of a single-concept encoding dialog: subset filter, search, selected term, mandatory qualifiers, additional text, OK and Cancel.

## When to use
- Coding one term at a time in a dialog (Terminology Matching, single concept approach).

## What you provide
- `search` (as for `TerminologySearch`), `onOk(result)`, `onCancel`.
- Optional `subsets` or `useRegionSubsets`, `subsetsNested`, `defaultSubsetIds`, `getMandatoryQualifiers(concept)`, `axisModifierWords`, `initialValue`, `region`, `edition`, `showEdition`, `title`, `searchLabel`.

```tsx
<SingleConceptEncoder search={find} getMandatoryQualifiers={qualifiersFor}
  onOk={(r) => save(r.concept.id, r.qualifiers, r.additionalText)} onCancel={close} />
```

## Guidance implemented
- Matching 2.1.1, 2.2.2, 2.2.3 and G8 SingleConceptEncoder: subset control above the field; field then results with the details flyout; after selection the field is replaced by the selected term with a down arrow, and clicking it reopens the search with the last query; "Additional text" below; OK and Cancel.
- Focus moves to the first mandatory qualifier, or to OK, after selection.
- OK is disabled while no concept is chosen or a mandatory qualifier is unresolved (Elaboration 2.2.3); the reason is shown next to the buttons [suggested wording].
- Additional text is kept when the concept changes (Elaboration 2.1.1).
- On OK, if the additional text mentions a family member, `AxisModifierWarning` asks how to record it. The word list is [suggested].
- Returns the result with the concept (ids from your search), qualifiers, additional text, last query, subsets and any confirmed modifier.

## Do and don't
- Do wrap it in your own dialog (title bar, size, position).
- Don't save elaboration without a concept.

## Accessibility
- A labelled section; the selected term is a button named "<term>. Change the term"; OK is described by the reason it is disabled.

## Regional behaviour
- Passes `region` and `edition` to the search, so AU searches SNOMED CT-AU via NCTS and NZ the NZ Edition.
- `useRegionSubsets` offers the region's default subsets in the filter (AU NCTS allergy value sets; NZ Edition allergy reference sets; none for GB).
