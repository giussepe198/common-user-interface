/**
 * Speech engine adapter (Phase 4 mobile rules [M]: the speech engine is supplied by the consumer through an
 * adapter interface). The library makes no network calls of its own. Two adapters are provided:
 *
 * - WebSpeechEngine: optional default over the browser Web Speech API, feature-detected. Some browsers send audio
 *   to the browser vendor's cloud service; check this against your organisation's privacy and data residency rules
 *   before enabling it.
 * - ScriptedSpeechEngine: plays a script of interim and final results, for tests, previews and training.
 */

/** Why recognition failed. */
export type SpeechEngineErrorCode =
  | 'not-available'
  | 'not-allowed'
  | 'audio-capture'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'language-not-supported'
  | 'unknown';

export interface SpeechEngineError {
  code: SpeechEngineErrorCode;
  /** Plain-language message for the user. Default from SPEECH_ERROR_MESSAGES. */
  message: string;
}

/** A recognition result. Interim results replace each other; a final result is added to the transcript. */
export interface SpeechEngineResult {
  transcript: string;
  isFinal: boolean;
  /** 0 to 1 when the engine gives one. */
  confidence?: number;
  /** Other readings the engine offers, best first (never chosen automatically). */
  alternatives?: string[];
}

export type SpeechEngineEvent =
  | { type: 'start' }
  | { type: 'result'; result: SpeechEngineResult }
  | { type: 'error'; error: SpeechEngineError }
  | { type: 'end' };

export interface SpeechEngineStartOptions {
  /** BCP 47 tag, e.g. "en-NZ". Use speechLanguageForRegion(region). */
  language?: string;
  /** Send interim results. Default true. */
  interimResults?: boolean;
  /** Keep listening across pauses until stop(). Default true. */
  continuous?: boolean;
}

/**
 * The contract every engine implements. `start` begins listening and emits 'start', then 'result' events;
 * `stop` finishes gracefully (pending final results, then 'end'); `abort` ends at once without results.
 */
export interface SpeechEngine {
  /** Whether the engine can be used now (feature detection; no permission prompt). */
  isAvailable(): boolean;
  start(options?: SpeechEngineStartOptions): void;
  stop(): void;
  abort?(): void;
  /** Listen to events. Returns an unsubscribe function. */
  subscribe(listener: (event: SpeechEngineEvent) => void): () => void;
}

/** Default user-facing messages [suggested]. */
export const SPEECH_ERROR_MESSAGES: Record<SpeechEngineErrorCode, string> = {
  'not-available': 'Voice input is not available on this device. Type instead.',
  'not-allowed': 'Microphone access was not allowed. Allow it in the browser settings, or type instead.',
  'audio-capture': 'No microphone was found. Type instead.',
  'no-speech': 'Nothing was heard. Try again, closer to the microphone.',
  network: 'Voice input could not connect. Type instead, or try again.',
  aborted: 'Listening stopped.',
  'language-not-supported': 'This language is not supported by the voice service. Type instead.',
  unknown: 'Voice input stopped unexpectedly. Try again or type instead.',
};

/** Error with the default message. */
export function speechEngineError(code: SpeechEngineErrorCode, message?: string): SpeechEngineError {
  return { code, message: message ?? SPEECH_ERROR_MESSAGES[code] };
}

class Emitter {
  private listeners = new Set<(e: SpeechEngineEvent) => void>();
  subscribe(l: (e: SpeechEngineEvent) => void) {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
  emit(e: SpeechEngineEvent) {
    Array.from(this.listeners).forEach(l => l(e));
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Scripted engine
// ---------------------------------------------------------------------------------------------------------------

/** One step of a script: interim results, then (optionally) a final result, or an error. */
export interface ScriptedSpeechStep {
  interim?: string[];
  final?: string;
  confidence?: number;
  error?: SpeechEngineErrorCode;
}

export interface ScriptedSpeechEngineOptions {
  /** Report the engine as unavailable (to show the touch-only path). Default true (available). */
  available?: boolean;
  /**
   * Milliseconds between events when playing automatically. Default 0: nothing is played until `next()` or
   * `playAll()` is called (tests). Previews use a delay such as 600.
   */
  delayMs?: number;
  /** Play every step synchronously when `start()` is called (static previews). Default false. */
  playOnStart?: boolean;
  /** End listening after the last step. Default true. */
  endAfterScript?: boolean;
}

/**
 * A speech engine that plays a fixed script. Use in tests (step with `next()`), previews (`playOnStart` or
 * `delayMs`) and training. Makes no network calls and needs no microphone.
 */
export class ScriptedSpeechEngine implements SpeechEngine {
  private emitter = new Emitter();
  private index = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listening = false;
  private readonly options: ScriptedSpeechEngineOptions;
  /** Options passed to the last start(). */
  lastStartOptions: SpeechEngineStartOptions | undefined;

  constructor(
    private readonly script: ScriptedSpeechStep[],
    options: ScriptedSpeechEngineOptions = {},
  ) {
    this.options = options;
  }

  isAvailable() {
    return this.options.available !== false;
  }

  /** Whether the engine is listening. */
  get isListening() {
    return this.listening;
  }

  /** Steps not played yet. */
  get remaining() {
    return this.script.length - this.index;
  }

  subscribe(listener: (e: SpeechEngineEvent) => void) {
    return this.emitter.subscribe(listener);
  }

  start(options?: SpeechEngineStartOptions) {
    this.lastStartOptions = options;
    if (!this.isAvailable()) {
      this.emitter.emit({ type: 'error', error: speechEngineError('not-available') });
      this.emitter.emit({ type: 'end' });
      return;
    }
    if (this.listening) return;
    this.listening = true;
    this.emitter.emit({ type: 'start' });
    if (this.options.playOnStart) this.playAll();
    else if (this.options.delayMs) this.schedule();
  }

  private schedule() {
    this.clear();
    this.timer = setTimeout(() => {
      if (!this.listening) return;
      this.next();
      if (this.listening && this.remaining > 0) this.schedule();
    }, this.options.delayMs);
  }

  private clear() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Play the next step. Returns false when the script is finished. */
  next(): boolean {
    if (!this.listening) return false;
    const step = this.script[this.index++];
    if (!step) return false;
    if (step.error) {
      this.listening = false;
      this.clear();
      this.emitter.emit({ type: 'error', error: speechEngineError(step.error) });
      this.emitter.emit({ type: 'end' });
      return false;
    }
    for (const t of step.interim ?? []) this.emitter.emit({ type: 'result', result: { transcript: t, isFinal: false } });
    if (step.final !== undefined) this.emitter.emit({ type: 'result', result: { transcript: step.final, isFinal: true, confidence: step.confidence } });
    if (this.index >= this.script.length && this.options.endAfterScript !== false) this.finish();
    return true;
  }

  /** Play every remaining step now. */
  playAll() {
    while (this.listening && this.next()) {
      /* keep playing */
    }
  }

  private finish() {
    if (!this.listening) return;
    this.listening = false;
    this.clear();
    this.emitter.emit({ type: 'end' });
  }

  stop() {
    this.finish();
  }

  abort() {
    this.finish();
  }

  /** Go back to the first step. */
  reset() {
    this.clear();
    this.listening = false;
    this.index = 0;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Web Speech API adapter
// ---------------------------------------------------------------------------------------------------------------

/** The parts of the Web Speech API SpeechRecognition the adapter uses. */
export interface WebSpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((e: unknown) => void) | null;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string; message?: string }) => void) | null;
  onend: ((e: unknown) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type WebSpeechRecognitionConstructor = new () => WebSpeechRecognitionLike;

/** The browser's SpeechRecognition constructor (standard or webkit-prefixed), or null. */
export function getWebSpeechRecognition(win: unknown = typeof window !== 'undefined' ? window : undefined): WebSpeechRecognitionConstructor | null {
  const w = win as { SpeechRecognition?: WebSpeechRecognitionConstructor; webkitSpeechRecognition?: WebSpeechRecognitionConstructor } | undefined;
  return w?.SpeechRecognition ?? w?.webkitSpeechRecognition ?? null;
}

/** Whether the browser offers the Web Speech API. */
export function isWebSpeechAvailable(win?: unknown): boolean {
  return getWebSpeechRecognition(win) !== null;
}

const WEB_ERRORS: Record<string, SpeechEngineErrorCode> = {
  'not-allowed': 'not-allowed',
  'service-not-allowed': 'not-allowed',
  'audio-capture': 'audio-capture',
  'no-speech': 'no-speech',
  network: 'network',
  aborted: 'aborted',
  'language-not-supported': 'language-not-supported',
};

export interface WebSpeechEngineOptions {
  /** Default language when start() has none, e.g. speechLanguageForRegion('NZ'). Default "en-GB". */
  language?: string;
  /** Number of alternatives to ask for. Default 3. */
  maxAlternatives?: number;
  /** Constructor to use instead of the browser's (tests, or a polyfill). */
  recognition?: WebSpeechRecognitionConstructor | null;
}

/**
 * Adapter over the browser Web Speech API. Feature-detected: `isAvailable()` is false where the API is missing,
 * and `start()` then emits a 'not-available' error. The adapter itself makes no network calls; the browser's
 * recogniser may.
 */
export class WebSpeechEngine implements SpeechEngine {
  private emitter = new Emitter();
  private rec: WebSpeechRecognitionLike | null = null;
  private readonly Ctor: WebSpeechRecognitionConstructor | null;

  constructor(private readonly options: WebSpeechEngineOptions = {}) {
    this.Ctor = options.recognition !== undefined ? options.recognition : getWebSpeechRecognition();
  }

  isAvailable() {
    return this.Ctor !== null;
  }

  subscribe(listener: (e: SpeechEngineEvent) => void) {
    return this.emitter.subscribe(listener);
  }

  start(opts: SpeechEngineStartOptions = {}) {
    if (!this.Ctor) {
      this.emitter.emit({ type: 'error', error: speechEngineError('not-available') });
      this.emitter.emit({ type: 'end' });
      return;
    }
    if (this.rec) return;
    const rec = new this.Ctor();
    rec.lang = opts.language ?? this.options.language ?? 'en-GB';
    rec.continuous = opts.continuous !== false;
    rec.interimResults = opts.interimResults !== false;
    rec.maxAlternatives = this.options.maxAlternatives ?? 3;
    rec.onstart = () => this.emitter.emit({ type: 'start' });
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const best = r[0];
        if (!best) continue;
        if (r.isFinal) {
          const alternatives: string[] = [];
          for (let k = 1; k < r.length; k++) alternatives.push(r[k].transcript.trim());
          this.emitter.emit({ type: 'result', result: { transcript: best.transcript.trim(), isFinal: true, confidence: best.confidence || undefined, alternatives } });
        } else interim += best.transcript;
      }
      if (interim) this.emitter.emit({ type: 'result', result: { transcript: interim.trim(), isFinal: false } });
    };
    rec.onerror = e => this.emitter.emit({ type: 'error', error: speechEngineError(WEB_ERRORS[e.error] ?? 'unknown') });
    rec.onend = () => {
      this.rec = null;
      this.emitter.emit({ type: 'end' });
    };
    this.rec = rec;
    try {
      rec.start();
    } catch {
      this.rec = null;
      this.emitter.emit({ type: 'error', error: speechEngineError('unknown') });
      this.emitter.emit({ type: 'end' });
    }
  }

  stop() {
    this.rec?.stop();
  }

  abort() {
    this.rec?.abort();
  }
}
