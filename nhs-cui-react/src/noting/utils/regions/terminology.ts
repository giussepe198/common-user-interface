/**
 * Terminology edition data per region. Pure data, no React.
 *
 * Every identifier below is configurable: pass overrides to the components (`edition` prop) or to
 * `terminologyEditionFor`. Identifiers marked UNCERTAIN must be checked against the current release
 * notes of the national release centre before production use.
 */
import type { ClinicalRegion } from '../../../core';

/** A named language reference set used to choose display terms. */
export interface LanguageRefsetInfo {
  /** Reference set identifier (SCTID). Never displayed. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Audience: clinicians, or patients and consumers (portals, personal health apps). */
  audience: 'clinician' | 'consumer';
  /** BCP 47 language of the terms, e.g. "en-NZ" or "mi" (te reo Māori). */
  lang: string;
  /** True when the identifier is inferred rather than taken from a verified source. */
  uncertain?: boolean;
}

/** A subset, reference set or value set the search can be limited to. */
export interface TerminologySubsetInfo {
  /** Identifier passed to the search (refset SCTID, or FHIR ValueSet canonical URL). */
  id: string;
  /** Human-readable label (SubsetFilterControl shows it; Matching 2.4.1 human-readable labels). */
  label: string;
  /** Free text description for the filter panel. */
  description?: string;
}

/** Which edition of the terminology the controls work against. Display metadata plus search hooks. */
export interface SnomedEditionInfo {
  region: ClinicalRegion;
  /** Short label for display. Deliberately avoids the phrase "SNOMED CT" (Clinical statements: never show it on screen). */
  label: string;
  /** Full name for documentation and tooltips. */
  name: string;
  /** Edition URI as used in FHIR `system`/`version` parameters, e.g. http://snomed.info/sct/32506021000036107. */
  editionUri: string;
  /** Module identifier of the national extension. */
  moduleId: string;
  /** Release centre that publishes the edition. */
  publisher: string;
  /** Web address of the release centre. */
  publisherUrl: string;
  /** Release cycle, for the edition note. */
  releaseCycle: string;
  /** National medicines terminology bound for medicine selection. */
  medicinesTerminology: 'dm+d' | 'AMT' | 'NZMT';
  /** Clinician language reference set: preferred terms are chosen from it (AU 11, NZ 10). */
  clinicianRefset: LanguageRefsetInfo;
  /** Consumer-friendly reference sets in order of preference (NZ 10). */
  consumerRefsets: LanguageRefsetInfo[];
  /** Language fallback order when descriptions carry no reference set data (SCT-007 for GB). */
  languageFallback: string[];
  /** Named subsets or value sets offered by default in subset filters. Empty means "no default". */
  defaultSubsets: TerminologySubsetInfo[];
  /** Fields whose values are not verified. Documented in READMEs. */
  uncertain: string[];
}

/**
 * GB: SCT-001 (current UK Edition: International core plus UK Clinical and UK Drug extensions),
 * SCT-007 language rule (en-GB preferred), Matching 2.4 global filters.
 * Source: docs/guidance-notes/G8-terminology.md (SCT-001, SCT-007).
 * Edition URI, module and refset identifiers are UNCERTAIN (domain knowledge, not in the notes).
 * https://digital.nhs.uk/services/terminology-and-classifications/snomed-ct
 */
const GB: SnomedEditionInfo = {
  region: 'GB',
  label: 'UK Edition',
  name: 'SNOMED CT UK Edition (International core, UK Clinical and UK Drug extensions)',
  editionUri: 'http://snomed.info/sct/83821000000107',
  moduleId: '999000011000000103',
  publisher: 'NHS England, UK Terminology Centre',
  publisherUrl: 'https://digital.nhs.uk/services/terminology-and-classifications/snomed-ct',
  releaseCycle: 'Monthly; update within 180 days of release (SCT-001)',
  medicinesTerminology: 'dm+d',
  clinicianRefset: { id: '999001261000000100', name: 'UK English clinical language reference set', audience: 'clinician', lang: 'en-GB', uncertain: true },
  consumerRefsets: [],
  languageFallback: ['en-GB', 'en', 'en-US'],
  defaultSubsets: [],
  uncertain: ['editionUri', 'moduleId', 'clinicianRefset.id'],
};

/**
 * AU: SNOMED CT-AU from the National Clinical Terminology Service (NCTS), monthly, AMT included.
 * Source: docs/guidance-notes/G10-australia.md section 11 (AU-TM-01, AU-TM-02).
 * https://www.healthterminologies.gov.au
 * Module and language reference set identifiers are marked UNCERTAIN in the notes.
 * Allergy value sets: HL7 AU Core AllergyIntolerance (VERIFIED in G10 section 10).
 * https://hl7.org.au/fhir/core/2.0.0-ballot/StructureDefinition-au-core-allergyintolerance.html
 */
const AU: SnomedEditionInfo = {
  region: 'AU',
  label: 'Australian edition (NCTS)',
  name: 'SNOMED CT-AU, National Clinical Terminology Service',
  editionUri: 'http://snomed.info/sct/32506021000036107',
  moduleId: '32506021000036107',
  publisher: 'Australian Digital Health Agency, National Clinical Terminology Service',
  publisherUrl: 'https://www.healthterminologies.gov.au',
  releaseCycle: 'Monthly',
  medicinesTerminology: 'AMT',
  clinicianRefset: { id: '32570271000036106', name: 'Australian English language reference set', audience: 'clinician', lang: 'en-AU', uncertain: true },
  consumerRefsets: [],
  languageFallback: ['en-AU', 'en-GB', 'en', 'en-US'],
  defaultSubsets: [
    {
      id: 'https://healthterminologies.gov.au/fhir/ValueSet/indicator-hypersensitivity-intolerance-to-substance-2',
      label: 'Hypersensitivity or intolerance to substance',
      description: 'NCTS value set used by AU Core AllergyIntolerance.code',
    },
    {
      id: 'https://healthterminologies.gov.au/fhir/ValueSet/adverse-reaction-substances-and-negated-findings-1',
      label: 'Adverse reaction substances and negated findings',
      description: 'NCTS candidate value set for allergy recording',
    },
  ],
  uncertain: ['moduleId', 'clinicianRefset.id', 'languageFallback'],
};

/**
 * NZ: SNOMED CT NZ Edition, released April and October by the NZ National Release Centre (Health NZ).
 * Source: docs/guidance-notes/G11-new-zealand.md section 10 (S19), section 11.1 (macrons).
 * https://www.tewhatuora.govt.nz/our-health-system/digital-health/snomed-ct-national-release-centre/new-zealand-edition-of-snomed-ct
 * The NZ language reference sets exist (S19); their SCTIDs, the module id and the edition URI are
 * UNCERTAIN (namespace 1000210 inferred from SCTID structure in the notes).
 */
const NZ: SnomedEditionInfo = {
  region: 'NZ',
  label: 'NZ Edition',
  name: 'SNOMED CT New Zealand Edition',
  editionUri: 'http://snomed.info/sct/21000210109',
  moduleId: '21000210109',
  publisher: 'Health New Zealand | Te Whatu Ora, NZ National Release Centre',
  publisherUrl: 'https://www.tewhatuora.govt.nz/our-health-system/digital-health/snomed-ct-national-release-centre/new-zealand-edition-of-snomed-ct',
  releaseCycle: 'April and October',
  medicinesTerminology: 'NZMT',
  clinicianRefset: { id: '271000210107', name: 'NZ English language reference set', audience: 'clinician', lang: 'en-NZ', uncertain: true },
  consumerRefsets: [
    { id: '291000210106', name: 'Te reo Māori patient and consumer friendly terms', audience: 'consumer', lang: 'mi', uncertain: true },
    { id: '281000210109', name: 'NZ English patient and consumer friendly terms', audience: 'consumer', lang: 'en-NZ', uncertain: true },
  ],
  languageFallback: ['en-NZ', 'en-GB', 'en', 'en-US'],
  defaultSubsets: [
    { id: 'nz-adverse-reaction-manifestation', label: 'Adverse reaction manifestation', description: 'NZ Edition reference set (S19); set the SCTID from the release' },
    { id: 'nz-common-edible-allergens', label: 'Common edible substance allergens', description: 'NZ Edition reference set (S19); set the SCTID from the release' },
  ],
  uncertain: ['editionUri', 'moduleId', 'clinicianRefset.id', 'consumerRefsets[].id', 'defaultSubsets[].id'],
};

/** Edition metadata keyed by region. */
export const SNOMED_EDITIONS: Readonly<Record<ClinicalRegion, SnomedEditionInfo>> = { GB, AU, NZ };

/** Edition for a region with optional overrides (e.g. verified identifiers from the current release). */
export function terminologyEditionFor(region: ClinicalRegion = 'GB', overrides: Partial<SnomedEditionInfo> = {}): SnomedEditionInfo {
  return { ...SNOMED_EDITIONS[region], ...overrides, region };
}
