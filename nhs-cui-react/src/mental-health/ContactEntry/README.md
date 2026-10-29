# ContactEntry

A contact or progress note header: date and time, duration, contact type, setting and participants, with the note text; one dense line in view mode, stacked CUI inputs in edit mode.

## When to use

- Recording a contact and its note in one step, and showing a saved contact at the top of its note.
- For a list of contacts use `ContactSummaryList`.

## What you provide

- View: `contact` (`ContactRecord`: `startAt`, `durationMinutes`, `contactType`, `setting`, `participants`, `author`, `note`, `enteredInError`), `onEdit`.
- Edit: `value` / `defaultValue` / `onChange` (`ContactEntryValue`), `onSave`, `onCancel`, `contactTypes`, `settings`, `participantOptions` (host value sets), `noteLabel`, `notePrompt`.
- Both: `title`, `headingLevel`, `timeZone`, `region`.

```tsx
<ContactEntry mode="edit" contactTypes={host.valueSets.contactMedium} settings={host.valueSets.contactSetting}
  participantOptions={participants} notePrompt="Include the person's own words where you can" onSave={save} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- Date, start time, duration, medium (contact type), setting and staff and other participants; value sets from the host [suggested].
- The note in the same step, with a prompt for the person's own words [suggested].
- Entered in error stays visible, struck through, with the reason in words; it cannot be edited [suggested].
- CUI date and time entry through `datetime/DateInput`, `datetime/TimeInput` and `datetime/DurationInput` (D+Tc rules, daylight saving notice); dates shown as "dd-Mmm-yyyy HH:mm" with the zone [suggested].
- CNA-0440, CNA-1080 [M]: labelled fields through `noting/FormField`, with required marks and errors under the control.
- The fields are stacked one per line; side-by-side fields belong only in `FormRow` [suggested].
- The author shows in view mode [suggested].
- Saving needs date, time, duration and type [suggested]; host data quality checks run on the server.

## Do and don't

- Do default the draft from the appointment and working context through `defaultValue`.
- Don't let the duration default silently; the control asks for it.

## Accessibility

- View mode is an `article` with a heading; edit mode is built from the forms area: date, start time and duration side by side in a `FormRow` (bare datetime inputs in `FormField`s, so controls stay level when a label wraps and stack on a narrow row), contact type and setting as `Select`s, participants as a `CheckboxGroup`, the note as a `TextArea`; errors are linked to their fields and the blocking message is a `shell/Message` announced as an alert.

## Regional behaviour

- Date and time inputs follow the region (AU and NZ clock changes); value sets come from the host.
