import React from 'react';
import { cx, Icon, useClinicalLocale } from '../../core';
import type { ClinicalRegion } from '../../core';
import { SENSITIVE_MARKER_TEXT, SENSITIVE_QUESTION_SETS, SENSITIVE_TOPIC_LABELS, sensitiveCodeLabel } from '../utils/regions/sensitive';
import type { SensitiveCharacteristicTopic, SensitiveQuestionSet } from '../utils/regions/sensitive';
import type { SensitiveCharacteristicValue } from '../SensitiveCharacteristicInput/SensitiveCharacteristicInput';

export interface SensitiveCharacteristicDisplayProps {
  /** "variations-of-sex-characteristics" or "sexual-orientation" (NZ label "Sexual identity"). */
  topic: SensitiveCharacteristicTopic;
  /** Recorded answer (code, optional own words), or null when not recorded. */
  value: SensitiveCharacteristicValue | null | undefined;
  /** Opt-in: renders nothing unless the host enables it for this user and screen (G12 7) [suggested]. Default false. */
  enabled?: boolean;
  /** Region for the value set and label. Default from `ClinicalLocaleProvider`. */
  region?: ClinicalRegion;
  /** Replace the question set (codes and labels). */
  questionSet?: SensitiveQuestionSet;
  /** Label. Default "Variations of sex characteristics", "Sexual orientation" (AU) or "Sexual identity" (NZ). */
  label?: string;
  /** Hide the answer until the user chooses "Show" (screen privacy) [suggested]. Default true. */
  concealed?: boolean;
  /** Text when nothing is recorded. Default "Not recorded". */
  unknownText?: string;
  className?: string;
}

/**
 * Read-only sensitive characteristic (variations of sex characteristics, sexual orientation or identity), marked
 * "Sensitive" in text, hidden until shown, and rendered only where the host enables it (G12 7).
 */
export function SensitiveCharacteristicDisplay({
  topic,
  value,
  enabled = false,
  region: regionProp,
  questionSet,
  label,
  concealed = true,
  unknownText = 'Not recorded',
  className,
}: SensitiveCharacteristicDisplayProps) {
  const { region } = useClinicalLocale(regionProp);
  const [shown, setShown] = React.useState(false);
  const set = questionSet ?? SENSITIVE_QUESTION_SETS[region][topic];
  if (!enabled || !set) return null;
  const name = label ?? SENSITIVE_TOPIC_LABELS[region][topic];
  const code = value?.code ?? '';
  const known = sensitiveCodeLabel(set, code);
  const detail = (value?.detail ?? '').trim();
  const answer = code ? (detail ? `${known ?? code}: ${detail}` : known ?? `Code ${code}`) : '';
  const hidden = concealed && !shown && !!answer;
  return (
    <span className={cx('cui-sensitive-display', className)}>
      <span className="cui-sensitive-display__label">{name}</span>
      <span className="cui-sensitive-display__marker">
        <Icon name="lock" size={16} />
        {SENSITIVE_MARKER_TEXT}
      </span>
      {!answer ? (
        <span className="cui-sensitive-display__value cui-sensitive-display__value--unknown">{unknownText}</span>
      ) : hidden ? (
        <span className="cui-sensitive-display__value cui-sensitive-display__value--hidden">Recorded, hidden</span>
      ) : (
        <span className="cui-sensitive-display__value">{answer}</span>
      )}
      {concealed && answer ? (
        <button type="button" className="cui-sensitive-display__toggle" aria-pressed={shown} onClick={() => setShown(!shown)}>
          {shown ? 'Hide' : 'Show'}
        </button>
      ) : null}
    </span>
  );
}
