/**
 * Reason code choice ("why was it not given?", B3). Pure functions, no React.
 * The code list is data from the consumer. The shape is compatible with the administration area's
 * AdminReasonCode (adminReasonCodes(region)), so those lists can be passed straight in.
 */

/** An extra checkbox prompt shown when a code is chosen, e.g. "Prescriber notified". */
export interface ReasonCodePrompt {
  id: string;
  label: string;
  /** Must be ticked before the choice is complete. Default false [suggested]. */
  required?: boolean;
}

/** One code and its meaning. */
export interface ReasonCodeOption {
  /** Code, e.g. "W" (AU NIMC) or "RV" (NZ NMC). */
  code: string;
  /** Meaning shown with the code, e.g. "Withheld". */
  label: string;
  /** Fuller wording, shown under the label when chosen, e.g. "Withheld – enter reason in clinical record". */
  legend?: string;
  /** Extra instruction shown when chosen. */
  hint?: string;
  /** Show the code letters. Default true. GB lists set this false (no code set in the guidance). */
  showCode?: boolean;
  /** A written reason is required for this code (AU-MD-09; NZ NMC Figure 22). */
  requiresReason?: boolean;
  /** Adds a "Prescriber notified" prompt (AU-MD-09; NZ "Prescriber must be informed"). */
  notifyPrescriber?: boolean;
  /** Extra prompts for this code. */
  prompts?: ReasonCodePrompt[];
  disabled?: boolean;
}

/** What the person has chosen. */
export interface ReasonCodeValue {
  code: string | null;
  /** Free-text reason. */
  reason: string;
  /** Ticked prompts by id. */
  prompts: Record<string, boolean>;
}

export const EMPTY_REASON_CODE_VALUE: ReasonCodeValue = { code: null, reason: '', prompts: {} };

/** Id of the prompt added for `notifyPrescriber`. */
export const PRESCRIBER_NOTIFIED_PROMPT_ID = 'prescriberNotified';

/** Prompts for an option: its own prompts, plus "Prescriber notified" when `notifyPrescriber` is set. */
export function reasonCodePrompts(option: ReasonCodeOption | undefined, opts: { prescriberPromptLabel?: string; requirePrescriberPrompt?: boolean } = {}): ReasonCodePrompt[] {
  if (!option) return [];
  const out = [...(option.prompts ?? [])];
  if (option.notifyPrescriber && !out.some(p => p.id === PRESCRIBER_NOTIFIED_PROMPT_ID)) {
    out.push({ id: PRESCRIBER_NOTIFIED_PROMPT_ID, label: opts.prescriberPromptLabel ?? 'Prescriber notified', required: opts.requirePrescriberPrompt ?? false });
  }
  return out;
}

/** A problem that blocks recording. `field` says where to show it. */
export interface ReasonCodeProblem {
  field: 'code' | 'reason' | 'prompt';
  promptId?: string;
  message: string;
}

/** Problems with a choice; empty when it can be recorded. */
export function reasonCodeProblems(
  options: ReasonCodeOption[],
  value: ReasonCodeValue,
  opts: { prescriberPromptLabel?: string; requirePrescriberPrompt?: boolean; codeName?: string } = {},
): ReasonCodeProblem[] {
  const option = options.find(o => o.code === value.code);
  if (!option) return [{ field: 'code', message: `Choose a ${opts.codeName ?? 'reason'}.` }];
  const out: ReasonCodeProblem[] = [];
  if (option.requiresReason && !value.reason.trim()) {
    const which = option.showCode === false ? option.label : `${option.code}: ${option.label}`;
    out.push({ field: 'reason', message: `Enter a reason. A reason is required for ${which}.` });
  }
  for (const p of reasonCodePrompts(option, opts)) {
    if (p.required && !value.prompts[p.id]) out.push({ field: 'prompt', promptId: p.id, message: `Confirm: ${p.label}.` });
  }
  return out;
}

/** Label for the commit button, e.g. "Record W: Withheld" (B3), or "Record Patient refused" when codes are hidden. */
export function reasonCodeCommitLabel(option: ReasonCodeOption | undefined, verb = 'Record'): string {
  if (!option) return verb;
  return option.showCode === false ? `${verb} ${option.label}` : `${verb} ${option.code}: ${option.label}`;
}
