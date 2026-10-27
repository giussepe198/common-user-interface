/**
 * Sex, gender, Indigenous status, ethnicity, Māori descent and iwi value sets (G10 sections 4-5, G11 sections 3-4).
 * Labels and question wording are copied from the cited standards; do not edit them without checking the source.
 */
import type { ClinicalRegion } from '../../../core/locale';

/** One coded value in a value set. */
export interface PatientCodedValue {
  /** Code stored in the record. */
  code: string;
  /** Label shown as a form option (exact standard wording). */
  label: string;
  /** Shorter label for read-only display where it differs from the option label. */
  displayLabel?: string;
  /** Te reo Māori label from the standard (NZ only), shown when `teReoLabels` is on. */
  teReo?: string;
  /** Alternative code (for example METeOR letter codes M, F, X, T, Z). */
  altCode?: string;
  /** Selecting this value asks for the person's own words ("please specify"). */
  specify?: boolean;
  /** False for administrative values that are recorded but never offered as a form option. Default true. */
  formOption?: boolean;
}

/* ------------------------------------------------------------------ */
/* Australia: ABS 2020 Standard and METeOR                            */
/* ------------------------------------------------------------------ */

/**
 * ABS Standard for Sex, Gender, Variations of Sex Characteristics and Sexual Orientation Variables, 2020: gender.
 * METeOR 741842 Person–gender, code X.
 * Sources: https://abs.gov.au/statistics/standards/standard-sex-gender-variations-sex-characteristics-and-sexual-orientation-variables/latest-release ;
 * https://meteor.aihw.gov.au/content/741842
 */
export const AU_GENDER_VALUES: ReadonlyArray<PatientCodedValue> = [
  { code: '1', altCode: 'M', label: 'Man or male' },
  { code: '2', altCode: 'F', label: 'Woman or female' },
  { code: '3', altCode: 'X', label: 'Non-binary' },
  { code: '4', altCode: 'T', label: 'I use a different term (please specify)', displayLabel: 'Different term', specify: true },
  { code: '5', altCode: 'Z', label: 'Prefer not to answer' },
  { code: '9', label: 'Not stated or inadequately described', formOption: false },
];

/**
 * ABS 2020: sex recorded at birth. METeOR 741686 Person–sex, code X.
 * Sources: as above; https://meteor.aihw.gov.au/content/741686
 */
export const AU_SEX_AT_BIRTH_VALUES: ReadonlyArray<PatientCodedValue> = [
  { code: '1', altCode: 'M', label: 'Male' },
  { code: '2', altCode: 'F', label: 'Female' },
  { code: '3', altCode: 'X', label: 'Another term (please specify)', displayLabel: 'Another term', specify: true },
  { code: '9', label: 'Not stated or inadequately described', formOption: false },
];

/**
 * Legacy METeOR 635126 Person–sex, code N, still found in older feeds. Map for display only; never offer as options.
 * Source (secondary): https://meteor.aihw.gov.au/content/635126
 */
export const AU_LEGACY_SEX_CODE_N: ReadonlyArray<PatientCodedValue> = [
  { code: '1', label: 'Male' },
  { code: '2', label: 'Female' },
  { code: '3', label: 'Intersex or indeterminate' },
  { code: '9', label: 'Not stated or inadequately described' },
];

/** ABS 2020 question wording (self-completed form). */
export const AU_SEX_GENDER_QUESTIONS = {
  sex: 'What was your sex recorded at birth?',
  gender: 'How do you describe your gender?',
  /** Required note with the gender question. */
  genderNote: 'Gender refers to current gender, which may be different to sex recorded at birth',
  /** METeOR 741686 definition. */
  sexDefinition: 'Sex recorded at birth refers to what was determined by sex characteristics observed at birth or in infancy.',
} as const;

/* ------------------------------------------------------------------ */
/* New Zealand: HISO 10046 and Stats NZ 2021                          */
/* ------------------------------------------------------------------ */

/**
 * HISO 10046:2024 gender value set, with te reo Māori labels from HISO 10046 and Stats NZ.
 * Option order follows the Stats NZ question (Male, Female, Another gender), then the administrative
 * "Unspecified or unknown" [suggested order].
 * Sources: https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf ;
 * https://www.stats.govt.nz/assets/Methods/Data-standards-for-sex-gender-and-variations-on-sex-characteristics/downloads/Data-standard-for-gender-sex-and-variations-of-sex-characteristics.pdf
 */
export const NZ_GENDER_VALUES: ReadonlyArray<PatientCodedValue> = [
  { code: 'M', label: 'Male', teReo: 'Tāne' },
  { code: 'F', label: 'Female', teReo: 'Wahine' },
  { code: 'O', label: 'Another gender (please specify)', displayLabel: 'Another gender', teReo: 'He ira kē anō', specify: true },
  { code: 'U', label: 'Unspecified or unknown' },
];

/**
 * Stats NZ 2021 sex at birth classification (SEX v2.0.0). Code 3 is only for collections that need a third option
 * (for example perinatal data); it is off by default.
 * Source: Stats NZ data standard (above).
 */
export const NZ_SEX_AT_BIRTH_VALUES: ReadonlyArray<PatientCodedValue> = [
  { code: '1', label: 'Male', teReo: 'Tāne' },
  { code: '2', label: 'Female', teReo: 'Wahine' },
  { code: '3', label: 'Another term', formOption: false },
];

/** Stats NZ residual categories with te reo labels. [UNCERTAIN] numeric codes 94-99 not printed for gender in the standard. */
export const NZ_GENDER_RESIDUALS: ReadonlyArray<PatientCodedValue> = [
  { code: '94', label: "Don't know", teReo: 'Aua hoki' },
  { code: '95', label: 'Refused to answer', teReo: 'Kāhore e whakahoki' },
  { code: '97', label: 'Response unidentifiable', teReo: 'Kāhore e mohio' },
  { code: '98', label: 'Response outside scope', teReo: 'Kei waho i te Kaupapa' },
  { code: '99', label: 'Not stated', teReo: 'Kaore e ki' },
];

/** Stats NZ question wording. */
export const NZ_SEX_GENDER_QUESTIONS = {
  gender: 'What is your gender?',
  sex: 'What was your sex at birth?',
  sexNote: '(for example, what was recorded on your birth certificate)',
} as const;

/** Gender detail (person's own words) maximum length: HISO 10046 150; ABS none given, 100 [suggested]. */
export const GENDER_DETAIL_MAX_LENGTH: Record<ClinicalRegion, number> = { GB: 100, AU: 100, NZ: 150 };

/* ------------------------------------------------------------------ */
/* Australia: Indigenous status (METeOR 602543)                       */
/* ------------------------------------------------------------------ */

export type IndigenousStatusCode = '1' | '2' | '3' | '4' | '9';

/**
 * METeOR 602543 Person–Indigenous status, code N. `label` is the METeOR meaning; `displayLabel` the short banner text (AU-IS-03).
 * Source: https://meteor.aihw.gov.au/content/602543
 */
export const AU_INDIGENOUS_STATUS_VALUES: ReadonlyArray<PatientCodedValue & { code: IndigenousStatusCode }> = [
  { code: '1', label: 'Aboriginal but not Torres Strait Islander origin', displayLabel: 'Aboriginal' },
  { code: '2', label: 'Torres Strait Islander but not Aboriginal origin', displayLabel: 'Torres Strait Islander' },
  { code: '3', label: 'Both Aboriginal and Torres Strait Islander origin', displayLabel: 'Aboriginal and Torres Strait Islander' },
  { code: '4', label: 'Neither Aboriginal nor Torres Strait Islander origin', displayLabel: 'Neither Aboriginal nor Torres Strait Islander' },
  { code: '9', label: 'Not stated/inadequately described', displayLabel: 'Not stated' },
];

/**
 * Standard question, tick boxes in this order (METeOR 602543). The "both" instruction wording is [UNCERTAIN] (ABS standard).
 */
export const AU_INDIGENOUS_STATUS_QUESTION = {
  question: 'Are you of Aboriginal or Torres Strait Islander origin?',
  options: [
    { key: 'no', label: 'No' },
    { key: 'aboriginal', label: 'Yes, Aboriginal' },
    { key: 'tsi', label: 'Yes, Torres Strait Islander' },
  ],
  bothInstruction: "For persons of both Aboriginal and Torres Strait Islander origin, mark both 'Yes' boxes.",
  /** The METeOR 602543 self-completed instruction, verified (G12 section 8). Not the default, to keep existing behaviour. */
  bothInstructionMeteor: "If you are of both Aboriginal and Torres Strait Islander origin, answer using both 'Yes' options.",
} as const;

/**
 * Interviewer-administered version (METeOR 602543): Q1 screens (Yes/No), Q2 asks which. The interviewer is not required
 * to prompt with the response categories; the "Both" category may be included or excluded by agency practice.
 * Third-party wording uses the person's name ("Is (name) ..."). Source: https://meteor.aihw.gov.au/content/602543
 */
export const AU_INDIGENOUS_STATUS_INTERVIEWER_QUESTION = {
  q1: 'Are you of Aboriginal or Torres Strait Islander origin?',
  q1Options: [
    { key: 'yes', label: 'Yes' },
    { key: 'no', label: 'No' },
  ],
  q2: 'Are you of Aboriginal origin, Torres Strait Islander origin, or both?',
  q2Options: [
    { key: 'aboriginal', label: 'Aboriginal', code: '1' },
    { key: 'tsi', label: 'Torres Strait Islander', code: '2' },
    { key: 'both', label: 'Both Aboriginal and Torres Strait Islander', code: '3' },
  ],
  /** Third-party forms: `name` is the person's name or "the person". */
  q1ThirdParty: (name: string) => `Is ${name} of Aboriginal or Torres Strait Islander origin?`,
  q2ThirdParty: (name: string) => `Is ${name} of Aboriginal origin, Torres Strait Islander origin, or both?`,
  /** Interviewer note [suggested wording of the METeOR guidance]. */
  interviewerNote: 'Ask every person, as written. Do not read out the Q2 categories and do not answer from appearance.',
} as const;

/* ------------------------------------------------------------------ */
/* New Zealand: ethnicity (HISO 10001:2017)                           */
/* ------------------------------------------------------------------ */

/**
 * HISO 10001:2017 standard ethnicity question. Options exactly, in order.
 * Level 4 codes for the tick boxes are [UNCERTAIN] (Stats NZ classification, not re-verified): confirm in Ariā.
 * The "Other" line wording is [UNCERTAIN] between the HISO text and the Census form; override with `otherLabel`.
 * Source: https://tewhatuora.govt.nz/assets/Our-health-system/Digital-health/Health-information-standards/HISO-10001-2017-Ethnicity-Data-Protocols.pdf
 */
export const NZ_ETHNICITY_QUESTION = {
  question: 'Which ethnic group do you belong to?',
  instruction: 'Mark the space or spaces that apply to you.',
  options: [
    { code: '11111', label: 'New Zealand European' },
    { code: '21111', label: 'Māori' },
    { code: '31111', label: 'Samoan' },
    { code: '32100', label: 'Cook Islands Māori' },
    { code: '33111', label: 'Tongan' },
    { code: '34111', label: 'Niuean' },
    { code: '42100', label: 'Chinese' },
    { code: '43100', label: 'Indian' },
  ] as ReadonlyArray<PatientCodedValue>,
  otherLabel: 'Other such as Dutch, Japanese, Tokelauan. Please state:',
  /** Final item in the verbal version. */
  otherLabelVerbal: 'Another ethnic group',
} as const;

/** HISO 10001 level 4 residual codes. */
export const NZ_ETHNICITY_RESIDUAL_CODES: ReadonlyArray<PatientCodedValue> = [
  { code: '94444', label: "Don't know" },
  { code: '95555', label: 'Refused to answer' },
  { code: '96666', label: 'Repeated value' },
  { code: '97777', label: 'Response unidentifiable' },
  { code: '98888', label: 'Response outside scope' },
  { code: '99999', label: 'Not stated' },
];

/** Options offered when nothing has been entered (HISO 10001 electronic collection rules). */
export const NZ_ETHNICITY_NONE_ENTERED_OPTIONS: ReadonlyArray<PatientCodedValue> = [
  { code: '94444', label: "I don't know my ethnicity" },
  { code: '95555', label: 'I do not want to state my ethnicity' },
];

/** Systems record up to six level 4 ethnicity codes (HISO 10001). */
export const NZ_ETHNICITY_MAX_CODES = 6;

/* ------------------------------------------------------------------ */
/* New Zealand: Māori descent and iwi (HISO 10094:2022)               */
/* ------------------------------------------------------------------ */

/**
 * HISO 10094:2022 questions, exact, with the te reo Māori lines from the standard.
 * Source: https://www.tewhatuora.govt.nz/assets/For-the-health-sector/HISO-10094-2022-Maori-Descent-and-Iwi-Affiliation-Data-Protocols.pdf
 */
export const NZ_MAORI_DESCENT_QUESTION = {
  question:
    'Are you descended from Māori (that is, did you have a Māori birth parent, grandparent or great-grandparent, etc)?',
  teReo: 'He tūpuna Māori ōu?',
  /** Options in this order, nothing added. */
  options: [
    { key: 'yes', label: 'Yes' },
    { key: 'dont-know', label: "Don't know" },
    { key: 'no', label: 'No' },
  ],
} as const;
export type MaoriDescentAnswer = 'yes' | 'dont-know' | 'no';

export const NZ_IWI_QUESTION = {
  question: 'Do you know the name(s) of your iwi (tribe or tribes)?',
  teReo: 'Kei te mōhio koe ko wai tō iwi, ō iwi rānei?',
  yesPrompt: 'Name(s) of iwi and rohe/region (if known)',
  guidanceDisclaimer: 'The list is for guidance only. You can enter an iwi that is not on the list.',
} as const;

/** HISO 10094 iwi level 2 residual codes. */
export const NZ_IWI_RESIDUAL_CODES: ReadonlyArray<PatientCodedValue> = [
  { code: '4444', label: "Don't know" },
  { code: '5555', label: 'Refused to answer' },
  { code: '7777', label: 'Other / response unidentifiable' },
  { code: '8888', label: 'Response outside scope' },
  { code: '9999', label: 'Not stated' },
];
