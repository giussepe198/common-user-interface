/**
 * Early warning wording for the mobile summary card (concept A1). Pure functions over the lists scoring result: the
 * chart's own response labels are used, never a parameter-level zone name.
 */
import { ewsZone, type EwsChartDefinition, type EwsResult } from '../../lists';

/**
 * The headline for an early warning result: the chart's triggered response label (e.g. NEWS2 "Medium (score 5–6)",
 * NZEWS "EWS 6–7"), prefixed with the zone name when the chart names zones by colour and the label does not already
 * say it (e.g. "Orange zone: EWS 6–7"), so the colour is never the only cue. Parameter-score zone names such as the
 * NEWS2 "Score 2" are never used for the total. Without a response, the zone label.
 */
export function mobileEwsHeadline(def: EwsChartDefinition, result: Pick<EwsResult, 'zone' | 'response'>): string {
  const zone = ewsZone(def, result.zone);
  const response = result.response;
  if (!response) return zone.label;
  const label = response.label;
  if (zone.rank === 0 || /^score\b/i.test(zone.label)) return label;
  const lower = label.toLowerCase();
  const zoneWord = zone.label.toLowerCase();
  if (lower.includes(zoneWord) || lower.includes(zone.id.toLowerCase())) return label;
  return `${zone.label}: ${label}`;
}
