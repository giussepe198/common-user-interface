# Design guide, patient lists, filtering, handover

> IMPORTANT NOTE ON `cuidesignguide.txt`: despite the filename, this file is NOT an overall CUI design guide. Its content is the **"NHS CUI Design Guide Workstream – Release 4 Handover Requirements" spreadsheet** (v1.0.0.0, 1 March 2007). It contains **no colour palette, typography, layout grid or general visual principles**. A grep across all of `clean/` shows colour/typography values only in `alertsymbdes`, `clinicalnoting`, `dispgraphs`, `iconssymb`, `usingtemplates` (other groups). Also note `patlistview` and `filtering` both state: "Stylistic choices, such as colours, fonts or icons are not part of the guidance and unless otherwise specified are not mandatory". No hex/RGB values appear in any of my six documents. Global tokens must come from other groups' findings.

Conformance terms used in PAL/FSG docs: **Mandatory** = implementation should follow; **Recommended** = advised. Evidence rating Low/Medium/High. Handover spreadsheet uses **Essential / Recommended / Desirable**.

Common usability principles cited (patlistview App. A; apply library-wide): Nielsen heuristics (visibility of system status, match with real world, user control and freedom, consistency, error prevention, recognition over recall, flexibility/efficiency, minimalist design, error recovery, help); Shneiderman's 8 rules (consistency, shortcuts, informative feedback, closure, error prevention, easy reversal, internal locus of control, reduce memory load); ISO 9241 presented-information characteristics (clarity, discriminability, conciseness, consistency, detectability, legibility, comprehensibility). Assumed minimum screen resolution **1024 x 768** (patlistview A3).

---

## Release 4 Handover Requirements spreadsheet (cuidesignguide.txt)

- **Purpose**: list of ~140 user requirements (RIDs) for IT support of clinical handover; requirements, not UI designs. Each has RID, requirement ("Users can…"), Plain English, Example, category flags, priority (Essential/Recommended/Desirable), source.
- **Category groups ("Handover Aspect")**: Datasets per item; Example dataset part; Handshake; Task management; Time component; Item lists; Good practice; Encouragement/Discouragement; Updating; Patient identification.

### Normative guidance (E = Essential, R = Recommended, D = Desirable; no priority given = unmarked)
Patient identification / dataset
- RID 11 (E): patients clearly and uniquely identified with standard NHS identifiers; possible set: full name, DOB, NHS number, location.
- RID 49 (E): view/record demographics forming unique identifier: name, dob, location, contact details, next of kin, NHS number, photo, bar coding.
- RID 77 (E): supplementary identifiers allowed in addition to the NHS set (e.g. social security number).
- RID 94 (R): machine-readable identification (bar coding, RFID).
- RID 25 (E): view/record current location (ward and bed).
- RID 89 (R): show clinician "currently responsible for" patient AND consultant with overall responsibility.
- RID 137: view/record resuscitation status. RID 138: goals for patients clear. RID 50 (E): current medical problems.
- RID 7 (E): display data per NHS data standards (e.g. date display, patient name, DOB).
- RID 76 (E): symbols/abbreviations must be clearly understood, conform to those in NHS use (examples: Mg, Mcg, 3/7, TTO, (?)).
- RID 68 (E): users can easily identify data MISSING from the expected dataset (e.g. 'John Doe' with no name/DOB/number).
- RID 133: record patients not yet on the system / not uniquely identifiable (incoming ambulance).
- RID 84 (E): items with non-standard locations (corridor, en route to A&E, not yet arrived) must still be recordable.

Dataset per item
- RID 1 (E): per-patient handover summary distinct from full record. RID 3 (E): from summary, quick link to full record.
- RID 2 (E), RID 4 (E): dataset varies by context (role, care setting, grade, speciality); system recognises user context.
- RID 43 (R): default dataset = minimum necessary for context.
- RID 117 (R): fields displayed in consistent order per item type (e.g. name, DOB, health issue, tasks).
- RID 32 (R): where data entered manually, column headings unambiguously explain what goes in them.
- RID 65 (R): support handover structures (MIST for paramedics, WEST in air traffic, nursing 'system' headings e.g. breathing, mobility).
- RID 69 (R): user can temporarily increase/decrease display "richness" (level of detail).
- RID 128: unfiltered (non-role-based) view must be possible; default not defined.
- RID 129: record information outside predetermined dataset (free text / ad hoc). RID 131: datasets defined by lead clinician.
- RID 141: view provenance, e.g. when last updated. RID 102 (E): access historical values.
- RID 14 (R): view others' perspective (nurse sees doctor's view).

Item lists
- RID 8 (E), 58 (E), 63 (R): view accurate up-to-date list of all items the user is responsible for, as a single list; includes patients not physically present.
- RID 24 (E): categorise patients into groups (location, team, severity, MEWS, Waterlow, resus status, awaiting results, due admission/discharge).
- RID 106 (R): default order appropriate to context (bed no, priority, time to be seen); ward lists usually by bed number. RID 127: consistent order (e.g. bed order); RID 71 (R): order of priority (RID 71 and 127 explicitly contradict).
- RID 85 (R): highlight/prioritise patients and non-patient tasks; prioritise PATIENTS first, then tasks WITHIN a patient (patient-related task prioritisation across patients "could be dangerous").
- RID 121 (R): show empty beds. RID 119 (R): indicate items that recently left area of responsibility (discharged) with access to them.
- RID 120 (R): mark patient for discharge without discharging.
- RID 130: filter list to show only 'problem' items (e.g. 400 patients to 20 unstable). RID 136: differentiate/filter patients admitted during previous shift.
- RID 144: inclusion criteria for the list clearly visible (e.g. "all surgical patients").
- RID 45 (E): single- and multi-patient views. RID 59 (R): personal tick-lists on the list. RID 60 (R): checklist/care pathway status with exceptions highlighted.
- RID 82 (R): 'handed over' status icon; distinguish handed-over from remaining items.

Task management
- RID 44 (E): view all planned tasks per patient. RID 83 (E): tasks not associated with a patient.
- RID 51 (R) / 52 (E): allocate tasks to sets of individuals / a specific person or role. RID 125: reallocate sets of tasks.
- RID 53 (E): alert users to overdue tasks (e.g. overdue medication).
- RID 54 (R): highlight tasks specifically for handover, not permanently.
- RID 56 (E): log incomplete tasks. RID 10 (E): discharge with outstanding tasks, which are flagged.
- RID 21 (R): record who marked a task complete (and optionally who vouched).
- RID 75 (E): task status unambiguous (completed, partially completed, incomplete; possible richer states: bloods taken, sent, processing, finished but not checked, checked, checked and acted on, checked and signed).
- RID 98 (R): interdependent tasks. RID 123: time-dependent tasks (tomorrow, next week, after the operation).
- RID 104 (R): tasks/items must be MANUALLY removed from current view, not auto-archived on due date.
- RID 122 (E): view 'clean' current data; completed items may be temporarily hidden or moved to an accessible place.
- RID 126: all tasks shown by default (multidisciplinary); RID 90 (R): filter tasks by role/speciality/individual/set of staff.
- RID 132: seniors can check outstanding tasks across patients/staff. RID 140: status for non-patient messages ('acknowledged'/'completed'). RID 57 (D): integrate with diary systems.

Handshake / handover event
- RID 12 (E), 64 (E): always clear who is responsible; an item cannot be "no-one's" responsibility.
- RID 20 (R): record handover event and transfer of responsibility (handshake), including asynchronous / not face-to-face.
- RID 22 (R): receiver controls the transfer. RID 87 (E): giver or receiver may refuse; refusal recorded like a handshake.
- RID 27 (E): record/confirm date, time, place, giver, receiver, others present, satisfaction (mostly auto-captured, user confirms).
- RID 28 (R): record handover-specific info (reason for handover).
- RID 30 (E): never lock users out of patient record because handover incomplete.
- RID 31 (R): record unsatisfactory handover retrospectively, with clear indicator and time/date/user stamp. RID 139: flag as incident.
- RID 36 (E), 115 (E): ad-hoc handovers for single items/tasks; RID 70 (E): initiate or delay handover.
- RID 116 (R), 118 (E), 18 (R): same documentation for remote users; external monitoring.

Time component
- RID 40 (R), 48 (E), 145: view handover 'snapshots' at multi-patient level and per patient.
- RID 42 (E): non-current (past/future) views must clearly identify the date and time they refer to.
- RID 97 (R): time-based (diary) format. RID 92 (R): trends of observations. RID 100 (R): previous handover events.

Updating
- RID 9, 33, 39 (E), 80 (E): updates go to source record, not a 'handover copy'; simultaneous update of different data allowed (not same datum); post-handover additions by giver flagged to receiver.
- RID 105 (E): prevent accidental updates. RID 114 (E): access/update restricted by profile. RID 112 (R): responsible users update their own items.

Encouragement / good practice
- RID 107 (R): discourage distracting actions during handover (e.g. warning when ordering tests, communally displayed).
- RID 108 (R): 'read back' prompt for key info (e.g. similar names on same ward + DNR status).
- RID 72 (E): privacy; minimise overhearing; large displays may show ward info publicly, patient info privately.
- RID 96 (R): printing allowed, subject to IG; must not discourage electronic use.
- RID 99 (R): defer non-urgent messages during handover. RID 47 (R): communal simultaneous viewing (wall display). RID 6 (R): variety of display sizes.
- RID 46 (E): identify which of conflicting sources is correct. RID 110 (E): single reliable source. RID 111 (E): access at all times and places.
- RID 88 (R): personal notes, not part of record (governance concern noted). RID 93 (R): audio/video in handover docs. RID 91 (R): auto-captured observations with alert flags.

### Accessibility points
- RID 6 (multiple display sizes), RID 47 (communal display legibility). No WCAG/contrast values given.

### Patient-safety rationale
- Unique identification and read-back mitigate wrong-patient handover with similar names (RID 11, 108).
- Manual removal of tasks (RID 104) ensures completion is acknowledged, not silently archived.
- Never blocking record access (RID 30) prevents care delays from incomplete handover.

---

## Patient List View (patlistview.txt)

- **Purpose**: guidance (PAL-xxxx, 2009/2015 v1.0.0.0) on safe display of multi-patient lists: header, columns, rows/cells, sublists, patient ID, row key identifiers, column management, updates, history, further info. Example context: hospital respiratory ward.

### Normative guidance
3.2.1 Patient List header
- PAL-0010 (M/High): header always visible when list displayed.
- PAL-0020 (M/High): at top of list area, spanning entire width.
- PAL-0030 (R/Med): font size and weight more prominent than neighbouring list elements.
- PAL-0040 (M/High): show appropriate combination of: who the list is for; service provided; location; time and date data last updated OR (real-time systems) current time.
- PAL-0050 (R/Med): single clinician name as family name, given name and salutation (example "Dr Maxhurst"; examples also show team "on-call surgical team").
- PAL-0060 (R/Med): several individuals: e.g. 'Patient List for: Mr Crossley, Mr Argos'.
- PAL-0070 (R/Med): team: e.g. 'Patient List for: Physiotherapists'.
- PAL-0080 (M/High): location details sufficient to uniquely identify location (e.g. 'Ward 3' + 'North wing').
- PAL-0090 (R/Med): multi-location lists reflect this ('Elkington Ward, Remington Ward', 'All Wards').
- PAL-0100 (M/High): current time and date per Time Display and Date Display design guides (i.e. CUI date dd-Mmm-yyyy and 24h hh:mm; formats from other groups). Service-only list (e.g. 'Baby Clinic') may omit location.

3.2.2 Column headers
- PAL-0110 (R/Low): titles vertically aligned to top.
- PAL-0120 (R/High), PAL-0160 (R/Med): wrap titles onto multiple lines if column too narrow.
- PAL-0130 (R/Med): header left/right margins match column data margins.
- PAL-0140 (R/Med): header horizontal alignment matches column data (e.g. 'Location' centre aligned, others left).
- PAL-0150 (R/High): never truncate header titles.
- PAL-0170 (M/High): sticky header bar during vertical scroll.

3.2.3 Columns
- PAL-0180 (M/High): prominent vertical divider lines between columns.
- PAL-0190 (M/High): left and right margins (padding) in each column.
- PAL-0200 (M/High): user-resizable column widths, persisted between sessions.
- PAL-0210 (R/High): default min width = widest element in title and content (e.g. longest word) + margins.
- PAL-0220 (R/Med): resizing one column must NOT change others' widths (even if total exceeds viewport).
- PAL-0230 (R/Med): horizontal scroll when total width exceeds viewport.
- PAL-0240 (M/High): when columns out of view, show direction symbols (e.g. left/right arrows) immediately ABOVE the viewing area near its left and right borders, not obscuring info.
- PAL-0250 (R/Low): supplementary message 'columns out of view – scroll left and right' (or similar) next to the symbols.
- PAL-0260 (R/Med): option to hide out-of-view notifications until next session.
- PAL-0270 (R/High): after content update, auto-widen column if longest element exceeds width.
- Truncation in any form (character limit, long words, sublist count) should be avoided.

3.2.4 Rows and cells
- PAL-0280 (M/High): horizontal orientation (one patient per row); overrides GTAB-191 (no row/column transposition) in patient lists.
- PAL-0290 (M/High): prominent horizontal row divider lines.
- PAL-0300 (R/Med): two alternating row background colours (banding). Rationale: more than two colours may imply meaning.
- PAL-0310 (R/Med): banding colours must not reduce legibility of content or dividers and must not have semantic meaning in context.
- PAL-0320 (R/High): wrap cell text. PAL-0330 (R/High): never truncate cell content. PAL-0340 (R/High): row height sufficient (auto). PAL-0350 (R/High): auto-grow row after update.
- PAL-0360 (R/Med): single vertically-scrollable list (no paging/tabs).
- PAL-0370 / PAL-0380 (R/Med): full-width start-of-list indicator at top and end-of-list indicator at bottom.
- Note: wrapping can fragment label/value ('potassium' / '2.6') or 'not' from 'to go home'; avoid breaking such pairs [suggested: use non-breaking spaces between label and value].

3.2.5 Sublists (list content within a cell, e.g. tasks, results)
- PAL-0390 (M/High): split cell into sublist rows, one item per row.
- PAL-0400 (M/High): sublist dividers noticeable but LESS prominent than row dividers.
- PAL-0410 (R/Med): never show a subset by default (no "5 of 8"); no in-cell scrolling.
- PAL-0420/0430 (R/High): sublist row height sufficient; auto-grow on update. PAL-0440 (R/High): add/remove sublist rows on update.

3.2.6 Patient identification
- PAL-0450 (M/High): name, date of birth, NHS number, in that order, on separate lines, in the SAME column.
- PAL-0520 (M/High): name display conforms to Patient Banner section 2.6.1 (FAMILY name uppercase, Given name, title; see banner group). PAL-0530 (R/Med): preferred name (shown after patient name), DOB and NHS number per PAB-0033, 0036, 0037, 0042, 0043, 0046.
- Unknown names (Table 7; name parts on one line, comma separated, gender appended):
  - both unknown: `UNKNOWN, Unknown, Male` (PAL-0460)
  - family unknown, given known: `UNKNOWN, Ben, Male` (PAL-0470)
  - family known, given unknown: `SMITH, Unknown, Male` (PAL-0480)
  - gender appended only if known. 'UNKNOWN' capitalised in family-name slot because family names are all capitals; 'Unknown' first-capital in given-name slot.
  - (Doc's usage-example captions for 0470/0480 are swapped; rule text and Table 7 are authoritative.)
- PAL-0490 (R/Med): unknown DOB shows 'Unknown'. PAL-0500 (R/Med): unknown NHS number shows 'Unknown'.
- PAL-0510 (R/Low): while NHS number unknown, show care setting's temporary ID, in the same font style as patient name field, label 'Temporary Number' or similar (example uses 'Temporary No').
- PLI038: hazard noted with labels ('born', 'NHS number', 'gender') inside list; banner rules govern (banner group).
- PAL-0540 (M/High): identical names (incl. family name) on the list: visually highlight the names AND show a warning symbol next to them (example: symbol + changed font colour of the identical information).
- PAL-0550 (M/High): indicate (e.g. underline) the FIRST differentiating identification element: given name, else DOB, else NHS number.
- PAL-0560 / 0570 (R/Low): same for similar-looking/sounding names, if system supports (given name, else DOB if identical or similar, else NHS number).

3.2.7 Row key identifiers
- PAL-0580 (M/High): each row has key identifier info unique within the list.
- PAL-0590 (M/High): includes patient identification when a patient is assigned to that location/time.
- PAL-0600 (M/High): key identifier content in larger/bolder font than other content (in patient ID cell apply to name only).
- PAL-0610 (M/High): key identifier columns at the left.
- PAL-0620 (M/High): frozen (not horizontally scrolled).
- PAL-0630 (R/Med): location-managed contexts include physical location (bed). PAL-0640 (M/High): multi-location lists show full location in the cell, e.g. 'Remington Ward, bed B3'.
- PAL-0650 (R/Med): location is first column and default sort.
- PAL-0660 (R/Med): show unoccupied locations by default with text 'UNOCCUPIED' in the patient ID cell (never a blank line). PAL-0670 (R/Med): option to auto-hide unoccupied rows, revealing when occupied.
- PAL-0680/0690 (R/Med): appointment contexts: scheduled time in key identifier, first column, default sort.
- PAL-0700 (M/High): when a cell (or sublist item) has focus, highlight that row's key identifiers AND the column header (e.g. background colour).
- Known unmitigated hazard: resized columns may be partially obscured by frozen column border.

4.2.1 Managing columns
- PAL-0710 (R/Med): users choose displayed columns and order, except row key identifier columns.
- PAL-0720 (M/High): key identifier columns (patient identification, location) cannot be removed.
- PAL-0730 (R/Med): role-based default column sets (junior doctor, paediatric nurse, OT…).
- PAL-0740 (R/Med): first use of a column set: fit columns to viewport width; if sum of minimum widths exceeds viewport, use minimum widths.
- PAL-0750 (R/Med) filter per FSG 3.6; PAL-0760 (M/High): filter notification ABOVE the viewing area with strong visual differentiation (e.g. strong background colour).
- PAL-0770 (R/Med) sort per FSG 3.7 (progressive sort example: consultant name ascending, then age ascending); PAL-0780 (R/Med) group per FSG 3.8 (multi-ward lists should be groupable by ward).
- PAL-0790 (R/Med): persist column selection, sort, grouping and filter settings between sessions.

4.2.2 Refresh and update indication
- PAL-0800 (M/High): list can be refreshed from source. PAL-0810 (R/High) real-time; PAL-0820 (R/Med) auto-reflect ASAP.
- PAL-0830 (R/Med): if not real-time, auto-refresh at an interval communicated to users.
- PAL-0840 (R/Med): update notification field ABOVE viewing area showing count of updates marked for viewing.
- PAL-0850 (R/Med): include how many of those are out of view (horizontal and/or vertical).
- PAL-0860 (R/Med): non-real-time: show elapsed time since last refresh in the field. PAL-0870 (R/Med): manual refresh control near the field.
- PAL-0880 (M/High): updated cell marked with update symbol (example: corner triangle) + visual differentiation (e.g. background colour); symbol must not obscure content.
- PAL-0890 (R/Med): individual lists: don't mark the clinician's own updates.
- PAL-0900 (M/High): updated sublist entry: differentiate the entry only, not whole cell.
- PAL-0910 (R/Med): removed content: show notification in the cell, e.g. 'item removed'. PAL-0920 (R/Med): removed sublist items: notice at end of sublist, e.g. '3 items removed'.
- PAL-0930 (R/Med): user can unmark each update individually.
- PAL-0940 (R/Med): patient added: update symbol in patient ID cell + whole row differentiated; unmark as whole row.
- PAL-0950 (R/Low): patient removed: same (row becomes unoccupied location, marked).
- PAL-0960 (R/Low): 'unmark all' option next to the notification field.
- PAL-0970 (R/Med): unmarking is per-user; other users' lists unaffected.
- PAL-0980 (R/Med): 'unmark all' shows confirmation alert by default that user may not have seen all updates; option to suppress alert (shown unless selected).
- Update mark-up must NOT be used to indicate task status, responsibility or acceptance.

4.2.3 Historical list
- PAL-0990 (R/Med): view complete list for a specified point in time. PAL-1000 (R/Med): similar format to current.
- PAL-1010 (R/Med): emphasise its time and date. PAL-1020 (M/High): clearly differentiated (distinct colour scheme AND word 'Historical' in header).
- PAL-1030 (M/High): never display historical and current list at the same time.

4.2.4 Further information
- PAL-1040 (M/High): never show the list and individual patient information (records) at the same time (no side panels/pop-ups). PAL-1050 (M/High): navigating to other information replaces the list.

### Accessibility points
- Keyboard focus on a cell must highlight row key identifiers and column header (PAL-0700).
- Sticky headers, frozen identifiers, start/end-of-list indicators aid orientation; no truncation; wrapping text supports zoom [suggested: aria-sort, role="grid", aria-live for update counts].

### Patient-safety rationale
- Prominent dividers prevent adjacent cell text being read as one sentence (e.g. 'Chronic Pancreatitis' + 'Urinary antigens negative').
- Truncated sublists lead users to assume completeness ("prefer to see none than just some").
- Duplicate-name highlighting with first-differentiator underline mitigates misidentification (WHO).
- Separate historical/current and list/record views prevents attributing data to wrong patient or wrong time.

---

## Filtering, Sorting and Grouping (filtering.txt)

- **Purpose**: guidance (FSG-xxxx) for filter/sort/group of homogeneous tabular single-patient data (tested on medications and full blood count). Multi-patient lists only partially tested (but patlistview mandates its use).

### Data types and permitted operators (Table 5) / sort orders (Table 6)
| Value type | Data type | Filter operators | Sort orders |
|---|---|---|---|
| Discrete | Integer | less than, less than or equal to, equal to, greater than or equal to, greater than | Ascending/Descending (implicit) |
| Discrete | Ordered set of symbols | same five as integer | Explicit, supplied by ISV (e.g. Normal, Mild, Severe, Fatal; AVPU: Alert, Responds to voice, Responds to pain, Unresponsive) |
| Discrete | Unordered set of symbols (diagnosis, problem) | equals | Alphabetic / Reverse alphabetic |
| Discrete | String (free text) | equals | Alphabetic / Reverse alphabetic |
| Discrete | Date | on, before, on or before, after, on or after, between (inclusive of both dates) | Chronological / Reverse chronological |
| Continuous | Real number | less than, greater than (NO equality) | Ascending / Descending |
| Continuous | Date and time | before, after, between | Chronological / Reverse chronological |

### Normative guidance
3.5 Controls
- FSG-0001 (R/Med): controls ordered Filter, Sort, Group (left-to-right and in menus).
- FSG-0002 (R/High): labels 'Filter', 'Sort', 'Group by'.
- FSG-0003 (M/High): keyboard commands for all three. Tab order applies within dialogs, NOT to the toolbar.
- FSG-0004 (R/Med): multiple entry points: toolbar, header-cell context menu (right-click), keyboard.

3.6.1 Filter dialog
- Filter criterion = Attribute Selection Control + Operator Selection Control + Value Entry Control, on one line in that order (FSG-0016 R/Med).
- FSG-0005 (M/High): user-specified filtering supported. Filter specifies data to KEEP in view.
- FSG-0006/0007: avoid splitting the criterion line; if necessary keep operator and value together.
- FSG-0008 (R/Med): dialog title includes table name.
- FSG-0009 (R/Med): label above first criterion: 'Filter to show rows of' + X + 'where:' (X = row name, e.g. 'full blood count'). FSG-0010: label only above first criterion.
- FSG-0011 (M/Med): filter by any displayed column, in view or off screen.
- FSG-0012 (R/Low): single criterion directly in a header cell (one attribute at a time); FSG-0033/0034: header context menu 'Filter' shows operator + value controls inline.
- FSG-0013 (M/Med) and FSG-0088 (M): never mix units (metric/imperial) in one table. FSG-0014/0089 (R/Med): unit in header row.
- FSG-0015 (M/Low) and FSG-0079 (M/Low): dialogs never larger than screen.
- FSG-0017 (R/Med): buttons 'Preview', 'OK', 'Cancel'. Initially only Cancel enabled; all enabled once one criterion complete.
- FSG-0018: Preview applies filter without closing or confirming. FSG-0019 (R/High): OK closes and applies, no confirmation. FSG-0020 (R/High): Cancel closes and restores data as at dialog open, no confirmation.
- FSG-0021 (R/Low): prepopulate with current criteria.

3.6.2 Multiple criteria
- FSG-0022 (R/Low): multiple concurrent filters. FSG-0023 (R/Med): button 'Add'. FSG-0024/0025: 'Add' sits immediately below last criterion, left-aligned; pressing it inserts a new criterion line in its place and moves down.
- FSG-0026 (M/Med): radio buttons for logical AND vs OR; shown only once two criteria have been entered.
- FSG-0027 (M/High): OR is the default and listed FIRST. (Rationale: shows more data. Note: user research found nobody expected OR without radio buttons; guideline still mandates OR default.)
- FSG-0028 (R/High): AND label 'All must be true' or 'Match All'. FSG-0029 (R/High): OR label 'Any of which are true' or 'Match Any'.
- FSG-0051 (R/High): user chooses AND/OR. FSG-0052 (R/Med): NO logical NOT. FSG-0053 (R/High): one logical operator across all expressions (no mixing).
- Definitions: AND true if all true; OR true if any true.

3.6.3 to 3.6.7 Controls/operators
- FSG-0030/0031 (R/Low): attribute menu only displayed attributes, in table column order.
- FSG-0032 (R/Low): only operators valid for the attribute's data type. Offering 'equal to' for continuous values is shown as incorrect.
- FSG-0035 (M/Low): value control appropriate to type (date input for dates, integer input for integers).
- FSG-0036 (M/Low): 'between' shows TWO value controls immediately after the operator. FSG-0054 (R/Med).
- FSG-0037/0038 (R/Low): header-cell operator list may include 'custom', which opens the full dialog.
- FSG-0039..0050: operator labels exactly as table above ('on', 'before', 'after', 'on or before', 'on or after', 'between'; 'less than', 'greater than', 'equal to' (integers only), 'less than or equal to', 'greater than or equal to', 'equals').
- FSG-0043 (R/Low): numeric operators may be supplemented with '<', '=', '>' symbols.
- FSG-0055/0056 (R/Low): multiple expressions on the same attribute by adding another full line with same attribute; never two operator controls on one line.

3.6.8 Removing filters
- FSG-0057 (R/High): remove all in one action. FSG-0058 (M/Low): a remove button on each criterion line. FSG-0059: label 'Remove'. FSG-0060: remove-all label 'Remove All filters' (FSG-0063 calls it 'Remove filters').
- FSG-0061: single-filter Remove clears the three controls; FSG-0062: multi-filter Remove deletes that line; FSG-0063: remove-all clears all.
- Never offer remove-all ONLY via context menu; place in notification area and/or next to Filter button and in dialog. Rejected terms: 'reset', 'empty', 'undo', 'default'.

3.6.9 Results
- FSG-0064 (M/Med): filtered-out data NOT shown in filtered view (no greyed rows).
- FSG-0065..0067 (R/Med): access to filtered-in, filtered-out and all original data.
- FSG-0068 (R/Med): via tabs across the TOP of the data (labels in example: 'Data Filtered In', 'Data Filtered Out', plus original/all data tab). FSG-0069 (R/Med): never via left-hand panel/links.

3.6.10 Filter notification
- FSG-0070 (M/High): prominent notification of active filters. FSG-0071 (R/Low): attached to the table.
- FSG-0072 (M/High): never below the table (place above).
- FSG-0073 (R/High): prefix text 'Data filtered to show' followed by criteria.
- Notification includes the remove-all control.
- FSG-0074 (R/Low): filter dialog translucent background to show it occludes data.
- Discussed (not mandated): animate notification after inactivity; stop on any mouse/key activity.

3.7 Sorting
- FSG-0075 (M/High): user-specified sorting. FSG-0076: sort dialog. FSG-0078: title includes table name. FSG-0080: don't split sort line.
- FSG-0081..0084: 'Preview', 'OK', 'Cancel' with same semantics as filter.
- FSG-0085 (R/Med): default where dates exist: most recent first (top).
- FSG-0086/0092: prepopulate with current sort. FSG-0087 (R/Low): click header to sort (one attribute at a time); click anywhere in header cell toggles/reverses.
- FSG-0090 (R/Med): label above first attribute '1 - Sort X by:' (X = row name, e.g. 'medications'). FSG-0091: subsequent '<N> – Then, within <Y>, sort by:' (Y = attribute selected in previous control).
- FSG-0093 (R/Med): attribute menu: displayed attributes in table order, then non-displayed attributes. Attribute control is a select, never free text.
- FSG-0094..0096: 'Add' button (same behaviour as filter).
- FSG-0097 (M/Med): sort by any displayed column in or out of view. FSG-0098 (M/Med): sorting by a non-displayed attribute adds that column (at one end) and scrolls to show it.
- FSG-0099 (M/High): sort indicator in header cell of sorted column(s) showing order. FSG-0100 (M/High): up/down direction indicator (triangle). FSG-0101 (R/Med): tooltip definition. FSG-0102 (R/Med): fixed position within header cell (consistent across columns).
- FSG-0103 (R/High): do NOT label sort orders 'Ascending', 'Descending', 'Chronological', 'Reverse Chronological' in the dialog.
- FSG-0104 (R/High): use words: 'Newest', 'Latest', 'Most Recent', 'Oldest', 'Largest', 'Greatest', 'Smallest', 'First', 'on top'. Recommended pairs: dates 'Most Recent' / 'Oldest'; numbers 'Largest' / 'Smallest'; text 'A – Z' / 'Z – A' (FSG-0115); numeric range e.g. '0 – 9' / '9 – 0'. Sort order chosen via radio buttons below the attribute.
- FSG-0105..0111: sort orders per type (table above). FSG-0112: ISV order for ordinal types; FSG-0113: ISV order for continuous data with symbols (e.g. '<10'); FSG-0114: alphabetic fallback.
- FSG-0116..0120: 'Remove' per line, 'Remove All' for all sorts.
- FSG-0121 (M/Med): progressive (multi-key) sort. FSG-0122 (R/Med): show rank number '1', '2'… next to each sort indicator. FSG-0123 (M/Med): rank number placed ADJACENT to (not inside) the triangle and not visually associable with other numbers (e.g. normal ranges) in the cell.

3.8 Grouping
- FSG-0124 (R/High): clear, prominent group headings in the table. FSG-0125 (R/Low): sticky current group heading while scrolling.
- FSG-0126 (R/Low): never groups in separate tabs (nor left-hand links).
- FSG-0127..0129 (R/High): each group expand/collapse individually via state icon; click icon toggles. FSG-0130 (R/Low): all expanded initially.
- FSG-0131 (R/Med): menu item 'None' removes grouping. FSG-0132 (R/High): choose group attribute from menu on 'Group by' control.
- FSG-0133 (R/Med): retain column sort within groups. FSG-0134 (R/Low): 'null' group for items without a value.

### Accessibility points
- FSG-0003 mandatory keyboard access; dialogs tab-ordered; toolbar not in tab order (per doc). Refers to Accessibility Checkpoints / Accessibility for Clinical Applications (other docs). Sort indicator needs tooltip definition.

### Patient-safety rationale
- No equality on reals (floating point precision).
- No NOT operator (double negatives make filters unpredictable).
- Notification above table with 'Data filtered to show' prevents mistaking subset for full data or criteria for normal ranges.
- Access to filtered-out data mitigates acting on incomplete data.

---

## Terminology – Disambiguation and Error Correction (disambig.txt)

- **Purpose**: 2006 introductory stub only (25% complete). States that disambiguation/error-correction guidance lives in the Terminology Searching, Elaboration, Display Standards for Coded Information and Post Coordination entries.
- **Normative guidance**: none of its own. Context only:
  - Three note-taking environments: **Forms** (tick boxes/options; codes embedded in form; no encoding UI), **Code and elaborate** (select a code e.g. 'asthma', elaborate with codes e.g. 'severe' and free text e.g. 'mother anxious'), **Free text parser** (write text then identify/encode terms).
  - SNOMED CT is the chosen terminology. Encoding supports unambiguous sharing, decision support, audit, research.
- **Accessibility**: refers to Accessibility for Clinical Applications.
- **Safety**: encoding reduces ambiguity from abbreviations/jargon with multiple meanings.

---

## Release 4 Introduction to Handover Summary – presentation (handpresintro.txt)

- **Purpose**: slide summary of the Introduction to Handover document and spreadsheet structure. No UI rules.
- Content duplicated below (scope, definitions, types, users, stages, category sets with colours: Generic or Specific = Blue; Handover Stage = Pink; Handover Aspect = Orange; these are spreadsheet colour codes, not UI colours).

---

## Release 4 Introduction to Handover (handoverintro.txt)

- **Purpose**: introduction to handover concepts and how to read the requirements spreadsheet (v2.0.0.0, March 2007). Notes PSAs not yet applied.

### Key definitions and model (implementable concepts)
- Handover: "The transfer of professional responsibility and accountability for some or all aspects of care for a patient, or group of patients, to another person or professional group on a temporary or permanent basis" (BMA/NPSA 2004). CUI handover includes the patient group and list of relevant tasks; excludes referrals.
- Types: Shift handover; Geographic transfer (A&E to ward, ward to ward, theatre, investigations, GP to acute); Care transfer (paramedic to A&E).
- Classification dimensions: single/multiple patients; summary/full detail; roles; within role/between roles/multidisciplinary; care type changes or not; ad-hoc/planned; synchronous/asynchronous; face-to-face or not; patient present yes/no.
- Users: Patient, **Giver** of handover, **Receiver** of handover (use these terms, not incoming/outgoing); either may be sets of people; some users span both sides.
- Stages: Preparation (Before) -> Initiation -> Negotiation (During; 1 to 30 minutes typical) -> Acceptance -> Re-engagement (After). Unscheduled handover initiation preceded by a request. Acceptance usually by receiver; re-engagement is a key vulnerability point.
- Terms: **Item** (patient or non-patient unit, e.g. "please check the resus trolley"); **Dataset** (attributes per item, a part = 'attribute'/'dataset part'); **Snapshot** (static view of documentation at point handover accepted); **Handshake** (accepting or rejecting transfer of responsibility, involves both parties); **Handover event** (from initiation to acceptance; record includes date/time, location, attendees and roles, handshake status).
- Datasets vary by context; item list = rows, dataset per item = columns (Figure 4).
- Principles: single reliable source; updates hit the shared record, never a 'handover copy'; IT aggregates per-item data automatically; datasets not defined by CUI.
- Appendix B example datasets (useful as column presets): e.g. Hospital nurse (V13): Forename, surname, dob, NHS number, ward, consultant, diagnosis, clinical priority, clinical instructions, results to be reviewed, investigations to be requested, outcome, audit (user and time stamps); Surgical handover: name, location (ward and bed), date of admission, diagnosis, procedure (with date), complications and progress, management plan, resuscitation plan, consultant availability, expected need for review, name of doctor completing handover and date; Hospital 24/7: Bed, ward, consultant, last name, first name, hospital ID, priority, clinical summary, doctor's tasks, nurse's tasks, nurse's notes, doctor's handover notes; Hospital at Night ward view: beds total, beds free, dependency; MIST (paramedic), WEST (air traffic).

### Accessibility points
- None specific; mentions large shared displays and tablet PCs as future devices.

### Patient-safety rationale
- Adverse events cluster shortly after shift handover; re-engagement is a vulnerable point; poor handover implicated in disasters (Piper Alpha).

---

## Proposed controls

### 1. `PatientList`
Purpose: multi-patient tabular list implementing PAL guidance.
Props:
```ts
interface PatientListColumn<T> {
  id: string;
  title: string;                 // never truncated; wraps (PAL-0120/0150/0160)
  unit?: string;                 // shown in header (FSG-0014)
  align?: 'left' | 'center' | 'right'; // header matches content (PAL-0140); default 'left'
  dataType: FsgDataType;         // drives filter operators / sort orders
  isRowKey?: boolean;            // frozen, left, non-removable, prominent (PAL-0600..0620, 0720)
  render?: (row: T) => React.ReactNode;
  sublist?: (row: T) => React.ReactNode[]; // renders SubList (PAL-0390)
  ordinalOrder?: string[];       // ISV explicit order (FSG-0106/0112)
  minWidth?: number;             // computed default from widest word + margins (PAL-0210)
}
interface PatientListProps<T> {
  header: PatientListHeaderProps;
  columns: PatientListColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  managementMode?: 'location' | 'schedule' | 'none'; // default 'location'; first column & default sort (PAL-0650/0690)
  showUnoccupied?: boolean;      // default true (PAL-0660/0670)
  columnWidths?: Record<string, number>;
  onColumnWidthsChange?: (w: Record<string, number>) => void; // persist (PAL-0200)
  visibleColumnIds?: string[];   onVisibleColumnsChange?: (ids: string[]) => void; // PAL-0710/0720
  sort?: SortKey[]; onSortChange?: (s: SortKey[]) => void;
  filter?: FilterState; onFilterChange?: (f: FilterState | null) => void;
  groupBy?: string | null; onGroupByChange?: (id: string | null) => void;
  updates?: UpdateMark[];        // PAL-0880..0950
  onUnmark?: (ids: string[]) => void;
  realTime?: boolean;            // default true; false shows elapsed time + Refresh (PAL-0860/0870)
  lastRefreshed?: Date; refreshIntervalLabel?: string; onRefresh?: () => void;
  historicalAt?: Date;           // historical mode (PAL-1010/1020)
  showOutOfViewMessage?: boolean; // default true; hide until next session (PAL-0260)
  onOpenPatient?: (row: T) => void; // must replace list view (PAL-1040/1050)
}
```
States/variants: current, historical (distinct colour scheme via token, 'Historical' in header, never alongside current), filtered (notification banner above), grouped, with updates.
Behaviours: sticky header bar (PAL-0170); frozen row-key columns (PAL-0620); prominent vertical and horizontal dividers (PAL-0180/0290); 2-colour banding (PAL-0300); wrap, never truncate, auto row height (PAL-0320..0350); single vertical scroll with 'Start of list' / 'End of list' full-width indicators (PAL-0370/0380; exact wording not given, [suggested] 'Start of list' / 'End of list'); out-of-view arrows above viewport + 'columns out of view – scroll left and right' (PAL-0240/0250); resizing one column leaves others unchanged (PAL-0220), minimum width enforced (PAL-0210), auto-widen after update (PAL-0270); first use fits viewport (PAL-0740); keyboard grid navigation with focus highlighting the row key cells and column header (PAL-0700); identical/similar name detection with warning icon and underline on first differentiator (PAL-0540..0570). Implements PAL-0010..1050, FSG cross-refs.

### 2. `PatientListHeader`
```ts
interface PatientListHeaderProps {
  listFor?: { kind: 'clinician'; familyName: string; givenName: string; title: string }
          | { kind: 'individuals'; names: string[] }   // 'Patient List for: Mr Crossley, Mr Argos'
          | { kind: 'team'; name: string };            // 'Patient List for: Physiotherapists'
  service?: string;               // e.g. 'Baby Clinic'
  locations?: string[];           // joined ', ' ; or 'All Wards' (PAL-0090)
  timestamp: Date;                // last updated or current time (PAL-0040/0100)
  timestampKind: 'lastUpdated' | 'current';
  historical?: boolean;           // prefix 'Historical' and emphasise date/time (PAL-1010/1020)
}
```
Full width, always visible, larger/bolder text (PAL-0010..0030). Date/time formatted with the CUI date/time utilities (other groups). Implements PAL-0010..0100, 1010, 1020.

### 3. `PatientIdentificationCell`
Props: `familyName?: string|null; givenName?: string|null; title?: string; preferredName?: string; gender?: 'Male'|'Female'|...|null; dateOfBirth?: Date|null; nhsNumber?: string|null; temporaryNumber?: string; temporaryNumberLabel?: string /* default 'Temporary Number' */; similarity?: { kind: 'identical'|'similar'; differentiator: 'givenName'|'dateOfBirth'|'nhsNumber' } ; occupied?: boolean`.
Renders three lines in order name / DOB / NHS number (PAL-0450); 'Unknown' rules (PAL-0460..0500); 'UNOCCUPIED' when no patient (PAL-0660); warning icon + highlight colour + underline on differentiator (PAL-0540..0570); name prominent (PAL-0600). Delegates name/DOB/NHS formatting to banner utilities.

### 4. `SubList`
Props: `items: React.ReactNode[]; updatedIndexes?: number[]; removedCount?: number`. Each item its own row, lighter divider than row divider (PAL-0390/0400); never truncated (PAL-0410); updated items marked individually (PAL-0900); trailing '<n> item(s) removed' (PAL-0920).

### 5. `UpdateMarker` and `UpdateNotificationBar`
UpdateMarker: corner-triangle symbol, non-obscuring, plus highlight background; levels 'cell' | 'sublistItem' | 'row' (PAL-0880/0900/0940/0950); unmark individually (PAL-0930); 'item removed' placeholder (PAL-0910).
UpdateNotificationBar props: `totalMarked: number; outOfView: number; realTime: boolean; elapsedSinceRefresh?: number; onRefresh?: () => void; onUnmarkAll: () => void; confirmUnmarkAll?: boolean /* default true */; onSuppressConfirm?: () => void`. Placed above viewport (PAL-0840..0870, 0960, 0980). Unmark state per user (PAL-0970). [suggested] aria-live="polite".

### 6. `OutOfViewIndicator`
Props: `left: boolean; right: boolean; message?: string /* default 'columns out of view – scroll left and right' */; onDismiss?: () => void`. Positioned above viewport at left/right edges (PAL-0240..0260).

### 7. `DataToolbar` (Filter / Sort / Group by)
Props: `onFilter, onSort, onGroupBy, groupOptions: {id,label}[], groupBy: string|null, filterActive: boolean, onRemoveAllFilters?`. Buttons in order 'Filter', 'Sort', 'Group by' (FSG-0001/0002); 'Group by' menu includes 'None' (FSG-0131); keyboard shortcuts required (FSG-0003) [suggested keys not specified by doc]. Header-cell context menu offers same items in same order (FSG-0004).

### 8. `FilterDialog`
```ts
type FsgDataType = 'integer' | 'ordinal' | 'unorderedSymbol' | 'string' | 'date' | 'real' | 'dateTime';
type FilterOperator = 'lessThan'|'lessThanOrEqual'|'equalTo'|'greaterThanOrEqual'|'greaterThan'|'equals'
                    |'on'|'before'|'onOrBefore'|'after'|'onOrAfter'|'between';
interface FilterCriterion { attributeId: string; operator: FilterOperator; value: unknown; value2?: unknown }
interface FilterState { criteria: FilterCriterion[]; combine: 'or' | 'and' }  // default 'or'
interface FilterDialogProps {
  tableName: string;          // in title (FSG-0008)
  rowNoun: string;            // 'Filter to show rows of {rowNoun} where:' (FSG-0009)
  attributes: { id: string; label: string; dataType: FsgDataType; options?: string[] }[]; // table order (FSG-0031)
  initial?: FilterState;      // prepopulate (FSG-0021)
  showOperatorSymbols?: boolean; // append '<','=','>' (FSG-0043), default false
  onPreview: (f: FilterState) => void; onOk: (f: FilterState) => void; onCancel: () => void;
}
```
Behaviour: one criterion line by default (attribute, operator, value); 'Add' below last line left-aligned; per-line 'Remove'; 'Remove All filters'; radio group shown once ≥2 complete criteria, OR first and default, labels 'Any of which are true' / 'All must be true' (or 'Match Any' / 'Match All'); no NOT; single combinator; operators restricted by type; 'between' renders two value inputs; value input type per data type; Preview/OK/Cancel (OK/Preview disabled until a criterion is complete); never larger than viewport; translucent backdrop (FSG-0074). Implements FSG-0005..0063, 0074.

### 9. `HeaderCellFilter`
Inline operator + value controls from header context menu, single attribute only, operator list may include 'custom' which opens FilterDialog (FSG-0012, 0033, 0034, 0037, 0038).

### 10. `FilterNotification`
Props: `criteria: FilterCriterion[]; combine; attributes; onRemoveAll: () => void`. Rendered directly ABOVE the table, attached, strong background (PAL-0760, FSG-0070..0073); text starts 'Data filtered to show'; includes remove-all button. Never below table.

### 11. `FilterResultTabs`
Tabs across top: 'Data Filtered In' | 'Data Filtered Out' | [suggested label] 'All Data' (FSG-0064..0069). Filtered-out rows never shown greyed in filtered view.

### 12. `SortDialog`
Props: `tableName; rowNoun; attributes (displayed first in table order, then hidden) ; initial?: SortKey[]; onPreview; onOk; onCancel; onAddColumn?: (id) => void`.
`interface SortKey { attributeId: string; direction: 'asc' | 'desc' }`.
Lines labelled '1 - Sort {rowNoun} by:' then '{n} – Then, within {prevAttributeLabel}, sort by:'; attribute is a select (never free text); radio buttons for order using labels from `sortOrderLabels()`; 'Add', per-line 'Remove', 'Remove All'; Preview/OK/Cancel. Implements FSG-0075..0098, 0103..0121.

### 13. `SortIndicator`
Props: `direction: 'asc'|'desc'; rank?: number /* shown when progressive */; definition?: string /* tooltip */`. Up/down triangle at fixed position in header cell; rank number adjacent, not inside, visually separated from other header numbers (FSG-0099..0102, 0122, 0123). Clicking header cell toggles single-key sort (FSG-0087). [suggested] aria-sort on the header.

### 14. `GroupHeaderRow`
Props: `label: string; count?: number; expanded: boolean; onToggle: () => void; sticky?: boolean`. Prominent heading in table, expand/collapse icon toggles, all expanded initially, sticky while scrolling, null group for missing values; never tabs (FSG-0124..0134).

### 15. `ColumnChooser`
Props: `columns; visibleIds; onChange; presets?: {id,label,columnIds}[]`. Row-key columns locked (cannot remove/reorder), role-based presets (PAL-0710..0730). Method/UI explicitly out of scope; any UI acceptable.

### 16. `HistoricalSnapshotBanner` / snapshot mode
Shows 'Historical' + emphasised date/time, uses historical colour-scheme token; host must swap, not overlay, current list (PAL-0990..1030; handover RID 40, 42, 48).

### 17. Handover controls (from requirements; no visual specs given, all [suggested] beyond requirement text)
- `HandoverStatusIcon` ('handed over' vs 'to hand over', RID 82).
- `HandshakeDialog`: records date, time, place, giver, receiver, others present, satisfaction; Accept / Refuse by receiver (or giver refusing), refusal recorded identically; retrospective 'unsatisfactory' note with time/date/user stamp and incident flag (RID 20, 22, 27, 31, 87, 139). Must never block access to the patient record (RID 30).
- `ResponsibilityIndicator`: currently responsible clinician + consultant (RID 12, 64, 89).
- `TaskList` item states extensible (RID 75), manual removal only (RID 104), hide-completed toggle (RID 122), overdue alert (RID 53), completed-by/vouched-by (RID 21), handover highlight flag (RID 54).
- `ReadBackPrompt` for similar names + DNR (RID 108). `ProvenanceStamp` 'last updated' (RID 141).

### Utility functions
1. `formatPatientListName(family?: string|null, given?: string|null, gender?: string|null): string`
   - familyPart = family ? family.toUpperCase() : 'UNKNOWN'
   - givenPart = given ? given (as stored, first capital) : 'Unknown'
   - result = `${familyPart}, ${givenPart}` + (gender ? `, ${gender}` : '')
   - Title/salutation and preferred name per Patient Banner rules (other group). (PAL-0460..0480, Table 7)
2. `displayOrUnknown(value, formatter)`: returns 'Unknown' for missing DOB or NHS number (PAL-0490/0500).
3. `findDuplicateNames(patients, opts?: { similar?: (a,b)=>boolean })`: group by normalised (family + given) exact match (case-insensitive, trimmed) => 'identical'; optional similarity function (e.g. [suggested] Soundex/Double Metaphone or edit distance) => 'similar'. For each pair in a group compute `firstDifferentiator(a,b)`:
   - if given names differ (for 'similar', also if merely similar but not identical) => 'givenName'
   - else if DOB differs => 'dateOfBirth'
   - else => 'nhsNumber'
   (PAL-0550/0570; for similar names the DOB step applies "if identical or similar" given names.) For groups >2, mark on each patient the earliest element that differs from at least one other member [suggested].
4. `permittedFilterOperators(type: FsgDataType): FilterOperator[]` exactly per Table 5:
   - integer, ordinal: lessThan, lessThanOrEqual, equalTo, greaterThanOrEqual, greaterThan
   - unorderedSymbol, string: equals
   - date: on, before, onOrBefore, after, onOrAfter, between
   - real: lessThan, greaterThan
   - dateTime: before, after, between
5. `filterOperatorLabel(op, withSymbol?)`: 'less than', 'less than or equal to', 'equal to', 'greater than or equal to', 'greater than', 'equals', 'on', 'before', 'on or before', 'after', 'on or after', 'between'; optional symbol suffix '<', '=', '>' for numeric (FSG-0043) [suggested '≤', '≥' for the compound ones, doc lists only '<','=','>'].
6. `evaluateFilter(rows, state, attrs)`: per criterion compare per operator; 'between' inclusive of both bounds; date operators compare at day granularity ('on' = same calendar day); real 'equal' forbidden (throw/validate); combine with OR (any) or AND (all); single combinator; no NOT. Return `{ filteredIn, filteredOut, all }`.
7. `validateFilterCriterion(c, attr)`: operator must be in permitted list; 'between' requires value and value2 [suggested: value <= value2]; value type matches data type (integer must be whole number).
8. `sortOrderLabels(type)`: date/dateTime => ['Most Recent','Oldest'] (desc first, matches FSG-0085 default); integer/real => ['Largest','Smallest']; string/unorderedSymbol => ['A – Z','Z – A']; ordinal => ISV-supplied labels; never 'Ascending/Descending/Chronological/Reverse Chronological' in dialog.
9. `defaultSort(columns, managementMode)`: location column asc if managementMode 'location' (PAL-0650); scheduled time asc if 'schedule' (PAL-0690); else first date column most-recent-first (FSG-0085).
10. `progressiveSort(rows, keys, attrs)`: stable multi-key comparator; ordinal via `ordinalOrder` index; strings alphabetic (locale compare, en-GB); fallback alphabetic (FSG-0114); nulls [suggested] last. Group sort retained within groups (FSG-0133).
11. `groupRows(rows, attrId)`: groups preserving current sort; null/undefined values into a 'null' group (FSG-0134) [suggested label '(No value)'].
12. `filterNotificationText(state, attrs)`: 'Data filtered to show ' + criteria joined by ' or ' / ' and ' per combinator, each as `${attrLabel} ${operatorLabel} ${value}` (between: `${v1} and ${v2}`) [joining wording suggested; prefix mandated by FSG-0073].
13. `sortDialogLabel(index, rowNoun, prevAttrLabel)`: index 1 => `1 - Sort ${rowNoun} by:`; n>1 => `${n} – Then, within ${prevAttrLabel}, sort by:` (FSG-0090/0091).
14. `computeMinColumnWidth(title, cellTexts, measure, margins)`: max over all words in title and content of measured word width + left + right margin (PAL-0210).
15. `fitColumnsToViewport(minWidths, viewportWidth)`: if sum(min) >= viewport use mins; else distribute extra proportionally [distribution method suggested] (PAL-0740).
16. `countUpdates(marks, visibleRect)`: total marked and number out of view horizontally/vertically (PAL-0840/0850).
17. `formatElapsedSinceRefresh(ms)`: [suggested] 'Last refreshed 5 minutes ago' (PAL-0860 mandates showing elapsed time, wording not given).
