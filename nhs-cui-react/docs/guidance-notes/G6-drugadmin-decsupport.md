# Drug administration, recording drug risks, decision support

Sources read in full: drugadmin.txt (Medications Management - Drug Administration UI Design Guidance v5.0.0.0), recdrugrisk.txt (Recording Adverse Drug Reaction Risks UI Design Guidance v1.0.0.0), decsupport.txt (Design Guide Entry - Decision Support v1.0.0.0), decsupportsumm.txt (Release 4 Decision Support Summary slide deck, 28-Mar-2007).

Conventions in these notes: [M] = Mandatory, [R] = Recommended, evidence rating after slash (H/M/L). "[suggested]" marks anything not in the source. All three main docs state that illustrations, colours, fonts and icons are illustrative only and NOT mandatory unless a guideline says so.

---

## Medications Management - Drug Administration (drugadmin.txt)

### Purpose
Single-patient electronic drug chart ("Drug Administration View") for reviewing the administration schedule/history and recording administration events in acute inpatient care, modelled on the "Typical Generic Paper" (TGP) drug chart.

### Definitions used throughout
- Conformance: Mandatory = implementation should follow; Recommended = advised to follow. Evidence rating Low/Medium/High.
- "Current" medication = prescribed and not yet discontinued or completed (can also be "current" with reference to a past time).
- "Past drugs" = discontinued or completed at the time the list is viewed.
- Due = within time constraints allowing administration to be recorded as "Given". Overdue = outside constraints for "Given" but within constraints for "Given Late". Time tolerances are set by local governance (not defined). Example tolerances: Due from scheduled time (or e.g. 15 min before), Overdue 1 hour after scheduled time.
- Event schedule states (Table 6):
  - Empty / Future: scheduled, not Due, Overdue or Next.
  - Next: next chronological event for that drug that is not Due/Overdue; if administered while Next, may be categorised "Given Early".
  - Due: within tolerances (example: 1 hour before and after scheduled time); administered while Due = "Given".
  - Overdue: later than tolerance; administered while Overdue = "Given Late".
  - Begun: Significant Duration drug (e.g. infusion) with a recorded start, scheduled to still be running, nothing recorded to say it stopped.
  - Unscheduled (As Required): ad-hoc; administered = "Given".
- Three As Required types: (1) Unscheduled As Required (min interval / max frequency rules); (2) Unscheduled As Required with Indicative Frequency (frequency is instruction only, NOT plotted); (3) Scheduled As Required (plotted like Regular, follows list ordering and positioning rules).
- Drug categories on TGP: Once Only (stat), Regular, As Required (PRN), Infusions/Significant Duration.
- Three times for a recorded event: intended time, recorded time of administration, time of recording.

### Layout (section 1.2)
- View regions: Navigation Controls (top), Toolbar and Column Headings, Notification Area (e.g. Nil by Mouth), list of Drugs (rows), standard Scroll Bar plus Look-Ahead Scroll Bar (LASB) top and bottom, per-row Time Scale Column, Left-Hand Panel (LHP, drug/prescription info) and Chart Area (administration schedule).
- Drugs are horizontal strips; days are columns; four days visible. Column 3 is the widest, "in focus"/"selected" day. Column 1 = two days before selected, column 2 = one day before, column 4 = one day after.
- Example column header strings: "25-May-2007", "26-May-2007", "Today: 27-May-2007", "28-May-2007" (date format dd-Mmm-yyyy per Date Display; 24-hour clock mandated by Time Display).

### Normative guidance

3.3.1 Composition
- MEDa-0001 [M/M] Each row = discrete drug equivalent to a medication line in the Medications List View (rows must correspond 1:1 between views; e.g. do not aggregate two sequential infusion bags in one view and split in another).
- MEDa-0002 [M/M] Each drug bounded by a border (alternate row shading or keylines alone are NOT sufficient).
- MEDa-0003 [M/M] Medication lines separated by white space.
- MEDa-0246 [M/M] Select a medication line by clicking any part of it except parts with their own actions (e.g. information icon).
- Convention (not guidance): each fixed-dose prescription on its own line.

3.3.2 Inclusion criteria
- MEDa-0262 [M/H] Always show all medications that were or are current at any point in the visible time window; a discontinued/completed medication stays only while the window includes a time it was current. Includes meds with no administration events (e.g. As Required never given).
- MEDa-0263 [R/M] When navigating through time, retain medications current as of "now".
- MEDa-0007 [M/M] Dynamically update the list of drugs as navigation changes the visible days.

3.4 List order (based on time of Next scheduled administration, NOT clinical decision support)
- MEDa-0023 [M/M] Order by scheduled time of Next administration, most Due at top; Overdue above Due. RISK noted: users may assume order is clinical priority.
- MEDa-0025 [M/M] Same Next time: higher administration priority (e.g. stricter time tolerance) higher.
- MEDa-0026 [M/M] Regular above unscheduled As Required that share the same Next time and are available (not locked out).
- MEDa-0027 [M/M] Unscheduled As Required currently locked out by a time constraint go below drugs with administrations scheduled before the lockout ends.
- MEDa-0028 [M/M] Begun Significant Duration drugs (not discontinued/stopped) below Due drugs.
- MEDa-0029 [M/M] Drugs with no Due administrations below Begun Significant Duration drugs.
- MEDa-0030 [M/M] Past drugs with more recent administration events above past drugs with older last events.
- MEDa-0031 [M/M] Past drugs below current (including not started) drugs.
- MEDa-0032 [M/M] Maintain list order until manually refreshed or record closed and view re-opened. Rationale also lists "a medication is added or updated (by anyone)" as a reorder trigger. No live re-sorting while open.
- MEDa-0252 [M/M] Event becomes Next when: not an unscheduled As Required event; the drug has no Due or Overdue event; it is the next chronological event for that drug.
- MEDa-0264 [R/L] Use label "Begun" for Significant Duration drugs recorded as started and not stopped/discontinued ("Start" is used for all courses; do not confuse with "To Start At").
- Summary order: Overdue (most overdue first) > Due (strictest tolerance first, then secondary attribute e.g. name, unspecified) > Significant Duration due to start > Begun > available unscheduled As Required > Next not yet Due (earliest first) > locked-out As Required (placed by lockout end) > later Next/Future-only > past drugs (most recent last event first).
- MEDa-0280 [M/M] A drug with past events lacking a recorded status keeps its position, determined by its OLDEST unrecorded event (does not re-sort even if 4 hours Overdue or other events become Due).

3.5.1 Controls
- MEDa-0247 [M/M] Provide at minimum Status Bar and Grouping Control (on the Toolbar, "Drug Chart Controls").
- MEDa-0248 [R/M] Do NOT provide filtering controls.

3.5.2 Grouping
- MEDa-0012 [M/M] No grouping applied by default.
- MEDa-0013 [M/M] When grouped, keep List Order rules within each group.
- MEDa-0218 [R/M] Option for static sort on medication start date and time, clearly labelled (e.g. "Start Date and Time List Order"); overrides dynamic order.
- MEDa-0219 [R/L] Option to group by Once Only, Regular, As Required, Significant Duration.
- MEDa-0261 [R/M] Option to remove an applied grouping.
- MEDa-0249 [M/M] Group heading style consistent with Medications List View. Groups are collapsible (fig 27).

3.5.3 Status Bar
- MEDa-0015 [M/M] Real-time indicator of counts of items that may need attention.
- MEDa-0016 [M/M] Counts for at least: Overdue, Due, As Required, Begun.
- MEDa-0017 [M/H] Formatting draws attention to Overdue and Due and differentiates them.
- MEDa-0018 [M/M] Same Overdue/Due formatting across Status Bar, Chart Area and LASB.
- MEDa-0020 [M/M] Control to refresh list order; example label "Update list order" button on the right; dynamic status counts on the left.
- MEDa-0021 [M/M] Refresh control disabled until a change affects the order (e.g. Due drug recorded as Given). Simply indicate an update is available (no timestamps; research found "time of last update" wording confusing).
- MEDa-0257 [R/L] As Required status shows two numbers: total As Required in list, and how many are not locked out (givable).
- Worked example: Due begins at intended time, Overdue 1 hour later; at 07:40 button disabled; after recording Drug A at 08:09 button enabled; reopening view at 08:15 resets it to disabled.

3.6 Navigation
- MEDa-0033 [M/M] Back/forward one-day controls, left and right of the date columns respectively (arrows).
- MEDa-0034 [M/M] Calendar control within the column heading of the selected day.
- MEDa-0035 [M/M] Calendar provides a quick "go to today"; conforms to Date/Time Display and Date and Time Input guidance.
- MEDa-0036 [R/M] If a drug has no event visible, mark presence and direction of earlier/later administrations with an arrow/icon at the edge of the Chart Area for that line; must have a tooltip.
- MEDa-0037 [M/M] Clicking that marker jumps to the Next event in that direction for that drug.
- MEDa-0038 [M/H] List order is maintained when navigating time.

3.7 Look-Ahead Scroll Bar
- MEDa-0039 [M/H] Use a LASB per Medications List guidance (look-ahead notification areas above and below the scrollable list listing out-of-view drug names; clicking a name scrolls it into view).
- MEDa-0040 [R/H] Same Overdue/Due formatting in look-ahead notifications (examples: Overdue red, Due blue).
- MEDa-0041 [M/H] Do NOT show names of past drugs in LASB notifications.

3.8.1 Left-Hand Panel
- MEDa-0265 [M/H] Drug name/details per Medication Line guidance.
- MEDa-0042 [M/M] Drug details at top of LHP.
- MEDa-0043 [R/M] Prescriber name below drug details, preceded by a prescriber icon.
- MEDa-0044 [M/M] Start date below prescriber, preceded by a text label. Before first dose = intended first administration date/time; after = actual date/time of first dose. RISK: does not show whether start was late.
- MEDa-0045 [M/M] End or review date (if exists) below start date, preceded by text label.
- MEDa-0046 [M/M] LHP flexible height for long names/details (LHP may grow deeper than chart area).
- MEDa-0222 [M/M] Past drugs show "Completed" or "Discontinued" label in place of end/review date label.
- MEDa-0223 [R/M] Past label visually distinct (e.g. reverse video).
- MEDa-0224 [M/M] As Required and Once Only lines visually distinct from other lines and from each other (beyond frequency text).
- MEDa-0225 [R/M] Label stating As Required or Once Only in addition to frequency.
- MEDa-0251 [M/M] Timescale and line flexible in height for high-frequency schedules.

3.8.2 LHP icons
- Two kinds: label icons (prefix text labels) and status icons (indicate presence/absence of info; also open the Information Panel).
- MEDa-0051 [M/M] Status icons per line (e.g. pharmacist verified, additional administration instructions).
- MEDa-0050 [M/L] Status icons grouped in a consistent location.
- MEDa-0053 [M/M] Selecting a status icon opens the Information Panel for that line; MEDa-0054 [M/M] showing that icon's information.
- MEDa-0059 [R/M] Icons for prescriber, start date, end/review date.
- MEDa-0058 [M/M] Prescriber icon opens prescriber information.
- MEDa-0227 [M/M] Each icon means the same thing and sits in the same position on every line.
- MEDa-0266 [M/M] Where pharmacist verification is used: verification icon with at least "verified" and "awaiting verification" states, giving access to verifier details.
- MEDa-0229 [R/L] Verification icon leftmost in the group.
- MEDa-0267 [R/M] Tick in the icon marks verified (mark verified, not unverified).
- MEDa-0268 [M/M] If verification not used/supported, do NOT show the icon (never a "disabled" icon: could be misread as checked).
- MEDa-0298 [R/M] Verification icon uses green prominently (pharmacists' green ink).
- Verifier name need not be permanently displayed, but easily accessible.

3.8.3 Information Panel
- MEDa-0060 [M/M] Tabs for each information icon, labelled with text and icon.
- MEDa-0061 [R/M] Control to open all details for the drug (administration/preparation instructions).
- MEDa-0062 [M/M] Tab order matches LHP icon order (left-to-right becomes top-to-bottom), followed by Prescriber.
- MEDa-0063 [R/M] Panel extends downwards from the LHP. Purpose: show info in full rather than truncate.

3.9.1 Chart Area structure
- MEDa-0064 [M/H] At 1024 x 768, show 4 days: selected day, two back, one forward.
- MEDa-0065 [M/H] Default selected day = today.
- MEDa-0066 [M/M] Concise set of symbols reflecting statuses in MEDa-0119.
- MEDa-0067 [M/H] One column per day, days left to right.
- MEDa-0068 [M/H] Within a column, time runs top to bottom.
- MEDa-0269 [M/H] Event icon outline symmetrical about a horizontal axis.
- MEDa-0232 [M/H] Icon centre aligned vertically with its time (horizontal centre line = time).
- MEDa-0270 [M/H] Scheduled events plotted at intended time.
- MEDa-0271 [M/M] Every unscheduled As Required shows one event at the current time that moves as time passes (allows recording). RISK: same icon as Due may encourage over-administration.
- MEDa-0272 [R/M] Once a status is recorded, make both intended time and recorded administration time clear (either plot at recorded time, or at intended time with recorded time shown). RISKs noted for both.
- MEDa-0273 [M/M] Recorded unscheduled As Required events plotted at recorded administration time.
- MEDa-0274 [M/M] Events and their text must not overlap, be truncated by, or fall outside the line border.
- MEDa-0275 [R/M] Events must not overlap each other; extend timescale if needed.

3.9.2 Time scale (per drug, vertical ruler between LHP and chart)
- MEDa-0069 [M/M] Vertical time scale at left side of chart area, associated with the line's LHP.
- MEDa-0070 [M/M] Ruler-style demarcations.
- MEDa-0071 [M/M] Current time marked with a horizontal line in the time scale.
- MEDa-0072 [R/M] Same current-time line inside selected day (examples use orange).
- MEDa-0073 [R/M] Shade the past in the time scale same as in chart area.
- MEDa-0231 [M/H] Linear time: full line height = 24 hours, half = 12 hours (positions proportional, not evenly spaced labels).
- MEDa-0233 [M/M] Same vertical scale for all drugs, except a line may grow to fit events.
- MEDa-0234 [R/M] Minimum line height fits six events with four at the local "standard" drug-round times.
- MEDa-0235 [M/H] Show the drug's scheduled times in its time scale.
- MEDa-0276 [M/H] Show ONLY the drug's scheduled times (no standard round times, no others).
- MEDa-0236 [R/M] No times in the time scale for unscheduled As Required drugs.
- MEDa-0237 [M/M] Ruler bottom = 24:00 (00:00:00 end of day), top = first moment after 00:00 (00:00:01); both labelled "00:00". Grow line height if events need space there.
- MEDa-0255 [M/M] Current-time line moves down as the day passes.
- MEDa-0259 [M/M] Current-time line must not reduce text legibility (e.g. text on solid background).
- Not allowed (figs 70-73): timescale times not matching scheduled event positions; omitting scheduled times; not covering 24 hours; non-proportional spacing.
- 24-hour clock mandatory (Time Display).

3.9.3 Past/future
- MEDa-0277 [M/M] Shade chart area to differentiate past vs future (filled = past, unfilled = future, line = now); consistent with Timeline View.
- MEDa-0078 [M/M] Symbol form differs for scheduled events with vs without a recorded status.

3.9.4 Today
- MEDa-0079 [M/H] Mark today's column heading with an icon and precede the date with the word "Today" (e.g. "Today: 27-May-2007").
- MEDa-0080 [M/M] Today's heading formatted differently (e.g. background colour; example orange header), retained even when today is not the selected day.
- MEDa-0081 [R/M] Horizontal "now" line in today's column, same style as MEDa-0071.

3.9.5 Selected day
- MEDa-0082 [M/M] Border round the selected day.
- MEDa-0083 [R/L] Border extends across all drug rows.
- MEDa-0084 [M/M] Selected day is always the third (wide) column; it does not move during navigation.

3.9.6 Information display
- Three icon kinds: scheduled not-yet-Due (simple generic icon, still clickable for early administration); active Due/Overdue (look clickable); recorded (icon shows status e.g. Given, Patient Refused).
- MEDa-0085 [M/M] Icon for every administration event.
- MEDa-0086 [M/M] Due/Overdue events are "active" and look clickable.
- MEDa-0087 [M/M] Event icons in a single column per day, never side by side within a day.
- MEDa-0278 [R/M] Supplementary icons to the right of the event icon for: start of new drug (first administration); multiple entries for the event; review scheduled at same time; lockout on the drug line.
- MEDa-0089 [M/H] Text formatting, explicit labelling and colour distinguish statuses.
- MEDa-0090 [R/M] UK systems: white text on red background for Overdue.
- MEDa-0091 [R/M] Reverse video for text label of Overdue and Due.
- MEDa-0094 [R/M] Start and end/review times marked in chart with same icons as LHP.
- MEDa-0095 [M/H] Edited status shows icon for the LATEST status.
- MEDa-0096 [M/L] Plus an additional "edited" icon, always visible (not only on hover).
- MEDa-0238 [M/M] Notes can be recorded on any event, including Future.
- MEDa-0250 [M/M] Labels Overdue, Due, Next include the time they were due (e.g. "Overdue 08:00") [label composition example suggested].
- MEDa-0258 [R/M] Indicator icon if a related test result is available.

3.9.7 Selected-day information
- MEDa-0097 [M/H] Wider column for selected day.
- MEDa-0098 [M/M] More information in selected day; other days only significant info (e.g. administration not to plan).
- MEDa-0099 [R/M] Non-selected days show info only when additional to what is ordinarily expected.
- MEDa-0100 [M/M] Selected day shows info (e.g. mandatory notes) supporting the Next event.
- MEDa-0101 [M/H] Truncate with an ellipsis.
- MEDa-0102 [M/M] Next-event info may obscure other info if necessary.
- MEDa-0103 [M/H] Show as much as possible before truncating.
- MEDa-0104 [M/M] Do NOT show a time for administrations within tolerance with no more precise time given/required.
- MEDa-0105 [M/L] Approximate time recorded: prefix the time with "Approx" in the selected day (e.g. "Approx 08:30").
- MEDa-0106 [M/L] Exact time recorded: show the time in the selected day.
- MEDa-0256 [R/M] Show notes entered during recording where space allows.
- MEDa-0299 [R/L] Guide clinician to view all relevant info before administering from a non-selected day. Suggested mitigation: make day selected when an event in it is selected.

3.9.8 Access to more details (recorded events)
- MEDa-0108 [M/M] Details and actions on hover, click or keyboard selection of a recorded event icon.
- MEDa-0109 [M/M] Hover uses a time delay for opening and closing.
- MEDa-0111 [M/L] Details above actions (example: "11:00", "Given as Planned", then actions "Change", "Add a note").
- MEDa-0112 [M/M] Close by clicking elsewhere or pressing Esc.
- MEDa-0113 [M/M] Details spatially and visually associated with the icon.

3.9.9 Symbols and icons
- MEDa-0115 [M/H] Always show a status icon for each event.
- MEDa-0116 [M/M] Special icons are supplementary to (not replacements for) the status icon.
- MEDa-0117 [M/M] Filled icon = successful administration; unfilled = not successfully administered; unfilled icons must have a solid border.
- MEDa-0118 [R/L] Not-yet-Due scheduled = simple icon with dotted border.
- MEDa-0119 [M/M] Support at minimum the ePrescribing functional spec statuses.
- MEDa-0120 [M/H] Colour never the only distinguishing attribute.
- MEDa-0121 [M/M] Activatable/hoverable symbols at least 16 x 16 px.
- Example status set (fig 95): Given; Given Once Only drug; Given Late; Given Early; Recording of a self-administration; Patient refused; Patient absent; Other clinical reason; Drug unavailable; Nil by Mouth; Drug-free interval; Deferred administration; Unknown; Clear the administrative event (if recorded in error).
- No-status icons (fig 96): future scheduled; Due not yet recorded; requires a witness; Due Once Only.
- MEDa-0132 [M/M] Once Only events use a different icon shape from Regular (example: Once Only round, others square). MEDa-0241 [R/M] Once Only lines distinct style in LHP (e.g. colour).

3.10 Overdue
- MEDa-0122 [M/H] Text formatting, explicit label and colour draw attention to Overdue.
- MEDa-0123 [M/M] Overdue per system time-tolerance rules.
- MEDa-0279 [M/M] Overdue indication clear in narrow (non-selected) columns too.
- MEDa-0281 [R/M] Do NOT automatically change Overdue to another status (e.g. not "Unknown" after 3 hours). RISK: multiple Overdue events may be given in quick succession.
- MEDa-0282 [M/M] If a system does auto-change, new status must mean "unknown", must not imply not administered. Prohibited: labels "Missed", "Not Recorded", and a cross icon.
- MEDa-0283 [R/M] Clinician can record status "Unknown" on any event.
- MEDa-0284 [R/M] When recording an event for a drug with multiple past events lacking status (e.g. two Overdue, or Overdue + Due), show a message alerting to them and describing the process.

3.11 As Required
- MEDa-0133 [M/H] Past As Required icons shown only when a status has been recorded via the form.
- MEDa-0134 [M/M] Show criteria for administration explicitly (e.g. "for pain", "If beats per minute goes below 60"); must be displayable even outside selected day.
- MEDa-0135 [M/M] Where relevant, control in selected day to enter/calculate/check the criteria.
- MEDa-0136 [M/M] Strongly indicate active time restrictions (max frequency, min interval) even if other criteria met. Lockout is advisory: never block recording.
- MEDa-0137 [M/M] Clearly indicate when time restrictions end.

3.13 Significant Duration (infusions, gases etc.; not HDU/ITU; not pump-linked)
- MEDa-0142 [M/H] Different format from discrete events.
- MEDa-0143 [M/M] Simple graphic with start and stop or estimated stop times.
- MEDa-0144 [M/M] Graphic position/height implies scheduled start and expected duration.
- MEDa-0285 [M/M] Estimated stop recalculated from recorded start and recorded interruptions.
- MEDa-0146 [M/H] Very clearly mark estimated stop times as estimates.
- MEDa-0286 [R/M] Scheduled formatting same as discrete events (e.g. dashed border).
- MEDa-0287 [R/M] Update graphic when recorded as started (e.g. dashed to solid border).
- MEDa-0145 [M/H] Do NOT animate/update graphic to show elapsed running time (no progress bars, no running totals).
- MEDa-0147 [M/M] Mark recorded interruptions on the graphic (e.g. MRI suspension, long bag-change gaps).
- MEDa-0148 [M/M] Status box placed consistently in the selected day.
- MEDa-0149 [R/H] Status box indicates how to reach detailed view (control if available).
- MEDa-0150 [M/M] Status box text examples: "Start at 10:00", "Due at 10:00", "Begun", "Completed", "Discontinued".
- MEDa-0151 [R/H] Recorded status shown with icon, same as discrete icons where possible.
- Detailed view: MEDa-0152 [R/M] bag changes, rates, pump settings, changes, issues, notes; MEDa-0153 [R/M] graphic with distinct markers for notes/observations/issues; MEDa-0157 [R/M] checks with recorded volumes/rates; MEDa-0159 [R/M] outstanding issues with instructions and action buttons.
- MEDa-0160 [R/M] Record Significant Duration administration only in detailed view, not main view.
- MEDa-0161 [R/M] Indicate whether recorded volumes are approximate.
- MEDa-0162 [R/M] Issues/notes/changes classified from a limited list.

3.14 Nil by Mouth
- MEDa-0163 [M/M] Notification across top of view, below column headings, above medication lines and scroll bar; space reclaimed when not NBM.
- MEDa-0164 [M/H] Do NOT auto-disable recording for oral drugs.
- MEDa-0165 [M/M] Opening the form for an oral drug while NBM: remind and offer Given (override) or "not given due to Nil by Mouth". Example: message "This patient is currently Nil by Mouth" with buttons "Skip this administration" and "Record an administration" (labels not guidance).
- MEDa-0166 [M/L] Choosing not to give opens form with fields for "not given due to Nil by Mouth"; still requires explicit confirm.
- MEDa-0167 [M/L] Choosing to give opens the default successful-administration view.

3.15 Complex drugs
- Dose variation types: Conditional Dose (warfarin, insulin, gentamicin) yes; Dose Range (As Required analgesia) yes; Constant Dose-Pattern (furosemide morning/evening) yes; Varying Dose-Pattern (prednisolone taper) yes; Loading Dose no; Adjusted Dose no.
- MEDa-0288 [M/M] Conditional: criteria for dose next to Next upcoming event icon in selected day.
- MEDa-0289 [M/M] Conditional: actual dose next to every Given/partially administered event, all days.
- MEDa-0290 [M/M] Dose Range: range and criteria next to Next event in selected day.
- MEDa-0291 [M/M] Dose Range: actual dose next to Given/partial events, all days.
- MEDa-0292 [M/M] Dose pattern: actual dose next to Given/partial events, all days.
- MEDa-0293 [M/M] Dose pattern: intended dose on all scheduled events, all days.
- Preconditions: MEDa-0173 [M/M] icon marks events with preconditions (past and future); MEDa-0174 [M/M] text describing precondition in selected day; MEDa-0175 [R/H] access to resources to interpret/record; MEDa-0176 [M/M] more info on hover; MEDa-0177 [R/M] past events show recorded precondition details on hover/selection and in selected day; MEDa-0178 [M/H] authorised users can override.
- Time-critical: MEDa-0179 [M/M] icon marks events with special time tolerances (e.g. Parkinson's medication); MEDa-0180 [M/M] past time-critical events in selected day show administration time.
- Witness/role/self: MEDa-0181 [R/M] self-administrations show recorder's name; MEDa-0182 [M/M] role-required supplementary icon (need not show role); MEDa-0183 [M/M] selected day shows required role (future) or recorder name (past); MEDa-0184 [M/M] witness-required special icon; MEDa-0185 [M/M] witness credentials mandatory in recording form; MEDa-0186 [R/L] self-administration special icon.
- Partially-logged administrations: out of scope; implementers must consider safety.

3.16 Recording form
- MEDa-0190 [M/H] Open by pointer click or keyboard selection of a Due, Overdue or Future event icon.
- MEDa-0191 [M/H] Must not obscure the LHP or the event.
- MEDa-0192 [M/M] Visually associated with its event; MEDa-0193 [M/M] adjacent to the launching icon.
- MEDa-0194 [M/M] Dim everything except that drug's LHP and selected-day cell.
- MEDa-0245 [M/H] Always fully on-screen (reposition to avoid clipping).
- MEDa-0195 [M/H] Field set varies by selected status.
- MEDa-0196 [M/M] Mandatory data first, clearly separated from optional.
- MEDa-0197 [M/H] Structured fields derived from drug item details.
- MEDa-0199 [M/M] Optional details grouped and the group named.
- MEDa-0200 [M/M] Default optional fields depend on drug type; MEDa-0201 [R/M] simple control for more optional fields.
- MEDa-0203 [R/M] Optional free-text notes area.
- MEDa-0260 [M/H] Mechanism to clear the event back to its prior state (e.g. "Clear the event details" tab), but the edited icon/history must be retained (MEDa-0096); audit trail kept.
- MEDa-0204 [M/M] Default field set most appropriate for the event's status.
- MEDa-0205 [M/M] Clearly labelled submit control (example "Record Administration") is the default action for Enter.
- MEDa-0206 [M/M] Explicit "Cancel" control.
- MEDa-0207 [R/M] Pre-fill where safe (e.g. time = now); do NOT pre-fill dose for a dose-range drug.
- MEDa-0208 [R/M] Controls to open additional forms for complex administrations; MEDa-0209 [R/L] control communicates result.
- MEDa-0210 [R/M] Record specific/partial dose amounts; MEDa-0211 [R/M] incremental doses; MEDa-0212 [R/M] site rotation and limited-list site selection.
- MEDa-0239 [M/M] Administration time cannot be in the future (may record against a Future event, but time must be <= now).
- Minimum two user actions to record (no one-click recording from the chart).

3.17 Medication updates while view open
- MEDa-0294 [M/M] Clearly indicate a change (new, edited, discontinued) and let the clinician see what it is.
- MEDa-0295 [R/L] Do not dynamically update the view.
- MEDa-0296 [R/L] Freeze the view and present a message with update details and effects (e.g. re-sort); unfreeze after acknowledgement.
- MEDa-0297 [R/L] Allow recording per pre-update values; message explains to complete recording per prior values if already administered.

### Accessibility points
- Colour never the only cue (MEDa-0120); use shape (round vs square, filled vs unfilled, dotted vs solid border), labels and text.
- Min 16 x 16 px for interactive icons (MEDa-0121).
- Keyboard: event details via keyboard selection (MEDa-0108), Esc closes popovers (MEDa-0112), Enter submits recording form (MEDa-0205), form opened by keyboard selection (MEDa-0190).
- Tooltips on navigation arrow markers (MEDa-0036); hover delay (MEDa-0109).
- Referenced docs: "Accessibility Checkpoints for NHS Applications" and "Accessibility for Clinical Applications".
- [suggested] Provide aria-labels including status and times for each event icon; announce Status Bar count changes politely.

### Patient-safety rationale (key)
- Borders + white space prevent misassociating LHP with another row's events.
- No grouping by default so Due/Overdue are not hidden below the fold.
- No live re-sorting so a recorded drug does not "disappear" and another appear under the cursor.
- No filtering: missed medications risk.
- Overdue never auto-changes; "Not Recorded"/"Missed"/cross misread as not administered (only 45%/64% interpreted correctly).
- Show only scheduled times in timescale so standard round times are not mistaken for scheduled ones.
- Significant Duration graphic must not imply real-time progress.
- Disabled verification icon could be misread; hide instead.
- Dim other rows during recording to avoid wrong-line recording after distraction.
- Freeze-and-message on prescription updates to avoid reading the dose of a replaced top row.
- NBM and As Required lockouts warn but never block (extenuating circumstances; accurate record of errors).

---

## Recording Adverse Drug Reaction Risks (recdrugrisk.txt)

### Purpose
Guidance for adding, editing, removing ADR risks in a patient's "Adverse drug reaction summary" and recording "No known adverse drug reaction risks", so future prescribers are warned. Distinguishes future risk (summary entry) from past reaction events (detailed notes elsewhere).

### Key terminology rules
- UI must call the list "Adverse drug reaction summary" (or "Adverse drug reaction summary list"); each line is an "Adverse drug reaction". Avoid the word "risk" and "propensity" in clinician-facing labels (users misunderstood them); refer to "adding to the summary". Exception: the specified button labels below do use "risk(s)".
- Do not display "propensity to adverse reactions to..." or "has causative agent" labels.
- Severity is NOT a structured overall rating of the risk (dangerous, misleading); severity is implied by reaction type or expressed as a post-coordinated qualifier on a reaction (e.g. "severe rash").
- Assumes SNOMED CT and dm+d; PC screen applications.
- Clinical statements: risk statement must have at least one date/author/source; each "type of reaction" statement likewise (date of entry acceptable).
- System records automatically: entry date/time and author (from login). Structured date entry by clinician is not required.
- Screen flow: ADR summary list -> "Add new drug reaction" -> entry dialog -> Finish -> back to summary list (with "New" highlight).

### Normative guidance

3.2.1 Initiating add
- RAD-0010 [M/H] Control in the ADR summary list to start adding. RAD-0010.1 [M/H] opens the entry dialog. RAD-0010.2 [M/H] Always visible on first viewing the summary.
- RAD-0010.3 [R/H] It is a button; RAD-0010.3.1 [R/M] at top of summary display (top right; title is top left).
- RAD-0010.3.2 [M/H] Label phrased as the adding action; RAD-0010.3.3 [R/M] label "Add new drug reaction".
- RAD-0010.3.4 [R/H] Adjacent to the other dialog options (e.g. "Close" or the corner "x"). Do not split related command buttons; do not use overly complicated phrase.

3.2.2 Entry dialog
- RAD-0020 [M/H] Title communicates purpose; RAD-0020.1 [R/H] phrased as the action; RAD-0020.2 [M/H] prominent; RAD-0020.3 [R/H] top left.
- RAD-0030 [R/H] All global function buttons in one location; RAD-0030.1 [R/M] horizontally adjacent; RAD-0030.2 [R/M] action-phrased labels (consistent set: "Add", "Close", "Cancel", "Finish", "Undo").
- RAD-0040 [M/H] Grey out (disable) global buttons that cannot be activated.
- RAD-0040.1 [R/M] Common point of reference (banner) spanning list display and input set.
- RAD-0040.2 [R/H] Show what will appear as the summary line once saved.
- RAD-0040.3 [R/M] Banner in the input set looks like a summary list line ("LEVEL 1") and populates live as user types.
- RAD-0040.4 [R/M] Banner formatted like a selected summary line. RAD-0040.5 [R/M] shows causative agent after entry; RAD-0040.6 [R/M] shows reaction types after entry. RAD-0040.7 [R/M] Highlight entered data that will be top-level visible.
- RAD-0050 [M/H] Communicate that fields relate to adding a new entry.
- RAD-0060 [R/H] Brief instruction prompt; RAD-0060.1 [R/H] prompt states purpose (it will warn other clinicians); RAD-0060.2 [R/L] prompts may disappear once entry starts; RAD-0060.3 [R/L] prompts may be in banner.
- RAD-0070 [R/L] Prompt info always reachable via on-screen help.
- Undo/redo, if the app has them, apply to the dialog but no Undo button inside it.
- "Dialog" may be an inline section, not necessarily modal.

3.2.3 Existing risks while entering (note ID RAD-0070 reused in source)
- RAD-0070 [M/M] Access existing reaction risks without leaving the dialog.
- RAD-0070.1 [R/M] Where space allows show all existing entries simultaneously with the inputs.
- RAD-0070.2 [M/H] Label/header on any list of existing entries.
- RAD-0070.3 [R/H] Stacked vertically (NOT tiled/horizontal wrap).
- RAD-0070.4 [R/L] Immediately to the right of the entry field set.
- RAD-0080 [M/H] Warn if entering a drug already entered.

3.2.4 Field order and tabbing
- RAD-0090 [R/H] All fields except causative agent disabled until it is completed; RAD-0100 [R/H] then enable.
- RAD-0110 [M/M] If agent cleared after other data entered, warn that without a causative agent the entry will not be saved or shown in the list.
- RAD-0120 [R/H] Autofocus causative agent on open.
- RAD-0130 [R/M] If agent empty, Tab goes to "Cancel".
- RAD-0140 [M/H] After agent entered, provide control to leave with entry retained/committed (Finish).
- RAD-0150 [M/H] Tab order matches left-to-right, top-to-bottom visual order. RAD-0150.1 [R/H] Order: causative agent, reaction types, source of information, "Clinician witnessed reaction", justification/details; then command buttons (incl. Finish). Fields arranged vertically (horizontal arrangement caused missed fields).

3.2.5 Causative agent
- User types all/part of drug name; matching progressive (as you type) or user-triggered (button or Enter). Example: after 3 letters (or clicking search icon) match against SNOMED CT constrained by subsets (see Terminology Matching).
- RAD-0160 [M/M] Show labels for subsets filtering the match (e.g. "Current filter: Drug allergens") while entering agent or reaction types. User can change filter to non-drug substances; default subset excludes brand (trade family) names but can be expanded.
- RAD-0170 [M/M] Encoded causative agent text in bold.
- RAD-0180 [R/H] Capture per SNOMED CT post-coordinated structure; user only types drug/substance name.
- RAD-0190 [R/H] Drug: post-coordinate 419511003 |Propensity to adverse reactions to drug| : 246075003 |has causative agent| = drug concept. Non-drug: 418471000 |Propensity to adverse reactions to substance| : 246075003 = substance concept. Do not use pre-coordinated allergy codes (e.g. 91936005) for new entries.
- RAD-0191 [R/M] Unrecognised term: warn, but allow free text entry, formatted to show it is not encoded (A.5 "Match Not Found").
- Drug class concepts display "(class)" next to label (e.g. "penicillin (class)"), and it must remain after encoding.
- A fly-out with the SNOMED definition appears automatically while selecting from results (mitigates look/sound-alike).
- Partial/prefix matching to tolerate misspelling.

3.2.6 Reaction types
- RAD-0200 [M/M] Controls for entering types of past reaction.
- RAD-0210 [M/M] Text entry fields for keywords/key phrases.
- RAD-0220 [M/M] Multiple keywords per drug.
- RAD-0230 [M/M] Encourage at least one encoded SNOMED CT concept per distinct reaction (but reactions not mandatory; may be unknown).
- RAD-0240 [R/M] Elaborating/qualifying text per keyword. RAD-0250 [R/M] Elaboration free or encoded; if encoded must be linked by terminology/data model.
- RAD-0260 [M/H] Warn if words fundamentally change keyword meaning: negation, reduction, references to family history or other patients.
- RAD-0270 [M/H] Clear which elaboration belongs to which keyword.
- RAD-0280 [M/H] Clear section label; RAD-0280.1 [R/M] "Type(s) of reactions experienced".
- RAD-0290 [R/H] Allow negation, post-coordinated with "known absent".
- RAD-0300 [R/H] Allow severity qualifiers, post-coordinated.
- RAD-0310 [R/H] Prompting text in the fields.
- RAD-0320 [M/H] Allow deleting a keyword; RAD-0330 [R/L] clicking an encoded keyword reveals a delete button.
- Mechanism (A.3): single search input; on selecting a match the encoded term is inserted on a new line in a list/text box to the right and the search field clears; user may Tab into right-hand field to add free text after the term, or search another. Prompt text shows in right field until data entered. (Earlier "add another field" button design failed testing.)

3.2.7 Elaboration
- RAD-0340 [R/M] Free text elaboration; RAD-0350 [R/L] strongly visually associated with its keyword; RAD-0360 [R/M] saved/retrieved as one unit with keyword (one clinical statement).
- RAD-0370 [R/L] Free-text words that are SNOMED severity/certainty qualifiers highlighted and offered for encoding (only if text parsing available).
- Warn on negation in elaboration text.

3.2.8 Justification / details
- RAD-0380 [R/H] Free text justification/details for the overall entry; RAD-0380.1 [R/H] unlimited length, field scrolls.
- RAD-0390 [R/M] One or more such fields. RAD-0400 [R/H] Free or encoded per data model.
- RAD-0410 [R/M] Identify reaction keywords typed into justification; RAD-0410.1 [R/M] tell user a significant reaction word was found and should be entered in "Type(s) of reactions experienced"; RAD-0410.2 [R/M] coloured highlight; RAD-0410.3 [R/H] do NOT highlight words already matched in reaction types. Highlight and warning disappear after the term is entered in the reaction section.
- RAD-0420 [R/M] Placeholder prompts when empty (or unfocused and empty).
- Field label example "Other details/ justification"; confirm dialog uses "Justification/ Details".

3.2.9 Source of information
- RAD-0430 [M/H] Allow specifying source. RAD-0430.1 [R/M] most recent source (how discovered). RAD-0430.2 [R/H] field; RAD-0430.3 [R/H] drop-down.
- RAD-0430.4 [M/H] Suitable prompt; RAD-0430.4.1 [R/M] "Enter source of most recent information".
- RAD-0430.5 [M/H] Fixed list set by clinical authority (illustrative values only; e.g. patient testimony, third party, clinical documentation, "Clinician witnessed reaction").
- RAD-0430.6 [R/H] NO default selection (blank until chosen; never pre-filled by system).
- RAD-0440 [R/M] Control to state a clinician witnessed the reaction; RAD-0440.1 [R/M] checkbox ("Clinician witnessed reaction"); RAD-0440.2 [R/L] selecting "Clinician witnessed reaction" in the drop-down auto-ticks the checkbox.
- Avoid ambiguous prompts such as "How did you discover the risk?" (confused patient vs HCP).

3.2.10 System-detected ADR confirm dialog
- RAD-0450 [M/H] When notes suggest an ADR, show a dialog to confirm adding to the list.
- RAD-0460 [M/H] Option to add; RAD-0470 [R/M] option to ignore; RAD-0480 [R/M] adjacent; RAD-0490 [R/M] clearly labelled: RAD-0490.1 [R/M] "Yes, record the risk"; RAD-0490.2 [R/M] "Cancel"; RAD-0490.3 [M/H] labels consistent with heading.
- RAD-0500 [R/M] Buttons top right like other ADR dialogs.
- RAD-0510 [M/M] Show all details forming the entry before confirm; RAD-0520 [R/H] fields appear editable; RAD-0530 [R/M] encourage edits.
- RAD-0540 [R/M] Show selection of original notes (e.g. text containing "allergy to penicillin").
- RAD-0550 [R/L] Prepopulate causative agent and reaction keywords if known; RAD-0560 [R/L] narrative block goes into "Justification/ Details" with encoded items highlighted; RAD-0570 [R/M] unknown data left blank (source never pre-filled).
- RAD-0580 [M/H] Disable "Yes, record the risk" if no causative agent.
- RAD-0590 [R/H] Clear feedback that it was added; RAD-0600 [R/H] dialog closes and reveals the ADR list.
- Cancelling a prefilled form must not alter clinical notes [implied by research].

3.2.11 Duplicates
- RAD-0610 [M/M] Warn if causative agent equals that of an existing entry (exact code match; similar agents e.g. penicillin vs amoxicillin allowed).
- RAD-0620 [R/L] Tell user they must remove the existing entry before adding a new one with the same agent.

3.2.12 Feedback
- RAD-0630 [R/H] Highlight entries just added/changed. RAD-0640 [R/M] text "New"; RAD-0650 [R/M] text "Updated"; RAD-0660 [R/H] immediately adjacent to the entry; RAD-0670 [R/M] only for the current viewing; gone after close and reopen.

4 Removing
- Principles: never delete notes; remove from summary only; explain why; removed entries viewable.
- RAD-0680 [M/H] Removal control easily accessible from list; RAD-0680.1 [R/M] in the "details" view of an entry (user opens details first); RAD-0680.2 [R/M] button (label "Remove from list").
- RAD-0690 [R/H] Removes agent, reaction types, justification from the active list.
- RAD-0700 [R/M] Hover message explaining what happens (including that a reason can be entered).
- RAD-0710 [M/H] Removed entries accessible in a "display deactivated summaries" mode.
- RAD-0720 [R/H] Encourage a reason for removal (whether mandatory is for clinical authority); text field expands/scrolls.
- RAD-0730 [M/H] After removal return to the ADR list; RAD-0740 [M/H] entry no longer in list.
- RAD-0750 [R/H] Confirmation message explaining implications with proceed/cancel. RAD-0750.1 [R/M] It must: name the drug and where removed from (the ADR list); explain related clinical notes remain on record; explain clinicians will no longer be warned by the system not to administer it. RAD-0750.2 [M/M] two buttons; RAD-0750.3 [M/H] labels consistent with the question wording.

5 No known ADRs
- Principle: distinguish "unknown status" from "known absence".
- RAD-0760 [R/H] When status unknown or NKADR recorded, three buttons: confirm no known ADR risks; add new; close. RAD-0760.1-.4 [R/H] buttons, adjacent, same place as other dialogs, top right. RAD-0760.5 [M/H] clear labels; RAD-0760.6 [R/H] label "No known adverse drug reaction risks".
- RAD-0770 [M/H] On click, phrase "No known adverse drug reaction risks" appears in main area.
- RAD-0780 [M/M] Date of entry and author's name appear next to it.
- RAD-0790 [R/M] Drop-down for source of this information appears.
- RAD-0800 [R/L] Entry field for supporting details appears.
- RAD-0810 [R/H] "Close" changes to "Finish".
- RAD-0820 [M/M] The NKADR button becomes disabled and stays disabled while dialog open.

6 Editing
- Principles: direct editing near display; clear demarcation of editable vs not; changing causative agent changes meaning.
- RAD-0830 [M/H] Control makes all details editable EXCEPT causative agent, and allows adding. RAD-0830.1 [R/H] in "details" view; RAD-0830.2 [R/H] fields rendered like entry dialog, prepopulated; RAD-0830.3 [R/H] label "Edit".
- RAD-0840 [R/M] Local edit control per item; RAD-0840.2 [R/M] double-click or right-click "Edit" makes item editable.
- RAD-0850 [M/H] "Finish" disabled until data changed/added.
- RAD-0860 [M/M] After a change, "Back" becomes "Cancel".
- RAD-0870 [M/H] "Cancel" returns to list without saving; RAD-0880 [M/H] "Finish" returns to list and saves.
- RAD-0890 [R/H] Access to edit history with dates for details view data (A.4).
- Opened entries must look editable (research finding).

### Accessibility points
- Logical tab order equals visual order (RAD-0150); autofocus first field (RAD-0120).
- Disabled controls visually greyed (RAD-0040).
- Bold to show encoded text (RAD-0170) should be paired with a non-visual cue [suggested: aria-description "coded term"].
- Highlights in justification should not rely on colour alone [suggested]; research showed blue highlight misread as severity warning.
- Hover messages (RAD-0700) need keyboard-accessible equivalent [suggested].

### Patient-safety rationale (key)
- Causative agent mandatory: an entry without it is not saved.
- Do not allow editing the causative agent (reactions would be out of context).
- Show existing entries during entry to avoid near-duplicates and to choose class-level agent.
- Duplicate causative agent warning (SCG).
- No overall severity rating (over four-fifths of fatal drug anaphylaxis had no prior indication).
- Removal explains notes are retained and warnings stop; removed entries remain viewable.
- Source never pre-filled; witnessed reaction captured because it increases confidence.
- Avoid "risk"/"propensity" wording (misunderstood); "(class)" suffix avoids penicillin class vs specific ambiguity.

---

## Decision Support (decsupport.txt) and Decision Support Summary (decsupportsumm.txt)

### Purpose
Initial guidance (confidence "Low", Initial Guidance; further testing and PSA expected) for: communicating decision support capability; choice lists with preference ratings; unprompted notifications (system-generated alerts) within a single patient record. The summary deck restates the same rules; differences noted below.

### Key principles (1.3)
- Two communication types: informing and recommending; acts recorded in the EPR.
- Alerts combine criticality and urgency into one priority axis; choices combine axes into one preference scale.
- Defined number of priority levels; easily understood.
- Recommendations shown when available; explanations available for every alert or preference; where an explanation refers to a record item, it must be viewable in original context.
- Consistent structure; standard NHS CFH catalogue of services; full local functionality given at login; standard care process must not be interrupted (summary deck).
- Alert levels: exactly two, "Priority" and "High Priority".

### Normative guidance (no IDs; section numbers)

2.1.1 Capability overview indicator
- Short title, e.g. "Decision Support" (an icon may be used, unexplored).
- Arrow or chevron next to the title, INSIDE the same box (not outside) to show details on click.
- Full functionality: title on neutral colour (e.g. grey).
- Not full functionality: title on attention colour (e.g. orange); may flash; plus an icon showing change since last viewed. Three states: running fully; not fully running; not fully running and changed since last viewed.
- On each change in availability of a service: pop-up near the title with date and time of the change (per Date Display and Time Display) and text, e.g. "Dose Calculations and Formulary Management are not running"; fades out after approx 5-10 seconds; must not obstruct the application.
- Pop-up definition: small window that fades in and out over time.

2.1.2 Capability detail list (opened by chevron)
- List services from standard NHS CFH catalogue (e.g. "Licensed use of Drug Checking", "Drug to Disease Contraindications Checking"), alphabetical order.
- States visually obvious when scanning:
  - Available and running: black, bold font + icon e.g. green tick.
  - Available but not running: black, bold font + icon e.g. red cross.
  - Not available: light grey, regular font.
- Do NOT use checked/unchecked checkboxes to show state.
- Tooltip on each service with status, date and time, e.g. "This service has been unavailable since 12-Jan-2007; 10:42" (date dd-Mmm-yyyy, 24-hour time, separated by "; ").
- Clicking a service opens Help, auto-scrolled to that service.
- Vertical scroll bar if list exceeds space.
- Link to configure service states (behaviour out of scope).
- Recognised Help link (e.g. help icon); Help lists services alphabetically with brief description; reachable from Help link or by clicking a service; integrate with generic Help where possible.

2.2 Information window anatomy (shared by choice lists and alerts)
- Areas: Header (top), Summary area, Details area, Resizing control.
- Tabs: "Summary" selected by default, left of "Details".
- Summary contents in order: Icon (left of summary text); Information Summary (brief, e.g. "There are potential additive hypotensive effects with Lisinopril and Furosemide, a current medication for this patient"); Information Source in brackets below the summary, identifying a catalogue service; textual link "Details…" below the source showing same content as Details tab; Actions; buttons.
- Actions: "Actions" label with chevron, collapsed by default; chevron expands; list of recommended actions in order of preference, most preferred first; preference icon (rectangle bars) on the left of each action with tooltip (e.g. "High Preference Option"); select an action via option (radio) button; actions may have sub-options via checkboxes or option buttons (e.g. "Option 3" with "Sub Option 1/2/3"); must support "and"/"or" combinations. If no actions recommended, hide label and chevron entirely.
- "Record Response" button: always enabled; takes user to the relevant area of the application to record a response; placed before/left of Dismiss.
- "Dismiss" button: always enabled; dismisses window; after/right of Record Response.
- Details area (tab or "Details…" link): summary of the information; patient-specific information; rationale; references; hyperlinks back to relevant parts of the patient record (per business rules).
- Resizing control at bottom right or bottom left corner; drag to resize.
- Minimum dimensions of alert container and information window fixed.

2.3 Choice lists with preferences
- Preference icon placed LEFT of the option in the choice list (never right).
- Unique icons per preference rating; summary deck: 5 level indicators for preference (requirement).
- Hover on preference icon: tooltip summary identifying reason, brief (e.g. "Potential drug-drug interaction with Furosemide"); multiple reasons: list all summaries as bullet points (not unbulleted).
- Click preference icon: information window as overlay aligned to top right of the choice list. Click outside closes; Dismiss closes; Record Response navigates.
- Header labelled "Explanation".
- Words derived from patient items hyperlinked to the item in original context (e.g. "Furosemide" opens current medications list alongside).
- Multiple summaries for one option: all in the SAME window (never split into separate windows); actions consolidated as one list; explanations consolidated in the explanation/details area.
- User must be able to override any information; access details without losing context.

2.4 Unprompted notifications (system-generated alerts)
- Indicator (icon) for alerts in the application; five states: no active alerts; >=1 Priority not viewed; >=1 Priority all viewed; >=1 High Priority (+ any Priority) not viewed; >=1 High Priority (+ any Priority) viewed.
- New alert: pop-up near the indicator with status, date and time in header (Date/Time Display), alert icon and description (e.g. "The potassium level is 7.7 mmol"); fades out approx 5-10 s; clicking pop-up opens alert container.
- Clicking indicator opens alert container listing all active alerts for this patient.
- Grouped by status: High Priority group above Priority group; within group reverse chronological (newest first). Do not mix statuses.
- High Priority expanded by default (details visible); Priority collapsed (header only). Never show High Priority collapsed by default. Click header toggles each alert.
- Alert header: status (e.g. "High Priority"), date and time.
- Record items in summary hyperlinked (e.g. "Potassium level" opens potassium with other U&E results).
- No resizing control on an individual alert; resizing control on the container; resizing container resizes all alerts.
- Vertical scroll bar when alerts exceed container space, including when expanded.
- Alert must contain: status, date/time occurred, icon, summary, details, actions (if any); details: summary, patient-specific info, rationale and references; preference indicators (5 levels) when recommending.
- Alerts demand attention without modal behaviour.
- Future work: "look-ahead scroll bar" for alerts container showing count behind scroll.

### Accessibility points
- Tooltips used heavily (service status, preference reason): provide keyboard focus equivalents [suggested].
- Colour states in capability list are also reinforced by weight and icons (bold/regular, tick/cross).
- Flashing title is optional ("could"); [suggested] respect prefers-reduced-motion and keep flash under 3 Hz.
- Fading pop-ups (5-10 s): [suggested] aria-live polite, pause on hover/focus, information remains reachable via container.

### Patient-safety rationale
- Non-modal alerts minimise interruption of care.
- High Priority expanded by default and grouped on top so it cannot be missed.
- Explanations and links to original record context support verification of recommendations.

---

## Proposed controls

Types shared:
```ts
type IsoDateTime = string; // ISO 8601
type Conformance = 'mandatory' | 'recommended';
type EventState = 'future' | 'next' | 'due' | 'overdue' | 'begun' | 'unscheduled' | 'recorded';
type AdminStatus = 'given' | 'givenLate' | 'givenEarly' | 'givenOnceOnly' | 'selfAdministered'
  | 'patientRefused' | 'patientAbsent' | 'otherClinicalReason' | 'drugUnavailable'
  | 'nilByMouth' | 'drugFreeInterval' | 'deferred' | 'unknown';
type MedKind = 'regular' | 'onceOnly' | 'asRequiredUnscheduled' | 'asRequiredIndicative'
  | 'asRequiredScheduled' | 'significantDuration';
type DoseVariation = 'none' | 'conditional' | 'range' | 'constantPattern' | 'varyingPattern';
interface Tolerance { dueFromMinutes: number; overdueAfterMinutes: number } // local governance
interface AdminEvent {
  id: string; scheduledTime?: IsoDateTime; status?: AdminStatus; statusHistory?: {status: AdminStatus; at: IsoDateTime; by: string}[];
  recordedAdministrationTime?: IsoDateTime; timeIsApprox?: boolean; timeExact?: boolean;
  dose?: string; intendedDose?: string; notes?: string; precondition?: string;
  requiresWitness?: boolean; requiredRole?: string; recordedBy?: string; timeCritical?: boolean; testResultAvailable?: boolean;
}
interface Medication {
  id: string; kind: MedKind; medicationLine: React.ReactNode /* per Medication Line guidance */;
  route?: 'oral' | string; prescriber: string; startDate: IsoDateTime; startIsActual: boolean;
  endDate?: IsoDateTime; reviewDate?: IsoDateTime; pastState?: 'completed' | 'discontinued';
  scheduledTimes: string[] /* 'HH:mm' */; events: AdminEvent[]; tolerance: Tolerance; priority?: number;
  asRequired?: { criteria: string; minIntervalMinutes?: number; maxPerDay?: number; lockoutEndsAt?: IsoDateTime };
  doseVariation?: DoseVariation; doseCriteria?: string; doseRange?: string;
  verification?: 'verified' | 'awaiting' | 'notUsed'; verifier?: { name: string; at: IsoDateTime };
  infusion?: { scheduledStart: IsoDateTime; expectedDurationMinutes: number; actualStart?: IsoDateTime; stop?: IsoDateTime; interruptions?: {start: IsoDateTime; end?: IsoDateTime}[]; status?: 'startAt'|'dueAt'|'begun'|'completed'|'discontinued' };
}
```

### Drug administration

1. `DrugAdministrationView` (container)
- Props: `medications: Medication[]`; `now: Date` (default live clock, ticks each minute [suggested]); `selectedDate?: Date` (default today, MEDa-0065); `onSelectedDateChange`; `grouping?: 'none'|'type'|'startDateStatic'` (default 'none', MEDa-0012); `nilByMouth?: boolean`; `onRecord(eventId, payload)`; `onRefreshOrder?`; `pendingUpdates?: MedicationUpdate[]` (triggers freeze message); `pharmacistVerificationEnabled: boolean`.
- Behaviour: computes visible window [sel-2, sel-1, sel, sel+1] (MEDa-0064); filters via `isMedicationVisible` (0262, 0263); sorts via `sortByDueness` only on mount, manual refresh, or medication add/update (0032, 0038); renders Toolbar (StatusBar, GroupingControl), DayNavigator headers, NilByMouthBanner, rows with LASB. No filter controls (0248). Rows bordered with white-space gap (0002, 0003). Row click selects (0246).
- Implements MEDa-0001-0003, 0007, 0012, 0023-0032, 0038, 0064-0065, 0246-0248, 0262-0263, 0294-0297.

2. `DrugAdminStatusBar`
- Props: `counts: {overdue; due; asRequiredTotal; asRequiredGivable; begun}`; `orderStale: boolean`; `onUpdateOrder()`.
- Left: dynamic counts with labels "Overdue", "Due", "As Required" (shows givable and total, e.g. "As Required 1 of 2 available" [wording suggested]), "Begun". Overdue/Due styled same tokens as chart and LASB (0017, 0018). Right: button "Update list order", disabled unless `orderStale` (0020, 0021). Live region polite [suggested].
- MEDa-0015-0018, 0020, 0021, 0257.

3. `GroupingControl`
- Props: `value: 'none'|'type'|'startDateStatic'`; `onChange`. Options: none (default), group by Once Only / Regular / As Required / Significant Duration (0219), "Start Date and Time List Order" static sort (0218), remove grouping (0261). Group headings collapsible, styled like Medications List (0249); within-group order follows dueness (0013).

4. `DayNavigator` / `DayColumnHeader`
- Props: `selectedDate`, `today`, `onChange(date)`. Prev-day arrow left of columns, next-day arrow right (0033); calendar in selected column heading with "Today" shortcut (0034, 0035). Header text dd-Mmm-yyyy; today's header prefixed "Today: " plus icon and distinct background, even when not selected (0079, 0080). Selected column always 3rd and widest, bordered across all rows (0082-0084, 0097).

5. `DrugAdminLookAheadScrollBar`
- Props: `items: {medId; name; state: 'overdue'|'due'|'other'; isPast: boolean}[]`; `visibleRange`; `onJump(medId)`. Top/bottom notification areas list out-of-view drug names, Overdue/Due formatted with shared tokens; past drugs never named (0039-0041). Click name scrolls into view.

6. `MedicationLeftPanel`
- Props: `medication`, `onOpenInfo(tab)`, `showVerification`. Content top to bottom: medication line text (0265, 0042); prescriber icon + name (0043); "Start:" label + date/time (0044); "End:"/"Review:" label + date (0045) or reverse-video "Completed"/"Discontinued" for past (0222, 0223); type label "As Required"/"Once Only" and distinct row style (0224, 0225, 0241). Status icon group in fixed position, verification icon leftmost (green, tick when verified, hidden when not used) (0050, 0051, 0227, 0229, 0266-0268, 0298). Flexible height (0046).

7. `InformationPanel`
- Props: `tabs: {id; label; icon; content}[]` (ordered as LHP icons then Prescriber, 0062), `activeTab`, `onOpenAllDetails?`. Expands downward from LHP (0063); tabs labelled with text and icon (0060); "All details" control (0061).

8. `MedicationTimeScale`
- Props: `scheduledTimes: string[]` ('HH:mm'), `kind`, `heightPx`, `now?: Date` (only if today visible), `pastShading`. Ruler marks; labels only the scheduled times (none for unscheduled As Required) (0235, 0236, 0276); top and bottom labelled "00:00" (0237); position = `timeToY` (0231); current-time line moves (0071, 0255); past shaded (0073).

9. `ChartDayCell`
- Props: `medication`, `date`, `isSelected`, `isToday`, `now`, `heightPx`, `onEventActivate(event)`. Plots events via `timeToY`, centre-aligned (0232), single column (0087), no overlaps or clipping, extend height if needed (0274, 0275). Past/future shading (0277); now line in today (0081) not obscuring text (0259). Selected day shows notes, times ("Approx HH:mm" or exact "HH:mm", none if on time with no precise time, 0104-0106), dose criteria/ranges/doses (0288-0293), precondition text (0174), role/name (0183), As Required criteria and lockout end (0134-0137); truncation with "…" (0101). Off-window markers with tooltip and jump (0036, 0037). Unscheduled As Required shows a moving "now" event (0271).

10. `AdministrationEventIcon`
- Props: `state: EventState`, `status?: AdminStatus`, `kind` (onceOnly -> round shape, others square, 0132), `edited?: boolean` (adds edited badge, 0096), `supplementary?: ('firstDose'|'multipleEntries'|'review'|'lockout'|'precondition'|'timeCritical'|'roleRequired'|'witnessRequired'|'selfAdministered'|'testResult')[]` rendered to the right (0278, 0116, 0173, 0179, 0182, 0184, 0186, 0258), `dueTimeLabel?: string`.
- Variants: future (dotted border, 0118); next/due/overdue active (looks clickable, labels "Next HH:mm", "Due HH:mm", "Overdue HH:mm"; Overdue white on red, reverse video for Due/Overdue labels, 0086, 0090, 0091, 0250); recorded (filled = success, unfilled solid border = not given, 0117). Min 16x16 px hit target (0121); symmetric outline (0269); colour plus shape/label (0120). Keyboard focusable; Enter/Space activates.

11. `AdministrationEventPopover`
- Props: `event`, `actions: {label; onClick}[]` (e.g. "Change", "Add a note"), `trigger: 'hover'|'click'|'keyboard'`, `hoverDelayMs = 500` [value suggested]. Details above actions (0111); anchored next to icon (0113); closes on outside click or Esc (0112); hover open/close delay (0109). MEDa-0108.

12. `AdministrationRecordingForm`
- Props: `medication`, `event`, `now`, `statuses: AdminStatus[]` (min ePrescribing set + 'unknown', 0119, 0283), `defaultStatus` (by event state, 0204), `fieldsForStatus(status)` (0195, 0197), `nilByMouth`, `otherOutstandingEvents: AdminEvent[]`, `onSubmit`, `onCancel`, `onClear`.
- Layout: mandatory section first, then named optional group with "More options" control and notes textarea (0196, 0199-0201, 0203). Tab/option "Clear the event details" (0260). Buttons "Record Administration" (default Enter, 0205) and "Cancel" (0206). Prefill time = now; never prefill dose for range drugs (0207). Validation: administration time <= now (0239); witness credentials required when `requiresWitness` (0185); partial/incremental dose and site selection fields (0210-0212). Positioned adjacent to event, never covering LHP or event, fully on-screen, with backdrop dimming everything except the drug's LHP and selected-day cell (0191-0194, 0245). If `otherOutstandingEvents.length > 0` show message first (0284). If NBM and oral, show `NilByMouthPrompt` first (0165-0167). Two-step minimum (no one-click recording).

13. `NilByMouthBanner` and `NilByMouthPrompt`
- Banner: full width below column headings above rows (0163); not rendered when false. Prompt: text "This patient is currently Nil by Mouth" with "Skip this administration" (opens form with not-given NBM status) and "Record an administration" (opens default form) (labels illustrative). Never disables recording (0164).

14. `SignificantDurationBar` and `SignificantDurationStatusBox`
- Bar props: `scheduledStart`, `expectedDurationMinutes`, `actualStart?`, `stop?`, `interruptions?`. Dashed border until started, solid after (0286, 0287); stop time labelled as estimate e.g. "Est. stop 14:30" until recorded (0146) [label wording suggested]; interruptions marked (0147); static, no elapsed-time fill (0145).
- Status box props: `status`, `time?`, `onOpenDetail?`. Text "Start at HH:mm" / "Due at HH:mm" / "Begun" / "Completed" / "Discontinued" (0150), status icon (0151), detail access (0149); in selected day (0148). Recording only in detailed view (0160).

15. `MedicationUpdateNotice`
- Props: `updates: {type:'new'|'edited'|'discontinued'; medicationName; details}[]`, `onAcknowledge`. Modal freeze over the view describing changes and effects (re-sort); text advising to record according to prior values if already administered (0294-0297).

### ADR recording

16. `AdrSummaryList`
- Props: `entries: AdrEntry[]`; `status: 'unknown'|'noKnown'|'hasEntries'`; `noKnownRecord?: {date; author; source?; details?}`; `highlight?: Record<id,'New'|'Updated'>` (session only, 0630-0670); `showDeactivated: boolean`; `onAdd`, `onOpenDetails(id)`, `onNoKnown`, `onClose`.
- Title "Adverse drug reaction summary" top left; buttons top right adjacent: "Add new drug reaction" (always visible, 0010.x), "No known adverse drug reaction risks" (when status unknown/noKnown; disabled after click, 0820), "Close" (becomes "Finish" after NKADR click, 0810). NKADR panel shows phrase, date of entry, author name, source drop-down, details field (0770-0800). Mode toggle "display deactivated summaries" (0710).

17. `AdrEntryDialog`
- Props: `existingEntries: AdrEntry[]`; `initial?: Partial<AdrEntryDraft>`; `mode: 'add'|'edit'|'confirm'`; `sources: string[]` (authority list); `searchTerms(text, subset): Promise<Concept[]>`; `subsets: {id; label}[]` (default drug allergens excl. brand names); `onFinish(draft)`; `onCancel`.
- Layout: title phrased as action, top left (0020); purpose prompt (0060); banner preview mimicking a selected list line, live-populating agent (bold) and reaction types (0040.1-.7); fields vertical in order Causative agent, Type(s) of reactions experienced, Source ("Enter source of most recent information", no default), "Clinician witnessed reaction" checkbox (auto-ticked by matching source), Other details/ justification; existing entries list labelled and stacked to the right (0070.x). Buttons together top right: "Cancel", "Finish" (and in confirm mode "Yes, record the risk"/"Cancel"; in edit mode "Back"->"Cancel" once dirty, "Finish" disabled until dirty, 0850-0880).
- Behaviour: autofocus agent (0120); other fields disabled until agent encoded or accepted as free text (0090, 0100); Tab from empty agent goes to Cancel (0130); clearing agent after other input shows warning "Without a causative agent this entry will not be saved or shown in the list" [wording suggested] (0110); duplicate agent warning + instruction to remove existing first (0080, 0610, 0620); agent read-only in edit mode (0830).

18. `TerminologySearchField` (causative agent)
- Props: `subsetLabel` (e.g. "Current filter: Drug allergens"), `minChars = 3`, `progressive?: boolean`, `onSearch`, `onSelect(concept)`, `onAcceptFreeText(text)`, `showDefinitionFlyout = true`.
- Behaviour: search after 3 chars or search icon/Enter; prefix/partial matching; results show "(class)" for class concepts; definition fly-out on highlight; selected encoded term displayed bold (0170); no match: warning "not recognised" with option to record as free text, styled as uncoded (0191, A.5). Keyboard: Up/Down through results, Enter selects, Esc closes [suggested].

19. `ReactionTypesInput`
- Props: `items: {concept?: Concept; text?: string; elaboration: string; negated?: boolean; severity?: Concept}[]`; `onChange`; search props as above.
- Behaviour: single search box; selection appends a new line in the right-hand list and clears search; elaboration text kept on same line/unit (0340-0360); clicking an encoded keyword reveals delete button (0320, 0330); warns on dangerous words (negation, reduction, family history, other patients) (0260); negation and severity qualifiers (0290, 0300); prompt text when empty (0310). Section label "Type(s) of reactions experienced" (0280.1).

20. `JustificationField`
- Props: `value`, `onChange`, `reactionLexicon`, `alreadyEntered: string[]`, `placeholder`. Auto-growing/scrolling unlimited text (0380.1); highlights reaction words not already entered with coloured highlight plus message to add them to "Type(s) of reactions experienced" (0410.x); placeholder prompt when empty (0420).

21. `AdrDetailsView`
- Props: `entry`, `history`, `onEdit`, `onRemove`, `onBack`. Buttons "Edit" (0830.3) and "Remove from list" with hover text explaining a reason can be added and notes are kept (0680, 0700); edit history access (0890).

22. `RemoveAdrConfirmDialog`
- Props: `drugName`, `onConfirm(reason?)`, `onCancel`. Message content: which drug and that it will be removed from the adverse drug reaction summary; related clinical notes remain on record; clinicians will no longer be warned by the system not to administer this drug. Reason textarea (encouraged, 0720). Two buttons worded consistently with the question, e.g. "Remove from list" / "Cancel" [wording suggested] (0750.x). After confirm return to list (0730, 0740).

### Decision support

23. `DecisionSupportStatusIndicator`
- Props: `title = 'Decision Support'`, `state: 'full'|'degraded'`, `changedSinceViewed: boolean`, `flash?: boolean` (default false [suggested]), `expanded`, `onToggle`. Neutral grey background when full, orange when degraded; change icon; chevron inside the title box.

24. `DecisionSupportChangeToast` (also used for new alerts)
- Props: `dateTime: Date`, `message: string`, `icon?`, `status?: 'High Priority'|'Priority'`, `anchorRef`, `durationMs = 7000` (within 5000-10000), `onClick?`. Appears near anchor, fades out, non-modal; header shows date "dd-Mmm-yyyy" and 24-hour time.

25. `DecisionSupportServiceList`
- Props: `services: {id; name; state: 'running'|'notRunning'|'unavailable'; since: Date; helpText: string}[]`, `onOpenHelp(serviceId?)`, `onConfigure?`. Sorted alphabetically; running = black bold + green tick, notRunning = black bold + red cross, unavailable = light grey regular; tooltip "This service has been unavailable since 12-Jan-2007; 10:42" (pattern `This service has been ${stateText} since ${dd-Mmm-yyyy}; ${HH:mm}`); click opens Help scrolled to service; scrolls vertically; help icon link; configure link. No checkboxes.

26. `InformationWindow`
- Props: `variant: 'explanation'|'alert'`, `header: React.ReactNode` (explanation: "Explanation"; alert: status + date/time), `icon`, `summaries: {text: RichText /* with record links */; source: string}[]`, `details: {summary; patientSpecific; rationale; references; recordLinks}`, `actions?: ActionNode[]` (ordered by preference; each with `preference: 1..5`, `preferenceTooltip`, `subOptions?`, `combinator?: 'and'|'or'`), `onRecordResponse`, `onDismiss`, `resizable = true` (false for alert inside container), `minSize`.
- Tabs "Summary" (default) and "Details"; "Details…" link; source in brackets "(Drug Interaction Checking)"; Actions collapsed with chevron, hidden entirely when none; radio per action, checkbox/radio sub-options; buttons "Record Response" then "Dismiss", always enabled; resize grip bottom-right or bottom-left.

27. `PreferenceIcon` and `PreferenceChoiceList`
- PreferenceIcon props: `level: 1|2|3|4|5` (5 distinct icons, bar style), `reasons: string[]`, `onClick`. Tooltip shows single reason or bulleted list. Placed left of option.
- PreferenceChoiceList props: `options: {id; label; preference?: {level; reasons; window: InformationWindowProps}}[]`, `value`, `onChange`. Clicking icon opens InformationWindow overlay aligned to top right of the list; outside click closes.

28. `AlertIndicator`
- Props: `state: 'none'|'priorityUnviewed'|'priorityViewed'|'highUnviewed'|'highViewed'`, `onClick`. Five distinct icons with text alternative.

29. `AlertContainer` / `AlertItem`
- Container props: `alerts: Alert[]` ({id; status:'High Priority'|'Priority'; occurredAt: Date; icon; summary; details; actions}), `resizable = true`, `minSize`. Groups High Priority above Priority, each newest first; scrolls vertically; resizing resizes all items.
- AlertItem: header (status, date, time) toggles expanded; default expanded = status === 'High Priority'; no own resize grip; summary record terms hyperlinked.

### Utility functions

- `visibleWindow(selected: Date): Date[]` -> [selected-2d, selected-1d, selected, selected+1d] (MEDa-0064).
- `isMedicationVisible(med, windowStart, windowEnd, now)`: true if med current at any instant in [windowStart, windowEnd) i.e. `start < windowEnd && (end ?? Infinity) > windowStart`, OR current as of now (MEDa-0262, 0263).
- `eventState(event, med, now)`: if status recorded -> 'recorded'; if med.kind is unscheduled As Required -> 'unscheduled'; let t = scheduledTime; if now >= t + overdueAfter -> 'overdue'; else if now >= t - dueFrom -> 'due'; else 'future'; then `markNext` sets 'next' on the earliest future event of a drug with no due/overdue event (MEDa-0252). Overdue never auto-transitions (0281); any automatic status must be 'unknown' and never labelled "Missed"/"Not Recorded" (0282).
- `isLockedOut(med, now)`: As Required with lastGiven + minInterval > now or count in rolling 24 h >= maxPerDay; returns lockout end time (0136, 0137). Advisory only.
- `sortByDueness(meds, now)` (snapshot, MEDa-0023-0031, 0280): compute per drug a tuple key:
  1. tier: 0 = has overdue (key time = oldest unrecorded past event, 0280); 1 = has due; 2 = Significant Duration due to start [per fig 21]; 3 = Begun; 4 = available unscheduled As Required; 5 = has future/next event (key = next time) and locked-out As Required (key = lockout end, compared with next times so it sorts below drugs scheduled before lockout ends, 0027); 6 = current with no events; 7 = past (key = -lastEventTime, most recent first).
  2. key time ascending; 3. priority (stricter tolerance first, 0025); 4. Regular before As Required at equal time (0026); 5. secondary attribute e.g. name [unspecified by guidance].
  [Tier merge of 4/5 is an interpretation; guidance only fixes pairwise rules.]
- `statusCounts(meds, now)` -> {overdue, due, asRequiredTotal, asRequiredGivable, begun} (0016, 0257).
- `isOrderStale(currentOrder, recomputedOrder)` -> boolean (0021).
- `timeToY(time: Date, dayStart: Date, heightPx)`: y = ((time - dayStart)/86400000) * heightPx; 00:00 at top, 24:00 at bottom (0231, 0237).
- `minRowHeight(roundTimes, iconPx, padding)`: height accommodating six events with four at standard rounds (0234); grow to avoid overlaps (0275).
- `formatAdminTimeLabel(event, withinTolerance)`: '' if within tolerance and no precise time (0104); `Approx HH:mm` if approximate (0105); `HH:mm` if exact (0106).
- `formatStateLabel(state, dueTime)` -> "Overdue HH:mm" / "Due HH:mm" / "Next HH:mm" (0250) [string pattern suggested].
- `estimatedStop(start, durationMin, interruptions)` = start + duration + sum(interruption lengths) (0285).
- `validateAdministrationTime(t, now)`: error if t > now (0239).
- `outstandingEvents(med, now, excludeId)`: past events with no status (0284).
- `buildAdrExpression(agent: Concept)`: if agent in drug subset -> `419511003 : 246075003 = <agentId>`; else `418471000 : 246075003 = <agentId>` (RAD-0190).
- `findDuplicateAgent(entries, agentCode)`: exact causative agent code match among active entries (RAD-0610).
- `detectDangerousWords(text)`: flags negation (e.g. "no", "not", "denies", "without"), reduction ("mild", "slight"), family history ("mother", "father", "family"), other patients; [word lists suggested; categories from RAD-0260].
- `findUnenteredReactionWords(text, lexicon, entered)` -> ranges to highlight (RAD-0410.x).
- `sortAlerts(alerts)`: High Priority first, then Priority; within each by occurredAt descending.
- `alertIndicatorState(alerts, viewedIds)`: none if empty; if any High Priority: highUnviewed if any alert unviewed else highViewed; else priorityUnviewed/priorityViewed likewise.
- `sortServicesAlphabetically(services)` (locale compare, case-insensitive).
- `formatServiceTooltip(state, since)` -> "This service has been unavailable since dd-Mmm-yyyy; HH:mm".
- Date/time formatting delegates to the group's Date Display / Time Display utilities: dates "dd-Mmm-yyyy" (e.g. 27-May-2007), times 24-hour "HH:mm".
