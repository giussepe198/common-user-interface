/**
 * Choosing the display term of a concept from its descriptions, by language reference set per
 * region (SCT-007 for GB; G10 section 11 for AU; G11 section 10 for NZ). Pure functions.
 */
import type { ClinicalRegion } from '../../core';
import { SNOMED_EDITIONS, type SnomedEditionInfo } from './regions/terminology';
import { stripSemanticTag } from './termResults';

/** One description of a concept as supplied by the consumer's terminology server. */
export interface TermDescription {
  /** The description text, with macrons and other diacritics as published. */
  term: string;
  /** 'fsn' descriptions are never chosen as the display term while another exists. */
  type: 'fsn' | 'synonym' | 'preferred';
  /** Language code of the description, e.g. "en", "en-GB", "mi". */
  lang?: string;
  /** Acceptability per language reference set id: 'preferred' or 'acceptable'. */
  acceptability?: Readonly<Record<string, 'preferred' | 'acceptable'>>;
}

export interface PreferredTermOptions {
  /** Region whose edition supplies the reference sets. Default 'GB'. */
  region?: ClinicalRegion;
  /** 'clinician' (default) uses the clinical language reference set; 'consumer' tries consumer-friendly sets first. */
  audience?: 'clinician' | 'consumer';
  /** Language of consumer terms to prefer, e.g. 'mi' for te reo Māori (NZ only). Default: English. */
  consumerLanguage?: string;
  /** Edition data to use instead of the built-in one. */
  edition?: SnomedEditionInfo;
  /** Reference set ids to try first, before the edition's defaults. */
  refsetOrder?: readonly string[];
}

export interface PreferredTermChoice {
  /** The display term, unchanged (macrons kept). */
  term: string;
  /** The reference set that supplied it, or undefined when chosen by language fallback. */
  refsetId?: string;
  /** Language of the chosen term (used for `lang` attributes, e.g. "mi"). */
  lang?: string;
  /** True when only the FSN was available (its semantic tag is removed). */
  fromFsn: boolean;
}

/** Reference sets in the order they are tried for a region and audience. */
export function languageRefsetOrder(options: PreferredTermOptions = {}): string[] {
  const edition = options.edition ?? SNOMED_EDITIONS[options.region ?? 'GB'];
  const order: string[] = [...(options.refsetOrder ?? [])];
  if (options.audience === 'consumer') {
    const consumer = [...edition.consumerRefsets];
    const wanted = options.consumerLanguage;
    consumer.sort((a, b) => Number(b.lang === wanted) - Number(a.lang === wanted) || Number(a.lang === 'mi') - Number(b.lang === 'mi'));
    for (const r of consumer) if (wanted === 'mi' || r.lang !== 'mi') order.push(r.id);
  }
  order.push(edition.clinicianRefset.id);
  return Array.from(new Set(order));
}

/**
 * Pick the display term: the description marked preferred in the first reference set of the region's
 * order; then (SCT-007) by language fallback (GB: en-GB, en, en-US); never the FSN while another
 * description exists. Returns undefined for an empty list. Terms are returned exactly as supplied.
 */
export function selectPreferredTerm(descriptions: readonly TermDescription[], options: PreferredTermOptions = {}): PreferredTermChoice | undefined {
  if (!descriptions.length) return undefined;
  const edition = options.edition ?? SNOMED_EDITIONS[options.region ?? 'GB'];
  const nonFsn = descriptions.filter((d) => d.type !== 'fsn');
  for (const refsetId of languageRefsetOrder({ ...options, edition })) {
    const hit = nonFsn.find((d) => d.acceptability?.[refsetId] === 'preferred');
    if (hit) return { term: hit.term, refsetId, lang: hit.lang, fromFsn: false };
  }
  for (const lang of edition.languageFallback) {
    const hit = nonFsn.find((d) => d.type === 'preferred' && (d.lang ?? 'en') === lang) ?? nonFsn.find((d) => (d.lang ?? 'en') === lang && d.type !== 'synonym');
    if (hit) return { term: hit.term, lang: hit.lang, fromFsn: false };
  }
  const anyPreferred = nonFsn.find((d) => d.type === 'preferred') ?? nonFsn[0];
  if (anyPreferred) return { term: anyPreferred.term, lang: anyPreferred.lang, fromFsn: false };
  const fsn = descriptions[0];
  return { term: stripSemanticTag(fsn.term), lang: fsn.lang, fromFsn: true };
}

/**
 * The consumer-friendly term in a given language, if the descriptions carry one (NZ te reo Māori
 * patient and consumer friendly terms, trial use). Undefined when none.
 */
export function selectConsumerTerm(descriptions: readonly TermDescription[], lang: string, options: Omit<PreferredTermOptions, 'audience' | 'consumerLanguage'> = {}): PreferredTermChoice | undefined {
  const edition = options.edition ?? SNOMED_EDITIONS[options.region ?? 'GB'];
  for (const r of edition.consumerRefsets.filter((x) => x.lang === lang)) {
    const hit = descriptions.find((d) => d.type !== 'fsn' && d.acceptability?.[r.id] === 'preferred');
    if (hit) return { term: hit.term, refsetId: r.id, lang: hit.lang ?? r.lang, fromFsn: false };
  }
  return undefined;
}
