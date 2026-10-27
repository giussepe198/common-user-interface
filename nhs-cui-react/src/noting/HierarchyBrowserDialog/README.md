# HierarchyBrowserDialog

A modal dialog for browsing related concepts: less specific, similar and more specific.

## When to use
- From "Browse for related concepts" in `ConceptFlyout` when the user wants a more or less specific concept.

## What you provide
- `concept`, `getParents`, `getSiblings`, `getChildren` (each returns a list or a promise), `onOk`, `onCancel`.
- Optional `canSelect` (limit choices, e.g. sanctioned post-coordination values), `negated`, `title`, `region`, `inline`.
- Optional `getAttributes(conceptId)`: the concept's defining attributes (`id`, `label`, `phrase`, `lead`, `value`, and optional per-attribute lookups and `canSelect`). Each gets a tab. When an attribute was refined, `onOk(concept, refinement)` receives `refinement.attributes` (new values) and `refinement.text` (for example "Fracture, site of Bone structure of radius").

```tsx
<HierarchyBrowserDialog concept={{ id, term }} getParents={parents} getSiblings={siblings} getChildren={children}
  onOk={choose} onCancel={close} />

<HierarchyBrowserDialog concept={{ id: 'ff', term: 'Fracture of forearm' }} {...lookups}
  getAttributes={() => [
    { id: '116676008', label: 'Associated morphology', lead: true, value: fracture },
    { id: '363698007', label: 'Finding site', phrase: 'site of', value: forearmBone, canSelect: isSanctionedSite },
  ]}
  onOk={(concept, refinement) => save(refinement ? refinement.text : concept.term)} onCancel={close} />
```

## Guidance implemented
- Matching 2.5.1 (low confidence) and G8 HierarchyBrowserDialog: modal; three labelled lists from left to right ("Less specific concepts", "Similar concepts", "More specific concepts"), each alphabetical; a "Selected" field; single click re-centres the lists; double-click chooses and closes; "Back" returns to the previous concept.
- Disabled for negated concepts (Post-coordination 2.1.2: no browsing of a known-absent finding).
- Concept identifiers are never shown (SCT-044).
- Matching 2.5.1 (COULD): defining attributes refined on tabs ("Browse related concepts", then one tab per attribute, each showing its current value). The result is shown with user-friendly attribute labels ("Fracture, site of Bone structure of radius"); attribute names such as "Associated morphology" are not shown in the result (Post-coordination 2.2). Once an attribute is refined the "Browse related concepts" tab is hidden; Back undoes the refinement and the tab reappears.
- Matching 2.5.1 (MUST, post-coordination): each attribute can limit its values with `canSelect`; other values are shown but cannot be chosen, and OK is disabled while one is selected.
- [suggested] The tab label shows the attribute's current value and "(refined)" once changed; a "Result" line shows the rendered refinement.

## Do and don't
- Do return display terms from the region's language reference set.
- Don't use it as the main way to find a concept; search first.

## Accessibility
- Modal dialog with focus kept inside, Escape to cancel and focus returned on close.
- Each concept is a button; OK chooses the concept in the "Selected" field, so double-click is never required.
- A polite live region reports what was loaded.
- Attribute tabs follow the tabs pattern: Left and Right arrows, Home and End move between tabs; the selected tab is the only one in the Tab order.

## Regional behaviour
- Lists are sorted with the region's collator, so in NZ "Ōtaki" sorts with O and "Āwhina" with A (G11 11.1).
