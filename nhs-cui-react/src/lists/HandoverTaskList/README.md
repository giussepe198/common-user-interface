# HandoverTaskList

A handover list that shows each patient's responsibility, handover state, read-back prompt and tasks, followed by tasks not linked to a patient.

## When to use

Shift handover, geographic transfer and ad hoc handover of one or more patients and their tasks. Pair it with `HandshakeDialog` to record the transfer.

## What you provide

```tsx
<HandoverTaskList
  patients={[{ id: 'p1', familyName: 'Smith', givenName: 'John', title: 'Mr', location: 'Elkington Ward, bed 1',
    responsible: { name: 'Dr A Mensah', role: 'FY1' }, consultant: 'Dr Okafor', handoverState: 'toHandOver',
    readBackReasons: ['Resuscitation status: DNACPR'] }]}
  tasks={[{ id: 't1', patientId: 'p1', description: 'Repeat U&E', status: 'incomplete', due: '2026-10-27T18:00' }]}
  onStatusChange={setStatus}
  onRemoveTask={removeTask}
  onReadBackConfirm={confirmReadBack}
  onRecordHandover={openHandshake}
/>
```

Pass `similarNames` to flag similar names (PAL-0560) such as SMITH, John and SMITH, Jon for read-back. Use the same function you pass to `PatientList` so the ward list and the handover list warn about the same pairs:

```tsx
const similarNames = (a, b) => sameFamilyName(a, b) && soundsLike(a.givenName, b.givenName); // your phonetic test
<HandoverTaskList patients={patients} tasks={tasks} similarNames={similarNames} />
```

Statuses default to `HANDOVER_TASK_STATUSES` (Incomplete, Partially completed, Completed). Pass richer sets ("Bloods taken", "Sent", "Checked and acted on") with an icon and label for each.

## Guidance implemented

The handover requirements give requirements, not visual designs: layout and wording are `[suggested]`.

- RID 11, 7 [E] patients identified with name, date of birth and NHS number in NHS formats; RID 68 missing values show "Unknown".
- RID 25, 84 [E] current location, including non-standard locations ("En route from A&E").
- RID 12, 64 [E] always clear who is responsible: an item with no one responsible is shown as an error and summarised in an alert; RID 89 [R] responsible clinician and consultant.
- RID 82 [R] "Handed over" / "To hand over" state with icon and text.
- RID 85 [R] patients first, then tasks within each patient; RID 83 [E] tasks not linked to a patient listed separately.
- RID 75 [E] unambiguous task status, icon plus text, extensible; RID 53 [E] overdue tasks flagged; RID 123 time-dependent wording ("Before morning ward round").
- RID 51/52 allocation shown; RID 54 [R] "For handover" highlight; RID 80 [E] "Added after handover" flag; RID 21 [R] completed by and vouched by.
- RID 104 [R] tasks are removed manually ("Remove from list" on completed tasks), never on their due date; RID 122 [E] "Hide completed tasks" keeps a link to show them again.
- RID 108 [R] read-back prompt for key information: added automatically for identical names on the list and for similar names found by your `similarNames` test (PAL-0560, "has a name like ... confirm given name"), plus any reasons you give (for example resuscitation status, RID 137).
- RID 141 provenance: "Last updated 27-Oct-2026 19:40 by Dr A Mensah".
- RID 3 [E] quick link from the summary to the full record (`onOpenPatient`).

## Regional behaviour

Set `region` or wrap in `ClinicalLocaleProvider`. GB shows "NHS No.". AU shows IHI then URN (`ihi`, `mrn`; G10 1.6) with family name upper case and no title; NZ shows the NHI unbroken (`nhi`; G11 1.3) with names as recorded and macrons kept. In AU and NZ, names differing only by macrons are flagged for read-back as similar ("has a name like") `[suggested]` unless you supply `similarNames`, which replaces that default in every region (as in `PatientList`), and the read-back reason names the region's identifier.

## Do and don't

- Do keep tasks in the shared record; this list displays them, it is not a handover copy (RID 9, 39).
- Don't prioritise tasks across patients; order patients, then tasks within each patient.
- Don't use colour alone for status, state or overdue: each has an icon and words.

## Accessibility

- Patients are an ordered list of labelled items with headings; tasks are lists.
- Status selects have names ("Status for Repeat U&E"); remove buttons name the task.
- The no-one-responsible summary is an alert region.
