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

  // examples/.entry-desktop-observations.tsx
  var import_react5 = __toESM(require_react());

  // examples/desktop-observations.tsx
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
  var CURRENT_NURSE = {
    GB: "Staff Nurse K Ward",
    AU: "RN M Rossi",
    NZ: "RN T Parata"
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
  function observationSets(region) {
    return OBS_ROWS.map((r) => ({
      time: r.t,
      recordedBy: CURRENT_NURSE[region],
      values: {
        respiratoryRate: r.rr,
        oxygenSaturation: r.spo2,
        ...region === "AU" ? { oxygenFlow: 0 } : { supplementalOxygen: "air" },
        heartRate: r.hr,
        systolicBloodPressure: r.sbp,
        temperature: { value: Number(r.temp), display: r.temp },
        consciousness: r.loc
      }
    }));
  }
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
  var CRITICAL_THRESHOLDS = [
    { appliesTo: "temperature", direction: "high", value: 39, setBy: "Dr R Okafor, 26-Oct-2026" },
    { appliesTo: "systolic", direction: "low", value: 90, setBy: "Dr R Okafor, 26-Oct-2026" },
    { appliesTo: "oxygenSaturation", direction: "low", value: 91, setBy: "Dr R Okafor, 26-Oct-2026" }
  ];
  var OBS_WINDOW = { start: at(-1, 14, 5), end: EXAMPLE_NOW };

  // examples/data/desktop-drug-round.ts
  function given(region, id, day, hour, extra = {}) {
    return { id, scheduledTime: at(day, hour), status: "given", administeredAt: at(day, hour, 6), recordedBy: CURRENT_NURSE[region], ...extra };
  }
  function planned(id, day, hour, extra = {}) {
    return { id, scheduledTime: at(day, hour), ...extra };
  }
  function infusion(region, prescriber) {
    const nurse = CURRENT_NURSE[region];
    return {
      id: "nacl",
      name: "sodium chloride 0.9%",
      kind: "significantDuration",
      route: "intravenous",
      prescriber,
      line: { genericName: "sodium chloride", strength: { kind: "percentage", values: [0.9] }, form: "infusion", doseEquivalent: { label: "VOLUME", quantity: { value: 1e3, unit: "mL" } }, route: "intravenous", doseDuration: "over 8 hours", rate: "125 mL per hour" },
      startDate: at(0, 10),
      startIsActual: true,
      events: [],
      verification: "verified",
      verifiedBy: region === "GB" ? "P Ahmed (Pharmacist)" : region === "AU" ? "J Walsh (Pharmacist)" : "S Lee (Pharmacist)",
      verifiedAt: at(0, 9, 30),
      infusion: {
        scheduledStart: at(0, 10),
        expectedDurationMinutes: 480,
        actualStart: at(0, 10, 5),
        log: [
          { id: "l1", kind: "start", at: at(0, 10, 5), by: nurse, rate: "125 mL/hour", pumpSetting: "VTBI 1000 mL", volume: "1000 mL bag" },
          { id: "l2", kind: "check", at: at(0, 12), by: nurse, volume: "240 mL infused", volumeApprox: true, text: "Site clean, no swelling." },
          {
            id: "l3",
            kind: "issue",
            at: at(0, 13, 40),
            by: nurse,
            category: "Cannula site",
            text: "Site slightly red, patient reports discomfort.",
            resolved: false,
            instruction: "Check the site hourly. Resite the cannula if swelling or pain increase.",
            actions: [{ id: "resite", label: "Request cannula resite" }]
          }
        ]
      }
    };
  }
  function roundMedications(region) {
    const nurse = CURRENT_NURSE[region];
    if (region === "AU") {
      const prescriber2 = "Dr L Nguyen";
      return [
        {
          id: "ceft",
          name: "ceftriaxone",
          kind: "regular",
          route: "intravenous",
          prescriber: prescriber2,
          startDate: at(-1, 21),
          startIsActual: true,
          scheduledTimes: ["21:00"],
          verification: "verified",
          verifiedBy: "J Walsh (Pharmacist)",
          verifiedAt: at(0, 9),
          line: { genericName: "ceftriaxone", strength: "1 g", form: "injection", route: "intravenous", dose: { value: 1, unit: "g" }, frequency: "once a day", instructions: "Give over 30 minutes" },
          events: [given(region, "c1", -1, 21), planned("c2", 0, 21), planned("c3", 1, 21)]
        },
        {
          id: "clari",
          name: "clarithromycin",
          kind: "regular",
          route: "oral",
          prescriber: prescriber2,
          startDate: at(-1, 21),
          startIsActual: true,
          scheduledTimes: ["08:00", "20:00"],
          verification: "awaiting",
          line: { genericName: "clarithromycin", strength: "500 mg", form: "tablet", route: "oral", dose: { value: 500, unit: "mg" }, frequency: "twice a day", courseDuration: "for 5 days" },
          events: [given(region, "k0", -1, 21, { scheduledTime: at(-1, 21) }), given(region, "k1", 0, 8), planned("k2", 0, 20), planned("k3", 1, 8), planned("k4", 1, 20)]
        },
        {
          id: "simva",
          name: "simvastatin",
          kind: "regular",
          route: "oral",
          prescriber: prescriber2,
          startDate: at(-1, 21),
          startIsActual: true,
          scheduledTimes: ["21:00"],
          line: { genericName: "simvastatin", strength: "40 mg", form: "tablet", route: "oral", dose: { value: 40, unit: "mg" }, frequency: "once a day", qualifiers: ["at night"] },
          events: [
            { id: "s1", scheduledTime: at(-1, 21), status: "withheld", reasonCode: "W", reasonText: "Interaction alert with clarithromycin; prescriber asked to review", administeredAt: at(-1, 21, 10), recordedBy: nurse },
            planned("s2", 0, 21),
            planned("s3", 1, 21)
          ]
        },
        // Oral doses at 08:00 today were given before the fast began; the 08:00 amlodipine was refused.
        {
          id: "amlo",
          name: "amlodipine",
          kind: "regular",
          route: "oral",
          prescriber: prescriber2,
          startDate: at(-1, 21),
          startIsActual: true,
          scheduledTimes: ["08:00"],
          line: { genericName: "amlodipine", strength: "5 mg", form: "tablet", route: "oral", dose: { value: 5, unit: "mg" }, frequency: "once a day" },
          events: [{ id: "a1", scheduledTime: at(0, 8), status: "patientRefused", reasonCode: "R", administeredAt: at(0, 8, 10), recordedBy: nurse, notes: "Nauseated. Prescriber informed." }, planned("a2", 1, 8)]
        },
        {
          id: "enox",
          name: "enoxaparin",
          kind: "regular",
          route: "subcutaneous",
          prescriber: prescriber2,
          startDate: at(0, 18),
          scheduledTimes: ["18:00"],
          line: { genericName: "enoxaparin", strength: "40 mg/0.4 mL", form: "injection", route: "subcutaneous", dose: { value: 40, unit: "mg" }, frequency: "once a day" },
          events: [planned("e1", 0, 18, { intendedDose: "40 mg" }), planned("e2", 1, 18, { intendedDose: "40 mg" })]
        },
        {
          id: "para",
          name: "paracetamol",
          kind: "asRequiredUnscheduled",
          route: "oral",
          prescriber: prescriber2,
          startDate: at(-1, 20),
          asRequired: { criteria: "Pain or fever", minIntervalMinutes: 240, maxPerDay: 4 },
          line: { genericName: "paracetamol", strength: "500 mg", form: "tablet", route: "oral", dose: { value: 1, unit: "g" }, frequency: "every 4 to 6 hours when required", qualifiers: ["maximum 4 g in 24 hours"], indication: "pain or fever" },
          events: [{ id: "p1", status: "given", administeredAt: at(0, 6, 20), timePrecision: "exact", dose: "1 g", recordedBy: nurse }]
        },
        infusion(region, prescriber2)
      ];
    }
    const prescriber = region === "GB" ? "Dr R Okafor" : "Dr H Te Huia";
    const isGB = region === "GB";
    const heldAbx = isGB ? { id: "x1", scheduledTime: at(0, 8), status: "otherClinicalReason", administeredAt: at(0, 8, 10), recordedBy: nurse, notes: "Held: allergy alert (penicillin). Prescriber asked to review." } : { id: "x1", scheduledTime: at(0, 8), status: "withheld", reasonCode: "W", reasonText: "Allergy alert (penicillin). Prescriber asked to review.", administeredAt: at(0, 8, 10), recordedBy: nurse };
    return [
      {
        id: "abx",
        name: isGB ? "co-amoxiclav" : "amoxicillin",
        kind: "regular",
        route: "oral",
        prescriber,
        startDate: at(-1, 22),
        startIsActual: true,
        scheduledTimes: ["08:00", "14:00", "22:00"],
        verification: "awaiting",
        line: isGB ? { genericName: "co-amoxiclav", form: "tablet", dose: { value: 625, unit: "mg" }, route: "oral", frequency: "three times a day" } : { genericName: "amoxicillin", form: "capsule", dose: { value: 1, unit: "g" }, route: "oral", frequency: "three times a day" },
        events: [given(region, "x0", -1, 22, { administeredAt: at(-1, 22, 15) }), heldAbx, planned("x2", 0, 14), planned("x3", 0, 22), planned("x4", 1, 8), planned("x5", 1, 14)]
      },
      {
        id: "clari",
        name: "clarithromycin",
        kind: "regular",
        route: "oral",
        prescriber,
        startDate: at(-1, 22),
        startIsActual: true,
        scheduledTimes: ["08:00", "20:00"],
        verification: "verified",
        verifiedBy: isGB ? "P Ahmed (Pharmacist)" : "S Lee (Pharmacist)",
        verifiedAt: at(0, 9),
        line: { genericName: "clarithromycin", form: "tablet", dose: { value: 500, unit: "mg" }, route: "oral", frequency: "twice a day" },
        events: [given(region, "k0", -1, 22, { scheduledTime: at(-1, 22) }), given(region, "k1", 0, 8), planned("k2", 0, 20), planned("k3", 1, 8)]
      },
      {
        id: "amlo",
        name: "amlodipine",
        kind: "regular",
        route: "oral",
        prescriber,
        startDate: at(-1, 22),
        startIsActual: true,
        scheduledTimes: ["08:00"],
        line: { genericName: "amlodipine", form: "tablet", dose: { value: 5, unit: "mg" }, route: "oral", frequency: "once a day" },
        events: [given(region, "a1", 0, 8), planned("a2", 1, 8)]
      },
      {
        id: "ator",
        name: "atorvastatin",
        kind: "regular",
        route: "oral",
        prescriber,
        startDate: at(-1, 22),
        startIsActual: true,
        scheduledTimes: ["22:00"],
        line: { genericName: "atorvastatin", form: "tablet", dose: { value: 20, unit: "mg" }, route: "oral", frequency: "once a day", qualifiers: ["at night"] },
        events: [
          isGB ? { id: "t1", scheduledTime: at(-1, 22), status: "deferred", administeredAt: at(-1, 22, 15), recordedBy: nurse, notes: "Interaction alert with clarithromycin; awaiting review." } : { id: "t1", scheduledTime: at(-1, 22), status: "withheld", reasonCode: "D", reasonText: "Prescriber: withhold during clarithromycin course", administeredAt: at(-1, 22, 15), recordedBy: nurse },
          planned("t2", 0, 22),
          planned("t3", 1, 22)
        ]
      },
      {
        id: "enox",
        name: "enoxaparin",
        kind: "regular",
        route: "subcutaneous",
        prescriber,
        startDate: at(0, 18),
        scheduledTimes: ["18:00"],
        line: { genericName: "enoxaparin", dose: { value: 40, unit: "mg" }, route: "subcutaneous", frequency: "once a day" },
        events: [planned("e1", 0, 18, { intendedDose: "40 mg" }), planned("e2", 1, 18, { intendedDose: "40 mg" })]
      },
      {
        id: "para",
        name: "paracetamol",
        kind: "asRequiredUnscheduled",
        route: "oral",
        prescriber,
        startDate: at(-1, 20),
        asRequired: { criteria: "For pain or fever", minIntervalMinutes: 240, maxPerDay: 4 },
        line: { genericName: "paracetamol", form: "tablet", dose: { value: 1, unit: "g" }, route: "oral", frequency: isGB ? "every 4 to 6 hours as required" : "every 4 to 6 hours when required", qualifiers: [isGB ? "maximum 4 doses in 24 hours" : "maximum 4 g in 24 hours"], indication: "for pain or fever" },
        events: [{ id: "p1", status: "given", administeredAt: at(0, 6, 20), timePrecision: "exact", dose: "1 g", recordedBy: nurse }]
      },
      infusion(region, prescriber)
    ];
  }

  // examples/desktop-observations.tsx
  var meta = {
    title: "Observation review",
    description: "Vital signs over the last 24 hours on the regional early warning chart, focused graphs with thumbnails and critical limits, the readings as a table, and a timeline of the admission and medicines alongside.",
    kind: "desktop",
    regions: ["GB", "AU", "NZ"],
    components: ["PatientBanner", "VitalSignsChart", "ObservationGraph", "GraphThumbnail", "ObservationTable", "TimelineView"]
  };
  var panel = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    minWidth: 0
  };
  var h2 = { margin: "0 0 var(--space-3)", fontSize: 18, lineHeight: "24px", fontWeight: 600 };
  var CHART_THRESHOLDS = CRITICAL_THRESHOLDS.map((t) => t.appliesTo === "systolic" ? { ...t, appliesTo: "systolicBloodPressure" } : t);
  function medicationRows(region) {
    return roundMedications(region).map((m) => {
      var _a, _b;
      const l = (_a = m.line) != null ? _a : { genericName: m.name };
      const name = (0, import_react4.medicationDrugName)(l, { region });
      const dose = l.dose ? (0, import_react4.formatQuantity)(l.dose, region) : l.doseEquivalent ? (0, import_react4.formatQuantity)(l.doseEquivalent.quantity, region) : void 0;
      const fields = [name, dose, l.route, l.frequency].filter((f) => Boolean(f));
      const administrations = m.events.filter((e) => e.status || e.scheduledTime).map((e) => {
        var _a2;
        return {
          id: e.id,
          time: (_a2 = e.administeredAt) != null ? _a2 : e.scheduledTime,
          label: e.status ? `${name} ${e.status === "given" ? "given" : "not given"}${e.reasonCode ? ` (${e.reasonCode})` : ""}` : `${name} planned`,
          status: e.status,
          planned: !e.status
        };
      });
      const entry = m.infusion ? { id: `${m.id}-e`, kind: "known", start: (_b = m.infusion.actualStart) != null ? _b : m.infusion.scheduledStart, end: at(0, 18, 5), labelFields: fields } : { id: `${m.id}-e`, kind: "open", start: m.startDate, labelFields: fields, events: { administrations } };
      return { id: m.id, label: name, entries: [entry] };
    });
  }
  function Observations({ region }) {
    const styles = import_react3.default.useMemo(() => new import_react4.SeriesStyleAllocator(), []);
    const chart = import_react4.EWS_DEFAULT_CHARTS[region];
    const p = MAIN_PATIENT[region];
    const sections = [
      {
        id: "events",
        title: "Admission",
        defaultLevelOfDetail: "full",
        height: 120,
        rows: [
          { id: "adm", label: "Inpatient stay", entries: [{ id: "adm-e", kind: "open", start: at(-1, 17, 30), labelFields: [`Admitted, ${p.location}`, "community-acquired pneumonia"] }] },
          { id: "tests", label: "Investigations", entries: [
            { id: "cxr", kind: "point", start: at(-1, 18, 40), labelFields: ["Chest X-ray", "right lower lobe consolidation"] },
            { id: "bloods", kind: "point", start: at(0, 9), labelFields: ["Blood tests", "CRP 186 mg/L"] },
            { id: "bronch", kind: "point", start: at(0, 16), labelFields: ["Bronchoscopy", "planned"] }
          ] }
        ]
      },
      {
        id: "meds",
        title: "Medications",
        defaultLevelOfDetail: "full",
        height: 480,
        eventSets: [{ id: "administrations", label: "Administrations", kind: "administrations", levels: ["full"], defaultShown: true }],
        rows: medicationRows(region)
      },
      {
        id: "obs",
        title: "Observations",
        height: 140,
        graphs: [{ id: "temp", label: "Temperature (\xB0C)", graph: { series: [SERIES.temperature], yRange: { min: 35, max: 41 }, criticalThresholds: CRITICAL_THRESHOLDS, styleAllocator: styles, height: 100 } }]
      }
    ];
    return /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientBanner, { ...bannerProps(region) }), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--space-2) var(--space-6)", fontSize: 14, color: "var(--ink-muted)" } }, /* @__PURE__ */ import_react3.default.createElement("h2", { style: { ...h2, margin: 0, color: "var(--ink)" } }, "Observations"), /* @__PURE__ */ import_react3.default.createElement("span", null, p.location), /* @__PURE__ */ import_react3.default.createElement("span", null, "Last 24 hours, 6 sets"), /* @__PURE__ */ import_react3.default.createElement("span", null, "Monitoring: every hour")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 870px) minmax(0, 1fr)", gap: "var(--space-4)", alignItems: "start" } }, /* @__PURE__ */ import_react3.default.createElement("section", { style: panel }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.VitalSignsChart,
      {
        observations: observationSets(region),
        criticalThresholds: CHART_THRESHOLDS,
        caption: "Vital signs, last 24 hours"
      }
    )), /* @__PURE__ */ import_react3.default.createElement("section", { style: panel, "aria-labelledby": "graphs-h" }, /* @__PURE__ */ import_react3.default.createElement("h2", { id: "graphs-h", style: h2 }, "Trends"), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.ObservationGraph,
      {
        series: [SERIES.temperature],
        start: OBS_WINDOW.start,
        end: OBS_WINDOW.end,
        rangeLabel: "Last 24 hours",
        now: EXAMPLE_NOW,
        yRange: { min: 35, max: 39 },
        criticalThresholds: CRITICAL_THRESHOLDS,
        thumbnail: "auto",
        styleAllocator: styles,
        height: 180
      }
    ), /* @__PURE__ */ import_react3.default.createElement(
      import_react4.ObservationGraph,
      {
        series: [SERIES.heartRate],
        start: OBS_WINDOW.start,
        end: OBS_WINDOW.end,
        rangeLabel: "Last 24 hours",
        now: EXAMPLE_NOW,
        yRange: { min: 40, max: 160 },
        zones: (0, import_react4.ewsGraphZones)(chart, "heartRate"),
        thumbnail: "always",
        styleAllocator: styles,
        height: 180
      }
    ), /* @__PURE__ */ import_react3.default.createElement(
      import_react4.ObservationGraph,
      {
        bloodPressure: { ...BLOOD_PRESSURE, systolicRange: { low: 100, high: 140, population: "adult" } },
        start: OBS_WINDOW.start,
        end: OBS_WINDOW.end,
        rangeLabel: "Last 24 hours",
        now: EXAMPLE_NOW,
        yRange: { min: 40, max: 180 },
        criticalThresholds: CRITICAL_THRESHOLDS,
        thumbnail: "never",
        styleAllocator: styles,
        height: 180
      }
    )))), /* @__PURE__ */ import_react3.default.createElement("section", { style: panel }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.ObservationTable,
      {
        caption: "Readings, newest first",
        series: [SERIES.temperature, SERIES.heartRate, SERIES.respiratoryRate, SERIES.oxygenSaturation],
        bloodPressure: BLOOD_PRESSURE,
        annotate: (0, import_react4.ewsObservationAnnotator)(chart),
        criticalThresholds: CRITICAL_THRESHOLDS,
        maxHeight: 400
      }
    )), /* @__PURE__ */ import_react3.default.createElement("section", { style: panel, "aria-labelledby": "timeline-h" }, /* @__PURE__ */ import_react3.default.createElement("h2", { id: "timeline-h", style: h2 }, "Timeline"), /* @__PURE__ */ import_react3.default.createElement(
      import_react4.TimelineView,
      {
        sections,
        now: EXAMPLE_NOW,
        defaultPeriod: "24h",
        dataExtent: { start: at(-1, 17), end: at(1, 0) }
      }
    )));
  }
  function DesktopObservations() {
    return /* @__PURE__ */ import_react3.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react3.default.createElement(Observations, { region }));
  }

  // examples/.entry-desktop-observations.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react5.default.createElement(DesktopObservations));
})();
