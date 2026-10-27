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

  // examples/.entry-desktop-ward-list.tsx
  var import_react5 = __toESM(require_react());

  // examples/desktop-ward-list.tsx
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
  var WARD = {
    GB: [
      { id: "gb-2", familyName: "Jones", givenName: "Sarah", dateOfBirth: "1971-08-09", gender: "Female", location: "bed 1", identifier: "9990000026" },
      { id: "gb-3", familyName: "Brown", givenName: "Peter", dateOfBirth: "1940-02-17", gender: "Male", location: "bed 2", identifier: "9990000034" },
      { id: "gb-4", familyName: "Smith", givenName: "John", dateOfBirth: "1962-06-11", gender: "Male", location: "bed 3", identifier: "9990000042" },
      { id: "gb-5", familyName: "Smith", givenName: "Jon", dateOfBirth: "1985-01-30", gender: "Male", location: "bed 9", identifier: "9990000050" }
    ],
    AU: [
      { id: "au-2", familyName: "O'Brien", givenName: "Siobhan", dateOfBirth: "1990-05-21", gender: "Female", location: "bed 2", identifier: "0412366" },
      { id: "au-3", familyName: "Nguyen", givenName: "Mia", dateOfBirth: "1988-03-02", gender: "Female", location: "bed 5", identifier: "0412377" },
      { id: "au-4", familyName: "Smith", givenName: "John", dateOfBirth: "1962-06-11", gender: "Male", location: "bed 3", identifier: "0398812" },
      { id: "au-5", familyName: "Smith", givenName: "Jon", dateOfBirth: "1985-01-30", gender: "Male", location: "bed 9", identifier: "0420017" }
    ],
    NZ: [
      { id: "nz-2", familyName: "T\u016Bhoe", givenName: "Kahu", dateOfBirth: "1979-11-03", gender: "Male", location: "bed 2", identifier: "ZZZ0024" },
      { id: "nz-3", familyName: "T\u016Bhoe", givenName: "K\u0101hu", dateOfBirth: "2001-04-19", gender: "Male", location: "bed 6", identifier: "ZZZ0032" },
      { id: "nz-4", familyName: "Fa'atau", givenName: "Lesieli", dateOfBirth: "1966-07-28", gender: "Female", location: "bed 3", identifier: "ZZZ0008" },
      { id: "nz-5", familyName: "Wilson", givenName: "Grace", dateOfBirth: "1945-12-01", gender: "Female", location: "bed 9", identifier: "ZZZ0059" }
    ]
  };
  var EXAMPLE_NOW = new Date(2026, 9, 27, 14, 5);

  // examples/data/desktop-ward-list.ts
  function fromWard(p, region, title) {
    const base = { familyName: p.familyName, givenName: p.givenName, dateOfBirth: p.dateOfBirth, gender: p.gender, title };
    if (region === "GB") return { ...base, nhsNumber: p.identifier };
    if (region === "AU") return { ...base, title: void 0, mrn: p.identifier };
    return { ...base, nhi: p.identifier };
  }
  function fromMain(region) {
    const m = MAIN_PATIENT[region];
    const id = (t) => {
      var _a, _b;
      return (_b = (_a = m.identifiers.find((i) => i.type === t)) == null ? void 0 : _a.value) != null ? _b : null;
    };
    return {
      familyName: m.familyName,
      givenName: m.givenName,
      title: region === "AU" ? void 0 : m.title,
      preferredName: m.preferredName,
      dateOfBirth: m.dateOfBirth,
      gender: m.gender,
      nhsNumber: id("nhs"),
      ihi: id("ihi"),
      mrn: id("mrn"),
      nhi: id("nhi")
    };
  }
  var w = (region, i) => WARD[region][i];
  var WARD_SETUP = {
    GB: {
      ward: "Ward 7, Orwell Wing",
      listFor: "Ward 7 nursing team",
      ewsTitle: "NEWS2",
      consultants: ["Dr Okafor", "Dr Hale"],
      giver: "Staff Nurse K Adeyemi",
      receiver: "Staff Nurse T Morgan",
      handoverPlace: "Ward 7 office",
      resusText: "Resuscitation status: DNACPR in place",
      mainReadBack: "Allergy: penicillin (anaphylaxis)",
      rows: [
        { bed: 1, patient: fromWard(w("GB", 0), "GB", "Mrs"), ews: 0, consultant: "Dr Okafor", admitted: "2026-10-25", diagnosis: "Cellulitis, left leg", tasks: ["Review IV antibiotics (48 hours)"] },
        { bed: 2, patient: fromWard(w("GB", 1), "GB", "Mr"), ews: 5, consultant: "Dr Hale", admitted: "2026-10-24", diagnosis: "Community-acquired pneumonia", tasks: ["Repeat lactate", "Review chest X-ray", "Fluid balance chart"] },
        { bed: 3, patient: fromWard(w("GB", 2), "GB", "Mr"), ews: 3, consultant: "Dr Okafor", admitted: "2026-10-26", diagnosis: "Atrial fibrillation with fast ventricular rate", tasks: ["Repeat ECG", "Check potassium"] },
        { bed: 4, patient: fromMain("GB"), ews: 2, consultant: "Dr Okafor", admitted: "2026-10-23", diagnosis: "Fall at home, fractured left wrist", tasks: ["Physiotherapy assessment", "Occupational therapy home visit"] },
        { bed: 5, patient: null, ews: null, consultant: "", admitted: "", diagnosis: "", tasks: [] },
        { bed: 6, patient: { familyName: "Patel", givenName: "Anita", title: "Ms", dateOfBirth: "1977-03-12", gender: "Female", nhsNumber: "9990000069" }, ews: 1, consultant: "Dr Hale", admitted: "2026-10-26", diagnosis: "Asthma exacerbation", tasks: ["Peak flow before and after nebuliser"] },
        { bed: 8, patient: { familyName: "Walker", givenName: "David", title: "Mr", dateOfBirth: "1958-10-02", gender: "Male", nhsNumber: "9990000077" }, ews: 0, consultant: "Dr Hale", admitted: "2026-10-26", diagnosis: "Laparoscopic cholecystectomy, day 1", tasks: [] },
        { bed: 9, patient: fromWard(w("GB", 3), "GB", "Mr"), ews: 4, consultant: "Dr Hale", admitted: "2026-10-27", diagnosis: "Diabetic ketoacidosis", tasks: ["Hourly capillary glucose", "Review insulin infusion rate"] },
        { bed: 10, patient: { familyName: "Hughes", givenName: "Margaret", title: "Mrs", dateOfBirth: "1936-01-19", gender: "Female", nhsNumber: "9990000085" }, ews: 2, consultant: "Dr Okafor", admitted: "2026-10-27", diagnosis: "Urinary tract infection with new confusion", tasks: ["Admission bloods", "Delirium screen"] }
      ]
    },
    AU: {
      ward: "Ward 5B, Fitzroy Campus",
      listFor: "Ward 5B nursing team",
      ewsTitle: "EWS",
      consultants: ["Dr Ramanathan", "Dr Fraser"],
      giver: "RN J Murphy",
      receiver: "RN P Sandhu",
      handoverPlace: "Ward 5B staff station",
      resusText: "Goals of care: not for CPR",
      mainReadBack: "High falls risk: supervise when mobilising",
      rows: [
        { bed: 1, patient: { familyName: "Papadopoulos", givenName: "Eleni", dateOfBirth: "1977-03-12", gender: "Female", mrn: "0412388" }, ews: 1, consultant: "Dr Fraser", admitted: "2026-10-26", diagnosis: "Asthma exacerbation", tasks: ["Peak flow before and after nebuliser"] },
        { bed: 2, patient: fromWard(w("AU", 0), "AU"), ews: 0, consultant: "Dr Ramanathan", admitted: "2026-10-25", diagnosis: "Cellulitis, left leg", tasks: ["Review IV antibiotics (48 hours)"] },
        { bed: 3, patient: fromWard(w("AU", 2), "AU"), ews: 3, consultant: "Dr Ramanathan", admitted: "2026-10-26", diagnosis: "Atrial fibrillation with fast ventricular rate", tasks: ["Repeat ECG", "Check potassium"] },
        { bed: 4, patient: { familyName: "Kelly", givenName: "Liam", dateOfBirth: "1958-10-02", gender: "Male", mrn: "0401924" }, ews: 0, consultant: "Dr Fraser", admitted: "2026-10-26", diagnosis: "Laparoscopic cholecystectomy, day 1", tasks: [] },
        { bed: 5, patient: fromWard(w("AU", 1), "AU"), ews: 5, consultant: "Dr Fraser", admitted: "2026-10-24", diagnosis: "Community-acquired pneumonia", tasks: ["Repeat lactate", "Review chest X-ray", "Fluid balance chart"] },
        { bed: 6, patient: { familyName: "Rossi", givenName: "Maria", dateOfBirth: "1936-01-19", gender: "Female", mrn: "0420031" }, ews: 2, consultant: "Dr Ramanathan", admitted: "2026-10-27", diagnosis: "Urinary tract infection with new confusion", tasks: ["Admission bloods", "Delirium screen"] },
        { bed: 7, patient: null, ews: null, consultant: "", admitted: "", diagnosis: "", tasks: [] },
        { bed: 9, patient: fromWard(w("AU", 3), "AU"), ews: 4, consultant: "Dr Fraser", admitted: "2026-10-27", diagnosis: "Diabetic ketoacidosis", tasks: ["Hourly capillary glucose", "Review insulin infusion rate"] },
        { bed: 12, patient: fromMain("AU"), ews: 2, consultant: "Dr Ramanathan", admitted: "2026-10-23", diagnosis: "Fall at home, fractured left wrist", tasks: ["Physiotherapy assessment", "Occupational therapy home visit"] }
      ]
    },
    NZ: {
      ward: "Ward 24, Riverside Hospital",
      listFor: "Ward 24 nursing team",
      ewsTitle: "NZEWS",
      consultants: ["Dr Tane", "Dr Whitmore"],
      giver: "RN A Tipene",
      receiver: "RN L Fonoti",
      handoverPlace: "Ward 24 office",
      resusText: "Resuscitation status: not for CPR",
      mainReadBack: "Allergy: penicillin (anaphylaxis); latex",
      rows: [
        { bed: 1, patient: { familyName: "Singh", givenName: "Harpreet", title: "Ms", dateOfBirth: "1977-03-12", gender: "Female", nhi: "ZZZ0067" }, ews: 1, consultant: "Dr Whitmore", admitted: "2026-10-26", diagnosis: "Asthma exacerbation", tasks: ["Peak flow before and after nebuliser"] },
        { bed: 2, patient: fromWard(w("NZ", 0), "NZ", "Mr"), ews: 3, consultant: "Dr Tane", admitted: "2026-10-26", diagnosis: "Atrial fibrillation with fast ventricular rate", tasks: ["Repeat ECG", "Check potassium"] },
        { bed: 3, patient: fromWard(w("NZ", 2), "NZ", "Mrs"), ews: 0, consultant: "Dr Tane", admitted: "2026-10-25", diagnosis: "Cellulitis, left leg", tasks: ["Review IV antibiotics (48 hours)"] },
        { bed: 4, patient: null, ews: null, consultant: "", admitted: "", diagnosis: "", tasks: [] },
        { bed: 5, patient: { familyName: "MacDonald", givenName: "Ian", title: "Mr", dateOfBirth: "1958-10-02", gender: "Male", nhi: "ZZZ0075" }, ews: 0, consultant: "Dr Whitmore", admitted: "2026-10-26", diagnosis: "Laparoscopic cholecystectomy, day 1", tasks: [] },
        { bed: 6, patient: fromWard(w("NZ", 1), "NZ", "Mr"), ews: 4, consultant: "Dr Whitmore", admitted: "2026-10-27", diagnosis: "Diabetic ketoacidosis", tasks: ["Hourly capillary glucose", "Review insulin infusion rate"] },
        { bed: 7, patient: fromMain("NZ"), ews: 2, consultant: "Dr Tane", admitted: "2026-10-23", diagnosis: "Fall at home, fractured left wrist", tasks: ["Physiotherapy assessment", "Occupational therapy home visit"] },
        { bed: 8, patient: { familyName: "H\u0113nare", givenName: "Ataahua", title: "Mrs", dateOfBirth: "1936-01-19", gender: "Female", nhi: "ZZZ0083" }, ews: 2, consultant: "Dr Tane", admitted: "2026-10-27", diagnosis: "Urinary tract infection with new confusion", tasks: ["Admission bloods", "Delirium screen"] },
        { bed: 9, patient: fromWard(w("NZ", 3), "NZ", "Mrs"), ews: 5, consultant: "Dr Whitmore", admitted: "2026-10-24", diagnosis: "Community-acquired pneumonia", tasks: ["Repeat lactate", "Review chest X-ray", "Fluid balance chart"] }
      ]
    }
  };
  var T = (hhmm) => `2026-10-27T${hhmm}`;
  function buildHandover(region) {
    const s = WARD_SETUP[region];
    const picked = s.rows.filter((r) => {
      var _a;
      return r.patient && ((_a = r.ews) != null ? _a : 0) >= 2;
    });
    const patients = picked.map((r, i) => {
      const p = r.patient;
      return {
        id: `hp-${r.bed}`,
        familyName: p.familyName,
        givenName: p.givenName,
        title: p.title,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        nhsNumber: p.nhsNumber,
        ihi: p.ihi,
        mrn: p.mrn,
        nhi: p.nhi,
        location: `${s.ward.split(",")[0]}, bed ${r.bed}`,
        responsible: { name: s.giver, role: "Registered nurse" },
        consultant: r.consultant,
        handoverState: "toHandOver",
        // The oldest patient has a resuscitation decision that must be read back; the main patient has one key fact too.
        readBackReasons: r.diagnosis.startsWith("Urinary") ? [s.resusText] : r.diagnosis.startsWith("Fall") ? [s.mainReadBack] : void 0,
        updatedAt: T(i % 2 ? "13:40" : "12:55"),
        updatedBy: s.giver
      };
    });
    const due = ["13:30", "16:00", "18:00", "15:00", "17:00", "20:00"];
    const tasks = [];
    picked.forEach((r, i) => {
      r.tasks.forEach((d, j) => {
        const k = i * 3 + j;
        const status = k % 4 === 1 ? "partial" : k % 5 === 3 ? "complete" : "incomplete";
        tasks.push({
          id: `ht-${r.bed}-${j}`,
          patientId: `hp-${r.bed}`,
          description: d,
          status,
          due: T(due[k % due.length]),
          allocatedTo: j === 0 ? s.receiver : void 0,
          forHandover: d.startsWith("Repeat lactate") || d.startsWith("Hourly"),
          completedBy: status === "complete" ? s.giver : void 0
        });
      });
    });
    return { patients, tasks };
  }

  // examples/desktop-ward-list.tsx
  var meta = {
    title: "Ward list and handover",
    description: "A nursing ward list filtered, sorted and grouped through DataToolbar, FilterDialog and header filters, with region identifiers, the similar-name warning, update marks and task sublists. Below it, the handover list and the handshake that transfers responsibility.",
    kind: "desktop",
    regions: ["GB", "AU", "NZ"],
    components: [
      "PatientList",
      "PatientIdentificationCell",
      "DataToolbar",
      "FilterNotification",
      "FilterDialog",
      "HeaderCellFilter",
      "SortDialog",
      "SortIndicator",
      "SubList",
      "UpdateMarker",
      "HandoverTaskList",
      "HandshakeDialog"
    ]
  };
  var looseKey = (s) => (s != null ? s : "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/(.)h/g, "$1").trim();
  function similarNames(a, b) {
    return looseKey(a.familyName) === looseKey(b.familyName) && looseKey(a.givenName) === looseKey(b.givenName);
  }
  function WardScreen({ region }) {
    var _a;
    const setup = WARD_SETUP[region];
    const columns = (0, import_react3.useMemo)(
      () => [
        { id: "bed", title: "Bed", kind: "location", dataType: "integer", align: "center", width: 64 },
        { id: "patient", title: "Patient", kind: "patient", width: 260 },
        { id: "ews", title: setup.ewsTitle, dataType: "integer", align: "right", width: 88 },
        { id: "consultant", title: "Consultant", dataType: "unorderedSymbol", options: setup.consultants, width: 150 },
        { id: "admitted", title: "Admitted", dataType: "date", width: 120 },
        { id: "diagnosis", title: "Working diagnosis", width: 320 },
        // Sublist: every task on its own sub-row, never "2 of 5" (PAL-0390..0410).
        { id: "tasks", title: "Outstanding tasks", sublist: (r) => r.tasks, getValue: (r) => r.tasks.length, width: 370 }
      ],
      [setup]
    );
    const attributes = (0, import_react3.useMemo)(
      () => (0, import_react4.patientListAttributes)(columns.filter((c) => !c.sublist), { getPatient: (r) => r.patient, region }),
      [columns, region]
    );
    const [filter, setFilter] = (0, import_react3.useState)({
      criteria: [{ attributeId: "ews", operator: "greaterThanOrEqual", value: "1" }],
      combine: "or"
    });
    const [sort, setSort] = (0, import_react3.useState)([{ attributeId: "bed", direction: "asc" }]);
    const [groupBy, setGroupBy] = (0, import_react3.useState)("consultant");
    const [dialog, setDialog] = (0, import_react3.useState)(null);
    const newest = setup.rows.filter((r) => r.admitted === "2026-10-27" && r.diagnosis.startsWith("Urinary"))[0];
    const sickest = setup.rows.reduce((a, b) => {
      var _a2, _b;
      return ((_a2 = b.ews) != null ? _a2 : -1) > ((_b = a.ews) != null ? _b : -1) ? b : a;
    });
    const [updates, setUpdates] = (0, import_react3.useState)(() => [
      { id: "u1", rowKey: String(newest.bed) },
      { id: "u2", rowKey: String(sickest.bed), columnId: "ews" },
      { id: "u3", rowKey: String(sickest.bed), columnId: "tasks", sublistIndex: 0 }
    ]);
    const initialHandover = (0, import_react3.useMemo)(() => buildHandover(region), [region]);
    const [hoPatients, setHoPatients] = (0, import_react3.useState)(initialHandover.patients);
    const [hoTasks, setHoTasks] = (0, import_react3.useState)(initialHandover.tasks);
    const [hideCompleted, setHideCompleted] = (0, import_react3.useState)(false);
    const [handshakeFor, setHandshakeFor] = (0, import_react3.useState)(null);
    const [lastHandshake, setLastHandshake] = (0, import_react3.useState)(null);
    const label = (p) => {
      var _a2, _b;
      return `${p.location}: ${((_a2 = p.familyName) != null ? _a2 : "").toUpperCase()}, ${(_b = p.givenName) != null ? _b : ""}`;
    };
    const handshakeItems = handshakeFor === "all" ? hoPatients.filter((p) => p.handoverState !== "handedOver").map((p) => ({ id: p.id, label: label(p) })) : hoPatients.filter((p) => p.id === handshakeFor).map((p) => ({ id: p.id, label: label(p) }));
    const toHandOver = hoPatients.filter((p) => p.handoverState !== "handedOver").length;
    const onHandshake = (rec) => {
      setHandshakeFor(null);
      setLastHandshake(rec);
      if (rec.outcome === "accepted") {
        setHoPatients(
          (ps) => ps.map(
            (p) => rec.itemIds.includes(p.id) ? { ...p, handoverState: "handedOver", responsible: { name: rec.receiver, role: "Registered nurse" }, updatedAt: rec.dateTime, updatedBy: rec.receiver } : p
          )
        );
      }
    };
    const section = { display: "grid", gap: "var(--space-3)" };
    return /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gap: "var(--space-6)" } }, /* @__PURE__ */ import_react3.default.createElement("section", { "aria-label": "Ward list", style: section }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.PatientList,
      {
        title: "Ward list",
        listFor: setup.listFor,
        locations: [setup.ward],
        timestamp: EXAMPLE_NOW,
        timestampKind: "lastUpdated",
        realTime: false,
        lastRefreshed: new Date(EXAMPLE_NOW.getTime() - 3 * 6e4),
        now: EXAMPLE_NOW,
        refreshIntervalLabel: "every 5 minutes",
        onRefresh: () => void 0,
        columns,
        rows: setup.rows,
        getRowKey: (r) => String(r.bed),
        getPatient: (r) => r.patient,
        similarNames,
        filter,
        onFilterChange: setFilter,
        headerFilter: true,
        sort,
        onSortChange: setSort,
        groupBy,
        onHeaderCommand: (cmd, columnId) => {
          if (cmd === "filter") setDialog("filter");
          else if (cmd === "sort") setSort([{ attributeId: columnId, direction: "asc" }]);
          else setGroupBy(columnId);
        },
        updates,
        onUnmark: (ids) => setUpdates((u) => u.filter((x) => !ids.includes(x.id))),
        maxHeight: 780,
        toolbar: /* @__PURE__ */ import_react3.default.createElement(
          import_react4.DataToolbar,
          {
            label: "Ward list tools",
            onFilter: () => setDialog("filter"),
            onSort: () => setDialog("sort"),
            groupOptions: [{ id: "consultant", label: "Consultant" }, { id: "ews", label: setup.ewsTitle }, { id: "admitted", label: "Admitted" }],
            groupBy,
            onGroupByChange: setGroupBy,
            filterActive: !!filter,
            onRemoveAllFilters: () => setFilter(null)
          }
        )
      }
    )), /* @__PURE__ */ import_react3.default.createElement("section", { "aria-labelledby": "handover-heading", style: section }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--space-4)", justifyContent: "space-between" } }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h2", { id: "handover-heading", style: { margin: 0, fontSize: 18, lineHeight: "24px" } }, "Afternoon handover"), /* @__PURE__ */ import_react3.default.createElement("p", { style: { margin: "2px 0 0", fontSize: 14, color: "var(--ink-muted)" } }, "Giver ", setup.giver, " \xB7 Receiver ", setup.receiver, " \xB7 ", toHandOver, " of ", hoPatients.length, " patients still to hand over")), /* @__PURE__ */ import_react3.default.createElement(import_react4.Button, { variant: "primary", icon: "user", disabled: toHandOver === 0, onClick: () => setHandshakeFor("all") }, "Record handover")), lastHandshake ? (
      // Outcome stated in words, with who and when (RID 20, 27). Refusals are as visible as acceptances.
      /* @__PURE__ */ import_react3.default.createElement("p", { role: "status", style: { margin: 0, padding: "var(--space-2) var(--space-3)", fontSize: 14, background: lastHandshake.outcome === "accepted" ? "var(--success-surface)" : "var(--warning-surface)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" } }, "Handover ", lastHandshake.outcome === "accepted" ? "accepted" : "refused", " by ", lastHandshake.receiver, " at ", (0, import_react4.formatTime)((_a = (0, import_react4.toDate)(lastHandshake.dateTime)) != null ? _a : EXAMPLE_NOW), ", ", lastHandshake.place, ".", " ", lastHandshake.itemIds.length, " patient", lastHandshake.itemIds.length === 1 ? "" : "s", ".", lastHandshake.outcome === "refused" && lastHandshake.refusalReason ? ` Reason: ${lastHandshake.refusalReason}.` : "")
    ) : null, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.HandoverTaskList,
      {
        title: "Handover tasks",
        patients: hoPatients,
        tasks: hoTasks,
        now: EXAMPLE_NOW,
        hideCompleted,
        onHideCompletedChange: setHideCompleted,
        onStatusChange: (taskId, statusId) => setHoTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, status: statusId, updatedAt: EXAMPLE_NOW, updatedBy: setup.giver } : t)),
        onRemoveTask: (taskId) => setHoTasks((ts) => ts.filter((t) => t.id !== taskId)),
        onReadBackConfirm: (pid) => setHoPatients((ps) => ps.map((p) => p.id === pid ? { ...p, readBackConfirmed: true } : p)),
        onRecordHandover: (pid) => setHandshakeFor(pid),
        similarNames
      }
    )), dialog === "filter" ? /* @__PURE__ */ import_react3.default.createElement(
      import_react4.FilterDialog,
      {
        tableName: "ward list",
        rowNoun: "patients",
        attributes,
        initial: filter,
        onPreview: setFilter,
        onOk: (f) => {
          setFilter(f);
          setDialog(null);
        },
        onCancel: (original) => {
          setFilter(original);
          setDialog(null);
        }
      }
    ) : null, dialog === "sort" ? /* @__PURE__ */ import_react3.default.createElement(
      import_react4.SortDialog,
      {
        tableName: "ward list",
        rowNoun: "patients",
        attributes,
        initial: sort,
        onPreview: setSort,
        onOk: (s) => {
          setSort(s);
          setDialog(null);
        },
        onCancel: (original) => {
          setSort(original);
          setDialog(null);
        }
      }
    ) : null, handshakeFor ? (
      // Date, time, place, giver and receiver are captured for the user to confirm (RID 27); the receiver records it.
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.HandshakeDialog,
        {
          items: handshakeItems,
          giver: setup.giver,
          receiver: setup.receiver,
          actingAs: "receiver",
          place: setup.handoverPlace,
          dateTime: EXAMPLE_NOW,
          reasons: ["Shift change", "Break cover", "Transfer of care"],
          onSubmit: onHandshake,
          onCancel: () => setHandshakeFor(null)
        }
      )
    ) : null);
  }
  function DesktopWardList() {
    return /* @__PURE__ */ import_react3.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react3.default.createElement(WardScreen, { region }));
  }

  // examples/.entry-desktop-ward-list.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react5.default.createElement(DesktopWardList));
})();
