import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { ClinicalLocaleProvider } from '../../core';
import { ScriptedSpeechEngine, WebSpeechEngine, isWebSpeechAvailable, type SpeechEngineEvent, type WebSpeechRecognitionLike } from './SpeechEngine';
import { useSpeechDictation, type SpeechDictation } from './useSpeechDictation';
import { speechLanguageForRegion } from '../utils/regions/speechLanguage';

afterEach(cleanup);

describe('ScriptedSpeechEngine', () => {
  it('plays interim and final results step by step and ends after the script', () => {
    const e = new ScriptedSpeechEngine([{ interim: ['resp', 'resp rate'], final: 'resp rate twenty two' }, { final: 'sats ninety three' }]);
    const events: SpeechEngineEvent[] = [];
    e.subscribe(ev => events.push(ev));
    e.start({ language: 'en-NZ' });
    expect(e.lastStartOptions?.language).toBe('en-NZ');
    expect(events.map(x => x.type)).toEqual(['start']);
    e.next();
    expect(events.slice(1).map(x => (x.type === 'result' ? `${x.result.isFinal}:${x.result.transcript}` : x.type))).toEqual([
      'false:resp', 'false:resp rate', 'true:resp rate twenty two',
    ]);
    e.next();
    expect(events[events.length - 1].type).toBe('end');
    expect(e.isListening).toBe(false);
  });
  it('reports unavailable and emits errors from the script', () => {
    const off = new ScriptedSpeechEngine([], { available: false });
    const ev: string[] = [];
    off.subscribe(x => ev.push(x.type === 'error' ? `error:${x.error.code}` : x.type));
    off.start();
    expect(ev).toEqual(['error:not-available', 'end']);
    const err = new ScriptedSpeechEngine([{ error: 'not-allowed' }]);
    const ev2: string[] = [];
    err.subscribe(x => ev2.push(x.type === 'error' ? `error:${x.error.code}` : x.type));
    err.start();
    err.next();
    expect(ev2).toEqual(['start', 'error:not-allowed', 'end']);
  });
  it('plays on a timer when given a delay', () => {
    vi.useFakeTimers();
    const e = new ScriptedSpeechEngine([{ final: 'one' }, { final: 'two' }], { delayMs: 500 });
    const finals: string[] = [];
    e.subscribe(x => x.type === 'result' && x.result.isFinal && finals.push(x.result.transcript));
    e.start();
    vi.advanceTimersByTime(1100);
    expect(finals).toEqual(['one', 'two']);
    vi.useRealTimers();
  });
});

class FakeRecognition implements WebSpeechRecognitionLike {
  static last: FakeRecognition | null = null;
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onstart: WebSpeechRecognitionLike['onstart'] = null;
  onresult: WebSpeechRecognitionLike['onresult'] = null;
  onerror: WebSpeechRecognitionLike['onerror'] = null;
  onend: WebSpeechRecognitionLike['onend'] = null;
  constructor() {
    FakeRecognition.last = this;
  }
  start() {
    this.onstart?.({});
  }
  stop() {
    this.onend?.({});
  }
  abort() {
    this.onend?.({});
  }
}

describe('WebSpeechEngine', () => {
  it('is feature-detected', () => {
    expect(isWebSpeechAvailable({})).toBe(false);
    expect(isWebSpeechAvailable({ webkitSpeechRecognition: FakeRecognition })).toBe(true);
    expect(new WebSpeechEngine({ recognition: null }).isAvailable()).toBe(false);
  });
  it('sets the language and maps results and errors', () => {
    const e = new WebSpeechEngine({ recognition: FakeRecognition });
    const ev: string[] = [];
    e.subscribe(x => ev.push(x.type === 'result' ? `${x.result.isFinal ? 'final' : 'interim'}:${x.result.transcript}${x.result.alternatives?.length ? `|${x.result.alternatives.join(',')}` : ''}` : x.type === 'error' ? `error:${x.error.code}` : x.type));
    e.start({ language: speechLanguageForRegion('AU') });
    const r = FakeRecognition.last as FakeRecognition;
    expect(r.lang).toBe('en-AU');
    expect(r.continuous).toBe(true);
    expect(r.interimResults).toBe(true);
    const result = (t: string, isFinal: boolean, alt?: string) => Object.assign([{ transcript: t, confidence: 0.9 }, ...(alt ? [{ transcript: alt, confidence: 0.4 }] : [])], { isFinal });
    r.onresult?.({ resultIndex: 0, results: [result('sats ninety', false)] });
    r.onresult?.({ resultIndex: 0, results: [result(' sats ninety three', true, 'sats ninety free')] });
    r.onerror?.({ error: 'service-not-allowed' });
    e.stop();
    expect(ev).toEqual(['start', 'interim:sats ninety', 'final:sats ninety three|sats ninety free', 'error:not-allowed', 'end']);
  });
  it('emits not-available when started without the API', () => {
    const e = new WebSpeechEngine({ recognition: null });
    const ev: string[] = [];
    e.subscribe(x => ev.push(x.type === 'error' ? x.error.message : x.type));
    e.start();
    expect(ev[0]).toBe('Voice input is not available on this device. Type instead.');
  });
});

function Harness({ engine, onReady }: { engine: ScriptedSpeechEngine | null; onReady: (d: SpeechDictation) => void }) {
  const d = useSpeechDictation(engine);
  onReady(d);
  return (
    <div>
      <span data-testid="status">{d.status}</span>
      <span data-testid="text">{d.transcript}</span>
      <span data-testid="interim">{d.interim}</span>
      <button type="button" onClick={d.toggle}>toggle</button>
    </div>
  );
}

describe('useSpeechDictation', () => {
  it('tracks status, interim and final text, in the region language', () => {
    const engine = new ScriptedSpeechEngine([{ interim: ['temp'], final: 'temp thirty eight' }, { final: 'point four' }], { endAfterScript: false });
    let d!: SpeechDictation;
    render(
      <ClinicalLocaleProvider region="NZ">
        <Harness engine={engine} onReady={x => (d = x)} />
      </ClinicalLocaleProvider>,
    );
    expect(screen.getByTestId('status').textContent).toBe('idle');
    fireEvent.click(screen.getByText('toggle'));
    expect(engine.lastStartOptions?.language).toBe('en-NZ');
    expect(screen.getByTestId('status').textContent).toBe('listening');
    act(() => {
      engine.next();
    });
    expect(screen.getByTestId('text').textContent).toBe('temp thirty eight');
    act(() => {
      engine.next();
    });
    expect(screen.getByTestId('text').textContent).toBe('temp thirty eight point four');
    act(() => d.stop());
    expect(screen.getByTestId('status').textContent).toBe('idle');
  });
  it('is unavailable without an engine and reports errors', () => {
    render(<Harness engine={null} onReady={() => undefined} />);
    expect(screen.getByTestId('status').textContent).toBe('unavailable');
    cleanup();
    const engine = new ScriptedSpeechEngine([{ error: 'no-speech' }]);
    let d!: SpeechDictation;
    render(<Harness engine={engine} onReady={x => (d = x)} />);
    fireEvent.click(screen.getByText('toggle'));
    act(() => {
      engine.next();
    });
    expect(screen.getByTestId('status').textContent).toBe('error');
    expect(d.error?.code).toBe('no-speech');
  });
});
