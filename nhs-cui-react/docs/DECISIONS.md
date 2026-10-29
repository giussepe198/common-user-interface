# Decisions, conflicts and gaps

Where the source documents disagree or say nothing, the build had to choose. The safer option was taken each time. Component READMEs mark these choices `[suggested]`; items the regional notes mark uncertain are implemented as configurable data with the default stated in the README.

## Regions

Every region-aware control reads `ClinicalLocaleProvider` (GB, AU, NZ) or takes a `region` prop. GB is the default and behaves exactly as the NHS CUI guidance describes. AU follows ACSQHC, ADHA, ABS/METeOR, Australia Post and ACMA (notes: `guidance-notes/G10-australia.md`). NZ follows HISO, HQSC, Stats NZ and NZ Post (notes: `guidance-notes/G11-new-zealand.md`).

### Before production use, verify against the primary sources

- **Lettering lists.** The AU National Mixed-Case Lettering List (Apr 2024) and the NZ HQSC Tall Man list (Oct 2023) casing came from text extraction. Check against the PDF and XLSX.
- **NZEWS.** Bands, colours and escalation thresholds are transcribed from the HQSC chart. Heart rate 120s follows the chart (scores 2), not the user guide. Yellow, orange and red response wording is placeholder for local set-up. Needs clinical sign-off.
- **AU ADDS.** Published bands are captured; every score and colour is a placeholder (ACSQHC itself calls the cut-offs placeholders) and the chart says so on screen.
- **GB NEWS2** values are from the published RCP chart; the response colours are this library's choice.
- **SNOMED CT edition identifiers.** Module, edition URI and refset ids (especially NZ, including te reo) are configurable through `edition` and must be checked against current release notes.
- **Te reo Māori labels** beyond the HISO value sets, and the HISO 10001 "Other" line wording, need checking by the standard owners or a qualified translator.
- **Identifier display grouping.** IHI/HPI 4-4-4-4 and Medicare 4-5-1 groupings have no official rule; NHI is shown as seven unbroken characters. NZ HPI is checked for format only (no published check algorithm).

### Regional choices

- **Dates.** AU and NZ keep `dd-Mmm-yyyy` on screen (the ACSQHC on-screen guideline uses it). Numeric dates are read day first without asking, and month-first entry is refused. AU uses "Thur" in day abbreviations, per ACSQHC 2024. A DD/MM/YYYY option exists on the banner to match wristbands.
- **Time zones.** Daylight saving comes from the platform time zone database for every zone, including Lord Howe (30 minutes) and Chatham (+12:45). "Today" and "now" use the locale's time zone in AU and NZ.
- **Midnight.** ACSQHC 2024 advises against scheduling doses at 00:00. `TimeInput` can warn (`warnAtMidnight`, off by default) and AU drug chart lines at 00:00 or 24:00 carry a note.
- **Names.** Family names are upper case in GB and AU banners and kept as recorded in NZ (HISO 10046). Macrons are normalised to NFC and never stripped; search may ignore them, display never does. AU and NZ support "This person has only one name".
- **Sex and gender.** AU uses the ABS 2020 standard (sex recorded at birth plus gender, METeOR codes). NZ shows gender with the HISO 10046 codes F/M/O/U and te reo labels when `teReoLabels` is on.
- **Allergies.** AU: "Nil known", "Unknown", "Not recorded". NZ: three explicit states, and "Unknown" needs a reason. In every region an empty list is a "Not recorded" warning, never "no known".
- **Medicines.** AU follows the ACSQHC on-screen guideline: 16-element order with strength first, ingredient bold lower case, brand in Title Case italic after an en dash, never truncated, units spelt out. NZ keeps the GB order with HQSC rules. NZ brand names are Title Case, not capitals, so Tall Man lettering stays readable. Mixed-case lettering is on by default for AU and NZ, and screen readers get the plain name.
- **Abbreviations.** GB, AU (ACSQHC 2024) and NZ (HQSC) each have their own do-not-use list and accepted terms. In AU, single-letter terms such as D are flagged only after a number, so "vitamin D" passes.
- **Administration codes.** AU NIMC: A, F, R, V, L, N, W, S, plus circled P on paediatric charts. NZ HQSC: CP, D, N, R, RV, SM, U, W. In AU a late or early dose shows a tick, because L means "On leave". NZ has no Nil by Mouth code, so skipping a dose records D.
- **Addresses.** AU postcode and state mismatches warn but never block. "2/14 Smith St" is split as unit 2. NZ rural delivery is normalised to "RD 2".

## Across the library

- **Colours and fonts.** No source document gives a palette. `design/tokens.json` is this library's own, keeps the fixed colour meanings and passes WCAG contrast in light and dark. The early warning zone colours use the HQSC published fills in light theme (as local CSS custom properties `--ews-zone-*`).
- **Accessibility target** is WCAG 2.2 AA, which meets the NZ Web Accessibility Standard 1.2 and the AU Digital Service Standard.
- **"cuidesignguide.pdf"** is the Release 4 handover requirements spreadsheet. Handover layout and wording are suggestions.
- The deceased patient banner uses a hatch pattern so the state does not rely on colour.

## NHS CUI conflicts (GB)

- Family name maximum 40 characters (QIG and PDS), not 35. Title optional. Banner label "Gender" with a definition.
- The documents' example NHS number 129 728 7652 fails Modulus 11; previews use 999 000 0018, 0026, 0034.
- PAL-0470/0480 captions are swapped in the source; the rule text was followed. FSG-0027 OR-by-default kept as written.
- Medication separator is an en dash as in every rendered example. No black triangles anywhere; chevrons for disclosure, arrows for sort.
- Command bar order Cancel, Preview, Authorise, so Authorise sits bottom right (MSP-2290).
- `ClinicalRadioGroup` has no default selection (Elaboration 2.3.2) against CNA-1930; `defaultSelection="first"` restores CNA-1930.
- Terminology 2007 vs 2011: 10 visible rows, wrap by default, 62-character truncation option, no numbering, minimum 2 characters, semantic tags never shown. "Known absent" (410516002) used for negation.

## Phase 3 additions (identity, observations, finishing items)

- **My Health Record** (`MyHealthRecordStatus`): 11 access states, record and limited document access codes, emergency access with the ADHA declaration, a reason, a ground and an audit acknowledgement. The declaration's last words differ between the ADHA developer guide ("or to public health") and OAIC ("public health or safety"); it is configurable. Wording for "not connected" and "unavailable" is [suggested].
- **Medicare valid to** is MM/YYYY with "Card expired" and "Card expires soon" (1 month, [suggested]).
- **NZ protection flags** (HISO 10046): names show with a "Protected" indicator; addresses are masked by default and reveal only with a reason. No source sets these display rules, so they are [suggested].
- **Dormant NHI** shows the live NHI with a "Use live NHI" action; `NhiInput` warns through a host lookup.
- **Partial dates of birth** are stored as YYYY[MM[DD]]; ages show as a range when ambiguous ("50y or 51y"). Year-only or year-month strings passed to the banner are now partial, not 01-Jan.
- **Ethnicity output** follows HISO 10001 Appendix A (level aggregation, reduce to six or three). Prioritisation exists only as a reporting utility; no "principal" ethnicity is ever displayed.
- **Sensitive questions** (variations of sex characteristics, sexual orientation; AU ABS 2020, NZ Stats NZ) render nothing unless enabled and hide answers until shown. ABS alternative options without published codes are not offered.
- **Indigenous status** interviewer variant uses the METeOR two-step question. The self-completed "both" instruction keeps its earlier wording; the verified METeOR text is available as `bothInstructionMeteor` and should become the default once confirmed.
- **NSW Between the Flags** (`EWS_NSW_BTF`) zone boundaries come from secondary SESLHD sources because the SAGO chart prints zones as colour bands only. Shared boundary values were placed in the red zone. Verify every boundary against the printed chart and local CERS changes.
- **Critical thresholds** (GTAB-177) count the limit itself as critical unless `inclusive: false`, and never change an early warning score.
- **AU long dates** follow the Australian Government Style Manual ("5 March 2026"); short dates stay dd-Mmm-yyyy.
- **Drag handles** (note entries, marquee handles, canvas) are pointer-only; the same actions exist on the keyboard. New drag controls follow the drag and drop model below (keyboard pick up and drop, touch, live announcements).

## Phase 4: mobile (touch and dictation)

- **Direction.** Task-first worklist (B) as the nursing home screen, patient-first record (A) for review, voice capture (C) as a mode in both; shared patterns P1 to P4. Concepts: `mobile-concepts/`.
- **Speech.** The consumer supplies the engine. The optional `WebSpeechEngine` may send audio to the browser vendor's cloud; check this against Privacy Act obligations (AU and NZ) before enabling it for patient data.
- **Teen/ty confusion** ("fifteen"/"fifty") is flagged only when both readings fall inside a plausible range for that parameter; digits from the engine are treated as possibly misheard too, so "one forty on eighty" asks 140/80 or 114/80. Nothing is inferred that was not heard.
- **Dose plausibility.** A ten-fold or greater difference, or the same number in a different unit, forces "Use prescribed" or "Keep as heard". Smaller differences are listed without blocking.
- **Administration checks** (minimum interval, rolling 24-hour maximum, part tablets) are warnings that need an "I have checked these warnings" tick, not hard blocks (MEDa-0136 says advisory). Wristband and product scans must match before recording.
- **Worklist tolerance** is 30 minutes either side of the due time [suggested]. Similar names are detected across the worklist, ignoring macrons.
- **Hold-to-confirm** defaults to 1.5 seconds; a tap, keyboard or screen reader opens a confirm dialog instead.
- **Sheets** push a browser history entry so Android back closes them; turn off per sheet if it conflicts with your router. Sheets holding unsaved data refuse swipe, backdrop and back dismissal.
- **Dates without a year** typed on mobile ("5/4", "12 Mar") take the most recent past date and the read-back says "year assumed". Future times are blocked by default.
- **Undo window** after a commit is 10 seconds.

## Drag and drop (interaction area, 29-Oct-2026)

Notes: `guidance-notes/G13-drag-and-drop.md`. The NHS CUI guidance has no drag and drop document, so the model is this library's own, built on WCAG 2.2 (2.5.7 Dragging Movements, 2.1.1 Keyboard, 4.1.3 Status Messages) and the few CUI fragments that touch it. Every rule is [suggested].

- **Never the only way.** Each drag has a single-pointer alternative on the item (move up and down buttons, a "Move to" menu, a "Move to..." dialog) and a keyboard model on the handle: Space or Enter picks up, arrows move, Space or Enter drops, Escape cancels. Each step is announced in plain words in a polite live region.
- **Pointer events, not HTML drag and drop.** The browser API has no touch and no keyboard support. A mouse drag starts after 4 px; a touch drag starts with a 400 ms long press on the handle so a swipe still scrolls. Handles are 44 px on coarse pointers. The scrolling area follows the pointer near its edge. Reduced motion: nothing animates.
- **Consequences before commit.** `canDrop` returns `true` or the reason in words, shown on the target. `onDrop`/`onMove` may be asynchronous; the item says "Moving" and goes back with the reason when refused. A time grid move always opens a confirmation that lists the consumer's warnings and stops (`checkMove`) before `onMove` runs. Optimistic display and Undo are the consumer's choice, only for reversible moves.
- **Permission.** `canDrag` (or `disabled`) false means no handle, no move buttons and no Move menu: a read-only user sees the content only.
- **Never drag for high-consequence moves.** Bed moves (a transfer), legal status, identity, medicine schedules, referral priority and triage category are never committed by a drop; at most a drop opens the reviewed form with the destination filled in.
- **Privacy.** The drag preview shows the item's own fields and nothing more.
- **Where the engine lives.** CONVENTIONS keep `src/core` for the library owner, so the engine is a new area, `src/interaction` (`useDragAndDrop`, `DragAnnouncer`, the pure geometry and keyboard functions in `utils/dragDrop.ts`, plus `SortableList`, `Board` and `ScheduleGrid`), with no runtime dependency besides React. Other areas import it from its index (`ColumnChooser` uses `SortableList`). If the owner prefers, the engine can move into core unchanged.
- **Time grids.** `ScheduleGrid` reads and draws times in one stated zone (the locale's by default, or a `timeZone` prop), converts through the platform time zone database across daylight saving changes, snaps to the slot length (15 minutes by default) and never makes a block shorter than one slot. Gridlines are thin (TLN-0140). In AU a move to 00:00 carries a warning (AU-DT-06).

### Survey of existing controls (29-Oct-2026)

| Control | Drag? | Why |
| --- | --- | --- |
| ColumnChooser | Now (SortableList) | The user owns the column order (PAL-0710); locked key columns stay fixed (PAL-0720). Move buttons and names unchanged. |
| GraphStack | Next | GTAB-151 lets the user reorder graphs; it has move buttons today. The plots take pointer input for the focus line, so the handle needs care. |
| NoteEntryList | Next | It has a mouse-only HTML drag (no touch, no keyboard pick up); move it onto the engine. The move buttons and Alt+arrows stay. |
| TimelineView, ObservationGraph | Never to move entries | Entries are dated clinical record items; their dates change through the record, not by dragging. Time navigation stays as it is. |
| MedicationsList, MobileMedicationsList | Never | MEDa-0032: the order is kept until refresh; a medicine's schedule is never changed by a drop. |
| PatientList, DataTable | Never | Row order is a sort the user chooses, not a stored order. |
| Tabs, SideNav, MenuButton | Never | Commands and sections stay in a fixed order (FSG-0004). |
| HandoverTaskList, Worklist (mobile) | No | Status changes are part of the handover read-back or a single tap with undo; swipe never commits (Phase 4). |
| FileInput | Already | Dropping files is a shortcut beside the "Choose file" button. |
| Day or week appointment grid | New: ScheduleGrid | No time grid existed; built with move, resize and the "Move to..." dialog. |
| Kanban board | New: Board | Tasks by status, queues by state, with a "Move to" menu as the only route on a phone. |

## Foundations: tokens, density and the responsive contract (29-Oct-2026)

- **Type styles are tokens.** Sizes come from `--font-size-<style>` and `--line-height-<style>` or the classes `.cui-type-<style>`. The classes gained the `cui-type-` prefix so a generic name such as `.label` or `.heading` never collides with an application's own classes (a breaking change for anyone who used the unprefixed classes). Three styles were added: `caption` 11/14 (axis ticks, counters; never for data a decision depends on), `detail` 13/18 (second lines in dense rows) and `touch-body` 16/22 (touch controls, so iOS does not zoom). `src/core/tokens.test.ts` fails on a literal size, spacing or colour that a token covers.
- **Control heights are tokens.** `--control-height` is 32px at the default compact density, 40px under `[data-density="standard"]` and 44px on a coarse pointer. Touch targets are `--target-coarse` 44, `--target-touch` 48 and `--target-commit` 56. One rule in `core/base.css` makes every interactive element at least 44px under a coarse pointer, so no control needs its own touch rule.
- **Dark theme** also follows `prefers-color-scheme: dark` unless the page sets `data-theme="light"`; `.cui-root` sets font, size, ink, background and colour scheme from tokens.
- **Responsive by container, not viewport.** Every control works from 320px to a wide desktop. Controls declare a named size container and adapt with container queries, lists become labelled cards below about 600px, banners and toolbars wrap and then reduce to the essentials, and nothing scrolls the page sideways. CONVENTIONS "Responsive" has the rules.
- **New colour tokens**: `legal`, `restricted` and `consent` (each with `-surface` and `on-`), for the mental health extension, and `ews-zone-*` fills (the HQSC published NZEWS fills in light theme, darker shades of the same hue in dark). All pass `scripts/contrast.mjs`, which now exits non-zero on a failure. The three extension hues are locked: a theme must not change them, because each carries one meaning.

## Shell, forms, data and search (29-Oct-2026)

The NHS CUI guidance describes clinical content, not the application around it, so these areas are this library's own and every rule is [suggested] unless a README cites a CUI ID.

- **Shell.** One application frame (`AppShell` with `TopBar`, `SideNav`, an optional patient banner slot and a skip link). Overlays (`Dialog`, `Drawer`, `MenuButton`) trap focus, return it, block global shortcuts while open and become bottom sheets on a phone; a drawer keeps its shape while open, so turning a phone never loses what was typed. `Drawer modal={false}` gives a side panel beside the page. `Tabs` never clip a tab: what does not fit moves into a "More" menu. `Stack` and `Cluster` exist so applications never need inline layout styles. `Message`, `Toast`, `EmptyState` and `Skeleton` say their state in words (a skeleton's status is named by its label).
- **Forms.** Every field has three slots (label, control, feedback). In `FormRow` and `FormGrid` each field is a subgrid of the row, so the label track is as tall as the tallest label, all controls share one track and hints and errors sit below the control without pushing it: a label that wraps beside a one-line label leaves both controls level. Heights come from `--control-height`. The date, time and duration inputs gained a `bare` mode so they sit inside `FormField` with the host's label and error. `Combobox` follows the ARIA 1.2 pattern, takes asynchronous options with cancellation and filters again when static options arrive after typing; `MultiSelect` shows choices as removable chips.
- **Data.** `DataTable` brings the `PatientList` interaction model (sort, filter, column chooser, list search) to lists that are not of patients, and shows cards when its columns cannot fit. Charts never fit the axis to the data alone: bands are named, a missing or suppressed value is said in words and a "Show table" view gives every value. `DiffTable` shows versions side by side with the change in words; earlier values are never struck out. `StatTile` gives one count or rate with its trend in words.
- **Search.** One deterministic matching engine (`smartSearch`) serves list search, lookups and an application-wide `CommandSearch`. It matches words in any order at the start of words, ignores case, accents and macrons ("maori" finds "Māori"), allows a close spelling bounded by word length (one edit from 4 letters, two from 7), matches names by sound with the PAL-0560 similar-name rule, matches identifiers only exactly or by their start (never by a close spelling), reads dates in the CUI form, ISO and day first, and ranks exact, start of word, within a word, close spelling, then sounds alike. A close match always says why ("Sounds like", "Close spelling of"). No language model or network service is involved, so the same words always find the same items in the same order. A list of people never puts the query in the address or in browser storage.
- **Cross-area imports.** A few modules import another area's module file rather than its index (`lists` and `search`, `data` and `lists`), because the index imports would form a cycle. This is the only exception to the index-only rule.

## Mental health extension (29-Oct-2026)

`src/mental-health` covers what mental health services need beyond the CUI documents: legal status and orders, risk, safety plans, restricted information and emergency access, consent to share, observation levels and rounds, leave, restrictive practice, outcome measures, contacts, support people and care plan goals. The CUI documents say nothing about these, so every rule is [suggested]; the controls reuse the CUI controls (patient banner, identification cell, observation graph, alert symbol) rather than forking them.

- **Privacy with discoverability.** Staff screens may be seen by the person or by others. The always-visible parts show glanceable signals that a clinician needs to act safely and no more: identity, the legal status with its countdown when an expiry is near or passed, the alert count by severity without alert text, "Sharing restricted" without who it concerns, "Restricted information held" without what it is, and allergy names on one line. The detail (alert text, sharing restrictions, legal reasons, reactions, contacts) is one deliberate click away, in the banner's Zone 2 or a reveal. Badges are kept for what matters to risk (high alerts, an unconfirmed or expired order); everything else is plain words.
- **Legal words come from the host.** Order types, statutory roles, time limits, review intervals and value sets are passed in as props in the host's words. The controls format, order and count down; they never decide a legal fact, and no Act is hard-coded.
- **The host is authoritative.** Where the host's system of record decides a state (leave overdue after a grace period, an observation due time, a measure total), the control shows it and never works out a different one from the clock. Measure totals count only what the instrument definition counts.
- **Status in words, an icon and the inline-start bar.** Legal, restricted and consent states use their own locked hues and never colour alone. Risk alerts show the severity word first ("High alert:") and never a number or score; high and moderate differ in symbol shape, not only hue. Alert lists cannot be dismissed.
- **Restricted content fails closed.** The category stays visible; the content renders only after the viewer gives a reason and the host's `onReveal` returns true, so the opening is recorded before anything shows.
- **Emergency (break-glass) access** follows the CUI My Health Record emergency access pattern (G12): a reason from a list, a written justification of at least 20 characters with a live count, a time box from the host's choices with the maximum shown, and a declaration. Every opening starts empty. While access is active `BreakGlassBar` shows the end time with its zone, the time left and "Every view is recorded", and cannot be dismissed.
- **Times** are shown absolute first (date, 24-hour time and zone) then relative, never relative alone, in the jurisdiction's zone; nothing animates.
- **Nothing is deleted.** A contact or entry recorded in error stays visible, struck through, with the reason in words.
- **Person display** follows the CUI banner (FAMILY, Given) and keeps the preferred name and pronouns beside the legal name ("Known as Lan (she/her)"), with sex after the date of birth; a missing sex or date of birth says "Not Known".
- **The person's own words.** Safety plans, care plan goals and formulations hold the person's words as given, and the safety plan has a print layout for the person's copy.

## Not built yet

- MicroPatientBanner does not yet show partial dates of birth, protection flags or My Health Record status.
- DateTimeDisplay and CalendarPicker still use the CUI screen-reader date form in AU.
- GTAB-177 target ranges (critical thresholds are built).
- Replacing free text with template values (Theme 6 leaves this to the host) and the icon beside an encoded term (Theme 5).
- **Experimental** (from consultation documents, not baselined guidance): ClinicalStatement, StatementList, template controls, care pathway controls.
