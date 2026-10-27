"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // g:react
  var require_react = __commonJS({
    "g:react"(exports, module) {
      module.exports = window.React;
    }
  });

  // g:@clinical-cui/react
  var require_react2 = __commonJS({
    "g:@clinical-cui/react"(exports, module) {
      module.exports = window.ClinicalCUI;
    }
  });

  // examples/.entry-desktop-clinical-note.tsx
  var import_react6 = __toESM(require_react());

  // examples/desktop-clinical-note.tsx
  var import_react4 = __toESM(require_react());
  var import_react5 = __toESM(require_react2());

  // examples/shell/ExampleShell.tsx
  var import_react = __toESM(require_react());
  var import_react2 = __toESM(require_react2());
  var REGION_LABEL = { GB: "UK (NHS)", AU: "Australia", NZ: "New Zealand" };
  function readInitial(key, allowed, fallback) {
    try {
      const v = new URLSearchParams(window.location.search).get(key);
      if (v && allowed.includes(v)) return v;
    } catch {
    }
    return fallback;
  }
  function ExampleShell({ meta: meta2, children }) {
    const [region, setRegion] = (0, import_react.useState)(() => readInitial("region", meta2.regions, meta2.regions[0]));
    const [theme, setTheme] = (0, import_react.useState)(() => readInitial("theme", ["light", "dark"], document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"));
    const chrome = readInitial("chrome", ["0", "1"], "1") === "1";
    import_react.default.useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const seg = (on) => ({
      minHeight: 36,
      padding: "0 12px",
      border: "1px solid var(--border-strong)",
      marginLeft: -1,
      background: on ? "var(--accent-surface)" : "var(--surface)",
      color: "var(--ink)",
      fontFamily: "inherit",
      fontSize: 14,
      fontWeight: on ? 700 : 400,
      cursor: "pointer"
    });
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "cui-root", "data-theme": theme, style: { background: "var(--surface-sunken)", color: "var(--ink)", minHeight: "100vh", fontFamily: "var(--font-sans)" } }, chrome ? /* @__PURE__ */ import_react.default.createElement("header", { style: { background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "12px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { flex: "1 1 420px", minWidth: 0 } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: 12, color: "var(--ink-muted)" } }, /* @__PURE__ */ import_react.default.createElement("a", { href: "index.html", style: { color: "var(--accent)" } }, "Clinical CUI examples"), " \xB7 ", meta2.kind === "mobile" ? "Mobile" : "Desktop"), /* @__PURE__ */ import_react.default.createElement("h1", { style: { margin: "2px 0 4px", fontSize: 20, lineHeight: "26px" } }, meta2.title), /* @__PURE__ */ import_react.default.createElement("p", { style: { margin: 0, fontSize: 14, color: "var(--ink-muted)", maxWidth: 900 } }, meta2.description)), meta2.regions.length > 1 ? /* @__PURE__ */ import_react.default.createElement("div", { role: "group", "aria-label": "Region", style: { display: "flex", paddingLeft: 1 } }, meta2.regions.map((r) => /* @__PURE__ */ import_react.default.createElement("button", { key: r, type: "button", "aria-pressed": r === region, onClick: () => setRegion(r), style: seg(r === region) }, REGION_LABEL[r]))) : null, /* @__PURE__ */ import_react.default.createElement("div", { role: "group", "aria-label": "Theme", style: { display: "flex", paddingLeft: 1 } }, ["light", "dark"].map((t) => /* @__PURE__ */ import_react.default.createElement("button", { key: t, type: "button", "aria-pressed": t === theme, onClick: () => setTheme(t), style: seg(t === theme) }, t === "light" ? "Light" : "Dark")))) : null, /* @__PURE__ */ import_react.default.createElement(import_react2.ClinicalLocaleProvider, { region, key: region }, meta2.kind === "mobile" ? /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 32, padding: 24, alignItems: "flex-start" } }, children(region)) : /* @__PURE__ */ import_react.default.createElement("main", { style: { padding: 24, maxWidth: 1600 } }, children(region))));
  }

  // examples/data/patients.ts
  var MAIN_PATIENT = {
    GB: {
      id: "gb-1",
      familyName: "Smith",
      givenName: "Joan",
      title: "Mrs",
      dateOfBirth: "1951-04-05",
      gender: "Female",
      identifiers: [{ type: "nhs", value: "9990000018" }],
      address: { lines: ["14 Mill Lane"], town: "Ipswich", county: "Suffolk", postcode: "IP4 1AB" },
      phone: "01632 960123",
      allergies: [{ substance: "penicillin", reaction: "Anaphylaxis", recorded: "2024-02-02", by: "Dr A Patel" }],
      location: "Ward 7, bed 4"
    },
    AU: {
      id: "au-1",
      familyName: "Chen",
      givenName: "Wei",
      title: "Mr",
      dateOfBirth: "1949-09-02",
      gender: "Male",
      identifiers: [{ type: "ihi", value: "8003601234567894" }, { type: "mrn", value: "0412345" }, { type: "medicare", value: "2123456701", irn: "1", validTo: "2028-03" }],
      address: { unit: "Unit 2", lines: ["14 Smith St"], suburb: "Fitzroy", town: "Melbourne", state: "VIC", postcode: "3065" },
      phone: "0491 570 156",
      allergies: "none-known",
      location: "Ward 5B, bed 12",
      indigenousStatus: "4"
    },
    NZ: {
      id: "nz-1",
      familyName: "Ngata",
      givenName: "Mereana",
      title: "Ms",
      preferredName: "Mere",
      dateOfBirth: "1958-03-14",
      gender: "Female",
      identifiers: [{ type: "nhi", value: "ZZZ0016" }],
      address: { lines: ["22 K\u014Dwhai Street"], suburb: "Southbrook", town: "Rangiora", postcode: "7400" },
      phone: "027 000 1234",
      allergies: [
        { substance: "penicillin", reaction: "Anaphylaxis", recorded: "2024-02-02", by: "Dr A Moana" },
        { substance: "latex", reaction: "Contact dermatitis", recorded: "2024-02-02", by: "Dr A Moana" }
      ],
      location: "Ward 24, bed 7",
      ethnicity: ["21111", "31111"]
    }
  };
  var EXAMPLE_NOW = new Date(2026, 9, 27, 14, 5);

  // examples/data/desktop-clinical-note.ts
  var import_react3 = __toESM(require_react2());
  var NOTE_CONCEPTS = [
    { id: "n01", term: "Fracture of distal end of radius", fsn: "Fracture of distal end of radius (disorder)", isCommon: true, parents: ["Fracture of radius"], synonyms: ["Colles' fracture", "Distal radius fracture"] },
    { id: "n02", term: "Fall", fsn: "Fall (event)", isCommon: true, parents: ["Accidental event"] },
    { id: "n03", term: "Orthostatic hypotension", fsn: "Orthostatic hypotension (disorder)", isCommon: true, parents: ["Low blood pressure"], synonyms: ["Postural hypotension"] },
    { id: "n04", term: "Syncope", fsn: "Syncope (disorder)", isCommon: true, parents: ["Disorder of consciousness"], synonyms: ["Faint"] },
    { id: "n05", term: "Osteoporosis", fsn: "Osteoporosis (disorder)", isCommon: true, parents: ["Disorder of bone"] },
    { id: "n06", term: "Hypertensive disorder", fsn: "Hypertensive disorder, systemic arterial (disorder)", isCommon: true, parents: ["Disorder of cardiovascular system"], synonyms: ["Hypertension", "High blood pressure"] },
    { id: "n07", term: "Atrial fibrillation", fsn: "Atrial fibrillation (disorder)", parents: ["Supraventricular arrhythmia"], synonyms: ["AF - Atrial fibrillation"] },
    { id: "n08", term: "Type 2 diabetes mellitus", fsn: "Type 2 diabetes mellitus (disorder)", isCommon: true, parents: ["Diabetes mellitus"] },
    { id: "n09", term: "Cataract", fsn: "Cataract (disorder)", parents: ["Disorder of lens"] },
    { id: "n10", term: "Parkinson's disease", fsn: "Parkinson's disease (disorder)", parents: ["Degenerative disorder of basal ganglia"] },
    { id: "n11", term: "Dementia", fsn: "Dementia (disorder)", parents: ["Cognitive disorder"] },
    { id: "n12", term: "M\xE9ni\xE8re's disease", fsn: "M\xE9ni\xE8re's disease (disorder)", parents: ["Disorder of inner ear"] },
    { id: "n13", term: "Benign paroxysmal positional vertigo", fsn: "Benign paroxysmal positional vertigo (disorder)", parents: ["Vertigo"], synonyms: ["BPPV - Benign paroxysmal positional vertigo"] },
    { id: "n14", term: "Peripheral neuropathy", fsn: "Peripheral nerve disease (disorder)", parents: ["Disorder of peripheral nervous system"] },
    { id: "n15", term: "Chronic kidney disease stage 3", fsn: "Chronic kidney disease stage 3 (disorder)", parents: ["Chronic kidney disease"] },
    { id: "n16", term: "Osteoarthritis of knee", fsn: "Osteoarthritis of knee joint (disorder)", parents: ["Osteoarthritis"] },
    { id: "n17", term: "Total replacement of hip joint", fsn: "Total replacement of hip joint (procedure)", parents: ["Hip joint replacement"], synonyms: ["Total hip replacement"] },
    { id: "n18", term: "Transient ischaemic attack", fsn: "Transient cerebral ischaemia (disorder)", parents: ["Cerebrovascular disease"], synonyms: ["TIA - Transient ischaemic attack"] },
    { id: "n19", term: "Hypothyroidism", fsn: "Hypothyroidism (disorder)", parents: ["Disorder of thyroid gland"] },
    { id: "n20", term: "Fracture of neck of femur", fsn: "Fracture of neck of femur (disorder)", parents: ["Fracture of femur"], synonyms: ["Hip fracture"] }
  ];
  var searchNoteConcepts = (query, options) => new Promise((resolve) => {
    const timer = setTimeout(() => {
      const fold = { foldDiacritics: options.foldDiacritics };
      const hits = [];
      for (const c of NOTE_CONCEPTS) {
        const { synonyms, ...result } = c;
        if ((0, import_react3.matchesDescription)(query, c.term, void 0, fold)) hits.push(result);
        else {
          const syn = synonyms == null ? void 0 : synonyms.find((s) => (0, import_react3.matchesDescription)(query, s, void 0, fold));
          if (syn) hits.push({ ...result, id: `${c.id}-s`, term: syn, isSynonym: true, preferredTerm: c.term });
        }
      }
      resolve(hits);
    }, 160);
    options.signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve([]);
    });
  });
  var NOTE_HISTORY = {
    GB: [
      { id: "h1", text: "osteop", concept: { id: "n05", term: "Osteoporosis" }, dateText: "2019", additionalText: "On weekly alendronic acid" },
      { id: "h2", text: "hypert", concept: { id: "n06", term: "Hypertensive disorder" }, dateText: "past 10 years" },
      { id: "h3", text: "catar", concept: { id: "n09", term: "Cataract" }, laterality: "right", dateText: "last year" }
    ],
    AU: [
      { id: "h1", text: "af", concept: { id: "n07", term: "Atrial fibrillation" }, dateText: "since 2016", additionalText: "Anticoagulated with apixaban" },
      { id: "h2", text: "diab 2", concept: { id: "n08", term: "Type 2 diabetes mellitus" }, dateText: "past 8 years" },
      { id: "h3", text: "hip repl", concept: { id: "n17", term: "Total replacement of hip joint" }, laterality: "left", dateText: "2021", additionalText: "Mobilises with a stick since" }
    ],
    NZ: [
      { id: "h1", text: "meniere", concept: { id: "n12", term: "M\xE9ni\xE8re's disease" }, dateText: "since 2015" },
      { id: "h2", text: "osteop", concept: { id: "n05", term: "Osteoporosis" }, dateText: "2019" },
      { id: "h3", text: "catar", concept: { id: "n09", term: "Cataract" }, laterality: "right", dateText: "last year" }
    ]
  };
  var LYING_SYSTOLIC_HISTORY = [
    { value: 148, recordedAt: "2026-10-25T09:10" },
    { value: 142, recordedAt: "2026-10-26T08:40" },
    { value: 151, recordedAt: "2026-10-27T08:05" }
  ];
  var bodyOutline = (dx) => {
    const pts = [[63, 38], [40, 48], [28, 120], [24, 150], [32, 153], [40, 122], [44, 82], [46, 140], [48, 260], [44, 272], [64, 272], [66, 170], [70, 160], [74, 170], [76, 272], [96, 272], [92, 260], [94, 140], [96, 82], [100, 122], [108, 153], [116, 150], [112, 120], [100, 48], [77, 38]];
    return "M" + pts.map((p) => `${p[0] + dx} ${p[1]}`).join(" L") + " Z";
  };
  var headOutline = (dx) => `M${70 + dx} 6a16 16 0 1 0 0.01 0Z`;
  var BODY_GRAPHIC = {
    id: "body-adult",
    title: "Adult body, front and back",
    width: 300,
    height: 280,
    ageGroup: "adult",
    keywords: ["whole body", "skin", "injury"],
    images: [
      { label: "Front view", x: 0, y: 0, width: 140, height: 280, paths: [headOutline(0), bodyOutline(0)] },
      { label: "Back view", x: 160, y: 0, width: 140, height: 280, paths: [headOutline(160), bodyOutline(160), "M230 42 V150"] }
    ]
  };
  var BODY_FINDINGS = [
    { id: "g1", mark: { kind: "symbol", symbolId: "x", x: 111, y: 146 }, box: { x: 330, y: 118, width: 170 }, text: "Swelling and deformity, left wrist. Backslab applied." },
    { id: "g2", mark: { kind: "region", points: [{ x: 76, y: 150 }, { x: 90, y: 146 }, { x: 94, y: 162 }, { x: 86, y: 178 }, { x: 76, y: 170 }] }, box: { x: 330, y: 196, width: 170 }, text: "Bruising over left hip, 6 cm. No bony tenderness." },
    { id: "g3", box: { x: -190, y: 16, width: 170 }, text: "Found on the floor by a neighbour after about one hour." }
  ];
  function noteBanner(region) {
    var _a;
    const m = MAIN_PATIENT[region];
    const gender = region === "GB" ? m.gender : region === "AU" ? m.gender === "Male" ? "1" : "2" : m.gender === "Male" ? "M" : "F";
    return {
      name: { familyName: m.familyName, givenName: m.givenName, title: m.title },
      preferredName: m.preferredName,
      dateOfBirth: m.dateOfBirth,
      gender,
      nhsNumber: (_a = m.identifiers.find((i) => i.type === "nhs")) == null ? void 0 : _a.value,
      identifiers: m.identifiers.filter((i) => i.type !== "nhs").map((i) => ({ type: i.type, value: i.value, irn: i.irn, medicareValidTo: i.validTo ? `${i.validTo.slice(5)}/${i.validTo.slice(0, 4)}` : void 0 })),
      flagTestIdentifiers: false,
      address: { unit: m.address.unit, lines: m.address.lines, suburb: region === "NZ" ? m.address.suburb : void 0, town: region === "AU" ? m.address.suburb : m.address.town, state: m.address.state, county: m.address.county, postcode: m.address.postcode },
      contacts: region === "GB" ? { home: m.phone } : { mobile: m.phone },
      allergies: m.allergies === "none-known" ? { status: "none-known", recordedBy: "RN J Murphy", recordedAt: "2026-10-23T10:20" } : { status: "known", items: m.allergies.map((a) => ({ name: a.substance, reaction: a.reaction.toLowerCase(), lastUpdated: a.recorded })) }
    };
  }

  // examples/desktop-clinical-note.tsx
  var meta = {
    title: "Falls assessment note",
    description: "A structured note after an inpatient fall: choice groups with a data-triggered reveal, blood pressure with previous values, a calculated Morse Fall Scale, coded past history and diagnosis from an asynchronous terminology search, a body diagram and abbreviation-checked free text. Save lists any required field still empty.",
    kind: "desktop",
    regions: ["GB", "AU", "NZ"],
    components: [
      "PatientBanner",
      "FormField",
      "ClinicalRadioGroup",
      "ClinicalCheckboxGroup",
      "RevealSection",
      "PreviousValuesPopover",
      "CalculatedValue",
      "NoteEntryList",
      "TerminologySearch",
      "AnnotatedGraphicCanvas",
      "AbbreviationCheckedTextArea",
      "RequiredKey",
      "MissedRequiredFieldsPanel"
    ]
  };
  var MORSE = {
    history: [{ value: "0", label: "No" }, { value: "25", label: "Yes", prompt: "25 points" }],
    aid: [
      { value: "0", label: "None, bed rest or nurse assists" },
      { value: "15", label: "Crutches, stick or walking frame", prompt: "15 points" },
      { value: "30", label: "Holds on to furniture", prompt: "30 points" }
    ],
    iv: [{ value: "0", label: "No" }, { value: "20", label: "Yes", prompt: "20 points" }],
    gait: [
      { value: "0", label: "Normal, bed rest or wheelchair" },
      { value: "10", label: "Weak", prompt: "10 points" },
      { value: "20", label: "Impaired", prompt: "20 points" }
    ],
    mental: [
      { value: "0", label: "Knows own limits" },
      { value: "15", label: "Overestimates or forgets limits", prompt: "15 points" }
    ]
  };
  var morseMeaning = (n) => n >= 45 ? "High risk of falling" : n >= 25 ? "Moderate risk of falling" : "Low risk of falling";
  var MECHANISMS = [
    { value: "trip", label: "Tripped or slipped" },
    { value: "balance", label: "Lost balance" },
    { value: "dizzy", label: "Dizzy or light-headed" },
    { value: "collapse", label: "Collapsed" },
    { value: "unknown", label: "Not known" }
  ];
  var INJURIES = [
    { value: "none", label: "No injury", pinFirst: true },
    { value: "head", label: "Head injury", reveals: true, prompt: "Opens further details" },
    { value: "wrist", label: "Wrist or arm" },
    { value: "hip", label: "Hip or leg" },
    { value: "skin", label: "Skin tear" }
  ];
  var SUMMARY_TEXT = "Tripped on a rug while walking to the toilet and fell onto an outstretched left hand. No head injury and no loss of consciousness. Plan: fracture clinic referral, physiotherapy and occupational therapy review before discharge. D/C IV fluids when drinking well. Morphine 2.5 mg SC if needed for pain.";
  var card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4) var(--space-6)"
  };
  var h2 = { margin: "0 0 var(--space-3)", fontSize: 18, lineHeight: "24px", fontWeight: 600 };
  var h3 = { margin: "0 0 var(--space-2)", fontSize: 15, lineHeight: "20px", fontWeight: 600 };
  function NoteScreen({ region }) {
    var _a;
    const edition = import_react5.SNOMED_EDITIONS[region];
    const [mechanism, setMechanism] = (0, import_react4.useState)("trip");
    const [injuries, setInjuries] = (0, import_react4.useState)(["wrist", "hip"]);
    const [headLoc, setHeadLoc] = (0, import_react4.useState)(null);
    const [headAnticoag, setHeadAnticoag] = (0, import_react4.useState)(null);
    const [lying, setLying] = (0, import_react4.useState)("146");
    const [standing, setStanding] = (0, import_react4.useState)("");
    const [morse, setMorse] = (0, import_react4.useState)({ history: "25", aid: "15", iv: "20", gait: "10", mental: "0" });
    const [history, setHistory] = (0, import_react4.useState)(NOTE_HISTORY[region]);
    const [diagnosis, setDiagnosis] = (0, import_react4.useState)(() => {
      const c = NOTE_CONCEPTS[0];
      return { id: c.id, term: c.term, fsn: c.fsn, parents: c.parents, isCommon: c.isCommon };
    });
    const [findings, setFindings] = (0, import_react4.useState)(BODY_FINDINGS);
    const [summary, setSummary] = (0, import_react4.useState)(SUMMARY_TEXT);
    const [summaryValid, setSummaryValid] = (0, import_react4.useState)(true);
    const [saveAttempted, setSaveAttempted] = (0, import_react4.useState)(true);
    const [savedAt, setSavedAt] = (0, import_react4.useState)(null);
    const required = [
      { id: "f-mechanism", label: "How the fall happened", section: "What happened", empty: !mechanism },
      { id: "f-lying", label: "Lying systolic blood pressure", section: "Lying and standing blood pressure", empty: lying.trim() === "" },
      { id: "f-standing", label: "Standing systolic blood pressure (3 minutes)", section: "Lying and standing blood pressure", empty: standing.trim() === "" },
      { id: "f-diagnosis", label: "Working diagnosis", section: "Diagnosis", empty: !diagnosis },
      { id: "f-summary", label: "Clinical summary and plan", section: "Summary and plan", empty: summary.trim() === "" }
    ];
    const tracking = (0, import_react5.useRequiredFieldTracking)(required);
    const { missedItems, isMissed } = tracking;
    (0, import_react4.useEffect)(() => {
      tracking.markAllMissed();
    }, []);
    const lyingN = Number(lying);
    const standingN = Number(standing);
    const bpReady = lying.trim() !== "" && standing.trim() !== "" && isFinite(lyingN) && isFinite(standingN);
    const secondaryDiagnosis = history.filter((e) => e.concept).length >= 2 ? 15 : 0;
    const morseKeys = Object.keys(MORSE);
    const morseMissing = morseKeys.filter((k) => morse[k] === null);
    const morseTotal = morseKeys.reduce((n, k) => {
      var _a2;
      return n + Number((_a2 = morse[k]) != null ? _a2 : 0);
    }, 0) + secondaryDiagnosis;
    const morseLabels = { history: "History of falling", aid: "Walking aid", iv: "Intravenous therapy or cannula", gait: "Gait", mental: "Mental status" };
    const onSave = () => {
      setSaveAttempted(true);
      const missed = tracking.markAllMissed();
      setSavedAt(missed.length === 0 && summaryValid ? EXAMPLE_NOW : null);
    };
    const blocking = missedItems.length + (summaryValid ? 0 : 1);
    const radio = (key, legend) => /* @__PURE__ */ import_react4.default.createElement(
      import_react5.ClinicalRadioGroup,
      {
        legend,
        orientation: "horizontal",
        options: MORSE[key],
        value: morse[key],
        onChange: (v) => setMorse((m) => ({ ...m, [key]: v })),
        id: `f-morse-${key}`
      }
    );
    return /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "grid", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react4.default.createElement(import_react5.PatientBanner, { ...noteBanner(region), now: EXAMPLE_NOW, sticky: false }), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: "var(--space-6)", alignItems: "start" } }, /* @__PURE__ */ import_react4.default.createElement("form", { "aria-labelledby": "note-title", onSubmit: (e) => e.preventDefault(), ...tracking.formProps, style: { display: "grid", gap: "var(--space-4)", minWidth: 0 } }, /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("h2", { id: "note-title", style: { margin: 0, fontSize: 20, lineHeight: "26px" } }, "Falls assessment"), /* @__PURE__ */ import_react4.default.createElement("p", { style: { margin: "2px 0 0", fontSize: 14, color: "var(--ink-muted)" } }, "Post-fall review, ", (0, import_react5.formatTime)(EXAMPLE_NOW), " today")), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-what" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-what", style: h2 }, "What happened"), /* @__PURE__ */ import_react4.default.createElement(
      import_react5.ClinicalRadioGroup,
      {
        id: "f-mechanism",
        legend: "How the fall happened",
        orientation: "horizontal",
        options: MECHANISMS,
        value: mechanism,
        onChange: setMechanism,
        required: true,
        missed: isMissed("f-mechanism")
      }
    ), /* @__PURE__ */ import_react4.default.createElement(
      import_react5.ClinicalCheckboxGroup,
      {
        legend: "Injuries found",
        orientation: "horizontal",
        options: INJURIES,
        value: injuries,
        onChange: (v) => setInjuries(v.includes("none") && !injuries.includes("none") ? ["none"] : v.filter((x) => x !== "none")),
        revealAnnouncement: "Further details for head injury shown below"
      }
    ), /* @__PURE__ */ import_react4.default.createElement(
      import_react5.RevealSection,
      {
        label: "Further details: head injury",
        prompt: "Opens when head injury is ticked",
        trigger: injuries.includes("head"),
        values: [headLoc, headAnticoag]
      },
      /* @__PURE__ */ import_react4.default.createElement(import_react5.ClinicalRadioGroup, { legend: "Loss of consciousness", orientation: "horizontal", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }, { value: "unknown", label: "Not known" }], value: headLoc, onChange: setHeadLoc }),
      /* @__PURE__ */ import_react4.default.createElement(import_react5.ClinicalRadioGroup, { legend: "Taking an anticoagulant or antiplatelet", orientation: "horizontal", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }], value: headAnticoag, onChange: setHeadAnticoag })
    )), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-bp" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-bp", style: h2 }, "Lying and standing blood pressure"), /* @__PURE__ */ import_react4.default.createElement(import_react5.FormField, { id: "f-lying", label: "Lying systolic", labelPosition: "left", labelWidth: "14em", required: true, missed: isMissed("f-lying"), prompt: "mmHg, after 5 minutes lying", promptPlacement: "right" }, /* @__PURE__ */ import_react4.default.createElement(import_react5.PreviousValuesPopover, { values: LYING_SYSTOLIC_HISTORY, unit: "mmHg" }, /* @__PURE__ */ import_react4.default.createElement("input", { type: "text", inputMode: "numeric", value: lying, onChange: (e) => setLying(e.target.value), style: { width: "6em" } }))), /* @__PURE__ */ import_react4.default.createElement(import_react5.FormField, { id: "f-standing", label: "Standing systolic", labelPosition: "left", labelWidth: "14em", required: true, missed: isMissed("f-standing"), prompt: "mmHg, after 3 minutes standing", promptPlacement: "right" }, /* @__PURE__ */ import_react4.default.createElement("input", { type: "text", inputMode: "numeric", value: standing, onChange: (e) => setStanding(e.target.value), style: { width: "6em" } }))), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-morse" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-morse", style: h2 }, "Morse Fall Scale"), /* @__PURE__ */ import_react4.default.createElement("p", { style: { margin: "0 0 var(--space-3)", fontSize: 14, color: "var(--ink-muted)" } }, "Secondary diagnosis is taken from past medical history: ", secondaryDiagnosis ? "two or more coded conditions (15 points)" : "fewer than two coded conditions (0 points)", "."), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", columnGap: "var(--space-6)" } }, radio("history", morseLabels.history), radio("iv", morseLabels.iv), radio("aid", morseLabels.aid), radio("gait", morseLabels.gait), radio("mental", morseLabels.mental))), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-history" }, /* @__PURE__ */ import_react4.default.createElement(
      import_react5.NoteEntryList,
      {
        heading: "Past medical history",
        entries: history,
        onEntriesChange: setHistory,
        search: searchNoteConcepts,
        instructionText: "Add a condition or procedure. Fields for dates and details appear once a term is selected.",
        helpText: region === "NZ" ? 'Type part of each word, for example "osteo"; macrons and accents are optional' : 'Type part of each word, for example "osteo"',
        referenceDate: EXAMPLE_NOW,
        birthDate: (_a = noteBanner(region).dateOfBirth) != null ? _a : void 0,
        showLaterality: (e) => !!e.concept && ["n09", "n16", "n17"].includes(e.concept.id),
        searchOptions: { showEdition: true }
      }
    ), /* @__PURE__ */ import_react4.default.createElement("p", { style: { margin: "var(--space-2) 0 0", fontSize: 12, color: "var(--ink-muted)" } }, "Terms from SNOMED CT ", edition.label)), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-diagnosis" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-diagnosis", style: h2 }, "Diagnosis"), /* @__PURE__ */ import_react4.default.createElement(import_react5.FormField, { id: "f-diagnosis", label: "Working diagnosis", required: true, missed: isMissed("f-diagnosis") }, /* @__PURE__ */ import_react4.default.createElement(
      import_react5.TerminologySearch,
      {
        helpText: region === "NZ" ? 'Type part of each word, for example "dist rad"; macrons are optional' : 'Type part of each word, for example "dist rad"',
        search: searchNoteConcepts,
        defaultQuery: "dist rad",
        selected: diagnosis,
        onSelectionChange: setDiagnosis,
        showEdition: true,
        widthChars: 40
      }
    )), /* @__PURE__ */ import_react4.default.createElement("p", { style: { margin: 0, fontSize: 12, color: "var(--ink-muted)" } }, "Searching SNOMED CT ", edition.label)), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-body" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-body", style: h2 }, "Injuries: body diagram"), /* @__PURE__ */ import_react4.default.createElement(import_react5.AnnotatedGraphicCanvas, { graphic: BODY_GRAPHIC, findings, onFindingsChange: setFindings, sideWidth: 200 })), /* @__PURE__ */ import_react4.default.createElement("section", { style: card, "aria-labelledby": "s-summary" }, /* @__PURE__ */ import_react4.default.createElement("h3", { id: "s-summary", style: h2 }, "Summary and plan"), /* @__PURE__ */ import_react4.default.createElement(import_react5.FormField, { id: "f-summary", label: "Clinical summary and plan", required: true, missed: isMissed("f-summary") }, /* @__PURE__ */ import_react4.default.createElement(
      import_react5.AbbreviationCheckedTextArea,
      {
        value: summary,
        onChange: setSummary,
        onValidityChange: (ok) => setSummaryValid(ok),
        showAlerts: saveAttempted,
        rows: 5
      }
    )))), /* @__PURE__ */ import_react4.default.createElement("aside", { "aria-label": "Note status", style: { position: "sticky", top: "var(--space-4)", display: "grid", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react4.default.createElement("div", { style: card }, /* @__PURE__ */ import_react4.default.createElement("h3", { style: h3 }, "Scores"), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "grid", gap: "var(--space-3)" } }, /* @__PURE__ */ import_react4.default.createElement(
      import_react5.CalculatedValue,
      {
        label: "Morse Fall Scale",
        value: morseMissing.length === morseKeys.length ? null : morseTotal,
        status: morseMissing.length === 0 ? "complete" : morseMissing.length === morseKeys.length ? "cannotCalculate" : "partial",
        meaning: morseMissing.length ? void 0 : morseMeaning(morseTotal),
        scoringSystem: "Morse Fall Scale (bands: 0 to 24 low, 25 to 44 moderate, 45 and over high)",
        contributors: [
          ...morseKeys.map((k) => {
            var _a2;
            return { label: morseLabels[k], value: (_a2 = morse[k]) != null ? _a2 : void 0, unit: "points", section: "Morse Fall Scale", fieldId: `f-morse-${k}`, source: "form" };
          }),
          { label: "Secondary diagnosis", value: secondaryDiagnosis, unit: "points", section: "Past medical history", source: "form" }
        ],
        onNavigateToField: (id) => {
          var _a2;
          return (_a2 = document.getElementById(id)) == null ? void 0 : _a2.scrollIntoView({ block: "center" });
        }
      }
    ), /* @__PURE__ */ import_react4.default.createElement(
      import_react5.CalculatedValue,
      {
        label: "Postural drop",
        value: bpReady ? lyingN - standingN : null,
        unit: "mmHg",
        status: bpReady ? "complete" : "cannotCalculate",
        cannotCalculateText: "Cannot be calculated: standing reading missing",
        meaning: bpReady ? lyingN - standingN >= 20 ? "Postural hypotension" : "No postural hypotension" : void 0,
        normalRange: { high: 19 },
        scoringSystem: "Lying systolic minus standing systolic at 3 minutes; 20 mmHg or more is a postural drop",
        contributors: [
          { label: "Lying systolic", value: lying || void 0, unit: "mmHg", section: "Lying and standing blood pressure", fieldId: "f-lying", source: "form" },
          { label: "Standing systolic", value: standing || void 0, unit: "mmHg", section: "Lying and standing blood pressure", fieldId: "f-standing", source: "form" }
        ],
        onNavigateToField: (id) => {
          var _a2;
          return (_a2 = document.getElementById(id)) == null ? void 0 : _a2.focus();
        }
      }
    ))), /* @__PURE__ */ import_react4.default.createElement(import_react5.MissedRequiredFieldsPanel, { items: missedItems, intro: "Complete these before saving the note.", sticky: false }), /* @__PURE__ */ import_react4.default.createElement("div", { style: { ...card, display: "grid", gap: "var(--space-3)" } }, /* @__PURE__ */ import_react4.default.createElement(import_react5.RequiredKey, null), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", gap: "var(--space-2)" } }, /* @__PURE__ */ import_react4.default.createElement(import_react5.Button, { variant: "primary", onClick: onSave }, "Save note"), /* @__PURE__ */ import_react4.default.createElement(import_react5.Button, { variant: "secondary" }, "Cancel")), /* @__PURE__ */ import_react4.default.createElement("p", { role: "status", style: { margin: 0, fontSize: 14, color: savedAt ? "var(--success)" : "var(--ink-muted)" } }, savedAt ? `Saved at ${(0, import_react5.formatTime)(savedAt)}` : saveAttempted && blocking ? `Not saved: ${missedItems.length ? `${missedItems.length} required field${missedItems.length === 1 ? "" : "s"} empty` : ""}${missedItems.length && !summaryValid ? " and " : ""}${summaryValid ? "" : "abbreviations to correct in the summary"}` : "Not saved yet")))));
  }
  function DesktopClinicalNote() {
    return /* @__PURE__ */ import_react4.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react4.default.createElement(NoteScreen, { region }));
  }

  // examples/.entry-desktop-clinical-note.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react6.default.createElement(DesktopClinicalNote));
})();
