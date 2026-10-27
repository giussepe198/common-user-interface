# AdministrationRecordingForm

Form for recording one administration as given or not given, with dose, time, who administered and optional details, opened from an event on the drug chart.

## When to use

- When a clinician selects a Due, Overdue, Next, Future or As Required event to record it, or a recorded event to change it.
- `DrugAdministrationChart` uses it automatically; use it directly when you build your own layout.

## What you provide

- `medication` (name, details, kind, route, dose variation), `event`, `now`, `onSubmit`, `onCancel`.
- Optional: `currentUser`, `notGivenReasons`, `sites`, `nilByMouth`, `outstandingEvents`, `onClear`.

```tsx
<AdministrationRecordingForm
  medication={med}
  event={event}
  now={new Date()}
  currentUser="Staff Nurse A Example"
  nilByMouth={patient.nilByMouth}
  outstandingEvents={adminOutstandingEvents(med, now, event.id)}
  onSubmit={payload => save(payload)}
  onCancel={close}
/>
```

## Guidance implemented

- MEDa-0195, 0204 [M]: field set changes with the outcome; default is Given.
- MEDa-0196, 0199 [M]: mandatory fields first, then a named "Optional details" group.
- MEDa-0197 [M]: structured fields derived from the drug (dose range or criteria hints).
- MEDa-0200 [M], 0201, 0203 [R]: optional notes area and a "More options" control for site and self-administration.
- MEDa-0205, 0206 [M]: "Record administration" is the default action for Enter; explicit "Cancel".
- MEDa-0207 [R]: time pre-filled with now; dose pre-filled from the intended dose, but never for a dose range drug.
- MEDa-0239 [M]: administration time cannot be in the future.
- MEDa-0185 [M]: witness is mandatory when the event requires one.
- MEDa-0210, 0212 [R]: free dose entry for partial doses; site from a limited list.
- MEDa-0260 [M]: "Clear the event details" for a recorded event; history kept by the consumer.
- MEDa-0283 [R]: "Unknown" can be recorded as a not-given reason.
- MEDa-0284 [R]: message listing earlier events with no recorded status.
- MEDa-0164 to 0167 [M]: for an oral drug while Nil by Mouth, a reminder first offers "Skip this administration" (not given, Nil by Mouth) or "Record an administration"; both still need an explicit confirm.
- Given status is derived: Overdue gives "Given late", Next or Future gives "Given early", Once Only gives "Given (once only)".

## Do and don't

- Do place the form next to its event without covering the drug details or the event (MEDa-0191 to 0193), and keep it fully on screen (MEDa-0245).
- Don't record from a single click on the chart; opening the form and confirming are two actions.
- [suggested] Esc cancels. The default not-given reasons and the four-day date list are [suggested].

## Accessibility

- Labelled fields, fieldsets with legends, radio group for outcome.
- On submit with errors, an error summary receives focus with links to each field; fields have `aria-invalid` and described-by error text.
- The first field receives focus on open.

## Regional behaviour

- GB: "Not given" with a reason from `notGivenReasons` (CUI fig 95 example set), unchanged.
- AU: "Not administered" with "Reason for not administering" listing the NIMC codes A, F, R, V, L, N, W, S, with P (parent/carer administered) only when `paediatric` is set. Each option shows the code and meaning, and the full legend appears under the field. W requires a written reason; R and N show "Notify the prescriber" with a "Prescriber notified" tick (AU-MD-09). Skipping while Nil by Mouth records F (Fasting). S and P record the dose.
- NZ: "Non-administration code" listing CP, D, N, R, RV, SM, U, W (HQSC NMC Figure 22). D, N, RV and W require a reason; N prompts to notify the prescriber; R shows "Offer again within one hour"; CP and SM record the dose. [suggested] Skipping while Nil by Mouth records D (prescriber's instructions, which covers peri-operative omissions); NZ has no Nil by Mouth code.
- AU and NZ also offer "Unknown (outcome not known)" [suggested], keeping MEDa-0283.
- The payload adds `reasonCode`, `reasonText` and `prescriberNotified`. For S, P, CP and SM `outcome` is 'notGiven' (not given by staff) while `status` is an administered status, so the icon is filled.
- `reasonCodes` replaces the national list for a local variant. Sources: G10 9.6, G11 8.2.
