/**
 * Variations of sex characteristics and sexual orientation question wording and codes (G12 section 7). Pure data.
 * These are sensitive: the components that use them render nothing unless the host enables them.
 */
import type { ClinicalRegion } from '../../../core/locale';
import type { PatientCodedValue } from './demographics';

/** One sensitive question set: question wording, instruction and coded options in order. */
export interface SensitiveQuestionSet {
  question: string;
  /** Interviewer-administered wording, where the standard publishes one. */
  interviewerQuestion?: string;
  instruction?: string;
  /** Form options in order (exact standard labels). */
  options: ReadonlyArray<PatientCodedValue>;
  /** Administrative codes that are recorded but never offered (for display). */
  supplementary: ReadonlyArray<PatientCodedValue>;
  /** Recommended minimum age, if the standard gives one. */
  minimumAge?: number;
  /** Source note shown in documentation. */
  source: string;
}

/**
 * AU: ABS Standard for Sex, Gender, Variations of Sex Characteristics and Sexual Orientation Variables, 2020.
 * Source: https://abs.gov.au/statistics/standards/standard-sex-gender-variations-sex-characteristics-and-sexual-orientation-variables/latest-release
 */
export const AU_VARIATIONS_OF_SEX_CHARACTERISTICS: SensitiveQuestionSet = {
  question: "Were you born with a variation of sex characteristics (sometimes called 'intersex' or 'DSD')?",
  interviewerQuestion: "Were you born with a variation of sex characteristics, sometimes called 'intersex' or 'DSD'?",
  instruction: 'Please select one box:',
  options: [
    { code: '1', altCode: 'Y', label: 'Yes' },
    { code: '2', altCode: 'N', label: 'No' },
    { code: '3', altCode: 'U', label: "Don't know" },
    { code: '4', altCode: 'Z', label: 'Prefer not to answer' },
  ],
  supplementary: [
    { code: '9', label: 'Not stated', formOption: false },
    { code: '0', label: 'Not applicable', formOption: false },
  ],
  source: 'ABS Standard 2020, variations of sex characteristics (Table 5)',
};

/** AU sexual orientation (ABS 2020, Table 6). The alternative Asexual/Pansexual/Queer options have no published codes and are not offered. */
export const AU_SEXUAL_ORIENTATION: SensitiveQuestionSet = {
  question: 'How do you describe your sexual orientation?',
  instruction: 'Please select one box:',
  options: [
    { code: '1', altCode: 'S', label: 'Straight (heterosexual)' },
    { code: '2', altCode: 'G', label: 'Gay or lesbian' },
    { code: '3', altCode: 'B', label: 'Bisexual' },
    { code: '4', altCode: 'T', label: 'I use a different term (please specify)', displayLabel: 'Different term', specify: true },
    { code: '5', altCode: 'U', label: "Don't know" },
    { code: '6', altCode: 'Z', label: 'Prefer not to answer' },
  ],
  supplementary: [
    { code: '9', label: 'Not stated or inadequately described', formOption: false },
    { code: '0', label: 'Not applicable', formOption: false },
  ],
  minimumAge: 15,
  source: 'ABS Standard 2020, sexual orientation (Table 6)',
};

/**
 * NZ: Stats NZ Data standard for gender, sex, and variations of sex characteristics (2021), VSC v1.0.0 input codes.
 * "Prefer not to say" is coded 5 Refused to answer [suggested mapping].
 * Source: https://www.stats.govt.nz/assets/Methods/Data-standards-for-sex-gender-and-variations-on-sex-characteristics/downloads/Data-standard-for-gender-sex-and-variations-of-sex-characteristics.pdf
 */
export const NZ_VARIATIONS_OF_SEX_CHARACTERISTICS: SensitiveQuestionSet = {
  question: 'Were you born with a variation of sex characteristics (otherwise known as an intersex variation)?',
  options: [
    { code: '1', label: 'Yes' },
    { code: '2', label: 'No' },
    { code: '4', label: "Don't know" },
    { code: '5', label: 'Prefer not to say', displayLabel: 'Refused to answer' },
  ],
  supplementary: [
    { code: '7', label: 'Response unidentifiable', formOption: false },
    { code: '8', label: 'Response outside scope', formOption: false },
    { code: '9', label: 'Not stated', formOption: false },
  ],
  source: 'Stats NZ 2021, VSC v1.0.0',
};

/**
 * NZ: Stats NZ Statistical standard for sexual identity (2019), SCSI v1.0, example question 2. The mapping of the example
 * options to classification codes is [suggested] (the standard does not code the example).
 * Source: https://www.stats.govt.nz/assets/News/Sexual-identity-standard.pdf
 */
export const NZ_SEXUAL_IDENTITY: SensitiveQuestionSet = {
  question: 'Which of the following options best describes how you think of yourself?',
  options: [
    { code: '01', label: 'Heterosexual or straight' },
    { code: '02', label: 'Gay or lesbian' },
    { code: '03', label: 'Bisexual' },
    { code: '09', label: 'Other, please state', displayLabel: 'Other', specify: true },
    { code: '44', label: "Don't know" },
    { code: '55', label: 'Prefer not to say', displayLabel: 'Refused to answer' },
  ],
  supplementary: [
    { code: '77', label: 'Response unidentifiable', formOption: false },
    { code: '88', label: 'Response outside scope', formOption: false },
    { code: '99', label: 'Not stated', formOption: false },
  ],
  minimumAge: 15,
  source: 'Stats NZ 2019, SCSI v1.0',
};

/** Topics of the sensitive questions. */
export type SensitiveCharacteristicTopic = 'variations-of-sex-characteristics' | 'sexual-orientation';

/** Question sets per region. GB has none configured (the NHS CUI guidance does not cover these questions). */
export const SENSITIVE_QUESTION_SETS: Record<ClinicalRegion, Partial<Record<SensitiveCharacteristicTopic, SensitiveQuestionSet>>> = {
  GB: {},
  AU: { 'variations-of-sex-characteristics': AU_VARIATIONS_OF_SEX_CHARACTERISTICS, 'sexual-orientation': AU_SEXUAL_ORIENTATION },
  NZ: { 'variations-of-sex-characteristics': NZ_VARIATIONS_OF_SEX_CHARACTERISTICS, 'sexual-orientation': NZ_SEXUAL_IDENTITY },
};

/** Default display labels for the topics. NZ uses the Stats NZ term "Sexual identity". */
export const SENSITIVE_TOPIC_LABELS: Record<ClinicalRegion, Record<SensitiveCharacteristicTopic, string>> = {
  GB: { 'variations-of-sex-characteristics': 'Variations of sex characteristics', 'sexual-orientation': 'Sexual orientation' },
  AU: { 'variations-of-sex-characteristics': 'Variations of sex characteristics', 'sexual-orientation': 'Sexual orientation' },
  NZ: { 'variations-of-sex-characteristics': 'Variations of sex characteristics', 'sexual-orientation': 'Sexual identity' },
};

/** Text marking the data as sensitive [suggested]. */
export const SENSITIVE_MARKER_TEXT = 'Sensitive';

/** Label for a stored code in a question set (display label first), or null when the code is not in the set. */
export function sensitiveCodeLabel(set: SensitiveQuestionSet | undefined, code: string | null | undefined): string | null {
  if (!set || code == null || code === '') return null;
  const v = [...set.options, ...set.supplementary].find((o) => o.code === code || o.altCode === code);
  return v ? v.displayLabel ?? v.label : null;
}
