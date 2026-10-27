# Clinical noting, templates, statements, care pathways

Conformance key used below: **[M]** = Mandatory, **[R]** = Recommended; evidence rating in brackets where useful (H/M/L). The CUI docs state that illustrations are illustrative only: "Stylistic choices, such as colours, fonts or icons are not part of the guidance and unless otherwise specified are not mandatory". Where a colour/style is written into a guideline itself it is captured as stated.

## Clinical Noting in Forms: Admissions Clerking, v1.0.0.0 (clinicalnoting)

- Purpose: UI guidance for semi-structured clinical noting in forms (exemplar: RCP acute admissions clerking pro-forma): entering lists of SNOMED CT coded note entries (e.g. Past Medical History, Problem list), revealing/hiding field sections, required fields, previous values, auto-calculated values (scores), free text, and standard control usage. Guideline prefix CNA-.
- Scope assumptions: SNOMED CT terminology (A1); screen apps, not mobile/voice (A3); recording done in front of patient or soon after (A6). Out of scope: frequencies, multiple-occurrence summaries ("MI x 2, 1994, 1998"), tabular entry, edit history display, terminology hierarchy browsing, subset manipulation, linking concepts, free-text parsing. Editing/deleting covered only BEFORE commit to record (after commit needs audit, not covered).
- Depends on: Terminology Matching, Elaboration, Display Standards for Coded Information; Date Display; Date and Time Input; ADR display/recording guidance.

### Normative guidance

**3.3.1 Entering the clinical concept (list of note entries)**
- CNA-0010 [M,H] Provide a mechanism to type a list of clinical phrases while the system returns matched terms from the terminology.
- CNA-0020 [R] Single field into which user types a clinical term ("search entry field").
- CNA-0030 [M] Visible cursor in search entry field when in focus (without matched term).
- CNA-0040 [R] Do NOT display associated fields (e.g. 'Additional text') until user has searched for and selected a clinical term.
- CNA-0050 [R] Progressively match terms as user types. CNA-0060 [R,M] Display results as matched (list may reorder itself).
- CNA-0070 [R] If progressive matching, do NOT feature a search button. CNA-0080 [R] Without a search button, show a search icon instead (e.g. magnifying glass) (non-clickable icon per research).
- CNA-0090 [R] If significant delay between triggering match and results, indicate search activity until matches return. Significant delay = any period longer than 1 second.
- CNA-0100 [R] Use an animation for search activity. CNA-0110 [R] Animation prominent but not obstructing the search facility (example: animation replaces the search icon and 'Searching' shown in the results field).
- CNA-0120 [R,L] Sufficient contrast (shading and/or colour) so search entry field is prominent (example: shaded area surrounding the search field).
- CNA-0130 [M] Label the search entry field with instructional text (e.g. inform user further fields will appear for additional details).
- CNA-0140 [R] In-field prompt in the search field. CNA-0150 [R] Additional prompting text saying what to do. CNA-0160 [R] Additional prompting text immediately BELOW the search field, low-prominence text size and colour. CNA-0170 [R] Additional prompting text includes an example of what can be typed.
- CNA-0180 [R] Do NOT display multiple search entry fields simultaneously in a single list, except when user has gone back to edit a matched term.
- CNA-0190 [R] Left-align search entry field.
- CNA-0200 [R,H] Search entry field displays 32 characters simultaneously, using 'M' as the standard character width (from Terminology Matching guidance, based on SNOMED CT term lengths).
- CNA-0210 [R] Common-matches list from SNOMED CT (determined by relevant clinical authority). CNA-0220 [R] Visually distinguish common matches from remaining matches. CNA-0230 [R] Common matches displayed ABOVE the remaining matches. CNA-0240 [R] Labels distinguish groups (example labels: 'Common matches' and 'All matches'). (ISO 9241-14: if frequency known and groups <= 8, most frequent options first.)
- CNA-0250 [M] Visually distinguish in-field prompt text from typed data. CNA-0260 [R] Prompt text in grey italic. CNA-0270 [R] No example data in in-field prompt text.
- CNA-0280 [M] In-field prompt remains visible when cursor moves into the field; disappears when text is typed.
- CNA-0290 [R] After selecting a matched term, auto-move focus to next field in tab order.
- CNA-0300 [R] Selected matched (encoded) term displayed in **bold**. CNA-0310 [M] Do NOT truncate a selected matched term.
- CNA-0320 [R] Just after selection, automatically display a new field for the next list entry. CNA-0330 [R] Next entries displayed directly below the preceding entry (vertical stacking; easier to scan).
- Alternative (Windows Forms): auto pop-up window for associated attribute details instead of expanding area.

**3.3.2 'Match not found'** (applies to any terminology matching)
- CNA-0340 [M] Clearly indicate when no matches found (example text: 'No matches found' in the results field).
- CNA-0350 [M] Provide a control allowing the user to retain the unencoded text in the form.
- CNA-0360 [R] Message instructs user to try a more general term, but if nothing appropriate, to activate the retain-unencoded-text control. CNA-0370 [R] Message says retaining unencoded text is not recommended (hazard mitigation also: warn that "entries are monitored for data quality").
- CNA-0380 [R] Message shown in same location as results would be.
- CNA-0390 [R] Retained unencoded text displayed in NORMAL weight (encoded = bold, unencoded = not bold; weight is the coded/uncoded signal).

**3.3.3 Entering additional details (attributes)**
- CNA-0400 [M] Mechanism to type attribute data associated with the clinical phrases.
- CNA-0410 [R] Auto-display associated attribute fields as soon as a matched term is selected. CNA-0420 [R] Display corresponding attribute fields plus an additional-text field.
- CNA-0430 [R] Slightly indent attributes and free-text field (hierarchical 'belonging').
- CNA-0440 [M] Labels for all attribute and additional-text fields. CNA-0450 [R] Labels as in-field prompt text.
- CNA-0460 [R] Important structured fields precede the additional-text field in tab order (duration/date before free text).
- CNA-0470 [R] When focus leaves attribute fields, they hide. CNA-0480 [R] On hide, show entered data to the RIGHT of the main concept. CNA-0490 [R] Wrap if it exceeds available width.
- CNA-0500 [R] Keyboard tab navigation forwards and backwards.
- Duration/dates: CNA-0510 [M] For Past Medical History, allow entry of duration and/or dates. CNA-0520 [R] Single entry field (label 'Duration and/or date(s)'). CNA-0530 [R] Suggested matches immediately below the field as user types; selectable. CNA-0540 [R] Return matches only when a minimum number of letters entered AND matches sufficiently similar (see Terminology Matching). CNA-0550 [R] NO drop-down button on the field (users clicked it without typing). CNA-0560 [R] Allow text descriptions ('past', 'last', 'for', 'during'). CNA-0570 [R] Recognise simple 'natural language' duration/date constructs, including approximate periods ('summer', 'Christmas', 'during childhood', 'past 10 years', '10 years ago'). CNA-0580 [R] Exact match between input and a suggested construct: auto-select it. CNA-0590 [R] Show a confirmation in formal structure: start date/time, end date/time, duration. CNA-0600 [R] Label categories 'From', 'To', 'For'. CNA-0610 [R] Confirmation displayed to the right of the input field. CNA-0620 [R] Mark approximate derived values with suffix "(approximate)" e.g. 'past 10 years' entered in 2009 gives start '1999 (approximate)'; show date at level of detail appropriate to input. CNA-0630 [R,L] Also provide a menu/similar control for selecting durations/dates.
- CNA-0640 [R] Collapsed (display) summary of attributes: arranged horizontally (wrapping), chunks separated by semicolon ';', calculated or encoded data in bold, show the calculated confirmation of duration/date (not the user's typed text). Do NOT label the additional text.
- Hazard mitigation: convert free-text durations to standard format where at least two of start date, end date, duration are recorded (so sorting by date works).
- Free text: CNA-0650 [M] Provide additional free-text field. CNA-0660 [M] If dedicated, label clearly e.g. 'Enter additional text'. CNA-0670 [M] Additional free-text field min two lines high (vertical scroll bar when content exceeds).
- Qualifiers: CNA-0680 [R] Where post-coordination possible between concept and qualifier text in additional text (e.g. 'severe'), offer these as potential encoded terms. CNA-0690 [R] Offer via a check box immediately adjacent (right) to the additional-text field, labelled with the term's preferred term/synonym.
- CNA-0700 [R] Other attributes where clinically appropriate (e.g. 'Current active problem', 'Laterality': left, right, both or neither). Research: if a 'Current problem' field is used, place it next to the duration/date field (not below the additional text field).
- CNA-0710 [M] Tab order matches left-to-right, top-to-bottom order of dialog.
- Keyboard model (note): arrow keys Up/Down move between list rows (and to the blank new-entry row); moving away with arrows collapses the open row. Each collapsed encoded row has two tab stops: (1) the encoded term, (2) the summary of entered information. ENTER on either (or click on row) opens it for editing. When open, two further tab stops: 'Date and/or duration', 'Enter additional text'. After last tab stop in row, Tab moves to the encoded term of the next row (or the search field).

**3.3.4 Editing and deleting entries (pre-commit only)**
- CNA-0720 [M] Allow editing of main concept, additional details, or both, if not yet saved. CNA-0730 [M] Each editable independently.
- CNA-0740/0750 [R] Hover over main concept / over summarised additional details: indicate clickable (e.g. yellow gradient shading on hover; Office 2007 convention).
- CNA-0760 [R] Clicking main concept reopens the result list for the ORIGINAL input text. CNA-0770 [R] Clicking summary opens dialog area populated with entered data.
- CNA-0780 [M] If user deletes the main concept text (e.g. backspace) while editing and leaves the field, treat as intended deletion of the entry.
- CNA-0790 [M] Provide a control for deleting an entry. CNA-0800 [R] Delete button to the right of the entry line. CNA-0810 [R] Deletes concept and its additional details together. CNA-0820 [R] On delete, show confirmation message with continue / cancel options (could be replaced by a well-designed, clearly visible undo system).
- Research: clinicians want to reorder the list (e.g. drag and drop) and sort by date (conclusion: "Provide a feature to reorder the summary list"; not a numbered guideline).

**4 Revealing and hiding sections of data**
- Requirements: UI can filter out optional fields until requested or triggered by data; users aware of what fields are accessible before accessing; allow hiding uncompleted optional fields; do not allow hiding completed fields unless summarised elsewhere; recorded data always visible by default.
- CNA-0830 [M] UI can limit visible fields to a proportion of the total. CNA-0850 [M] User must be able to access hidden fields. CNA-0840 [R] Visible control for revealing hidden fields. CNA-0860 [R] Distinguish reveal control from data entry controls. CNA-0870 [R] Shading around the control.
- CNA-0880 [R] Automatically reveal fields dependent on a data selection (e.g. 'CVS normal on examination' = 'No' reveals CVS detail fields). Both routes (dedicated control + data-triggered) needed.
- CNA-0890 [M] Communicate that hidden fields exist. CNA-0900 [R] Prompt/label for all reveal controls. CNA-0910 [R] Prominent, appropriate position. CNA-0920 [R] Prompt next to the control. Example: dedicated check box labelled 'Further details: CVS examination'; prompt next to the 'No' option saying it will open details. Bad example: a control labelled just 'Open'.
- CNA-0930 [R] Visible hide control (same control as reveal: the 'Further details' check box toggles open/closed; two states 'revealed, with option to hide' / 'hidden with option to reveal'). CNA-0940 [R] Distinct from data entry controls. CNA-0950 [R] Shading around hide control. CNA-0960 [R] Do NOT allow hiding fields that contain entered data. CNA-0970 [R] Disable the hide control when the section's fields contain data. A section does not auto-hide when the triggering selection is changed if it contains data. CNA-0980 [R] Prompt/label for hide controls; CNA-0990 prominent; CNA-1000 next to the control. CNA-1010 [R] Label summarises what the fields capture.
- Nested sections: CNA-1020 [R] Communicate which fields a reveal control opened. CNA-1030 [R] Common shading between reveal control and the fields it reveals. CNA-1040 [R] Shading light enough for good contrast (e.g. 25% grey screening). CNA-1050 [R] Consistent font sizes between fields and reveal label. Indentation indicates nesting.

**5 Required fields**
- CNA-1060 [M] Clear distinction between required and optional. CNA-1070 [M] Proactive visual indication of required fields.
- CNA-1080 [R] Red asterisk next to required fields. CNA-1090 [R] Per field, not per section. CNA-1110 [R] Asterisk immediately to the RIGHT of the field label (labels right-aligned left of fields make asterisks align vertically). CNA-1100 [M] If asterisks used, provide a key on the same page/dialog. CNA-1120 [M] Asterisks in consistent location relative to labels. CNA-1130 [R] Keep indication visible after the field is filled.
- ISO note: required fields positioned first in a group where appropriate.
- 'Missed' = required field empty and focus moved beyond it in tab order.
- CNA-1140 [R] Reactive indication of missed required fields. CNA-1150 [R] When focus moves to a field later than an empty required field, communicate it was missed. CNA-1160 [R] Yellow shading in missed required fields. CNA-1170 [R] Do not rely solely on shading. CNA-1180 [R] Non-visible (screen-reader) labels on missed fields stating they were missed. CNA-1190 [R] Non-modal message stating required field(s) missed. CNA-1200 [R] Message must not obstruct filling any field. CNA-1210 [R] Lists ALL missed required fields (grouped by form section heading). CNA-1220 [R] Message remains in view even when fields are not (e.g. right-hand side panel titled 'Required Fields'). CNA-1230 [R] Links in message scroll to the field. CNA-1240 [R] Heading expresses importance ('required', 'mandatory', 'recommended'). CNA-1250 [R] Do not hide required fields under tabs or collapsed views.
- Do NOT force completion of required fields before moving on; do not defer all validation to Submit.

**6 Displaying previous values** (numeric data only; non-numeric needs further testing)
- CNA-1260 [R] On focus into the field, show a number of most recent previous values, where they exist. CNA-1270 [R,L] None exist: show nothing. CNA-1280 [R] Remain shown while typing. CNA-1290 [R] Shown in a dialog on top of the form (pop-up/floating palette) while focus in field.
- CNA-1300 [R] Limit to an agreed number set by clinical authority and consistent (illustrations use 3).
- CNA-1310 [R] Vertical stack. CNA-1320 [R] Immediately ABOVE the field. CNA-1330 [R] Left-aligned with the digits in the entry field. CNA-1340 [R] Values in bold. CNA-1350 [R] Appropriate format and decimal places. CNA-1360 [R] Consistent order always. CNA-1370 [R] Values on far left of the dialog. CNA-1380 [R] Not as a column in the middle of contextual info. CNA-1390 [R,L] If directly above the field, ascending numerical order. CNA-1400 [R,L] If not possible above, immediately horizontally adjacent.
- CNA-1410 [R] Clearly label ('Previous values'). CNA-1420 [R,L] Different background colour from entry field. CNA-1430 [R,L] Low-saturation muted background (pastel); not overly prominent.
- CNA-1440 [M] Show the date of each previous value. CNA-1450 [M] If more than one value on the same day, show times. CNA-1460 [R] Show the unit. CNA-1470 [R] Unit shown once, next to the title label (e.g. column label).
- Provide access to a graphical/historical view (user requirement + research conclusion).

**7 Automatic calculations**
- CNA-1480 [M] Clear distinction between user-entered and system-calculated values. CNA-1490 [R] Calculated values in bold. CNA-1500 [R] Do NOT display calculated values in an editable field.
- CNA-1510 [R] Brief text explaining the meaning (e.g. clinical meaning of score).
- CNA-1520 [R] Access to details: contributing user-entered values; other contributing values; fields and headings where entered; scoring system applied; links to further details.
- CNA-1530 [R] Label on the calculated value that reveals details when in focus. CNA-1540 [R] Focusing label (e.g. click) opens a dialog over the form with details/links. CNA-1550 [R] Dialog labelled. CNA-1560 [R,L] Focus away closes dialog. CNA-1570 [R] Visually communicate the label reveals details. CNA-1580 [R] Use the app's link style (underline) on the label. CNA-1590 [R] Hover change on the label. CNA-1600 [R] Button opening further calculation details (e.g. 'Details of scoring'), auto-focused when dialog opens.
- CNA-1610 [R] In-line indications on contributing fields (e.g. 'out-of-normal-range' red circle icons).
- Missing values: CNA-1620 [R,L] Where appropriate show a partial score (not for e.g. BMI; clinical authority decides). CNA-1630 [M] If assumptions made about missing values, clearly communicate this. CNA-1640 [R] Indicate where values assumed (label 'partial score' / values missing; never show a partial score on its own). CNA-1650 [R] If score cannot be calculated and must be communicated, message plus link to details. CNA-1660/1670 [R] Dialog lists missing values and where their entry fields are in the form. Default substitution example: the 'normal' value in an early warning score.
- End date from start date + duration may be auto-calculated (prevents inconsistent triples).

**8 Adding free text**
- Requirements: allow free text on any fixed-choice/encoded field; display visibly near its item; delete only before commit; edit; delete free text if associated data item deleted; warn before deleting free text; keep free text if the data item value changes.
- CNA-1680 [M] Mechanism to add free text to a fixed-choice selection. CNA-1690 [R] Pop-up dialog with a single text field (alternative: inline field next to the control, becoming read-only text on tab-away). CNA-1700 [R] Control to clear the text inside the field.
- CNA-1710 [R] Reveal the add-free-text control when: focus on the fixed-choice control; on selecting from it; on mouse-over of control or its location. CNA-1720 [R] Do not show free-text field until after selection. CNA-1730 [R] Control is in normal tab order. CNA-1740 [R] Focus moves to the control immediately after selecting from a list box. CNA-1750 [R] Control hidden by default and when focus leaves control or associated field. Research: control must be sufficiently prominent.
- CNA-1760 [R] Multi-line free text min 2 lines high. CNA-1770 [R] No horizontal scroll bar. CNA-1780 [R] Vertical scroll bar when text exceeds visible area.
- CNA-1790 [R] Display free text immediately right of the fixed-choice control; CNA-1800 [R] else immediately below. CNA-1810 [M] Never hide entered free text while the associated control is in view. CNA-1820 [R] Faint marquee (border) surrounding both free text and its control.
- CNA-1830 [M] Allow editing until submitted to record. CNA-1840 [R] Click text to reopen entry control. CNA-1850 [R] Highlight on mouse-over (e.g. yellow).
- CNA-1860 [R] Where free text required/recommended, show the field in the form (not hidden). CNA-1870 [R] If contingent on a selection (e.g. 'other, please specify'), reveal the field when selected.

**9 General form design (standard controls)**
- Radio buttons: CNA-1880 [R] 2 to 7±2 items. CNA-1890 [M] Logical order (related grouped, most common first; else alphabetical). CNA-1900 [R] Same option sets in consistent order. CNA-1910 [R] Vertical alignment preferred. CNA-1920 [M] If selection dynamically shows controls, provide additional accessibility mitigation that further fields appeared. CNA-1930 [R] First option is the default. CNA-1940 [R] Avoid nesting radio buttons with radios/check boxes.
- Check boxes: CNA-1950 [M] Cleared state is unambiguous opposite of selected. CNA-1960 [R] Only for on/off or select/deselect. CNA-1970 [M] Independent unless interdependency clearly indicated. CNA-1980 [R] 10 or fewer. CNA-1990 [M] Logical order (as above). CNA-2000 [R] Vertical. CNA-2010 [M] Accessibility mitigation if dynamically revealing controls. CNA-2020 [M] Label every check box. No 'mixed'/indeterminate tri-state in healthcare (avoid ambiguity).
- Drop-down lists: CNA-2030 [M] Do NOT use a list box if missing an option has patient-safety implications; or few options and space for radios; or label not understood by all users and list used infrequently. CNA-2040 [M] Logical order (e.g. severity order, not alphabetical, where clinically logical). CNA-2050 [R] 'None' or 'All' options at the beginning regardless of sort order.
- Labels/prompts: CNA-2060 [R] Sentence-style capitalisation (except logos, acronyms, conventions). CNA-2070 [R] Similar label length in a check box group. CNA-2080 [R] Positive phrasing. CNA-2090 [R] Text prompts where needed for type of data. CNA-2100 [R] Prompt in italic grey. CNA-2110 [M] Prompt text not editable. CNA-2120 [R] If space, prompt immediately below or right of field. CNA-2130 [R] If space limited, in-field prompt. CNA-2140 [R] In-field prompt stays when focus enters. CNA-2150 [R] Removed when data entered/selected. CNA-2160 [R] No examples in in-field prompt.

### Accessibility points
- CNA-1180 non-visible labels for missed required fields; CNA-1170 do not rely on colour/shading alone.
- CNA-1920/2010 [M] announce dynamically revealed fields (e.g. ARIA live region [suggested]).
- Full keyboard operation: tab forward/back (CNA-0500), tab order follows visual order (CNA-0710), arrow-key row navigation, Enter to open a row; visible cursor (CNA-0030).
- Assumption A7: follow national/international accessibility standards (Design Guide Entry: Accessibility Principles).
- Light shading (25% grey) to preserve contrast; yellow missed-field shading chosen for contrast with dark text.

### Patient-safety rationale
- Encoded vs unencoded distinguished (bold vs normal) so readers know what is coded; retaining free text avoids sub-optimal term selection or omitted entries.
- Dates on previous values and approximation flags prevent misreading intervals and spurious precision.
- Fields with data cannot be hidden: hidden data could be missed on review.
- Partial scores must be labelled: a 'normal' partial EWS could falsely reassure.
- Non-blocking missed-field warnings avoid forms abandoned unsaved at Submit.
- List boxes banned where missing an option is a safety issue (hidden options).

## Noting with Graphics, v1.0 (15 Nov 2010) (notinggraphics)

- Purpose: guidance for a 'Noting with Graphics' module: annotating simple body diagrams (e.g. lungs, full body front/rear) with ready-made symbols, free-hand drawings and text-box annotations within clinical notes. Guideline prefix NwG- (IDs are stable but not sequential).
- Structure (terminology): module = **canvas** (container for graphic + annotations) + **toolbar** (drawing tools and function buttons). **Graphic** = one or more **images** (e.g. front and rear full-body). **Annotations** = **symbols** (ready-made or hand-drawn) + **text-boxes**. Each symbol gets an associated text-box connected by an **arrow** pointing to the symbol.
- Assumptions: one graphic loaded at a time; unlimited symbols and text-boxes; canvas always contains a graphic (never blank); saving, display in notes and re-editing of previous annotations handled by host app; minimum resolution 1024 x 768 px.
- Out of scope: 3D, X-rays/photos, complex graphics (operation notes), non-body graphics (drains, catheters), internal systems, which graphics/symbols are in libraries, cropping, user-created/uploaded graphics, rulers, zoom/resize, printing, advanced graphic navigation, exact toolbar layout/contents, SNOMED CT coding of findings/body sites.
- NOTE conformance discrepancies between body text and the end checklist: NwG-0018 (body Mandatory, checklist Recommended); NwG-0075 (body Recommended, checklist Mandatory); NwG-0076 (body Mandatory, checklist Recommended); NwG-0104 (body Recommended, checklist Mandatory); NwG-0067 body says "undo and redo ... at a minimum one level of redo and undo", checklist says "minimum 1 level of undo". Treat the stricter reading as safe default.

### Normative guidance

**Module**
- NwG-0112 [M] Loaded for creation/editing: show canvas AND toolbar.
- NwG-0113 [M] Loaded for viewing: show canvas only, no toolbar. NwG-0114 [M] View mode: no editing of any part.
- NwG-0016 [R] Place the module in the relevant clinical notes section (e.g. lungs graphic in respiratory section).
- NwG-0012 [M] Workflow order: display graphic first, then add symbols, then text.
- NwG-0107 [M] If module not fully on screen, host provides (page) scrolling to view entire area.
- NwG-0116 [M] Previously annotated graphic in view mode: annotations shown exactly as created (same location and size).

**Graphics**
- NwG-0001 [M] Simple, line-based image; no complex details, shaded or coloured areas.
- NwG-0002 [M] Greyscale only; no coloured graphics (colour-vision deficiency; no colour printing).
- NwG-0088 [M] Title on each displayed graphic where wrong one could be selected (e.g. left vs right hand).
- NwG-0008 [M] Orientation labels where orientation could be mixed up (e.g. 'front view' / 'back view').
- NwG-0004 [R] Age-appropriate graphic where context requires (adult, teenager, child, infant, baby). NwG-0087 [R] Sex-appropriate graphic (male/female).
- NwG-0003 [M] Displayed at a suitable size on open; no resize needed.
- NwG-0009 [M] No background lines or grids in the graphic (mistaken for body segments/quadrants).
- NwG-0006 [R] Multi-image graphics: leave space between images for text annotations referring to both.
- NwG-0010 [M] User cannot delete any part of the graphic.
- NwG-0011 [M] If graphic repositioning implemented, annotations move with it (retain location relative to the body).

**Canvas**
- NwG-0089 [M] No background lines/grids on canvas.
- NwG-0090 [M] Graphic displayed centrally on load.
- NwG-0005 [M] Sufficient room for text on both left and right sides. NwG-0007 [R] Do NOT leave room above or below for text.
- NwG-0021 [R] Only one graphic per canvas.
- NwG-0081 [M] Canvas background colour must not reduce readability/clarity of graphic or annotations.
- NwG-0099 [M] Canvas never empty/blank; always contains a graphic.
- NwG-0091 [M] Canvas sized to contain graphic with no scroll/zoom needed. NwG-0083 [M] Canvas grows in length automatically when more room needed for annotations.
- NwG-0100 [M] Graphic and annotations cannot be placed outside canvas (bounding container).
- NwG-0101 [M] No vertical scrolling within canvas. NwG-0102 [M] No horizontal scrolling within canvas.
- NwG-0108 [M] If canvas not fully on screen, show the 'look ahead' identifier (visual clue that content is off screen).

**Loading/searching for a graphic** (context dependent)
- NwG-0013 [M] Where context requires, auto-load canvas+graphic in the relevant notes location with no user action.
- NwG-0014 [M] Where context requires, offer option to load a graphic (e.g. 'Load Graphic' button).
- NwG-0023 [M] Where context requires, a way to choose and load the appropriate graphic.
- NwG-0018 [M/R] Where context allows, mechanism to remove the entire module.
- NwG-0024 [M] Where context requires, short list of commonly used graphics (primary). NwG-0026 [M] Secondary: simple text keyword search.
- NwG-0027 [R] Different selection/search methods visually distinct and separate.

**Symbol annotations**
- NwG-0028 [M] Free-hand drawing tools (e.g. pen tool).
- NwG-0029 [M] Ready-made symbol where hard to draw free-hand. NwG-0030 [M] Ready-made symbol where very common/regularly used.
- NwG-0032 [M] Ready-made symbols relevant to the loaded graphic only. NwG-0033 [M] Small set, limited to commonly used.
- NwG-0031 [M] Easy/intuitive adding (drag-and-drop, or single click places symbol).
- NwG-0111 [M] Ready-made symbols correctly sized for the graphic.
- NwG-0092 [M] A ready-made symbol for an exact location (users prefer 'X').
- NwG-0034 [M] Free-hand drawing or shading tool to indicate a region/spread-out area.
- NwG-0105 [M] Ready-made symbols visually distinguishable from all other canvas items (graphic, drawings, arrows). NwG-0106 [M] Hand-drawn symbols distinguishable from all other items.
- NwG-0035 [M] Free-hand drawing allowed outside graphic perimeter (within canvas). NwG-0036 [M] Ready-made symbols NOT allowed outside graphic perimeter.
- NwG-0040 [M] Symbols repositionable. NwG-0041 [M] Moving a symbol moves its text-box and arrow too.
- NwG-0093 [M] Delete any symbol. NwG-0094 [M] Deleting a symbol also deletes its text-box and arrow (they form one clinical finding).
- NwG-0038 [M] Symbols may overlap (e.g. graze within bruise). NwG-0039 [M] Overlapping symbols remain visually distinguishable (top does not fully obscure lower).
- NwG-0064 [M] Newly placed ready-made symbol shown in a bounding box (example: blue bounding box, drag handle). NwG-0065 [M] Bounding box disappears when dropped. NwG-0066 [M] Bounding box semi-transparent.

**Text annotations**
- NwG-0042 [M] All annotation text inside text-boxes.
- NwG-0055 [M] User can manually add a general-comment text-box not linked to a symbol.
- NwG-0043 [M] Adding a symbol auto-adds a text-box and an arrow pointing to the symbol. NwG-0045 [M] Auto-placed on the correct side of the graphic (nearest side), close to the symbol (avoid arrows crossing the graphic).
- NwG-0086 [M] Arrow line style visually distinct from all other line styles on canvas.
- NwG-0053 [R] Newly added text-box looks different from an edited one (prompts user to fill it).
- NwG-0046 [M] Text-box never placed on top of existing items (graphic, text-box, arrow, symbol).
- NwG-0110 [M] Text-boxes always displayed; never hidden/collapsed.
- NwG-0047 [M] New text-box gets cursor focus.
- NwG-0109 [M] Never truncate text-box text. NwG-0097 [M] No length limit. NwG-0050 [M] Text-box auto-grows as user types.
- NwG-0048 [R] Pre-populate with placeholder e.g. "Enter text here..." NwG-0115 [R] Placeholder visually differentiated (italics or different colour).
- NwG-0051 [R] Emphasis tool (bold or underline) for text.
- NwG-0052 [M] Delete text-boxes. NwG-0095 [M] Deleting a text-box deletes its arrow and associated symbol.
- NwG-0098 [M] Auto-added text-boxes NOT pre-populated with symbol details (name/location/description could imply a confirmed diagnosis).

**Toolbar**
- NwG-0067 [M] Undo (and redo per body text), minimum one level.
- NwG-0103 [M] Remove any individual item. NwG-0069 [M] Remove all items in one go (back to as-loaded state). NwG-0070 [M] 'Remove all' shows alert warning with Cancel / Continue.
- NwG-0075 [R/M] Group related tools.
- NwG-0076 [M/R] Every tool has a text label and a hover tooltip.
- NwG-0104 [R/M] Cursor changes to reflect the selected drawing tool.

### Accessibility points
- Greyscale graphics partly to avoid colour-vision problems (NwG-0002); canvas background must not reduce legibility (NwG-0081).
- Text labels + tooltips on tools (NwG-0076). Focus to new text-box (NwG-0047).
- [suggested] keyboard alternatives for placing/moving symbols and ARIA descriptions of annotations; the doc does not address keyboard drawing.

### Patient-safety rationale
- No grids: mistaken for drawn segments/quadrants.
- Titles/orientation labels: wrong-side (left/right hand) annotation.
- No scrolling in canvas and text never truncated/collapsed: annotations could be overlooked.
- Composite delete/move (symbol + text-box + arrow): no orphaned partial findings; symbols must stay attached to the body location.
- Do not auto-fill symbol details in text: implies confirmed diagnosis.
- Canvas never blank: prevents saving empty drawings to notes.

## Noting Using Templates, Design Consultation v1.0.0.0 (18 Dec 2009) (usingtemplates)

- Purpose: design consultation (NOT a guidance document: no numbered guidelines and no Mandatory/Recommended ratings; not CATR-released) on how clinicians find, open and complete clinical data-entry 'templates' (forms, sections, subsections; templates can be nested) during acute medical admission clerking (RCP headings). Nine themes. All points below are "design points" of the preferred current design: treat as **[design point]**, i.e. recommended-level at most. Rationale codes: CF clinical feedback, CUI prior CUI work, EP existing practice, PSA patient safety assessment, REQ requirement, UR user research, UX.
- Out of scope: patient-specific decision support, data previewing, display after initial entry, printing, workflow, saving, actual field layout.
- Headline findings: support searching AND browsing; UI may proactively offer templates (from encoded concepts or terms matched in free text); UI must handle repeated use of fields within a template.

### Design points

**Theme 1 Basic template searching** (applies to template search generally)
- Search entry field with progressive matching; matches on phrase similarity against template labels; 'fuzzy' matching (e.g. stem matching).
- Search by section heading as well as template title (title matching primary). Do NOT search for individual fields (no context; a separate 'Find' function could do it) unless a use case exists. Any size of template searchable.
- Results filtered by context (e.g. clinician's specialty/division/department; stage of treatment). Filtering INCLUDES generic templates (e.g. general medical admission form) rather than excluding them. Current filter label displayed as part of the filter adjustment control; clinician may switch the filter off to broaden results.
- Results ordered by phrase similarity. Only a maximum number of results shown by default, with a widget to reveal more.
- Search field located ABOVE the results list. Results in a vertical list. Template labels NOT truncated: wrap, with a slight indent on second and subsequent lines.
- Metadata (where it exists: section headings, version details, other context, last time data was entered into this template for this patient) shown in a fly-out on hover and/or keyboard focus of a result; handles variable lengths; metadata types in a consistent order; matched search words highlighted in the metadata.
- Distinguish 'suggested' matches (local policy promotion), visually prioritised.
- Synonym matching (managed by an authority), e.g. 'examination' or 'o/e' finds 'Observations and Findings'.
- 'No matches' message that also suggests ways to find what is sought.
- Browse within results: triangular/arrow icon expands a result's section structure; but only the WHOLE template can be selected from these results (not an individual section) in this division. Section matches displayed in the final division of the results.

**Theme 2 Section search** (incremental build-up of the admission note)
- Sections/subsections can be inserted in any order; clinician chooses which sections to open. Encoding not required before offering templates.
- Access methods: clicking into white space outside a section; a button at top of page; a key combination (for keyboard users); right-click context menu under consideration. Search marquee appears by default when the noting area is blank.
- Results progressively appear below the search entry; ordered primarily by word similarity; synonyms supported.
- Search text disappears / feature closes on selecting a template, clicking away, or pressing ESC. Feature closes after inserting a template; selected section appears in place of the search feature.
- On opening a section, show where it sits in the template structure. Section labels uniquely identifiable: composite of immediate section label and super-section label, 'breadcrumb' style (e.g. 'Observations and Findings > ...').
- Sections cannot be inserted into other sections unless the data structure allows it.

**Theme 3 Additional template search** (e.g. scores, risk calculators outside the core form)
- Same mechanism as core section search; core and additional results in the SAME list, ordered without bias between categories (splitting under separate headers made users miss the lower group).
- Additional results distinguished by an icon; fly-out may say it opens separately.
- Additional templates labelled on access; NOT inserted into admission form sections; opened separately (e.g. in a separate tab); system may link them to the triggering term.

**Theme 4 Abbreviation search**
- Predefined abbreviations searchable (e.g. 'PMH' finds 'Past Medical History'), treated like synonyms; abbreviation matches prioritised to the top of results. (User-defined abbreviations flagged as a safety question for future work.)

**Theme 5 SNOMED CT search trigger** (templates suggested from an encoded term, e.g. DVT suggests Wells' Score; 'arterial blood gas analysis' suggests ABG form)
- UI pushes related templates after a term is encoded, plus user can pull; more than one template per term allowed.
- Suggestions sufficiently prominent: in a right-hand side panel; not reliant on hover; a drop-down to select which term's templates to show (list builds up as terms are encoded/matched); not in page header/footer; options persist until another term is chosen/matched or focused; non-modal.
- Filtered by context; vertical text list; visually linked to the trigger term; handles 'no templates found'.
- Must not obstruct noting; no cumulative single list of all templates; do not disrupt scanning of matched-term list; not offered in-line.
- Emphasise suggestions are OPTIONAL (not diagnostic support; no obligation).
- Matching accounts for post-coordination / contextual wrappers (e.g. 'Family history of Cystic Fibrosis').
- Default templates may open automatically when only one template exists and completion is assumed (e.g. observables such as arterial blood gases); user can opt out by ignoring it and moving to next field.
- In the main noting area also: an icon next to the matched term indicates templates exist; hover/focus or an adjacent button reveals a floating drop-down; options shown to the RIGHT of the matched term to avoid obscuring other list items.

**Theme 6 Free text trigger**
- UI matches terms in free text (against a context-determined subset, e.g. SNOMED CT measurement concepts) without requiring encoding, and offers templates in the right-hand panel (same as Theme 5) and via tags overlaid on text with a floating drop-down on focus.
- Tags demarcate the WHOLE matched phrase (e.g. 'blood pressure', not 'pressure'). Tags must NOT be underlines. Tagging visually muted. Option to switch off free-text trigger mode. Clearly distinct from section search.
- After template entry either the original free text remains or text is replaced by template values.
- Fuzzy matching ('smokes' vs 'smoking').

**Theme 7 Browsing**
- Browse tree of the form's structure provided in addition to search; open by default (right-hand panel); default view shows top-level sections only; can be hidden and re-shown; sections opened by clicking. Provide a feature to open the full form in a single action.
- Future: indicate in the tree which sections have been addressed.

**Theme 8 Revisiting and adding templates**
- Search returns sections even if already open. UI does NOT open multiple instances of the same section: on reopening, it creates the section at the current point pre-populated with existing data and removes the original instance, with a warning message explaining what happened. Applies to sub/super-sections too (opening 'Vital signs' after 'Blood pressure' moves BP data into vital signs and closes the BP section).
- 'Add another' feature for multiple instances of permitted data types (e.g. ordinal/numerical measurement data such as vital signs): duplicates displayed adjacent; 'Add another' button prominent, adjacent to most recent instance; each set uniquely labelled with time of entry/measurement (not "first", "second"). On revisiting a section with populated measurement fields, may auto-open a fresh set.
- Warn if statements duplicated.

**Theme 9 Reordering**
- Default: sections in the order the user added them. Control to reorder to the standard RCP headings order; control to revert to the user's added order. Reordering does NOT reorder items within lists inside sections (e.g. PMH). Record keeps history of added order.

### Accessibility points
- Key combination to open section search for non-mouse users; metadata fly-out on keyboard focus as well as hover; ESC closes search; suggestions not reliant on hover.

### Patient-safety rationale
- Context filtering reduces choosing the wrong template; generic templates kept so they are not missed.
- No duplicate section instances (contradictory data, hard comparison).
- Breadcrumb labels: same field under different headings means different things.
- Suggestions marked optional: avoid treating them as decision support or completing unnecessary templates.
- Default templates for measurement observables: values recorded as structured data, not lost in free text.

## Display of Clinical Statements, Design Consultation v1.0.0.0 (18 Dec 2009) (clinicalstatements)

- Purpose: groundwork (design consultation, NOT guidance; no numbered/rated guidelines; not CATR-released) for consistent display of SNOMED CT encoded clinical statements structured per the NHS Logical Record Architecture (LRA) and RCP headings, at point of care. Two scenarios: (1) admissions clerking: single session, one clinician, grouped by common headings; (2) patient review: multiple sessions/clinicians, chronologically sorted. Points below are **[emerging theme]** (design recommendations from research), not mandatory.
- LRA recording patterns covered: Past medical history (PMH), Past surgical history (PSH), Family history (FH), Medication history (MH), Allergies/adverse reactions (AAR), History of current condition (HCC), Current medication (CM), System review (SR).
- Out of scope: post-coordination beyond LRA patterns, sealed envelopes/confidentiality, linkage of statements, input/encoding, coder views, multi-patient views, treatment patterns, payment encoding.
- Statement anatomy: main encoded term (e.g. COPD); additional free text (e.g. 'spiral', 'fell off ladder'); qualifiers and modifiers (laterality, negation); creator/author (may equal responsible clinician); session time (when recorded); observation time (clinically relevant time; both are intervals with start/end); location of session; pattern heading (or derived from axis modifier, e.g. subject = person in family); original free text verbatim. 'Unbound statement' = free text only, no SNOMED CT encoding.

### Design rules / emerging themes

**Assumptions treated as rules**
- Never show the full SNOMED CT expression or concept identifiers (numbers) at point of care.
- Hide default context-wrapper values: subject of record = patient, finding context = known present, current/past = current.
- Never use the phrase 'SNOMED CT' on screen (e.g. as a label).

**Encoded terms vs free text**
- Preferred approach 'Unified': encoded terms and additional free text merged into one readable phrase with no repetition, while indicating which parts were not encoded. Rejected: 'Separated' (encoded terms only, click to reveal free text: risky, unencoded critical info missed, e.g. 'decreasing exercise tolerance'; acceptable only as a validation screen for the author) and 'Repeated' (full text plus separate list of encoded terms: reading in two places, word repetition).
- Additional free text must be accessible, if not always immediately visible (e.g. 'Father died of MI aged 55': age is crucial).
- Use an interface terminology with 'friendly' labels for modifiers/qualifiers: e.g. 'No history of' instead of 'Known absent, past'. Never show raw SNOMED CT descriptions like 'Known absent'.
- Differentiate encoded terms vs free text by FONT SIZE (subtle; about 4 points difference worked; not prescriptive) and/or colour. Minimise inline formatting: do NOT use bold for encoded terms (encourages skim reading) and do not use inline italics (confusing). Note: this conflicts with the entry-time rule CNA-0300 (bold for selected matched term during entry) in the clinical noting guide; this doc concerns subsequent display.
- Optional user control to highlight encoded terms or add an 'encoded terms only' column (useful for validation; shows where encoding is missing).
- A visual separator between clinical term and additional free text is wanted, but no safe character identified: pipe '|' misread as '1'; dot misread as decimal point; comma and hyphen clash with characters inside SNOMED CT descriptions; bullets flagged risky (yet common). Separator remains an open question.
- Do not use icons (e.g. pen/pencil) merely to indicate free text. Icons/graphics are welcomed as shorthand for data (male/female, left/right, abnormal flags).

**Unbound statements**
- Show unencoded statements in full; never hide them behind a 'no terms' message.
- Flag lack of encoding rather than leaving blank: acceptable phrases 'No terms available', 'Not possible to code', 'No terms found' (preferred over 'No associated terms available', which implies duration/severity). Differentiate the message by colour/style from encoded terms. Consider a call to action 'Add encoding' / 'Add terms'.

**Sequence of text / axis modifiers**
- Negation must precede the clinical term: 'No cancer' / 'No history of cancer', never 'Cancer - known absent' or 'Cancer - no history of'. Where insertion is hard ('O/E - oedema - absent') future rules should render 'On examination - no oedema' or 'No oedema on examination'.
- Family history first: 'Family history of MI' not 'MI - Family History'. In mixed-pattern lists the context (pattern) must be shown at the START of each statement; in a single-pattern list under a clear 'Family History' heading it can be inferred and dropped.
- Allergy statements must lead with the allergy, before the agent (per CUI ADR display guidance) so 'Penicillin' is not skim-read as a current drug; medication history must not be confusable with allergy.
- Avoid the same negative appearing twice on one line (double-negative reading) without clear visual separation (e.g. a column).
- Related statements (e.g. father's death caused by IHD) should be visually linked [future work].

**People, dates, headings**
- Session time and observation time both needed but not shown simultaneously in the same view (confusing even with labels). Observation (clinically relevant) date more important than data-entry date.
- Date/author/people not in the primary/default view, especially history statements; show once at composition/session level (heading), not repeated per statement in single-session views; easily accessible per statement in multi-session views (detail view / addable column).
- When editing: show author/people, creation and last-modified date/time (audit).
- Make clear whether a displayed name is the author or the responsible clinician. Role and location accessible.
- Date granularity reflects accuracy at capture and no more; recent entries to the minute (acute settings need hours and minutes), older entries at day or month level (e.g. yesterday shows no time, today shows time); minimum ideally month and year if available; indicate approximate/estimated dates (avoid spurious accuracy). Follow CUI Date Display and Time Display guidance.
- Dates in the first (left-hand) column in tabular designs / to the left of the statement.
- Do not use generic temporal labels like 'Past' extracted from a heading; use full headings ('Past Medical History').
- Use headings to group statements of the same pattern and carry common attributes (pattern name, subject, date, author) so they are not repeated. Headings visually distinct (font size, colour); statements indented below headings; close line spacing within groups.
- Headings carrying context must remain visible when scrolling (sticky), or a statement can be taken out of context (e.g. family history read as patient's).
- Pattern name/context must be placed BEFORE clinical terms, not after or in a separate column.
- Multi-line-per-statement designs (e.g. search-engine style with date/time/person/location on a subsidiary line): use background banding or very clear paragraph spacing to avoid mis-association.

**Visual design: tables and columns**
- Maximise the statement column width; no more than two columns.
- Compound columns (several fields e.g. date, time, author, location in one column) acceptable for multi-pattern multi-session lists.
- Observable entities with values (examinations and findings, test results) presented as a TABLE with values in their own column, grouped under headings by body system (e.g. CVS, abdomen); flag abnormal/deviations (colour or icons); show normal readings and pending status.
- Banding helps scanning in tables and multi-line designs.

**Tasks**
- Editing: visually differentiate edit mode from display mode (border or colour around the statement being edited); label form fields (labels above fields); allow editing both encoding and free text, and clearing/removing a code; editing requires a specific user action (edit button, or rollover-revealed button) and confirmation before save (including delete) plus undo. Show author/date in edit screen. Concern: should users be able to edit others' statements (lock original entries from other sessions/users).
- 'View all fields' was not understood (do not use that label).
- View controls: users like adding fields into the view. Do not use a '+' expansion control to reveal only the encoded terms (users expect fuller detail/linked statements); '+' next to a negative statement is confusing; make expansion controls look like controls, not data.
- Task matrix: validating encoding (column designs, stacked repetition OK); acute care (verbose detail, unbound statements matter); reviewing history (clear context labels); known patient (flag new/changed items); examination results (scannable columns, abnormalities flagged, pending shown).

### Accessibility points
- Do not rely on inline bold/italic; use size + colour difference and structure (headings, indentation) [suggested: expose pattern/context and encoded/unencoded status to assistive tech via text, e.g. visually hidden labels].

### Patient-safety rationale
- Negation/family-history first: skim readers read only the first word.
- Hiding free text loses meaning not expressible in SNOMED CT.
- Allergy before agent: avoids reading the drug as current medication.
- Sticky context headings: prevents attributing family history to the patient.
- Date precision: avoids implying wrong timing or that a problem has ended.

## Care Pathways Conceptual Modelling, v1.0.0.0 Baseline (28 Mar 2007) (carepathways)

- Purpose: early conceptual exploration (wireframes; "illustrative only"; no numbered or rated guidelines; colour, pixels and widget sets explicitly left to implementation) of visualising a patient's care pathways in a clinical app: multiple parallel pathways, enchained sub-pathways, care boundaries, stage/bundle status, targets, key decisions and long-term cyclical conditions. All points are **[conceptual design]**, at most recommended; label everything in the library built from it as experimental.
- Concepts: a care pathway = set of **stages** of care; each stage has **bundles** of care activity containing **items**; pathway may specify a **goal**/expected outcome; once a stage is assigned to a patient it is a "care pathway in-use" recorded in the record; variance between proposed and actual care is auditable. **Phase** = major shift in patient state warranting a major change in care plan (e.g. Parkinson's: Maintenance, Complex, Palliative). **Boundary of care** = handover between disciplines, teams or geographical locations (often at junctions of sub-pathways). Pathways may be **paused** (e.g. due to Hospitalisation / Hospital Admission Event, automatically or manually) and restarted. A pathway is only 'closed' when the patient reaches the end, dies or moves to a completely different pathway (designs avoid a 'closed' concept).
- Rejected approaches: Gantt chart view (sequence and causality matter more than time; items forced off screen; hard to print; wastes width); separate circular-only view for long-term conditions; flowchart display of all logic; variant triggers ("if pathway Y added modify X") not supported by schema.

### Design goals and requirements
- Keep cognitive load low; avoid scroll bars; environment adapts to the user's focus; provide both high-level overview and low-level detail; structure matches HCP's mental view.
- Must answer: where is the patient on the pathway; how far from start; how far to end; how many pathways is the patient on; how did the patient arrive on this pathway; who is delivering care; team responsibility; national guidance driving the pathway; key time targets met/missed/will be missed; geographical location of care; how pathways join and the key decisions that routed the patient.
- View only the pathway of interest while others fade to background; communicate clearly when something goes wrong and where; communicate stages/bundles that went right.

### Visual vocabulary (elements an implementation must cover)
Pathway title; stage title; pathway status icon, colour, description; pathway minimise / maximise / 'mediumise' icons; boundary of care separator and title; boundary collapse/open widget; stage container (past, current, future); focus for stage; current stage indicator icon; bundle typography/iconography (past, completed, failed, future, unattempted, variant, warning); start of linear pathway; end of linear pathway; goal; outcome; crossing-care-boundary arrow; collapsed stage; collapsed multiple-stages container; stage status icon (success, failure, warning); stage mouse-over extra info; team icon; info icon; target time icon; time typography for actual, target, missed target; splitter drag pointer; group-stages begin/end icons and description (e.g. 'Day of Operation'); key decision point and typography; other routes / sub-pathway heading and arrow (with/without focus; past, current, unattempted); phases (cycles); milestones, reviews and care stages on cycles; spinner controls to advance/retard phases and cycles; 'You are here' indicator; 'cycle focus is here' indicator; cycle-repeats indicator with periodicity; collapsed mini cycle diagram.

### Wireframe design points
- Multiple pathways: title bar with pathway name; pathways stacked vertically; expand/collapse controls on the right (like window controls); collapsed pathway shows minimal state (e.g. name of current stage); abnormal-state pathways shown with contrast/colour change, icon, status (e.g. 'Paused') and reason (e.g. 'Hospitalisation'); show the number of pathways the patient is on; users can shrink but not entirely hide irrelevant pathways.
- Stages and time: pathway flows left to right; expected stage sequence left to right; linear pathways have distinct start and goal end points; stages are completed, current or future; show precursors (what led to the pathway / criteria met); show where and by whom care is delivered; show progress. Example styling: completed stage = status visually evident (e.g. black keyline); current stage = arrow, blue colour and keyline; future stage = pale grey; dotted line = boundary of care or sub-pathway.
- Care boundaries: arrows generally unnecessary for left-to-right flow but used where patient crosses a boundary (handover); enchained sub-pathways mark transfer of responsibility.
- Showing everything: all stages visible at all times; no scroll bars; instead shrink stages to thin strips or group adjacent stages into composite collapsed blocks; moving focus expands/collapses stages. Always show detail for at least THREE stages: what has happened, what is happening, what will happen next. Open stage shows all bundles; box depth indicates number of bundles. Distinguish 'Current' (where the patient is on the pathway) from 'Focus' (where the HCP last clicked or moved with stylus or arrow keys); keep stages either side of focus open.
- Met/missed targets (HCP time to complete procedure, not patient response): show actual time taken, target times (e.g. final stage), missed targets with distinct visual display; full details on mouse-over rather than always.
- Sub-pathways: user controls collapse (collapse chevrons close, open chevrons open); collapsed sub-pathway keeps visibility; split-pane boundary resizable (drag cursor on mouse-over); compound group (set of stages collapsed to single symbol); group stages that belong together (e.g. 'Day of Operation') as a non-interactive visible marker. Full details of a shrunk sub-pathway on mouse-over.
- Status of stages: colour, contrast AND symbols (not colour alone). Stage: tick = success; cross = failed (contains at least one failed bundle); warning icon. Bundles: tick = completed, cross = failed, bullet = unattempted/future (pale grey); highlighted bundle = focus / currently active. Stages labelled A, B, C ... in order. Team link shows pop-up of HCPs responsible for the stage's bundles. Current task in high contrast.
- Decision making: show only key decision points (triage/assessment); a flag symbol replaces the tick/cross on a bundle that is a key decision point. Arrows only when a stage contains a key decision or flow may pass to another (sub)pathway. Branch/action following a decision in bold capitals (emphasises it is not another bundle); single-line titles; simplest possible language.
- Long-term cycles: phases as concentric circles; each cycle has a review and care stages; same vocabulary as linear pathways but no start/goal symbols; diamond = decision or reassessment; circle = care stage; repeats arrow = no projected end; spinner controls access previous cycles of the same phase (showing completed stages/bundles) and other phases; future stages on the cycle shown as unattempted. Phases: active, visited, yet-to-be-visited visual states.
- Linked focus: moving focus in the linear diagram moves it in the cyclical diagram and vice versa.
- Cycle diagram collapsible (Hide / Show) to a mini version.
- Hospitalisation event marker on a paused long-term pathway, linking to the relevant pathway/records.

### Accessibility points
- Status not by colour alone (tick/cross/bullet/flag symbols plus contrast); focus movable by arrow keys or stylus; mouse-over details need a keyboard/focus equivalent [suggested].

### Patient-safety rationale
- Visible pathway status prevents repeating work of others; abnormal states and reasons shown even when collapsed so nothing relevant is hidden; context (past/current/next) never lost.

## Proposed controls

Shared types used below:
```ts
type CodedConcept = { conceptId: string; term: string; preferredTerm?: string; isCommon?: boolean };
type ClinicalDateValue = { start?: PartialDate; end?: PartialDate; durationText?: string; approximate?: boolean; sourceText: string };
type PartialDate = { year: number; month?: number; day?: number; hour?: number; minute?: number; approximate?: boolean };
type Requirement = 'required' | 'recommended' | 'optional';
```

### 1. `NoteEntryList` (summary list: PMH, Problem list, Procedures, Action list)
- Purpose: sequential entry of coded note entries with attributes (CNA-0010 to CNA-0820).
- Props: `entries: NoteEntry[]`; `onChange(entries)`; `searchTerms(query: string, signal: AbortSignal): Promise<{common: CodedConcept[]; all: CodedConcept[]}>`; `attributeFields?: AttributeFieldDef[]` (default: `[{kind:'dateDuration', label:'Duration and/or date(s)'}]`); `instructionText: string` (mandatory label, CNA-0130); `helperText?: string` (shown below field, low prominence, should include an example, CNA-0150 to 0170); `placeholder?: string` (grey italic, no examples); `minQueryLength?: number` (default 3 [suggested]); `busyDelayMs?: number` (default 1000, CNA-0090); `confirmDelete?: boolean` (default true, CNA-0820); `allowUnencoded?: boolean` (default true, CNA-0350); `unencodedWarning?: string` (default [suggested] "Try a more general term. If nothing is suitable, you can keep your text, but this is not recommended."); `committed?: boolean` (if true, read-only: edit/delete only pre-commit); `reorderable?: boolean` (default true [suggested from research]).
- `NoteEntry = { id; concept?: CodedConcept; originalText: string; encoded: boolean; dateValue?: ClinicalDateValue; additionalText?: string; qualifiers?: CodedConcept[]; attributes?: Record<string, unknown> }`.
- Behaviour: one search field at a time (except when editing an existing entry); 32-'M'-character min width (`width: 32ch` approx using M, CNA-0200), left aligned, shaded surround; progressive matching on input; results area below field with groups 'Common matches' above 'All matches' (labelled); search icon (magnifier, not a button); spinner replaces icon and 'Searching' shown in results after 1 s; 'No matches found' message in results area plus a 'Keep text' control; on select: term shown bold, never truncated (wraps), attribute area auto-expands indented with in-field labels, focus moves to first attribute; a new empty search row appears directly below. On blur of the row, attributes collapse to a summary to the right of the concept: chunks joined with '; ', encoded/calculated parts bold, date shown as calculated confirmation not source text, free text unlabelled, wrapping allowed. Unencoded entries shown normal weight.
- Keyboard: Up/Down arrows move between rows and to the blank new row (collapsing the open row); collapsed row tab stops = [term, summary]; Enter (or click) opens; open row adds tab stops 'Date and/or duration', 'Enter additional text'; Tab/Shift+Tab forward/back in visual order; Esc closes results [suggested].
- Editing: hover highlight (yellow gradient) on term and summary; click term reopens results for the original text; click summary reopens attribute area pre-filled; clearing the term text and leaving = delete entry. Delete button right of row deletes concept+details, with confirm (Continue/Cancel) or undo.
- Qualifier check boxes (CNA-0690) beside the additional text field when post-coordinable qualifiers matched (label = preferred term).
- States: empty, searching, results, no-matches, selected/expanded, collapsed, editing, confirming-delete, read-only (committed).

### 2. `TerminologySearchField` (reusable core of #1, also usable for single coded fields)
- Props: `value?: CodedConcept | {text: string; encoded: false}`; `onSelect`; `search`; `placeholder`; `instructionText`; `commonLabel='Common matches'`; `allLabel='All matches'`; `noMatchText='No matches found'`; `busyDelayMs=1000`; `widthCh=32`.
- Behaviour as above; ARIA combobox with listbox groups; live region announces result counts and 'Searching' [suggested].

### 3. `DateDurationInput` (natural-language duration/date field)
- Purpose: CNA-0510 to 0640. Props: `value?: ClinicalDateValue`; `onChange`; `referenceDate?: Date` (default today); `suggest?(text): ClinicalDateValue[]` (default uses `parseNaturalDuration`); `minChars=2` [suggested]; `label='Duration and/or date(s)'`; `showMenuPicker?: boolean` (CNA-0630, default false).
- Behaviour: free text input, NO drop-down button; suggestion list directly below while typing; exact match auto-selects; confirmation shown to the right: 'From <start>' 'To <end>' 'For <duration>' with '(approximate)' suffix on derived/approximate parts; date shown at precision of input (year only for 'past 10 years').

### 4. `RevealSection` (progressive disclosure of optional fields)
- Purpose: CNA-0830 to 1050. Props: `label: string` (e.g. 'Further details: CVS examination'); `open: boolean`; `onToggle`; `hasData: boolean` (disables hide, CNA-0970); `autoOpenTrigger?: boolean` (data-triggered reveal, CNA-0880); `level?: number` (nesting indent); `shade?: string` default light grey (about 25% grey screening).
- Behaviour: control is a labelled check box/toggle visually distinct from data fields with shading shared with the revealed fields; same control hides; cannot hide when containing data; does not auto-hide when triggering selection changes if data present; announces reveal to assistive tech (CNA-1920/2010).
- Companion `RevealPrompt`: inline text next to a choice option (e.g. beside 'No') saying it opens further details.

### 5. `RequiredFieldIndicator` + `MissedRequiredFieldsPanel` + `useRequiredFieldTracking`
- Purpose: CNA-1060 to 1250.
- `RequiredFieldIndicator`: red asterisk immediately right of label; `RequiredKey` component ("* Required field" key on same page, [M] when asterisks used).
- `useRequiredFieldTracking(fields: {id; label; section; requirement; isEmpty(): boolean; order: number}[])`: on focus of a field with order N, mark any required empty fields with order < N as `missed`; un-mark when filled.
- Missed fields: yellow background shading, plus visually hidden text "required field not completed" (aria-invalid/aria-describedby).
- `MissedRequiredFieldsPanel` props: `title` (e.g. 'Required Fields'; must express importance), `items` grouped by section heading, `onNavigate(id)` scroll+focus; non-modal, sticky/always in view, never blocks input. Never force completion before moving on; do not hide required fields in tabs/collapsed sections.

### 6. `PreviousValuesPopover` (for numeric entry fields)
- Purpose: CNA-1260 to 1470. Props: `values: {value: number; recordedAt: Date}[]`; `unit: string`; `maxCount: number` (set by clinical authority; illustrations 3); `decimals?: number`; `label='Previous values'`; `order: 'ascending-value' | 'chronological'` (default ascending-value when placed above field, CNA-1390); `historyHref?` / `onOpenChart?` (graph access).
- Behaviour: shown while the field has focus (including while typing); hidden if no values; positioned directly above the field (fallback: immediately adjacent horizontally); values bold, far left, left-aligned with the field's digits; each with date, plus time when >1 value same day (use `formatPreviousValueTimestamp`); unit once next to title; muted pastel background distinct from field; does not take focus.

### 7. `CalculatedValue` (scores and derived values: BMI, EWS, GCS, end date)
- Purpose: CNA-1480 to 1670. Props: `label: string` (link-styled, underlined); `value?: number | string`; `meaning?: string` (e.g. clinical meaning of score); `scoringSystem?: string`; `contributors: {label; value?; section; fieldId; source: 'form'|'record'; assumed?: boolean; outOfRange?: boolean}[]`; `status: 'complete' | 'partial' | 'cannotCalculate'`; `allowPartial?: boolean` (default false; authority decides); `detailsHref?` / `onOpenDetails` ('Details of scoring' button).
- Behaviour: value bold, rendered read-only text, never in an editable input; label hover changes style; click/focus opens labelled dialog over form listing contributing values with field + heading, scoring system, missing/assumed values and their locations (links), 'Details of scoring' button auto-focused; focus away closes. Partial: must show a clear label e.g. "Partial score: values missing" [suggested wording]; cannot-calc: message with link to details.
- Companion `OutOfRangeMarker` in-line icon (example red circle) on contributing fields, with text alternative.

### 8. `FreeTextAnnotation` (add free text to a fixed-choice control)
- Purpose: CNA-1680 to 1870. Props: `value?: string`; `onChange`; `mode: 'popup' | 'inline'`; `addLabel` [suggested 'Add text']; `required?: boolean | 'recommended'` (then field always visible); `revealWhen?: boolean` ('other, please specify').
- Behaviour: 'add text' control appears on focus of, selection in, or hover over its fixed-choice control; in tab order; focus moves to it after list-box selection; hidden otherwise; must be prominent. Editor: single multi-line field min 2 lines, no horizontal scroll, vertical scroll on overflow, clear button. Display: text right of control (else below), within faint marquee around both; never hidden while control in view; click to edit; yellow hover highlight. Deleting/clearing the data item deletes text after warning; changing the value keeps text.

### 9. Standard choice controls: `RadioGroup`, `CheckboxGroup`, `ClinicalSelect`
- `RadioGroup` props: `options` (2 to 9, dev warning beyond 7±2), `orientation='vertical'`, `defaultToFirst=true` (CNA-1930), `revealsFields?` (announce). Consistent option order across identical sets.
- `CheckboxGroup`: every box labelled; no indeterminate/mixed state (prop not offered); dev warning above 10 options.
- `ClinicalSelect`: dev-time guard docs per CNA-2030 (do not use where a missed option is a safety issue, or few options fit as radios); 'None'/'All' pinned first.
- `FieldLabel`/`FieldPrompt`: sentence case; prompt grey italic, non-editable; below/right of field if space, else in-field placeholder that persists on focus and disappears on input; no examples in in-field prompts.

### 10. `AnnotatedGraphicCanvas` (Noting with Graphics) with `GraphicToolbar`, `GraphicPicker`
- Props: `graphic: {id; title: string; orientationLabels?: string[]; images: {src; label}[]; ageGroup?; sex?}` (required, never blank); `annotations: Annotation[]`; `onChange`; `mode: 'edit' | 'view'`; `symbols: ReadyMadeSymbol[]` (small set relevant to graphic, includes exact-location 'X'); `undoDepth?: number` (min 1).
- `Annotation = {id; kind: 'symbol'|'freehand'|'region'|'text'; symbolId?; path?; position (relative to graphic); textBoxId?; text?; emphasis?: ('bold'|'underline')[]; isNew?: boolean}`; symbol/freehand annotations link 1:1 to a text-box and arrow.
- Behaviour: view mode hides toolbar and is read-only, rendering annotations at same positions/sizes; graphic centred, greyscale line art, no grid; side margins left and right for text, none above/below; canvas no internal scroll, auto-grows in height; nothing outside canvas; ready-made symbols only inside graphic perimeter; freehand allowed anywhere in canvas; new symbol in semi-transparent bounding box until dropped; auto text-box + distinct-style arrow placed on nearest side, never overlapping items, focused, placeholder "Enter text here..." (italic/different colour), auto-grows, never truncated, no length limit, not pre-filled with symbol details; move/delete symbol or text-box moves/deletes the whole finding group; overlapping symbols remain distinguishable; 'Remove all' with Cancel/Continue alert; tools labelled with tooltips, grouped; cursor reflects drawing tool; 'look ahead' indicator when canvas extends off screen.
- `GraphicPicker`: short list of common graphics plus separate keyword search; option to auto-load per context and to remove the module.

### 11. `TemplateSearch` / `SectionSearch` / `TemplateBrowseTree` / `TemplateSuggestionsPanel` / `RepeatableFieldGroup` / `SectionOrderToggle` (from consultation; experimental)
- `TemplateSearch` props: `search(query, filter)`; `filter: {label; enabled}` (shown in filter control, can switch off); `maxResults` default (e.g. 10 [suggested]) + 'Show more'; result item `{title; isSuggested; isAdditional (icon); metadata?; sections?}`; fly-out metadata on hover AND focus with matched words highlighted; titles wrap with hanging indent, never truncated; 'no matches' message with suggestions; synonyms/abbreviations (abbreviation matches first).
- `SectionSearch`: opened by clicking white space, a top button, or a key combination [suggested Ctrl+Shift+H, not specified]; closes on select/click away/Esc; inserted section gets breadcrumb label 'Super-section > Section'; duplicate open = move existing data into the new instance and remove the old with an explanatory message.
- `TemplateSuggestionsPanel`: right-hand, non-modal, persistent per selected trigger term, drop-down of trigger terms, vertical list, marked optional, linked to trigger term; in-text tag (not underline, muted) spanning the whole matched phrase with floating drop-down on focus; option to turn off free-text triggering.
- `TemplateBrowseTree`: right panel, open by default, top-level only, hideable; 'Open full form' action.
- `RepeatableFieldGroup`: 'Add another' adjacent to most recent instance; instances adjacent, labelled with time of entry/measurement.
- `SectionOrderToggle`: 'Standard order' (RCP) vs 'Order added'; never reorders list items inside sections.

### 12. `ClinicalStatement` / `StatementList` / `StatementGroupHeading` (display; experimental)
- `ClinicalStatement` props: `statement: {pattern: 'PMH'|'PSH'|'FH'|'MH'|'AAR'|'HCC'|'CM'|'SR'|string; subject?: 'patient'|'family'|...; negated?: boolean; findingContext?; concepts: {term; friendlyLabel?}[]; segments: ({type:'coded'; text} | {type:'free'; text})[]; observationTime?: PartialDate; sessionTime?: Date; author?; responsibleClinician?; location?}`; `showContextPrefix: boolean` (true in mixed-pattern lists); `highlightCoded?: boolean` (user toggle, default false); `codedFontDelta?: number` (default ~4pt larger/smaller [design suggests about 4 points difference]); `unboundLabel='No terms available'`; `onAddEncoding?`.
- Rendering rules: context prefix and negation BEFORE the clinical term ('Family history of MI', 'No history of cancer'); allergy before agent; never show concept IDs, 'SNOMED CT', or default wrapper values; unified text without word repetition; no bold/italic for coded parts; unbound statements shown in full plus a flag; date at the left, at captured precision, approximate flagged.
- `StatementList` props: `grouping: 'pattern' | 'chronological'`; sticky group headings carrying common attributes (pattern, subject, session date, author once per composition); max two columns; banding for multi-line items; optional 'Coded terms' column toggle; editing via explicit Edit button, edit mode with border/colour, labelled fields above, author/created/modified shown, confirm before save/delete, undo.
- `ObservationTable`: values in own column, grouped by body system heading, abnormal flag icon + colour, pending status.

### 13. `CarePathwayView` family (experimental, from conceptual model)
- `CarePathwayStack` props: `pathways: Pathway[]`; `expandedIds`; `onToggle`; shows count of pathways; abnormal ones show status + reason even collapsed; window-style expand/collapse/'mediumise' on right.
- `Pathway = {id; title; status: 'active'|'paused'|'completed'|'abnormal'; statusReason?; nationalGuidance?; start?; goal?; outcome?; stages: Stage[]; subPathways?; boundaries?: {afterStageId; label}[]; phases?: Phase[]}`; `Stage = {id; code: 'A'|'B'|...; title; state: 'completed'|'current'|'future'; status?: 'success'|'failed'|'warning'; team?; targetTime?; actualTime?; targetMissed?: boolean; bundles: {id; title; state: 'completed'|'failed'|'unattempted'|'future'|'variant'|'warning'|'active'; isKeyDecision?: boolean}[]; groupLabel?: string}`.
- `PathwayTimeline` behaviour: left-to-right stages; start and goal markers; never scrolls: collapse distant stages to strips/composite blocks, always show at least previous, current and next stage in detail; distinct 'current' (arrow + keyline) and 'focus' (keyboard arrow keys/click); status symbols tick/cross/bullet/flag plus colour; boundary separators (dotted) with handover arrow; sub-pathway chevrons; resizable split; key decision branches in bold capitals; target/actual/missed time typography; details on hover and focus.
- `CarePathwayCycle`: concentric phase rings, circle stages, diamond reviews, repeats arrow with periodicity, spinners for previous cycles/phases, linked focus with the timeline, collapsible to mini diagram.

### Utility functions
- `matchGroups(results, isCommon)`: split into common (first, labelled) and all; preserve engine ranking within each.
- `shouldShowBusy(elapsedMs, thresholdMs = 1000)`: true when elapsed > threshold (CNA-0090).
- `formatEntrySummary(entry): string[]` chunks: [dateConfirmation (bold, calculated), coded qualifiers (bold), additionalText (plain)], joined with '; ' (CNA-0640).
- `parseNaturalDuration(text, ref = today): ClinicalDateValue[]`: recognise 'past|last|for N (day|week|month|year)s' gives start = ref minus N units, end = ref (present), duration N units, start marked approximate (e.g. 2009 'past 10 years' gives From 1999 (approximate)); 'N years ago' gives a single date approximate; 'since YYYY' / 'from YYYY' gives start YYYY; 'YYYY' / 'Mmm-YYYY' gives date at that precision; 'during childhood' / seasons / 'Christmas' gives approximate period [authority-defined lexicon]. Precision of the output date = precision implied by input (years only for year-based durations). Exact text match against a suggestion auto-selects. Normalise to standard form when at least two of start, end, duration are known; derive the third (end = start + duration) [CNA hazard mitigation; derivation rule from section 7 intro].
- `formatClinicalDate(d: PartialDate)`: render at stored precision only, append ' (approximate)' when approximate. Exact format deferred to CUI Date Display guidance (owned by another group); the noting doc's own examples use 'March-2008' (month-year) and '1987 (approx)'.
- `formatPreviousValueTimestamp(values)`: show date for each; show time (HH:mm) for any value sharing a calendar day with another (CNA-1450).
- `orderPreviousValues(values, placement)`: ascending numeric value when placed above field; else consistent chronological order [CNA-1360/1390].
- `computeMissedRequired(fields, focusedOrder)`: required && empty && order < focusedOrder.
- `canHideSection(section)`: false if any field in it has data (CNA-0960).
- `calculateScore(def, inputs, {allowPartial})`: returns `{value, status: 'complete'|'partial'|'cannotCalculate', assumed: fieldId[], missing: fieldId[]}`; substitute 'normal' defaults only when allowPartial; never return a partial value without status 'partial'.
- `orderOptions(options, {logicalOrder?, frequency?})`: logical/clinical order first, else most common first, else alphabetical; 'None'/'All' pinned to the start (CNA-1890/2040/2050).
- `toSentenceCase(label, preserve: string[])` for labels (CNA-2060).
- `renderStatementText(statement, {inMixedList})`: prefix context ('Family history of'), place negation friendly label before term ('No history of'), drop default wrapper values, merge coded + free segments without duplicate words; map raw SNOMED modifier descriptions via an interface-terminology table (e.g. 'Known absent' to 'No', 'Known absent, past' to 'No history of').
- `dateGranularityFor(timestamp, now)`: [suggested] today shows time to minute; older shows date; much older shows month-year; never more precise than captured.
- `nearestSide(symbolX, graphicCentreX): 'left'|'right'` for auto text-box placement (NwG-0045); `clampToCanvas`, `isInsideGraphic(point, mask)` for NwG-0036/0100.
- `pathwayVisibleStages(stages, currentIdx, focusIdx, capacity)`: always keep current-1, current, current+1 and focus neighbours expanded; collapse others to strips, then merge runs into composite blocks if over capacity.
