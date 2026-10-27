/**
 * Time zone abbreviations and names per IANA zone, keyed by UTC offset in minutes.
 * Used to label times (02:30 AEDT, 02:30 NZST) and to word daylight saving notices.
 * Offsets themselves always come from the platform's Intl time zone data; this table only names them.
 */
import type { ClinicalRegion } from '../../../core/locale';

export interface ZoneOffsetName {
  /** UTC offset in minutes, e.g. 600 for UTC+10:00. */
  offset: number;
  /** Abbreviation shown after a time, e.g. "AEST". */
  abbreviation: string;
  /** Full name for screen readers and tooltips, e.g. "Australian Eastern Standard Time". */
  name: string;
}

export interface ZoneNaming {
  standard: ZoneOffsetName;
  /** Absent for zones without daylight saving (Brisbane, Darwin, Perth). */
  daylight?: ZoneOffsetName;
  /** Abbreviation is not official (e.g. ACWST for Eucla). Shown as given; documented in the README. */
  unofficial?: boolean;
}

const zn = (offset: number, abbreviation: string, name: string): ZoneOffsetName => ({ offset, abbreviation, name });

const AEST = zn(600, 'AEST', 'Australian Eastern Standard Time');
const AEDT = zn(660, 'AEDT', 'Australian Eastern Daylight Time');
const ACST = zn(570, 'ACST', 'Australian Central Standard Time');
const ACDT = zn(630, 'ACDT', 'Australian Central Daylight Time');

/**
 * GB: UK Government, "When do the clocks change?" https://www.gov.uk/when-do-the-clocks-change
 * AU: G10-australia.md section 8.3 (zone table; offsets [UNCERTAIN] in the note, consistent with IANA tzdb);
 *     DST rule https://business.vic.gov.au/business-information/daylight-saving
 * NZ: G11-new-zealand.md section 7.2; DIA daylight saving release
 *     https://dia.govt.nz/press.nsf/d77da9b523f12931cc256ac5000d19b6/edd6f9e847da76fbcc2585ed00820798!OpenDocument
 */
export const TIME_ZONE_NAMES: Record<string, ZoneNaming> = {
  'Europe/London': { standard: zn(0, 'GMT', 'Greenwich Mean Time'), daylight: zn(60, 'BST', 'British Summer Time') },
  'Australia/Sydney': { standard: AEST, daylight: AEDT },
  'Australia/Melbourne': { standard: AEST, daylight: AEDT },
  'Australia/Hobart': { standard: AEST, daylight: AEDT },
  'Australia/Canberra': { standard: AEST, daylight: AEDT },
  'Australia/ACT': { standard: AEST, daylight: AEDT },
  'Australia/NSW': { standard: AEST, daylight: AEDT },
  'Australia/Victoria': { standard: AEST, daylight: AEDT },
  'Australia/Tasmania': { standard: AEST, daylight: AEDT },
  'Australia/Brisbane': { standard: AEST },
  'Australia/Queensland': { standard: AEST },
  'Australia/Lindeman': { standard: AEST },
  'Australia/Adelaide': { standard: ACST, daylight: ACDT },
  'Australia/South': { standard: ACST, daylight: ACDT },
  'Australia/Broken_Hill': { standard: ACST, daylight: ACDT },
  'Australia/Darwin': { standard: ACST },
  'Australia/North': { standard: ACST },
  'Australia/Perth': { standard: zn(480, 'AWST', 'Australian Western Standard Time') },
  'Australia/West': { standard: zn(480, 'AWST', 'Australian Western Standard Time') },
  'Australia/Eucla': { standard: zn(525, 'ACWST', 'Australian Central Western Standard Time'), unofficial: true },
  'Australia/Lord_Howe': { standard: zn(630, 'LHST', 'Lord Howe Standard Time'), daylight: zn(660, 'LHDT', 'Lord Howe Daylight Time') },
  'Pacific/Norfolk': { standard: zn(660, 'NFT', 'Norfolk Island Time'), daylight: zn(720, 'NFDT', 'Norfolk Island Daylight Time') },
  'Indian/Christmas': { standard: zn(420, 'CXT', 'Christmas Island Time') },
  'Indian/Cocos': { standard: zn(390, 'CCT', 'Cocos Islands Time') },
  'Pacific/Auckland': { standard: zn(720, 'NZST', 'New Zealand Standard Time'), daylight: zn(780, 'NZDT', 'New Zealand Daylight Time') },
  'NZ': { standard: zn(720, 'NZST', 'New Zealand Standard Time'), daylight: zn(780, 'NZDT', 'New Zealand Daylight Time') },
  'Pacific/Chatham': { standard: zn(765, 'CHAST', 'Chatham Standard Time'), daylight: zn(825, 'CHADT', 'Chatham Daylight Time') },
};

/** Zones offered for each region (e.g. in pickers or previews). First is the region default. */
export const REGION_TIME_ZONES: Record<ClinicalRegion, string[]> = {
  GB: ['Europe/London'],
  AU: [
    'Australia/Sydney', 'Australia/Melbourne', 'Australia/Hobart', 'Australia/Brisbane', 'Australia/Adelaide',
    'Australia/Broken_Hill', 'Australia/Darwin', 'Australia/Perth', 'Australia/Eucla', 'Australia/Lord_Howe',
    'Pacific/Norfolk', 'Indian/Christmas', 'Indian/Cocos',
  ],
  NZ: ['Pacific/Auckland', 'Pacific/Chatham'],
};
