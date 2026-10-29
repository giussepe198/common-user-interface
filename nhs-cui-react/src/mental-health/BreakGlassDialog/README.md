# BreakGlassDialog

Emergency access to a record without a legitimate relationship: a reason, a written justification, a time box and a declaration, then the host's step-up.

## When to use

- When a search finds a person the user has no relationship with and they need the record in an emergency. Pair with `BreakGlassBar` once access is granted.

## What you provide

- `open`, `onClose`, `onConfirm(request)`, `reasons` (host value set), `durations`, `defaultMinutes`, `maximum`, `minimumLength` (default 20), `declaration`, `person` (`name`, `identifiers` in the banner's words), `includesRestricted`, `stepUpNote`, `error`, `busy`.

```tsx
<BreakGlassDialog open={open} onClose={close} reasons={host.valueSets.breakGlassReason}
  person={{ name: 'NGUYEN, Thi Lan', identifiers: 'Born 12-Mar-1990 (36y), Record number 004512' }}
  onConfirm={(r) => api.breakGlass(personId, r)} />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- G12 2 and MHR-03, CUI `MyHealthRecordStatus` emergency access pattern: conditions shown, a required ground, a reason in the user's words, an acknowledgement, confirm disabled until complete with a hint saying what is missing, Esc cancels.
- Reason from a list, justification of at least 20 characters with a live count, a time box from the service's choices with the maximum shown; the primary action names the duration [suggested].
- Every opening starts afresh (the form mounts only while open); calm, informative friction [suggested].
- Step-up is the host's next step; `stepUpNote` tells the user [suggested].
- The person's identifiers are shown in the dialog [suggested].
- Declaration wording is [suggested].
- Core has no dialog yet; an area-internal modal shell follows the CUI `ListDialog` pattern (focus in and back, Tab trapped, Esc closes) [suggested: replace with the foundation dialog].

## Do and don't

- Do record the grant, reason and duration on the server and notify the privacy officer.
- Don't prefill the reason or the justification.

## Accessibility

- Built on `shell/Dialog` (`role="dialog"`, `aria-modal`, focus kept inside and returned, Esc closes, a full-screen sheet on a phone), labelled by the title and described by the lead; the reasons and durations are `forms/RadioGroup`s, the explanation a `forms/TextArea` in a `FormField`, the declaration a `forms/Checkbox`; the count is a polite live region; a refusal is a `shell/Message` announced as an alert; 44px targets on coarse pointers.

## Regional behaviour

- None in the control; reasons and durations come from the host.
