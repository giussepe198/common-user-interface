/**
 * Region wording for the allergy and adverse drug reaction summary and entry dialog.
 * Pure data keyed by region.
 */
import type { ClinicalRegion } from '../../../core/locale';

export interface AdrSummaryWording {
  /** Summary title (RAD terminology rules; NIMC box title; NMC section heading). */
  title: string;
  /** The list named in running text, e.g. in the removal confirmation (RAD-0750.1). */
  listName: string;
  /** Button that opens the entry dialog (RAD-0010.3.3). */
  addLabel: string;
  /** Dialog title for a new entry (RAD-0020). */
  addTitle: string;
  /** Dialog title when editing (RAD-0830). */
  editTitle: string;
  /** Button and phrase for a positively recorded "no known" status (RAD-0760.6, 0770). */
  noKnownButton: string;
  noKnownText: string;
  /** Button and phrase for a positively recorded "unknown" status. Empty when the region has no such state (GB). */
  unknownButton: string;
  unknownText: string;
  /** Shown when nothing has been recorded: styled as a warning, never as "no known" (AU-AL-01, G11 9.2). */
  notRecordedText: string;
  /** Explanation under the not-recorded warning. */
  notRecordedHint: string;
  /** Label of the causative agent field. */
  agentLabel: string;
  /** Label of the reaction types field (RAD-0280.1). */
  reactionsLabel: string;
  /** Heading of existing entries beside the dialog (RAD-0070.2). */
  existingTitle: string;
  /** Purpose prompt in the dialog (RAD-0060.1). */
  prompt: string;
  /** Record the type (allergy or intolerance) and the reaction date (AU-AL-03). */
  recordTypeAndDate: boolean;
  /** Offer the "New this admission" flag (G11 9.2). */
  newThisAdmission: boolean;
  /** "Unknown" needs a reason documented (NZ: document why in the health record). */
  unknownNeedsReason: boolean;
  /** Extra guidance in the dialog [from the national chart guide]. Empty when none. */
  dialogHint: string;
  /** Heading for removed entries (RAD-0710). */
  deactivatedTitle: string;
}

/**
 * GB: CUI Recording Adverse Drug Reaction Risks (RAD-xxxx), docs/guidance-notes/G6-drugadmin-decsupport.md.
 * AU: NIMC allergies box ("Nil known", "Unknown") and EMM business requirements 3.4.
 *   https://www.safetyandquality.gov.au/sites/default/files/migrated/NIMC-User-Guide.pdf
 *   https://www.safetyandquality.gov.au/sites/default/files/2019-08/emm-business-requirements-july_2019_acc_0.pdf
 * NZ: HQSC National Medication Chart user guide, "Allergies & Adverse Reactions" ("No", "Unknown", "New this admission").
 *   https://www.hqsc.govt.nz/assets/Our-work/System-safety/Reducing-harm/Medicines/Publications-resources/NMC_user_guide_update_2021.pdf
 */
export const ADR_SUMMARY_WORDING: Record<ClinicalRegion, AdrSummaryWording> = {
  GB: {
    title: 'Adverse drug reaction summary',
    listName: 'adverse drug reaction summary',
    addLabel: 'Add new drug reaction',
    addTitle: 'Add new drug reaction',
    editTitle: 'Edit drug reaction',
    noKnownButton: 'No known adverse drug reaction risks',
    noKnownText: 'No known adverse drug reaction risks',
    unknownButton: '',
    unknownText: '',
    notRecordedText: 'Adverse drug reaction status not recorded',
    notRecordedHint: 'Ask the patient and record any drug reactions, or record that there are none known.',
    agentLabel: 'Causative agent (drug or substance)',
    reactionsLabel: 'Type(s) of reactions experienced',
    existingTitle: 'Existing adverse drug reactions',
    prompt: 'Entries in the adverse drug reaction summary warn other clinicians before they prescribe or administer these drugs.',
    recordTypeAndDate: false,
    newThisAdmission: false,
    unknownNeedsReason: false,
    dialogHint: '',
    deactivatedTitle: 'Deactivated summaries',
  },
  AU: {
    title: 'Allergies and adverse drug reactions (ADR)',
    listName: 'allergies and adverse drug reactions list',
    addLabel: 'Add allergy or ADR',
    addTitle: 'Add allergy or adverse drug reaction',
    editTitle: 'Edit allergy or adverse drug reaction',
    noKnownButton: 'Nil known',
    noKnownText: 'Nil known',
    unknownButton: 'Unknown',
    unknownText: 'Unknown',
    notRecordedText: 'Not recorded',
    notRecordedHint: 'Allergies and adverse drug reactions have not been recorded. Ask the patient and record them, or record Nil known or Unknown.',
    agentLabel: 'Medicine (or other)',
    reactionsLabel: 'Reaction',
    existingTitle: 'Existing allergies and adverse drug reactions',
    prompt: 'Allergies and adverse drug reactions are shown on every prescribing and administration screen.',
    recordTypeAndDate: true,
    newThisAdmission: false,
    unknownNeedsReason: false,
    dialogHint: '',
    deactivatedTitle: 'Deactivated entries',
  },
  NZ: {
    title: 'Allergies & Adverse Reactions',
    listName: 'allergies and adverse reactions list',
    addLabel: 'Add allergy or adverse reaction',
    addTitle: 'Add allergy or adverse reaction',
    editTitle: 'Edit allergy or adverse reaction',
    noKnownButton: 'No known allergies or adverse reactions',
    noKnownText: 'No known allergies or adverse reactions',
    unknownButton: 'Unknown',
    unknownText: 'Unknown',
    notRecordedText: 'Not recorded',
    notRecordedHint: 'Allergies and adverse reactions have not been recorded. An empty list does not mean there are none.',
    agentLabel: 'Agent (medicine or substance)',
    reactionsLabel: 'Reaction',
    existingTitle: 'Existing allergies and adverse reactions',
    prompt: 'Record the agent and describe the reaction, for example "penicillin – diarrhoea after three days".',
    recordTypeAndDate: false,
    newThisAdmission: true,
    unknownNeedsReason: true,
    dialogHint: 'Anything that caused rash, urticaria, facial or throat swelling, or anaphylaxis is documented as an allergy.',
    deactivatedTitle: 'Deactivated entries',
  },
};
