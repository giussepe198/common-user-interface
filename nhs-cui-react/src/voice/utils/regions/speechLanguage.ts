import type { ClinicalRegion } from '../../../core';

/**
 * Recognition language per region (BCP 47), matching the core locale's language. Source: IETF BCP 47 / IANA
 * language subtag registry, https://www.iana.org/assignments/language-subtag-registry (en-GB, en-AU, en-NZ).
 * Engines that do not support en-NZ fall back as the engine decides; the adapter never changes the tag silently.
 */
export const VOICE_SPEECH_LANGUAGES: Record<ClinicalRegion, 'en-GB' | 'en-AU' | 'en-NZ'> = {
  GB: 'en-GB',
  AU: 'en-AU',
  NZ: 'en-NZ',
};

/** Recognition language for a region. */
export function speechLanguageForRegion(region: ClinicalRegion = 'GB'): 'en-GB' | 'en-AU' | 'en-NZ' {
  return VOICE_SPEECH_LANGUAGES[region];
}
