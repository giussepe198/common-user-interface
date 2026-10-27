import React from 'react';
import { cx, useId } from '../../core';
import type { DictationStatus } from '../SpeechEngine/useSpeechDictation';

export interface MicButtonProps {
  /** Dictation state: idle, listening (pressed), processing, error or unavailable (Phase 4 mobile rules [M]). */
  status: DictationStatus;
  /** Tap, Enter or Space. Usually `dictation.toggle`. Not called while processing or unavailable. */
  onPress?: () => void;
  /** Diameter in px: 72 (default, C1 primary) or 56 (C3 "Dictate more"). Never below 56 [suggested]. */
  size?: 56 | 72;
  /** Accessible name when idle. Default "Start listening". */
  startLabel?: string;
  /** Accessible name while listening. Default "Stop listening". */
  stopLabel?: string;
  /** Short visible caption inside the button. Default: "STOP" while listening (C1), none otherwise. */
  caption?: React.ReactNode;
  /** Error message to announce and show under the button in the error state. */
  errorMessage?: string;
  /** Message for the unavailable state. Default "Voice input is not available. Type instead." */
  unavailableMessage?: string;
  /** Show the status text under the button. Default false (C1 shows the state by the button alone). */
  showStatusText?: boolean;
  /**
   * Hide the error or unavailable text visually (it still describes the button) when the screen already explains it,
   * for example in a narrow action bar [suggested]. Default false.
   */
  hideDescription?: boolean;
  className?: string;
  id?: string;
}

const STATUS_TEXT: Record<DictationStatus, string> = {
  idle: 'Not listening',
  listening: 'Listening',
  processing: 'Processing what was heard',
  error: 'Voice input stopped',
  unavailable: 'Voice input is not available. Type instead.',
};

function MicGlyph({ status }: { status: DictationStatus }) {
  // Paths from the approved concepts (C1 stop square, C2/C3 microphone). Stroke uses currentColor.
  if (status === 'listening') {
    return (
      <svg className="cui-mic-button__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 7h10v10H7z" fill="currentColor" stroke="currentColor" />
      </svg>
    );
  }
  return (
    <svg className="cui-mic-button__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 4.5h6v9a3 3 0 0 1-6 0zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
      {status === 'unavailable' ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

/**
 * Large round microphone button for dictation (C1): 72 px, pressed while listening, with listening, processing,
 * error and unavailable states announced politely. Works by tap and keyboard (it is a native button).
 */
export const MicButton = React.forwardRef<HTMLButtonElement, MicButtonProps>(function MicButton(props, ref) {
  const {
    status,
    onPress,
    size = 72,
    startLabel = 'Start listening',
    stopLabel = 'Stop listening',
    errorMessage,
    unavailableMessage = STATUS_TEXT.unavailable,
    showStatusText = false,
    hideDescription = false,
    className,
  } = props;
  const id = useId('cui-mic', props.id);
  const listening = status === 'listening';
  const disabled = status === 'unavailable' || status === 'processing';
  const label = listening ? stopLabel : status === 'error' ? 'Try listening again' : status === 'processing' ? 'Processing' : startLabel;
  const caption = props.caption !== undefined ? props.caption : listening ? 'STOP' : null;
  const statusText = status === 'error' ? errorMessage ?? STATUS_TEXT.error : status === 'unavailable' ? unavailableMessage : STATUS_TEXT[status];
  const describe = status === 'error' || status === 'unavailable';

  // Announce changes only (not the first render), so screen readers hear "Listening" when it starts.
  const [announcement, setAnnouncement] = React.useState('');
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setAnnouncement(statusText);
  }, [statusText]);

  return (
    <span className={cx('cui-mic-button', `cui-mic-button--${status}`, `cui-mic-button--${size}`, className)}>
      <button
        ref={ref}
        id={id}
        type="button"
        className="cui-mic-button__button"
        aria-pressed={listening}
        aria-label={label}
        aria-describedby={describe ? `${id}-status` : undefined}
        aria-busy={status === 'processing' || undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) onPress?.();
        }}
      >
        <MicGlyph status={status} />
        {caption ? <span className="cui-mic-button__caption" aria-hidden="true">{caption}</span> : null}
      </button>
      {showStatusText || describe ? (
        <span id={`${id}-status`} className={cx(hideDescription && !showStatusText ? 'cui-visually-hidden' : 'cui-mic-button__status', status === 'error' && !hideDescription && 'cui-mic-button__status--error')}>
          {statusText}
        </span>
      ) : null}
      <span className="cui-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </span>
  );
});
