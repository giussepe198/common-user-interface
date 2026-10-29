/**
 * Region-aware helpers for drug administration (G10 9.6, G11 8.2). Pure functions, region passed
 * explicitly and defaulting to GB.
 */
import type { ClinicalRegion } from '../../core/locale';
import type { AdminMedicationKind, AdminStatus} from './adminEvents';
import { ADMIN_STATUS_LABELS, adminIsAsRequired, adminIsGivenStatus } from './adminEvents';
import type { AdminReasonCode } from './regions/administration';
import { ADMIN_AVOID_MIDNIGHT, ADMIN_CHART_WORDING, ADMIN_REASON_CODES } from './regions/administration';

export type { AdminReasonCode, AdminChartWording } from './regions/administration';
export { ADMIN_REASON_CODES, ADMIN_CHART_WORDING, ADMIN_AVOID_MIDNIGHT } from './regions/administration';

/** Reason codes offered in a region. Paediatric-only codes (AU circled P) only when `paediatric` is true. */
export function adminReasonCodes(region: ClinicalRegion = 'GB', opts: { paediatric?: boolean } = {}): AdminReasonCode[] {
  return ADMIN_REASON_CODES[region].filter(c => !c.paediatricOnly || opts.paediatric);
}

/** Look up a code in a region (case-insensitive). */
export function adminFindReasonCode(code: string | undefined, region: ClinicalRegion = 'GB'): AdminReasonCode | undefined {
  if (!code) return undefined;
  const c = code.trim().toUpperCase();
  return ADMIN_REASON_CODES[region].find(r => r.code.toUpperCase() === c);
}

/** First regional code whose status matches, for events recorded without a code. */
export function adminReasonCodeForStatus(status: AdminStatus | undefined, region: ClinicalRegion = 'GB'): AdminReasonCode | undefined {
  if (!status) return undefined;
  return ADMIN_REASON_CODES[region].find(r => r.status === status);
}

/**
 * Text label of a recorded status. AU and NZ show the code and its meaning together, e.g. "W Withheld"
 * (AU-MD-08, G11 8.2); GB shows the status label as before.
 */
export function adminRegionalStatusLabel(status: AdminStatus, reasonCode?: string, region: ClinicalRegion = 'GB'): string {
  if (region === 'GB') return ADMIN_STATUS_LABELS[status];
  const code = adminFindReasonCode(reasonCode, region);
  if (code) return `${code.code} ${code.label}`;
  return ADMIN_STATUS_LABELS[status];
}

/** Full legend meaning for a code, e.g. "Withheld – enter reason in clinical record". */
export function adminReasonLegend(reasonCode: string | undefined, region: ClinicalRegion = 'GB'): string | undefined {
  return adminFindReasonCode(reasonCode, region)?.legend;
}

/** GB glyphs drawn inside recorded icons [suggested] (docs/DECISIONS.md). */
const GB_GLYPH: Record<AdminStatus, string> = {
  given: 'check',
  givenLate: 'L',
  givenEarly: 'E',
  givenOnceOnly: 'check',
  selfAdministered: 'S',
  patientRefused: 'R',
  patientAbsent: 'A',
  otherClinicalReason: 'C',
  drugUnavailable: 'U',
  nilByMouth: 'N',
  drugFreeInterval: 'F',
  deferred: 'D',
  withheld: 'W',
  carerAdministered: 'P',
  unknown: '?',
};

/**
 * Glyph drawn inside a recorded event icon: 'check' for a tick, otherwise letters. AU and NZ use the
 * national code so letters never clash with the chart legend (for example AU "L" means On leave, so a
 * late dose shows a tick with the label "Given late").
 */
export function adminEventGlyph(status: AdminStatus, reasonCode?: string, region: ClinicalRegion = 'GB'): string {
  if (region === 'GB') return GB_GLYPH[status];
  const code = adminFindReasonCode(reasonCode, region);
  if (code) return code.code;
  if (status === 'unknown') return '?';
  if (adminIsGivenStatus(status)) {
    const own = adminReasonCodeForStatus(status, region);
    return status === 'selfAdministered' || status === 'carerAdministered' ? own?.code ?? 'check' : 'check';
  }
  return adminReasonCodeForStatus(status, region)?.code ?? '?';
}

/** Kind label shown in addition to the frequency text (MEDa-0224, 0225), worded per region. */
export function adminKindLabelFor(kind: AdminMedicationKind, region: ClinicalRegion = 'GB'): string {
  const w = ADMIN_CHART_WORDING[region];
  if (kind === 'onceOnly') return w.onceOnly;
  if (adminIsAsRequired(kind)) return w.asRequired;
  if (kind === 'significantDuration') return w.significantDuration;
  return '';
}

/**
 * AU only: note for scheduled times at midnight ("00:00" or "24:00"). The NIMC prints 2400 for 6 hourly
 * doses, but the 2024 recommendations say avoid midnight. Returns null when no note is needed.
 */
export function adminMidnightScheduleNote(times: readonly string[] | undefined, region: ClinicalRegion = 'GB'): string | null {
  if (!ADMIN_AVOID_MIDNIGHT[region] || !times?.length) return null;
  const hit = times.some(t => /^(0?0|24):00$/.test(t.trim()));
  if (!hit) return null;
  return 'Scheduled at midnight. Avoid midnight times where possible (for example 23:30); a 00:00 dose belongs to the next day.';
}
