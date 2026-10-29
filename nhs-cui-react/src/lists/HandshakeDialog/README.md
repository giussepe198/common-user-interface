# HandshakeDialog

A dialog that records a handover event and the transfer of responsibility (the handshake): accepted, refused, or recorded afterwards as unsatisfactory.

## When to use

When a giver hands one or more items (patients or tasks) to a receiver, face to face or not. Open it from `HandoverTaskList`'s `onRecordHandover`.

## What you provide

```tsx
<HandshakeDialog
  items={[{ id: 'p1', label: 'SMITH, John (Mr), bed 1' }]}
  giver="Dr A Mensah (FY1, day)"
  receiver="Dr L Brennan (FY1, night)"
  place="Elkington Ward office"
  dateTime={new Date()}
  onSubmit={record => save(record)}
  onCancel={close}
/>
```

`onSubmit` receives a `HandshakeRecord` with the outcome, time, place, people, reason, satisfaction, incident flag and refusal reason. Stamp it with the user and time on the server.

## Guidance implemented

The handover source is a requirements spreadsheet, not a visual guide: layout and wording are `[suggested]` unless quoted.

- RID 20 [R] record the handover event and transfer of responsibility, including asynchronous handovers (`place` can be "Telephone").
- RID 22 [R] the receiver controls the transfer: default `actingAs="receiver"` with "Accept responsibility".
- RID 87 [E] giver or receiver may refuse; the refusal reason is required and the refusal is recorded like an acceptance.
- RID 27 [E] date, time, place, giver, receiver, others present and satisfaction: mostly captured automatically, the user confirms. Time is shown in the CUI format and can be changed with the CUI `DateInput` and `TimeInput` (24-hour clock), never a native date-time input.
- RID 28 [R] reason for handover.
- RID 31 [R] unsatisfactory handover recorded, also retrospectively (`retrospective`), with a time, date and user stamp; RID 139 flag as an incident.
- RID 36/115 [E] single-item, ad hoc handovers are allowed.
- RID 108 [E] key facts are read back before accepting: pass `pendingReadBack` (the ids whose read-back is not confirmed) and the items are marked "Read back not confirmed"; "Accept responsibility" then shows an error naming them, while a refusal can still be recorded `[suggested]`. Enforce the same rule on the server.
- RID 30 [E] the dialog never blocks access to patient records; it says so.
- Uses "giver" and "receiver" (Introduction to Handover), never "incoming" or "outgoing".

## Do and don't

- Do let the receiver confirm the transfer.
- Don't lock users out of a record because a handover is incomplete.
- Don't discard refusals: store them with the same detail as acceptances.

## Accessibility

- Labelled form fields, a `fieldset` for satisfaction, and errors in an alert region with an icon and text.
- Esc cancels; focus is kept inside the modal dialog and returns to the opener.
