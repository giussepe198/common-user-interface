import React from 'react';
import { useClinicalLocale, type ClinicalRegion } from '../../core';
import { speechLanguageForRegion } from '../utils/regions/speechLanguage';
import type { SpeechEngine, SpeechEngineError } from './SpeechEngine';

/** State of a dictation session, as shown by MicButton. */
export type DictationStatus = 'idle' | 'listening' | 'processing' | 'error' | 'unavailable';

export interface UseSpeechDictationOptions {
  /** Recognition language. Default: the region's (en-GB, en-AU, en-NZ). */
  language?: string;
  /** Region; otherwise read from ClinicalLocaleProvider. */
  region?: ClinicalRegion;
  /** Transcript to start from (e.g. dictating more into an existing note). */
  defaultTranscript?: string;
  /** Called with each final result and the whole transcript. */
  onFinalResult?: (text: string, transcript: string) => void;
}

export interface SpeechDictation {
  status: DictationStatus;
  /** Final results joined with spaces. */
  transcript: string;
  /** Current interim result (not yet final), or ''. */
  interim: string;
  error: SpeechEngineError | null;
  /** The engine exists and reports itself available. */
  available: boolean;
  start: () => void;
  stop: () => void;
  /** Start when idle or in error, stop when listening. */
  toggle: () => void;
  /** Clear the transcript and any error. */
  reset: () => void;
  /** Replace the transcript (e.g. after the user edits it). */
  setTranscript: (text: string) => void;
}

/**
 * Connects a consumer-supplied SpeechEngine to React state: status, transcript (final results), interim text and
 * errors. Nothing is committed: the transcript is only text until the review step (Phase 4 mobile rules [M]).
 */
export function useSpeechDictation(engine: SpeechEngine | null | undefined, options: UseSpeechDictationOptions = {}): SpeechDictation {
  const { region } = useClinicalLocale(options.region);
  const language = options.language ?? speechLanguageForRegion(region);
  const available = !!engine && engine.isAvailable();
  const [status, setStatus] = React.useState<DictationStatus>(available ? 'idle' : 'unavailable');
  const [transcript, setTranscriptState] = React.useState(options.defaultTranscript ?? '');
  const [interim, setInterim] = React.useState('');
  const [error, setError] = React.useState<SpeechEngineError | null>(null);
  const transcriptRef = React.useRef(transcript);
  const onFinal = React.useRef(options.onFinalResult);
  onFinal.current = options.onFinalResult;
  const errored = React.useRef(false);

  const setTranscript = React.useCallback((t: string) => {
    transcriptRef.current = t;
    setTranscriptState(t);
  }, []);

  React.useEffect(() => {
    setStatus(available ? 'idle' : 'unavailable');
    if (!engine) return undefined;
    const off = engine.subscribe(e => {
      if (e.type === 'start') {
        errored.current = false;
        setError(null);
        setStatus('listening');
      } else if (e.type === 'result') {
        if (e.result.isFinal) {
          const text = e.result.transcript.trim();
          setInterim('');
          if (!text) return;
          const next = transcriptRef.current ? `${transcriptRef.current.replace(/\s+$/, '')} ${text}` : text;
          transcriptRef.current = next;
          setTranscriptState(next);
          onFinal.current?.(text, next);
        } else setInterim(e.result.transcript);
      } else if (e.type === 'error') {
        if (e.error.code === 'aborted') return;
        errored.current = true;
        setError(e.error);
        setStatus(e.error.code === 'not-available' ? 'unavailable' : 'error');
      } else if (e.type === 'end') {
        setInterim('');
        if (!errored.current) setStatus(engine.isAvailable() ? 'idle' : 'unavailable');
      }
    });
    return () => {
      off();
      engine.abort?.();
    };
  }, [engine, available]);

  const start = React.useCallback(() => {
    if (!engine) return;
    errored.current = false;
    setError(null);
    engine.start({ language, interimResults: true, continuous: true });
  }, [engine, language]);
  const stop = React.useCallback(() => {
    if (!engine) return;
    setStatus(s => (s === 'listening' ? 'processing' : s));
    engine.stop();
  }, [engine]);
  const toggle = React.useCallback(() => {
    if (status === 'listening') stop();
    else if (status === 'idle' || status === 'error') start();
  }, [status, start, stop]);
  const reset = React.useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, [setTranscript]);

  return { status, transcript, interim, error, available, start, stop, toggle, reset, setTranscript };
}
