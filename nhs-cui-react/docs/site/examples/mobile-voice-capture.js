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

  // examples/.entry-mobile-voice-capture.tsx
  var import_react5 = __toESM(require_react());

  // examples/mobile-voice-capture.tsx
  var import_react3 = __toESM(require_react());
  var import_react4 = __toESM(require_react2());

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
  function PhoneFrame({ caption, children }) {
    return /* @__PURE__ */ import_react.default.createElement("figure", { style: { margin: 0, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ import_react.default.createElement("figcaption", { style: { fontSize: 14, fontWeight: 600, color: "var(--ink-muted)" } }, caption), /* @__PURE__ */ import_react.default.createElement("div", { style: { width: 390, height: 844, overflow: "auto", position: "relative", background: "var(--surface-sunken)", border: "1px solid var(--border-strong)", borderRadius: 24, boxShadow: "var(--shadow-dialog)", transform: "translateZ(0)" } }, children));
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

  // examples/data/mobile-patient-review.ts
  var today = (hh, mm = 0, dayOffset = 0) => new Date(2026, 9, 27 + dayOffset, hh, mm);
  var NZ_ETHNICITY = { "21111": "M\u0101ori", "31111": "Samoan" };
  var cardMonth = (v) => v ? `${v.slice(5, 7)}/${v.slice(0, 4)}` : void 0;
  function mobileIdentity(p, region) {
    var _a;
    const identifiers = p.identifiers.map(
      (i) => i.type === "medicare" ? { type: "medicare", value: i.value, irn: i.irn, medicareValidTo: cardMonth(i.validTo) } : { type: i.type, value: i.value }
    );
    const mobilePhone = /^0(2|4)/.test(p.phone);
    return {
      id: p.id,
      name: { familyName: p.familyName, givenName: p.givenName, title: p.title },
      preferredName: p.preferredName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      identifiers,
      location: p.location,
      allergies: p.allergies === "none-known" ? { status: "none-known", recordedAt: "2026-10-26", recordedBy: "RN T Walsh" } : {
        status: "known",
        items: p.allergies.map((a) => ({ name: a.substance, reaction: a.reaction, lastUpdated: a.recorded, recordedBy: a.by }))
      },
      address: {
        unit: p.address.unit,
        lines: p.address.lines,
        suburb: region === "NZ" ? p.address.suburb : void 0,
        town: region === "AU" ? (_a = p.address.suburb) != null ? _a : p.address.town : p.address.town,
        state: p.address.state,
        county: p.address.county,
        postcode: p.address.postcode
      },
      phones: mobilePhone ? { mobile: p.phone } : { home: p.phone },
      ethnicity: p.ethnicity ? { entries: p.ethnicity.map((code) => {
        var _a2;
        return { code, label: (_a2 = NZ_ETHNICITY[code]) != null ? _a2 : code };
      }) } : void 0,
      indigenousStatus: p.indigenousStatus,
      // Region-only facts the examples demonstrate: an NZ protected address (HISO 10046, G12 3) and the AU My Health
      // Record state (G12 2). Set here so the header, details sheet and switch guard all see the same record.
      protection: region === "NZ" ? { address: true } : void 0,
      myHealthRecord: region === "AU" ? "available" : void 0
    };
  }
  var mg = (v) => ({ kind: "simple", values: [v], unit: "mg" });
  var LINES = {
    paracetamol: {
      genericName: "paracetamol",
      strength: mg(500),
      form: "tablet",
      route: "oral",
      dose: { value: 1, unit: "g" },
      frequency: "four times a day"
    },
    clindamycin: {
      genericName: "clindamycin",
      strength: mg(150),
      form: "capsule",
      route: "oral",
      dose: { value: 450, unit: "mg" },
      frequency: "four times a day",
      indication: "for cellulitis"
    },
    enoxaparin: {
      genericName: "enoxaparin",
      strength: { kind: "inFluid", values: [40], unit: "mg", fluidQuantity: 0.4, fluidUnit: "mL" },
      form: "injection",
      route: "subcutaneous",
      dose: { value: 40, unit: "mg" },
      frequency: "once a day",
      qualifiers: ["at 18:00"]
    },
    metoprolol: {
      genericName: "metoprolol",
      strength: mg(47.5),
      form: "modified-release tablet",
      route: "oral",
      dose: { value: 47.5, unit: "mg" },
      frequency: "once a day",
      qualifiers: ["in the morning"]
    },
    oxycodone: {
      genericName: "oxycodone",
      strength: mg(5),
      form: "capsule",
      route: "oral",
      dose: { value: 5, unit: "mg" },
      frequency: "every 4 hours when required",
      qualifiers: ["maximum 30 mg in 24 hours"],
      indication: "for pain"
    },
    ondansetron: {
      genericName: "ondansetron",
      strength: mg(4),
      form: "orally disintegrating tablet",
      route: "oral",
      dose: { value: 4, unit: "mg" },
      frequency: "every 8 hours when required",
      indication: "for nausea"
    },
    amlodipine: {
      genericName: "amlodipine",
      strength: mg(5),
      form: "tablet",
      route: "oral",
      dose: { value: 5, unit: "mg" },
      frequency: "once a day"
    },
    doxycycline: {
      genericName: "doxycycline",
      strength: mg(100),
      form: "capsule",
      route: "oral",
      dose: { value: 100, unit: "mg" },
      frequency: "once a day"
    },
    omeprazole: {
      genericName: "omeprazole",
      strength: mg(20),
      form: "capsule",
      route: "oral",
      dose: { value: 20, unit: "mg" },
      frequency: "once a day"
    }
  };
  var CHART = [
    {
      id: "para",
      name: "paracetamol",
      line: LINES.paracetamol,
      kind: "regular",
      route: "oral",
      startDate: today(8, 0, -3),
      events: [
        { id: "p08", scheduledTime: today(8), status: "given", administeredAt: today(8, 5), recordedBy: "RN T Walsh" },
        { id: "p13", scheduledTime: today(13) },
        { id: "p18", scheduledTime: today(18) },
        { id: "p22", scheduledTime: today(22) }
      ]
    },
    {
      id: "clin",
      name: "clindamycin",
      line: LINES.clindamycin,
      kind: "regular",
      route: "oral",
      startDate: today(6, 0, -2),
      events: [
        { id: "c06", scheduledTime: today(6), status: "given", administeredAt: today(6, 10) },
        { id: "c12", scheduledTime: today(12), status: "given", administeredAt: today(12, 5) },
        { id: "c18", scheduledTime: today(18) },
        { id: "c24", scheduledTime: today(23, 59) }
      ]
    },
    {
      id: "enox",
      name: "enoxaparin",
      line: LINES.enoxaparin,
      kind: "regular",
      route: "subcutaneous",
      startDate: today(18, 0, -3),
      events: [{ id: "e18", scheduledTime: today(18) }]
    },
    {
      id: "meto",
      name: "metoprolol",
      line: LINES.metoprolol,
      kind: "regular",
      route: "oral",
      startDate: today(8, 0, -7),
      events: [{ id: "m08", scheduledTime: today(8), status: "given", administeredAt: today(8, 5) }]
    },
    {
      id: "oxy",
      name: "oxycodone",
      line: LINES.oxycodone,
      kind: "asRequiredUnscheduled",
      route: "oral",
      startDate: today(0, 0, -3),
      asRequired: { minIntervalMinutes: 240, criteria: "for pain" },
      events: [{ id: "o1", status: "given", administeredAt: today(10, 30) }]
    },
    {
      id: "ond",
      name: "ondansetron",
      line: LINES.ondansetron,
      kind: "asRequiredUnscheduled",
      route: "oral",
      startDate: today(0, 0, -3),
      asRequired: { minIntervalMinutes: 480, criteria: "for nausea" },
      events: [{ id: "n1", status: "given", administeredAt: today(22, 10, -1) }]
    }
  ];
  var MEDICATION_ALERTS = { enox: ["Renal function alert"] };
  var MEDICINES = [
    { id: "para", status: "Started", startDate: today(8, 0, -3), line: LINES.paracetamol, schedule: { state: "overdue", at: today(13) } },
    {
      id: "clin",
      status: "Started",
      startDate: today(6, 0, -2),
      line: LINES.clindamycin,
      schedule: { state: "given", lastGivenAt: today(12, 5), nextAt: today(18) }
    },
    {
      id: "enox",
      status: "Started",
      startDate: today(18, 0, -3),
      line: LINES.enoxaparin,
      schedule: { state: "next", at: today(18) },
      alerts: MEDICATION_ALERTS.enox,
      hasAlert: true
    },
    {
      id: "meto",
      status: "Started",
      startDate: today(8, 0, -7),
      line: LINES.metoprolol,
      schedule: { state: "given", lastGivenAt: today(8, 5), nextAt: today(8, 0, 1) }
    },
    {
      id: "oxy",
      status: "Started",
      startDate: today(0, 0, -3),
      line: LINES.oxycodone,
      schedule: { state: "notAvailable", lastGivenAt: today(10, 30), availableFrom: today(14, 30) }
    },
    {
      id: "ond",
      status: "Started",
      startDate: today(0, 0, -3),
      line: LINES.ondansetron,
      schedule: { state: "available", lastGivenAt: today(22, 10, -1) }
    },
    { id: "aml", status: "Suspended", suspendedOn: today(9, 0, -1), startDate: today(8, 0, -7), line: LINES.amlodipine },
    { id: "doxy", status: "Completed", startDate: today(8, 0, -12), endDate: today(8, 0, -5), line: LINES.doxycycline },
    { id: "ome", status: "Discontinued", startDate: today(8, 0, -7), endDate: today(10, 0, -2), line: LINES.omeprazole }
  ];
  var DUE = [
    { id: "para", line: LINES.paracetamol, state: "overdue", at: today(13) },
    { id: "clin", line: LINES.clindamycin, state: "next", at: today(18) }
  ];
  var SWITCH_TARGET_CHART = [
    {
      id: "ins",
      name: "insulin aspart",
      kind: "regular",
      route: "subcutaneous",
      startDate: today(8, 0, -1),
      line: {
        genericName: "insulin aspart",
        brandName: "NovoRapid",
        strength: { kind: "perUnit", values: [100], unit: "units", fluidUnit: "mL" },
        form: "injection",
        route: "subcutaneous",
        dose: { value: 6, unit: "units" },
        frequency: "three times a day",
        qualifiers: ["with meals"]
      },
      events: [
        { id: "i08", scheduledTime: today(8), status: "given", administeredAt: today(8, 2) },
        { id: "i12", scheduledTime: today(12), status: "given", administeredAt: today(12, 10) },
        { id: "i18", scheduledTime: today(18) }
      ]
    }
  ];
  var SWITCH_TARGET_MEDICINES = [
    {
      id: "ins",
      status: "Started",
      startDate: today(8, 0, -1),
      line: SWITCH_TARGET_CHART[0].line,
      schedule: { state: "next", at: today(18) }
    }
  ];

  // examples/data/mobile-voice-capture.ts
  var SUBJECT = { GB: "she", AU: "he", NZ: "she" };
  function observationScript(region) {
    return [
      { interim: ["Resp", "Resp rate fif"], final: "Resp rate fifteen," },
      { interim: ["sats ninety"], final: "sats ninety three," },
      { interim: ["BP one ten"], final: "BP one ten on seventy," },
      { final: "heart rate one hundred and twelve," },
      { interim: ["temp thirty eight"], final: `temp thirty eight point four, ${SUBJECT[region]}'s alert` }
    ];
  }
  var NOTE_TEXT = "Day 2 of cellulitis of left lower leg. Erythema now 2 cm beyond the marked margin, worse since yesterday. Fever 38.4. Plan: continue clindamycin four hundred and fifty micrograms four times a day and paracetamol 1 g four times a day, review bloods tomorrow.";
  var NOTE_MORE = [{ interim: ["Mobilising"], final: "Mobilising with a frame, physiotherapy review today." }];
  var PRESCRIBED = [
    { medicine: "clindamycin", dose: { value: 450, unit: "mg" } },
    { medicine: "paracetamol", aliases: ["Panadol"], dose: { value: 1, unit: "g" } }
  ];
  function matchNoteCodes(text) {
    const out = [];
    const phrase = "cellulitis of left lower leg";
    const c = text.indexOf(phrase);
    if (c >= 0) {
      out.push({
        start: c,
        end: c + phrase.length,
        suggestion: {
          id: "cellulitis",
          sourceText: phrase,
          label: "Cellulitis of lower leg",
          attributes: [{ id: "left", label: "Left", friendlyName: "laterality", mandatory: true }],
          freeText: ["worse since yesterday"]
        }
      });
    }
    const f = text.indexOf("Fever");
    if (f >= 0) out.push({ start: f, end: f + 5, suggestion: { id: "fever", sourceText: "Fever", label: "Fever" } });
    return out;
  }

  // examples/mobile-voice-capture.tsx
  var meta = {
    title: "Dictation on a phone",
    description: "Observations by voice with a live transcript and read-back, a review that blocks saving until the oxygen question and an ambiguous number are answered, and a dictated note whose micrograms-for-mg dose must be resolved before signing. Dictation never saves or signs by itself.",
    kind: "mobile",
    regions: ["AU", "NZ", "GB"],
    components: [
      "DictatedObservationsCapture",
      "LiveTranscript",
      "MicButton",
      "DictationReview",
      "ObservationKeypadEntry",
      "DictatedNoteReview",
      "SuggestedMatchList",
      "ScriptedSpeechEngine",
      "MobilePatientHeader"
    ]
  };
  var NOW = EXAMPLE_NOW;
  function Screen({ children, note }) {
    const [layer, setLayer] = import_react3.default.useState(null);
    return /* @__PURE__ */ import_react3.default.createElement(import_react4.SheetContainerProvider, { container: layer }, /* @__PURE__ */ import_react3.default.createElement(
      "div",
      {
        style: {
          height: "100%",
          overflow: "auto",
          display: "grid",
          gridTemplateRows: "minmax(100%, auto)",
          gridTemplateColumns: "minmax(0, 1fr)",
          background: "var(--surface)"
        }
      },
      /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexDirection: "column", minWidth: 0 } }, note ? /* @__PURE__ */ import_react3.default.createElement(
        "p",
        {
          role: "status",
          style: {
            margin: 0,
            padding: "8px 16px",
            fontSize: 14,
            lineHeight: "20px",
            color: "var(--ink-muted)",
            background: "var(--surface-muted)"
          }
        },
        note
      ) : null, /* @__PURE__ */ import_react3.default.createElement("div", { style: { flex: "1 1 auto", display: "grid", gridTemplateColumns: "minmax(0, 1fr)" } }, children))
    ), /* @__PURE__ */ import_react3.default.createElement("div", { ref: setLayer }));
  }
  function Done({ title, lines }) {
    return /* @__PURE__ */ import_react3.default.createElement("div", { role: "status", style: { padding: 16, display: "flex", flexDirection: "column", gap: 8, alignSelf: "start" } }, /* @__PURE__ */ import_react3.default.createElement("h2", { style: { margin: 0, fontSize: 18, lineHeight: "24px", color: "var(--success)" } }, title), lines.map((l) => /* @__PURE__ */ import_react3.default.createElement("p", { key: l, style: { margin: 0, fontSize: 16, lineHeight: "22px" } }, l)));
  }
  function VoiceCapture({ region }) {
    var _a;
    const patient = mobileIdentity(MAIN_PATIENT[region], region);
    const [take, setTake] = import_react3.default.useState(0);
    const engine = import_react3.default.useMemo(() => new import_react4.ScriptedSpeechEngine(observationScript(region), { playOnStart: true }), [region, take]);
    const noteEngine = import_react3.default.useMemo(() => new import_react4.ScriptedSpeechEngine(NOTE_MORE, { delayMs: 400 }), []);
    const [heard, setHeard] = import_react3.default.useState(null);
    const [saved, setSaved] = import_react3.default.useState(null);
    const [signed, setSigned] = import_react3.default.useState(null);
    const [typeNote, setTypeNote] = import_react3.default.useState("");
    const [draftNote, setDraftNote] = import_react3.default.useState("");
    const banner = /* @__PURE__ */ import_react3.default.createElement(import_react4.MobilePatientHeader, { patient, variant: "condensed", now: NOW, showDetailsButton: false, sticky: true });
    return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(PhoneFrame, { caption: "1. Observations by voice" }, /* @__PURE__ */ import_react3.default.createElement(Screen, { note: typeNote }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.DictatedObservationsCapture,
      {
        key: take,
        engine,
        autoStart: true,
        banner,
        onHeardChange: setHeard,
        onReview: (r) => setHeard(r),
        onTypeInstead: () => setTypeNote("Type instead opens keypad entry (ObservationKeypadEntry), parameter by parameter.")
      }
    ))), /* @__PURE__ */ import_react3.default.createElement(PhoneFrame, { caption: "2. Check before saving" }, /* @__PURE__ */ import_react3.default.createElement(Screen, null, saved ? /* @__PURE__ */ import_react3.default.createElement(
      Done,
      {
        title: "Observations saved",
        lines: [
          `Score ${saved.score.total} at ${(0, import_react4.formatTime)(NOW)}.`,
          saved.changedParameterIds.length ? `Answered or edited in review: ${saved.changedParameterIds.join(", ")}.` : "All values as heard."
        ]
      }
    ) : (
      // Keyed by the transcript, so a new take starts a fresh review. Each missing, ambiguous or implausible
      // value is a question with its own buttons; the total shows "N+" until every answer is in, and Save stays
      // disabled with the reason beside it. Edit opens the keypad for that one parameter.
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.DictationReview,
        {
          key: (_a = heard == null ? void 0 : heard.transcript) != null ? _a : "empty",
          heard: heard == null ? void 0 : heard.observations,
          subject: SUBJECT[region],
          takenAt: NOW,
          now: NOW,
          banner,
          onSpeakAgain: () => {
            setHeard(null);
            setTake((t) => t + 1);
          },
          onSave: setSaved
        }
      )
    ))), /* @__PURE__ */ import_react3.default.createElement(PhoneFrame, { caption: "3. Dictated note" }, /* @__PURE__ */ import_react3.default.createElement(Screen, { note: draftNote }, signed ? /* @__PURE__ */ import_react3.default.createElement(
      Done,
      {
        title: "Note signed",
        lines: [
          `Signed at ${(0, import_react4.formatTime)(NOW)}.`,
          `Confirmed codes: ${signed.codes.filter((c) => c.confirmed).map((c) => c.label).join(", ") || "none"}.`,
          `Dose choices: ${signed.doseDecisions.map((d) => `${d.medicine} ${d.decision === "prescribed" ? d.prescribed : `"${d.heard}" kept as heard`}`).join(", ") || "none"}.`
        ]
      }
    ) : (
      // The dose check compares each dose heard for a prescribed medicine: a unit or ten-fold mismatch needs
      // "Use 450 mg" or "Keep as heard". Codes are suggestions until ticked (B2.6). Abbreviations are checked
      // against the region's list. Save draft is always allowed; Sign only when nothing blocks.
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.DictatedNoteReview,
        {
          defaultText: NOTE_TEXT,
          heading: "Ward round note",
          draftAt: NOW,
          banner,
          matchCodes: matchNoteCodes,
          prescribed: PRESCRIBED,
          engine: noteEngine,
          onSaveDraft: (r) => setDraftNote(`Draft saved at ${(0, import_react4.formatTime)(NOW)} with ${r.blockers.length} check(s) still open.`),
          onSign: setSigned
        }
      )
    ))));
  }
  function Example() {
    return /* @__PURE__ */ import_react3.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react3.default.createElement(VoiceCapture, { region }));
  }

  // examples/.entry-mobile-voice-capture.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react5.default.createElement(Example));
})();
