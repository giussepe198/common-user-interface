# RestrictivePracticeEpisode

A seclusion or restraint episode: type, start and elapsed time, the authorisation chain, observation and review timers at the host's intervals, each observation and review recorded, missed observations, and the end.

## When to use

- The open intervention screen and the restrictive intervention register detail.

## What you provide

- `episode` (`RestrictivePracticeEpisodeData`: `typeLabel` in the host's words, `startedAt`, `endedAt`, `authorisedBy`, `approvedBy`, `appliedBy`, `authorisationExpiresAt`, `observationIntervalMinutes` or `continuousObservation`, `reviewIntervalMinutes`, `observations`, `reviews`, `missedObservations`, `lessRestrictiveOptions`; host-computed `nextObservationDueAt`, `nextReviewDueAt`, `missedReviews`, `authorisationExpired`).
- `onRecordObservation`, `onRecordReview`, `onEnd`, `dueSoonMinutes`, `authorisationSoonMinutes` and `authorisationLabel` (host), `now`, `timeZone`, `region`, `headingLevel`.

```tsx
<RestrictivePracticeEpisode episode={ri} authorisationSoonMinutes={host.ri.promptBeforeMinutes}
  onRecordObservation={openObservation} onRecordReview={openReview} onEnd={openEnd} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- The type in the host's words [suggested].
- The authorisation chain and the authorisation limit computed by the host, shown through `OrderCountdown` with the host's prompt time [suggested].
- The next observation and review are timed from the last recorded one (or the start) at the host's intervals; overdue is said in words with what to do; continuous observation is said in words; missed observations derived by the host stay visible [suggested].
- [suggested] A host whose system of record computes the due times itself (for example the host's fixed grid from the start, with a tolerance) passes `nextObservationDueAt`, `nextReviewDueAt`, `missedReviews` and `authorisationExpired`; when given they are used as is and the control never works out its own, so the screen never disagrees with the register or the API's missed list. An expired authorisation without a held limit is still said in words.
- Less restrictive options shown in words [suggested].
- The control has no delete; corrections are the host's amendments [suggested].
- Absolute time and zone first, then relative; never relative alone [suggested].
- Each observation and review shows who recorded it [suggested].
- Words, icons and the inline-start bar; no animation, the clock re-read each minute [suggested].
- Timers and records stack below 560px; actions hidden in print [suggested].

## Do and don't

- Do pass the intervals and limits from the host; never type them into the app.
- Don't remove a missed observation when a later one is recorded.

## Accessibility

- A labelled section with a heading; facts are a `data/FactList` (label and value pairs that reflow); timers carry state in words with an icon and a polite live region (from `OrderCountdown`); missed observations are a note; records are ordered lists with their own headings.

## Regional behaviour

- Types, intervals, limits and authorising roles differ by jurisdiction and come from the host; prohibitions are enforced by the host.
