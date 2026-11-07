# TimeInput

Time entry on the 24-hour clock with element editing, shortcuts, a spin control inside the field and an optional Approx check box.

## When to use

Times of events, administration times, time of birth. Pair with DateInput for date and time.

## What you provide

- `label` (required), `value` / `defaultValue` / `onChange` with `{ hours, minutes, seconds? }`, `"unknown"` or `null`.
- `showSeconds`, `allowApproximate` with `approximate` / `defaultApproximate` / `onApproximateChange`, `allowUnknown`, `unknownText`.
- `placeholder`, `instructions`, `showClockIndicator`, `referenceTime`, `onDayRollover`, `error`, `disabled`, `readOnly`, `required`.
- `warnAtMidnight` (ACSQHC 2024 dose scheduling), `date` and `onTimeZoneIssue` (skipped and repeated hours), `region`.

```tsx
<TimeInput label="Time of birth" value={t} onChange={setT} allowApproximate />
```

## Guidance implemented

- D+Tc-0020, D+Tc-0021 [M] displayed per Time Display, 24-hour clock only; 12-hour entries (2pm) are rejected with a message.
- D+Tc-0022 [M] "Approx" check box with a capital A, to the right of the field.
- D+Tc-0023 [M] hours, minutes and seconds individually editable (click or Left and Right selects an element, then type).
- D+Tc-0024 [M] instructions: "Enter a time using the 24-hour clock, e.g. 13:05 or a shortcut, e.g. +3h."
- D+Tc-0025 [M] shortcuts +3h, -2m, 30s relative to the current value (m means minutes here).
- D+Tc-0043 [M] "24-hour clock" shown next to the field.
- D+Tc-0044 [M] date units (d, w, y, months) rejected with a message.
- D+Tc-0026 [M] "Unknown" can be entered; "Un" completes it.
- D+Tc-0027, D+Tc-0045 [M/R] default input mask "hh:mm" or "hh:mm:ss".
- D+Tc-0028 [M] with the whole value or nothing selected, spin steps the smallest displayed unit, carrying into larger units.
- D+Tc-0029 [M] with one element selected, spin changes only that element.
- D+Tc-0047 [M] focus selects the whole value.
- Spin buttons inside the field; Up and Down arrow keys spin [suggested].
- 24:00 is rejected, midnight is 00:00 (D+Tb-0009).
- Shortcuts that cross midnight wrap and report `onDayRollover` [suggested]; the host moves the date.

## Inside FormField (bare mode)
- `bare` [suggested] renders the field box only: no visible label, the instructions become a screen-reader description (the tooltip stays), and the host `error` is not drawn. Put it in a `FormField` (which passes `id`, `aria-describedby`, `aria-invalid` and `aria-required`) or name it with `aria-labelledby`. Keep `label`: it still names the in-field buttons.
- The control's own validation messages go to `onValidationChange(message | null)`; show them as the FormField `error`. Without `onValidationChange` they are still drawn below the box, so a message is never lost.
- Disambiguation prompts, calendars and notices still open from the control. In a `FormRow` they open in the control track and push only the feedback track below.

```tsx
const [msg, setMsg] = useState<string | null>(null);
<FormField label="Date of birth" required error={msg ?? undefined}>
  <TimeInput label="Date of birth" bare onValidationChange={setMsg} />
</FormField>
```

## Do and don't

- Do show seconds only when the time is accurate to the second.
- Don't offer am/pm or a 12-hour mode.

## Typed text that is not committed yet

The value is committed when the person leaves the field or presses Enter. Until then the typed text survives a re-render and a remount of the control with the same `id` (a host that draws it in another frame at a new width, such as a drawer becoming a bottom sheet when a tablet is turned): the new control takes over the text the old one held a moment before [suggested]. Give the control a stable `id` when the host may remount it.

## Accessibility

Visible label, instructions and "24-hour clock" linked with `aria-describedby`, errors announced with `role="alert"`. Spin buttons are not in the tab order because Up and Down do the same from the field.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Clock | 24-hour, HH:mm with colon | 24-hour with colon (ACSQHC 2024; AU-DT-05) | 24-hour (G11 7.1) |
| 00:00 | allowed | allowed; with `warnAtMidnight` a warning suggests another time such as 23:30 (ACSQHC 2024; AU-DT-06 [R]) | allowed; `warnAtMidnight` available [suggested] |
| With `date` | GMT/BST skipped and repeated hours flagged in Europe/London [suggested] | skipped hour (first Sunday in October) and repeated hour (first Sunday in April) flagged in the locale's zone (AU-DT-09); none in Brisbane, Darwin, Perth | skipped hour (last Sunday in September) and repeated hour (first Sunday in April) flagged; Chatham changes at 02:45 (G11 7.2) |
| "Now" for spin and shortcuts | browser time | wall-clock time in the locale's zone | as AU |

The midnight and time zone messages are warnings in a `role="status"` area; the value is kept and the host decides. `warnAtMidnight` is off by default in every region because not every time field is a dose schedule. Sources: G10-australia.md 8.2, 8.3; G11-new-zealand.md 7.1, 7.2.
