# Medications search and prescribe

## Medications Management: Search and Prescribe, User Interface Design Guidance, v4.0.0.0 Baseline (searchpres.txt)

Source: NHS CFH / HSCIC, CUI Clinical Applications and Patient Safety project, 225 pages, guideline IDs MSP-0010 to MSP-2310. Read in conjunction with: Medication Line v2.0.0.0 {R3}, Medications List v1.0.0.0 {R1}, Drug Administration v4.0.0.0 {R2}, Time Display, Date Display, Date and Time Input, Patient Banner, Accessibility Checkpoints.

### Purpose
UI guidance for searching for and prescribing a single medication for a single inpatient (secondary care, hospital ward; dose-based prescribing: generic name + dose + route + frequency). Covers the flow: Quick List or drug search, cascading lists (route/form), template prescriptions or step-by-step required fields, full (detailed) prescription form, preview, authorise.

### Global conventions and scope notes
- Conformance: **Mandatory** = "An implementation should follow the guideline"; **Recommended** = "advised to follow". Each point also has an Evidence Rating (Low/Medium/High). Below: [M] = Mandatory, [R] = Recommended, with evidence (L/M/H).
- Sections 4.3.2, 5.3.8, 6.3.1, 7.3.6, 7.3.7 are marked "alternative solutions may exist": conformance applies only where that approach is adopted; alternatives must address the listed hazards.
- Visuals are illustrative only: "Stylistic choices, such as colours, fonts or icons are not part of the guidance and unless otherwise specified are not mandatory". Field sets shown as required/optional in examples are illustrative only.
- Guidance deliberately specifies no screen dimensions (adaptable to any display size).
- Out of scope (do not infer rules for): validation and error handling, truncation and abbreviation, permissions, decision support/allergy alerting, dose calculation, formulary management, cancel/close/exit flows, editing after authorisation, partial saving, "shopping cart" multi-prescription preview, paediatrics, controlled drugs, infusions (except examples), TTO, PGD, etc.
- Assumptions: A1 most prescriptions come from a short personal list; A2 about 80% can be prescribed from a template prescription; A3 prescriber knows what they want before starting; A4 CUI Patient Banner remains visible throughout; A5 generic prescribing preferred.
- Terminology: generic drug name = dm+d VTM; brand name = dm+d TFN. Drug names and medication display follow Medication Line {R3} (brand names in CAPITALS, generic first). Dates/times follow Date Display / Time Display / Date and Time Input. Example formats used throughout: dates "02-Apr-2010", "23-Jun-2008" (dd-Mmm-yyyy); times "08:00", "20:00" (24-hour HH:mm); relative "Today 20:00"; administration time lists separated by "; " e.g. "08:00; 20:00".
- "Authorise" definition: equivalent to signing a prescription.

### 3. Prescribing area (MSP-0010 to MSP-0050)
- MSP-0010 [M, M] Prescribing area must not occlude the Patient Banner (including full-screen prescribing that covers it).
- MSP-0020 [R, H] Allow the patient's current medications to be accessed whilst prescribing, preferably displayed simultaneously (e.g. prescribing area above or alongside Medications List).
- MSP-0030 [R, M] Support switching to, or simultaneous display of, other views without losing prescription data entered so far.
- MSP-0040 [R, H] If navigation away from an incomplete prescription is possible, keep a clear on-screen indication that there is an incomplete prescription.
- MSP-0050 [R, L] Prescribing area must not be positioned between a view's toolbar (e.g. Medications List toolbar with current/past control) and the view it controls.
- Study note (App B): status of a prescription "building up" must be clearly "not yet prescribed"; avoid the ambiguous status label "Started".

### 4. Quick Lists (MSP-0060 to MSP-0270)
4.3.1 Displaying
- MSP-0060 [M, M] Support a Quick List of preselected (centrally managed, not auto-generated) drug names.
- MSP-0070 [R, M] Minimise how often contents change. Incorrect example: "Last 10 drugs prescribed" (changes every time).
- MSP-0080 [M, M] When one or more Quick Lists exist, display one by default when prescribing starts (a Quick List selector with value "None" / no default is incorrect).
- MSP-0090 [M, M] Include a description of the list contents at the top or bottom of the list. Example label: "10 commonly prescribed medications".
- MSP-0100 [R, L] Display the Quick List below (or as a drop-down extension of) the search text input box; it occupies the same space search results will replace.
- MSP-0110 [M, M] No navigation within a Quick List (no expand/collapse, no drill-down).
- MSP-0120 [M, M] Limit item count so the whole list displays without a scroll bar. (Example uses 10 items with Ctrl + 1 ... Ctrl + 9, Ctrl + 0.)
4.3.2 Contents (alternative-solution section)
- MSP-0130 [M, M] Only items that could appear in a search results list (drug names, e.g. "oxycodone – OXYCONTIN"); NOT template prescriptions or dose/form attributes (e.g. "paracetamol – DOSE 500 mg", "morphine – modified-release" are incorrect).
- MSP-0140 [M, M] Each entry has a shortcut key.
- MSP-0150 [M, M] Shortcut displayed to the right of each entry. Format in examples: "Ctrl + 1" (shown in grey italics, right-aligned).
- MSP-0160 [R, M] Alternate row shading, same as search results.
4.3.3 Change notification
- MSP-0170 [M, H] Show a notification when the Quick List contents have changed since last presented to this user.
- MSP-0180 [M, M] Provide a control to close the notification (example: "Close" link, or "OK" button).
- MSP-0190 [M, M] Provide a control to disable it until the list next changes. Example check box text: "Don't show this message again".
- MSP-0200 [M, M] Show it every time the Quick List is displayed until the user disables it.
- MSP-0210 [R, L] Notification must not obscure the Quick List contents (place beside it).
- MSP-0220 [R, L] Auto-close the notification when a drug is selected from the Quick List or text is typed in the search box.
- MSP-0230 [M, M] While the notification is open, Quick List shortcut keys must NOT select items (arrow-key navigation and mouse selection still allowed).
- Example message text: "The contents of the Quick List were updated on 23-Jun-2008." or "The contents of the Quick List have changed."
4.3.4 Multiple Quick Lists
- MSP-0240 [R, M] Keep number of Quick Lists per user to the contextual minimum.
- MSP-0250 [M, L] If several, provide a means to switch (example: combo box).
- MSP-0260 [M, M] Show the currently selected list in the selector control (must have a default value).
- MSP-0270 [R, M] Use the words "Quick List" in the selector's label or within the control (example: label "Quick List", value "General Medicine").
- Study note: selected Quick List may remain the default for the session.

### 5. Drug search (MSP-0280 to MSP-0840)
5.3.1 Search box position
- MSP-0280 [M, H] Results list must not be separated from the search box by other controls or significant space (directly below, or drop-down extension).
- MSP-0290 [M, H] Clearly describe the scope of the search ("Type here to search" is incorrect).
- MSP-0300 [R, H] Use an in-field prompt describing scope. Wording in examples: "Type a drug name to search" (study used "Type the drug name to search"). Study 69: prompt should remain visible even when the field has focus (if technology allows), since the field gets focus automatically.
5.3.2 Text input behaviour
- MSP-0310 [M, M] Do NOT accept coded/shorthand entry in the drug search box (e.g. "pcm apn"). Spelling matching still allowed; codes may use a separate box (example label "Shorthand", e.g. "eyc 500").
- MSP-0320 [M, M] No auto-complete in the search box; show only typed text.
- MSP-0330 [M, H] Keep focus in the search text box until the user makes a selection in the results list (never auto-move focus to the first result).
- MSP-0340 [M, H] When the user moves focus into the results list (e.g. TAB), focus goes to the first entry by default.
- MSP-0350 [R, L] When space is limited, after selection collapse results and replace the search box with a control showing the selected drug name.
- MSP-0360 [R, L] Selecting that control re-displays the search box with the original search criteria and the results list with the previously selected drug highlighted.
5.3.3 Progressive matching
- MSP-0370 [R, M] Use progressive (as-you-type) matching where possible; list shortens as letters are typed.
- MSP-0380 [R, H] Otherwise static search submitted by ENTER and/or a button (example label "Search").
- Note: progressive search may also accept ENTER; results appear automatically "with a slight delay" (short debounce to avoid one-character fetches).
5.3.4 Feedback
- MSP-0390 [M, H] Minimum 2 characters before showing results (rationale: dm+d 2008 analysis, about 16 matches for 2 chars, about 3 for 3 chars).
- MSP-0400 [M, M] With 1 character, show message explaining why there are no results and stating the 2-character minimum. Exact example: "Please type in at least 2 characters". ("No results" is incorrect.)
- MSP-0410 [M, M] With 2+ characters and no matches, show a message that a search was performed and found nothing. Exact example: "No matches were found" (also shown as "No matches were found.").
- MSP-0420 [R, L] While a message is shown, results area keeps a minimum height of 3 result rows and width at least the search box width.
- Also: provide feedback while a search is being processed but results not yet shown (rationale, no ID).
5.3.5 Height limit
- MSP-0430 [M, M] Results list only as tall as needed for the matches, up to a defined maximum height (no extra blank space).
- MSP-0440 [M, M] When matches exceed max height, show a message at the end of the list with displayed and total counts. Exact example: "Showing 10 of 40 matches." (other variants: "Showing 9 of 32 matches.", "Showing 10 of 14 matches").
- MSP-0450 [M, M] Put a control to show the full list at the end of the list. Example label: "Show all" / "Show All".
- MSP-0460 [M, L] List height grows (to the upper limit) as the number of matches grows. Pagination ("Previous Page 1 of 4 Next") is incorrect.
- Rationale: background of surrounding area should differ in tone from the list so height changes are noticed peripherally.
5.3.6 Extending
- MSP-0470 [M, M] After "Show all", extend in place by adding a scroll bar (no paging).
- MSP-0480 [M, M] Results are flat: no expand/collapse or tree browsing (e.g. no "morphine > FILNARINE" hierarchy; correct is single row "morphine – FILNARINE").
- MSP-0490 [M, M] In a scrolled list, allow the selection to be scrolled out of view (normal scroll behaviour; do not pin).
5.3.7 Matching
- MSP-0500 [M, H] Match input against both generic names and brand names.
- MSP-0510 [M, H] Match the beginning of any word only; never substrings or word endings ("can" must not match "topotecan", "decanoate", "lercanidipine").
- MSP-0520 [M, H] Space-separated terms each match the start of a (different) word: "sal flu" returns "fluticasone + salmeterol"; "para asp" returns "paracetamol + aspirin".
- Study 37: searches should tolerate missing hyphens in co-drug names (users failed to find co-drugs); also users wanted mid-name words (e.g. "yellow soft paraffin", "aspirin + paracetamol") found, which beginning-of-any-word matching provides.
5.3.8 Ordering (alternative-solution section)
- MSP-0530 [M, H] Matched order: rank by proximity of the match to the beginning of the drug name; generic-name matches ranked above brand-name matches. E.g. for "neomycin": "neomycin + prednisolone", "neomycin + triamcinolone", then "betamethasone + neomycin".
- MSP-0540 [M, H] Where relevancy ranking is not implemented, sort alphabetically within each set with the same matched position. Brand matches alphabetical within the brand set (sorted by brand name: "CANESTEN (CLOTRIMAZOLE)" style order shown: bifonazole – CANESTEN AF ONCE DAILY, clotrimazole – CANESTEN (CLOTRIMAZOLE), fluconazole + clotrimazole – CANESTEN DUO, clotrimazole + hydrocortisone – CANESTEN HC; note examples are inconsistent, so sort key ambiguous).
- Ordering applies separately within each section (prioritised / standard).
5.3.9 Groups
- MSP-0550 [R, M] For searches returning significantly more results (typically 3 or 4 characters, e.g. 'hom', 'sod', 'hyd', 'chl', 'met', 'flu', 'home', 'sodi', 'hydr', 'chlo', 'pota', 'calc'), support group rows that stand for a set of related, less commonly prescribed drugs. Example row: "paraffin (17) Show" (name, count in parentheses, button "Show").
- MSP-0560 [R, M] Activating the group control replaces the search box text with the group's full title (e.g. "paraffin") and replaces results with the group's members (list stays flat).
5.3.10 Spelling and synonyms
- MSP-0570 [R, M] Support spelling matches (e.g. "asprin" finds "aspirin"; "glicli" with "No matches were found." is not recommended).
- MSP-0580 [R, L] Support synonyms: drug shown when its synonym matches (e.g. "fru" matches furosemide via "frusemide"; "saline" for sodium chloride if safe).
- MSP-0590 [R, L] Show spelling matches and synonyms inline with other results (not behind a "Two possible spelling matches found / Show Spelling Matches" prompt).
5.3.11 Co-drugs
- MSP-0600 [M, H] Supplement co-drugs with their ingredients: "co-codamol  codeine + paracetamol", "co-amoxiclav  amoxicillin + clavulanic acid".
- MSP-0610 [M, H] Format ingredient text differently from the drug name; examples use grey italic text after the name.
5.3.12 Prioritising
- MSP-0620 [R, M] Prioritised results in a separate section above other results.
- MSP-0630 [R, M] Separate prioritised and standard sections with a horizontal line.
- MSP-0640 [R, M] Label the prioritised section with a brief indication of how prioritised. Example: "Commonly prescribed matches".
- MSP-0650 [R, M] Section labels sufficiently different from list items (examples: bold heading; lower-case plain labels that look like items are not recommended).
- MSP-0660 [R, M] Label the non-prioritised section "Standard Matches" (examples render "Standard matches").
- MSP-0670 [R, M] With no prioritised matches, omit the prioritised section, line and label (and the "Standard matches" label is then not needed).
5.3.13 Shortcuts in results
- MSP-0680 [R, M] Keyboard shortcuts only for prioritised matches.
- MSP-0690 [R, M] Shortcut on the same line, right-aligned; examples show grey italics, "Ctrl + 1" ... (one example after reselection shows "Shift + 1").
5.3.14 Commonly mis-selected (look-alike/sound-alike)
- MSP-0700 [M, H] Use formatting to draw attention to drug names associated with mis-selection.
- MSP-0710 [R, L] Highlight the whole row with a pale background colour.
- MSP-0720 [M, M] Add a brief warning next to the name. Exact example: "this drug is often mis-selected".
- MSP-0730 [R, M] Warning in grey italics, smaller font than the drug name.
- Incorrect: a single generic list-level warning ("Please select carefully. This list contains similar looking or similar sounding drug names that are often mis-selected.").
- Tall Man lettering (e.g. "quiNIDine", "quiNINE") is shown in a correct example but the rationale says evidence is inconclusive; guidance prefers row highlight plus text.
5.3.15 Formatting spelling matches and synonyms
- MSP-0740 [R, M] Highlight with background colour only the characters that differ between typed text and the spelling match (not all matched text).
- MSP-0750 [M, M] Sufficient colour and contrast between text and both row background and spelling highlight.
- MSP-0760 [M, M] Sufficient colour and contrast between row background highlighting (e.g. alternate shading / mis-selection highlight) and spelling highlight.
- MSP-0770 [M, M] Synonym-matched names carry a message containing the synonym. Exact example: "furosemide  previously named frusemide".
5.3.16 List formatting
- MSP-0780 [M, M] Subtle alternate row shading.
- MSP-0790 [M, M] No strong horizontal lines between individual rows.
- MSP-0800 [M, M] Restart alternate shading at the start of each section: first item in each section unshaded, second shaded.
5.3.17 Generic and brand names
- MSP-0810 [M, M] When a brand that has a generic name matches, display generic name supplemented by the brand: "clotrimazole – CANESTEN (CLOTRIMAZOLE)", "atenolol – TENORMIN". Brand with no generic (e.g. DIORALYTE, GAVISCON, DIOCALM) shown alone in capitals.
- MSP-0820 [M, M] Separator: "a hyphen that has a space either side" (typeset in examples as " – ").
- MSP-0830 [M, M] Do not display brand names unless the brand itself matched the typed text (searching "clotrim" must not show "clotrimazole – CANESTEN").
- MSP-0840 [R, M] Order generic then brand (as Medication Line); "CANESTEN (CLOTRIMAZOLE) – clotrimazole" is not recommended.
- Brand names in CAPITALS (per Medication Line).

### 6. Cascading lists (MSP-0850 to MSP-1020)
6.3.1 Providing (alternative-solution section)
- MSP-0850 [M, H] On drug selection show a cascading list, plus up to two further cascading lists for basic attributes (route, form, etc.). Cascades never appear before a drug is selected.
- MSP-0860 [M, M] Present the second list when a selection is made in the search results.
- MSP-0870 [M, H] Results list width extends into available space to fit the longest entry when first shown (avoid wrapping/truncation).
- MSP-0880 [R, M] Different cascades per drug (route and form, route and strength, combined "inhaled – nebuliser" items, etc.). After the last cascade, template prescriptions appear (right of cascades, or below if no room).
- MSP-0890 [M, H] Options limited to those relevant to the previous selection.
6.3.2 Displaying
- MSP-0900 [R, M] When a cascade appears and results stay open, narrow the results list (wrap names per Medication Line) so the cascade sits in a consistent place.
- MSP-0910 [M, H] No list may obscure another.
- MSP-0920 [R, M] Keep selections and their source lists (including search results) visible throughout the cascade, as long as space allows without obscuring other information; lists may collapse if needed.
- MSP-0930 [R, L] When narrowing produces a scroll bar, auto-expand the list to show all results (scroll bar) so the selected item can stay in view.
- Selected item remains visibly selected within its open list; unselected intended item still visible to aid noticing mis-selection.
6.3.3 Contents
- MSP-0940 [M, M] Each cascading list includes an item giving access to values not in the list (where they exist). Label in examples: "other..." (may be replaced by a more descriptive label, e.g. "specialist routes...").
- MSP-0950 [M, M] That item is last and separated by a horizontal line.
- MSP-0960 [M, M] No keyboard shortcut for that item.
- MSP-0970 [R, M] Allow cascade options that distinguish bio-availability (e.g. "oral – modified-release" vs "oral"), so template lists never mix MR and non-MR.
- "other..." acts as an exit to the detailed prescription form / extended options.
6.3.4 Brands
- Three cases: (1) brand with no generic: cascades as for generic; (2) brand with recommended generic equivalent: cascade lists generic equivalent options and brand options; (3) brand where generic equivalent not recommended (e.g. not bioequivalent): brand-only options.
- MSP-0980 [M, M] Brand with generic equivalents selected: cascade includes options for the brand and generic equivalents.
- MSP-0990 [M, M] Brand with no displayed generic equivalent: go to template prescriptions for the brand (or step-by-step).
- MSP-1000 [R, M] Include the drug names in those cascade items: "atenolol – oral", "TENORMIN – oral", "DILZEM SR – oral – modified-release".
- MSP-1010 [R, M] Divide the list into two parts (generic part, brand part).
- MSP-1020 [R, M] Generic equivalent options above brand options.

### 7. Required attributes: templates, selection trail, step by step, sentence layout (MSP-1030 to MSP-1520)
7.3.1 Template prescriptions
- MSP-1030 [M, H] Require at least drug name and route (or attributes that determine medication type) before showing templates.
- MSP-1040 [M, M] Show templates only after all cascading lists have selections (manual or automatic).
- MSP-1050 [R, M] Keep the number of templates to a practical minimum.
7.3.2 Selection trail
- MSP-1060 [M, M] After the last cascade selection, show a selection trail: each selection (drug, route...) in its own text-box-like control (not breadcrumb text such as "clarithromycin > oral").
- MSP-1070 [M, M] If template text might wrap, show the whole template list on a new line below the other controls.
- MSP-1080 [R, M] Selecting any trail item reopens the lists for all trail items.
- MSP-1090 [R, M] If reopened before a template is chosen, remove template list from view.
- MSP-1100 [R, M] Reopened lists appear exactly as before templates were shown (selections highlighted, search text restored).
- No back/forward or undo buttons needed; editing in place serves as undo.
7.3.3 Template layout
- MSP-1110 [M, M] List without column headings.
- MSP-1120 [R, M] Combine attributes into one column where needed to reduce columns (no sparse columns).
- MSP-1130 [M, M] Dose (or equivalent) first in each template, preceded by the label "DOSE" (e.g. "DOSE 250 mg twice a day").
- MSP-1140 [R, M] When space is limited, use Medication Line style: "DOSE 2.5 mg – tablet – once only".
- MSP-1150 [M, M] No horizontal scrolling in template lists.
7.3.4 Template contents
- MSP-1160 [M, M] Only templates relevant to the drug and cascade selections.
- MSP-1170 [M, H] Minimise (avoid where possible) templates differing in only one attribute from others in the list.
- MSP-1180 [R, H] Where possible include dose (or equivalent) and frequency (recommended because e.g. warfarin may lack a dose).
- MSP-1190 [R, H] Include strength when required for the drug ("DOSE 2 puffs – 100 micrograms per puff – four times a day – as required").
- MSP-1200 [R, H] Include brand when required (e.g. diltiazem MR: "DILZEM SR  DOSE 60 mg three times a day").
- MSP-1210 [R, L] Supplementary information in grey italics (e.g. "for irritable bowel syndrome", "for pain", "for depression", "12-hourly preparation").
- MSP-1220 [R, M] Minimal number of attributes per template.
- MSP-1230 [M, M] Include an option to go directly to the prescription form without picking a template ("other...").
- MSP-1240 [M, M] That option is last and separated by a horizontal line.
7.3.5 Maintaining access to templates
- MSP-1250 [M, H] After choosing a template, show editable pre-filled input controls for each value it defined (e.g. "DOSE 250 mg", "twice a day", "at these times 08:00; 20:00", "first dose Today 20:00", "duration 7 days").
- MSP-1260 [M, M] Provide a control to reopen the template list (example label "Template Prescriptions", or a drop-down affordance on the dose/frequency group).
- MSP-1270 [M, M] Allow selecting an alternative template.
- MSP-1280 [R, M] When the reopen control has focus or is activated, highlight the fields the template defines.
- MSP-1290 [R, M] When the template control is selected, visual cues associate it with the template-defined fields.
- MSP-1300 [R, M] With no templates but known safe values (dose, frequency), present selection lists for those fields one at a time (e.g. prompt "Select a dose" with "DOSE 2 mg", "DOSE 4 mg", "other...").
7.3.6 Step by step (alternative-solution section)
- Example required-field set for "oral – modified-release": drug name, brand name, route, dose, frequency, administration times, time of first dose, duration. Table 8 notional fields: Generic Drug Name, Brand name, Route, Strength, Dose, Method, Frequency, Administration Times, Time of First Dose, Start Date and Time, Duration (each Required/Optional/N/A by type).
- MSP-1310 [M, M] Require drug name and route (or type-determining attributes) before any other input controls.
- MSP-1320 [M, M] After cascades, if no templates, show required non-prefilled fields one at a time, each appearing when the previous one is completed.
- MSP-1330 [R, L] If a selection (e.g. frequency "as required") requires a further field, show that field before remaining required fields (e.g. "Give when..." list: "Breathless", "PEFR is below 200", "other...").
- MSP-1340 [M, M] Provide a control to switch to a detailed view with all valid fields. Label in examples: "Full Prescription Form" (also "More Options ▼").
- MSP-1350 [R, M] Disable that control until drug name and route (or equivalent) selected.
- MSP-1360 [M, M] Provide a control to undo the switch, returning to the required-fields view. Example label: "Go Back".
- MSP-1370 [R, M] Minimum number of input controls needed.
- MSP-1380 [R, M] Support pre-filling displayed fields when a related field is selected.
- MSP-1390 [R, M] All fields re-selectable/changeable, even single-option lists (e.g. admin times list with "08:00; 20:00" and "Edit Administration Times...").
- MSP-1400 [R, M] Do not show optional fields or controls for them (e.g. "Select a Strength", "Select a Form") in this view, apart from the detailed-form button.
- MSP-1410 [M, M] and MSP-1430 [R, M] (duplicate wording): "Ensure that no data is lost whilst switching from one form to another".
- MSP-1420 [R, M] Minimise navigation controls; MSP-1440 [R, M] minimise controls needed to navigate between forms.
- Typical command row in examples: "Full Prescription Form", "Preview", "Authorise", "Cancel".
7.3.7 Sentence layout (alternative-solution section)
- Definition: fields laid out like words in a sentence; dynamic width; wrap whole fields to the next line. Order illustrated: drug, route, dose, frequency, give when..., admin times, first dose, duration.
- MSP-1450 [M, M] Use sentence layout when the area is much wider than tall (thin horizontal strip); a label/field column layout there is incorrect.
- MSP-1460 [R, L] Use sentence layout for cascading lists and step-by-step lists.
- MSP-1470 [R, L] Incorporate labels into fields (e.g. "DOSE 250 mg", "at these times 08:00; 20:00", "first dose Today 20:00", "duration 7 days", "starting from Today 11:00").
- MSP-1480 [M, M] Wrap fields to a new line as necessary.
- MSP-1490 [R, L] Start a new line after each group (e.g. dose+frequency group starts on new line).
- MSP-1500 [M, M] Fields grow in width to fit text entered or value selected.
- MSP-1510 [R, M] Fields shrink in width when value changes to something shorter.
- MSP-1520 [R, H] Label controls whose contents could be mistaken for another control's (dose vs strength: "DOSE"; first dose vs prescribing/end date: "first dose").
- Fields still in consistent order (MSP-1530).

### 8. Prescription forms (MSP-1530 to MSP-1810)
8.3.1 Layout (applies to all stages)
- MSP-1530 [M, M] Fields (and controls for optional fields) in a consistent relative order for all prescriptions.
- MSP-1540 [R, M] Minimise number of different input control types in a view (prefer uniform drop-down/selection-list style; avoid mixing text boxes, spinners, radio buttons, date pickers, check boxes).
- MSP-1550 [M, H] Drug name never scrolls out of view: sticky at top of form even when form scrolls.
- MSP-1560 [R, M] Column layout: labels on the left, right-aligned; fields on the right, left-aligned.
- MSP-1570 [R, M] Labels above controls: left-aligned, smaller font than control text.
- Example column labels: "Drug Name", "Route", "Dose", "Frequency", "Administration Times", "First Dose" / "Time of First Dose", "Duration".
8.3.2 Detailed form
- MSP-1580 [M, M] Require drug name and route before showing the rest of the detailed form (no fields, not even disabled ones, before then).
- MSP-1590 [M, M] Required fields shown by default.
- MSP-1600 [M, H] Detailed form shows the most important attributes by default with access to all fields.
- MSP-1610 [M, M] Tabs or buttons to navigate between areas (example tabs: "Drug Details", "Administration Schedule").
- MSP-1620 [M, H] Every area reachable by a dedicated control, never only via a list item (e.g. "Edit administration times..." in a list must also have a tab/button).
- MSP-1630 [R, M] Include an appropriate set of controls for optional fields.
- MSP-1640 [R, L] Combine drug name and route into one control ("clarithromycin – oral", "diltiazem – DILZEM SR – oral – modified release").
- MSP-1650 [R, L] Selecting the combined field offers "Edit drug name and route".
- MSP-1660 [M, M] Do not disable fields to impose entry order.
- MSP-1670 [M, M] After cascades, do not auto-open a selection list in the detailed form unless a change requires confirming/re-entering related fields.
- Example group labels (left column): "Drug Name and Route", "Strength, Form and Device", "Dose and Frequency", "Administration", "Duration"; optional controls: "Add a Reason for Prescribing", "Select a Strength", "Select a Form", "Select a Device", "Enter a Site", "As Required", "For Self Administration", "Add a Start Condition", "Add a Review Date", "Add Special Instructions", "Patient's own medication", "Add an Additional Once Only Dose".
8.3.3 Structure
- MSP-1680 [M, M] Drug name and route in a section at the top.
- MSP-1690 [M, M] First field of each section on a new line.
- MSP-1700 [R, L] Section labels at the top of the section (examples: "Medication to be Administered", "How Much and When", "Course Duration").
- MSP-1710 [M, M] Label at least each control, group of controls, or section.
8.3.4 Required and optional fields
- MSP-1720 [R, M] Promote an optional field (show its input control) only when its completion should be encouraged (e.g. reason for antibiotic).
- MSP-1730 [R, M] Promoted optional field supports a null value and is required. Exact null item: "None (leave blank)". Prompt "Select or enter a reason for prescribing"; free-text item "Enter a reason for prescribing"; "Select from a list...".
- MSP-1740 [M, M] In-field prompts for fields the user must complete that would otherwise be blank (not needed if field contains a label).
- MSP-1750 [R, M] Prompts start with a verb: "Select a frequency", "Select a Strength", "Enter a Site", "Enter a method of administration", "Select a route", "Enter a dose" ("frequency" alone is incorrect).
- MSP-1760 [M, H] Control for an optional field sits where the field will appear when activated (inline; not a right-hand list that inserts elsewhere). Example style: grey text preceded by "+".
- MSP-1770 [R, L] If the optional value widens the field, allow wrap to new line.
- MSP-1780 [R, L] A single optional control may reveal more than one field.
- MSP-1790 [R, M] Reduce visual emphasis of optional controls (e.g. grey text).
- MSP-1800 [R, M] Optional values removable, returning field/control to its initial state (e.g. list item "Remove" on "as required").
- MSP-1810 [R, M] Required-field marking (e.g. "*" asterisk, bold labels) only where needed for consistency with the rest of the application.
- Three control kinds: (1) individual optional field controls; (2) controls opening small sets (e.g. "Calculate Dose" panel with "Close"); (3) tabs/buttons for large sets.
- Study 69: prefer "More Options" to expand inline; group fields by field type, not by mandatory-ness.

### 9. Input controls (MSP-1820 to MSP-2170)
9.3.1 Dynamic controls
- MSP-1820 [M, M] Support controls shown only when certain values are selected in another control (e.g. "Give when..." when frequency includes "as required").
- MSP-1830 [R, L] Place earlier the fields that determine which others appear.
- MSP-1840 [R, M] Group together controls whose values affect others' options.
- MSP-1850 [R, L] Allow other controls to move so the new one is placed consistently.
- MSP-1860 [R, L] New control appears next (in sequence) to the control that triggered it; removed when trigger value changes back.
9.3.2 Selection lists
- Dose control styles (Table 9): 1 two text boxes (only with sophisticated validation); 2 text box + unit list; 3 spin control + fixed unit (narrow dose range); 4 list of predefined "DOSE 500 mg", "DOSE 1 g", "other..."; 5 as 4 plus a list item with embedded number box and fixed unit ("DOSE [ ] mg"). Styles 4 and 5 promoted; 1 to 3 need validation.
- Known unmitigated risk: alphanumeric sorting of doses (120 mg, 125 mg, 15 mg, 1 g, 240 mg ...) puts large next to small doses; no guidance given. [suggested] sort doses by numeric value normalised to a common unit.
- MSP-1870 [M, H] ESC closes a selection list (also click outside) without selecting.
- MSP-1880 [R, M] Combine controls into one list control where useful (e.g. frequency list: "in the morning", "at bedtime", "twice a day", "three times a day", "four times a day", "every [ ] hours", "other...").
- MSP-1890 [M, M] Reopening a selection list must not empty other fields.
- MSP-1900 [R, M] Encourage list selection before free text: free text only after choosing "other..." (prompt "Enter a description of when this medication should be given").
- MSP-1910 [R, L] Supplementary info in list items in grey italics (e.g. "08:00; 20:00  Standard times", "10:00; 22:00  Non-standard times").
9.3.3 Prioritised lists
- MSP-1920 [R, M] Prioritise by splitting list into sections.
- MSP-1930 [R, M] First section (and auto-presented cascades) limited to relevant values.
- MSP-1940 [R, L] Further options in an additional section revealed via "other..." (can be repeated: route list, then unlicensed route, then full route list).
- MSP-1950 [R, M] Single item at the end for a detailed view (e.g. "Edit Administration Times...").
- Dose units may be locked or be sole prioritised value with "other" to change unit.
9.3.4 Inter-related fields
- MSP-1960 [R, L] Supplementary group text when a choice affects other fields (e.g. strength list grouped "For breath actuated inhalers", "For dry powder inhalers", "For metered dose inhalers", "For nebulisers").
- MSP-1970 [M, H] Update list contents based on related selections where data available.
- MSP-1980 [R, L] Items invalid given other fields go in a separate section (e.g. behind "Other...", headed "For other strengths").
- MSP-1990 [M, H] Selecting an invalid-combination item clears the conflicting other field(s) (e.g. strength cleared, shows "Select a strength").
- MSP-2000 [R, M] Place inter-dependent controls close together.
- MSP-2010 [R, M] Without decision support validation, reselecting a different value clears all inter-dependent controls.
- When strength changes after dose, dose must be reconfirmed.
9.3.5 Pre-filling
- MSP-2020 [M, H] Support pre-fill when fields first appear; values based on at least drug name and route.
- MSP-2030 [R, M] All fields re-selectable/changeable even if only one option.
- MSP-2040 [R, L] On selection, pre-fill dependent fields that have defaults or a single possible value.
- MSP-2050 [M, H] Highlight fields whose contents changed automatically (not by the user).
- MSP-2060 [R, L] Pre-fill administration times and time of first dose (or equivalents) when frequency selected (e.g. "three times a day" gives "08:00; 14:00; 20:00", "first dose Today 14:00").
- Policy: type-defining attributes must be explicit choices; pre-fill only when one possible value; templates preferred over passive defaults.
9.3.6 Specific controls
- MSP-2070 [M, H] Dose field always labelled (inside or outside the control), e.g. "DOSE".
- MSP-2080 [R, H] If possible prevent unit choices that make the dose invalid with the entered amount.
- MSP-2090 [M, M] Strength field labelled, or in a group whose label contains the word "strength" ("Strength", "Strength and Form", "Strength, Form and Device").
- MSP-2100 [M, M] Strength and dose controls never side by side in a detailed form.
- MSP-2110 [M, M] In a list of administration times, the first scheduled administration (first dose) is shown in bold.
- MSP-2120 [R, L] No horizontal text list of administration times for schedules with more than 6 events per 24 hours (use detailed view).
- MSP-2130 [R, M] Selection list of predefined administration time sets.
- MSP-2140 [M, M] No controls for editing individual administration times in the required-fields view (only in a detailed schedule view).
- MSP-2150 [R, M] Always require (or pre-fill) date and time for: first dose (regular), start date/time (as required), the only dose (once only).
- MSP-2160 [R, M] Use distinct labels for those three (examples: "first dose", "starting from", and for once-only not specified; avoid ambiguous "Start"). Text not mandated.
- MSP-2170 [R, L] No check box for two-state attributes that reveal another field (e.g. "As Required"); use a list with a "Remove" option.
- Studies: use label "duration" not "continuing"; default duration "ongoing" for inpatients except e.g. antibiotics; avoid "Approx" flag; mark "Today".

### 10. Preview and authorise (MSP-2180 to MSP-2310)
- MSP-2180 [M, H] Provide a control to display a preview (button "Preview").
- MSP-2190 [M, H] Preview includes all values defined.
- MSP-2200 [M, M] Drug details in preview follow Medication Line {R3}, e.g. "diltiazem – DILZEM SR – modified-release capsules – DOSE 60 mg – oral – twice a day – 08:00; 20:00 – Today 20:00".
- MSP-2210 [R, M] Preview not compulsory before a detailed form has been opened.
- MSP-2220 [M, H] Preview compulsory before authorise when details span more than one screen needing navigation (tabs/buttons).
- MSP-2230 [R, L] Do not show the medication line as one unwrapped line longer than 120 characters.
- MSP-2240 [R, M] Some attributes may use formats from other views (e.g. administration times listed vertically like Drug Administration View).
- MSP-2250 [M, M] Control to close preview and return to form for amendment. Label in examples: "Close Preview".
- MSP-2260 [M, M] Default focus on the close-preview control (not Authorise).
- MSP-2270 [M, H] "Preview" button before "Authorise" in layout and tab order.
- MSP-2280 [M, M] Authorise button labelled exactly "Authorise".
- MSP-2290 [M, H] Authorise at bottom right of the form, so it may be out of view (forces scroll past all fields) if form scrolls.
- MSP-2300 [M, H] Authorise never has default focus (Preview gets default focus in example).
- MSP-2310 [M, H] Authorise disabled until all required fields completed.
- Optional: a check box that must be ticked before Authorise is enabled (not mandated; Study 69 said do not mandate "safety catch").
- Study 67: before authorising show first dose time and a representation of the schedule; structured preview preferred over single sentence.

### Accessibility points
- Every Quick List item and prioritised search result has a visible keyboard shortcut (WCAG 1.0 checkpoint 9.5 cited); shortcuts disabled while change notification open.
- Full keyboard operation: focus stays in search box while typing; TAB into results focuses first item; arrow keys navigate; ESC closes any selection list; tab order Preview before Authorise.
- In-field prompts (placeholders) describe scope and required action; must not carry crucial information; labels embedded in fields in sentence layout. [suggested] expose as accessible names/aria-describedby since placeholders vanish.
- MSP-0750/0760: sufficient colour contrast for highlights; grey italic supplementary text must still be legible [suggested: meet WCAG AA 4.5:1].
- Messages ("Please type in at least 2 characters", "No matches were found", "Showing 10 of 40 matches.") are status feedback. [suggested] aria-live polite region.
- Do not convey mis-selection risk by colour alone: text warning is mandatory (MSP-0720).
- Required fields marked by prompts beginning with verbs rather than only asterisks.

### Patient-safety rationale (key)
- Patient Banner visible: prevents prescribing for wrong patient (MSP-0010).
- No auto-complete, no codes, 2-character minimum, beginning-of-word matching, short height-limited lists, generic before brand, brand always with generic: reduce look-alike/sound-alike mis-selection.
- Quick List change notification and shortcut lockout: learned keystrokes would select a different drug after list changes.
- No template prescriptions in Quick List: two-click wrong-drug prescribing risk.
- Co-drug ingredients shown: wrong assumptions about ingredients.
- Template prescriptions reduce dose errors (factor-10, wrong frequency; e.g. "10 ml IV diazepam (equivalent to 50 mg)" instead of 10 mg).
- Avoid near-identical templates (MSP-1170); dose first; no horizontal scroll (attribute missed off-screen).
- Drug name sticky (MSP-1550): interruption could cause defining values for a different drug.
- Dose labelled and never beside strength: dose/strength confusion.
- Auto-changed fields highlighted: unintended pre-filled values authorised.
- First dose bold, distinct first-dose/start labels: delayed first dose (known death from delayed meningitis treatment).
- Authorise not default focus, after Preview, bottom right, disabled until complete: accidental authorisation by repeated keystrokes.
- Free text only after list choice: inconsistent free text contradicting structured fields.
- Check box for "as required" loses dependent data silently when unticked.

## Proposed controls

### 1. `DrugSearchBox` (search input + results host)
Purpose: progressive drug search per 5.3. Composes `DrugSearchResults` and `QuickList`.
Props:
- `onSearch: (query: string, signal: AbortSignal) => Promise<DrugSearchResponse>`
- `placeholder?: string = "Type a drug name to search"` (MSP-0290/0300)
- `minChars?: number = 2` (MSP-0390; do not allow < 2)
- `debounceMs?: number = 250` [suggested value; doc says "slight delay"]
- `progressive?: boolean = true` (MSP-0370); when false render "Search" button and ENTER submit (MSP-0380)
- `maxVisibleRows?: number = 10` [suggested; doc: "defined maximum"]
- `quickList?: QuickListProps` shown when query is empty (MSP-0080/0100)
- `selected?: DrugResult`; `onSelect: (r: DrugResult) => void`
- `collapseOnSelect?: boolean = false` (MSP-0350/0360 for limited space)
- `persistPromptOnFocus?: boolean = true` (Study 69)
States: empty (Quick List), oneChar (message "Please type in at least 2 characters"), searching (busy indicator), noMatches ("No matches were found"), results (limited), resultsExpanded (scroll), collapsedSelection (shows selected name; click restores query, list, highlight).
Behaviour: no autocomplete (`autoComplete="off"`, no inline suggestion; MSP-0320); no code input (MSP-0310); focus stays in input as results update (MSP-0330); TAB / ArrowDown moves focus to first result (MSP-0340); ENTER may submit immediately; message box min-height 3 rows and min-width = input width (MSP-0420); results directly under input (MSP-0280). Implements MSP-0280 to MSP-0490, MSP-0870.

### 2. `DrugSearchResults`
Props:
- `query: string`
- `prioritised: DrugResult[]`, `standard: DrugResult[]`, `groups?: DrugGroup[]`
- `prioritisedLabel?: string = "Commonly prescribed matches"` (MSP-0640); `standardLabel?: string = "Standard matches"` (MSP-0660)
- `totalCount: number`, `maxVisibleRows: number`, `expanded: boolean`, `onShowAll()` (label "Show all")
- `shortcutModifier?: "Ctrl" | "Shift" = "Ctrl"`
- `selectedId?: string`, `narrow?: boolean` (when cascade open, MSP-0900/0930)
- `onSelect`, `onGroupOpen(group)`
Rendering: sections only if non-empty; omit prioritised label, divider and standard label when no prioritised items (MSP-0670); horizontal divider between sections (MSP-0630); headings visually distinct (e.g. bold, not list-row styled; MSP-0650); subtle alternate shading restarting per section, first row unshaded (MSP-0780/0800); no strong row borders (MSP-0790); shortcuts "Ctrl + n" for prioritised rows only, right-aligned, grey italic (MSP-0680/0690), n = 1..9 then 0; footer "Showing {shown} of {total} matches." + "Show all" button when truncated (MSP-0440/0450); expanded = same list with scroll bar, no paging, no tree (MSP-0470/0480/0490); width grows to longest entry (MSP-0870).
Uses `DrugResultRow`.

### 3. `DrugResultRow`
Props: `result: DrugResult` where
```ts
interface DrugResult {
  id: string;
  genericName?: string;        // VTM; absent for brand-only (e.g. DIORALYTE)
  brandName?: string;          // TFN; rendered upper-case
  isCoDrug?: boolean; ingredients?: string[];  // "codeine + paracetamol"
  misSelectionRisk?: boolean;  // look-alike/sound-alike
  matchKind: "direct" | "spelling" | "synonym";
  synonym?: string;            // "frusemide"
  matchedOn: "generic" | "brand";
}
```
plus `query`, `shortcut?: string`, `shaded: boolean`, `selected: boolean`, `misSelectionText?: string = "this drug is often mis-selected"`, `synonymTemplate?: (s) => string = s => \`previously named ${s}\``.
Rendering: `formatDrugName()`; co-drug ingredients appended in grey italic (MSP-0600/0610); mis-selection rows pale background + grey italic smaller warning text (MSP-0700 to 0730); spelling-match differing characters highlighted with background colour (MSP-0740) with checked contrast (MSP-0750/0760); synonym message (MSP-0770).

### 4. `QuickList`
Props: `lists: {id: string; name: string; description: string; items: DrugResult[]}[]`, `selectedListId: string` (required default; MSP-0080/0260), `onListChange`, `selectorLabel?: string = "Quick List"` (MSP-0270), `maxItems?: number = 10` (MSP-0120; enforce no scroll), `changedSince?: { updatedOn?: Date }` (shows notification), `onDismissNotification(permanent: boolean)`, `onSelect`.
Behaviour: list selector only if more than one list (MSP-0250); description label at top or bottom (MSP-0090); items rendered as `DrugResultRow` with "Ctrl + n" shortcuts right (MSP-0140/0150), alternate shading (MSP-0160); flat (MSP-0110); validates items are drug names only (MSP-0130). Global Ctrl+digit handler selects item unless notification open (MSP-0230).
Sub-control `QuickListChangeNotice`: text "The contents of the Quick List were updated on {dd-Mmm-yyyy}." (or "...have changed."), "Close" control (MSP-0180), check box "Don't show this message again" (MSP-0190), positioned beside not over list (MSP-0210), auto-close on typing or selection (MSP-0220), re-shown each time until permanently dismissed (MSP-0200).

### 5. `CascadingList` / `CascadeSelector`
Props: `levels: CascadeLevel[]` (max 3 including the first after drug; MSP-0850), each `{id; options: CascadeOption[]; sections?: {label?: string; options}[]; otherLabel?: string = "other..."; onOther?: () => void}`; `selectedPath: string[]`; `onSelect(levelIdx, option)`; `layout: "columns" | "sentence"`.
`CascadeOption {id; label: string; drugLabel?: string; kind?: "generic" | "brand"}`.
Behaviour: next level appears only after selection (MSP-0860); options filtered by previous selection (MSP-0890); lists stay open showing selection in context (MSP-0920) unless space forces collapse; no overlap (MSP-0910); "other..." last, after horizontal divider, no shortcut (MSP-0940/0950/0960); brand selection produces two-part list, generic part first (MSP-0980 to 1020); MR vs non-MR options (MSP-0970). ESC closes (MSP-1870).

### 6. `SelectionTrail`
Props: `items: {id; label: string; reopen(): void}[]`.
Each item rendered as a text-box style control (not breadcrumb with ">") (MSP-1060). Clicking any item reopens all cascade lists as they were and hides template list if no template chosen (MSP-1080/1090/1100).

### 7. `TemplatePrescriptionList`
Props: `templates: TemplatePrescription[]` where `{id; dose: string /* "250 mg" */; attributes: string[]; supplementary?: string}`; `layout: "list" | "medicationLine"` (MSP-1140); `placement: "right" | "below"` (MSP-1070); `otherLabel = "other..."`; `onSelect`; `onSkipToForm` (MSP-1230).
Rendering: no column headings (MSP-1110); each row begins "DOSE {dose}" (MSP-1130); attributes combined in one column; medication-line style joins with " – " (MSP-1120/1140); supplementary grey italic (MSP-1210); never horizontal scroll, wrap instead (MSP-1150); "other..." last after divider (MSP-1240). Shown only when cascade complete (MSP-1030/1040). [suggested] dev warning when two templates differ in only one attribute (MSP-1170).

### 8. `TemplateReopenControl`
Props: `label?: string = "Template Prescriptions"`, `definedFieldIds: string[]`, `onOpen()`.
On focus/hover/activation, sets highlight state on associated fields (MSP-1280/1290). Required whenever a template has been applied (MSP-1260/1270).

### 9. `SentenceLayout` and `SentenceField` (dynamic-width selection field)
`SentenceLayout` props: `groups: {id; fields: ReactNode[]}[]`, `newLinePerGroup?: boolean = true` (MSP-1490). Flex-wrap, whole fields wrap (MSP-1480).
`SentenceField` props: `value?: string`, `inlineLabel?: string` (e.g. "DOSE", "at these times", "first dose", "duration", "starting from"; MSP-1470/1520), `prompt?: string` (verb-first, MSP-1740/1750), `options: SelectionListSection[]`, `allowFreeTextViaOther?: boolean` (MSP-1900), `autoChanged?: boolean` (highlight; MSP-2050), `templateHighlighted?: boolean`, `optional?: boolean` (de-emphasised; MSP-1790), `onChange`, `onRemove?` ("Remove" item; MSP-1800).
Behaviour: width grows/shrinks to content (MSP-1500/1510); always reselectable even with one option (MSP-1390/2030); reopening does not clear other fields (MSP-1890); ESC closes list (MSP-1870).

### 10. `SelectionList` (prioritised drop-down list)
Props: `sections: {label?: string; supplementaryText?: string; items: SelectionItem[]; invalidForCurrent?: boolean}[]`; `SelectionItem {id; label; supplementary?: string /* grey italic, MSP-1910 */; kind?: "value" | "other" | "null" | "detailView" | "remove" | "freeTextNumber"; unit?: string}`; `nullLabel = "None (leave blank)"`; `detailViewLabel` e.g. "Edit Administration Times..."; `onSelect`.
Behaviour: first section relevant values (MSP-1920/1930); "other..." reveals next section (MSP-1940); detail-view item last (MSP-1950); invalid items in separate labelled section ("For other strengths") and selecting one triggers `onConflict` to clear related fields (MSP-1980/1990); embedded numeric box items ("every [ ] hours", "DOSE [ ] mg"; MSP-1880, Table 9 style 5).

### 11. `DoseInput`
Props: `options: {amount: number; unit: string}[]`, `allowCustom?: boolean`, `fixedUnit?: string`, `label = "DOSE"` (always shown; MSP-2070), `validUnits?: (amount) => string[]` (MSP-2080).
Style 4/5 list preferred. Never placed adjacent to strength (MSP-2100; layout validator). [suggested] order options numerically by normalised quantity.

### 12. `StrengthInput`
Props: `label?: string = "Strength"` or group label containing "strength" (MSP-2090), grouped options with supplementary headings (MSP-1960).

### 13. `AdministrationTimesField`
Props: `sets: {times: string[] /* "HH:mm" */; supplementary?: "Standard times" | "Non-standard times" | string}[]`, `value: string[]`, `firstDoseIndex?: number`, `onEditDetailed()`.
Rendering: times joined "; " (e.g. "08:00; 20:00"); first scheduled administration bold (MSP-2110); if more than 6 per 24 h, do not render horizontal text list, link to detailed view (MSP-2120); list of predefined sets + "Edit Administration Times..." (MSP-2130/1950); no per-time editors in required view (MSP-2140); pre-fill from frequency with highlight (MSP-2060/2050).

### 14. `FirstDoseField`
Props: `kind: "regular" | "asRequired" | "onceOnly"`, `value: Date`, `labels?: Record<kind,string>` defaults [suggested] { regular: "first dose", asRequired: "starting from", onceOnly: "give at" } (distinct labels, MSP-2160; doc does not fix text). Required or pre-filled (MSP-2150). Uses Date/Time display ("Today 20:00", "02-Apr-2010 20:00").

### 15. `OptionalFieldToggle`
Props: `label: string` (e.g. "Add a Reason for Prescribing", "Add a Start Condition", "Add a Review Date", "Add Special Instructions"), `renders: ReactNode` (one or more fields), `onRemove`.
Rendered in place of the field, grey, "+" prefix (MSP-1760/1790); expands inline; removable to initial state (MSP-1800). Promoted optional fields render as required with null option (MSP-1720/1730).

### 16. `PrescriptionForm` (quick/required view and detailed view)
Props: `mode: "required" | "detailed"`, `medicationType?: MedicationType` (null until drug + route), `fields: FieldDef[]` (consistent order; MSP-1530), `layout: "sentence" | "columns" | "labelsAbove"`, `tabs?: {id; label}[]` (e.g. "Drug Details", "Administration Schedule"), `onSwitchMode`, `data`, `onChange`.
Behaviour: nothing beyond drug/route until type known, no disabled placeholders (MSP-1310/1580/1660); sticky drug header (MSP-1550/1680, combined "drug – route" control with "Edit drug name and route"; MSP-1640/1650); "Full Prescription Form" button disabled until type known (MSP-1340/1350); "Go Back" from detailed (MSP-1360); no data loss across switch (MSP-1410); step-by-step reveal of required non-prefilled fields when no templates (MSP-1320/1330); no optional controls in required mode (MSP-1400); column layout labels right-aligned (MSP-1560); labels-above left-aligned smaller (MSP-1570); each section first field on new line, labels on every control/group/section (MSP-1690/1700/1710); all areas reachable by tab/button (MSP-1610/1620); no auto-open lists (MSP-1670); dynamic fields inserted next to trigger (MSP-1820 to 1860); required markers optional prop `markRequired?: "none" | "asterisk" | "asteriskBold" = "none"` (MSP-1810).
Composes `PrescriptionCommandBar`.

### 17. `PrescriptionCommandBar`
Props: `onPreview`, `onAuthorise`, `onCancel?`, `canAuthorise: boolean` (all required complete; MSP-2310), `requireConfirmCheckbox?: boolean = false`, `extraLeft?: ReactNode` (e.g. "Full Prescription Form", "More Options ▼").
Order: [extras] "Preview" then "Authorise" (exact label; MSP-2280) then "Cancel"; DOM/tab order Preview before Authorise (MSP-2270); placed at bottom right of form, inside scroll (not sticky; MSP-2290); Authorise never autofocus (MSP-2300); default focus on Preview.

### 18. `PrescriptionPreview`
Props: `prescription`, `format: "medicationLine" | "structured"`, `onClose` (label "Close Preview"), `onAuthorise`, `mandatory: boolean`.
Behaviour: shows all values (MSP-2190) via Medication Line formatting (MSP-2200); wraps, never single line over 120 chars (MSP-2230); admin times may be vertical (MSP-2240); default focus "Close Preview" (MSP-2250/2260); `mandatory` true when form has more than one screen/tab (MSP-2220); never forced before detailed form opened (MSP-2210).

### 19. `IncompletePrescriptionIndicator`
Props: `drugLabel?: string`, `onResume()`. Persistent on-screen badge while user is away from an unfinished prescription (MSP-0040); text [suggested] "Incomplete prescription: not yet authorised".

### 20. `PrescribingArea` (layout shell)
Props: `orientation: "horizontal" | "vertical"`, `patientBanner` slot must remain visible (MSP-0010), `sideView?` (Medications List, with its toolbar kept adjacent; MSP-0020/0050).

### Utility functions
- `formatDrugName(r: DrugResult): string`: if `genericName` and `brandName` -> `${generic} – ${BRAND.toUpperCase()}` (separator spaced hyphen, rendered " – "; MSP-0810/0820/0840); brand only -> `BRAND`; generic only -> generic (lower case as in dm+d). Co-drug ingredients returned separately for styling.
- `tokeniseQuery(q)`: trim, collapse whitespace, lower-case, split on spaces; reject/ignore if total non-space length < 2 (MSP-0390). [suggested] treat "-" and space as equivalent so "co amox" matches "co-amoxiclav" (Study 37).
- `wordStarts(name)`: split candidate name on word boundaries (spaces, "+", "-", "(", ")", "/") and return each word with its character offset.
- `matchDrug(tokens, candidateName)`: every token must be a prefix (case-insensitive) of a distinct word in the name (MSP-0510/0520); return `{matched: boolean, firstMatchOffset: number, firstMatchWordIndex: number}`. Never substring or suffix matches.
- `searchDrugs(query, catalogue)`: match against generic names and brand names (MSP-0500); include brand rows only when the brand name matched (MSP-0830); include synonym hits with `matchKind: "synonym"` (MSP-0580) and spelling hits `matchKind: "spelling"` (MSP-0570), all in the same list (MSP-0590).
- `sortResults(results)`: within each section: (1) generic-name matches before brand-name matches (MSP-0530); (2) ascending word index / offset of first match (proximity to start); (3) alphabetical, case-insensitive, by display string (MSP-0540) unless a relevancy rank is supplied.
- `partitionPrioritised(results, isPrioritised)`: returns `{prioritised, standard}` (MSP-0620); shortcuts assigned only to prioritised: index 0..8 -> "Ctrl + 1".."Ctrl + 9", index 9 -> "Ctrl + 0" (from Quick List example); none beyond 10 [suggested].
- `limitResults(sections, maxRows)`: cut combined list at maxRows; return `{visible, shown, total, message: \`Showing ${shown} of ${total} matches.\`}` (MSP-0440).
- `searchFeedback(query, results)`: length 1 -> "Please type in at least 2 characters"; length >= 2 and none -> "No matches were found" (MSP-0400/0410).
- `spellingDiff(typed, match)`: character-level diff (e.g. Levenshtein alignment) returning ranges in `match` that differ from `typed` to background-highlight (MSP-0740); highlight only differences, never matched text.
- `alternateShading(sectionItems)`: index within section i -> shaded = i % 2 === 1 (MSP-0800).
- `formatAdministrationTimes(times: string[]): string`: join with "; " (e.g. "08:00; 20:00"); if count per 24 h > 6, caller must not render horizontally (MSP-2120).
- `formatTemplate(t, style)`: list style `DOSE ${dose} ${attrs.join(" ")}`; medication-line style `DOSE ${dose} – ${attrs.join(" – ")}` (MSP-1130/1140).
- `formatQuickListChangedMessage(date)`: `The contents of the Quick List were updated on ${formatDate(date, "dd-Mmm-yyyy")}.`
- `isTypeDetermined(selection)`: true when drug plus route (or type-defining attributes) selected; gates templates, other fields, full-form button (MSP-1030/1310/1350/1580).
- `nextStepField(requiredFields, values, prefilled)`: first required, non-prefilled, incomplete field in configured order; dynamic triggered fields (e.g. "Give when...") inserted immediately after their trigger (MSP-1320/1330/1860).
- `applyPrefill(changedField, values, rules)`: compute dependent defaults (e.g. frequency to admin times and first dose; MSP-2040/2060); return set of auto-changed field ids for highlighting (MSP-2050); never override explicit type-defining choices.
- `resolveConflicts(changedField, values, validity)`: if new value invalid with related values, clear them (MSP-1990); if no validation available, clear all inter-dependent fields (MSP-2010).
- `canAuthorise(requiredFields, values)`: every required field non-empty, null option ("None (leave blank)") counts as completed (MSP-1730/2310).
- `previewRequired(form)`: true if detailed form spans more than one tab/screen (MSP-2220).
- `wrapMedicationLine(text, max = 120)`: ensure preview line wraps (MSP-2230).
