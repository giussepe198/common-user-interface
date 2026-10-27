import React from 'react';
import { cx, useClinicalLocale, useId, type ClinicalRegion } from '../../core';
import { ewsDefaultChart, type EwsChartDefinition, type EwsParameter } from '../../lists';
import { ActionBar, TouchButton } from '../../touch';
import { MicButton } from '../MicButton/MicButton';
import { LiveTranscript } from '../LiveTranscript/LiveTranscript';
import type { SpeechEngine } from '../SpeechEngine/SpeechEngine';
import { useSpeechDictation, type DictationStatus } from '../SpeechEngine/useSpeechDictation';
import { voiceParameterName } from '../utils/reviewBlockers';
import {
  parseSpokenObservations,
  type ParseSpokenObservationsOptions,
  type SpokenObservation,
  type SpokenObservationsResult,
} from '../utils/spokenObservations';

export interface DictatedObservationsCaptureProps {
  /** Consumer-supplied speech engine (WebSpeechEngine, ScriptedSpeechEngine or your own). Without one, or when it is unavailable, the screen says so and Type instead is the way on. */
  engine?: SpeechEngine | null;
  /** Patient header slot, shown first (the patient header is always visible on patient-context screens). */
  banner?: React.ReactNode;
  /** Early warning chart. Default: the region's chart (GB NEWS2, AU ADDS placeholder, NZ NZEWS). */
  definition?: EwsChartDefinition;
  /** Region; otherwise read from ClinicalLocaleProvider. Chooses the chart and the recognition language. */
  region?: ClinicalRegion;
  /** Parameters in the read-back list, in order. Default: every parameter on the chart. */
  parameterIds?: string[];
  /** Transcript to show instead of the engine's (when the consumer runs the engine itself, or for previews). */
  transcript?: string;
  /** Interim text to show with `transcript`. */
  interim?: string;
  /** Dictation state to show with `transcript`. */
  status?: DictationStatus;
  /** Start listening when the screen opens. Default false (the user taps the microphone). */
  autoStart?: boolean;
  /** Options for parseSpokenObservations (extra phrases, plausible ranges). */
  parseOptions?: ParseSpokenObservationsOptions;
  /** Heading. Default "Observations by voice". */
  heading?: React.ReactNode;
  /** Line under the heading. Default "Nothing is saved until you review and confirm." */
  intro?: React.ReactNode;
  /** Guidance under the read-back. Default: how to say names and oxygen (C1). */
  guidance?: React.ReactNode;
  /** "Type instead": open keypad entry (P2). Always available. */
  onTypeInstead?: () => void;
  /** "Review": go to DictationReview with what was heard. Nothing is saved here. */
  onReview?: (result: SpokenObservationsResult & { transcript: string }) => void;
  /** Called whenever the transcript or what was heard changes. */
  onHeardChange?: (result: SpokenObservationsResult & { transcript: string }) => void;
  /** Keep the action bar stuck to the bottom of the scrolling container. Default true. */
  stickyActions?: boolean;
  className?: string;
  id?: string;
}

const DEFAULT_GUIDANCE = 'Say the name, then the value. For oxygen, say "on air" or the flow, for example "two litres".';

function readBack(p: EwsParameter, o: SpokenObservation | undefined): { text: string; state: 'heard' | 'missing' | 'check' } {
  if (!o) return { text: 'Not heard yet', state: 'missing' };
  if (o.candidates.length > 1) return { text: `${o.candidates.map(c => c.display).join(' or ')}?`, state: 'check' };
  if (o.unparsed || o.display === null) return { text: 'Not understood', state: 'check' };
  const unit = p.type === 'numeric' && p.unit ? ` ${p.unit}` : '';
  return { text: `${o.display}${unit}${o.implausible ? ' (check)' : ''}`, state: o.implausible ? 'check' : 'heard' };
}

/**
 * Dictated observations (C1): patient banner, what was heard with recognised values highlighted, a read-back
 * list of every parameter ("Not heard yet" until it is), guidance, and Type instead, the microphone and Review.
 * Nothing is saved on this screen.
 */
export function DictatedObservationsCapture(props: DictatedObservationsCaptureProps) {
  const {
    engine,
    banner,
    parseOptions,
    heading = 'Observations by voice',
    intro = 'Nothing is saved until you review and confirm.',
    guidance = DEFAULT_GUIDANCE,
    onTypeInstead,
    onReview,
    onHeardChange,
    stickyActions = true,
    autoStart = false,
    className,
  } = props;
  const { region } = useClinicalLocale(props.region);
  const def = props.definition ?? ewsDefaultChart(region);
  const id = useId('cui-dictate-obs', props.id);
  const dictation = useSpeechDictation(engine, { region });
  const transcript = props.transcript ?? dictation.transcript;
  const interim = props.transcript !== undefined ? props.interim ?? '' : dictation.interim;
  const status: DictationStatus = props.status ?? (props.transcript !== undefined && !engine ? 'idle' : dictation.status);
  const result = React.useMemo(() => parseSpokenObservations(transcript, def, parseOptions), [transcript, def, parseOptions]);
  const params = React.useMemo(() => {
    const ids = props.parameterIds ?? def.parameters.map(p => p.id);
    return ids.map(pid => def.parameters.find(p => p.id === pid)).filter((p): p is EwsParameter => !!p);
  }, [def, props.parameterIds]);

  const started = React.useRef(false);
  React.useEffect(() => {
    if (autoStart && !started.current && dictation.available) {
      started.current = true;
      dictation.start();
    }
  }, [autoStart, dictation]);

  const changeRef = React.useRef(onHeardChange);
  changeRef.current = onHeardChange;
  React.useEffect(() => {
    changeRef.current?.({ ...result, transcript });
  }, [result, transcript]);

  const unavailable = status === 'unavailable';
  const heardCount = params.filter(p => result.observations[p.id]).length;

  return (
    <div className={cx('cui-dictate-obs', className)} id={id}>
      {banner}
      <div className="cui-dictate-obs__main">
        <div className="cui-dictate-obs__intro">
          <h1 className="cui-dictate-obs__heading">{heading}</h1>
          <span className="cui-dictate-obs__lead">{intro}</span>
        </div>
        {unavailable ? (
          <p className="cui-dictate-obs__unavailable" role="note">
            {dictation.error?.message ?? 'Voice input is not available on this device. Use Type instead to enter the observations.'}
          </p>
        ) : null}
        <LiveTranscript text={transcript} interim={interim} highlights={result.highlights} listening={status === 'listening'} />
        <section className="cui-dictate-obs__readback" aria-labelledby={`${id}-rb`}>
          <h2 id={`${id}-rb`} className="cui-dictate-obs__subheading">
            Read back <span className="cui-visually-hidden">{`, ${heardCount} of ${params.length} heard`}</span>
          </h2>
          <dl className="cui-dictate-obs__list">
            {params.map(p => {
              const rb = readBack(p, result.observations[p.id]);
              return (
                <div key={p.id} className={cx('cui-dictate-obs__row', `cui-dictate-obs__row--${rb.state}`)}>
                  <dt>{voiceParameterName(p)}</dt>
                  <dd>{rb.text}</dd>
                </div>
              );
            })}
          </dl>
        </section>
        {guidance ? <p className="cui-dictate-obs__guidance">{guidance}</p> : null}
      </div>
      <ActionBar sticky={stickyActions} label="Dictation actions">
        <div className="cui-dictate-obs__bar">
          <TouchButton className="cui-dictate-obs__side" onClick={onTypeInstead}>
            Type instead
          </TouchButton>
          <MicButton status={status} onPress={dictation.toggle} errorMessage={dictation.error?.message} hideDescription={unavailable} />
          <TouchButton
            className="cui-dictate-obs__side"
            variant={status !== 'listening' && transcript ? 'primary' : 'secondary'}
            onClick={() => {
              if (status === 'listening') dictation.stop();
              onReview?.({ ...result, transcript });
            }}
          >
            Review
          </TouchButton>
        </div>
      </ActionBar>
    </div>
  );
}
