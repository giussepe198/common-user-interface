# LeaveCard

One leave episode or absence without leave: the state in words, the leave type and authority, departure and expected return as absolute then relative times, and the escalation once overdue or absent.

## When to use

- In `LeaveTracker`, on the stay screen and in the person's summary while leave is planned, in progress or recent.

## What you provide

- `leave` (`LeaveEpisode`: person, `sex`, `bed`, `status` as recorded, `leaveType`, `authorisedBy`, `legalBasis`, `conditions`, `startAt`, `expectedReturnAt`, `returnedAt`, `absentSince`).
- `stateLabels`, `dueBackWithinMinutes`, `overdueAction`, `absentAction` (the host's words), the actions `onStart`, `onRecordReturn`, `onRecordAbsent`, `onExtend`, and `now`, `timeZone`, `region`, `density`.

```tsx
<LeaveCard leave={episode} absentAction={host.labels.awolNotifications} onRecordReturn={recordReturn} onRecordAbsent={recordAwol} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Leave type, expected return and authority shown; the legal authority in the host's words when the Act requires it [suggested].
- Not back by the expected return is "Not back: overdue" (never still "On leave"), with what to do and a "Record absence without leave" action [suggested].
- Absence without leave shows since when and for how long, with the notifications in the host's words. The control never records absence by itself [suggested].
- Times in the jurisdiction zone, absolute first then relative, through `OrderCountdown` [suggested].
- PAL-0450 [M]: the CUI identification cell, with sex after the date of birth [suggested].
- State in words, icon and inline-start bar; no colour alone [suggested].
- Defaults for state and escalation words are [suggested].

- [suggested] A host whose system of record decides when leave is overdue (for example after the host's grace period) passes `dueState` on the episode; the card, its countdown and its actions follow it and never work out their own from the clock. `leaveEpisodeState(leave, now, dueBackWithinMinutes)` gives the same state for a host's own lists.

- [suggested] `showPerson={false}` leaves the identification to the page on the person's own record, where it already sits once at the top (LeaveTracker passes it through).

## Do and don't

- Do pass the escalation words from the host and the service's policy.
- Don't infer absence without leave in the app; record it through the reviewed action.

## Accessibility

- An `article` with the identification first; facts as a description list; the escalation is a note in words with an icon; actions are named buttons.

## Regional behaviour

- Identifier labels and the default zone follow the region; leave types and absence wording come from the host.
