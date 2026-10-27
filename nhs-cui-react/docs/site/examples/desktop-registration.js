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

  // examples/.entry-desktop-registration.tsx
  var import_react5 = __toESM(require_react());

  // examples/desktop-registration.tsx
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

  // examples/data/desktop-registration.ts
  var delay = (value, ms = 150) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
  function registrationStart(region) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
    const m = MAIN_PATIENT[region];
    const id = (t) => m.identifiers.find((i) => i.type === t);
    const name = { title: m.title, familyName: m.familyName, givenName: m.givenName, middleNames: "", suffix: "", preferredName: (_a = m.preferredName) != null ? _a : "" };
    const a = m.address;
    const address = region === "GB" ? { line1: a.lines[0], line2: "", line3: "", town: a.town, county: (_b = a.county) != null ? _b : "", postcode: a.postcode } : region === "AU" ? { unit: (_c = a.unit) != null ? _c : "", line1: a.lines[0], line2: "", line3: "", town: (_d = a.suburb) != null ? _d : a.town, state: (_e = a.state) != null ? _e : "", postcode: a.postcode } : { buildingName: "", line1: a.lines[0], line2: "", line3: "", suburb: (_f = a.suburb) != null ? _f : "", town: a.town, postcode: a.postcode };
    const medicare = id("medicare");
    return {
      name,
      dateOfBirth: m.dateOfBirth,
      nhs: (_h = (_g = id("nhs")) == null ? void 0 : _g.value) != null ? _h : "",
      ihi: (_j = (_i = id("ihi")) == null ? void 0 : _i.value) != null ? _j : "",
      mrn: (_l = (_k = id("mrn")) == null ? void 0 : _k.value) != null ? _l : "",
      medicare: (_m = medicare == null ? void 0 : medicare.value) != null ? _m : "",
      medicareIrn: (_n = medicare == null ? void 0 : medicare.irn) != null ? _n : "",
      medicareValidTo: (medicare == null ? void 0 : medicare.validTo) ? `${medicare.validTo.slice(5)}/${medicare.validTo.slice(0, 4)}` : "",
      // NZ starts with an old NHI copied from a referral letter: the lookup reports it dormant and offers the live one.
      nhi: region === "NZ" ? DORMANT_NHI : "",
      address,
      phone: m.phone
    };
  }
  var DORMANT_NHI = "ZZZ0091";
  function lookupNhi(nhi) {
    if (nhi === DORMANT_NHI) return delay({ status: "dormant", liveNhi: "ZZZ0016" });
    if (["ZZZ0016", "ZZZ0024", "ZZZ0032", "ZZZ0008", "ZZZ0059"].includes(nhi)) return delay({ status: "live" });
    return delay({ status: "not-found" });
  }
  var GB_ADDRESSES = [
    { address: { line1: "12 Mill Lane", line2: "", line3: "", town: "Ipswich", county: "Suffolk", postcode: "IP4 1AB" } },
    { address: { line1: "14 Mill Lane", line2: "", line3: "", town: "Ipswich", county: "Suffolk", postcode: "IP4 1AB" } },
    { address: { line1: "Flat 3, Orwell House", line2: "16 Mill Lane", line3: "", town: "Ipswich", county: "Suffolk", postcode: "IP4 1AB" } }
  ];
  var gbFindAddress = (q) => delay(GB_ADDRESSES.filter((r) => {
    var _a, _b, _c;
    return ((_a = r.address.postcode) != null ? _a : "").replace(/\s/g, "").toUpperCase() === q.postcode.replace(/\s/g, "").toUpperCase() && (!q.buildingNumber || ((_b = r.address.line1) != null ? _b : "").startsWith(q.buildingNumber) || ((_c = r.address.line2) != null ? _c : "").startsWith(q.buildingNumber));
  }));
  var gbFindPostcode = (a) => delay(GB_ADDRESSES.filter((r) => {
    var _a;
    return (_a = r.address.line1) == null ? void 0 : _a.toLowerCase().includes(a.line1.toLowerCase().split(" ").slice(-2).join(" "));
  }));
  var AU_ADDRESSES = [
    { address: { unit: "Unit 2", line1: "14 Smith St", town: "Fitzroy", state: "VIC", postcode: "3065", addressId: "GAVIC_DEMO_0001" } },
    { address: { unit: "", line1: "14 Smith St", town: "Collingwood", state: "VIC", postcode: "3066", addressId: "GAVIC_DEMO_0002" } },
    { address: { unit: "", line1: "140 Smith St", town: "Fitzroy", state: "VIC", postcode: "3065", addressId: "GAVIC_DEMO_0003" } }
  ];
  var NZ_ADDRESSES = [
    { address: { line1: "22 K\u014Dwhai Street", suburb: "Southbrook", town: "Rangiora", postcode: "7400", addressId: "NZP-DEMO-1001" } },
    { address: { line1: "22 K\u014Dwhai Road", suburb: "RD 2", town: "Rangiora", postcode: "7472", addressId: "NZP-DEMO-1002" } },
    { address: { line1: "2 K\u014Dwhai Street", suburb: "", town: "Kaiapoi", postcode: "7630", addressId: "NZP-DEMO-1003" } }
  ];
  var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  var searchAddress = (region) => (query) => {
    const words = fold(query).split(/[\s,]+/).filter(Boolean);
    const list = region === "AU" ? AU_ADDRESSES : NZ_ADDRESSES;
    return delay(list.filter((r) => words.every((w) => fold(Object.values(r.address).join(" ")).includes(w))));
  };
  var ETHNICITY_CLASSIFICATION = [
    { code: "12948", label: "Dutch" },
    { code: "35111", label: "Tokelauan" }
  ];
  var lookupEthnicity = (q) => delay(ETHNICITY_CLASSIFICATION.filter((e) => fold(e.label).includes(fold(q))));
  var IWI_LIST = [
    { code: "0101", name: "Te Aup\u014Duri", rohe: "Te Tai Tokerau" },
    { code: "0104", name: "Ng\u0101puhi", rohe: "Te Tai Tokerau" },
    { code: "demo-01", name: "Ng\u0101ti Porou", rohe: "Te Tai R\u0101whiti" },
    { code: "demo-02", name: "Ng\u0101i Tahu / K\u0101i Tahu", rohe: "Te Waipounamu" },
    { code: "demo-03", name: "Ng\u0101ti Kahungunu", rohe: "Te Matau-a-M\u0101ui" },
    { code: "demo-04", name: "T\u016Bhoe", rohe: "Te Urewera" }
  ];

  // examples/desktop-registration.tsx
  var meta = {
    title: "Patient registration",
    description: "Updating a patient record: name, date of birth, sex and gender, region identifiers (NHS number; IHI, URN, Medicare with valid to date and DVA; NHI with dormant handling), address lookup and telephone, with the AU and NZ questions shown only in their region. The patient banner above previews the record as it is typed.",
    kind: "desktop",
    regions: ["GB", "AU", "NZ"],
    components: [
      "PatientBanner",
      "PatientNameInput",
      "DateInput",
      "PartialDateOfBirthInput",
      "SexGenderInput",
      "PatientIdentifierInput",
      "DvaNumberInput",
      "AddressInput",
      "TelephoneNumberInput",
      "IndigenousStatusInput",
      "MyHealthRecordStatus",
      "EthnicityInput",
      "MaoriDescentInput",
      "IwiInput",
      "ProtectionFlagInput"
    ]
  };
  function initialRecord(region) {
    var _a, _b;
    const s = registrationStart(region);
    const m = MAIN_PATIENT[region];
    const [y, mo, d] = s.dateOfBirth.split("-").map(Number);
    const gender = region === "GB" ? m.gender : region === "AU" ? m.gender === "Male" ? "1" : "2" : m.gender === "Male" ? "M" : "F";
    return {
      name: s.name,
      dob: { kind: "full", year: y, month: mo, day: d },
      dobHiso: s.dateOfBirth.replace(/-/g, ""),
      gender,
      sex: region === "GB" ? m.gender : region === "AU" ? null : null,
      nhs: s.nhs,
      ihi: s.ihi,
      mrn: s.mrn,
      medicare: s.medicare,
      medicareIrn: s.medicareIrn,
      medicareValidTo: s.medicareValidTo,
      dva: "",
      dvaCardType: "",
      nhi: s.nhi,
      nhiDormantLive: null,
      address: s.address,
      phone: s.phone,
      indigenous: (_a = m.indigenousStatus) != null ? _a : null,
      ethnicity: { entries: ((_b = m.ethnicity) != null ? _b : []).map((code) => ({ code, label: code === "21111" ? "M\u0101ori" : code === "31111" ? "Samoan" : code })) },
      maoriDescent: region === "NZ" ? "yes" : null,
      iwi: region === "NZ" ? { knows: "yes", iwi: [{ code: "demo-01", name: "Ng\u0101ti Porou", rohe: "Te Tai R\u0101whiti" }] } : { knows: null, iwi: [] },
      nameProtected: false,
      addressProtected: false,
      contactProtected: false
    };
  }
  var card = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4) var(--space-6)",
    display: "grid",
    gap: "var(--space-4)",
    alignContent: "start",
    minWidth: 0
  };
  var h2 = { margin: 0, fontSize: 18, lineHeight: "24px", fontWeight: 600 };
  function Section({ title, children }) {
    const id = `reg-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
    return /* @__PURE__ */ import_react3.default.createElement("section", { "aria-labelledby": id, style: card }, /* @__PURE__ */ import_react3.default.createElement("h2", { id, style: h2 }, title), children);
  }
  function RegistrationScreen({ region }) {
    const [rec, setRec] = (0, import_react3.useState)(() => initialRecord(region));
    const set = (key) => (value) => setRec((r) => ({ ...r, [key]: value }));
    const [mhrState, setMhrState] = (0, import_react3.useState)("available");
    const [mhrCheckedAt, setMhrCheckedAt] = (0, import_react3.useState)(new Date(EXAMPLE_NOW.getTime() - 20 * 6e4));
    const [savedAt, setSavedAt] = (0, import_react3.useState)(null);
    const identifiers = [];
    if (region === "AU") {
      if (rec.ihi) identifiers.push({ type: "ihi", value: rec.ihi });
      if (rec.mrn) identifiers.push({ type: "mrn", value: rec.mrn });
      if (rec.medicare) identifiers.push({ type: "medicare", value: rec.medicare, irn: rec.medicareIrn, medicareValidTo: rec.medicareValidTo || void 0 });
      if (rec.dva) identifiers.push({ type: "dva", value: rec.dva, dvaCardType: rec.dvaCardType || void 0 });
    }
    if (region === "NZ" && rec.nhi) {
      identifiers.push(rec.nhiDormantLive ? { type: "nhi", value: rec.nhi, nhiStatus: "dormant", liveNhi: rec.nhiDormantLive } : { type: "nhi", value: rec.nhi });
    }
    const useLiveNhi = (live) => setRec((r) => ({ ...r, nhi: live, nhiDormantLive: null }));
    const identifiersSection = /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Identifiers" }, region === "GB" ? /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientIdentifierInput, { type: "nhs", value: rec.nhs, onChange: (_s, n) => set("nhs")(n), required: true }) : null, region === "AU" ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientIdentifierInput, { type: "ihi", value: rec.ihi, onChange: (_s, n) => set("ihi")(n) }), /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientIdentifierInput, { type: "mrn", value: rec.mrn, onChange: (_s, n) => set("mrn")(n), mrnPattern: /^\d{7}$/, mrnPatternMessage: "A URN at this hospital has 7 digits" }), /* @__PURE__ */ import_react3.default.createElement(
      import_react4.PatientIdentifierInput,
      {
        type: "medicare",
        value: rec.medicare,
        onChange: (_shown, digits) => set("medicare")(digits),
        irn: rec.medicareIrn,
        onIrnChange: set("medicareIrn"),
        validTo: rec.medicareValidTo,
        onValidToChange: (_text, norm) => set("medicareValidTo")(norm),
        now: EXAMPLE_NOW
      }
    ), /* @__PURE__ */ import_react3.default.createElement(import_react4.DvaNumberInput, { value: rec.dva, onChange: set("dva"), cardType: rec.dvaCardType, onCardTypeChange: set("dvaCardType") })) : null, region === "NZ" ? (
      // PatientIdentifierInput passes the NHI lookup through: the host's NHI service reports a dormant number with
      // its live NHI, and the user chooses to switch (G12 4).
      /* @__PURE__ */ import_react3.default.createElement(
        import_react4.PatientIdentifierInput,
        {
          type: "nhi",
          value: rec.nhi,
          onChange: (shown, nhi) => setRec((r) => ({ ...r, nhi: shown, nhiDormantLive: nhi === r.nhi ? r.nhiDormantLive : null })),
          lookupNhi: (nhi) => lookupNhi(nhi).then((res) => {
            setRec((r) => {
              var _a;
              return { ...r, nhiDormantLive: res.status === "dormant" && r.nhi.toUpperCase() === nhi ? (_a = res.liveNhi) != null ? _a : null : null };
            });
            return res;
          }),
          onUseLiveNhi: useLiveNhi,
          flagTestNumbers: false,
          required: true
        }
      )
    ) : null);
    return /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.PatientBanner,
      {
        name: { familyName: rec.name.familyName, givenName: rec.name.singleName ? "" : rec.name.givenName, title: rec.name.title },
        preferredName: rec.name.preferredName || null,
        dateOfBirth: region === "NZ" ? void 0 : (0, import_react4.dateInputValueToIso)(rec.dob) || null,
        partialDateOfBirth: region === "NZ" ? rec.dobHiso || null : void 0,
        gender: rec.gender,
        nhsNumber: region === "GB" ? rec.nhs || null : void 0,
        identifiers,
        flagTestIdentifiers: false,
        onUseLiveNhi: useLiveNhi,
        nameProtected: region === "NZ" && rec.nameProtected,
        address: { ...(0, import_react4.addressInputToValue)(rec.address, region), protected: region === "NZ" && rec.addressProtected },
        contacts: region === "GB" ? { home: rec.phone, protected: false } : { mobile: rec.phone, protected: region === "NZ" && rec.contactProtected },
        myHealthRecord: region === "AU" ? { state: mhrState, checkedAt: mhrCheckedAt } : void 0,
        showClinicalInformation: false,
        now: EXAMPLE_NOW,
        sticky: false
      }
    ), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" } }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("h2", { style: { margin: 0, fontSize: 20, lineHeight: "26px" } }, "Update patient details"), /* @__PURE__ */ import_react3.default.createElement("p", { style: { margin: "2px 0 0", fontSize: 14, color: "var(--ink-muted)" } }, "Check each section with the patient. The banner shows the record as it will be saved.")), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "flex", alignItems: "center", gap: "var(--space-3)" } }, /* @__PURE__ */ import_react3.default.createElement("span", { role: "status", style: { fontSize: 14, color: savedAt ? "var(--success)" : "var(--ink-muted)" } }, savedAt ? `Saved at ${(0, import_react4.formatTime)(savedAt)}` : "Unsaved changes"), /* @__PURE__ */ import_react3.default.createElement(import_react4.Button, { variant: "secondary", onClick: () => {
      setRec(initialRecord(region));
      setSavedAt(null);
    } }, "Discard changes"), /* @__PURE__ */ import_react3.default.createElement(import_react4.Button, { variant: "primary", onClick: () => setSavedAt(EXAMPLE_NOW) }, "Save details"))), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-4)", alignItems: "start" } }, /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gap: "var(--space-4)", minWidth: 0 } }, /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Name" }, /* @__PURE__ */ import_react3.default.createElement(import_react4.PatientNameInput, { value: rec.name, onChange: set("name"), id: "reg-name" }), region === "NZ" ? /* @__PURE__ */ import_react3.default.createElement(import_react4.ProtectionFlagInput, { kind: "name", checked: rec.nameProtected, onChange: (v) => set("nameProtected")(v) }) : null), /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Date of birth, sex and gender" }, region === "NZ" ? (
      // NZ records a partial date when only the year or month is known (HISO 10046 2.3.1), with its source.
      /* @__PURE__ */ import_react3.default.createElement(import_react4.PartialDateOfBirthInput, { value: rec.dobHiso, onChange: (_v, hiso) => set("dobHiso")(hiso), showSource: true, defaultSource: "BRCT", now: EXAMPLE_NOW })
    ) : /* @__PURE__ */ import_react3.default.createElement(
      import_react4.DateInput,
      {
        label: "Date of birth",
        value: rec.dob,
        onChange: set("dob"),
        allowUnknown: true,
        today: EXAMPLE_NOW,
        max: EXAMPLE_NOW,
        validate: (v) => v.kind === "full" && new Date(v.year, v.month - 1, v.day) > EXAMPLE_NOW ? "The date of birth is in the future. Enter the correct date of birth." : null,
        required: true
      }
    ), /* @__PURE__ */ import_react3.default.createElement(import_react4.SexGenderInput, { kind: "currentGender", orientation: "horizontal", value: rec.gender, onChange: (v) => set("gender")(v) }), region !== "NZ" ? /* @__PURE__ */ import_react3.default.createElement(
      import_react4.SexGenderInput,
      {
        kind: "sex",
        orientation: "horizontal",
        value: rec.sex,
        onChange: (v) => set("sex")(v),
        purpose: region === "AU" ? "Asked so that clinical care and screening can be offered correctly." : void 0
      }
    ) : null), region !== "GB" ? identifiersSection : null), /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gap: "var(--space-4)", minWidth: 0 } }, /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Contact" }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.AddressInput,
      {
        legend: "Usual address",
        value: rec.address,
        onChange: set("address"),
        onFindAddress: region === "GB" ? gbFindAddress : void 0,
        onFindPostcode: region === "GB" ? gbFindPostcode : void 0,
        onSearchAddress: region === "GB" ? void 0 : searchAddress(region),
        id: "reg-address"
      }
    ), /* @__PURE__ */ import_react3.default.createElement(
      import_react4.TelephoneNumberInput,
      {
        label: region === "GB" ? "Home telephone" : "Mobile",
        value: rec.phone,
        onChange: set("phone")
      }
    ), region === "NZ" ? /* @__PURE__ */ import_react3.default.createElement("div", { style: { display: "grid", gap: "var(--space-2)" } }, /* @__PURE__ */ import_react3.default.createElement(import_react4.ProtectionFlagInput, { kind: "address", checked: rec.addressProtected, onChange: (v) => set("addressProtected")(v) }), /* @__PURE__ */ import_react3.default.createElement(import_react4.ProtectionFlagInput, { kind: "contact", checked: rec.contactProtected, onChange: (v) => set("contactProtected")(v) })) : null), region === "GB" ? identifiersSection : null, region === "AU" ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Aboriginal and Torres Strait Islander status" }, /* @__PURE__ */ import_react3.default.createElement(import_react4.IndigenousStatusInput, { value: rec.indigenous, onChange: set("indigenous"), purpose: "Asked of everyone so that services can be offered and planned." })), /* @__PURE__ */ import_react3.default.createElement(Section, { title: "My Health Record" }, /* @__PURE__ */ import_react3.default.createElement(
      import_react4.MyHealthRecordStatus,
      {
        state: mhrState,
        checkedAt: mhrCheckedAt,
        onCheck: () => {
          setMhrState("available");
          setMhrCheckedAt(EXAMPLE_NOW);
        },
        onOpen: () => void 0,
        doNotUpload: false
      }
    ))) : null, region === "NZ" ? /* @__PURE__ */ import_react3.default.createElement(Section, { title: "Ethnicity, M\u0101ori descent and iwi" }, /* @__PURE__ */ import_react3.default.createElement(import_react4.EthnicityInput, { value: rec.ethnicity, onChange: set("ethnicity"), classification: lookupEthnicity }), /* @__PURE__ */ import_react3.default.createElement(import_react4.MaoriDescentInput, { value: rec.maoriDescent, onChange: set("maoriDescent") }), rec.maoriDescent === "yes" ? /* @__PURE__ */ import_react3.default.createElement(import_react4.IwiInput, { value: rec.iwi, onChange: set("iwi"), iwiList: IWI_LIST }) : null) : null)));
  }
  function DesktopRegistration() {
    return /* @__PURE__ */ import_react3.default.createElement(ExampleShell, { meta }, (region) => /* @__PURE__ */ import_react3.default.createElement(RegistrationScreen, { region }));
  }

  // examples/.entry-desktop-registration.tsx
  window.__exampleMeta = meta;
  var el = document.getElementById("root");
  if (el) window.ReactDOM.createRoot(el).render(import_react5.default.createElement(DesktopRegistration));
})();
