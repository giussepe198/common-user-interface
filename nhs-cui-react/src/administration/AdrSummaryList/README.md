# AdrSummaryList

The patient's adverse drug reaction summary (AU: allergies and ADR; NZ: Allergies & Adverse Reactions), with the "no known" flow and the deactivated summaries list.

## When to use

- Wherever medicines are prescribed or administered, and as the start of adding, viewing, editing or removing entries.
- Pair with `AdrRecordingDialog` (add, edit) and `AdrDetailsView` (details, remove).

## What you provide

- `entries` (removed ones included, with `removed`, `removedAt`, `removedBy`, `removedReason`), `statusRecord` for a positively recorded "no known" or "unknown", `currentUser`.
- Callbacks: `onAdd`, `onOpenDetails(id)`, `onRecordStatus(record)`, `onClose`. `highlight` marks entries added or changed in this viewing.

```tsx
<AdrSummaryList
  entries={entries}
  statusRecord={record}
  currentUser="Staff Nurse A Example"
  sources={['Patient testimony', 'Clinical documentation']}
  highlight={{ [justAddedId]: 'New' }}
  onAdd={openDialog}
  onOpenDetails={showDetails}
  onRecordStatus={saveStatus}
  onClose={close}
/>
```

## Guidance implemented

- RAD terminology rules [M]: titled "Adverse drug reaction summary"; agent bold, reactions after it.
- RAD-0010, 0010.1, 0010.2 [M], 0010.3, 0010.3.1, 0010.3.3, 0010.3.4 [R]: "Add new drug reaction" always visible, top right, next to Close.
- RAD 5 principle, RAD-0760 to 0760.4, 0760.6 [R], 0760.5 [M]: when nothing is recorded, "No known adverse drug reaction risks" sits with Add and Close.
- RAD-0770, 0780 [M], 0790, 0800, 0810 [R], 0820 [M]: choosing it shows the phrase, date of entry and author, a source drop-down and a details field; Close becomes Finish; the button stays disabled.
- RAD-0630, 0640, 0650, 0660 [R]: "New" or "Updated" beside the entry (you clear `highlight` when the summary is closed, RAD-0670).
- RAD-0680.1 [R]: each entry opens its details view, where it can be edited or removed.
- RAD-0710 [M]: "Display deactivated summaries" lists removed entries with when, who and the reason (RAD-0720).
- An empty list is never shown as "no known": with no entries and no record it shows a "not recorded" warning (RAD 5 principle; AU-AL-01; G11 9.2). Entries always win over a status record.
- [suggested] Cancel abandons a status being recorded; GB "not recorded" wording "Adverse drug reaction status not recorded".

## Do and don't

- Do save who and when with every status record; a record without them reads as not recorded.
- Don't show "no known" because a query returned nothing.
- Don't use "risk" or "propensity" in your own labels around it.

## Accessibility

- Section labelled by its heading; the list of entries is a labelled list of buttons.
- The pending status block takes focus and has a name; its error is an alert and the field has `aria-invalid`.
- "Not recorded" uses the warning symbol and text, not colour alone. Removed entries say "Removed" in text as well as being struck through.

## Regional behaviour

- GB: one positive state, "No known adverse drug reaction risks"; no "Unknown".
- AU: title "Allergies and adverse drug reactions (ADR)", buttons "Nil known" and "Unknown", "Not recorded" as a warning (AU-AL-01, NIMC box). Entries show type and date (AU-AL-03). EMM business requirements 3.4: recording "no known allergies" is not the same as recording nothing.
- NZ: title "Allergies & Adverse Reactions", "No known allergies or adverse reactions" (the NMC "No", signed and dated), "Unknown" requiring the reason (document why in the health record), and the "New this admission" tag (G11 9.2). Label text is [UNCERTAIN] in G11 and set in `ADR_SUMMARY_WORDING`.
- Sources: NIMC User Guide, EMM business requirements (safetyandquality.gov.au); HQSC NMC user guide 2021 (hqsc.govt.nz).
