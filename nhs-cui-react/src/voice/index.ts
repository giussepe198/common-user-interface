import './MicButton/MicButton.css';
import './LiveTranscript/LiveTranscript.css';
import './DictatedObservationsCapture/DictatedObservationsCapture.css';
import './DictationReview/DictationReview.css';
import './DictatedNoteReview/DictatedNoteReview.css';

// Speech engine adapter
export {
  ScriptedSpeechEngine,
  WebSpeechEngine,
  SPEECH_ERROR_MESSAGES,
  speechEngineError,
  getWebSpeechRecognition,
  isWebSpeechAvailable,
} from './SpeechEngine/SpeechEngine';
export type {
  SpeechEngine,
  SpeechEngineEvent,
  SpeechEngineResult,
  SpeechEngineError,
  SpeechEngineErrorCode,
  SpeechEngineStartOptions,
  ScriptedSpeechStep,
  ScriptedSpeechEngineOptions,
  WebSpeechEngineOptions,
  WebSpeechRecognitionLike,
  WebSpeechRecognitionConstructor,
} from './SpeechEngine/SpeechEngine';
export { useSpeechDictation } from './SpeechEngine/useSpeechDictation';
export type { DictationStatus, SpeechDictation, UseSpeechDictationOptions } from './SpeechEngine/useSpeechDictation';

// Controls
export { MicButton } from './MicButton/MicButton';
export type { MicButtonProps } from './MicButton/MicButton';
export { LiveTranscript } from './LiveTranscript/LiveTranscript';
export type { LiveTranscriptProps } from './LiveTranscript/LiveTranscript';
export { DictatedObservationsCapture } from './DictatedObservationsCapture/DictatedObservationsCapture';
export type { DictatedObservationsCaptureProps } from './DictatedObservationsCapture/DictatedObservationsCapture';
export { DictationReview } from './DictationReview/DictationReview';
export type { DictationReviewProps, DictationReviewSaveResult } from './DictationReview/DictationReview';
export { DictatedNoteReview } from './DictatedNoteReview/DictatedNoteReview';
export type {
  DictatedNoteReviewProps,
  DictatedNoteCodeMatch,
  DictatedNoteMatcher,
  DictatedNotePrescription,
  DictatedNoteDoseDecision,
  DictatedNoteResult,
} from './DictatedNoteReview/DictatedNoteReview';

// Utilities
export * from './utils/spokenNumbers';
export * from './utils/spokenObservations';
export * from './utils/doseMentions';
export * from './utils/reviewBlockers';
export * from './utils/regions/speechLanguage';
