# ConceptFlyout

A details panel for a terminology concept: full name, synonym status, parent concepts and more specific concepts, with an optional "Browse for related concepts" button.

## When to use
- Beside the highlighted result in a search list (`TerminologySearch` shows it automatically).
- Beside a selected or suggested concept when the user needs to check what it means.

## What you provide
- `concept`: `term`, optional `fsn`, `isSynonym`, `preferredTerm`, `parents`, `moreSpecific`, `definition`.
- Optional `modifier` (`knownAbsent` or `knownPossible`) and `onBrowseRelated`.

```tsx
<ConceptFlyout concept={{ term: 'Heart attack', fsn: 'Myocardial infarction (disorder)', isSynonym: true,
  preferredTerm: 'Myocardial infarction', parents: ['Ischaemic heart disease'] }} onBrowseRelated={openBrowser} />
```

## Guidance implemented
- Matching 2.3.1 [M] the fully specified name can be viewed; [M] synonyms are identified ("Synonym for ..."), SCT-045.
- Matching 2.3.2 parents shown, the first labelled "Is a", others "And a" (so they do not read as alternatives); "Browse for related concepts" button.
- Post-coordination 2.1.2: negated concepts read "No ..." with "Known absence of" before the full name, and browsing is hidden; uncertain concepts use "Possibly present".
- SCT-058 more specific concepts listed, labelled in plain English ("More specific concepts"); SCT-006 avoids jargon ("Full name" rather than "Fully specified name").
- SCT-044 [M] no concept identifiers; never shows the phrase "SNOMED CT".
- Never contains the OK button or the additional text field (Matching 2.2.2, Elaboration 2.1.1).
- "Is a" / "Is an" chosen by the following word; the six-item limit for more specific concepts is [suggested].

## Do and don't
- Do keep the flyout beside the list, not over the input text.
- Don't put choices or required inputs in the flyout.

## Accessibility
- A labelled group ("Details: <term>"). In `TerminologySearch` the active option is described by the flyout, so screen readers can read it without moving focus.
- The browse button is a real button and is reachable with Tab.

## Regional behaviour
- `edition` shows the edition label at the foot (for example "UK Edition", "Australian edition (NCTS)", "NZ Edition"), without the phrase "SNOMED CT".
- NZ: when `concept.descriptions` carry the NZ consumer reference sets (G11 10: NZ English and te reo Māori patient and consumer friendly terms), the flyout lists a "Patient-friendly term" and a "Te reo Māori term". They show by default when `ClinicalLocaleProvider` has `teReoLabels` on, or with `showConsumerTerms`. Te reo text is marked `lang="mi"` and keeps its macrons. The te reo refset is for trial use (October 2020 first version) and its identifier is UNCERTAIN.
- AU and GB: no consumer terms are defined in the notes; only the edition label differs.
