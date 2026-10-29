# DateInput

Free text date entry with an embedded calendar, arithmetic shortcuts, partial dates, Unknown and disambiguation of unclear entries.

## When to use

Any field where a clinician enters a date: date of birth, start and finish dates, date of onset. The host decides which date types are allowed in each context.

## What you provide

- `label` (required), `value` / `defaultValue` / `onChange` with a `DateInputValue` (`{ kind: 'full', year, month, day }`, `monthYear`, `year`, `unknown`) or `null`.
- `allowMonthYear`, `allowYear`, `allowUnknown` (default true), `unknownText`.
- `defaultDisplay` (`"mask"` or `"today"`), `placeholder`, `instructions`, `hideInstructions`.
- `referenceDate` for shortcuts, `today`, `min`, `max`, `validate` for host checks, `error`, `disabled`, `readOnly`, `required`, `name`.
- `region` (optional): AU and NZ read numeric dates day first.

```tsx
<DateInput
  label="Date of birth"
  value={dob}
  onChange={setDob}
  max={new Date()}
  validate={v => (isFuture(v) ? 'The date of birth is in the future. Please enter the correct date of birth.' : null)}
/>
```

## Guidance implemented

- D+Tc-0001 [M] values shown as dd-Mmm-yyyy.
- D+Tc-0002 [M] free text and calendar entry.
- D+Tc-0003 [M] day, month and year individually editable: click a part or use Left and Right to select it, then type; typed letters complete the month ("Se" gives Sep); Up and Down step the selected part [suggested].
- D+Tc-0004 [M] calendar icon inside the field boundary.
- D+Tc-0005, D+Tc-0038 [M] numeric entries such as 05/04/2009 are disambiguated.
- D+Tc-0006 [M] instructions list the allowed date types; built from the allowed types and shown as tooltip and visible hint.
- D+Tc-0007 [M] shortcuts relative to the current value: +3d, -2w, 1m, +1y (unsigned means later).
- D+Tc-0008 [M] "Unknown" can be entered; typing "Un" completes it.
- D+Tc-0009, D+Tc-0042 [M/R] default input: mask "DD-Mmm-YYYY" or today's date.
- D+Tc-0010 to D+Tc-0019 via CalendarPicker; D+Tc-0017 clicking away or the icon again closes it.
- D+Tc-0039 [M] incomplete entries (no year, month only) get a message explaining what was entered.
- D+Tc-0040 [R] at most two suggestions plus "different date".
- D+Tc-0041 [M] time units (h, min, s) are rejected with a message.
- D+Tc-0046 [M] focus selects the whole value; element editing still works.
- Host validation runs after internal disambiguation (min, max, `validate`).
- Month-end clamping for shortcuts (31-Jan +1m gives 29-Feb in a leap year) [suggested].
- Two-digit years offer both centuries, nearest first [suggested].
- Alt+Down opens the calendar [suggested].
- "t" for today only with `allowTodayShortcut` [suggested: not in the guidance].

## Inside FormField (bare mode)
- `bare` [suggested] renders the field box only: no visible label, the instructions become a screen-reader description (the tooltip stays), and the host `error` is not drawn. Put it in a `FormField` (which passes `id`, `aria-describedby`, `aria-invalid` and `aria-required`) or name it with `aria-labelledby`. Keep `label`: it still names the in-field buttons.
- The control's own validation messages go to `onValidationChange(message | null)`; show them as the FormField `error`. Without `onValidationChange` they are still drawn below the box, so a message is never lost.
- Disambiguation prompts, calendars and notices still open from the control. In a `FormRow` they open in the control track and push only the feedback track below.

```tsx
const [msg, setMsg] = useState<string | null>(null);
<FormField label="Date of birth" required error={msg ?? undefined}>
  <DateInput label="Date of birth" bare onValidationChange={setMsg} />
</FormField>
```

## Do and don't

- Do give a short descriptive label such as "Start date".
- Do allow partial dates only where the clinical context accepts them (for example date of onset).
- Don't put the calendar button outside the field.
- Don't accept a numeric date silently when day and month could be swapped.

## Accessibility

Real `<label>`, instructions linked with `aria-describedby` as well as the tooltip, errors announced with `role="alert"`, the prompt is an `alertdialog` that takes focus when a choice is needed, Esc closes the calendar and returns focus to the field.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Display | DD-Mmm-YYYY | DD-Mmm-YYYY (AU-DT-02) | DD-Mmm-YYYY (G11 7.1) |
| 05/04/2009 | asks: 05-Apr-2009 or 04-May-2009 (D+Tc-0005) | 05-Apr-2009, day first, no question (AU-DT-01) | 05-Apr-2009, day first (G11 7.1: accept DD/MM/YYYY and D/M/YYYY) |
| 04/13/2009 | accepted as 13-Apr-2009 (only one reading is real) | refused: "Dates are entered day first (DD/MM/YYYY), so 13 would be the month" | refused, as AU |
| Two-digit year | asks for the century, or for a word month when day and month could swap | asks for the century only | as AU |
| Default instructions | "Enter a date e.g. 05-Apr-2008, ..." | adds "or 05/04/2008 (day first)" | as AU |
| Today | browser date | date in the locale's time zone | date in the locale's time zone |
| Calendar day headings | Thu | Thur (ACSQHC 2024) | Thu |

The order comes from `NUMERIC_DATE_ORDER` (`utils/regions/dates.ts`); `parseDateInput` also takes `numericOrder` directly. The field still re-displays the date with the month as a word, so the user sees how it was read. Sources: G10-australia.md 8.1; G11-new-zealand.md 7.1.
- Under a coarse pointer the calendar button is a 44px target and the box widens by as much, so the format hint still fits [suggested].
