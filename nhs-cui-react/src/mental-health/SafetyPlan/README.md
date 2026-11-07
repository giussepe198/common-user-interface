# SafetyPlan

A safety plan held by the person in the person's own words: seven numbered sections, view and edit modes, whether the person has the current version, and a print layout.

## When to use

- Making and reviewing a safety plan with the person, showing it at handover and printing a copy for them.

## What you provide

- `value` / `defaultValue` / `onChange` (`SafetyPlanValue`: seven lists of `SafetyPlanEntry` with `text`, `recordedAt`, optional `phone` and `detail`), `mode`, `onEdit`, `onSave`, `onCancel`, `onPrint`.
- `sharing` (`shared`, `sharedAt`, `how`), `onMarkShared`, `headings` (the service's co-designed words), `title`, `updatedBy`, `updatedAt`, `reviewDue`, `createId`, `now`, `timeZone`, `region`, `headingLevel`.

```tsx
<SafetyPlan mode={editing ? 'edit' : 'view'} value={plan} onChange={setPlan} onEdit={() => setEditing(true)}
  onSave={save} sharing={plan.sharing} onMarkShared={markShared} updatedAt={plan.updatedAt} region="AU" />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Warning signs, coping strategies, people and places, who to contact, means safety and reasons for living, in the person's words. Default headings are [suggested] first-person wording; the service's co-designed wording replaces them.
- "Shared with the person" or "Not yet shared with the person" in words with an icon, with when and how [suggested].
- The print keeps every section, the updated date and who updated it, and drops the buttons; empty sections say "Nothing recorded yet" so a missing section is visible on paper [suggested].
- Numbers through `patient/TelephoneNumberDisplay` (TID-0015, AU and NZ groupings) as `tel:` links.
- Edit mode composes `noting/RepeatableFieldGroup` (Theme 8: each line labelled with when it was added) and `noting/FormField` (CNA-0440 visible labels); each line is a `forms/TextInput`, and for people and services the name and phone sit side by side in a `forms/FormRow`, so the controls stay level and stack on a narrow plan; the phone is a `TextInput` with `inputMode="tel"` because `patient/TelephoneNumberInput` draws its own label and has no three-slot (bare) mode for a row [suggested]; the group is composed without restyling it; blank lines are dropped on save [suggested].
- Two columns of sections when wide, one below 640px; 16px input text on coarse pointers [suggested].

## Do and don't

- Do write the person's words as they said them.
- Don't use the plan as a risk score or a checklist; it has none.

## Accessibility

- Sections are headed and numbered (the number is decorative; the heading carries the words); remove buttons name the line and section; each input's label includes its section for screen readers.

## Regional behaviour

- Telephone numbers format by region (GB, AU, NZ) through the patient area.
