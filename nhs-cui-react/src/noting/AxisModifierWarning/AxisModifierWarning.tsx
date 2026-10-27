import React from 'react';
import { Button, useId } from '../../core';
import { ModalFrame } from '../internal/ModalFrame';

export interface AxisModifierWarningProps {
  /** The encoded concept, e.g. "Breast cancer". */
  conceptLabel: string;
  /** The words in the additional text that change who or what the term applies to, e.g. "Mother". */
  modifierText: string;
  /** Record the concept as applying to the modifier (e.g. family history). */
  onConfirmModifier: () => void;
  /** Keep the note as it is: the concept stays about the patient. Also chosen by Escape. */
  onLeaveAsIs: () => void;
  /** Label of the confirm button. Default "Confirm <modifier> has <concept>" [suggested]. */
  confirmLabel?: string;
  /** Label of the other button. Default "Leave note as it is" [suggested]. */
  leaveLabel?: string;
  /** Render in place instead of as a modal overlay (for previews or a host dialog). */
  inline?: boolean;
}

/**
 * Modal warning shown on OK when the additional text contains an unconfirmed axis modifier such as
 * "mother" (Elaboration 2.2; G8 AxisModifierWarning): a plain explanation and exactly two
 * resolutions, never a Yes/No/Cancel triplet.
 */
export function AxisModifierWarning({ conceptLabel, modifierText, onConfirmModifier, onLeaveAsIs, confirmLabel, leaveLabel = 'Leave note as it is', inline }: AxisModifierWarningProps) {
  const id = useId('cui-axis');
  const modifierLower = modifierText.trim().toLowerCase();
  const confirm = confirmLabel ?? `Confirm ${modifierLower} has ${conceptLabel.toLowerCase()}`;
  return (
    <ModalFrame role="alertdialog" labelledBy={`${id}-title`} describedBy={`${id}-body`} onEscape={onLeaveAsIs} inline={inline} className="cui-axis-warning">
      <h2 id={`${id}-title`} className="cui-noting-modal__title">Check who this applies to</h2>
      <div id={`${id}-body`} className="cui-axis-warning__body">
        <p>
          Your additional text mentions <strong>{modifierText.trim()}</strong>.
        </p>
        <p>
          <strong>{conceptLabel}</strong> will be recorded as applying to the patient unless you confirm it applies to {modifierLower}.
        </p>
      </div>
      <div className="cui-noting-modal__actions">
        <Button onClick={onLeaveAsIs}>{leaveLabel}</Button>
        <Button variant="primary" onClick={onConfirmModifier}>{confirm}</Button>
      </div>
    </ModalFrame>
  );
}
