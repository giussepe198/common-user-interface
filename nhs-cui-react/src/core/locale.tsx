import React, { createContext, useContext, useMemo } from 'react';

/**
 * Jurisdiction whose standards a control follows.
 * GB: NHS CUI as written. AU: ACSQHC, ADHA, ABS/METeOR, Australia Post. NZ: HISO, HQSC, Stats NZ, NZ Post.
 * See docs/guidance-notes/G10-australia.md and G11-new-zealand.md.
 */
export type ClinicalRegion = 'GB' | 'AU' | 'NZ';

export interface ClinicalLocale {
  region: ClinicalRegion;
  /** IANA time zone used for "now", daylight-saving notices and scheduling. */
  timeZone: string;
  /** BCP 47 tag for the region's English. */
  language: 'en-GB' | 'en-AU' | 'en-NZ';
  /** NZ only: show te reo Māori labels alongside English where a standard value set defines them. */
  teReoLabels: boolean;
}

export const DEFAULT_TIME_ZONES: Record<ClinicalRegion, string> = {
  GB: 'Europe/London',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
};

const LANGUAGE: Record<ClinicalRegion, ClinicalLocale['language']> = { GB: 'en-GB', AU: 'en-AU', NZ: 'en-NZ' };

export function makeClinicalLocale(region: ClinicalRegion = 'GB', overrides: Partial<Omit<ClinicalLocale, 'region'>> = {}): ClinicalLocale {
  return { region, timeZone: DEFAULT_TIME_ZONES[region], language: LANGUAGE[region], teReoLabels: false, ...overrides };
}

const LocaleContext = createContext<ClinicalLocale>(makeClinicalLocale('GB'));

export interface ClinicalLocaleProviderProps {
  region: ClinicalRegion;
  /** Defaults per region: Europe/London, Australia/Sydney, Pacific/Auckland. Use e.g. Australia/Brisbane, Australia/Perth, Pacific/Chatham as needed. */
  timeZone?: string;
  teReoLabels?: boolean;
  children: React.ReactNode;
}

/** Sets the jurisdiction for every control below it. Controls also accept a `region` prop that overrides this. */
export function ClinicalLocaleProvider({ region, timeZone, teReoLabels, children }: ClinicalLocaleProviderProps) {
  const value = useMemo(
    () => makeClinicalLocale(region, { ...(timeZone ? { timeZone } : {}), ...(teReoLabels != null ? { teReoLabels } : {}) }),
    [region, timeZone, teReoLabels],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Current locale; a component's own `region` prop wins over the provider. */
export function useClinicalLocale(regionOverride?: ClinicalRegion): ClinicalLocale {
  const ctx = useContext(LocaleContext);
  return useMemo(
    () => (regionOverride && regionOverride !== ctx.region ? makeClinicalLocale(regionOverride) : ctx),
    [ctx, regionOverride],
  );
}
