# ObservationRound

A ward observation round: the people on an engagement and observation level with their due checks, quick recording, and missed and overdue checks said in words.

## When to use

- The ward round for intermittent, close and general observation, on a desktop, tablet or phone.
- Constant observation is usually recorded against one person; use the same control with one entry.

## What you provide

- `entries` (person as the list cell takes them, `sex`, `bed`, `level`, `intervalMinutes`, `dueAt`, `recordedAt`, `recordedBy`, `result`, `missedCount`), `onRecord(entryId, check)`.
- `locations`, `engagementOptions`, `behaviourOptions` (the service's words), `levelLabels`, `window` (`dueWithinMinutes`, `graceMinutes` from the policy), `labels`, `context`, `now`, `timeZone`, `region`.

```tsx
<ObservationRound context="Ward 3" entries={round} locations={ward.locations}
  window={{ graceMinutes: policy.toleranceMinutes }} onRecord={(id, check) => save(id, check)} />
```

On a phone, the same entries become `mobile/Worklist` tasks:

```tsx
<Worklist title="Observation round" tasks={mhObservationRoundTasks(round, { timeZone })} onStart={openCheck} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Observation rounds are part of the mental health extension. Level words, intervals, tolerances and the engagement and presentation choices come from the service's policy; defaults are [suggested].
- A check not recorded by its due time plus tolerance is "Overdue" with an error icon and the inline-start bar; missed checks from earlier stay visible as "2 checks missed this shift" [suggested].
- PAL-0450 [M]: each person is shown with the CUI identification cell (name, Born, record number), sex right after the date of birth.
- Status in words, icon and bar; never colour alone [suggested].
- Not seen is never silent: choosing it shows the escalation words before the check is recorded [suggested].
- Times are shown in the jurisdiction zone, absolute then relative [suggested].
- Mobile concept B (task-first worklist): `mhObservationRoundTasks` maps entries to worklist tasks with the full identity strip, reusing `mobile/Worklist` [suggested].
- Rows become stacked cards below 760px and a single column below 480px; 44px targets on coarse pointers [suggested].

## Do and don't

- Do set `recordedAt` and `result` on the entry after saving; the row then shows the result.
- Don't hide missed checks once the next check is done.

## Accessibility

- Each row is a list item named by the person; the record controls come from the forms area in a `FormRow` (seen or not seen is a `RadioGroup`, arrow keys; location, engagement and presentation are `Select`s in `FormField`s, so the controls stay level and stack on a narrow row); filters are pressed buttons with counts; the round summary is a polite live region; not seen raises a `shell/Message` warning announced as an alert.

## Regional behaviour

- Identifier labels and name case follow the region (G10, G11); the time zone defaults to the region's.
