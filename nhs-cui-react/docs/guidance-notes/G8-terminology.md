# Terminology (SNOMED CT) matching, post-coordination, elaboration

Conventions in these notes: MUST / SHOULD / COULD follow the documents' own Must/Should/Could wording. "(conf H/M/L)" is the document's confidence level (High/Medium/Low) where stated. Section numbers are the document's own. Quoted labels are the documents' exact wording. Anything not in the source is marked [suggested].

## Design Guide Entry - Terminology - Matching (termmatching.txt)
Version 1.0.0.0 Baseline, 27-Mar-2007 (TOC ref 4.1 "UI Interaction Model for Terminology Matching"). Replaces "Terminology - Disambiguation and Error Correction" and "Terminology - Searching". Read with Display Standards for Coded Information {R3}, Elaboration {R4}, Post Coordination {R2}. Note: not yet subject to formal Patient Safety Assessment.

**Purpose:** How a clinical noting UI matches clinicians' typed notes to SNOMED CT concepts: input areas, matching triggers/algorithms, presenting/confirming/undoing matches, abbreviations, context filtering (subsets, clerking headings), and hierarchy refinement.

### Three encoding environments (1.1)
- Forms: user selects options; codes embedded in form; no encoding interface needed.
- Single concept matching: user types note for one concept (e.g. 'asthma'), system returns matches; user chooses, refines, elaborates with free text, qualifying attributes ('severe') and numeric values.
- Text parser matching: user types unconstrained text; system matches words/phrases and displays matches; user can (a) confirm encoding, (b) browse alternative matches, (c) refine a selected match, (d) leave note unencoded (saved as unstructured text).
- User interaction model steps (1.2): Set context; Enter text; Display expression matches; Browse alternative / Refine selected match(es); Leave as unstructured text; Confirm match(es); Offer opportunity to request improvement.
- Scope: encoding in a single interaction at point of care; NOT post-hoc encoding by coders; not storage.

### Key requirements (Appendix A, those cited as in force)
- A1.1 encoding solely from keyboard-driven interaction (listed in appendix); A1.2 must not prevent voice/touch entry.
- B1.1-B1.4 limit search to contextual SNOMED portions; clearly communicate which portion is searched; auto-set context from prior text; expand/contract/sort results by contextual categories ('symptoms', 'procedures').
- B2.5 fuzzy matching with 'best guess' + view alternatives. B2.6 MUST NOT commit to record any encoded term not confirmed by user. B2.9 predictive matching. B2.10 flexibility when to encode before commit.
- B3.1 search on SNOMED abbreviations; B3.3 display in encoded notes both abbreviation entered and its expansion; B3.5 single or multiple word prefixes, independent of order. (Withdrawn/greyed: B3.2 user shortcodes, B3.4/B3.6 keyboard shortcuts, B3.7.)
- B4.1 display categories (e.g. TLCs) where appropriate to distinguish similar results; B4.2 navigate long lists; B4.3 move to related terms; B4.4 user sees clear definition and Preferred term before committing; B4.5 full text up to 255 characters; B4.6-B4.8 ranking communication/reorder/relevance; B4.9 communicate if truncation occurred.
- B5.1 specify term only nearly correct; B5.2 record gave up encoding; B5.3 log approximate codes; B5.6 on poor match encourage navigating up hierarchy to more general term. (B5.4/B5.5 withdrawn in table 2 list.)
- C1.1 refine key attributes; C4.1 prompt for meaningful composites.
- Part III/IV appendix also lists (all as requirements): C1.2 negate disorder concepts; C1.3 identify pre-coordinated negated concepts in results and present differently/omit; C1.4 refine original concept without losing refined attributes (e.g. 'muscle injury' -> 'muscle strain' keeping 'hamstring tendon'); C1.5 handle refinement mismatches; C1.6 refine multiple attributes simultaneously; C1.8 graphical body-site navigation where feasible; C1.9 elaboration values not defined by SNOMED (time values, BP, temperature); C1.10 numeric values must show units, choice of units presented clearly; C1.11 encourage refining mandatory attributes; C1.12/C1.13 multi-level hierarchical refinement, multiple attributes; C1.14 undo/re-refine any elaboration; C1.15/C1.16 apply/move elaboration to other concepts if allowed; C1.17/C1.18 render meaningfully, structured and 'narrative' views; C2.1-C2.4 system identifies attribute relationships in free text, scope limited (e.g. marquee defined by full stops; up to four potential codes within a grouping marquee), pre-populate elaboration fields, capture associated free text; C3.1-C3.4 associate free text with concept, adjust what text becomes structured, add notes, warn if text contains qualifications (e.g. negation) conflicting with qualifiers; D1.1-D1.8 flexible display, encoded and unencoded, clearly distinguish text that will/won't be encoded, edit (re-encode) before commit, prose + structured view consistent, view original text entry; D2.1-D2.4 communicate encodable text, distinguish standalone-encodable vs elaboration-only text (e.g. 'mild' only as elaboration of 'gastroenteritis', never alone), distinguish potentially encodable vs encoded (unconfirmed = saved as free text), show top match plus typed text; D3.1-D3.3 show code-elaboration relationships, potential relationships, potential vs user-confirmed.

### 2.1.1 Single concept approach (conf H)
- MUST allow search for a single concept and immediately view matches; available standalone or as part of match refinement in Text parser approach.
- MUST allow additional 'free' (unencoded) text as part of single concept matching.
- System records Concept ID AND the specific Description ID chosen (e.g. Preferred term) plus elaboration.
- Ensure user encodes at least one SNOMED concept: user must not be allowed to record elaboration only.
- Do NOT offer single concept approach when clinician expected to enter large/rich notes, or notes needing post-coordinated expressions (use Text parser).

### 2.1.2 Text parser approach (conf H)
- MUST allow typing free-text notes without requiring any further actions until they save.
- MUST suggest SNOMED matches based on typed text.
- Do NOT automatically save SNOMED concepts without user's explicit confirmation (patient safety).

### 2.2.1 Input in Text parser approach (conf H unless noted)
- Layout: 'Suggested matches area' column on the LEFT; 'Text input area' on the RIGHT, left-justified. Matches area may expand left-to-right over the text input area.
- Text input: white (or just off-white) background, well-contrasted dark grey border. Suggested matches area: light blue / very light off-white or pale blue background. Both contrast with light grey dialog background.
- Labels: text area 'Type your notes here:'; matches area 'Tick to confirm that this is what you mean:' (COULD wording; a distinct label MUST exist for each).
- SHOULD grey-out the matches label and the matching area until at least one SNOMED concept is matched and displayed.
- MUST clearly defined area to type; MUST be separate from matches area; MUST allow full range of alphanumerics; SHOULD allow punctuation and capitals; SHOULD NOT allow formatting (bold, underline, highlight). COULD allow cut/copy/paste within field and to/from other apps (conf M).
- MUST readable font, e.g. Arial 10 point minimum.
- MUST clearly indicate where to start typing; SHOULD put cursor at top-left; COULD flash cursor.
- Width of Text input area SHOULD NOT exceed 60 characters; fewer limits on depth.
- As user types, system draws a marquee (dashed-line perimeter) around matched characters; yellow bars either side indicate focus and allow marquee manipulation (drag to resize).
- 'Clerking headings' can be inserted in the text area; visually distinct formatting; influence filtering (2.4).

### 2.2.2 Input in Single concept approach (conf H; progressive = M)
- MUST clearly defined text field, distinct from match results area; MUST allow multiple words, full alphanumeric range; COULD allow punctuation/capitals.
- MUST visible width of 32 characters; MUST accept up to 255 characters. Beyond 32, field scrolls horizontally (no scroll bar) keeping last typed character visible.
- MUST allow deletion: MUST Backspace; COULD select + Delete. SHOULD NOT allow formatting. Arial 10pt minimum.
- SHOULD progressive matching: match on each character typed or deleted, with ~200 ms delay (debounce) to reduce server requests. Prefix matching on multiple words, order independent ('Nec fem' / 'Fem nec' -> 'Neck of femur').
- If progressive not feasible: 'Go' button immediately right of field (icon with tooltip); ENTER key also triggers.
- After selection: input field disappears, replaced by the match's label with small black down arrow (▼); focus automatically moves to 'OK' button; 'Additional text' field appears below.
- Hovering label: area turns orange and 'clickable' (slightly embossed). Clicking label re-opens input pre-populated with last input text (e.g. 'anxiet'), list shows previously selected concept ('Recurrent anxiety') selected at top with appropriate scroll position.
- SHOULD allow mouse to move just outside list item/fly-out (e.g. over scroll bar) without fly-out disappearing.
- MUST 'OK' button (in main dialog, NOT in fly-out) to close and save; SHOULD allow double-click on list item to close and save; MUST 'Cancel' button to close without saving.
- Clicking away from list closes it without selection. Selected match shown in bold in list.

### 2.2.3 Additional text input
- MUST allow 'additional' text associated with selected concept; MUST clearly defined field, distinct from single concept input field (conf H). Located below search input. Matched concept acts as heading.
- SHOULD label it; COULD label 'Additional text' as grey placeholder inside the field, disappears on click/tab focus, reappears on blur if empty (conf L).
- MUST visible height min three lines (conf M); MUST vertical scrolling when overflowing.
- Backspace MUST, select+Delete COULD, no formatting, Arial 10pt min.
- Text is saved with concept and parsed for attributes (see Elaboration).
- Rationale: clinicians record 'weak' suspicions / note-to-self that must not be encoded.

### 2.2.4 Spell-checker (Text parser only; only when full-word, not prefix, matching) (conf M)
- MUST identify all words not SNOMED-matched and not in a standard English dictionary.
- SHOULD underline with red dashed (wavy) line; remove underline once resolved.
- SHOULD open spell-checker dialog on click of the word; offer suggestions from SNOMED and English dictionary; allow selecting one; allow closing without selecting; replace word with selection.
- MUST NOT automatically confirm words selected in the spell-checker (could be part of post-coordinated expression confirmed as a unit).
- COULD offer buttons: OK (change word), Ignore (close, remove underline), Cancel (close, keep underline).
- After selection system automatically re-runs post-coordination parse.
- Do NOT highlight an unrecognised word as encodable where a gross error can't be resolved by fuzzy matching.

### 2.2.5 Clinicians' shorthand (conf L)
- SHOULD recognise limited set of non-SNOMED shorthand from an NHS-maintained database mapping to SNOMED or administrative terms (e.g. dates).
- Shorthand underlined like spell-checker plus small red triangle in top-right of the marquee. Warning in corresponding suggested match shows shorthand as free text. Click opens pop-up menu of resolutions (e.g. '3 months'); clicking away closes it; after choice system re-parses.
- Do NOT translate shorthand automatically without explicit user action. No 'top match' shown for shorthand.

### 2.3.1 Matching algorithm
- MUST match against 'Preferred term' and 'synonym' descriptions (conf H). Do NOT match input against Concept ID or Fully specified name.
- SHOULD statistical word matching; SHOULD vector-space algorithm for multi-word text.
- MUST communicate when a match is a synonym; SHOULD do so in the fly-out (hover).
- MUST allow viewing FSN for any concept; SHOULD in fly-out on hover.
- MUST consistent matching trigger in Text parser approach; options (COULD, conf M): each character (progressive); word boundary (space); sentence boundary (full stop or carriage return); regular interval (e.g. every 200 ms); plus batch, line-by-line, user-triggered. Matching must not interfere with typing.
- SHOULD reject matches below similarity threshold (conf L); threshold ~70% (excluding exclusion-list words). Example: 'leg' alone returns nothing; 'leg fracture' needed. Exclusion list of common words (prepositions 'for', 'to') is NOT currently recommended guidance.
- Text parser base concepts limited to hierarchies 'Clinical findings', 'Procedures', 'Observable Entities', 'Situations with explicit context' (+ 'Events' in some contexts), unless the concept post-coordinates with one; 'Pharmaceutical/biological products' excluded as base.
- Equivalence (word equivalence tables, e.g. nose=nasal, boil=furuncle, rupture=tear) (conf M): SHOULD match equivalents; MUST two states 'on'/'off'; MUST user control; MUST be OFF by default where matching is progressive (single concept, encoding dialog); COULD be on by default where not progressive; if progressive matching returns no results after a word boundary (space/CR) and equivalents are recognised, system automatically switches it ON and shows control as on; MUST clearly indicate when on (SHOULD near results list); MUST show which equivalent words are searched (SHOULD adjacent to input field); equivalence only on complete words. Do NOT switch equivalence on automatically if some matches returned. Opt-out match-by-match recommended.
- SHOULD prefix matching and progressive matching in single concept + encoding dialog; MUST display matches close to input (SHOULD below it).
- MUST timely: SHOULD invoke matching within 200 ms of key press; present matches within 200 ms of last key press.
- MUST match multiple words to multi-word descriptions, regardless of order; MUST match longest adjacent string possible (subject to post-coordination parse).
- MUST display top match candidates where viable, visible while typing; SHOULD in area adjacent to and immediately LEFT of the text parser field.
- MUST allow user to confirm suggested matches before they are saved as codes.
- Async implementation note: tag each request with an incrementing integer; ignore responses if text changed since request.
- Global filters (2.4): 'Core' SNOMED + UK extension, UK language set, concepts status 'current' or 'pending move' only (MUST, conf H).

### 2.3.2 Presenting matches
- Text parser: show top matches only, with control to see alternatives. Single concept: full list immediately.
- Top matches column: stacked vertically, earliest at top, most recent at foot; each bounded (rectangle or lozenge); pale blue background, yellow when in focus/hovered; linked by colour to text; MUST auto scroll bar when overflowing; MUST not obstruct noting; MUST be visible while typing.
- Each confirmation uses a check box (replaced earlier '?' symbol). Unchecked = 'not coded', checked = 'coded'.
- MUST warn if very similar alternative matches or 'child' (more specific) matches exist (conf M); SHOULD indicate clicking the area shows them. On hover, area indicates: similar spelling alternatives; more specific children; same-spelling alternatives.
- If alternative with SAME spelling exists, the check box is DISABLED until the user has opened/viewed the alternatives. Similarity thresholds to be agreed by NHS (patient safety).
- Alternative list default view shows up to nine matches; scroll or stretch dialog for more. Ordered by statistical relevance, with 'common' matches section at top separated by a line and headers.
- MUST show matched synonym label if synonym matched, else Preferred term label. MUST expose Preferred term, synonym and FSN. MUST keep Concept IDs hidden from clinician.
- List width MUST allow 32 characters; SHOULD wrap labels >32 chars onto second line indented by two characters; SHOULD truncate labels >62 characters with ellipsis ('…') at end (full label via fly-out FSN). Users prefer wrapping over single-line truncation.
- Definition fly-out: opens automatically to the right of the highlighted item as focus moves; shows FSN, synonym indication, and parent concepts ('is a' relationships) immediately below highlighted concept. Label first parent 'Is a', further parents 'And a' (avoid implying mutually exclusive choices). Fly-out contains 'Browse for related concepts' button.
- Do NOT show TLC suffix next to each match (e.g. 'Fever (clinical finding)'). Do NOT number list items ('1. Anxiety').
- No matches: single concept shows no list, no fly-out; text parser shows nothing in Suggested matches and no encodable highlight. Context menu on selected text 'Find matches for this text' opens encoding dialog pre-populated.
- MUST method for reporting 'No matches found' (conf M): right-click unmatched word -> report option, or 'No match found' button at foot of dialog launching wizard. System will not encourage entering an 'approximate' concept; user browses up hierarchy or leaves as free text.

### 2.3.3 Selecting and confirming (Text parser)
- MUST allow confirm / not confirm each suggested match; SHOULD check box per match.
- MUST allow viewing full list per suggested match; SHOULD by clicking match label; COULD label turns orange and embossed on hover.
- COULD highlight suggested match area yellow on hover; SHOULD show drop-down arrows next to labels in highlighted area to indicate more matches.
- SHOULD synchronise: highlight in left column reflects focus in text area and vice versa; clicking a suggested match moves focus/marquee to corresponding text. Hovering marquee does not move selection.
- On confirm, SHOULD replace original typed text with SNOMED label (Preferred term or synonym).
- MUST (conf M) only enable confirmation check box when no unselected mandatory elaboration fields (e.g. laterality required; 'unspecified' is acceptable value).
- SHOULD disable check box if alternative with same spelling as top match until expanded list viewed.
- Clicking label opens list of alternatives plus an editable input (progressive). Selecting an item from the list closes the list and AUTOMATICALLY confirms the match. Clicking away closes without change.
- Code saved only on final 'OK' of the noting dialog.

### 2.3.4 Abbreviations
- MUST search abbreviations like any synonym, in both approaches; SHOULD be case-insensitive ('TATT', 'Tatt', 'tatt' equivalent); do NOT force capitals.
- SHOULD show abbreviation and FSN in fly-out.
- MUST (conf L) show combined label of acronym + FSN (FSN minus semantic tag such as '(disorder)') where synonym label doesn't expand acronym (e.g. two 'SLE': Systemic lupus erythematosus 55464009; Neuroinvasive St. Louis encephalitis virus infection 417607009). MUST render combined label in text area on confirmation. Exceptions (e.g. 'Laser') via NHS-maintained list.
- Abbreviations always displayed in CAPITAL letters and bold; always expand abbreviation in results list and modifier dialog.
- Same-spelling acronyms trigger same-spelling disabled-checkbox mechanism.

### 2.3.5 Undoing matches
- MUST allow undoing confirmation; SHOULD by unticking check box, or clicking/double-clicking concept text in text area (opens encoding dialog with check box deselected).
- MUST return text to original form on un-confirm.
- MUST (conf L) 'Undo' and 'Redo' buttons (top right of window) undoing the last matching/parsing request; visible from main window.

### 2.4 Context
- Semantic context: e.g. 'Aspirin' entered under 'Does the patient suffer from any drug allergies?' must be saved as post-coordinated 'Allergic reaction to drug | Has causative agent | Aspirin' (equivalent to 'Aspirin allergy' 293586001). Display simplest form: base concept 'Allergies' + value 'Aspirin'; do NOT display attribute name 'Has causative agent'.
- Context factors: corporate (Trust/practice), clinical speciality, provider type, patient, note-taking task.
- 2.4.1 MUST filter by subsets where available (H); MUST allow users to adjust subset filters (M); control next to clerking headings and above encoding-dialog input (COULD); SHOULD '▼' icon to open subset control; MUST not obscure listed matches; MUST place control level with or above the heading label.
- SHOULD slider control when subsets nested (linear); SHOULD NOT slider when unrelated; binary radio buttons 'Filter' / 'No filter' when no nesting. MUST NOT display more than three subset levels.
- MUST instructional text in control explaining what it does and why; COULD dynamic per level. Label showing current filter e.g. 'Current filter: Lifestyle and Allergens' (preferred over 'Filter = On'). COULD call it 'Filtering'.
- Single concept: subset shown in a button ABOVE the input field; label truncated with ellipsis if >20 characters (no wrapping); full label inside the control.
- SHOULD close subset dialog on click-away; adjusting filter SHOULD immediately update matches; MUST human-readable subset labels; MUST allow multiple subsets simultaneously where appropriate.
- SHOULD push 'common matches' subset to top of list, separated by a line with headers (e.g. common vs 'other relevant matches').
- SHOULD only display clerking headings in the text input area; heading insertion control undefined.

### 2.5.1 Refinement / hierarchy browse (conf L)
- MUST allow navigating parts of hierarchy; SHOULD only after a concept is selected (hidden until requested via 'Browse for related concepts' button in fly-out). Opens modal dialog over encoding dialog.
- MUST distinguish parents, siblings, children; SHOULD 'three list box' layout: left = parents, middle = siblings (children of all parents, 'step' siblings), right = children; MUST label each list; SHOULD alphabetical order; MUST show currently selected concept clearly ('selected' field).
- Selecting an item makes it the selected concept/focus; SHOULD double-click to select and close; 'OK' closes dialog (and expanded list) and auto-confirms if no outstanding mandatory fields. 'Back' button returns to earlier refinement.
- COULD refine defining attributes via tabs (e.g. 'Fracture of forearm': associated morphology 'Fracture', finding site 'Bone structure of forearm'); result displayed with user-friendly attribute labels e.g. 'Fracture, site of Bone structure of radius'. After attribute refined, 'Browse related concepts' tab hidden (reappears via Back).
- When browsing part of a post-coordinated expression MUST limit hierarchy to concepts allowed to post-coordinate with base.
- Reopening encoding dialog after a refined concept: input blank, refined concept shown below.
- Users disliked tree design; preferred three list boxes.

### Next steps notes (not guidance)
- Keyboard shortcuts not specified (designs must not preclude keyboard-only use). Word-ending search, exclusion list, pharmaceutical disambiguation (prescribe / administered / history / supply), axis-modifier display, attribute search not defined.

### Accessibility points
- Must not preclude keyboard-only interaction (A1.1); focus moves to 'OK' after selection; ENTER triggers Go; tab into Additional text.
- Arial 10pt minimum readable font; contrast between editable (white) and non-editable (pale blue) areas against light grey dialog.
- Grey placeholder label must not be the only label [suggested: also provide aria-label].
- Not to rely solely on colour: check boxes, warnings text, down-arrow icons supplement colour coding.

### Patient-safety rationale
- Encoding lends notes greater legitimacy; mis-encoding harder to spot, so explicit user confirmation required for every code (B2.6).
- Same-spelling alternatives/acronyms (e.g. SLE) force viewing before confirmation; acronyms displayed with FSN.
- Spell-check before matching avoids fuzzy matches compounding errors; no auto-confirm.
- Similarity threshold reduces inappropriate matches; similarity warning thresholds set by NHS.
- Concept IDs hidden; FSN and parents ('Is a'/'And a') shown to disambiguate.

## Design Guide Entry - Terminology - Post Coordination (termpostcoord.txt)
Version 2.0.0.0 Baseline, 27-Mar-2007 (TOC ref 4.4 "Terminology - UI Interaction Models for Post Coordination"). Read with Matching, Display Standards {R3}, Elaboration {R4}.

**Purpose:** How the Text parser UI builds, presents, adjusts and confirms post-coordinated SNOMED CT expressions (base concept + attribute name/value pairs), including negation ('No') and uncertainty ('?').

### Concepts and definitions
- Post-coordination: "A representation of a concept using a combination of two or more codes". Expression = base concept | attribute name | attribute value. Examples: 'Total gastrectomy' (26452005) = Gastrectomy (53442002) | Procedure site (363704007) | Entire stomach (181246003); 'Fracture of radius' (12676007) = Fracture (125605004) | Finding site (363698007) | Bone structure of radius (62413002).
- Forms: subtype qualification (qualification; refinement of a defining attribute; unsanctioned qualifiers; nested qualifiers) vs axis modification (incl. negation; e.g. relating to mother / family history, 'Known absent') which is NOT a subtype and must be treated differently; concept combination and linkage (e.g. Anaemia | Due to | Ascorbic acid deficiency).
- Non-SNOMED values (time, units, readings e.g. '38.9' 'Degrees centigrade' for 'Body temperature') attach like attribute values via external information model (HL7 v3 / EN13606).
- Notional note structure: a pre-coordinated expression, post-coordinated expression, free text expression, or info-model configuration. Each SNOMED expression may carry numeric/time values and free text, and MUST have axis-modifier values (usually 'soft' defaults not explicitly shown). Each output unit = no more than one expression.
- Base concept categories: Clinical findings, Procedures, Observable entities, Situation with explicit context. Observable entity as base only post-coordinates with numeric values. Numeric values cannot be recorded as values (only free text) unless associated with an encoded expression. 'Pharmaceutical/biological products' excluded as base.
- Definitions: Sanctioned relationships (row in Relationships table) vs Allowable (pattern in Concept Model, limited to same general type). Nested qualifier: value is a refinement of a refined concept. Fully defined vs primitive concepts.

### 2.1.1 Matching post-coordinated expressions in text
- MUST allow users to define expression boundaries (conf H).
- MUST match expressions of concepts linked by Concept Model attribute relationships (conf H).
- MUST ensure at least one base concept per expression (conf M).
- SHOULD score/rank/select expressions by: fit of base concept (COULD as 'efficiency of fit' and 'scope of fit'); fit of linked attribute concepts; proximity/order weighting (conf L).
- Wait until an expression boundary (full stop or carriage return) before running post-coordination matching.
- Do NOT post-coordinate matches across different expression windows.
- Words like 'due to' fall in exclusion list and are dropped from display.
- Worked example: "? nontraumatic flexor digitorum profundus rupture to left index finger due to plate fixation on wrist" -> base 'Rupture flexor digitorum profundus tendon' + Associated morphology = 'Nontraumatic rupture'; Finding site/Part of = 'Index finger'; Laterality (nested qualifier) = 'Left'; Contextual qualifier = 'Possible'; second expression 'Fixation of fracture using plate' | Finding site = 'Wrist bone'.
- User can change matches by: clicking a concept in left pane; adjusting marquees; editing text. System auto-updates matching.

### Appendix B parsing algorithm (illustrative, not tested)
1. Identify phrase boundaries: full stops or carriage returns (sentence approach); for word/character approach expression window ends at last word boundary (space, full stop, CR).
2. Match base concepts within window, excluding exclusion-list words, filtered to Clinical findings, Procedures, Situation with explicit context; reject below similarity threshold.
3. For each base, match attribute concepts filtered to concepts with SNOMED attribute relationships to the base. Each input word used at most once per expression (unless typed twice).
4. Rank expressions by: Efficiency (% of expression accounted for by input words); Matching scope (% of input words accounted for by expression); Proximity (input words closer together); Order (input order matches SNOMED order). If best covers all input words (minus exclusions), display and stop.
5. Match base concepts in remaining words; if none meet threshold, show remaining words as 'free text' associated with best expression.
6. If at least one base found, new boundary, repeat steps 3-5.

### 2.1.2 Negation and uncertainty
- 'No' + disorder = 'Known absent' (410516002). '?' = 'Known possible' (410590009). Attribute: Finding context (408729009).
- SHOULD (conf L) negation: detect keyword 'No' at start of expression followed by a space; run a parallel match of the subsequent text filtered to disorders, while still matching full text normally; display 'No' in front of matched disorders; merge both result sets ordered by statistical word matching score; post-coordinate chosen match with Finding context = Known absent. [Source note: guidance list 2.1.2.2 erroneously says 'Known possible' for negation; confidence section 2.1.2.6 gives correct 'Known absent' (410516002).] Negated disorders appear at top of list in figure.
- SHOULD uncertainty: detect '?' at start of expression; run match filtered to disorders on subsequent text (single process, since no description starts with '?'); display '?' in front; post-coordinate Finding context = Known possible.
- MUST (conf M) restrict this simple method to concepts in 'Disorder' sub-hierarchy of Clinical findings. MUST allow other negation/possibility axis modifiers via normal post-coordination ('Not involving', 'Does not', 'Not seen', 'Not done', 'Not used', 'Not offered', 'Not wanted').
- Negation/uncertainty qualifier displayed immediately LEFT of the base concept ('No gastroenteritis', '? appendicitis'); the word 'No' (and '?') rendered in BOLD regardless of confirmation status.
- SHOULD NOT allow browsing subtypes of a negated concept (conf H); do NOT allow hierarchy browsing for negated concept. SHOULD allow browsing subtypes/supertypes ('related concepts') for uncertain concepts.
- Fly-out: SHOULD show FSN of negated disorder linked to the label by text 'known absence of'; uncertain disorder linked by text 'possibly present'.
- MUST confirm whole negation (or queried) expression with a single check box (conf M).
- SHOULD apply negation/uncertainty to one concept at a time (nearest/adjacent concept); SHOULD detect other concepts in same sentence not negated / not associated with query and show a warning message that they have not been negated (remind user to type 'No' in text area or in expanded-dialog input).
- Users prefer 'No X' to 'X Known absent'.

### 2.1.3 Adjusting post-coordination matching
- In suggested matches, only the base concept is selectable/confirmable on its own; body structures or qualifiers cannot be confirmed alone.
- Hover over expression area: turns yellow; down-arrow icons appear next to each concept label; hovering a label darkens the area around it (clickable). Clicking label expands whole matched area into encoding dialog: input field above list (progressive matching), alternatives list, fly-out on hover; other concept labels pushed down but remain visible. Stays expanded until click outside list, fly-out and input field.
- Attribute label click lists matches for that word filtered to sanctioned attribute values for the base (e.g. 'index' for 'Pain in finger' -> 'Distal phalanx of index finger'). Selected value replaces old.
- MUST view/select alternatives concept-by-concept (H). MUST only offer attribute matches allowed by base concept's relationships (M). SHOULD remove an attribute if base changed to one not supporting it (M). MUST display all attribute components of the expression while showing alternatives for one (M).
- SHOULD allow adjusting expression boundaries (H), by dragging marquee handles; also by adding/moving/removing full stop or carriage return, or retyping. Hovering yellow boundary marker shows arrow icons and tooltip. Moving boundaries triggers re-parse with new windows.
- Update matching after boundary moved, with slight delay (not instantaneous) to avoid unnecessary server calls while dragging.
- Do NOT obscure input text with the encoding dialog fly-out; position above or below the relevant text.
- Example: 'Contusion thigh hip laceration knee painful' -> wrong split fixed by dragging.

### 2.1.4 Selecting and confirming post-coordinated expressions
- Hover suggested match area: turns yellow; in-focus boundary moves to corresponding text; clicking moves focus in text area.
- Ticking base-concept check box selects whole expression (COULD auto-select all attribute boxes, user may clear afterwards); text area renders SNOMED labels plus post-coordination rendering (Display Standards {R3}).
- MUST NOT allow confirming any attribute concept unless the base concept is confirmed (COULD disable attribute check boxes until base ticked). SHOULD separate check box per concept. MUST allow confirming concepts individually only once base confirmed.
- SHOULD allow un-confirming individual concepts; COULD un-confirm attribute without base: removes that attribute label from rendered text.
- MUST un-confirming base returns original typed text (M); match labels in left pane retain user's adjusted choices (not revert to system suggestion). Area returns to yellow on hover, light blue otherwise.
- Render confirmed base concept at start of sentence, except when preceded by axial modifiers (negation/possibility). Render confirmed attributes in the order they appear in the user's typed text.
- Attribute name labels not shown before confirmation (e.g. 'Associated morphology' confusing, 'Severity' for 'Mild' redundant); after confirmation simplified user-friendly attribute labels (NHS-maintained data) used in rendering.

### Accessibility points
- Hover-only affordances (yellow area, down arrows, marquee handles) need keyboard equivalents; A1.1 requires keyboard-only encoding [suggested: arrow keys/shortcut to adjust marquee boundaries, focusable labels].
- Negation communicated by bold and the word 'No' (text, not colour only).

### Patient-safety rationale
- Negation and axis modifiers fundamentally change meaning and subsumption, so must be displayed prominently (bold 'No' / '?') and confirmed as a unit.
- Warn when negation may not cover all concepts in a sentence (e.g. 'no fever or rash').
- Attribute confirmation only with base prevents orphan qualifiers (e.g. 'Left' alone).
- Hidden attribute names could hide meaning (direct vs indirect device) - open issue.

## Design Guide Entry - Terminology - Elaboration (termelab.txt)
Version 2.0.0.0 Baseline, 27-Mar-2007 (TOC ref 4.2 "UI Interaction Model for Terminology Elaboration"). Requirements addressed: C1.9, C1.10, C1.11, C2.3, C3.3, C3.4.

**Purpose:** How a selected SNOMED CT expression is elaborated with (1) free text, (2) SNOMED attributes (qualifiers, axis modifiers, mandatory qualifiers such as laterality), and (3) additional values (numbers, units, times, composites like blood pressure).

### Notional clinical record
- A record = one or more 'notes' + context (e.g. heading 'past medical history'). A note = one of: pre-coordinated expression, post-coordinated expression, free text expression. Each expression may have axis modifiers (default or user-selected values), non-SNOMED numeric/time values, and free text.
- NOT allowed: numeric values recorded as values (rather than free text) unless associated with an encoded expression; more than one expression saved per note except NHS-defined 'composites'.

### 2.1.1 Additional text (single concept approach) (conf H)
- MUST allow adding free unstructured text to a SNOMED match selection; MUST label the field appropriately ('Additional text'); SHOULD be visible while viewing matches: located in the encoding dialog immediately below the list of matches, aligned with the matches list.
- Provide additional text field in all definition/elaboration dialogs in the 'Code and Elaborate' environment.
- Retain additional text until the user selects a code or closes the dialog, even if user changes concept.
- Do NOT put the additional text field in the fly-out. Do NOT allow user formatting (bold, highlight) in it (formatting reserved for communicating confirmed/encodable text). Do NOT provide an additional text field in the Text parser approach (only one place to edit text).
- Selecting a match by single click turns its highlight grey; user may type text before or after selecting.

### 2.1.2 Text remaining unstructured (text parser)
- MUST allow associating free text with expressions (H). MUST define 'free text' as any text not matched to SNOMED or another modelled expression (time, measurement) (H).
- MUST assume free text belongs to an expression if within its 'expression envelope', defined by (i) proximity (immediately adjacent to matched text) and (ii) user boundaries (full stops, carriage returns) (M).
- SHOULD display free text in suggested match area of left pane (H); MUST distinguish it from matched text (H); COULD use an icon (example 'pencil'; icon undefined) and COULD indent it below the matched expression (H). Each separate free-text string is a separate bulleted line with its own icon (e.g. 'David unable to grip properly' -> concept 'Unable to grip' + lines 'David' and 'properly').
- In expanded encoding dialog, associated free text shown below the matches list with the icon (same position as single-concept Additional text) (SHOULD, L).
- MUST allow un-associating free text (M); SHOULD allow deleting it (H); SHOULD allow dragging marquee boundaries to exclude/include text (M). Hover on yellow marquee handle shows two directional arrows; Tooltip text: "Drag the handles to include or exclude text in the expression". Excluded text gets its own marquee.
- Do NOT allow editing additional text anywhere but the text input area in the Text parser approach.
- Open issue: contextual modifiers spanning sentences ("Father has suffered heart failure. He also has arthritis").

### 2.2 Elaboration with SNOMED attributes
- User-led principle: user is only offered qualifier matches for qualifiers they typed themselves (both approaches). Exception: mandatory (or strongly recommended) attributes, e.g. laterality, actively offered; 'Not specified' and 'Both' are legitimate choices.
- 2.2.1 Matching attributes within Additional text (single concept) (conf L): MUST match typed text against concepts having attribute relationships with the selected concept (Concept Model incl. Context Model, or NHS-approved external info model). SHOULD use same field for additional text and attribute input. SHOULD reuse text parser mechanisms: highlighting, bolding, confirmation check box, control to view alternatives.
  - Flow: matched word highlighted in blue in the Additional text field; match displayed ABOVE the additional text field with a check box; hover label turns orange (clickable); click shows alternatives list; ticking check box confirms: match label becomes bold and the word is highlighted grey in the Additional text field.
  - Allow multiple attribute matches (e.g. 'Severe' and 'Sudden onset' for 'Asthma'); allow browsing related concepts of an attribute (other severities).
  - Do NOT match concepts that are not attributes of the base concept (e.g. 'Foot' for 'Fever').
  - Do not present drop-down elaboration settings (severity, episodicity) in fly-out unsolicited (users thought they were mandatory). Unordered SNOMED value lists (e.g. severity) would mislead; user-led approach avoids need.
- 2.2.2 Warning of unconfirmed axis modifiers: MUST attempt to identify axis modifiers (negation, relation to patient e.g. 'Mother') in additional text and present them for confirmation like qualifiers (M). MUST warn if user tries to save (clicks 'OK') without confirming the axis modifier (H). SHOULD offer a quick control to confirm (M). Warning must clearly outline the problem and resolution (e.g. confirm that it is the patient's mother, not necessarily the patient, who has asthma, or leave note as it is, meaning patient AND mother have asthma). Do NOT present an array of options: do not offer 'Yes', 'No' and 'Cancel'. Qualifier values do not need warnings. Axis modifiers (even soft defaults) are not shown unless the user typed them (previous wording 'the patient currently has this finding' not understood). High-risk trigger words should be identified in SNOMED itself.
- 2.2.3 Mandatory qualification (e.g. laterality of 'Fracture of radius'):
  - MUST disable the confirm check box (text parser) or the save 'OK' button (single concept) while a mandatory qualifier is unresolved (M). Do NOT allow encoding without all mandatory fields.
  - MUST provide a control to select the mandatory qualifier (H); COULD drop-down list; SHOULD associated with the individual match; SHOULD in the match's fly-out.
  - MUST communicate it must be selected to confirm/save (H); SHOULD hover warning message in suggested match area (L), e.g. "You must select from this list to be able to encode 'name of the concept'"; text parser hover warns to specify left, right, both (or unknown).
  - SHOULD initial text 'Please specify' in the selection control (M); SHOULD sufficiently prominent; COULD yellow background until a selection is made, then white (M). Highlight with bright colour; mandatory asterisk icon with a key at foot of dialog explaining mandatory display.
  - Choices include Left, Right, Both, and Not specified/unknown.
  - If user typed laterality in additional text and confirmed it, the drop-down disappears and OK enabled. In text parser user can type 'left' in text area instead.
  - Upon confirmation qualifier value shown in match and rendered in text; its check box is checked but DISABLED. MUST NOT allow un-confirming the mandatory qualifier independently of the base concept (H); to change, un-confirm base, then change in fly-out.
  - Confirmed match: labels bold, background/highlight grey.
  - Mandatory elaboration metadata to be created by NHS.

### 2.3 Elaboration with additional values (preliminary guidance)
- 2.3.1 Values in text: MUST identify values and units in notes (H); SHOULD suggest default units; MUST display identified values/units back to user for confirmation (H); SHOULD allow adjusting value and unit in expanded encoding dialog fly-out (fields pre-populated, e.g. '39.8' and '°C') (M); changes reflected in match label and rendered text.
  - Example: 'Temperature 39.8' matched to observable 'Body temperature'; unit deduced from range -> '°C'; displayed as concept '=' value unit, i.e. 'Body temperature = 39.8 °C' (equals sign between concept and value).
  - Do NOT treat a full stop with digits immediately on both sides as a sentence boundary ('39.8').
  - Validate numbers (decimal point placement, too few digits) using info model formats/ranges; warn if outside recognised ranges/formats.
- 2.3.2 Templates: SHOULD identify concepts associated with/requiring values (H); SHOULD encourage entering values (H); COULD provide fields (H); COULD mark expressions needing values and show floating dialog on focus (M); SHOULD pre-populate template with parsed values; SHOULD identify composite elements and present as single composite (e.g. 'Blood pressure' = systolic + diastolic); SHOULD recognise composite values (e.g. 'BP 120/80 mmHg'); SHOULD offer fields for remaining composite values.
  - Single concept: 'Body temperature' fly-out shows value field ('Temperature value') and unit field default '°C'. Validation on blur (focus leaving field); failure shows error telling user to change the value to confirm (e.g. 398 instead of 39.8).
  - Typing a value automatically ticks its confirmation check box; ticking check box with no value -> warning on 'OK'.
  - Text parser: expression with value template marked with yellow triangle in lower right corner of marquee; focusing expression opens floating value dialog; suggested match area shows message 'You should enter values'. Values can be entered via match label fly-out, floating dialog, or typing in text.
  - Offer default UNITS; do NOT offer default VALUES (could encode values user didn't enter).

### Accessibility points
- Mandatory status conveyed by colour (yellow) plus 'Please specify' text, asterisk and key (not colour alone).
- Warnings must be explicit text; validation on blur with clear error.
- Hover-only messages need keyboard/focus equivalents [suggested].

### Patient-safety rationale
- Laterality mandatory: wrong-side errors; cannot encode without choosing (incl. 'Not specified').
- Axis modifiers (negation, family member) fundamentally change meaning; must warn on unconfirmed.
- No default values; validate measurements (e.g. 398 vs 39.8).
- Mandatory qualifier cannot be removed while base stays confirmed.

## Consultation Document - Suggestions for Implementing SNOMED CT into the User Interface of an Electronic Healthcare System (cd_impsnomd_ehs.txt)
NPFIT-FNT-TO-DSD-0218.01, Version 1.00, 04-Nov-2011, CUI team NHS CFH. Draft consultation suggestions (not final; no formal patient safety assessment). Accompanies (does not replace) the 2007 Matching/Elaboration/Display guidance.

**Purpose:** Numbered suggestions SCT-001 to SCT-062 for usable, safe single-concept, pre-coordinated SNOMED CT search/select in an EHS, by text entry (plus browsing). Out of scope: free-text parsing, post-coordination, standalone browsers, post-hoc coders, pick-list-only entry, search algorithms, 'no match' reporting.

- Conformance: Mandatory (should follow) / Recommended (optional). Evidence rating: High / Medium / Low / Idea / Option (several options, undecided).
- Assumptions: large term sets (2000+ terms; e.g. A&E, Dermatology, Endocrinology, Infections); novice coding users; applicable to other terminologies (e.g. Read).
- Ideal experience (1.9): few letters per word gives manageable results; wanted term present; likely results at top; low false positives; results displayed in under 3 seconds; each term unambiguous.

### 3.1 Data and context
- SCT-001 (Mandatory, High) Use current UK Edition (International Core + UK Clinical Extension + UK Drug Extension); update within 180 days of release; user not notified of version issues (admin is).
- SCT-002 (Mandatory, Medium) Do not require or allow user to choose terminology/version (possible exception: Mental Health ICD-10 switching).
- SCT-003 (Mandatory, High) Exclude from browse/selection as primary code (except in post-coordination): non-human content ('Hump of Camel'), navigational concepts ('Poisoning / Injury'), organisms ('Salmonella'), SNOMED attributes ('Cuff deflated'), record artefacts ('Kick chart'), physical forces ('High temperature'), anatomical structures ('Osteophyte'), action qualifiers ('Cryosurgery'), staging scales ('Vital organ failure'), UKTC former limited status subset. Suppress even when no user filters applied.
- SCT-004 (Mandatory, High) Exclude inactive concepts.
- SCT-005 (Mandatory, High) Default to concepts relevant to context, set automatically (logged-on user's specialty, provider role, patient, corporate).
- SCT-006 (Recommended, Medium) Plain English; avoid jargon in UI: 'Terminology axis', 'Concept', 'Concept-Id', 'Qualifier', 'Fully-specified-name', 'Preferred term', 'Synonym'.
- SCT-007 (Mandatory, Medium) Language display rule (available -> display): en -> en; en+en-GB -> en-GB; en+en-GB+en-US -> en-GB; en+en-US -> en; en-US only -> en-US.

### 3.2 Entering a search term
- SCT-008 (Rec, Idea) Make encodable fields visibly distinct from plain text fields.
- SCT-009 (Rec, Low) Search button next to field AND <enter> key triggers search.
- SCT-010 (Mandatory, Medium) Field shows 32 characters, holds 255; scrolls horizontally without scroll bar keeping last typed char visible. (32 chars shows ~50% of active PT/synonyms.)
- SCT-011 (Rec, Low) Minimum 2 non-whitespace characters before searching (allows 'mi').
- SCT-012 (Mandatory, High) Single or multiple tokens ('diab', 'com acq pneu').
- SCT-013 (Mandatory, High) Token order independent ('fract ankle' = 'ankle fract').
- SCT-014 (Mandatory, High) No wildcard characters needed (%, *, ?); partial matching by default.
- SCT-015 (Rec, Medium) Case-insensitive.
- SCT-016 (Mandatory, Medium) Do NOT allow searching by SNOMED CT code (mistype risk).
- SCT-017 (Rec, Medium) Allow copy and paste into search.
- SCT-018 (Rec, Medium) Accept foreign characters ('Sjög' -> Sjögren-Larsson syndrome; 'löffler's endocarditis', 'Ménière', 'Lieberkühn').
- SCT-019 (Mandatory, Medium) Accept ASCII substitutes for foreign characters ('lieberkuhn' -> Lieberkühn's glands; 'meniere's vertigo' -> ménière's vertigo).
- SCT-020 (Rec, Low) Accept superscript (^ ^) / subscript (> <) characters (e.g. '^186^Platinum'); may be stripped by tokeniser.
- SCT-021 (Rec, Medium) Accept non-alphanumerics (approved list), e.g. hyphen, apostrophe ('Non-productive cough', 'Prinzmetal's angina').
- SCT-022 (Rec, Medium) Accept abbreviations ('aaa'), case-insensitive (TATT/Tatt/tatt).
- SCT-023 (Rec, Medium) Progressive matching if performance permits.
- SCT-024 (Rec, Low) Do NOT offer auto-completion (word-completion dropdown) - distracting.
- SCT-025 (Rec, Idea) Do not show multiple search option choices by default; put any in advanced area.
- SCT-026 (Rec, Medium) Favourites list: user-chosen, frequently used, recently used, local department/specialty, common terms, conduit terms (e.g. 'eczema' -> all eczema terms), hard-to-find terms.

### 3.3 Matching
- SCT-027 (Rec, Low) Multiple tokens combined with AND.
- SCT-028 (Mandatory, Medium) Partial (prefix) matching by default ('obes' = 'obes*'); exact matches can be placed first.
- SCT-029 (Rec, Low) STARTS WITH per token (not contains/ends with): 'gast ref dis' -> words starting gast, ref, dis.
- SCT-030 (Mandatory, High) Suppress frequently encountered tokens ('and', 'the', 'in') from matching using a common national list; still let user type them (could be prefix e.g. 'the' -> 'therapeutic').
- SCT-031 (Mandatory, Option) Result granularity: Option 1 all lexically matching descriptions (several per concept); Option 2 one item per concept showing Preferred term or the synonym lexically closest (e.g. lowest Levenshtein distance), optionally prefixed with supercategory/chapter; Option 3 all descriptions of any concept with at least one match.
- SCT-032 (Rec, Medium) Word equivalence matching ON by default (e.g. 'nose boil' -> 'nasal furuncle'; 'rupture' ~ 'tear').
- SCT-033 (Rec, Option) Option 1 indicate equivalence in use, on/off control, show equivalent words searched; Option 2 do not advertise or offer control. [Conflicts with 2007 Matching guidance: equivalence must be OFF by default for progressive matching, with mandatory on/off control.]
- SCT-034 (Rec, Medium) Indicate that a search is running.
- SCT-035 (Rec, Medium) Allow cancelling a long-running search.

### 3.4 Displaying results
- SCT-036 (Rec, Idea) Vertically scrollable list; no horizontal scroll; avoid pagination unless absolutely necessary.
- SCT-037 (Mandatory, Medium) At least 10 results visible simultaneously. SCT-038 (Rec, Idea) Maximum 20 visible at once. [2007 Matching default view: nine.]
- SCT-039 (Mandatory, Medium) Width at least 32 characters per line; wrap to second line indented by two characters.
- SCT-040 (Mandatory, Option) Labels longer than two lines (>64 characters, ~15% of active terms): Option 1 wrap fully to as many lines as needed (3 lines shows 94%); Option 2 truncate at end of second line with ellipsis '…' and show full text via tooltip/pop-up (mitigate duplicate truncated labels by highlighting). [2007 Matching: truncate beyond 62 characters.]
- SCT-041 (Rec, Low) Results list in consistent, noticeable position next to/close to input; not obstructing typing.
- SCT-042 (Rec, Low) Default flat list (not hierarchy); hierarchy browsing as advanced/refine option.
- SCT-043 (Mandatory, High) Rows visually distinguishable (e.g. row highlighting / alternating).
- SCT-044 (Mandatory, Low) Do NOT display concept or description IDs.
- SCT-045 (Rec, Medium) Allow viewing FSN; indicate when result is a synonym; example row: 'Atypical pneumonia' / 'Atypical pneumonia (disorder)' / 'is an Infective pneumonia' vs 'synonym for Lower primary atypical interstitial pneumonia (disorder)' / 'is an Interstitial pneumonia'; or in tooltip.
- SCT-046 (Rec, Medium) Abbreviations must include expansion (e.g. 'AAA - Abdominal aortic aneurysm'); where description lacks expansion (e.g. two 'SLE'), append FSN minus semantic tag ('disorder'). Allowed unambiguous exceptions e.g. 'IgA1'.
- SCT-047 (Rec, Idea) Highlight matched search tokens within each result (e.g. 'ch infe' highlights 'ch...' and 'infe...').
- SCT-048 (Rec, Idea) Prioritise exact matches, near matches, frequently used terms at top.
- SCT-049 (Rec, Idea) Section headers within list, e.g. 'Nearest Matches' and 'Other Matches'.
- SCT-050 (Mandatory, Option) Ordering (after prioritised group): Option 1 alphabetical; 2 lexical distance from search term; 3 number of characters (ties alphabetical); 4 number of words (ties alphabetical); 5 frequency of use. NEVER random, 'straight out of the database', or by concept/description ID.
- SCT-051 (Rec, Idea) Allow switching ordering (few options; always show current ordering).
- SCT-052 (Rec, Idea) Highlight favourites appearing in results (subtle).
- SCT-053 (Mandatory, Medium) Display number of results returned.
- SCT-054 (Mandatory, Medium) Explicitly state when no results found (never leave empty or showing previous results); do not encourage 'approximate' concept. [2007 Matching said display nothing; 2011 supersedes for single concept search.]
- SCT-055 (Rec, Medium) With no results: explain likely cause, suggest actions, provide direct access to them.
- SCT-056 (Rec, Idea) Number results only if numbers look distinctly different from concept text. [2007 Matching: do NOT number.]

### 3.5 Refining
- SCT-057 (Rec, Medium) Option to search beyond default context (choose specialties, or filter slider), or auto-check other contexts and tell user; always show current context.
- SCT-058 (Rec, Medium) Hierarchical browse: parents, siblings, children, clearly distinguished (labels in example: 'Less specific concepts', 'Similar concepts', 'More specific concepts'; 'is an' / 'and a' parent labels; 'Browse related concepts'; OK / Cancel).

### 3.6 Selecting
- SCT-059 (Mandatory, High) Fully operable by mouse, keyboard, or both: <enter> triggers search; when results populated user can give focus directly to and move up/down the list without tabbing; <enter> selects highlighted term and populates the field.
- SCT-060 (Mandatory, Medium) Replace typed text with exactly the selected description (not FSN or other).
- SCT-061 (Rec, Idea) Style encoded field/text differently from plain typed text.
- SCT-062 (Mandatory, Medium) Re-selecting: user can return to results without retyping or re-searching; previous results and settings (ordering, browse, extended context) preserved.

### Further discussion (not suggestions)
- Local shortcodes, grouping by supercategory, drag-and-drop, highlighting descriptions of the same concept, 'P'/'S' prefix for Preferred/Synonym, expert-user functions.

### Accessibility points
- SCT-059 keyboard operation; SCT-034 progress feedback; SCT-054/055 explicit no-results message; plain English (SCT-006); row distinction (SCT-043).

### Patient-safety rationale
- No code search or code display (mistype/mis-select risk) (SCT-016, SCT-044).
- Abbreviations must be expanded; same-label concepts disambiguated with FSN, synonym status and parents (SCT-045/046).
- Truncation risks wrong selection (SCT-040).
- Selected description must equal displayed encoded term (SCT-060).

## Conflicts between documents (decide per product)
| Topic | 2007 Matching/Post-coord/Elab | 2011 Consultation (SCT) |
|---|---|---|
| Visible results | 9 by default | min 10, max 20 |
| Long labels | wrap >32 to 2 lines, truncate >62 with '…' | >64 (2 lines): wrap fully OR truncate + tooltip |
| Numbering | do not number | optional, visually distinct |
| No matches | show nothing | explicitly state + help |
| Word equivalence | OFF by default when progressive; mandatory on/off control | ON by default; control optional |
| Category tag | do not show '(clinical finding)' TLC next to match | Option 2 may prefix supercategory |
| Min chars | not stated | 2 non-whitespace |
Suggested library default: follow 2011 for single concept search (newer), expose props for 2007 behaviour.

## Proposed controls

Shared types:
```ts
type DescriptionType = 'preferred' | 'synonym' | 'fsn';
interface SnomedDescription { conceptId: string; descriptionId: string; term: string; type: DescriptionType; lang: 'en'|'en-GB'|'en-US'; }
interface SnomedConcept {
  conceptId: string;            // never rendered (SCT-044, 2.3.2.1)
  fsn: string;                  // e.g. 'Myocardial infarction (disorder)'
  preferredTerm: string;
  parents: { conceptId: string; term: string }[];  // for 'Is a' / 'And a'
  isAbbreviationUnexpanded?: boolean;  // NHS list (2.3.4)
  hierarchy: 'disorder'|'finding'|'procedure'|'observable'|'situation'|'event'|string;
  active: boolean; status?: 'current'|'pendingMove'|'inactive';
}
interface Match {
  concept: SnomedConcept; description: SnomedDescription; score: number;
  group?: 'common'|'other'|'nearest'|'favourite';
  sameSpellingAlternatives?: boolean;  // disables confirm until viewed
  similarAlternatives?: boolean; moreSpecificAlternatives?: boolean;
  matchedTokenRanges?: [number, number][];  // SCT-047 highlighting
  equivalenceUsed?: boolean;
}
type ContextModifier = 'none' | 'knownAbsent' | 'knownPossible';
interface AttributeValue { attributeId: string; attributeFriendlyLabel?: string; value: SnomedConcept; confirmed: boolean; mandatory?: boolean; }
interface Expression { base: Match; modifier: ContextModifier; attributes: AttributeValue[]; values?: MeasuredValue[]; freeText: string[]; confirmed: boolean; sourceText: string; sourceRange: [number, number]; }
interface MeasuredValue { name: string; value: string; unit: string; units: string[]; valid: boolean; }
```

### 1. `SnomedSearchField` (single concept matching input)
- Purpose: text entry for single concept search (Matching 2.2.2, SCT-008..025).
- Props: `value: string`; `onChange(v)`; `onSearch(term)`; `progressive?: boolean = true` (SCT-023, 2.2.2); `debounceMs?: number = 200`; `minChars?: number = 2` (SCT-011); `visibleChars?: number = 32`; `maxLength?: number = 255`; `showGoButton?: boolean` (true when !progressive; tooltip [suggested] 'Find matches'); `subsetLabel?: string` (button above field, truncated >20 chars with '…'); `onOpenSubset?()`; `equivalence?: { on: boolean; words: string[]; onToggle(on) }`; `searching?: boolean` (SCT-034); `onCancelSearch?()` (SCT-035); `encoded?: boolean` (SCT-061 distinct style); `ariaLabel`.
- Behaviour: no rich formatting; plain text only; accept any Unicode incl. diacritics, ^ ^ / > < markers; horizontal scroll keeps caret visible, no scroll bar; Enter triggers search (always) and, when list has focus, selects; ArrowDown moves focus into results (SCT-059); ignores whitespace-only input below minChars; never searches by numeric concept ID (SCT-016: treat all-digit input as text, not code lookup).
- States: empty, typing, searching (spinner + Cancel), results, no-results, selected (collapsed into `SelectedConceptLabel`).

### 2. `SnomedResultsList`
- Purpose: display matches (Matching 2.3.2, SCT-036..056).
- Props: `matches: Match[]`; `query: string`; `visibleRows?: number = 10` (min 10, max 20; legacy 9); `charsPerLine?: number = 32`; `longLabelMode?: 'truncate' | 'wrap' = 'truncate'`; `maxLinesBeforeTruncate?: number = 2`; `showCount?: boolean = true` (SCT-053, e.g. [suggested] '23 matches'); `groupHeaders?: boolean = true` ('Common matches' / 'Other matches' or 'Nearest Matches' / 'Other Matches'); `ordering?: 'relevance'|'alphabetical'|'lexicalDistance'|'characters'|'words'|'frequency' = 'relevance'`; `onOrderingChange?`; `numbered?: boolean = false`; `highlightTokens?: boolean = true`; `favourites?: Set<string>`; `selectedId?: string`; `onHighlight(match)`; `onSelect(match)`; `onConfirmSelect(match)` (double-click / Enter); `noResultsHelp?: ReactNode`.
- Behaviour: vertical scroll only; row separation (alternating/row highlight, SCT-043); hover/keyboard focus highlights row and drives `ConceptFlyout`; clicking away closes without selection; selected row bold; no concept IDs; no TLC suffix; abbreviation-only labels rendered as `ABBR - FSN minus semantic tag` with abbreviation in bold capitals; synonym rows flagged in fly-out; empty result -> explicit 'No matches found' text [suggested wording] plus help (SCT-054/055); ARIA `listbox` with `option`s [suggested].

### 3. `ConceptFlyout` (definition panel)
- Purpose: show FSN, synonym status, parents, actions (Matching 2.3.1/2.3.2, Post-coord 2.1.2, Elab 2.2.3).
- Props: `match: Match`; `modifier?: ContextModifier`; `mandatoryQualifiers?: MandatoryQualifier[]`; `values?: MeasuredValue[]`; `onBrowseRelated?()` (hidden when modifier==='knownAbsent'); `anchorRect`; `hoverTolerancePx?: number = 8` [suggested].
- Content: FSN; 'Synonym' indicator when description.type==='synonym'; parents listed 'Is a' (first) then 'And a' (others); negated: '<label> known absence of <FSN>'; uncertain: '<label> possibly present <FSN>' (link phrases per Post-coord 2.1.2.2); 'Browse for related concepts' button; mandatory qualifier selects; value/unit fields.
- Behaviour: follows highlighted row; stays open when pointer briefly leaves row/scrollbar; never contains the OK button or Additional text field; must not obscure input text (position above/below).

### 4. `SingleConceptEncoder` (encoding dialog)
- Purpose: whole single-concept dialog (Matching 2.1.1, 2.2.2, 2.2.3; Elab 2.1.1, 2.2.1-2.2.3, 2.3.2).
- Props: `onSearch(term, opts): Promise<Match[]>`; `subsets?: SubsetFilter`; `initialValue?: EncodedResult`; `onOk(result: EncodedResult)`; `onCancel()`; `requireConcept?: boolean = true` (cannot save elaboration only).
- `EncodedResult = { conceptId; descriptionId; label; additionalText; attributes: AttributeValue[]; values: MeasuredValue[]; modifier: ContextModifier; lastQuery: string }`.
- Layout: subset button above input; input; results list below; after selection input replaced by `SelectedConceptLabel` (label + black ▼, orange embossed on hover; click reopens with last query and selection at top); 'Additional text' field below; buttons 'OK' and 'Cancel'.
- Behaviour: focus moves to 'OK' after selection; double-click on list item = select + OK; OK disabled while mandatory qualifier unresolved or no concept selected; on OK, if additional text contains unconfirmed axis modifier, show `AxisModifierWarning`; additional text retained when concept changes; returns Concept ID and chosen Description ID.

### 5. `AdditionalTextField`
- Props: `value`; `onChange`; `placeholder?: string = 'Additional text'`; `minRows?: number = 3`; `attributeMatches?: AttributeMatch[]` (highlight ranges); `onConfirmAttribute(id, bool)`.
- Behaviour: grey in-field label disappears on focus, reappears on blur if empty; vertical scroll on overflow; no formatting; matched attribute words highlighted blue; confirmed attribute: label bold, word highlighted grey; attribute match chips shown ABOVE field with check box and clickable (orange on hover) label opening alternatives (only attributes valid for base concept). Not used in Text parser mode.

### 6. `MandatoryQualifierSelect`
- Purpose: laterality etc. (Elab 2.2.3; Matching 2.3.3).
- Props: `label: string`; `options: {value, label}[]` (e.g. Left, Right, Both, Not specified); `value?: string`; `onChange`; `placeholder?: string = 'Please specify'`; `conceptName: string`.
- Behaviour: yellow background until selected, then white; asterisk with key ('* mandatory' [suggested wording]) at foot of dialog; hover/focus message "You must select from this list to be able to encode '<conceptName>'"; parent disables confirm/OK until set; after confirmation qualifier check box shown checked+disabled; cannot unconfirm separately from base.

### 7. `ClinicalNotesEncoder` (Text parser workspace)
- Purpose: free-text noting with live suggestions (Matching 2.1.2, 2.2.1, 2.3; Post-coord 2.1; Elab 2.1.2, 2.3).
- Props: `text: string`; `onTextChange`; `parse(text, windows): Promise<Expression[]>`; `trigger?: 'progressive'|'word'|'sentence'|'interval'|'manual' = 'sentence'`; `debounceMs?: number = 200`; `inputMaxWidthCh?: number = 60`; `headings?: ClerkingHeading[]`; `onUndo/onRedo`; `onOk(expressions, freeText)`; `onCancel`; `onReportNoMatch?(text)`.
- Layout: left 'Suggested matches area' (pale blue, label 'Tick to confirm that this is what you mean:', greyed until first match), right 'Text input area' (white, dark grey border, label 'Type your notes here:', cursor top-left, Arial 10pt min), Undo/Redo top right, 'No match found' button at foot, OK/Cancel.
- Behaviour: typing never blocked; marquee (dashed) around each expression with yellow handles (drag to resize; arrows + tooltip "Drag the handles to include or exclude text in the expression"; re-parse after short delay); expressions bounded by full stop / carriage return (but '.' between digits is not a boundary); hover/click sync between suggestion and marquee; confirmed text replaced by rendered label (base first, attributes in typed order, 'No'/'?' prefix bold); unconfirm restores original text; context menu 'Find matches for this text'; spell-check red dashed underline (full-word mode only) with OK/Ignore/Cancel dialog, never auto-confirming; shorthand underline + red triangle with resolution menu; value-template triangle (yellow, lower right) with floating values dialog and message 'You should enter values'; nothing is saved as code unless confirmed.

### 8. `SuggestedMatchCard`
- Props: `expression: Expression`; `focused: boolean`; `onToggleConfirm(conceptPath, checked)`; `onOpenAlternatives(conceptPath)`; `warnings: string[]`.
- Behaviour: bounded box (rect/lozenge), pale blue, yellow on hover/focus; check box per concept; base check box ticks all (attributes can then be cleared); attribute check boxes disabled until base confirmed; base check box disabled while mandatory qualifier unresolved or same-spelling alternatives unviewed; ▼ next to each label on hover; label orange/embossed on hover; warnings (similar matches, more specific matches, not-negated concepts in sentence, mandatory qualifier); free text lines shown indented below with free-text icon (pencil placeholder); negation 'No' / '?' bold left of base; clicking a label expands inline encoding dialog (input above list, list, fly-out) with other concept labels still visible; attribute lists filtered to sanctioned values; selecting from list auto-confirms; auto scroll in column.

### 9. `SubsetFilterControl`
- Props: `levels: {id, label, description?}[]` (max 3); `nested: boolean`; `value: string[]`; `onChange`; `instruction: string | ((level) => string)`; `placement: 'heading'|'aboveInput'`.
- Behaviour: opened by ▼; slider if nested, else radio 'Filter' / 'No filter'; shows 'Current filter: <label>'; button label truncated >20 chars with '…', full label inside; closes on click-away; immediate re-query; never obscures results; level with or above heading.

### 10. `HierarchyBrowserDialog`
- Props: `concept: SnomedConcept`; `getParents/getChildren/getSiblings(id)`; `attributes?: DefiningAttribute[]` (tabs); `constrainTo?: (c) => boolean` (post-coordination limits); `onOk(concept | expression)`; `onCancel`.
- Behaviour: modal; three labelled lists left->right parents ('Less specific concepts'), siblings of all parents ('Similar concepts'), children ('More specific concepts'); each alphabetical; 'Selected' field shows current; single-click re-centres, double-click selects and closes; 'Back' button; attribute tabs refine values, rendered e.g. 'Fracture, site of Bone structure of radius'; 'Browse related concepts' tab hidden after attribute refinement; disabled for negated concepts.

### 11. `MeasuredValueInput` / `ValueTemplate`
- Props: `concept: SnomedConcept`; `fields: {name, label, units: string[], defaultUnit, validate(v): string|null}[]` (e.g. 'Temperature value', unit '°C'; BP systolic/diastolic 'mmHg'); `values`; `onChange`; `onConfirmChange`.
- Behaviour: default unit offered, never default value; validate on blur, error text tells user to correct value to confirm (e.g. 398 vs 39.8); typing value auto-ticks confirm; confirm without value -> warning on OK; rendering 'Body temperature = 39.8 °C'.

### 12. `AxisModifierWarning` (modal)
- Props: `conceptLabel`; `modifierText` (e.g. 'Mother'); `onConfirmModifier()`; `onLeaveAsIs()`.
- Behaviour: plain explanation of the problem and the two resolutions only; never Yes/No/Cancel triplet [labels suggested: 'Confirm <modifier> has <concept>' / 'Leave note as it is'].

### 13. `SpellCheckPopover`, `ShorthandResolver`, `NoMatchReport` (smaller)
- SpellCheckPopover: suggestions from SNOMED + dictionary; buttons 'OK', 'Ignore', 'Cancel'. ShorthandResolver: list of NHS-database resolutions, closes on click-away, no top match. NoMatchReport: wizard capturing unmatched text (process undefined).

### Utility functions
- `normaliseForSearch(s)`: lowercase (case-insensitive, SCT-015/022); Unicode NFD + strip combining marks so 'meniere' matches 'ménière' (SCT-019) while still accepting diacritics (SCT-018); keep alphanumerics and approved punctuation; tokenise on whitespace.
- `tokenise(query)`: split on whitespace; drop empty tokens; do not drop stop words from the QUERY but mark them; require >= 2 non-whitespace chars total before search (SCT-011).
- `matchesDescription(queryTokens, descriptionTokens)`: every query token (excluding suppressed common tokens that also fully equal a stop word, e.g. 'and','the','in','of','for','to') must be a STARTS WITH prefix of some distinct description token (AND, order independent; SCT-027/029/013; 'nec fem' -> 'Neck of femur').
- `similarityScore(input, label)`: statistical fit (share of matching characters/words, order) excluding exclusion-list words; reject below threshold (~0.70, NHS-configurable) in text parser (Matching 2.3.1).
- `rankExpressions(cands)`: Post-coord Appendix B: efficiency = matched expression words / expression words; scope = matched input words / input words (excl. stop words); proximity = tighter span preferred; order = agreement with SNOMED word order; each input word used once per expression.
- `orderResults(matches, strategy)`: priority group first (exact, near, favourites/common), then strategy: alphabetical | lexical distance (Levenshtein) | character count then alpha | word count then alpha | frequency; never DB or ID order (SCT-050).
- `wrapLabel(label, width = 32, indent = 2, maxLines = 2)`: word-wrap to width; lines 2+ prefixed by 2 spaces (effective width 30) [doc ambiguous: 62 total vs 64]; if exceeds maxLines and mode truncate, cut and append '…' (Matching 2.3.2: >62 chars; SCT-040). Return `{lines, truncated}` so UI can expose full text (B4.9).
- `truncateEnd(label, max = 20)`: subset button labels: if length > max, slice to max-1 + '…'.
- `displayLabel(match)`: matched description term (synonym or PT; never FSN as primary); if concept flagged unexpanded acronym -> `${term} - ${stripSemanticTag(fsn)}`; abbreviation portion rendered bold capitals.
- `stripSemanticTag(fsn)`: remove trailing ' (disorder)' etc: `fsn.replace(/\s*\([^()]*\)\s*$/, '')`.
- `selectLanguageDescription(descs)`: SCT-007 table: prefer en-GB, else en, else en-US.
- `detectContextPrefix(text)`: `/^No\s+/i` -> knownAbsent (410516002) with disorder-only parallel search; `/^\?\s*/` -> knownPossible (410590009); Finding context attribute 408729009; only for Disorder hierarchy.
- `renderExpression(expr)`: `[modifier bold 'No'|'?'] + base label + attributes in typed order (friendly attribute labels after confirmation) + values as ' = value unit'`; base at start unless modifier.
- `isSentenceBoundary(text, i)`: '.' or newline, except '.' with digits on both sides.
- `findExpressionWindows(text)`: split into windows on sentence boundaries; never post-coordinate across windows.
- `canConfirm(expr)`: base present & no unresolved mandatory qualifier & (no sameSpellingAlternatives or alternativesViewed).
- `parseValueWithUnit(text, concept, infoModel)`: extract number (+ optional unit), infer unit from range when absent (e.g. 39.8 for Body temperature -> °C), validate range/format; BP 'n/n' composite.
- `createRequestSequencer()`: incrementing integer per request; discard responses whose id is not the latest or whose source text changed (Matching 2.3.1.3).
- `filterEligible(concept)`: active/current or pending move; Core + UK extension; UK language; exclude SCT-003 hierarchies as primary; text-parser base restricted to findings, procedures, observables, situations (+ events by context).
