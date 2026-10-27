# Timeline view and displaying graphs

Conformance key: **[M]** = Mandatory, **[R]** = Recommended. Evidence rating in brackets after it (H/M/L). Neither document specifies hex colours, pixel sizes for symbols or exact fonts: both state stylistic choices in illustrations (colours, fonts, icons) are illustrative only unless a guideline says otherwise. Anything marked "[suggested]" is a modern addition, not from the source.

---

## Timeline View – User Interface Design Guidance v1.0.0.0 (timelineview.txt)

### Purpose
Guidance for a Timeline View: plotting clinical record entries (events with no duration, known-duration and open-duration items, e.g. prescriptions, problems) against a shared horizontal time axis, with labels, row identifiers, sections, levels of detail, related event sets (administrations, pharmacy reviews, INR), embedded observation graphs, and time navigation. Guideline IDs TLN-0010 to TLN-1170. Read with Displaying Graphs and Tables (GTAB) and the Medications Management guides (Drug Administration, Medication Line, Medications List).

### Scope and assumptions relevant to implementation
- Time is on the x-axis only (multiple time axes out of scope). Linear time only (non-linear/logarithmic out of scope).
- Out of scope: grouping/sorting/filtering entries, collapse/expand control appearance, default time window, defaults for controls, representing absence of data, representing uncertainty ("sometime between Jan and Mar 2008"), linking controls, pop-up "more info" design.
- A3: minimum screen resolution 1024 x 768 px; example layouts are designed for 1024 wide by 768 high.
- A4: medications are shown using intended start and end dates of the course.
- A5: all timeline data must also be accessible in other views (timeline is never the only view).
- A2 (performance hints, not guidance): cache data adjacent to the viewed period; when navigating beyond adjacent periods, only update the viewing area once the user completes the action.
- Usage examples use medications data; row identity at drug-name level (all paracetamol prescriptions on one row) is NOT CUI guidance and may be deemed unsafe by a clinical authority.
- Implementers must do a context-specific patient safety risk assessment (see 5.2.1, 6.2.3, 7.2.1).

### Normative guidance

**3.2.1 Timeline View structure (layout)**
- TLN-0010 [R](M): Put all global timeline navigation controls (time range selection, main navigation controls) close together.
- TLN-0020 [R](M): Main timeline navigation area directly above the timeline viewing area.
- TLN-0030 [R](M): Viewing area dynamically resizes to fill available space when the window resizes.
- Correct layout (usage example): patient banner across the top of the window; tabbed options to select the current view (e.g. a "Timeline" tab); global controls co-located immediately above the viewing area; viewing area fills the remainder. Missing patient banner is an explicit incorrect example (risk of attributing data to the wrong patient).

**4.2.1 Canvas and time markers** (use with GTAB time-axis guidance)
- TLN-0040 [M](H): Divide the canvas into visually marked horizontal rows spanning the full canvas width.
- TLN-0050 [R](M): No gradient fills on canvas background (including time-of-day graduated fills).
- TLN-0060 [R](M): No watermarks or decorative patterns on the canvas.
- TLN-0070 [M](M): Delineate rows using exactly **two alternating background colours** (not three or four: users infer meaning).
- TLN-0080 [M](M): Row colours must not detract from legibility of elements (including gridlines) and must be unlikely to have semantic meaning; muted, not strong.
- TLN-0090 [R](M): One of the two alternating row colours should be **white**.
- TLN-0100 [R](M): Top and bottom margins within each row to separate entries from adjacent rows.
- TLN-0110 [M](M): Time is proportional: each time interval (e.g. one hour) is the same distance (e.g. 10 mm).
- TLN-0120 [M](M): One time axis for the whole viewing area.
- TLN-0130 [M](M): Mark time intervals (hour, day, week marks) across **both top and bottom** of the viewing area, with vertical gridlines between each pair of markers.
- TLN-0140 [R](M): Time gridlines thin and in a colour that does not reduce legibility. Do NOT use alternating coloured columns to show time intervals (incorrect example).
- TLN-0150 [R](M): Group intervals into higher units (e.g. day start) with more prominent markings and gridlines.

**4.2.2 Past, now, future**
- TLN-0160 [M](M): Prominent vertical "now" line across the viewing area at current time, with indicators at **both ends** of the line, beyond the viewing area, close to the time markers (i.e. on the top and bottom time axes).
- TLN-0170 [M](M): Past and future use different background colours or different shades of the same colour.
- TLN-0180 [R](M): Past has no additional background colour over its row banding (white-based). The **future** gets the subtle darker shade.
- Do not change entry styles between past and future (see TLN-0370).

**5.2.1 Generic**
- TLN-0190 [R](M): Provide navigation from an item (e.g. a prescription) to alternative views (e.g. drug administration view) and back.
- Unmitigated risks MTI182/MTI183: row identity set too low or too high a level of detail and not easily changeable; suppliers must mitigate.

**5.2.2 Entries with no significant duration (point events)**
Examples: once-only prescriptions (other than once-only infusions) of no significant duration (tablets), general notes (e.g. "past history of appendicectomy").
- TLN-0210 [M](M): Same colour scheme for all no-duration entries (do not colour by type/category).
- TLN-0220 [M](M): Avoid colours with unintended meaning (red/green = unsafe/safe, stop/go).
- TLN-0230 [M](M): Same symbol for all no-duration entries regardless of data type.
- TLN-0240 [M](M): Same symbol size for all entries regardless of time period chosen.
- TLN-0250 [M](H): Symbol visually aligns with the time axis.
- TLN-0260 [R](M): Symbol symmetrical about its vertical axis.
- TLN-0270 [R](M): Symbol's centre point clearly indicated.
- TLN-0280 [R](M): Centre point aligned with the represented time.
- TLN-0290 [M](M): Once-only ("stat") medication with an administration of no significant duration (tablet, injection) is a no-duration entry aligned to the **planned administration time**. A prescription needing more than one administration must NOT be a no-duration entry.
- Illustrated correct symbol: a blue downward-pointing arrowhead (illustrative only).

**5.2.3 Entries with known duration**
Examples: infusion over 12 hours, seven-day course, condition recorded then resolved (e.g. "infected foot").
- TLN-0300 [M](H): Same start and end symbols and duration line style (incl. colour) for all known-duration entries (do not vary by data type).
- TLN-0310 [M](M): Duration is a **horizontal unbroken line**, thick enough and coloured to stand out from the background, **no fill colour** (no filled bars, no dotted/dashed, not thin).
- TLN-0320 [M](M): Start and end symbols are different from each other; symbols and line form one continuous shape.
- TLN-0330 [M](H): Start/end symbols clearly interrupt the line so two entries placed end-to-end show a noticeable discontinuity.
- TLN-0340 [R](M): Start and end symbols extend downwards from the duration line.
- TLN-0350 [M](M): Start symbol's **left edge** aligns with the start time.
- TLN-0360 [M](M): End symbol's **right edge** aligns with the end time. (Do not centre symbols on the time: adjacent entries would overlap and imply a series.)
- TLN-0370 [R](M): Do not change style of entries or labels between past and future (no dashed future lines).
- TLN-0380 [M](H): A prescription requiring more than one administration is a known-duration entry: start symbol at first planned administration time, end symbol at last planned administration time.
- TLN-0390 [R](M): Once-only ("stat") medication with significant duration (e.g. infusion) is a known-duration entry from planned start to planned end of administration.

**5.2.4 Entries with open duration** (end unknown/indeterminate/infinite: current conditions, "ongoing" prescriptions, amputations, congenital conditions)
- TLN-0400 [M](M): Same start symbol and line as known duration.
- TLN-0410 [M](M): Line extends to the right margin of the viewing area.
- TLN-0420 [R](L): No symbol at the right-hand end (no symbol interrupting the line before or at the right margin).
- TLN-0430 [M](H): "Ongoing" prescription = open-duration entry; start symbol at first planned administration time.

**5.2.5 Timeline entry labels**
- TLN-0440 [M](M): Label positioned **above** its entry (not below, not centred under/over line).
- TLN-0450 [M](M): Vertical leader line from the label's **left edge** down to the entry.
- TLN-0460 [M](M): Enough vertical space between label top and the row above to avoid mis-association.
- TLN-0470 [M](M): Duration entries with start in view: label left edge aligned to the start symbol (not centred on the line: implies mid-point significance).
- TLN-0480 [M](M): Duration entries whose start is off the left edge: label left edge aligned to the **left edge of the viewing area** (label "sticks" as you scroll). If a no-duration entry scrolls out of view, its label is not displayed.
- TLN-0490 [M](M): No-duration entry: label left edge aligned to the time of occurrence.
- TLN-0500 [M](M): Label running past the right edge: shorten to fit, show a truncation symbol, provide an alternative means (e.g. tooltip) to see full text. Do NOT wrap label text onto multiple lines; do NOT shift the label left to right-align with the viewport edge.
- TLN-0510 [R](M): Use an **ellipsis** symbol to show truncation (example shows a red ellipsis; colour illustrative).
- TLN-0520 [R](M): Shared row, overlapping labels with **identical** text: hide the obscured labels but keep their vertical leader lines up to (not over) the visible label. (Overlap is from the left: earlier label wins.) Do not let labels truncate each other.
- TLN-0530 [R](M): Shared row, overlapping labels with **different** text: avoid overlap, e.g. stack labels at different heights directly above entries and extend leader lines. Never hide non-identical labels (user may assume first label's dose applies to later entries).
- TLN-0540 [M](H): Apply clinical-authority context-specific rules for truncation and overlap (e.g. inpatient may forbid truncating full prescription details).
- TLN-0550 [M](H): **Never partially display a medication name.** If the name cannot fit, remove it entirely and show only the truncation symbol.
- TLN-0560 [M](M): Never partially display individual drug detail fields (dose, route, frequency): truncate at field boundaries only.
- TLN-0570 [M](H): Must provide facility to show full prescription details in labels (format per Medication Line guidance).
- TLN-0580 [R](H): May additionally offer a drug-name-only label option.
- TLN-0590 [M](H): When full details are shown, complete label text must be displayed (no truncation or hiding) except at the right edge of the viewing area.
- TLN-0600 [M](H): If short labels (drug name only) are active, full prescription details must be available per entry via an alternative mechanism (hover, higher level of detail).

**5.2.6 Row identifier cells** (static left column)
- TLN-0610 [M](M): Facility to show row identifier cells down the left edge of the viewing area, aligned with and using the background colour of their rows.
- TLN-0620 [M](M): Identifier text at the **top left** of the cell.
- TLN-0630 [M](M): If a row-level "alternative label display avoiding overlap" option exists, its control lives in the row identifier cell.
- TLN-0640 [M](M): Identifier text clearly related to entry labels: same text, or text representing all entries (e.g. "co-amoxiclav", "insulin").
- TLN-0650 [M](M): If entry labels can be hidden: when entry labels hidden, identifiers must show; when identifiers hidden, entry labels must show. Never both hidden.
- TLN-0660 [R](M): Option to show/hide the identifier column. On collapse, widen the viewing area but **keep the same visible time period** (do not extend time span).
- TLN-0670 [R](M): Row-level options at the **top right** of each identifier cell. When the column is collapsed, provide alternative access (e.g. narrow collapsed cell with a row menu icon opening a pop-up containing the row identifier text and row options).

**5.2.7 Crowded entries and labels**
- TLN-0680 [M](H): Do not change symbol size or line thickness when the time period changes.
- TLN-0690 [M](H): Open/known-duration entries on a shared row crowded so symbols overlap/are indistinguishable: replace symbols with vertical lines of the same height.
- TLN-0700 [M](H): Same for no-duration entries: replace symbols with same-height vertical lines.
- TLN-0710 [R](M): If still indistinguishable as vertical lines, replace with an indication symbol (example shows a count of entries) plus a hover message recommending viewing at a more granular level. Indicator is shown in-context at the location of crowding (MTI173).

**5.2.8 Graphs within a timeline** (use with GTAB)
- TLN-0720 [R](M): Do not mix timeline entries and graphs in the same section.
- TLN-0730 [M](M): Multiple graphs each in their own row, with a prominent horizontal dividing line between rows.
- TLN-0740 [M](M): Persist graph furniture (title, value scale, horizontal gridlines) even when the period has no data.
- TLN-0750 [M](M): Graphs use the same horizontal time axis as the canvas.
- TLN-0760 [M](M): Graph label in the row identifier cell.
- TLN-0770 [M](M): Vertical value scale on the left edge of the viewing area (immediately right of the row identifier cells), always in view even if identifier cells hidden.
- TLN-0780 [M](M): If identifier cells hidden, show label info next to the last visible data point at the right side of the viewing area.
- TLN-0790 [M](M): Horizontal value gridlines extend across the full viewing-area width aligned to the value scale. Horizontal gridlines are only used for graphs.
- TLN-0840 [R](M): Graphs in a dedicated section (e.g. "Observations").

**6.2.1 Timeline sections**
- TLN-0800 [M](M): Facility to divide viewing area horizontally into sections; user can vertically resize each section.
- TLN-0810 [M](H): Section title bar at top of each section spanning its width.
- TLN-0820 [M](H): Expand/collapse control on the **left** of the title bar. Collapsing keeps the title bar, hides the level-of-detail control and related-event options, and proportionately resizes other sections to fill space.
- TLN-0830 [M](M): Complete medication set for a patient goes in a dedicated section. Example section titles: "Problems", "Medications", "Observations".

**6.2.2 Out-of-view entries (vertical)**
- TLN-0850 [M](M): When rows with entries in the chosen period are scrolled out of view above/below, show direction symbols (e.g. up/down arrows) near the upper and lower section borders, off the viewing area (in the identifier column side, opposite the scrollbar) so they never obscure entries.
- TLN-0860 [R](M): Show the count of rows with out-of-view entries next to each arrow (e.g. 4 above, 2 below).
- TLN-0870 [M](H): Show the total count of rows with out-of-view entries in the section title bar. (Exact wording not specified.)

**6.2.3 Levels of detail (LoD)**
- TLN-0880 [M](M): Options to vary detail per section.
- TLN-0890 [M](M): Each section's LoD independent.
- TLN-0900 [R](M): Top/lowest LoD "thumbnail": thin horizontal lines per entry with no vertical gap, no label text.
- TLN-0910 [R](L): LoD control on the **right** of the section title bar.
- TLN-0920 [M](H): At any LoD except thumbnail, always show identifying text (entry labels, row identifiers, or both).
- TLN-0930 [M](M): Default LoD per data type set by clinical-authority rules.
- Example four levels: 1 thumbnail overview; 2 entries + row identifiers, no labels; 3 adds labels with medication name; 4 full course details with vertically stacked labels to avoid overlap.
- Unmitigated risk MTI181: notation must distinguish administrative changes from real prescription detail changes.

**7.2.1 Related event sets** (administrations, pharmacy reviews, INR results)
- TLN-0940 [R](M): Group entries with related events into a section; reveal/hide related event sets as a section-wide option.
- TLN-0950 [R](M): Event value info accessible (e.g. tooltip).
- TLN-0960 [M](L): Events in a horizontal line **below** their entry; icon middle aligned to occurrence time; vertical line from icon middle up to the entry.
- TLN-0970 [M](L): Crowded event icons follow TLN-0690/0700/0710.
- TLN-0980 [R](L): Multiple event sets each on a separate line beneath the entry, each with vertical connector.
- TLN-0990 [R](L): Event set name shown in the row identifier cell aligned with its icon line.
- TLN-1000 [R](L): If an event set is safe only at a certain LoD, deselect it and disable its control at other LoDs.
- TLN-1010 [M](M): Show medication administration events only when the medication LoD shows the "minimum" detail per the dm+d Implementation Guide (Secondary Care).
- TLN-1020 [R](L): Only allow event sets for entries with a label displayed in the main viewing area (not just in identifier cells).
- Illustrative icons: document symbol = INR report; circled "A" = pharmacy review (e.g. "A = accepted").

**7.2.2 Drug administrations as related events**
- TLN-1030 [M](H): Do not record administrations in the Timeline View; use the Drug Administration View.
- TLN-1040 [M](H): Administration icons and behaviour consistent with the Drug Administration view.
- TLN-1050 [M](M): Plot administrations at the **actual** administration time, not entry time; planned administrations at intended time.
- TLN-1060 [M](M): Only enable the administrations event set when LoD shows full medication details.
- Illustrative: square icons = administration events; tick = given on time; "L" = given later than planned; planned future administrations have a dashed outline.

**8.2.1 Viewed time period**
- TLN-1070 [M](M): Control to select displayed time period from defined presets, e.g. 2 hours, 4 hours, 6 hours, 12 hours, 24 hours, 5 days, 10 days, 1 month, 3 months.
- TLN-1080 [R](M): On period change with "now" in view, expand/contract around "now", keeping it at the same screen position.
- TLN-1090 [R](M): If "now" not in view, expand/contract around the midpoint of the previous period (e.g. 6 h to 24 h around 12:00).

**8.2.2 Global navigation**
- TLN-1100 [R](M): First display in a session: period includes "now".
- TLN-1110 [R](M): Main navigation: scroll earlier/later; tab in increments equal to the chosen range (example label "jump", e.g. 12 hours earlier/later); jump to now (example label "today").
- TLN-1120 [R](M): "Total time range" control (e.g. slider) spanning all source data.
- TLN-1130 [M](M): Total-range control must NOT permanently show time axis labels; show them only while the user interacts (labels at each end, hover-help for the handle position).
- TLN-1140 [M](M): Total-range control not immediately adjacent to the viewing area's time axis (example places it above the main navigation controls).

**8.2.3 Row-level navigation**
- TLN-1150 [R](M): Per-row "next entry" and "previous entry" beyond the visible period; changes the time of the whole view, not just the row.
- TLN-1160 [R](M): Located in row identifier cells; shown only when there are horizontally out-of-view entries in that direction for that row (hide "next entry" when none later). Example icons: arrow-and-dot symbols; option names "Go to previous entry" / "Go to next entry".
- TLN-1170 [R](M): Selecting next/previous recentres the view so the **start** of that entry is in the middle of the period (MTI131 text also mentions start and end points to reveal discontinuity).

### Accessibility points
- Colour never the sole differentiator of entry type; avoid red/green (TLN-0220).
- Symbols constant size at every zoom (TLN-0240, TLN-0680) for legibility.
- Truncated labels need an alternative full-text mechanism (tooltip) (TLN-0500, TLN-0600). [suggested] Make that keyboard and screen-reader accessible (aria-label/aria-describedby holding the full text), not hover-only.
- Muted row banding and thin gridlines preserve contrast of foreground elements (TLN-0080, TLN-0140).
- [suggested] Expose sections as regions with headings; collapse button with aria-expanded; out-of-view counts as live text.

### Patient-safety rationale (key)
- Missing patient banner risks attributing data to the wrong patient.
- No clear "now" line: user may think in-view medications are current (MTI130).
- Dashed/dotted/filled lines or past/future style changes are misread as on/off, temporary or administration status (MTI073, MTI162, MTI163).
- Centred or shared start/end symbols make consecutive prescriptions look continuous (false dose continuity) (MTI153, MTI176).
- Without a start symbol, users read the left viewport edge as the item start.
- Hiding non-identical overlapping labels makes users assume the first label's dose applies to all.
- Partial drug names can be misread as another drug (TLN-0550).
- Expanding time span when the identifier column hides makes it look like more events occurred in the period (TLN-0660).
- Two adjacent time scales (total-range slider and view axis) cause reading the wrong one (MTI109).
- Administrations plotted at entry time misrepresent when given (MTI155).
- Scrolled-out rows: user unaware of data (MTI068); scrollbar alone insufficient.

---

## Displaying Graphs and Tables – User Interface Design Guidance v2.0.0.0 (dispgraphs.txt)

### Purpose
Rules for time-based observation graphs (interpolated scatter plots) and tables of clinical measurements, focused on the five vital signs: blood pressure (systolic/diastolic, mmHg), body temperature (°C), pulse rate (beats per minute), respiratory rate (breaths per minute), oxygen saturation (%). Guideline IDs GTAB-001 to GTAB-221. Dates must follow Date Display v3.0.0.0 guidance and times Time Display v3.0.0.0 (dependencies D2, D3).

### Scope notes
- Not specified: symbols per data type (except BP), series label wording (use SNOMED-CT terms where possible, A5), full unit list, unit conversion, label exact positions, focus/fish-eye/crosshair mechanics, thumbnail/look-ahead form, graph/table switch mechanism, mean/peak/low display, minimum scales, zoom/scale controls, logarithmic axes, mechanisms to add/remove/reorder series, normal range adjustment controls, target/critical range formatting (only that they must be displayable), table scroll/sort/filter mechanisms.
- Example value format in text: "140 mmHg systolic pressure, taken at 10:30 17-Jun-2006" (time hh:mm, date dd-Mmm-yyyy).
- Normal ranges for a population are agreed with appropriate clinical authority (A4); interpret graphs with early warning scores (MEWS, PARS) where applicable (A3).

### Definitions (11.2)
- Normal range: population-specific upper/lower parameters for a healthy population; may depend on age, gender.
- Target range/threshold: patient-specific, positive outcome, set by care giver.
- Critical range/threshold: patient-specific, negative outcome; triggers warnings (e.g. nurse contacting doctor).
- Reference range = Indicative range: standard range aiding reading of values; may be a normal range.
- Scale: relation between physical distance and data values on both axes (e.g. 1 hour = 10 mm on x; 10 mmHg = 5 mm on y; 0.5 °C = 5 mm on y).
- Data point, data unit, data series, interpolation, graph area, axis range, axis marking, gridlines as usual.

### Normative guidance

**2.1 Data point symbols**
- GTAB-001 [M](H): Show time-based observations as points, not bar charts or area graphs.
- GTAB-002 [M](H): Each series has a distinct symbol + colour combination.
- GTAB-003 [M](H): No fixed symbol-colour assignment beyond a viewing session (ends when the consultation ends), except the BP composite.
- GTAB-004 [R](L): Assign symbols when the series is added to the view.
- GTAB-005 [M](H): Once assigned in a session, a series keeps its symbol-colour until the session ends.
- GTAB-006 [M](H): Symbols distinct by one or more of: shape, orientation, added marks, curved vs straight. Avoid orientation alone unless re-orientation makes them quite distinct (Ex 6).
- GTAB-007 [M](M): Do NOT distinguish by size, line width, line length (also not by width/height alone, nor by multiplicity, Ex 5, Ex 7). Do not use elaborate icons or icons with other meanings (Ex 3).
- GTAB-008 [M](L): Avoid asymmetrical shapes or shapes that cannot be centred on an x-y point.
- GTAB-009 [M](M): Colours sufficiently distinct, such as red, green, yellow, blue, black, white, pink, cyan, gray, orange, brown, purple.
- GTAB-010 [M](M): Symbol height and width (diameter) larger than the interpolation line width.
- GTAB-011 [R](M): Symbol kept as small as possible while satisfying GTAB-010.
- GTAB-012 [M](H): Symbol centre aligned exactly with its x and y values.
- GTAB-013 [R](M): Do not overlap symbols.
- GTAB-014 [R](M): When points are tight on the x-axis, reduce symbols to short, thick vertical lines.
- GTAB-015 [R](M): When even tighter, show a (e.g. hover-over) message with the number of data points and a recommendation to view in greater detail (zoom in or change timescale).
- GTAB-016 [R](L): Symbol size constant; only shrink when points would overlap; never enlarge on zoom or timescale change.
- GTAB-017 [R](L): If a value's time is less specific than the axis intervals (e.g. day-level data on an hourly axis spanning two days), use a different symbology and do not interpolate those points.
- BS 7581: not more than seven colours per scheme, not more than four if the reader must memorise meaning (rationale; GTAB-123 allows up to twelve).

**2.2 Labelling series**
- GTAB-018 [M](H): Every series labelled.
- GTAB-019 [M](H): Labels visible whenever values are on screen.
- GTAB-020 [R](M): Single-series graph: label above the graph, where points/interpolation cannot touch or obscure it (top left corner).
- GTAB-021 [R](M): Label to the left of each graph, or immediately above at top left, depending on space.
- GTAB-022 [R](H): Minimise label height above graphs to minimise inter-graph distance.
- GTAB-023 [R](M): Label immediately adjacent to its graph (proximity, shading, borders).
- GTAB-024 [R](M): Overlaid series: label next to/very close to the relevant series (recommended at the end of each series).
- GTAB-025 [M](M): No vertical labels.
- GTAB-026 [R](L): No watermark labels or text behind data.

**2.3 Units**
- GTAB-027 [M](H): Unit label visible whenever the series is graphed.
- GTAB-028 [M](L): Never mix units within a series; use separate series with separate axes (e.g. Celsius then Fahrenheit is wrong).
- GTAB-029 [M](L): Never mix units in one table row/column sequence.
- GTAB-030 [M](L): If converted, show this at the level of each data point.
- GTAB-031 [R](H): Units may be abbreviated (e.g. "mmHg").
- GTAB-032 [M](L): Use standard abbreviations where available (e.g. "°C").
- GTAB-033 [M](L): Do not use an abbreviation shared by two units (e.g. "BPM" for both beats per minute and breaths per minute).
- GTAB-034 [M](H): Provide definitions of abbreviated units on request.
- GTAB-035 [R](L): Could provide full definitions as hover-overs.
- GTAB-036 [R](M): Units displayed alongside series labels (axis label and main series label).
- GTAB-037 [R](M): Unit may be less prominent (smaller/lighter) than the data type label, e.g. "Temperature °C" with °C de-emphasised.
- GTAB-038 [R](L): Units need not be shown next to each value (doing so obscures data).

**2.4 Blood pressure composite**
- GTAB-039 [M](H): Systolic and diastolic on the same graph area.
- GTAB-040 [M](H): Shown as opposite ends of a vertical line.
- GTAB-041 [R](M): Each end is a short horizontal bar (double-ended "T"); arrowheads acceptable alternative. Do not mix arrowheads with T-bars (Ex 29); never mix inward and outward arrowheads (Muller-Lyer).
- GTAB-042 [M](M): T-bar horizontal a little thicker than any gridlines.
- GTAB-043 [R](M): Do not interpolate BP points without the vertical systolic-diastolic connector.
- GTAB-044 [R](L): Tightly packed: symbol becomes a straight vertical line between systolic and diastolic.
- BP has a fixed symbology (exception to GTAB-003).

**2.5 Numerical values on graphs**
- GTAB-045 [M](H): Show the most recent value for each series by default.
- GTAB-046 [M](H): Show the penultimate value for each series by default.
- GTAB-047 [M](M): Most recent value in larger and/or heavier font.
- GTAB-048 [M](M): Do not show all values by default.
- GTAB-049 [M](H): Allow showing all values on request.
- GTAB-050 [M](M): Allow showing any single value on request.
- GTAB-051 [M](M): Values adjacent to their points.
- GTAB-052 [M](L): Consistent position relative to points.
- GTAB-053 [R](L): Above or below the points.
- GTAB-054 [M](L): Precision as recorded (e.g. integer, one decimal place). Do not pad or round.
- GTAB-055 [R](H): Reasonably sized font per accessibility practice (not too small, not too large).
- GTAB-056 [R](M): Clear undecorated typeface.
- Ex 40: in tightly packed data, may label the peak value.

**2.6 Focus line**
- GTAB-057 [M](H): Vertical focus line spanning all series at a chosen time; show value labels where it crosses points.
- GTAB-058 [R](L): Tolerance so near points are picked up; depends on clinical context and interval granularity (e.g. obs at 17:58, 18:00, 18:02, 18:03, 18:04 treated as one set).
- GTAB-059 [R](L): Value labels on focus have a background so the line does not obscure them.
- GTAB-060 [R](L): Per series, reveal the value immediately preceding and following the focus time within a set tolerance.
- GTAB-061 [R](L): Focus-aligned values more prominent (font weight and size) than preceding/following values.
- GTAB-062 [M](H): User can move focus between times or time ranges.
- GTAB-063 [R](L): Focus follows mouse over graph areas. Step 1: mouse away, nothing in focus. Step 2: mouse over, line appears at cursor x, values shown. Step 3: moves with mouse.
- GTAB-064 [M](L): Focus movable by button/key presses: one to tab forward, one to tab back.
- GTAB-065 [M](M): Focus line labelled with its aligned time.

**3.1 Scaling**
- GTAB-066 [M](H): Linear: within a view, a time unit is a fixed distance and a measurement unit a fixed distance.
- GTAB-067 [M](M): Default time-axis scaled to one of a set of predefined time ranges.
- GTAB-068 [M](H): For each default timescale, a consistently applied x:y ratio.
- GTAB-069 [M](H): Y scale predetermined from: available vertical space; total possible range; likely population range; early warning score parameters; normal range (patient-attribute dependent, changing with age); clinically significant change size (0.1, 1 or 10?); likely variation in a patient; likelihood of outliers; how these vary by context.
- GTAB-070 [R](H): If normal range is shown, default view tall enough for normal range plus margin, e.g. at least 10% above and below; exception when the range reaches a limit (SpO2 up to 100%).
- GTAB-071 [M](H): Clinically significant changes always detectable in default view.
- GTAB-072 [M](H): Default view must NOT auto-fit/maximise data to the graph area.
- GTAB-073 [R](M): User may choose to optimise (maximise) view.
- GTAB-074 [R](L): Minimise number of scale gradations / rescaling steps.
- GTAB-075 [M](L): When rescaled from default, display that the view is rescaled.
- GTAB-076 [R](M): If data exceeds available space, in priority order: (1) expand graph space up/down; (2) shift the axis to fit most recent data (recent beats older); (3) snap to another predefined scale, discounting outliers per clinical need.
- GTAB-077 [R](M): Axis-shift solution: provide scroll when data is outside the visible axis range.
- GTAB-078 [M](H): Axis-shift solution: provide a mechanism that communicates all data in the timeframe.
- GTAB-079 [R](M): A thumbnail can do this (example placed on the right of the graph).
- GTAB-080 [R](M): Show points on thumbnail where possible; for dense large timescales just interpolation.
- GTAB-081 [R](H): Show upper and lower axis tick marks on thumbnail.
- GTAB-082 [M](M): Thumbnail must not obstruct the main graph.
- GTAB-083 [R](H): Overlay indicative range/line (normal range, normal value, early warning parameters) on both main graph and thumbnail.
- Research note: clinicians want to see how many values are out of view ([suggested] show an out-of-range count).

**4.1-4.6 Axes**
- GTAB-084 [M](H): Time on the horizontal x-axis, running left to right.
- GTAB-085 [M](H): Time proportional by default (e.g. 14:00-15:00 same distance as 15:00-16:00).
- GTAB-086 [M](H): Never non-proportional time by default (a day not equal to an hour in width).
- GTAB-087 [M](H): Mark time intervals (hour, day, week marks).
- GTAB-088 [M](M): Group into higher units with more prominent marks.
- GTAB-089 [M](M): No tick for every possible interval; no unconventional intervals (e.g. every six minutes); ticks at meaningful intervals (hour, day) dependent on timescale.
- GTAB-090 [M](H): Time markings always visible when data shown.
- GTAB-091 [M](H): Non-time variables on the vertical y-axis.
- GTAB-092 [R](H): Y intervals decimal (10s, 20s) or easy to add (1, 2, 5, 0.1, 0.2, 0.5).
- GTAB-093 [R](M): Marked numbers with easy mid-points (110/130 rather than 115/135); never multiples of 15 (Ex 57); prefer even numbers.
- GTAB-094 [R](H): Do not choose arbitrary intervals to force a fixed number of gradations.
- GTAB-095 [R](M): Group y intervals into higher units with more prominent marks where appropriate.
- GTAB-096 [R](M): X-axis constrained by default to defined ranges, e.g. 24 hour, 2 week, 2 year.
- GTAB-097 [R](L): New data never changes the time scaling; shift the window to include it (e.g. 06:00 view, data 04:45; 13:00 view, data 12:30: same timeframe, shifted).
- GTAB-098 [M](L): Do not show all data by default unless clinical reason.
- GTAB-099 [R](L): If all data must show, use the nearest preset timescale that holds it.
- GTAB-100 [M](H): Y-axis need not start at zero.
- GTAB-101 [R](H): Horizontal gridlines at major y gradations (e.g. every 20 mmHg, every 0.5 °C).
- GTAB-102 [M](H): Horizontal gridlines consistent for each series in default view.
- GTAB-103 [M](H): Use gridlines sparingly; not every gradation.
- GTAB-104 [R](L): Vertical gridlines at major x gradations (e.g. every 6 hours for 24 h view; per day for three-day view). Too many vertical lines are misread as data points.
- GTAB-105 [M](L): Vertical gridlines consistent per time range window.
- GTAB-106 [R](L): Same vertical gridlines on all graphs in view.
- GTAB-107 [R](M): User may temporarily switch off gridlines (but on by default, Ex 63).
- Ex 61: shading at regular intervals along the time axis is shown as an acceptable alternative.
- GTAB-108 [M](M): Label y-axis marks, not the gaps (exception: values expressed as ranges).
- GTAB-109 [R](M): Label x-axis marks, not the gaps (exception: time ranges like a day/month shown in the gap, marks = 00:00).
- GTAB-110 [M](L): Avoid diagonal axis labels unless extra grids link label to mark.
- GTAB-111 [M](M): No vertical axis label text.
- GTAB-112 [M](M): Full dates always communicated on the x-axis (e.g. hierarchical year, month, date).
- GTAB-113 [R](L): Show days of the week where clinically relevant.
- GTAB-114 [R](L): Label the time range, e.g. "Last 24 hours", "15-Jun-06 to 17-Jun-06", "12 hours from Admission", "Last 48 hours observations". (Note: example uses 2-digit year; Date Display guidance governs format, normally dd-Mmm-yyyy.)

**5.1 Colours**
- GTAB-115 [R](H): Data points in high-saturation colours, except when one series must be emphasised.
- GTAB-116 [M](H): Series colours approximately equal saturation except an emphasised one.
- GTAB-117 [R](L): To emphasise one series, show others in lower-saturation versions of the same hues.
- GTAB-118 [M](H): Well-lit environment: graph area background white or off-white.
- GTAB-119 [R](H): Surrounding background neutral low-saturation colour.
- GTAB-120 [M](H): Good contrast between background and foreground (points, lines, labels, headers).
- GTAB-121 [R](H): Black border on data points; white border if the point colour is reversed.
- GTAB-122 [M](M): Reverse (dark) formatting must keep good reverse contrast. Avoid red next to dark blue on black (chromostereopsis).
- GTAB-123 [R](M): Max twelve colours, one per Berlin and Kay category: red, green, yellow, blue, black, white, pink, grey, orange, brown, purple, plus cyan. Never two shades of the same category.
- GTAB-124 [R](L): First colours chosen: blue, red, yellow (unless conflicting with background; e.g. yellow swapped for dark orange on a yellow-ish background). Ex 70 order: blue, red, green, yellow, black, white, cyan, pink, grey, brown, orange, purple.
- Colour is never the only coding: also shape, location, labelling.

**5.2 Typeface**
- GTAB-125 [M](H): Copy dark (dark grey/black). Minimum text contrast **3:1**, preferred **10:1**.
- GTAB-126 [M](H): Font x-height between **2 mm and 6 mm**.
- GTAB-127 [M](L): No visually elaborate typefaces.
- GTAB-128 [M](L): Typeface where "1" is distinct from lowercase "l" and capital "J".
- GTAB-129 [R](M): Each kind of copy consistent in typeface, size, colour, weight (exceptions: value in focus, most recent value).
- GTAB-130 [R](M): No underlines.
- GTAB-131 [R](M): No coloured text highlights.
- GTAB-132 [M](H): No animated or flashing text.
- GTAB-133 [M](M): No vertical text.
- GTAB-134 [M](H): No brackets (round or square) in numerical value labels (confused with "1").

**5.3 Lines**
- GTAB-135 [R](M): Gridlines light grey.
- GTAB-136 [M](M): Gridlines light weight.
- GTAB-137 [M](M): Gridlines lighter in weight and saturation than points and interpolation.
- GTAB-138 [R](M): Axis lines light grey.
- GTAB-139 [R](M): Axis lines light or medium weight.
- GTAB-140 [R](M): Major vs minor ticks distinguished by weight and/or length.

**5.4 Other formatting**
- GTAB-141 [M](M): No watermarks or background images in graph area.
- GTAB-142 [R](M): Solid colours, no patterns/hatching/gradients.
- GTAB-143 [R](M): No non-functional decoration (interpolation, axes, grids, focus are functional).
- GTAB-144 [R](L): Do not force users to choose format styles each time (persist preferences).

**6.1-6.3 Multiple series**
- GTAB-145 [R](H): Multiple series vertically stacked by default.
- GTAB-146 [M](M): Left axes of all graphs vertically aligned.
- GTAB-147 [M](H): Time intervals vertically aligned across simultaneous graphs (never different timescales in a stack).
- GTAB-148 [R](H): Minimise space between graphs, allowing for header labels.
- GTAB-149 [R](H): Follow conventional order where one exists (e.g. temperature at top; BP next to pulse).
- GTAB-150 [R](M): Otherwise order by when added to the view.
- GTAB-151 [R](L): User can reorder stacked graphs.
- GTAB-152 [M](L): Scroll when graphs exceed vertical space.
- GTAB-153 [M](L): Indicate there are chosen graphs not in view.
- GTAB-154 [R](M): Overlay only if same unit of measurement, or special convention (BP and pulse rate share a graph in acute care).
- GTAB-155 [M](M): Overlaid series with different units: show both axes.
- GTAB-156 [M](H): Label each axis when two are shown.
- GTAB-157 [M](M): Different units and different gradation spacing: no horizontal gridlines.
- GTAB-158 [R](H): Label each overlaid series at its end or beginning; if labels overlap there, use a legend immediately adjacent to the graph area.
- GTAB-159 [R](L): Avoid distinguishing overlaid series by dashed/dotted line styles.
- GTAB-160 [R](L): Overlaid interpolation lines semi-transparent.
- GTAB-161 [M](H): Do not rely on red vs green; if used, also distinguish by shape.
- GTAB-162 [R](L): Overlaid series use hollow symbols (not solid with black border), except linked BP.
- GTAB-163 [R](L): Tightly packed overlaid points may shrink but never to a height equal to or less than the interpolation line width.

**7 Interpolation**
- GTAB-164 [M](H): Interpolate by default, except (a) when timing is insufficiently specific for the scale; (b) across known missing data (do not bridge the gap).
- GTAB-165 [R](M): User can switch interpolation off.
- GTAB-166 [R](H): Straight lines; no smoothing by default.
- GTAB-167 [R](M): Solid lines.
- GTAB-168 [M](H): Lines must not obscure points (draw points on top).
- GTAB-169 [M](H): Points define the extremes: at a local peak the line must not go above the symbol's upper edge; at a local trough not below its lower edge.
- GTAB-170 [M](M): Lines thinner than the points.
- GTAB-171 [R](M): Line width approximately half the symbol height/diameter.
- GTAB-172 [M](M): Line same colour as its points.
- GTAB-173 [R](H): Anti-aliased lines.

**8 Indicative ranges**
- GTAB-174 [R](H): Show normal ranges only where appropriate ranges exist.
- GTAB-175 [M](M): System-wide choice: shade in-range OR shade out-of-range, never both styles in one system/clinical setting.
- GTAB-176 [R](M): Early warning score ranges graphical only with numerical scoring also shown.
- GTAB-177 [M](H): Allow target ranges and critical thresholds in addition to normal ranges.
- GTAB-178 [M](H): Label ranges with their population (e.g. "adult"); range parameters may be displayed.
- GTAB-179 [M](M): Range labels never obstruct data.
- GTAB-180 [M](H): Adjust normal ranges to the population (e.g. neonates; do not show adult pulse range for a child).
- GTAB-181 [M](M): Never overlay multiple normal ranges.
- GTAB-182 [R](M): Ranges as shaded areas, not threshold lines (lines reserved for clinician thresholds).
- GTAB-183 [R](M): Low-saturation range colours (example: yellow shading).
- GTAB-184 [M](H): Ranges never obscure data points, value labels, gridlines, interpolation (render underneath).
- GTAB-185 [R](L): Systolic and diastolic ranges in different shades.

**9 Tables**
- GTAB-186 [M](H): Consistent orientation per data type/clinical setting/procedure.
- GTAB-187 [M](H): Follow conventional orientation if one exists.
- GTAB-188 [R](H): Time horizontal: most recent at **far right** (sorted left-to-right), most recent visible by default (scroll to right end).
- GTAB-189 [R](H): Time vertical: most recent at **top** (sorted bottom-to-top), visible by default. Top-to-bottom oldest-first is incorrect by default (Ex 98).
- GTAB-190 [R](H): User can re-sort rows/columns.
- GTAB-191 [R](H): User can transpose the table.
- GTAB-192 [R](H): Light row banding.
- GTAB-193 [R](H): No heavy gridlines.
- GTAB-194 [M](M): Round cell values where not misleading.
- GTAB-195 [M](M): If rounded, communicate that and to what extent.
- GTAB-196 [M](M): If appropriate, allow reading the full unrounded value.
- GTAB-197 [R](M): Repeated dates (or times within a date): first instance more prominent than following ones.
- GTAB-198 [R](M): Do not stretch tables to fill space.
- GTAB-199 [R](M): Extra spacing every fifth row.
- GTAB-200 [M](M): Constant-width (tabular) numerals.
- GTAB-201 [M](M): Align decimal markers in a column.
- GTAB-202 [R](L): Do not append unnecessary decimals (e.g. ".0"); pad cells instead.
- GTAB-203 [R](M): Column headings aligned with their data.
- GTAB-204 [R](M): Centred headings visually over their column.
- GTAB-205 [R](M): Row titles of similar length.
- GTAB-206 [R](M): Long row headings may wrap; data aligns to the bottom line.
- GTAB-207 [R](M): Avoid headings much wider than their data.
- GTAB-208 [R](M): Brief column headings.
- GTAB-209 [M](M): Headings clearly linked to columns.
- GTAB-210 [R](M): Top-align column headings.
- GTAB-211 [R](M): Wide tables may repeat row headings at both ends.
- GTAB-212 [R](M): Column spacing sufficient but not excessive.
- GTAB-213 [M](M): No vertical column headings.
- GTAB-214 [R](M): May use 45° headings if too long and cannot wrap.
- GTAB-215 [R](M): 45° headings need special formatting (light diagonal gridlines linking to column).
- GTAB-216 [R](L): All 45° headings same direction.
- GTAB-217 [M](H): Always show both column and row headings.
- GTAB-218 [M](M): Headings always visible (freeze panes).

**10 Contextual information**
- GTAB-219 [M](H): Provide context of how a reading was taken (e.g. "manual" or "machine").
- GTAB-220 [M](H): Visible by default.
- GTAB-221 [M](H): User can interrogate for further context (method, environment).
- Scope note: readings direct from a device should be distinct from manually entered ones (manually entered machine readings count as manual).

### Accessibility points
- Text contrast minimum 3:1, preferred 10:1 (GTAB-125); x-height 2-6 mm (GTAB-126); no flashing text (GTAB-132); no vertical text (GTAB-025, 111, 133, 213); no text over watermarks (RNIB, dyslexia).
- Colour plus shape/location/label coding; avoid red/green reliance (colour blindness) (GTAB-161).
- Keyboard focus movement: one key forward, one back (GTAB-064).
- Unit abbreviation definitions on request (GTAB-034/035).
- Follow ISO 9241 and W3C WAI.
- [suggested] Provide the table view as the accessible alternative to the graph; aria-live announcement of focus line values.

### Patient-safety rationale (key)
- Auto-fit ("maximised") scaling makes clinicians overestimate changes and masks subtle changes; flatter vs taller ratios changed obstetric decisions (Cartmill and Thornton).
- Non-proportional time misleads trend reading.
- Thick or smoothed interpolation creates artificial peaks.
- Adult normal range for a child/neonate can falsely reassure; label range population.
- Mixing in-range and out-of-range shading conventions swaps meaning.
- Mixed units in one series cause misreading.
- Labels in gaps (paper chart style) make values ambiguous (is it 100, 80 or 110 mmHg?).
- Brackets confused with "1"; "BPM" ambiguous.
- Most recent table value hidden off-screen leads to acting on stale data (GTAB-188/189 revision).

---

## Proposed controls

All controls share a `TimeScale` model: `{ start: Date; end: Date; pxPerMs: number }` with linear mapping (TLN-0110, GTAB-066/085).

### 1. `TimelineView`
Purpose: container implementing the Timeline layout (TLN-0010 to 0030, 0110-0180, 1070-1140).
Props:
- `patientBanner: ReactNode` (required; render above; layout fails visually without it)
- `sections: TimelineSectionDef[]`
- `period: TimePeriodPreset` default `'24h'`; `periodPresets?: TimePeriodPreset[]` default `['2h','4h','6h','12h','24h','5d','10d','1m','3m']` (TLN-1070)
- `viewStart?: Date` (controlled) / `defaultViewStart?: Date`; initial view must contain now (TLN-1100)
- `now?: Date` default `new Date()`; `nowRefreshMs?: number` default 60000 [suggested]
- `dataExtent: { start: Date; end: Date }` for total range control
- `showRowIdentifiers?: boolean` default `true`; `onShowRowIdentifiersChange`
- `rowBandColours?: [string, string]` default `['#FFFFFF', <muted grey>]` (exactly two, TLN-0070/0090) [hex suggested]
- `futureShade?: string` subtle darker tint applied to future region only (TLN-0170/0180)
- `onPeriodChange`, `onViewStartChange`, `onNavigateToView?(entryId, view)` (TLN-0190)
Behaviour: global controls bar directly above canvas; canvas fills remaining space and resizes (ResizeObserver); identical axis for all sections; time axis rendered top and bottom; collapsing identifier column keeps the same `start`/`end` and recomputes `pxPerMs`; period change anchors per `computePeriodChange`.

### 2. `TimeAxis`
Props: `scale: TimeScale`, `position: 'top'|'bottom'`, `showGridlines?: boolean` default true, `showDayOfWeek?: boolean` default true (GTAB-113), `dateFormat` via shared Date Display utility.
Behaviour: ticks from `chooseTimeTicks` (meaningful intervals only, GTAB-089); major ticks (higher units) heavier/longer (TLN-0150, GTAB-088/140); labels on marks not gaps, except day/month labels centred in gaps where marks represent 00:00 (GTAB-109); horizontal text only; full dates always derivable (GTAB-112); gridlines thin light grey (TLN-0140, GTAB-135/136).

### 3. `NowIndicator`
Props: `scale`, `now: Date`, `label?: string`.
Behaviour: prominent vertical line across canvas plus markers on top and bottom axes outside the canvas (TLN-0160). Hidden when now outside view. [suggested] aria-label "Now, hh:mm dd-Mmm-yyyy".

### 4. `TimelineSection`
Props: `id`, `title: string`, `collapsed?: boolean`, `onCollapsedChange`, `height?: number` (resizable, TLN-0800), `levelOfDetail: LevelOfDetail`, `levelsOfDetail: LevelOfDetail[]`, `defaultLevelOfDetail` (from clinical authority, TLN-0930), `relatedEventSets?: RelatedEventSetDef[]`, `kind: 'entries'|'graphs'` (TLN-0720/0840).
Title bar: expand/collapse at left (TLN-0820), title, out-of-view total count text (TLN-0870, e.g. "3 rows with entries out of view" [wording suggested]), LoD control at right (TLN-0910), related event toggles. Collapsed: title bar persists; LoD control and event options hidden; siblings resize proportionally.
Out-of-view arrows with counts at top and bottom borders in the identifier column (TLN-0850/0860), computed by `countRowsOutOfView`.
Types: `type LevelOfDetail = 'thumbnail' | 'entriesOnly' | 'nameLabels' | 'fullDetails'`. Enforce TLN-0920: if LoD !== 'thumbnail' and identifiers hidden, force labels on.

### 5. `TimelineRow`
Props: `id`, `identifierText: string`, `entries: TimelineEntry[]`, `bandIndex: number`, `labelMode: 'hidden'|'name'|'full'`, `stackLabels?: boolean` (row-level overlap option control in identifier cell, TLN-0630), `rowOptions?: RowOption[]`.
Identifier cell: text top-left (TLN-0620), options top-right (TLN-0670), "Go to previous entry"/"Go to next entry" buttons only when such entries exist (TLN-1150/1160); collapsed column shows row menu icon opening a popover with identifier text and options. Validation: TLN-0650 (labels and identifiers never both hidden).

### 6. `TimelineEntryMark`
`type TimelineEntry = { id; kind: 'point'|'known'|'open'; start: Date; end?: Date; label: string; labelFields?: LabelField[]; drugName?: string; relatedEvents?: RelatedEvent[] }`.
Rendering:
- point: one shared symbol for all types, vertically symmetrical, centre marked, centre at `x(start)`, fixed size (TLN-0210-0280).
- known: start symbol (left edge at `x(start)`), unbroken unfilled thick line, distinct end symbol (right edge at `x(end)`), symbols drop downward (TLN-0300-0360).
- open: start symbol plus line to right margin, no end symbol (TLN-0400-0420).
- same style past and future (TLN-0370); fixed sizes at all zooms (TLN-0680).
- Medication mapping helper `entryKindForPrescription` (below).
- crowding states: `'symbol'|'tick'|'cluster'` from `computeCrowding`; cluster shows indicator with count and tooltip recommending a shorter time period (TLN-0710).

### 7. `TimelineEntryLabel`
Props: `entry`, `scale`, `viewport`, `mode`, `stackLevel`.
Behaviour: above entry, leader line from label's left edge (TLN-0440/0450); anchor per `labelAnchorX`; right-edge truncation via `truncateLabel` with ellipsis and full-text tooltip (TLN-0500/0510); never wraps; medication rules TLN-0550/0560/0590.

### 8. `RelatedEventTrack`
Props: `events: RelatedEvent[]` (`{ time: Date; icon: ReactNode; setName: string; value?: string; status?: 'onTime'|'late'|'planned'|... }`), `scale`, `lineIndex`.
Behaviour: icons below entry, centre at time, vertical connector up to entry (TLN-0960/0980), set name in identifier cell (TLN-0990), tooltip value (TLN-0950), crowding per TLN-0970; administrations use actual time, planned at intended time with dashed outline (TLN-1050); enabled only when LoD is 'fullDetails' (TLN-1060, TLN-1000 disable control otherwise). Read-only: no recording (TLN-1030).

### 9. `TimeNavigationBar`
Props: `period`, `presets`, `onPeriodChange`, `onScroll(direction)`, `onJump(direction)` (labelled e.g. "jump", step = period, TLN-1110), `onGoToNow` (labelled e.g. "today"), `dataExtent`, `viewStart`.
Contains `TotalRangeSlider`: no permanent axis labels; on pointer/keyboard interaction show start/end labels at each end and a handle tooltip (TLN-1130); positioned away from the canvas time axis (TLN-1140). [suggested] Arrow keys move slider; Home/End go to extent ends.

### 10. `ObservationGraph`
Purpose: vital-sign scatter/line graph (GTAB) usable standalone or as a timeline graph row.
Props:
- `series: ObservationSeries` (`{ id; label: string; unit: string; unitDefinition?: string; points: { time: Date; value: number; precision: number; timePrecision?: 'minute'|'hour'|'day'; source: 'manual'|'machine'; converted?: { fromUnit: string } ; context?: string }[]; gaps?: {start: Date; end: Date}[] }`)
- `symbol: SymbolShape`, `colour: SeriesColour` (from `SeriesStyleAllocator`)
- `scale: TimeScale` (shared, GTAB-147, TLN-0750)
- `yAxis: { min: number; max: number; majorStep: number; minorStep?: number }` (predefined, GTAB-069)
- `normalRange?: { low: number; high: number; population: string }` ; `rangeShadingMode: 'inRange'|'outOfRange'` (system-wide constant, GTAB-175)
- `targetRange?`, `criticalThresholds?` (GTAB-177)
- `showAllValues?: boolean` default false (GTAB-048/049); `interpolate?: boolean` default true (GTAB-164/165); `showGridlines?: boolean` default true (GTAB-107); `maximised?: boolean` default false (GTAB-072/073)
- `labelPosition?: 'above'|'left'` default 'above' (top-left) (GTAB-020/021)
- `focusTime?: Date` (controlled from `GraphStack`)
Behaviour: label with unit (less prominent) always visible (GTAB-018/019/027/036/037); unit abbreviation tooltip (GTAB-034/035); y labels on marks (GTAB-108); horizontal gridlines at majors, light grey, lighter than data (GTAB-101-103, 135-137); points with black border, centred (GTAB-012/121); straight, solid, anti-aliased interpolation at ~half symbol size, same colour, drawn beneath points, broken at gaps and not drawn for imprecise-time points (GTAB-164-173, 017); latest value bold/larger and penultimate value shown by default, values above/below points at recorded precision, no brackets (GTAB-045-054, 134); range shading underneath everything, low saturation, labelled with population (GTAB-178-184); "Rescaled" indicator when not default (GTAB-075); thumbnail (see 13) when data out of y range (GTAB-078); empty period still renders axes, title, gridlines (TLN-0740); manual/machine context visible (GTAB-219/220); converted points flagged (GTAB-030).
Variants: `BloodPressureGraph` (props `points: { time; systolic; diastolic }[]`; T-bar ends thicker than gridlines, vertical connector, collapses to vertical line when crowded, separate shades for systolic/diastolic normal ranges; GTAB-039-044, 185). `OverlaidGraph` (allowed only when same unit or convention; dual labelled axes when units differ; no horizontal gridlines when gradations differ; hollow symbols; semi-transparent lines; labels at series end/start else adjacent legend; GTAB-154-163).

### 11. `GraphStack`
Props: `graphs: ObservationGraphProps[]`, `order?: string[]` (convention, e.g. temperature first; else insertion order; user-reorderable, GTAB-149-151), `timeRange: TimeRangePreset` default '24h' (GTAB-067/096), `rangeLabel?: string` e.g. "Last 24 hours" (GTAB-114).
Behaviour: vertical stack, aligned left axes and time intervals, minimal gaps (GTAB-145-148); scroll plus "more graphs not in view" indicator (GTAB-152/153); shared vertical gridlines (GTAB-106); `FocusLine` spanning all graphs: follows mouse, keyboard keys step back/forward (e.g. Left/Right arrows [key choice suggested]) one data time at a time, labelled with its time, value labels with background, aligned values prominent, preceding/following shown less prominently, tolerance prop `focusToleranceMs` (GTAB-057-065); new data shifts window not scale (GTAB-097).

### 12. `ObservationTable`
Props: `rows/columns` of measurements, `orientation: 'timeHorizontal'|'timeVertical'` (default fixed per data type, GTAB-186/187), `onOrientationChange` (transpose, GTAB-191), `sort` (GTAB-190), `rounding?: { decimals: number }` with indicator text and full-value tooltip (GTAB-194-196).
Behaviour: newest at far right (horizontal) or top (vertical), scrolled into view initially (GTAB-188/189); light banding, extra spacing every fifth row, no heavy gridlines, not stretched (GTAB-192/193/198/199); tabular numerals and decimal alignment without adding ".0" (GTAB-200-202); first instance of repeated date/time prominent (GTAB-197); sticky row and column headers always shown (GTAB-217/218); headings top-aligned, brief, never vertical, optional 45° with diagonal guide lines, all same direction (GTAB-203-216); units never mixed in a row/column (GTAB-029).

### 13. `GraphThumbnail`
Props: `series`, `timeRange`, `yExtent`, `normalRange?`.
Behaviour: shows all data for the timeframe (points, or interpolation only if dense), upper and lower axis tick marks, indicative range, placed beside (e.g. right of) the graph not over it (GTAB-079-083). [suggested] show count of values outside main view.

### Utility functions
- `timeToX(t, scale) = (t - scale.start) * pxPerMs`; `pxPerMs = viewportWidth / (end - start)` (TLN-0110, GTAB-085). Never non-linear.
- `computePeriodChange(oldStart, oldEnd, newDurationMs, now)`: if `now` in [oldStart, oldEnd], keep its fractional position `f = (now - oldStart)/(oldEnd - oldStart)`; `newStart = now - f*newDuration` (TLN-1080). Else centre on `mid = (oldStart+oldEnd)/2`: `newStart = mid - newDuration/2` (TLN-1090).
- `jump(direction)`: shift start/end by ±duration (TLN-1110). `goToNow()`: place now within view (default [suggested] keep now at the same fraction or centre).
- `navigateToEntry(row, direction, view)`: find next entry with start > viewEnd (or previous with start < viewStart); set `start = entry.start - duration/2` (TLN-1170). Visibility of buttons: exists such an entry (TLN-1160).
- `widenWithoutChangingSpan(start, end, newWidth)`: keep start/end, recompute pxPerMs (TLN-0660).
- `entryKindForPrescription(p)`: ongoing → 'open' at first planned administration (TLN-0430); more than one administration → 'known' from first to last planned administration (TLN-0380); once-only with significant duration (infusion) → 'known' planned start to planned end (TLN-0390); once-only no significant duration (tablet/injection) → 'point' at planned administration time (TLN-0290).
- `labelAnchorX(entry, viewport)`: point → x(start) (hidden if start out of view); duration → `max(x(start), viewport.left)` (TLN-0470/0480/0490).
- `truncateLabel(fields, availableWidth, measure, opts)`: never wrap; if full text fits, return it; else drop whole trailing fields until fits plus "…" (TLN-0560); if drug name itself does not fit, return "…" only (TLN-0550); non-medication free text may truncate by character plus "…" (TLN-0500); always expose `fullText` for tooltip. When `mode==='full'` truncation only allowed at the right viewport edge (TLN-0590).
- `resolveLabelOverlaps(labels)`: sort by x; if a label overlaps a previous one with identical text, hide it and clip its leader line at the visible label's bottom (TLN-0520); if text differs, assign the lowest stack level with no horizontal overlap and extend leader line (TLN-0530).
- `computeCrowding(entries, scale, symbolWidthPx, minTickGapPx)`: if adjacent symbol extents overlap → 'tick' (vertical lines of same height, TLN-0690/0700, GTAB-014); if tick spacing < minTickGapPx → 'cluster' with count and message (TLN-0710, GTAB-015). Symbol size never scaled with zoom.
- `countRowsOutOfView(rows, viewTop, viewBottom, timeRange)`: count rows above and below the vertical viewport that have ≥1 entry intersecting [start, end] (TLN-0850-0870).
- `chooseTimeTicks(start, end, widthPx)`: choose from conventional intervals only (e.g. 15 min, 30 min, 1 h, 2 h, 3 h, 6 h, 12 h, 1 day, 1 week, 1 month, 1 year [list suggested; doc forbids e.g. 6 minutes]); majors at the next higher unit (day boundaries, etc.) (GTAB-087-089, TLN-0130/0150).
- `chooseYTicks(min, max, approxCount)`: step from {0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, ...} only, never 15 or arbitrary steps, labels at marks (GTAB-092-094, 108).
- `defaultYRange(seriesDef, normalRange)`: predefined per data type; if normal range shown ensure ≥10% margin above and below (unless range reaches a physical limit such as 100% SpO2) (GTAB-069/070). Never auto-fit by default (GTAB-072).
- `resolveOverflow(data, yRange, options)`: priority (1) expand graph height; (2) shift axis favouring most recent data; (3) snap to next predefined scale ignoring outliers; flag `rescaled=true` (GTAB-075/076).
- `shiftWindowForNewData(window, latestTime)`: if latest > end, `start += latest - end`, keep duration (GTAB-097).
- `nearestPresetContaining(dataExtent, presets)` (GTAB-099).
- `SeriesStyleAllocator` (per session): palette order blue, red, yellow first then green, black, white, cyan, pink, grey, brown, orange, purple (max 12, one per category); shapes distinct by shape/orientation/added marks/curvature, symmetric; assign on add, keep until session end, reset when consultation ends; BP fixed (GTAB-002-009, 123/124).
- `focusValues(seriesList, t, toleranceMs)`: per series, points within tolerance are "aligned"; also nearest preceding and following points (GTAB-058/060/061).
- `formatValue(v, recordedDecimals)`: `v.toFixed(recordedDecimals)`, no brackets, no unit appended (GTAB-054/134/038).
- `alignDecimals(values)`: pad right with figure spaces to max decimals without adding ".0" (GTAB-201/202).
- `interpolationSegments(points, gaps, axisGranularity)`: straight segments between consecutive points; skip across known gaps and points whose time precision is coarser than axis granularity (GTAB-164, 017).
- `checkUnitAbbreviation(units)`: reject abbreviation shared by two units (e.g. "BPM") (GTAB-033).
- `validateLabelVisibility(showEntryLabels, showRowIdentifiers, lod)`: throw/force if both hidden or if lod != thumbnail and no identifying text (TLN-0650, TLN-0920).
- `contrastRatio(fg, bg)` with assertion ≥3 (prefer ≥10) for graph text (GTAB-125).
