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

  // examples/.entry-desktop-prescribing.tsx
  var import_react5 = __toESM(require_react());

  // examples/desktop-prescribing.tsx
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

  // examples/data/desktop-patient-record.ts
  function at(dayOffset, hour, minute = 0) {
    return new Date(EXAMPLE_NOW.getFullYear(), EXAMPLE_NOW.getMonth(), EXAMPLE_NOW.getDate() + dayOffset, hour, minute);
  }
  var CURRENT_USER = {
    GB: "Dr R Okafor (FY2)",
    AU: "Dr L Nguyen (RMO)",
    NZ: "Dr H Te Huia (RMO)"
  };
  function bannerProps(region) {
    var _a;
    const p = MAIN_PATIENT[region];
    const identifiers = p.identifiers.map((i) => ({
      type: i.type,
      value: i.value,
      irn: i.irn,
      // Cast data holds "2028-03"; the banner expects the card's "MM/YYYY".
      medicareValidTo: i.validTo ? `${i.validTo.slice(5, 7)}/${i.validTo.slice(0, 4)}` : void 0,
      ihiNumberStatus: i.type === "ihi" ? "Active" : void 0,
      ihiRecordStatus: i.type === "ihi" ? "Verified" : void 0
    }));
    const gender = region === "GB" ? p.gender : p.gender === "Female" ? "F" : "M";
    const allergies = p.allergies === "none-known" ? { status: "none-known", recordedBy: "Dr L Nguyen", recordedAt: at(-1, 21, 40) } : {
      status: "known",
      items: p.allergies.map((a) => ({ name: a.substance[0].toUpperCase() + a.substance.slice(1), lastUpdated: a.recorded, reaction: a.reaction.toLowerCase() })),
      recordedBy: p.allergies[0].by,
      recordedAt: p.allergies[0].recorded
    };
    return {
      name: { familyName: p.familyName, givenName: p.givenName, title: p.title },
      preferredName: (_a = p.preferredName) != null ? _a : null,
      dateOfBirth: p.dateOfBirth,
      gender,
      nhsNumber: region === "GB" ? p.identifiers[0].value : void 0,
      identifiers: region === "GB" ? void 0 : identifiers,
      address: { type: "Usual address", ...p.address },
      contacts: region === "GB" ? { home: p.phone } : { mobile: p.phone },
      allergies,
      now: EXAMPLE_NOW
    };
  }
  var MEDICATIONS = {
    GB: [
      {
        id: "coamox",
        status: "Started",
        statusSupplement: "Not Verified",
        startDate: at(-1, 22),
        hasAlert: true,
        alertLabel: "High Priority alert: penicillin allergy",
        line: { genericName: "co-amoxiclav", form: "tablet", dose: { value: 625, unit: "mg" }, route: "oral", frequency: "three times a day", indication: "community-acquired pneumonia" }
      },
      {
        id: "clari",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        hasAlert: true,
        alertLabel: "Priority alert: interaction with atorvastatin",
        line: { genericName: "clarithromycin", form: "tablet", dose: { value: 500, unit: "mg" }, route: "oral", frequency: "twice a day", courseDuration: "for 5 days" }
      },
      {
        id: "para",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 20),
        line: { genericName: "paracetamol", form: "tablet", dose: { value: 1, unit: "g" }, route: "oral", frequency: "every 4 to 6 hours as required", qualifiers: ["maximum 4 doses in 24 hours"], indication: "for pain or fever" }
      },
      {
        id: "enox",
        status: "Not Started",
        statusSupplement: "Verified",
        startDate: at(0, 18),
        line: { genericName: "enoxaparin", dose: { value: 40, unit: "mg" }, route: "subcutaneous", frequency: "once a day", qualifiers: ["at 18:00"] }
      },
      {
        id: "amlo",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        line: { genericName: "amlodipine", form: "tablet", dose: { value: 5, unit: "mg" }, route: "oral", frequency: "once a day" }
      },
      {
        id: "ator",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        line: { genericName: "atorvastatin", form: "tablet", dose: { value: 20, unit: "mg" }, route: "oral", frequency: "once a day", qualifiers: ["at night"] }
      },
      {
        id: "rami",
        status: "Suspended",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        suspendedOn: at(0, 9),
        line: { genericName: "ramipril", form: "capsule", dose: { value: 5, unit: "mg" }, route: "oral", frequency: "once a day" }
      },
      {
        id: "doxy",
        status: "Completed",
        startDate: at(-6, 9),
        endDate: at(-1, 9),
        line: { genericName: "doxycycline", form: "capsule", dose: { value: 100, unit: "mg" }, route: "oral", frequency: "once a day", courseDuration: "for 5 days" }
      }
    ],
    AU: [
      {
        id: "ceft",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 21),
        line: { genericName: "ceftriaxone", strength: "1 g", form: "injection", route: "intravenous", dose: { value: 1, unit: "g" }, frequency: "once a day", indication: "community-acquired pneumonia" }
      },
      {
        id: "clari",
        status: "Started",
        statusSupplement: "Not Verified",
        startDate: at(-1, 21),
        hasAlert: true,
        alertLabel: "High Priority alert: interaction with simvastatin",
        line: { genericName: "clarithromycin", strength: "500 mg", form: "tablet", route: "oral", dose: { value: 500, unit: "mg" }, frequency: "twice a day", courseDuration: "for 5 days" }
      },
      {
        id: "simva",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 21),
        hasAlert: true,
        alertLabel: "High Priority alert: interaction with clarithromycin",
        line: { genericName: "simvastatin", strength: "40 mg", form: "tablet", route: "oral", dose: { value: 40, unit: "mg" }, frequency: "once a day", qualifiers: ["at night"] }
      },
      {
        id: "para",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 20),
        line: { genericName: "paracetamol", strength: "500 mg", form: "tablet", route: "oral", dose: { value: 1, unit: "g" }, frequency: "every 4 to 6 hours when required", qualifiers: ["maximum 4 g in 24 hours"], indication: "pain or fever" }
      },
      {
        id: "enox",
        status: "Not Started",
        statusSupplement: "Verified",
        startDate: at(0, 18),
        hasAlert: true,
        alertLabel: "Priority alert: dose in renal impairment",
        line: { genericName: "enoxaparin", strength: "40 mg/0.4 mL", form: "injection", route: "subcutaneous", dose: { value: 40, unit: "mg" }, frequency: "once a day", qualifiers: ["at 18:00"] }
      },
      {
        id: "amlo",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 21),
        line: { genericName: "amlodipine", strength: "5 mg", form: "tablet", route: "oral", dose: { value: 5, unit: "mg" }, frequency: "once a day" }
      },
      {
        id: "rami",
        status: "Suspended",
        statusSupplement: "Verified",
        startDate: at(-1, 21),
        suspendedOn: at(0, 9),
        line: { genericName: "ramipril", strength: "5 mg", form: "capsule", route: "oral", dose: { value: 5, unit: "mg" }, frequency: "once a day" }
      },
      {
        id: "doxy",
        status: "Completed",
        startDate: at(-6, 9),
        endDate: at(-1, 9),
        line: { genericName: "doxycycline", strength: "100 mg", form: "tablet", route: "oral", dose: { value: 100, unit: "mg" }, frequency: "once a day", courseDuration: "for 5 days" }
      }
    ],
    NZ: [
      {
        id: "amox",
        status: "Started",
        statusSupplement: "Not Verified",
        startDate: at(-1, 22),
        hasAlert: true,
        alertLabel: "High Priority alert: penicillin allergy",
        line: { genericName: "amoxicillin", form: "capsule", dose: { value: 1, unit: "g" }, route: "oral", frequency: "three times a day", indication: "community-acquired pneumonia" }
      },
      {
        id: "clari",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        hasAlert: true,
        alertLabel: "Priority alert: interaction with atorvastatin",
        line: { genericName: "clarithromycin", form: "tablet", dose: { value: 500, unit: "mg" }, route: "oral", frequency: "twice a day", courseDuration: "for 5 days" }
      },
      {
        id: "para",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 20),
        line: { genericName: "paracetamol", form: "tablet", dose: { value: 1, unit: "g" }, route: "oral", frequency: "every 4 to 6 hours when required", qualifiers: ["maximum 4 g in 24 hours"], indication: "for pain or fever" }
      },
      {
        id: "meto",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        line: { genericName: "metoclopramide", form: "tablet", dose: { value: 10, unit: "mg" }, route: "oral", frequency: "three times a day when required", indication: "for nausea" }
      },
      {
        id: "enox",
        status: "Not Started",
        statusSupplement: "Verified",
        startDate: at(0, 18),
        line: { genericName: "enoxaparin", dose: { value: 40, unit: "mg" }, route: "subcutaneous", frequency: "once a day", qualifiers: ["at 18:00"] }
      },
      {
        id: "amlo",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        line: { genericName: "amlodipine", form: "tablet", dose: { value: 5, unit: "mg" }, route: "oral", frequency: "once a day" }
      },
      {
        id: "ator",
        status: "Started",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        line: { genericName: "atorvastatin", form: "tablet", dose: { value: 20, unit: "mg" }, route: "oral", frequency: "once a day", qualifiers: ["at night"] }
      },
      {
        id: "cila",
        status: "Suspended",
        statusSupplement: "Verified",
        startDate: at(-1, 22),
        suspendedOn: at(0, 9),
        line: { genericName: "cilazapril", form: "tablet", dose: { value: 2.5, unit: "mg" }, route: "oral", frequency: "once a day" }
      },
      {
        id: "doxy",
        status: "Completed",
        startDate: at(-6, 9),
        endDate: at(-1, 9),
        line: { genericName: "doxycycline", form: "tablet", dose: { value: 100, unit: "mg" }, route: "oral", frequency: "once a day", courseDuration: "for 5 days" }
      }
    ]
  };
  var ADR_STATUS = {
    GB: null,
    AU: { status: "noKnown", recordedAt: at(-1, 21, 40), recordedBy: "Dr L Nguyen", source: "Patient testimony" },
    NZ: null
  };
  var OBS_ROWS = [
    { t: at(-1, 18), rr: 18, spo2: 96, hr: 92, sbp: 128, dbp: 78, temp: "37.8", loc: "A" },
    { t: at(-1, 22), rr: 20, spo2: 95, hr: 98, sbp: 122, dbp: 74, temp: "38.4", loc: "A" },
    { t: at(0, 2), rr: 22, spo2: 94, hr: 108, sbp: 112, dbp: 68, temp: "38.9", loc: "A" },
    { t: at(0, 6), rr: 24, spo2: 93, hr: 116, sbp: 104, dbp: 62, temp: "39.3", loc: "A" },
    { t: at(0, 10), rr: 22, spo2: 94, hr: 108, sbp: 106, dbp: 64, temp: "38.7", loc: "A" },
    { t: at(0, 13, 50), rr: 22, spo2: 95, hr: 104, sbp: 108, dbp: 66, temp: "38.3", loc: "A" }
  ];
  var SERIES = {
    temperature: {
      id: "temperature",
      label: "Temperature",
      unit: "\xB0C",
      unitDefinition: "degrees Celsius",
      roundTo: 1,
      points: OBS_ROWS.map((r) => ({ time: r.t, value: Number(r.temp), display: r.temp, source: "machine" }))
    },
    heartRate: {
      id: "heartRate",
      label: "Pulse rate",
      unit: "beats/min",
      unitDefinition: "beats per minute",
      points: OBS_ROWS.map((r) => ({ time: r.t, value: r.hr, source: "machine" }))
    },
    respiratoryRate: {
      id: "respiratoryRate",
      label: "Respiratory rate",
      unit: "breaths/min",
      unitDefinition: "breaths per minute",
      points: OBS_ROWS.map((r) => ({ time: r.t, value: r.rr, source: "manual" }))
    },
    oxygenSaturation: {
      id: "oxygenSaturation",
      label: "Oxygen saturation",
      unit: "%",
      unitDefinition: "per cent",
      points: OBS_ROWS.map((r) => ({ time: r.t, value: r.spo2, source: "machine", context: "Room air" }))
    }
  };
  var BLOOD_PRESSURE = {
    points: OBS_ROWS.map((r) => ({ time: r.t, systolic: r.sbp, diastolic: r.dbp, source: "machine", context: "Left arm, lying" }))
  };
  var OBS_WINDOW = { start: at(-1, 14, 5), end: EXAMPLE_NOW };

  // examples/data/desktop-prescribing.ts
  var QDS = [{ value: "four times a day" }];
  var QDS_TIMES = [{ value: "06:00; 12:00; 18:00; 22:00", supplementary: "Standard times" }];
  var BD = [{ value: "twice a day" }];
  var BD_TIMES = [{ value: "08:00; 20:00", supplementary: "Standard times" }];
  var FIRST = [{ value: "Today 18:00", supplementary: "Next standard time" }, { value: "Now (once only first dose)" }, { value: "Tomorrow 06:00" }];
  var COURSE = [{ value: "5 days" }, { value: "7 days" }, { value: "10 days" }];
  var FORMULARY = [
    {
      entry: { id: "fluclox", genericName: "flucloxacillin", prioritised: true },
      drugClass: "penicillin",
      form: "capsule",
      options: { route: [{ value: "oral" }, { value: "intravenous" }], dose: [{ value: "500 mg" }, { value: "1 g" }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "amox", genericName: "amoxicillin", prioritised: true },
      drugClass: "penicillin",
      form: "capsule",
      options: { route: [{ value: "oral" }], dose: [{ value: "500 mg" }, { value: "1 g" }], frequency: [{ value: "three times a day" }], administrationTimes: [{ value: "08:00; 14:00; 22:00", supplementary: "Standard times" }], firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "cefalex", genericName: "cefalexin", synonyms: ["cephalexin"] },
      drugClass: "cephalosporin",
      form: "capsule",
      options: { route: [{ value: "oral" }], dose: [{ value: "500 mg" }, { value: "1 g" }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "cefalex-b", genericName: "cefalexin", brandName: "Keflex" },
      drugClass: "cephalosporin",
      form: "capsule",
      options: { route: [{ value: "oral" }], dose: [{ value: "500 mg" }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "clinda", genericName: "clindamycin", prioritised: true },
      drugClass: "other",
      form: "capsule",
      options: { route: [{ value: "oral" }, { value: "intravenous" }], dose: [{ value: "300 mg" }, { value: "450 mg" }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "doxy", genericName: "doxycycline" },
      drugClass: "other",
      form: "tablet",
      options: { route: [{ value: "oral" }], dose: [{ value: "100 mg" }, { value: "200 mg" }], frequency: [{ value: "once a day" }, { value: "twice a day" }], administrationTimes: BD_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "erythro", genericName: "erythromycin" },
      drugClass: "macrolide",
      form: "tablet",
      options: { route: [{ value: "oral" }], dose: [{ value: "250 mg" }, { value: "500 mg" }], frequency: QDS, administrationTimes: QDS_TIMES, firstDose: FIRST, duration: COURSE }
    },
    {
      entry: { id: "hydral", genericName: "hydralazine", misSelectionRisk: true },
      drugClass: "other",
      form: "tablet",
      options: { route: [{ value: "oral" }], dose: [{ value: "25 mg" }], frequency: BD, administrationTimes: BD_TIMES, firstDose: FIRST, duration: [{ value: "ongoing" }] }
    },
    {
      entry: { id: "hydroxyz", genericName: "hydroxyzine", misSelectionRisk: true },
      drugClass: "other",
      form: "tablet",
      options: { route: [{ value: "oral" }], dose: [{ value: "25 mg" }], frequency: [{ value: "at night when required" }], administrationTimes: [{ value: "22:00" }], firstDose: FIRST, duration: [{ value: "7 days" }] }
    },
    {
      entry: { id: "furo", genericName: "furosemide", synonyms: ["frusemide"] },
      drugClass: "other",
      form: "tablet",
      options: { route: [{ value: "oral" }], dose: [{ value: "40 mg" }], frequency: [{ value: "once a day" }], administrationTimes: [{ value: "08:00" }], firstDose: FIRST, duration: [{ value: "ongoing" }] }
    }
  ];
  var CATALOGUE = FORMULARY.map((f) => f.entry);
  function formularyItem(id) {
    return FORMULARY.find((f) => f.entry.id === id);
  }
  var QUICK_LISTS = [
    { id: "abx", name: "Antimicrobials (ward)", description: "5 commonly prescribed antimicrobials", items: ["fluclox", "amox", "clinda", "doxy", "cefalex"].map((id) => formularyItem(id).entry) }
  ];
  function checkPrescription(item, region) {
    var _a;
    const allergies = MAIN_PATIENT[region].allergies;
    const penicillinAllergy = allergies !== "none-known" && allergies.some((a) => a.substance === "penicillin");
    const name = (_a = item.entry.genericName) != null ? _a : "";
    const Name = name[0].toUpperCase() + name.slice(1);
    if (penicillinAllergy && item.drugClass === "penicillin") {
      return {
        id: `allergy-${item.entry.id}`,
        status: "High Priority",
        occurredAt: at(0, 14, 5),
        source: "Allergy Checking",
        summary: `${Name} is a penicillin. Recorded allergy: penicillin (anaphylaxis).`,
        details: {
          patientSpecific: "Penicillin anaphylaxis recorded 02-Feb-2024.",
          rationale: "All penicillins share the beta-lactam ring; cross-reactivity within the class is expected."
        },
        actions: [
          { id: "clinda", label: "Choose clindamycin instead", preference: 5, reasons: ["Not a beta-lactam", "Covers skin infection"] },
          { id: "doxy", label: "Choose doxycycline instead", preference: 4, reasons: ["Not a beta-lactam"] }
        ]
      };
    }
    if (penicillinAllergy && item.drugClass === "cephalosporin") {
      return {
        id: `allergy-${item.entry.id}`,
        status: "Priority",
        occurredAt: at(0, 14, 5),
        source: "Allergy Checking",
        summary: `${Name} is a cephalosporin. Recorded allergy: penicillin (anaphylaxis). Cross-sensitivity is possible.`,
        actions: [{ id: "clinda", label: "Choose clindamycin instead", preference: 4, reasons: ["Avoids beta-lactams after anaphylaxis"] }]
      };
    }
    if (item.drugClass === "macrolide") {
      const statin = region === "AU" ? "simvastatin" : "atorvastatin";
      return {
        id: `interaction-${item.entry.id}`,
        status: region === "AU" ? "High Priority" : "Priority",
        occurredAt: at(0, 14, 5),
        source: "Drug Interaction Checking",
        summary: `${Name} with ${statin}${region === "AU" ? " is contraindicated" : ""}: increased risk of myopathy. Clarithromycin is already prescribed.`,
        actions: [{ id: "doxy", label: "Choose doxycycline instead", preference: 4, reasons: ["No statin interaction"] }]
      };
    }
    return null;
  }

  // examples/desktop-prescribing.tsx
  var meta = {
    title: "Prescribing a new medicine",
    description: "Search a formulary, prescribe in sentence layout, check against recorded allergies and current medicines (an unanswered High Priority alert holds Authorise, with the reason shown), preview and authorise. The authorised line joins the medications list, with its alert icon if one was raised.",
    kind: "desktop",
    regions: ["GB", "AU", "NZ"],
    components: ["PatientBanner", "DrugSearch", "SelectionTrail", "AlertItem", "PrescriptionForm", "PrescriptionPreview", "MedicationLine", "MedicationsList"]
  };
  var REQUIRED = ["route", "dose", "frequency", "administrationTimes", "firstDose", "duration"];
  var OPENING_DRUG = "fluclox";
  var OPENING_VALUES = {
    route: "oral",
    dose: "1 g",
    frequency: "four times a day",
    administrationTimes: "06:00; 12:00; 18:00; 22:00",
    firstDose: "Today 18:00",
    duration: "7 days",
    reason: "cellulitis at cannula site"
  };
  function searchAsync(query, signal) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => resolve((0, import_react4.searchDrugCatalogue)(query, CATALOGUE)), 350);
      signal.addEventListener("abort", () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
  }
  function toLine(item, v) {
    var _a, _b, _c, _d;
    return {
      genericName: item.entry.genericName,
      brandName: item.entry.brandName,
      form: item.form,
      dose: (_a = v.dose) != null ? _a : void 0,
      route: (_b = v.route) != null ? _b : void 0,
      frequency: (_c = v.frequency) != null ? _c : void 0,
      courseDuration: v.duration && v.duration !== "ongoing" ? `for ${v.duration}` : void 0,
      indication: (_d = v.reason) != null ? _d : void 0
    };
  }
  function Prescribing({ region }) {
    var _a, _b;
    const [drugId, setDrugId] = (0, import_react3.useState)(OPENING_DRUG);
    const [query, setQuery] = (0, import_react3.useState)("fluclox");
    const [values, setValues] = (0, import_react3.useState)(OPENING_VALUES);
    const [previewOpen, setPreviewOpen] = (0, import_react3.useState)(true);
    const [previewRequested, setPreviewRequested] = (0, import_react3.useState)(false);
    const [responses, setResponses] = (0, import_react3.useState)({});
    const [dismissed, setDismissed] = (0, import_react3.useState)([]);
    const [medications, setMedications] = (0, import_react3.useState)(() => MEDICATIONS[region]);
    const [selected, setSelected] = (0, import_react3.useState)([]);
    const [confirmation, setConfirmation] = (0, import_react3.useState)("");
    const item = drugId ? formularyItem(drugId) : void 0;
    const alert = (0, import_react3.useMemo)(() => item ? checkPrescription(item, region) : null, [item, region]);
    const alertShown = alert && !dismissed.includes(alert.id) ? alert : null;
    const alertOpen = (alert == null ? void 0 : alert.status) === "High Priority" && !responses[alert.id];
    const complete = (0, import_react4.canAuthorise)(REQUIRED, values);
    const authoriseBlockedReason = alertOpen ? "Respond to the High Priority alert before authorising: choose an alternative or override with a reason." : void 0;
    const choose = (entry) => {
      setDrugId(entry.id);
      setValues({});
      setPreviewOpen(false);
    };
    const onAlertResponse = (r) => {
      var _a2;
      if (!alert) return;
      setResponses((x) => ({ ...x, [alert.id]: r }));
      const alternative = r.actionId ? formularyItem(r.actionId) : void 0;
      if (alternative && !r.overrideReason) {
        setQuery((_a2 = alternative.entry.genericName) != null ? _a2 : "");
        choose(alternative.entry);
      }
    };
    const authorise = () => {
      var _a2;
      if (!item) return;
      const id = `new-${medications.length + 1}`;
      const record = {
        id,
        status: "Not Started",
        statusSupplement: "Not Verified",
        startDate: at(0, 18),
        line: toLine(item, values),
        // An overridden alert stays visible on the row: an icon after the drug details, named by alertLabel (MEDv-023).
        hasAlert: alert ? true : void 0,
        alertLabel: alert ? `${alert.status} alert${((_a2 = responses[alert.id]) == null ? void 0 : _a2.overrideReason) ? ", overridden" : ""}: ${alert.summary}` : void 0
      };
      setMedications((m) => [...m, record]);
      setSelected([id]);
      setConfirmation(`Authorised: ${(0, import_react4.medicationDrugName)({ genericName: item.entry.genericName, brandName: item.entry.brandName }, { region })}, by ${CURRENT_USER[region]}. The new line is selected in the medications list.`);
      setDrugId(null);
      setQuery("");
      setValues({});
      setPreviewOpen(false);
    };
    return /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientBanner, { ...bannerProps(region) }), /* @__PURE__ */ import_react3.default.createElement("div", { style: { fontSize: 14, color: "var(--ink-muted)" } }, "Prescribing as ", CURRENT_USER[region]), /* @__PURE__ */ import_react3.default.createElement("div", { role: "status", style: { fontSize: 14, color: "var(--success)", marginTop: confirmation ? 0 : -16 } }, confirmation), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)", gap: "var(--space-4)", alignItems: "start" } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 } }, /* @__PURE__ */ import_react3.default.createElement("section", { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" } }, item ? (
      // The trail replaces the search once a drug is chosen; it stays in view above the form.
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.SelectionTrail,
        {
          items: [
            { id: "drug", kind: "Drug", label: /* @__PURE__ */ import_react3.default.createElement(import_react4.MedicationLine, { genericName: item.entry.genericName, brandName: item.entry.brandName }), text: item.entry.genericName },
            ...values.route ? [{ id: "route", kind: "Route", label: values.route }] : []
          ],
          onReopen: () => {
            setDrugId(null);
            setPreviewOpen(false);
          }
        }
      )
    ) : /* @__PURE__ */ import_react3.default.createElement(
      import_react4.DrugSearch,
      {
        catalogue: CATALOGUE,
        searchAsync,
        debounceMs: 250,
        quickLists: QUICK_LISTS,
        query,
        onQueryChange: setQuery,
        onSelect: choose,
        label: "Find a medicine"
      }
    )), alertShown ? (
      // Shown between the drug and the form, where the decision is made. High Priority opens expanded.
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.AlertItem,
        {
          key: alertShown.id,
          alert: alertShown,
          headingLevel: 3,
          onRecordResponse: onAlertResponse,
          onDismiss: alertShown.status === "Priority" ? () => setDismissed((d) => [...d, alertShown.id]) : void 0
        }
      )
    ) : item ? /* @__PURE__ */ import_react3.default.createElement("p", { style: { margin: 0, fontSize: 14, color: "var(--ink-muted)" } }, "Allergy and interaction checks found no conflicts for ", (0, import_react4.medicationDrugName)({ genericName: item.entry.genericName, brandName: item.entry.brandName }, { region }), ".") : null, alert && responses[alert.id] ? /* @__PURE__ */ import_react3.default.createElement("p", { style: { margin: 0, fontSize: 14, color: "var(--ink-muted)" } }, "Alert response recorded", responses[alert.id].overrideReason ? `: override, ${responses[alert.id].overrideReason}` : ".") : null, item ? /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.PrescriptionForm,
      {
        key: item.entry.id,
        drug: { genericName: item.entry.genericName, brandName: item.entry.brandName, form: item.form },
        options: item.options,
        values,
        onChange: setValues,
        allowOther: ["dose"],
        getPrefill: (field, v) => {
          var _a2, _b2;
          if (field !== "frequency") return {};
          const times = (_b2 = (_a2 = item.options.administrationTimes) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.value;
          return times && v.frequency ? { administrationTimes: times } : {};
        },
        optionalFields: [{
          id: "reason",
          addLabel: "Add a reason for prescribing",
          inlineLabel: "for",
          label: "Reason for prescribing",
          prompt: "Select or enter a reason for prescribing",
          allowOther: true,
          options: [{ value: "cellulitis at cannula site" }, { value: "community-acquired pneumonia" }]
        }],
        builtInPreview: false,
        onPreview: () => {
          setPreviewOpen(true);
          setPreviewRequested(true);
        },
        onAuthorise: authorise,
        authoriseBlockedReason,
        onCancel: () => {
          setDrugId(null);
          setValues({});
          setPreviewOpen(false);
        }
      }
    )) : null), /* @__PURE__ */ import_react3.default.createElement("div", { style: { minWidth: 0 } }, item && previewOpen ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.PrescriptionPreview,
      {
        medication: toLine(item, values),
        administrationTimes: (0, import_react4.parseAdministrationTimes)(values.administrationTimes),
        firstDose: (_a = values.firstDose) != null ? _a : void 0,
        duration: (_b = values.duration) != null ? _b : void 0,
        details: values.reason ? [{ label: "Reason for prescribing", value: values.reason }] : [],
        canAuthorise: complete,
        onClose: () => setPreviewOpen(false),
        onAuthorise: authorise,
        authoriseBlockedReason,
        autoFocus: previewRequested
      }
    )) : item ? /* @__PURE__ */ import_react3.default.createElement("p", { style: { margin: 0, padding: "var(--space-4)", fontSize: 14, color: "var(--ink-muted)", border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-md)" } }, "Choose Preview to check the prescription as it will appear on the chart.") : null)), /* @__PURE__ */ import_react3.default.createElement("section", { style: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }, "aria-labelledby": "rx-meds-h" }, /* @__PURE__ */ import_react3.default.createElement("h2", { id: "rx-meds-h", style: { margin: "0 0 var(--space-3)", fontSize: 18, lineHeight: "24px", fontWeight: 600 } }, "Medications"), /* @__PURE__ */ import_react3.default.createElement(import_react4.MedicationsList, { medications, now: EXAMPLE_NOW, selectedIds: selected, onSelectionChange: setSelected, maxHeight: 520 })));
  }
  function DesktopPrescribing() {
    return /* @__PURE__ */ import_react3.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react3.default.createElement(Prescribing, { region }));
  }

  // examples/.entry-desktop-prescribing.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react5.default.createElement(DesktopPrescribing));
})();
