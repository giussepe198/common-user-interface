# CarePlanGoals

Care and recovery plan goals in the person's own words, each with actions (what, who, by when), strengths, a review date and progress in words.

## When to use

- The care and recovery plan, plan reviews with the person and the one-page clinical summary.

## What you provide

- `goals` (`CarePlanGoal[]`: `ownWords`, `domain`, `strengths`, `actions`, `reviewDue`, `progress`, `progressNote`), `progressOptions` (the service's words), `onProgressChange`, `onEditGoal`, `onAddGoal`, `title`, `agreement`, `emptyText`, `headingLevel`, `now`, `timeZone`, `region`.

```tsx
<CarePlanGoals goals={plan.goals} agreement={plan.agreementText} onProgressChange={setProgress} onEditGoal={openGoal} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Goals in the person's own words (shown as a quotation, first in each card), strengths and needs by domain, actions with who and by when [suggested].
- Whether the person agreed the plan version, in words [suggested].
- The review date, with "Review overdue" in words and an icon once passed [suggested].
- Progress in words with an icon (defaults "Not started yet"; "Some progress"; "Achieved"; "No longer a goal" are [suggested]; co-designed words replace them). No score or percentage.
- Cards in a grid that falls to one column on a narrow container; the progress `forms/Select` in a `FormField` is 44px on coarse pointers; edit buttons hidden in print [suggested].

## Do and don't

- Do record the goal as the person said it; put clinical wording in the domain or actions.
- Don't show progress as a number or a bar.

## Accessibility

- An ordered list of goals; each goal's heading reads "Goal 1, in the person's words" for screen readers; actions are a named list; done actions say "(done)"; the progress select is labelled through `noting/FormField`.

## Regional behaviour

- None.
