# Dates, times, display standards, symbols

Status key: [M] = Mandatory, [R] = Recommended (as labelled in source tables). Guideline IDs are the source's own.

## Design Guide Entry – Date Display, v5.0.0.0 (datedisplay)
- Purpose: unambiguous display of single, precise dates in NHS clinical apps. Two permissible formats: Short (DD-MMM-YYYY) for clinical use, Long (DD Month YYYY) for patient-facing communications.
- Scope: English only; display layer only (stored value e.g. ISO is transformed for display). Out of scope: date entry (see Date and Time Input), approximate dates, default dates, labels, fonts/colours, RTL/Cyrillic/ideographic languages, languages needing >3-letter month abbreviations (e.g. French Juin/Juillet).
- Key principles: eliminate month/day confusion; minimise space; natural reading order; avoid date being misread as other data; consistency via two permissible formats.

### General (both formats)
- D+Ta-0002 [M] Display month textually, never numerically.
- D+Ta-0003 [M] Month with only first letter capitalised ("Apr", "April"; never "APR"/"APRIL").
- D+Ta-0004 [M] Year always numeric, four digits.
- D+Ta-0005 [R] Align dates when displayed in a vertical column (e.g. table). Left or right NOT specified (v5 removed right-alignment requirement); developer's choice. Note: right alignment won't perfectly align month names unless monospaced font.
- D+Ta-0016 [R] Day-of-week abbreviations exactly: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
- D+Ta-0017 [R] Day of week optional; if shown, placed immediately before the day value, single space separator: "Tue 01-Jan-2008".
- Rationale: do NOT show day of week for date of birth or date of death (not relevant). Encouraged for appointments, handover, scheduling.
- D+Ta-0022 [M] Null date displayed with an appropriate value, e.g. 'Unknown' or 'Not recorded' (never blank/epoch).

### Short date format DD-MMM-YYYY (section 2.2)
- D+Ta-0006 [M] Use short format in all instances of clinical usage affecting patient treatment, including patient identification (e.g. date of birth, medication start/end dates, appointment dates).
- D+Ta-0018 [M] Day as two digits, leading zero for <10 ("05").
- D+Ta-0007 [M] Month as three-letter abbreviation: Jan, Feb, Mar, Apr, Jun, Jul, Aug, Sep, Oct, Nov, Dec; **May displayed in full** (it is already three letters: "May").
- D+Ta-0008 [M] No punctuation on month (no full stop: "Sep" not "Sep.").
- D+Ta-0009 [M] Single hyphen between day-month and month-year.
- D+Ta-0010 [M] Ignore user's regional settings for short format (fixed, culture-invariant).
- Correct: 01-Jan-2008, Tue 01-Jan-2008, 28-Feb-2008, Thu 28-Feb-2008, 05-Apr-2008, Sat 05-Apr-2008, 31-Dec-2008, Wed 31-Dec-2008.
- Incorrect (do NOT): 8-04-08, 08-04-2008, 08/04/2008, 08.04.2008, 08 04 2008 (Patient Safety Critical: numeric month); 8-Apr-2008, 08-Apr-08, 8-Apr-08 (incomplete); 08/Apr/2008, 08.Apr.2008 (separator unnoticed); 08 Apr 2008 (lack of distinctiveness: merges with NHS number in a banner, e.g. "401 023 2137 08 Apr 2008").
- Accessibility: short format suits screen magnification (narrow). Screen readers: hyphen OK; "Apr" poorly voiced, "Jun"/"Jul" sound similar; JAWS date pattern recognition cannot be presumed.

### Long date format DD Month YYYY (section 2.3)
- D+Ta-0011 [M] Use long format when communicating with the patient (leaflets, letters, consent forms, appointment cards; all communications with non-clinical readers).
- D+Ta-0019 [M] Day as two digits with leading zero, unless day displayed in ordinal form (then "1st", "3rd" with no zero).
- D+Ta-0012 [M] Month name in full ("January").
- D+Ta-0013 [M] Single whitespace between day-month and month-year.
- D+Ta-0014 [M] Long format follows user's DEFAULT regional settings, ignoring any user customisations to those defaults.
- D+Ta-0015 [R] Use long format when interacting with screen readers (month names read in full). => e.g. aria-label with long date.
- D+Ta-0020 [M] Ordinal suffix only one of: st, nd, rd, th.
- D+Ta-0021 [M] Ordinal suffix lower case and superscript, immediately after the number (no space): 1<sup>st</sup> January 2008.
- Correct: 01 January 2008, 1st January 2008, 22 February 2008, 22nd February 2008, 03 April 2008, 3rd April 2008, 14 December 2008, 14th December 2008.
- Incorrect: numeric months (Patient Safety Critical); "8 Apr 2008", "08 April 08" (incomplete); 08/April/2008, 08.April.2008; "08th", "2ND", "1sT", "23Rd" non-superscript/wrong-case/wrong-suffix (Patient Safety Critical: non-superscript suffix e.g. "st" may be read as unit/abbreviation such as ST = sinus tachycardia/soft tissue, st = standing).
- Patient safety: numeric day/month ambiguity across locales (US MM/DD vs UK DD/MM) is the core hazard; increasingly international workforce.

## Design Guide Entry – Time Display, v4.0.0.0 (timedisplay)
- Purpose: display of exact times, approximate ("fuzzy") times, time durations, and date+time combinations. Format notation follows .NET DateTime format strings (HH = 24h hours).
- Out of scope: time entry, sub-second durations (smallest unit is a second), labels, clock synchronisation, display styles, storage.

### Exact time (2.1)
- D+Tb-0001 [M] 24-hour clock only (never AM/PM).
- D+Tb-0032 [M] Provide indication to the user that the 24-hour clock is in use. (Source gives no specific mechanism; [suggested] e.g. header/tooltip "24-hour clock" or "(24hr)" label hint.)
- D+Tb-0002 [M] Exact time as HH:mm.
- D+Tb-0003 [M] Hours two digits, leading zero (<10 -> "04").
- D+Tb-0004 [M] Minutes two digits, leading zero.
- D+Tb-0005 [M] Seconds two digits, leading zero.
- D+Tb-0006 [M] Colon between hours and minutes. D+Tb-0007 [M] colon between minutes and seconds.
- D+Tb-0008 [M] Single white space separates date and time values ("12-Jun-2006 02:30").
- D+Tb-0009 [M] Midnight = 00:00. Never 24:00.
- D+Tb-0010 [M] Last minute of day = 23:59.
- D+Tb-0011 [M] Null times shown with appropriate value, e.g. 'Unknown', 'Not recorded'.
- D+Tb-0012 [R] Display seconds only if required (HH:mm:ss for times accurate to the second).
- D+Tb-0013 [R] Time ranges = two adjacent time displays, each with a contextual label, e.g. 'From' and 'To'. Elapsed time may be shown as a duration.
- Correct: 12:35, 04:59, 00:25; 12:35:01, 04:59:58, 00:25:12; "Mon 12-Jun-2006 02:30", "Fri 24-Apr-1998 10:45", "Sun 05-Sep-2000 17:13", "Sat 01-Dec-1970 00:05"; "12-Jun-2006 02:30".
- Incorrect: "12:35 AM/PM"; "12 35", "12.35"; "24:00"; "10:5", "1:7", "3:5:8"; "12-Jun-2006-02:30", "24-Apr-199810:45", "05-Sep-2000:17:13", "01-Dec-1970T00:05" (no ISO "T" in display).
- Patient safety: 12-hour clock causes noon/midnight confusion; supporting both notations confuses; 24h is standard in safety-critical industries.

### Approximate time (2.2)
- D+Tb-0014 [M] Precede approximate time with the word 'Approx' (exact spelling/case, no full stop).
- D+Tb-0015 [M] Time value itself follows exact-time rules.
- D+Tb-0016 [M] Single white space between 'Approx' and HH: "Approx 03:56", "Approx 00:00".
- Incorrect: "near 00:00"; "14:47 Approx" (suffix not allowed).

### Time duration (2.3)
- D+Tb-0017 [M] Durations use years, months, weeks, days, hours, minutes, seconds as appropriate.
- D+Tb-0018 [M] Whole numbers only (1, 5, 60); never decimals or fractions (0.5, 1.5, 3/4).
- D+Tb-0033 [M] Minimal unit abbreviation set: y (years), m (months), w (weeks), d (days), hr (hours), min (minutes), sec (seconds). Same symbol singular/plural ("1hr", "2hr").
- D+Tb-0034 [R] Abbreviation set may be extended (e.g. 'hrs' as well as 'hr') provided each addition is unique across the whole set.
- D+Tb-0026 [M] Omit zero-valued units.
- D+Tb-0027 [M] Value+unit pairs with NO whitespace between value and unit ("20sec").
- D+Tb-0028 [M] Single white space between pairs ("2hr 40min").
- D+Tb-0029 [M] Units in decreasing order of significance (y m w d hr min sec).
- D+Tb-0030 [M] Approximate duration preceded by 'Approx'. D+Tb-0031 [M] single white space after 'Approx' ("Approx 2hr 40min").
- Correct: 20sec, 10min, 15min 55sec, 23hr, 2hr 40min, 4hr 32min 16sec, 1m 2d 3hr 17min, 3d 40min, 26w 5d, 1m 5d 12hr, 26d 5hr 34min, 1y 10m 2w 12d 20hr 12min (note: source example has 12d alongside 2w; i.e. source does not mandate normalisation of carries), 5 days 50 minutes -> "5d 50min".
- Incorrect: 0.5min, 1.5hr, 3/4hr; 15min55sec, 2hr90min, 4hr32min16sec, 3d40min, 1m05d12hr (no separators / leading zeros); "3d 90m", "1m 30m" (m for minutes is ambiguous with months: minutes MUST be "min").
- Context-specific rules (e.g. patient age) are out of scope of this doc.
- Rationale: m vs min distinction is the main hazard; 'hr' chosen over 'hrs' for singular/plural consistency.

## Design Guide Entry – Date and Time Input, v3.0.0.0 (datetime)
- Purpose: safe entry of fully/partially specified dates, times (incl. approximate), arithmetic shortcuts and durations, via free text, calendar, spin control; plus disambiguation. Precondition: input controls display values per Date Display (short format) and Time Display.
- In scope: fully specified dates (day, month, year); fully specified times (hh, mm, optional ss); partially specified dates (year only; month and year); approximate dates/times; arithmetic shortcuts (e.g. '+2d'); durations. Out of scope: developer default dates, sub-second durations, sync, styles, storage. Long-format date entry "under review".
- Key principle: system uses a calendar database recognising the GMT/BST change.
- Host app decides which date types (full/partial/approx) are permitted per clinical context.

### Free text date input (2.1) – control anatomy: free text input area; calendar control; calendar icon to open it; context-dependent default input; disambiguation facility. Short descriptive label wherever used.
- D+Tc-0001 [M] Any date displayed in the control uses Date Display standard (dd-MMM-yyyy).
- D+Tc-0002 [M] Allow both free text entry and calendar entry.
- D+Tc-0003 [M] Day, month, year individually editable (e.g. each element of 05-May-2006).
- D+Tc-0004 [M] Calendar icon INSIDE the boundary of the date input field (omitting it, or placing it outside, is incorrect).
- D+Tc-0005 [M] Provide disambiguation of any free text date input.
- D+Tc-0006 [M] Provide instructions (e.g. tooltip); must list the different date types that can be entered.
- D+Tc-0046 [M] Allow selecting the entire value for rapid editing / entry of date shortcuts. Rationale: on focus the entire value should be selected; must not prevent editing individual elements via mouse or keyboard.
- D+Tc-0007 [M] Arithmetic shortcuts relative to the existing value: '+' later (optional; unsigned whole numbers treated as positive), '-' earlier, 'd' days, 'w' weeks, 'm' months, 'y' years. Examples: '+3m' (three months later), '-2d' (two days earlier).
- D+Tc-0041 [M] Date control must NOT accept time shortcuts (h, s, time-m).
- D+Tc-0008 [M] Allow entry of 'Unknown' (or similar) for dates not known.
- D+Tc-0009 [M] Display a default input in the field.
- D+Tc-0042 [R] Default = example: either non-specific value (input mask, e.g. "dd-mmm-yyyy") or a context-appropriate date (e.g. today's date for an examination date).

### Calendar date input (2.2) – opened by clicking calendar icon.
- D+Tc-0010 [M] Access calendar via calendar icon.
- D+Tc-0011 [M] Month and year independently selectable (clicking month or year in header enters a partially specified date, e.g. "Mar-2008" or "2008"); style them as buttons/links; descriptive tooltips.
- D+Tc-0012 [M] Button to enter today's date.
- D+Tc-0013 [M] Link or button to close the control.
- D+Tc-0014 [M] Visual indication of the current date.
- D+Tc-0015 [M] Include days of the week in calendar view.
- D+Tc-0016 [M] Instructional text (tooltips) on the clickable header elements.
- D+Tc-0017 [M] Close when user clicks away (outside) or clicks calendar icon again.
- D+Tc-0018 [M] Selected value written to the free text field.
- D+Tc-0019 [M] Fully keyboard operable (e.g. arrow keys).
- Incorrect: month-only navigation. Must navigate forwards AND backwards independently by month and by year (separate prev/next month and prev/next year buttons).
- Rationale best-practice features: scrolling month selection, day-of-week labels, today shortcut, current month in title case and year as YYYY, current-date indication.

### Time input (2.3) – anatomy left to right: input area; context-dependent default; spin control (inside the input field); 'Approx' tick box (where supported). Short descriptive label.
- D+Tc-0020 [M] Display per Time Display standard. D+Tc-0021 [M] 24-hour clock only. D+Tc-0043 [M] Indicate 24-hour clock is in use.
- D+Tc-0022 [M] 'Approx' check box to mark approximate time. Label 'Approx' with capital A (lower-case 'approx' is a negative example).
- D+Tc-0023 [M] Hours, minutes, seconds individually editable (e.g. 23:35 or 23:35:42).
- D+Tc-0024 [M] Instructions (tooltip) listing the time types that can be entered.
- D+Tc-0047 [M] Allow selecting entire value (on focus) for rapid editing/time shortcuts; still allow element editing.
- D+Tc-0025 [M] Time shortcuts: '+' later (optional), '-' earlier, 'h' hours, 'm' minutes, 's' seconds. e.g. '+3h', '-2m'. NB in the time control 'm' = minutes; in the date control 'm' = months.
- D+Tc-0044 [M] Time control must NOT accept date shortcuts (d, w, y, months).
- D+Tc-0026 [M] Allow 'Unknown' (or similar).
- D+Tc-0027 [M] Display default input (no default is a negative example). D+Tc-0045 [R] default = input mask or context-appropriate time.
- Seconds element optional at host's discretion.

### Spin control time input (2.4)
- D+Tc-0028 [M] If entire value selected or no unit selected, up/down changes the whole time by the least significant displayed unit (minute, or second if seconds shown).
- D+Tc-0029 [M] If a single element (e.g. minutes) has focus/selection, spin that element only. Incrementing the wrong element (hours when minutes focused) is incorrect.
- Spin buttons positioned within the input field.

### Duration input (2.5)
- D+Tc-0030 [M] Displayed values follow Time Display duration format.
- D+Tc-0031 [M] Tooltip instructions listing units that can be entered.
- D+Tc-0032 [M] Units entered singly or in combination. D+Tc-0033 [M] individual elements editable.
- D+Tc-0034 [M] Minimal unit set: y, m (months), w, d, hr, min, sec.
- D+Tc-0035 [R] Extendable (e.g. 'hrs'), additions must be unique across set.
- D+Tc-0036 [R] Optional whitespace allowed in input: '3 hr 5 min' == '3hr 5min'.
- D+Tc-0037 [R] Disambiguate input interpretable more than one way, e.g. bare 'm' (months or minutes).
- D+Tc-0048 [R] If a duration spans the GMT/BST change, show pop-up informing the system will automatically handle data in the appropriate time zone.
- D+Tc-0049 [R] If user manually adjusts time so a duration spans GMT/BST change, pop-up informing the system will automatically adjust data per appropriate time zone.
- Correct input patterns: single digit without zero padding ("5min" not required "05min"); "Nuuu NNuuu" hours+minutes; "Nu NNuuu NNuuu" days hours minutes; y m w d hr min combination. Incorrect: non-unique units (m for both months and minutes), unknown units.
- Duration may be combined with start/end time controls (computed either way; host app decides).

### Disambiguation (2.6)
- D+Tc-0038 [M] Facility to disambiguate a date entered.
- D+Tc-0039 [M] Show a message dialog with appropriate instructional text if data ambiguous or incomplete; message must explain what was entered and guide next step (non-descriptive messages are incorrect).
- D+Tc-0040 [R] Max two suggestions plus an option to re-enter ("different date"); selecting a suggestion enters it into the control. Three or more options is incorrect.
- Typical ambiguity: day and month interchangeable (e.g. "03/04/2008" -> 03-Apr-2008 or 04-Mar-2008). Apply internal disambiguation first, then host's external validation; example host messages (verbatim): "The Finish date is before the Start date. Please enter a date after the Start date." and "The date of birth is in the future. Please enter the correct date of birth."
- Patient safety: almost all date/time entry errors have safety implications (drug administration dates, DOB identification, appointments).

## Date and Time Input – Quick Implementation Guide, Edition 1, 22-Apr-2010 (datetimeqig)
- Purpose: illustrated summary of all D+Tc guidelines (same IDs/status as datetime). Adds concrete illustrative values, wording and layout useful for implementation:
- Example labels: 'Date of Birth' (date), 'Time of Birth' (time), 'Duration', 'Start Date', 'Start Time'.
- Calendar layout (illustration): header "< September >  < 2007 >" (separate prev/next arrows for month and for year; month name in full, title case; year YYYY). Weekday header row starts Monday: "Mon Tue Wed Thu Fri Sat Sun" (three-letter abbreviations). 6-week grid incl. leading/trailing days from adjacent months (27 28 29 30 31 1 2 ... 31 1 2 3 4 5 6). Footer buttons: "Today" and "Close".
- Calendar header tooltip text (D+Tc-0016): "Select a month or year by clicking in the header or select a day by clicking on a date from the calendar below."
- Date tooltip (D+Tc-0006): "Enter a date e.g. August 2005, or a shortcut e.g. +3m, or click on the calendar icon to select a date"
- Element editing illustration (D+Tc-0003): select month part of "05-May-2006", type "Se" -> autocompletes to "05-Sep-2006" (typing partial month text completes month name) [behaviour implied by illustration].
- D+Tc-0046 illustration: focus selects all "05-May-2006"; typing "17-J" replaces it.
- Default input examples: "01-Jan-2010" (context date) or input mask "DD-Mmm-YYYY" (D+Tc-0042).
- Disambiguation (D+Tc-0005): typing "05/04/2009" -> message "Did you mean: 05-Apr-2009 or 04-May-2009 or different date?" (suggestions are clickable; "different date" returns focus for re-entry).
- Time input: layout "[12:00 ▲▼] [ ] Approx" (spin inside field, Approx check box to the right). Tooltip (D+Tc-0024): "Enter a time using the 24-hour clock, e.g. 13:05 or a shortcut, e.g. +3h." Input mask example "hh:mm:ss". Defaults e.g. "16:00", "12:00". Unknown entry: typing "Un" -> "Unknown" (autocomplete).
- Shortcut example (D+Tc-0047): "13:54" selected, type "+3h" -> "16:54".
- Spin examples: whole value selected 23:35:01 -> up -> 23:35:02 (least significant unit = seconds when seconds shown); hours selected "23" -> down -> 22:35:01.
- Element editing (D+Tc-0023): select hours of 13:54, type "2"... (individual element replacement).
- Duration tooltip (D+Tc-0031): "Enter a duration using the following units: y = year, m = month, d = day, hr = hour, min = minutes, sec = seconds".
- Duration examples: "15min 30sec", "5y 6m 7d 4hr", "30 sec" (input with space), "5y 6m 7d 4hrs" (extended unit).
- Duration disambiguation (D+Tc-0037): input "6m" -> "Did you mean: 6 months or 6 minutes?"
- GMT/BST pop-up example (D+Tc-0048/0049), with Start Date 27-Mar-2010, Start Time 23:30, Duration 2 hrs: "This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00. During BST, times will be automatically adjusted forward one hour such that 01:00 becomes 02:00."

## Date and Time Display – Quick Implementation Guide, Edition 1, 22-Apr-2010 (datetimedispqig)
- Purpose: illustrated summary of D+Ta (date display) and D+Tb (time/duration display) rules; same IDs/status as full docs. Additional concrete details:
- Short format pattern written as "DD-Mmm-YYYY"; examples 14-Aug-1980, 01-Jan-1999, "Tue 05-Jan-2009".
- Month table: Jan January, Feb February, Mar March, Apr April, May May, Jun June, Jul July, Aug August, Sep September, Oct October, Nov November, Dec December.
- Day table: Mon Monday, Tue Tuesday, Wed Wednesday, Thu Thursday, Fri Friday, Sat Saturday, Sun Sunday.
- Aligned column example (D+Ta-0005): 01-Jan-1994 / 06-Jan-1997 / 21-Feb-1997 / 28-Mar-1999 / 14-Aug-2001.
- Null values shown literally as "Unknown" or "Not recorded".
- Long format examples: "01 January 1999", "5<sup>th</sup> January 2009", "14 August 1980", "1<sup>st</sup> January 1999". Suffix table: 1st, 2nd, 3rd, 4th.
- 24-hour indicator (D+Tb-0032) illustrated as text label "24-hour clock" adjacent to the time "04:28".
- Combined date+time: "Tue 05-Jan-2009 09:43:22".
- Time range (D+Tb-0013): "From 06:23 to 08:23".
- Approx examples: "Approx 02:00", "Approx 13:00", "Approx 2hr 40min".
- Durations: "4hr 32min 16sec"; extended units example "8hrs 5mins" (D+Tb-0034); "8hr 10sec" (zero minutes omitted, D+Tb-0026); order example "5y 5m 5d 5min 55sec" (years, months, days, minutes, seconds).

## Truncation of Clinical Terms – Design Consultation Document v1.0.0.0, 18-Dec-2009 (truncation)
- Purpose: consultation (NOT a design guide; items are "Emerging Recommendations", no M/R status, no IDs) on truncating coded clinical terms (SNOMED CT) in selection lists and summary views. Headline: avoid truncation where possible; display terms in full in a list with a vertical scroll bar; no generic truncation rule set is likely. Treat all as [emerging recommendation].
- Out of scope: UI element truncation (menus, window titles), medications (except as coded terms), patient names, dates, non-encoded terms, post-coordinated terms, acronyms/abbreviations, free text.
- Definition: truncation = removing part of text to fit remainder in a smaller space (compare "obscured" text cut off by an edge). Data point: in a 40-character-wide list ~1 in 10 SNOMED CT terms would need truncation.
### Emerging recommendations (by theme)
- T1 Avoiding truncation:
  - Use truncation as a last resort, only when truncated terms are the exception not the rule.
  - Prefer wrapping + vertical scroll bar. When wrapping encoded text keep labels, numbers, units and separators together (e.g. never separate "100" from "milligrams").
  - Do not wrap mid-word (no hyphenation fragments) [i.e. CSS hyphens: none; overflow-wrap only as last resort].
  - If list items can be too long to display in full, allow list to be resized so the longest term is visible without scrolling.
  - Do NOT provide a horizontal scroll bar in selection lists unless list can be resized to show all terms in full. (Exception noted: browsing a tree, horizontal scroll may be more appropriate than truncation.)
  - Other mitigations: grouping (hide text implied by group), summaries with drill-down, filtering/search refinement, approved abbreviations, show/hide info types.
- T2 Truncation points:
  - Do not truncate clinical terms in a fixed-width list.
  - Only truncate in a selection list if what to truncate is informed by the data structure or a manually-defined truncation point is available.
  - Only use 'middle' truncation when text is limited to a single line. End truncation is easier to notice; middle may create "artificially meaningful" phrases (e.g. "Emergency replacement of aneurysm ... of aorta to superficial femoral artery").
  - Summary views: truncation is not effective; risk missing info assumed unimportant; apparent duplicates.
- T3 Fragmenting words:
  - Never truncate so characters/digits are missing from numbers or units (e.g. "with 1-24 hours" -> "with 1-2..." is unsafe; "milli..." / "...litres").
  - Do not fragment words when truncating text in a fixed-width area. (Fragmenting acceptable with dynamic width / non-wrapping views such as timelines, charts.)
- T4 Dynamic vs static:
  - Do not use a set number of characters as the rule for the truncation point.
  - Do not provide a horizontal scroll bar for a view containing terms truncated at a set point.
- T5 Truncation markers:
  - When text is truncated at the end, display (at least) an ellipsis "…" at the point of truncation. Truncation without marker is easily missed.
  - In selection lists, supplement the ellipsis with a symbol for each truncated list item.
  - Do NOT use the ellipsis itself as a control/button to reveal full text (per Windows Style Guide).
  - Notes: '>>' or '/' markers may be misread as text ('>' appears in some SNOMED codes); avoid a space between text and marker (marker may wrap alone); bold/colourful markers distract.
- T6 Identical truncated terms (apparent duplicates):
  - Fixed-width list containing identical truncated terms (when detectable): display the list without truncation by default (expert may re-apply).
  - If system cannot determine it: show a notification warning of the presence of identical truncated terms.
- T7 Access to full text:
  - If a list may contain truncated terms, allow user to display the list without truncation (an "expand all"/show full text control, once or as a setting).
  - Give user control over the list width (resizable).
  - Ensure full text of a truncated term is displayed and acknowledged before any action can be carried out on the selected term.
  - Options: tooltip (obscures other items), fly-out (hover highlights immediately, fly-out after a delay; doesn't obscure list), inline expansion (users preferred inline expansion to tooltips/fly-outs).
- Patient safety: key risks are missed truncation, word/number fragments read as whole words/numbers, apparent duplicates leading to mis-selection, and assuming hidden information is unimportant.

## Abbreviations and Acronyms, v1.0.0.0 Baseline (abbracs)
- Purpose: how apps handle abbreviations/acronyms in input and display (labels/screen text). No guideline IDs; uses "should". Three key guidelines + appendices of dangerous terms.
### 3.1 Require the user to resolve all known dangerous abbreviations (KDAs) – free text input
- Alert the author to known forbidden/dangerous abbreviations/acronyms whenever the author moves from one input field to another (i.e. on blur/field exit).
- Present potential expansions for selection where possible, but NOT provide a default expansion.
- Prevent the storage of any such items under all circumstances (block save while KDAs remain).
- Definition of KDA: "one which is categorised as such by an appropriate authority" (confusable, drug-related names/doses/frequencies, otherwise unsafe, caused past incident). List is configurable/maintained externally.
- Accessibility: alerting and "go to next dangerous unexpanded item" must work for screen readers and keyboard; distinguishing dangerous vs non-dangerous unexpanded items must use more than colour.
### 3.2 Avoid or explain abbreviations in labels (screen text)
- Avoid abbreviations/acronyms wherever possible (preferred).
- Use only when full form would cause horizontal scrolling or clipping, or when clear evidence they are universal in the target context and more usable contracted.
- Never use KDAs in labels regardless of constraints.
- Where used, provide a method of discovering the local meaning, unless user explicitly opts out of displaying this discovery method. Method must be simple, quick, accessible to all (e.g. glossary link or other user assistance).
- Example: table column header abbreviation with tip-text plus a glossary/help link to the expansion (expansion not provided solely via tip-text). Ideal free-text input expansion inserted at input time: "ENT (Ears Nose and Throat)".
- Accessibility: must NOT rely on tooltips alone for expansions (not usable by non-mouse users, don't resize for low vision, hard for limited dexterity).
### 3.3 Present consistently (proposed guidance)
- Acronyms (initial letters only): UPPERCASE, no punctuation, no interior spaces: "ENT" (not "E N T", "ent", "E.N.T.").
- Abbreviations (truncated words of 2+ letters): every word/abbreviated word capitalised, each truncated word followed by a full stop, no interior spaces: "Tib.Ant." for Tibialis Anterior (not "TibAnt", "Tib. Ant.", "tibant", "tib ant").
- Accessibility (s4): screen readers may pronounce "ENT" as a word; HTML ABBR/ACRONYM markup can help but recommendations must stand independent of it. [suggested: render with <abbr title> plus accessible glossary link.]
### Taxonomy (Table 1)
- Input free text: impeding flow to expand abbreviations dramatically reduces usability. Input constrained text (drop-downs, radio lists): rules like label text; inherently safer. Display label text: often avoidable, always explainable. Display user-input text: depends on input validation and highlighting remaining ambiguous text. Special: drug-related information (units, dosages) deserves special UI treatment.
### Future research (not guidance): free-text input panel with ambiguity resolution; text display panel with ambiguity indication (warn readers of remaining unexpanded abbreviations); Office add-in; consistency with SNOMED CT coding.
### Appendix A – JCAHO "Do Not Use" (verbatim pairs: do not use -> preferred)
- U (unit) -> "unit"; IU -> "International Unit"; Q.D./QD/q.d./qd -> "daily"; Q.O.D./QOD/q.o.d/qod -> "every other day"; trailing zero "X.0 mg" -> "X mg"; lack of leading zero ".X mg" -> "0.X mg"; MS, MSO4 -> "morphine sulfate"; MgSO4 -> "magnesium sulfate".
- Possible future: ">" -> "greater than"; "<" -> "less than"; abbreviated drug names -> write in full; apothecary units -> metric; "@" -> "at"; "cc" -> "ml"/"millilitres"; "μg" -> "mcg"/"micrograms".
### Appendix B – ISMP dangerous abbreviations (abbreviation -> correction)
- Apothecary symbols (dram/minim) -> metric; AU -> don't use; D/C -> "discharge"/"discontinue"; drug-name abbreviations ARA°A, AZT, CPZ, DPT, HCl, HCT, HCTZ, MgSO4, MSO4, MTX, TAC, ZnSO4, "Nitro" drip, "Norflox" -> full names; µg -> "mcg"; o.d./OD -> "daily"; TIW/tiw -> don't use; per os -> "PO", "by mouth", "orally"; q.d./QD -> "daily"/"every day"; qn -> "nightly"; qhs -> "nightly"; q6PM -> "6 PM nightly"; q.o.d./QOD -> "every other day"; sub q -> "subcut."/"subcutaneous"; SC -> "subcut."/"subcutaneous"; U/u -> "unit"; IU -> "units"; cc -> "mL"; x3d -> "for three days"; BT -> "hs"; ss -> spell out "sliding scale"/"one-half"/"½"; > and < -> "greater than"/"less than"; "/" between doses -> "per"; name+dose run together (Inderal40 mg) -> always space between drug name, dose and unit; trailing zero (1.0 mg) -> no terminal zeros for whole numbers; no leading zero (.5 mg) -> always leading zero (0.5 mg).
### Appendix C – NHS ambiguous acronyms (candidate KDA list; abbr: meanings)
- AE: Adverse Event / Air entry; amp: ampoule / AMP Austin Moore Prosthesis; BTL Bilateral tubal ligation / btl bottle; CMV: Controlled mandatory ventilation / Cytomegalovirus; CNS: Central nervous system / Coagulase negative streptococci; CP: Cerebral palsy / Chondromalacia patellae; CRC: Colorectal cancer / Concentrated red cells; CRM Circumferential resection margin / crm cream; CVS: Cardio Vascular System / Chorionic Villus biopsy; ER: Equilibrium Reaction / Oestrogen receptor; ES: Electrical stimulation / Embryonic Stem; FET: Forced expiration technique / Frozen Embryo Transfer; FH: Familial hypercholesterolaemia / Family History; IUD: Inter uterine death / Intra Uterine Device; LA: Left Atrium / Local anaesthetic; LDH: Lactate dehydrogenase / Low dose heparin; MR: Medial reefing / modified-release; P: Pain / Plan treatment / Pulse; PD: Parkinsons Disease / Postural drainage; PE: Phenytoin equivalent / Pulmonary embolism / Pulmonary Embolus; PEP: Positive Expiratory Pressure / Pulmonary Embolism Prevention; PF: Patello-femoral / Pelvic Floor / Plantarflexion; PFS Patello-femoral syndrome / pfs pre-filled syringe(s); PH Past History / pH; PID: Pelvic inflammatory disease / Prolapsed intervertebral disc; PNF: Passive neck flexion / Proprioceptive neuro-muscular facilitation; PTB: Partial thickness burn / Patella tendon bearing; PV: Cisplatin, vinblastine / Per vagina / Plasma viscosity / Pulmonary Vein; RA: Rheumatoid arthritis / Right Atrium; RR: Respiratory Rate / Righting Reaction; SB: Sinus bradycardia / Spina Bifida; SCC: Spinal Cord Compression / Squamous cell carcinoma; ST: Sinus tachycardia / Soft Tissue / st standing; TKA: Through knee amputation / Total knee arthroplasty; VL Vastus Lateralis / vl vial(s).
- Patient safety: wrong drug/dose from misread abbreviations; unresolved KDAs mislead later readers.

## Abbreviations and Acronyms in Free Text Input, v1.0.0.0 (abbracsfree)
- Purpose: Annex D to Abbreviations and Acronyms; a design SUGGESTION (not fully researched; not mandatory guidance) for handling abbreviations in free-text input. Treat as [suggested design].
- Design suggestion: alert user to unexpanded abbreviations/acronyms; avoid restrictions that could cause users to circumvent the app; warn other (reading) users of remaining unexpanded abbreviations.
- Design details:
  - Alert to unexpanded abbreviations after the user finishes entering text but before storing it.
  - Offer potential expansions simply; insert expansion into text once user selects the correct term (e.g. "ENT" -> "ENT (Ears Nose and Throat)" per parent doc).
  - Do NOT offer default expansions (could be selected by accident).
  - Preserve flow of input: background check on entry, but alert only when user stores the text or moves to the next field.
  - Prevent storage of known dangerous acronyms/abbreviations.
  - Alerts make readers aware of risk to decide on interpretation of unexpanded acronym.
- Figure is illustrative only (no mandated text box, highlighting style or selection interaction).
- Accessibility: alert + "select next unexpanded term" usable via screen reader and keyboard; dangerous vs non-dangerous difference must be apparent without colour.
- Patient safety: warnings when entering and when reading text with ambiguous items avoid acting on misinterpretation (handover risk).

## Design Guide Entry – Consistent Navigation – Icons and Symbology, v1.0.0.0 (iconssymb)
- Purpose: high-level principles for icon design, usage and an "icon grammar". Status: 'Initial Guidance' (no PSA yet); each point carries a Confidence Level (High/Medium/Low) rather than M/R. Noted below as (H)/(M)/(L).
### Icon types (2.1.2)
- Image-related (pictorial, e.g. Printer): directly comprehended, use wherever possible (H).
- Concept-related (e.g. House = patient's address): only if user understands context (H).
- Arbitrary/abstract (e.g. Bow tie = referral to specialist): hard to learn; only if context + special knowledge present; prefer idioms (H).
### Composition (2.1.3)
- Background: no patterns (H); image clearly in front (H); background static, nothing blinks/moves (M); unsaturated cool background, saturated warm foreground (M); background a simple recognisable concrete object (M); avoid complex low-contrast backgrounds (M).
- Symbol: use commonly accepted/standardised elements (M).
- Text label only when necessary (concept-related/arbitrary icons); max two to three words (M).
### Internationalisation (2.1.4)
- No hands, eyes or faces (L); depict people generically. Arrows/directionality: add explanatory text; consider bi-directional version (L). Cultural colour sensitivities (white/black/red) (L). No anti-aliased text baked into icon graphics (M).
### Accessibility (2.1.5)
- Icon must have explanatory text: visible label or alt attribute (M). Use alt on img (M). Colour must not be the only indicator of meaning/importance (M). Avoid flashing in the 2–59 Hz range (M, worded "must").
### Icon design (2.2)
- Level of realism table: Photographic realism (complex symbols with detail); Simplified drawing (outline + distinct interior detail; similar-profile objects); Caricature (exaggerated crucial details); Outline (small symbols, familiar object with distinct profile); Silhouette (solid fill; thin symbols or very distinct profile).
- Sizes (Table 4, px): taskbar, detailed lists 16x16; Windows XP menus 24x24; desktop, lists 32x32; Windows XP Explorer, system lists 48x48.
- Labels (M): consider when icon abstract, safety-critical (unless self-explanatory), conveys important message/warning (e.g. immunisation is due), or task complex (e.g. dispensing drugs). Labels: brief (≤2–3 words); used sparingly; clear simple sans serif (e.g. Arial); NO bold, italics, underline or colour differences for emphasis; consistent location and format; sentence-style capitalisation. Some apps let users toggle labels on/off.
- Colour (M unless noted): design icons first in black and white (shape first); colour coding only with well-established conventions: Red = no-go, error, failure, alarm, malfunction; Yellow = marginal, cautionary, alert; Green = acceptable to proceed, normal, satisfactory; Blue = advisory items only. Non-conventional colours need a readily accessible colour key. Colour is a secondary cue only. Avoid (L): highly saturated colours from different spectrum parts together (saturated red+blue, red+green); pure blue on small objects; ensure sufficient symbol/background contrast (L). Overlapping elements: foreground brighter than background (M).
- Shape: left/right arrows = Back/Forward; double left = rewind, double right = fast forward; warning = triangle + yellow. Shapes clearly discernible; avoid similar geometric forms (M).
- Icon groups (M): group by user task not system architecture; related icons close together; duplicate icon if it belongs to multiple groups; border or extra space between groups; common background colour or element per group; consistent style/realism/detail within a group; stable arrangement supporting spatial memory.
### Icon usage (2.3)
- Use icons (M) when quick accurate recognition needed (warnings, alerts), space limited (toolbar) BUT icons must not be the only way to access functionality; a suitable icon with accepted meaning exists (Search, Home, Back, Forward, Exit, Help). Do not use generic (e.g. Windows) icons to denote clinical information.
- Use icons to: highlight bounded lists (e.g. medication types "Regular", "One-off", "As required") rather than unbounded; give 'information scent' for high-risk actions / sensitive info (e.g. "sealed envelope" information); highlight critical info (allergies, risks, conditions) but too many icons degrades performance.
- Icon categories in NPfIT apps (Table 6) with states: Global buttons (Help, Exit, Search) – Enabled/Active/Disabled; Toolbar buttons – Enabled/Disabled; Information icons – display only; Functional icons (Save, Cancel, Clear, Edit, Add to List, Add to Patient List) – Enabled/Disabled; Component icons (Show/Hide, locator Previous/Next); Inline icons (Issue Drug, Repeat Drug, Last Treatment) – Active (clickable, reveals info/functionality; may have enabled/disabled) or Status (state only, not clickable).
- Conveying importance (L): increase label font size, white space around label, border line weight, relative icon size for high urgency; do NOT use blue or green for high-importance icons (convey low urgency).
### Icon grammar (2.4)
- Components (from Alert Symbol Design): objective symbol, modifier (e.g. number "3"), container, informational text.
- Grammar: nouns = objects (patient, medication), verbs = actions (search, add, delete, edit), adjectives = attributes. Composites: "Search for Patient", "Add Patient", "Delete Patient", "Edit Patient". Toolbar semantics: with no patient record selected Edit and Delete are disabled; with record selected all four enabled.
- Medication line symbology example: noun medication; adjective type Group 1 ("regular", "one-off", "as required") encoded by line-end style; Group 2 ("gas", "infusion") by coloured glyph overlaying line end; composites e.g. "one-off infusion". Text remains primary; symbology unsuitable for large sets (route, form) or quantitative data (dose, frequency).
- Guidance (M): list all concepts needing icons; design basic vocabulary symbols; rules for combining (required/optional elements, graphical combination, arrangement L-R/T-B/front-back, representation as border/object/attachment); focus on key concepts, finite enumerable sets.

## Alert Symbol Design, v0.1.0.0 Baseline Candidate (alertsymbdes)
- Purpose: framework for classifying/designing alert symbols (desk research only; not validated in clinical apps; uses "should"). No guideline IDs; RGB values and sizes explicitly "to be specified" except warning border black (0,0,0).
### Classification (s3): two independent axes, Polarity (negative = prevent, positive = encourage) and Intensity (zero to max).
- Prohibitions (negative, maximum intensity); Mandatory actions (positive, maximum); Warnings (negative, mid); Suggestions (positive, mid); Safe conditions (positive, minimum = system state display, not an alert). No "negative minimum" class (treat as warning).
- Prohibition and Mandatory have equal (max) intensity; intensity must be represented separately to polarity; clear rules needed for levels below max; alert signs must be embeddable in more complex message structures. Higher intensity -> interface more likely to limit user's freedom of action.
- Examples: required form field = mandatory action; if submitted empty, status changes to 'warning' ("these fields may be causing you a problem"). Conditional alerts ('If patient develops headaches then administer aspirin'): display the warning (trigger). Limits ('Do not exceed specified dose') = prohibition (shown as prohibition circle without strike-through).
### Observed syntax (5.1.1): circle = most intense (prohibition/mandatory); intensely negative = light circle with thick dark border; intensely positive = dark (filled) circle; red border = prohibition, blue fill = mandatory; prohibition strike-through falls top-left to bottom-right (single, not double); warnings = triangles; suggestions = speech bubble or no container; safe = no container. Colour mapping: red – prohibition, blue – mandatory, yellow – warning, white – suggested action/information.
### Recommended symbols (s7) – use international standards (EU Directive 92/58/EEC, ANSI Z535, ISO 7010/3864); do not invent unique CUI set.
- Mandatory action: circle, blue fill (RGB TBD), (white pictogram per standards [suggested]); sizes TBD.
- Prohibited action: circle, white fill, red border and red diagonal line top-left to bottom-right (RGB TBD).
- Warning: triangle, yellow fill (RGB TBD), black border RGB 0,0,0.
- Suggested action/information (speech bubble): NOT formally recommended (needs research). Rejected candidates: warning diamond (road signs only), octagonal STOP (mistaken for circle at small size), prohibition circle without diagonal (ambiguous), rectangular information container (overloaded).
- Each recommended sign distinct by colour AND tone (works in monochrome / for colour-blind users) and does not rely on colour alone.
### Visual syntax / definitions (Appendix A): Objective symbol (primary, centred, e.g. telephone icon); Container (shape bounding/overlaying the symbol, changes meaning, e.g. yellow triangle; button outline); Modifier (minor icon/number/text nuancing meaning, e.g. "3"); Informational text (e.g. "While you were out you received 3 telephone messages"); Contextual elements (dialog, buttons e.g. 'Cancel', 'Listen').
### Rules for symbol design (6.1 / Appendix C): rely on codes shared by recipients; use widely understood existing codes; keep system simple; easily distinguishable in display medium; distinguishable without colour alone; safety-critical signs combine colour, shape and words. Use symbols (if audience familiar) to replace many words, draw attention (warnings), communicate beyond written language, speed frequent/important info.
### Interactivity cues (Appendix B): classify elements as information vs action, and state/intensity; alert signs may be clickable (e.g. 'all clear' summary icon linking to vital signs) or not.
### Accessibility (s8)
- Text equivalents (alt) must be functional not literal: icons describe function ('save' not 'disk'); alerts describe detail ('warning: above recommended dosage' not 'red…').
- Colour must not be the only differentiator. Avoid flashing 2–59 Hz. Use alerts/icons (and their text) consistently across the application.
- Patient safety: misinterpreted alerts (suggestion read as requirement) or inconsistent alerts erode trust / judgement.

## Design Guide Entry – Terminology – Display Standards for Coded Information, v2.0.0.0 (displaystandards)
- Purpose: display standards for SNOMED CT encoding UIs in note-taking (text parser: text input right pane + suggested matches left pane; single concept matching: additional text field). Applies only during noting/matching, not after saving. Points use Must/Should/Could with Confidence High/Medium/Low (shown as H/M/L). PSAs not yet applied.
- Encoding styles: Forms (codes embedded in form, no encoding UI); Single concept matching (select code e.g. 'asthma', elaborate with 'severe' and free text 'worse in cold weather'); Text parser (type notes, system identifies encodable phrases); hybrid possible.
- Requirements D1.1–D3.3 (Table 2): flexible to fit various sizes; show encoded and unencoded notes; clearly distinguish text that will be encoded vs not; allow re-encode before commit; show polished prose + structured view for post-coordinated concept, consistent; allow viewing original text (last edit before encoding); communicate potentially encodable text; distinguish standalone-encodable vs elaboration-only (e.g. "mild" only as elaboration of "gastroenteritis"); distinguish potentially encodable vs encoded (unencoded committed as free text); show top match for each encodable concept alongside typed text; communicate code-elaboration relationships; distinguish potential vs user-confirmed relationships.
### 2.1.1 Potentially encodable text (in input area)
- Must visibly show which words/phrases are recognised as potentially encodable (H).
- Should strongly associate visual cue with typed text (H); not hinder legibility (H); highlight colour visible without accessibility enhancements but not reduce legibility (H); all text clearly visible while typing (H).
- Should communicate encodable via highlighting (M) – preferred over underline (reserved for spelling errors) or boxes. Should show clear gaps in highlight between separate encodable concepts (M).
- Should flag encodable as typed, as soon as recognised (L). Should block user formatting (highlights, text colour, underline) (L). Should allow punctuation and carriage returns.
- How to use: light but distinct LIGHT BLUE highlight; unencoded text black, normal weight; field background white/off-white (black on white); left-aligned text; line spacing 1.5–2x the space between words (1.5 shown).
- How not: no dark saturated highlight; no green or red highlight (connotations; colour-blind); not too light/subtle (lost on high contrast/brightness screens).
- Optional: user may force encoding by selecting text, right-click, choose match from context menu.
### 2.1.2 Suggested SNOMED CT matches (left pane / above additional text field)
- Must: matched expressions distinct from each other (H); display preferred term or synonym label (H); confirm check box at far LEFT of each match area (H); matches displayed in area visible at same time as typing area (L); message when close alternative matches exist or more specific (child) matches exist (L).
- Should: label immediately right of check box (H); matches stacked vertically (H); same order as related text in input (H); do NOT show SNOMED CT concept ID in default view (H); each match in rectangular boundary (M) (Could round corners); sufficient contrast with field background (M); same pale blue as encodable highlight (M); regular (not bold) text (M).
- Could: yellow or orange for hovered match (M); embossed/clickable look on hover (M); expand match area downward on hover to show messages, pushing others down (L).
- Behaviour described: in-focus match on yellow background with 'down arrow' icons; in-focus marquee in text area has bold outline and yellow handles at each end, and moves when a suggested match is clicked; hovering the match label turns surrounding area orange and embossed (button); if alternative match has the SAME SPELLING as top match, the confirm check box is DISABLED and a warning message tells user to click to view alternatives before confirming.
### 2.1.3 Post-coordinated attribute matches
- Must: attributes of top matched expression within a single boundary with base concept (H); confirm check box for each attribute (H); communicate attributes belong to base concept (H).
- Should: indent each attribute relative to base (H), by approx one check-box width; further indentation for nested attribute; show only attribute value label (e.g. 'Mild') not attribute name ('Severity') (L). Not: more than one indent per level.
### 2.1.4 Non-SNOMED-CT matched elaboration (time chunks, shorthand from external info model) and free text
- Structured non-SNOMED matches displayed like SNOMED matches (M), with confirm check box far left (M); non-SNOMED matches below SNOMED matches (M) within single expression envelope.
- Unstructured free text: each chunk (adjacent words) displayed separately (L); below all structured matches (L); one indent in from base concept, all at same indent (L); visually distinguished from structured (H); special free-text icon immediately to its left (H); NO confirm check box (H); normal (not bold) style (M). Chunks containing only exclusion-list words (e.g. 'of', 'to', prepositions) not displayed.
### 2.1.5 Expression boundaries (marquees)
- Must communicate grouping of encodable text with elaboration and distinguish from text not encoded (H); distinguish selected (in-focus) group (H); communicate boundaries draggable (M); show new boundaries live while dragging (L).
- Should: grouping cue not reduce legibility nor interfere with highlights (H); show drag direction (cursor change or arrows on handle when hovered/selected) (M); hover message describing drag, e.g. 'Drag the selection to separate terms', 'Drag the selection to include or exclude text to add meaning to the concept', 'Drag the selection around related text'; include corresponding keyboard actions where appropriate.
- Could: dotted marquees around grouped words (M). Marquees faint unless selected; selected = bold lines + yellow draggable handles.
- Must not: overlap marquees; more than one selected area at a time.
- Example: 'mild fever for three days' -> Fever (concept) + Mild (qualifier) + Three days (time chunk).
### 2.2 Confirmed matches
- Confirm by ticking check box, double-click, or keyboard equivalent. Confirmed match area turns grey; confirmed structured parts bold; unconfirmed parts normal; unstructured always normal.
- Must: distinguish confirmed vs unconfirmed/unstructured (H); show chosen preferred term or synonym label in noting area and matching area after confirm (H); replace typed text with matched SNOMED label on confirm (M); render post-coordinated expressions readably (M).
- Should: consistent confirmation cue between text and match areas (H); bold label for confirmed (H); unstructured stays normal (H). Could: grey background for confirmed (H); left-to-right rendering base concept first then attribute values (M); simplified attribute label translation, e.g. 116676008 'associated morphology' rendered as 'with' (M), in smaller font and grey (M).
- Confirmed items in text area greyed (inactive/unchangeable until unconfirmed). Scroll bar if text exceeds box height. Do not show elaboration settings user didn't select (e.g. axial modifier 'patient currently has this finding') unless safety reason. Highlight not too dark.
- Single concept approach: matches from additional text shown below base concept list, above field; confirmed -> bold; corresponding text grey highlighted and replaced (bold) by label; single-click item then mouse away -> grey selected highlight.
- 2.2.2 Unstructured notes with confirmed matches: Must stay normal style (M); Must visually link to the confirmed concept (H); Should link via retained marquee (H). Never bold.
### Appendix A selected requirements relevant to library
- A1.1 encoding solely by keyboard; A1.2 not prevent voice/touch.
- B2.6 never commit unconfirmed encoded terms. B3.3 show both entered abbreviation and its expansion. B4.1 show categories (e.g. TLCs) to distinguish similar results. B4.4 show definition and preferred term before commit. B4.5 access to full SNOMED CT term text (up to 255 characters). B4.9 communicate if truncation has occurred. B5.x allow 'nearly correct', give up, record unencodable as free text.
- C1.10 where numeric values entered, present appropriate units; choice of units explicit. C2.2 search scope e.g. marquee bounded by full stops; up to four potential codes per marquee. C3.4 warn if text contains qualifications (e.g. negation) conflicting with concept.
- Patient safety: users must know exactly what will be saved as code vs free text; unconfirmed predictions must never be stored as codes.

## Keyboard Shortcuts, v1.0.0.0 Baseline ('Quick Wins') (keyshorts)
- Purpose: base recommendations for keyboard shortcuts in NHS clinical apps (keyboard navigation out of scope). "Current Recommendations" (research-based mappings, "should be used" where matching function exists) and "Potential Recommendations" (common practice, need validation). No IDs/M-R status.
### Considerations / hypotheses
- Patient safety: conflicting shortcuts across apps can trigger wrong function silently -> wrong patient record update. Where conflicts occur ensure the user easily knows the wrong shortcut is being used.
- Accessibility: all aspects operable by keyboard alone; do not assume mouse. Every function must have an associated keyboard shortcut complying with the OS (hypothesis 6; DDA). Do not interfere with OS accessibility features (IBM 1.2, NDA 1.1); do not require pointing device (NDA 1.5); logical tab order (WCAG 9.4); input-device-independent event handlers (WCAG 6.4).
- Construction: shortcuts must not fail silently nor perform hidden functions silently: provide feedback if a deprecated shortcut is used; provide feedback if a context-sensitive shortcut is used in the wrong context.
- Do not override system-wide shortcuts (e.g. Windows key). Avoid customisable keyboard layouts (hypothesis 4: introduces conflicts/confusion). Spatially separate clinically significant functions from mundane ones (e.g. a dangerous-drug prescribing shortcut must not sit next to CTRL+Z). Screen readers use CTRL to stop speech; avoid commonly used keys for custom shortcuts.
- Applications must support Sticky Keys (5.8.3).
### Current recommended mappings
- ALT: ALT+F4 Quit Application (must never be used for anything else); ALT+V View menu; ALT+E Edit menu; ALT+F File menu; ALT+H Help menu; ALT+HOME First/Homepage; ALT+TAB Switch Windows; ALT+ESC Display Next. UK Government AccessKeys (web; applicability questionable, conflicts with WindowEyes): ALT+1 Homepage, ALT+2 What's New, ALT+3 Site Map, ALT+4 Search, ALT+5 FAQs, ALT+6 Help, ALT+7 Complaints Procedure, ALT+8 Terms and Conditions, ALT+9 Feedback Form, ALT+0 Access Key Details, ALT+S Skip Navigation. (Mac: CTRL+accesskey.) ALT+Function key recommended for clinically significant shortcuts (spatial separation).
- Function keys: F1 Help (always, all apps). Browser: F5 Refresh/reload; F11 Full Screen. Other F-keys application-specific; prefer single-key presses for app-specific functions.
- CTRL general: CTRL+A Select All; CTRL+S Save; CTRL+F Find/Search; CTRL+Z Undo; CTRL+X Cut; CTRL+C Copy; CTRL+V Paste; CTRL+N New; CTRL+W Close; CTRL+Y Redo/Repeat; CTRL+O Open; CTRL+P Print; CTRL+F4 Close.
- CTRL text editing: CTRL+E Centre; CTRL+R Right align; CTRL+T Indent; CTRL+U Underline; CTRL+I Italics; CTRL+G Go to; CTRL+J Justify; CTRL+K Hyperlink; CTRL+L Left align; CTRL+B Bold.
- CTRL browser: CTRL+Q Exit; CTRL+E Web search; CTRL+R Refresh; CTRL+U View Source; CTRL+H History; CTRL+L New Location. (Note context-dependent overlaps with text editing: E, R, U, L.)
- Other: TAB move through fields; SHIFT+TAB move through fields (reverse); ARROW KEYS move through patient records; ESC cancel action.
### Potential recommendations
1 Keep shortcuts simple; avoid more than 2 key presses (e.g. CTRL+SHIFT combos); mnemonic letter mapping. 2 Use common shortcuts (F1, CTRL+C, CTRL+V). 3 Avoid conflicts with other apps. 4 Avoid dangerous conflicts (e.g. never map Close-and-Save to a key another app uses for Close-without-Saving). 5 Prefer single key press (function keys) for app-specific functions; F1 always Help. 6 Simple CTRL/ALT combos for mundane tasks; ALT+letter for menus; CTRL+letter for recognised functions. 7 Separate clinically significant functions: require the hand to move out of its comfort zone ("difficult zone").
- Ergonomic "easy zone" (left hand, little finger on CTRL/ALT): CTRL/ALT + R,T,Y,U or numbers (index finger); + V,B,N,M (thumb). ALT+F has "too many existing conflicts" (must not be used for new functions). Note: source text erroneously lists "CTRL+X=paste" in the hotspot section; the mapping table gives CTRL+X Cut, CTRL+V Paste (use the table).
- Patient safety: conflicting/unsignalled shortcuts can silently update the wrong record.

## Proposed controls

Conventions: all display/format logic lives in pure utilities (below) so controls and tests share it. `NullText = 'Unknown' | 'Not recorded' | string`. Date values are passed as ISO strings or `{year, month?, day?}` parts to avoid timezone drift [suggested]. Items marked [suggested] are modern additions not in the source.

### 1. `<DateDisplay>`
- Purpose: render a single precise date in CUI short or long format.
- Props: `value: Date | string | DateParts | null`; `format?: 'short' | 'long'` (default `'short'`; use `'long'` for patient-facing output, D+Ta-0011); `showDayOfWeek?: boolean` (default false; must be false for DOB / date of death per 2.1.2 rationale); `ordinal?: boolean` (long format only, default false); `nullText?: string` (default `'Unknown'`; D+Ta-0022); `locale?: string` (long format only: default regional settings, D+Ta-0014; short format ignores it, D+Ta-0010); `ariaLongForm?: boolean` (default true: set `aria-label` to long form, D+Ta-0015).
- Rendering: short "dd-Mmm-yyyy" e.g. `05-Apr-2008`, optional `Sat 05-Apr-2008`; long `05 April 2008` or `5<sup>th</sup> April 2008` (suffix lower-case superscript, no leading zero when ordinal). Wrap in `<time dateTime="2008-04-05">` [suggested]. `white-space: nowrap` [suggested] so the date never wraps across hyphens.
- Variants: inside tables use `tabular-nums` and consistent alignment (D+Ta-0005).
- Guidelines: D+Ta-0002..0022.

### 2. `<TimeDisplay>`
- Props: `value: string | Date | {h,m,s?} | null`; `showSeconds?: boolean` (default false, D+Tb-0012); `approximate?: boolean` (prefix 'Approx ', D+Tb-0014..0016); `nullText?: string` (default 'Unknown', D+Tb-0011); `show24hIndicator?: boolean | 'tooltip'` (D+Tb-0032; renders adjacent text "24-hour clock" or a visually hidden/tooltip hint; default 'tooltip' [suggested mechanism]).
- Output: `HH:mm` / `HH:mm:ss`, 00:00 midnight, never 24:00.
### 3. `<DateTimeDisplay>`
- Props: `value`, `showDayOfWeek?`, `showSeconds?`, `approximateTime?`, `nullText?`. Output `Mon 12-Jun-2006 02:30` (single space between date and time, D+Tb-0008). Null date or time parts render their own nullText.
### 4. `<TimeRangeDisplay>`
- Props: `from`, `to`, `fromLabel?='From'`, `toLabel?='To'`, `showDuration?: boolean`. Output "From 06:23 to 08:23" style: two adjacent TimeDisplays each with label (D+Tb-0013); optional elapsed DurationDisplay.
### 5. `<DurationDisplay>`
- Props: `value: DurationParts | null` where `DurationParts = {years?, months?, weeks?, days?, hours?, minutes?, seconds?}` (integers ≥0); `approximate?: boolean`; `units?: Partial<UnitSymbols>` (default `{y:'y', m:'m', w:'w', d:'d', hr:'hr', min:'min', sec:'sec'}`; extensions e.g. 'hrs' allowed if unique, D+Tb-0034); `nullText?`; `ariaLabel` auto = spelled-out units e.g. "2 hours 40 minutes" [suggested].
- Output via `formatDuration`. Guidelines D+Tb-0017..0031.

### 6. `<DateInput>`
- Purpose: free-text date entry with embedded calendar, shortcuts, partial dates, Unknown, disambiguation (D+Tc-0001..0019, 0038..0042, 0046).
- Props: `value: DateInputValue` where `DateInputValue = {kind:'full', y,m,d} | {kind:'monthYear', y,m} | {kind:'year', y} | {kind:'unknown'} | null`; `onChange(v)`; `label: string` (required, short descriptive e.g. 'Date of Birth'); `allowPartial?: {monthYear?: boolean; year?: boolean}` (default both false; host decides per context); `allowUnknown?: boolean` (default true; D+Tc-0008); `unknownText?: string` (default 'Unknown'); `defaultDisplay?: 'mask' | 'today' | DateParts` (default 'mask' showing placeholder `DD-Mmm-YYYY`; D+Tc-0009/0042); `instructions?: string` (default tooltip "Enter a date e.g. August 2005, or a shortcut e.g. +3m, or click on the calendar icon to select a date"; must list allowed date types, D+Tc-0006; also exposed via `aria-describedby`, not tooltip-only [suggested, consistent with abbracs accessibility]); `referenceDate?` (base for shortcuts; default current value else today); `min?`, `max?`, `validate?(v) => string | null` (host external validation run AFTER internal disambiguation, e.g. "The date of birth is in the future. Please enter the correct date of birth."); `disabled`, `readOnly`, `required`.
- Anatomy: text input + calendar icon button INSIDE the field boundary (D+Tc-0004); popover `<CalendarPicker>`.
- Behaviour: focus selects entire value (D+Tc-0046); element-wise editing of day/month/year by click or keyboard (D+Tc-0003) [suggested: Left/Right moves between segments, typing letters in month segment autocompletes month name e.g. "Se"→"Sep"]; accept shortcuts `+Nd/-Nd/Nw/Nm/Ny` (D+Tc-0007) and reject time units (h, min, s) (D+Tc-0041); on commit (blur/Enter) parse with `parseDateInput`; if ambiguous or incomplete open `<DisambiguationPrompt>` (D+Tc-0005/0038/0039); render committed value with `formatShortDate` (or `Mmm-yyyy` / `yyyy` for partial [suggested format consistent with D+Ta rules]).
- States: empty-with-default, focused/all-selected, editing-segment, invalid, ambiguous (prompt open), unknown, disabled, read-only, calendar-open.
### 7. `<CalendarPicker>`
- Props: `value?`, `onSelect(v: DateInputValue)`, `allowPartial`, `today?: Date`, `onClose()`, `weekStartsOn?: 1` (Monday, per QIG illustration), `min?`, `max?`.
- Layout: header "‹ Month ›  ‹ YYYY ›": independent prev/next month and prev/next year buttons (month-only navigation is incorrect); month name full, title case; year YYYY (D+Tc-0011). Clicking month name selects month+year partial date; clicking year selects year-only (when allowed); these header elements styled as buttons/links with descriptive tooltips (D+Tc-0011/0016), default header tooltip "Select a month or year by clicking in the header or select a day by clicking on a date from the calendar below." Day-of-week header Mon..Sun (D+Tc-0015). 6x7 grid with adjacent-month days. Current date visually indicated (D+Tc-0014; not colour-only [suggested]). Footer buttons "Today" (D+Tc-0012) and "Close" (D+Tc-0013).
- Behaviour: closes on outside click, on calendar icon click (D+Tc-0017), Close, Esc; selection writes formatted value to field (D+Tc-0018). Keyboard (D+Tc-0019) [suggested specifics following WAI-ARIA grid]: arrows ±1 day/±1 week, PageUp/PageDown ±1 month, Shift+PageUp/PageDown ±1 year, Home/End start/end of week, Enter/Space select, Esc close and return focus to input.
### 8. `<DisambiguationPrompt>`
- Props: `message: string`; `suggestions: Array<{label: string; value: T}>` (max 2 rendered, D+Tc-0040); `reenterLabel?: string` (default 'different date'); `onSelect(value)`, `onReenter()`.
- Text pattern: "Did you mean: 05-Apr-2009 or 04-May-2009 or different date?" (dates rendered in short format); duration variant "Did you mean: 6 months or 6 minutes?" (D+Tc-0037). Must explain what was entered (non-descriptive messages are non-compliant). Rendered as modal/inline dialog with focus moved to first suggestion; `role="alertdialog"` [suggested].
### 9. `<TimeInput>`
- Props: `value: {h,m,s?} | 'unknown' | null`; `approximate?: boolean`; `onChange(v, approximate)`; `label` (e.g. 'Time of Birth'); `showSeconds?: boolean` (default false; host discretion); `allowApproximate?: boolean` (default false; enabled per clinical context); `approxLabel?: 'Approx'` (capital A, D+Tc-0022); `allowUnknown?=true` (D+Tc-0026); `defaultDisplay?: 'mask' | {h,m}` (default mask "hh:mm" / "hh:mm:ss"; D+Tc-0027/0045); `instructions?` default "Enter a time using the 24-hour clock, e.g. 13:05 or a shortcut, e.g. +3h." (D+Tc-0024); `referenceTime?`.
- Anatomy left→right: input, spin buttons INSIDE input field, 'Approx' checkbox. 24-hour indication (D+Tc-0043) via instructions + visible hint/`aria-describedby`.
- Behaviour: 24h only; focus selects all (D+Tc-0047); segment editing hh/mm/ss (D+Tc-0023); shortcuts `+Nh/-Nh/Nm/Ns` relative to current value (D+Tc-0025); reject date units d/w/y (D+Tc-0044). Spin (D+Tc-0028/0029): whole value or no segment selected → step least significant displayed unit; segment selected → step that segment only. Keyboard Up/Down = spin [suggested]. Approx checkbox state rendered as "Approx HH:mm" in display.
### 10. `<DurationInput>`
- Props: `value: DurationParts | null`; `onChange`; `label` (e.g. 'Duration'); `units?: UnitSymbols` (+ aliases e.g. `{hr:['hr','hrs'], min:['min','mins']}`, unique, D+Tc-0035); `allowApproximate?`; `instructions?` default "Enter a duration using the following units: y = year, m = month, d = day, hr = hour, min = minutes, sec = seconds" (D+Tc-0031); `startDateTime?` (to detect GMT/BST span); `onTimezoneNotice?`.
- Behaviour: accept single or multiple units (D+Tc-0032), optional whitespace "3 hr 5 min" (D+Tc-0036); edit individual elements (D+Tc-0033); ambiguous bare 'm' → disambiguation "Did you mean: N months or N minutes?" (D+Tc-0037); unknown unit → error; displays normalised via `formatDuration`. If interval spans GMT/BST change show info pop-up (D+Tc-0048/0049), text e.g. "This duration spans the change from GMT to BST. BST runs from 28-Mar-2010 01:00 to 31-Oct-2010 02:00. During BST, times will be automatically adjusted forward one hour such that 01:00 becomes 02:00."

### 11. `<TruncatedText>` and `<ClinicalTermList>` (truncation consultation; emerging, not mandatory)
- `<TruncatedText>` props: `text: string`; `mode?: 'wrap' | 'end' | 'middle'` (default 'wrap'; 'middle' only when `maxLines===1`); `maxLines?: number`; `marker?: string` (default '…' placed directly after text, no space); `revealMode?: 'inline' | 'tooltip' | 'flyout'` (default 'inline' – users preferred inline expansion); `onTruncationChange?(isTruncated)`.
  - Rules: never cut inside numbers or units (back off to previous word boundary before a numeric/unit token); no mid-word fragmentation when container is fixed width; no hyphenation (`hyphens: none`); keep number+unit together (`&nbsp;` between value and unit when wrapping); ellipsis itself is not a button; show a separate truncation symbol per truncated item in selection lists; full text available via accessible control and `title`/`aria-label`.
- `<ClinicalTermList>` (selection list) props: `items: {id, term}[]`; `resizable?: boolean` (default true); `showFullTextToggle?: boolean` (default true, "show all in full"); `truncation?: 'none' | 'dynamic'` (default 'none' → wrap + vertical scroll); `requireFullTextAcknowledgement?: boolean` (default true when any item truncated: selected item's full text must be displayed and acknowledged before action proceeds); no horizontal scrollbar unless list resizable to show all terms; if identical truncated renderings detected → auto-disable truncation (fixed width) or show warning notification "identical truncated terms present" [wording suggested].
### 12. `<Abbreviation>`
- Props: `short: string`; `expansion: string`; `glossaryHref?: string`; `showDiscovery?: boolean` (default true; user opt-out allowed). Renders `<abbr title=expansion>` PLUS keyboard-focusable glossary link/button (tooltips alone are not sufficient). Dev-time check: `isDangerousAbbreviation(short)` → console error; `formatAcronym`/`formatAbbreviation` lint.
### 13. `<AbbreviationCheckedTextArea>` (free text; [suggested design] per abbracsfree, KDA rules per abbracs)
- Props: `value`, `onChange`, `dangerousList: DangerousAbbrev[]` (configurable authority list; seed with Appendix A/B/C), `knownAbbreviations: Record<string, string[]>` (possible expansions), `onValidityChange`.
- Behaviour: background scan while typing (no interruption); on blur/move to next field or save, show alert listing unexpanded abbreviations; offer expansions with NO default selected; selecting inserts "ENT (Ears Nose and Throat)"; block save (`isValid=false`) while any KDA remains; "next unexpanded item" keyboard command; dangerous vs non-dangerous marked by icon + text, not colour alone; readers get warning banner if unexpanded abbreviations remain.

### 14. `<AlertSymbol>`
- Props: `kind: 'prohibition' | 'mandatory' | 'warning'` (`'suggestion'` [suggested, not recommended by source]); `pictogram?: ReactNode` (objective symbol); `modifier?: string | number`; `label: string` (required functional text, e.g. 'warning: above recommended dosage'); `size?: 16 | 24 | 32 | 48` (default 16).
- Rendering: prohibition = white circle, red border + red diagonal top-left→bottom-right; mandatory = solid blue circle; warning = yellow triangle with black (#000000) border. Exact RGB not specified by source; [suggested] use ISO 3864 safety colours. Distinguishable in greyscale (shape + tone). No flashing 2–59 Hz. `role="img"` + `aria-label`.
### 15. `<Icon>` / `<IconButton>`
- Props: `name`, `label: string` (accessible name = function, e.g. 'Save' not 'Disk'); `showLabel?: boolean` (default true for abstract/safety-critical icons); `size?: 16|24|32|48` (16 lists/taskbar, 24 menus, 32 desktop/lists, 48 explorer); `state?: 'enabled' | 'disabled' | 'active'`; `variant?: 'global' | 'toolbar' | 'information' | 'functional' | 'inline-active' | 'inline-status'`; `importance?: 'normal' | 'high'` (high: larger size, heavier border, more whitespace, never blue/green); `colourMeaning?: 'error' | 'caution' | 'ok' | 'advisory'` mapping red/yellow/green/blue.
- Labels: ≤3 words, sans serif, sentence case, no bold/italic/underline/colour emphasis. Icons never the only route to functionality (always keyboard shortcut/menu equivalent). Inline status icons not focusable/clickable.
- `<IconToolbar>`: groups by task, separators/space between groups, disabled state follows selection semantics (e.g. Edit/Delete disabled when no record selected).

### 16. Terminology encoding components (displaystandards)
- `<EncodableTextEditor>`: plain-text editor (no user formatting) showing light blue highlight on potentially encodable phrases with visible gaps between adjacent concepts; black normal text on white; left aligned; line-height 1.5; dotted faint marquees for expression groups; single in-focus marquee with bold outline + yellow drag handles (arrows on hover; hover text "Drag the selection to include or exclude text to add meaning to the concept"); keyboard equivalents for boundary adjustment; confirmed text replaced by preferred term/synonym, bold, grey background, inactive until unconfirmed; attribute link words in smaller grey font (e.g. 'with'); right-click "force encode" menu. Props: `text`, `matches: ExpressionMatch[]`, `onConfirm`, `onUnconfirm`, `onBoundaryChange`, `focusedExpressionId`.
- `<SuggestedMatchList>`: vertical stack in same order as text; each match in rectangular (optionally rounded) pale blue box; confirm checkbox far left, label right of it, regular weight; hover yellow/orange + embossed; attributes indented by one checkbox width, value label only (e.g. 'Mild'); non-SNOMED matches below SNOMED matches; free-text chunks below all, one indent, special free-text icon, no checkbox, never bold, exclusion-list-only chunks hidden; no concept IDs by default; message for close/more specific alternatives; checkbox DISABLED with warning when an alternative has identical spelling to top match; confirmed = bold + grey. Must be visible simultaneously with the editor. Keyboard confirm (Space/Enter or double-click equivalent).

### 17. `ShortcutProvider` / `useShortcut` (keyshorts)
- `ShortcutProvider` props: `registry: ShortcutDef[]` where `ShortcutDef = {keys: string; action: string; context: 'general'|'textEditing'|'browser'|string; clinicallySignificant?: boolean; deprecated?: boolean; handler}`; `onConflict?`; `onFeedback?(msg)`.
- Behaviour: ships default map (F1 Help; CTRL+A/S/F/Z/X/C/V/N/W/Y/O/P, CTRL+F4; ALT+F4 quit; TAB/SHIFT+TAB; ESC cancel; arrows for record navigation); dev-time conflict detection (same keys→different actions in same context; different keys→same action); refuses to bind ALT+F4 to anything but quit and refuses system keys; warns on >2-key combos; clinically significant actions must use "difficult zone"/ALT+Function keys, never adjacent to CTRL+Z; feedback toast when deprecated or out-of-context shortcut pressed (never silent); no user-customisable remapping; compatible with Sticky Keys (handle modifier latching via keydown/keyup sequence rather than requiring simultaneous press [suggested]).

## Utility functions (pure, TypeScript)

```ts
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; // May in full (D+Ta-0007), no full stops
const MONTH_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; // JS getDay order; display set Mon..Sun (D+Ta-0016)
const pad2 = (n: number) => String(n).padStart(2, '0');
```
- `formatShortDate(d: DateParts, opts?: {dayOfWeek?: boolean}): string` → `${pad2(day)}-${MONTH_SHORT[m-1]}-${yyyy}`; year padded to 4 digits; prefix `${DAY_SHORT[dow]} ` when requested. Culture-invariant (ignore locale, D+Ta-0010).
- `formatLongDate(d, opts?: {ordinal?: boolean; dayOfWeek?: boolean}): string | ReactNode` → `${pad2(day)} ${MONTH_LONG[m-1]} ${yyyy}`; ordinal: `${day}<sup>${ordinalSuffix(day)}</sup> ${Month} ${yyyy}` (no leading zero). Locale-specific variants only via default regional settings (D+Ta-0014) – for English UK the above.
- `ordinalSuffix(n)`: if `n % 100` in 11..13 → 'th'; else `n % 10` 1→'st', 2→'nd', 3→'rd', else 'th'. Lower case only (D+Ta-0020/0021).
- `formatTime({h,m,s}, {seconds?, approx?})` → `${approx?'Approx ':''}${pad2(h)}:${pad2(m)}${seconds?':'+pad2(s):''}`; assert 0≤h≤23 (never 24), 0≤m,s≤59.
- `formatDateTime(dt, opts)` → `${formatShortDate(date, opts)} ${formatTime(time, opts)}` (single space, never 'T' or '-' or ':').
- `formatNullable(value, formatter, nullText='Unknown')` (D+Ta-0022, D+Tb-0011).
- `formatDuration(p: DurationParts, {approx?, units?})`: order `[years:y, months:m, weeks:w, days:d, hours:hr, minutes:min, seconds:sec]`; filter value>0 (D+Tb-0026); require integers (throw on non-integer, D+Tb-0018); join `${value}${symbol}` (no space, D+Tb-0027) with single space (D+Tb-0028); prefix 'Approx ' if approx; all-zero → '0sec' [suggested, source silent]. Do not auto-normalise carries unless caller asks (source example "1y 10m 2w 12d 20hr 12min"). Optional `durationFromSeconds(totalSec)` → {days,hours,minutes,seconds} [suggested].
- `parseDateInput(text, {ref, allowPartial, allowUnknown}): ParseResult` where `ParseResult = {status:'ok', value} | {status:'ambiguous', candidates: DateInputValue[]} | {status:'incomplete'|'invalid', message}`:
  1. trim; case-insensitive match of 'unknown' (and prefixes 'un'…) → unknown.
  2. Shortcut regex `^([+-]?)(\d+)\s*([dwmy])$` (only these units in date control; reject `h|hr|min|s|sec` with message): sign default '+'; apply to `ref` (day/week arithmetic; month/year add with end-of-month clamp e.g. 31-Jan +1m → 28/29-Feb [suggested; source silent]).
  3. CUI format `^(\d{1,2})[-\s/.]([A-Za-z]{3,9})[-\s/.](\d{4})$` with month name/abbr lookup → ok.
  4. Month-year `^([A-Za-z]{3,9})[-\s]?(\d{4})$` (e.g. "August 2005") → monthYear if allowed else incomplete; year-only `^\d{4}$` → year if allowed.
  5. Numeric `^(\d{1,2})[/.\- ](\d{1,2})[/.\- ](\d{2,4})$`: if both a,b ≤12 and a≠b → ambiguous candidates [dd-mm (UK first), mm-dd] (max 2, D+Tc-0040), e.g. 05/04/2009 → 05-Apr-2009, 04-May-2009; if only one interpretation valid → ok [or still confirm; suggested: confirm when year is 2-digit]; 2-digit year → incomplete/ambiguous (prompt for 4-digit year) [suggested].
  6. Validate real calendar date (e.g. 31-Apr invalid).
- `parseTimeInput(text, {ref, seconds})`: 'unknown' → unknown; shortcut `^([+-]?)(\d+)\s*([hms])$` (h hours, m minutes, s seconds; reject d/w/y, D+Tc-0044); `^(\d{1,2})[:.]?(\d{2})(?::?(\d{2}))?$` 24h (0–23); reject 'am'/'pm' with message to use 24-hour clock. Shortcut arithmetic wraps modulo 24h [suggested; date roll-over left to host].
- `spinTime(t, segment: 'h'|'m'|'s'|null, delta: ±1, showSeconds)`: if segment null → step least significant displayed unit (s if showSeconds else m) with carry; else step only that segment (wrap within its range) (D+Tc-0028/0029).
- `parseDurationInput(text, units)`: tokenise `/(\d+)\s*([a-z]+)/gi` over whole string (must consume all non-space chars else 'invalid: unknown units'); map aliases (y; m/month(s)?; w; d; hr/hrs/h?; min/mins; sec/secs/s?) — bare 'm' is AMBIGUOUS when it could be minutes: return `{status:'ambiguous', candidates:[{months:n},{minutes:n}]}` → "Did you mean: n months or n minutes?" (D+Tc-0037) [policy: treat 'm' as months only when combined with larger units y/w/d preceding it, otherwise ask — suggested]; integers only; duplicate unit → invalid.
- `spansGmtBstChange(start: Date, end: Date, tz='Europe/London'): boolean` → compare UTC offsets at start and end (or check for transition in between) (D+Tc-0048/0049).
- `isAcronymWellFormed(s)` → `/^[A-Z0-9]+$/` (no dots/spaces); `formatAbbreviation(words: string[])` → each truncated word capitalised + '.' with no spaces, e.g. ['tib','ant'] → 'Tib.Ant.'.
- `findDangerousAbbreviations(text, list)`: whole-token, case-sensitive where list entry case matters (e.g. 'pH' vs 'PH', 'st' vs 'ST'); also regex checks for dose-format hazards: trailing zero `\b\d+\.0\b\s*(mg|mcg|ml|g|unit)`, missing leading zero `(?<![\d])\.\d+\s*(mg|mcg|ml)`, drug+dose run-together `[A-Za-z]+\d+\s*mg`, `\d+\s*[Uu]\b`, 'IU', 'cc', 'µg|μg', 'qd|q\.d\.|qod|tiw|sub q|SC|D\/C|>|<|@'.
- `truncateEnd(text, widthPx, measure)`: binary search on word boundaries; never break inside a token matching `/\d/` or a unit; append '…' without preceding space; returns `{display, truncated}`. `truncateMiddle` only for single-line mode. `findIdenticalTruncations(items)` → groups of items whose display strings collide.
- `detectShortcutConflicts(defs)` → conflicts where same normalised key combo maps to different actions within a context, or different combos map to same action; `normaliseKeys('ctrl+shift+a')` order Ctrl, Alt, Shift, Key.
