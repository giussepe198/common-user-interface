# DurationInput

Duration entry that accepts units singly or combined, with or without spaces, asks whether "m" means months or minutes, and warns when the period crosses a daylight saving change (GMT/BST in GB).

## When to use

Infusion durations, lengths of stay, treatment courses, intervals.

## What you provide

- `label` (required), `value` / `defaultValue` / `onChange` with `ClinicalDurationParts` or `null`.
- `units` (display symbols), `aliases` (extra accepted spellings), `allowApproximate` and its state props.
- `instructions`, `placeholder`, `startDateTime` and `onTimezoneNotice` for the daylight saving notice, `timeZone` (default: the locale's zone), `region`, `error`, `disabled`, `readOnly`, `required`.

```tsx
<DurationInput label="Duration" value={d} onChange={setD} startDateTime={start} />
```

## Guidance implemented

- D+Tc-0030 [M] values shown in Time Display duration format (2hr 40min).
- D+Tc-0031 [M] instructions list the units; the default adds "w = week" to the Quick Implementation Guide text because weeks are in the minimal set [suggested].
- D+Tc-0032 [M] units entered singly or in combination.
- D+Tc-0033 [M] elements editable as free text (focus selects all for quick re-entry).
- D+Tc-0034 [M] minimal set y, m, w, d, hr, min, sec.
- D+Tc-0035 [R] extended spellings (hrs, mins, weeks) allowed; clashes between units are refused.
- D+Tc-0036 [R] optional spaces: "3 hr 5 min" equals "3hr 5min".
- D+Tc-0037 [R] bare "m" asks "Did you mean: 6 months or 6 minutes?"; it is read as months without asking when years come before it or weeks or days after it [suggested policy].
- D+Tc-0048, D+Tc-0049 [R] when start plus duration crosses a clock change (on entry or when the start changes), a notice uses the Quick Implementation Guide wording.
- D+Tb-0018 decimals and fractions rejected with a message.
- Clock changes come from the platform's time zone database (Intl, IANA tzdb) through `describeDaylightSavingSpan`, so earlier years are also right; `spansGmtBstChange` and `describeGmtBstSpan` remain as GB wrappers.

## Do and don't

- Do supply `startDateTime` when the duration feeds a schedule.
- Don't accept "m" as minutes silently.

## Accessibility

Visible label, instructions linked with `aria-describedby`, errors with `role="alert"`, the committed duration is announced in words through a polite live region, the GMT/BST notice is a `role="status"` region with an OK button.

## Regional behaviour

| | GB | AU | NZ |
|---|---|---|---|
| Zone | Europe/London | locale zone, default Australia/Sydney | locale zone, default Pacific/Auckland |
| Notice | "This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00. During BST, ..." (QIG wording) | same pattern with AEST/AEDT, ACST/ACDT or LHST/LHDT, e.g. "AEDT runs from 04-Oct-2026 02:00 to 04-Apr-2027 03:00"; Lord Howe "forward 30 minutes such that 02:00 becomes 02:30" [suggested wording] | same pattern with NZST/NZDT or CHAST/CHADT [suggested wording] |
| No daylight saving | n/a | Brisbane, Darwin, Perth, Eucla: no notice | n/a |

Durations that feed a schedule should still be computed on elapsed time (AU-DT-09; G11 7.2), which `addClinicalDuration` does for hours, minutes and seconds. Sources: G10-australia.md 8.3; G11-new-zealand.md 7.2.
