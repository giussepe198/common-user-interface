import React from 'react';
import { cx, useId } from '../../core';
import type { VoiceTranscriptHighlight } from '../utils/spokenObservations';

export interface LiveTranscriptProps {
  /** Final text heard so far. Shown exactly as recognised (macrons kept). */
  text: string;
  /** Interim text still being recognised, shown muted after the final text and not announced. */
  interim?: string;
  /**
   * Stretches of `text` to highlight: 'value' for recognised values (pale blue, as encodable text in CUI noting),
   * 'check' for words that need a question, 'label' for parameter names (not highlighted by default).
   */
  highlights?: VoiceTranscriptHighlight[];
  /** Also mark parameter names [suggested]. Default false (C1 marks values only). */
  highlightLabels?: boolean;
  /** Heading. Default "What I heard" (C1). */
  heading?: React.ReactNode;
  /** Heading level. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** Text when nothing has been heard yet. Default "Nothing heard yet." */
  emptyText?: string;
  /** Show the trailing ellipsis while listening. Default: when `interim` is set. */
  listening?: boolean;
  className?: string;
  id?: string;
}

interface Piece {
  text: string;
  kind?: VoiceTranscriptHighlight['kind'];
}

function pieces(text: string, highlights: VoiceTranscriptHighlight[], labels: boolean): Piece[] {
  const hs = highlights
    .filter(h => (labels || h.kind !== 'label') && h.start >= 0 && h.end <= text.length && h.end > h.start)
    .sort((a, b) => a.start - b.start);
  const out: Piece[] = [];
  let at = 0;
  for (const h of hs) {
    if (h.start < at) continue;
    if (h.start > at) out.push({ text: text.slice(at, h.start) });
    out.push({ text: text.slice(h.start, h.end), kind: h.kind });
    at = h.end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/**
 * Transcript of what the speech engine heard (C1 "What I heard"), with recognised values highlighted and words
 * that need checking marked. New final text is announced through a polite live region; interim text is not.
 */
export function LiveTranscript(props: LiveTranscriptProps) {
  const {
    text,
    interim = '',
    highlights = [],
    highlightLabels = false,
    heading = 'What I heard',
    headingLevel = 2,
    emptyText = 'Nothing heard yet.',
    className,
  } = props;
  const id = useId('cui-live-transcript', props.id);
  const H = `h${headingLevel}` as 'h2';
  const listening = props.listening ?? interim !== '';
  const parts = pieces(text, highlights, highlightLabels);
  const empty = !text && !interim;

  // Announce only the text added since the last announcement, so a screen reader does not reread everything.
  const [announced, setAnnounced] = React.useState('');
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    setAnnounced(text.startsWith(before) ? text.slice(before.length).trim() : text);
  }, [text]);

  return (
    <section className={cx('cui-live-transcript', className)} aria-labelledby={`${id}-h`} id={id}>
      <H id={`${id}-h`} className="cui-live-transcript__heading">{heading}</H>
      <p className={cx('cui-live-transcript__text', empty && 'cui-live-transcript__text--empty')}>
        {empty ? emptyText : null}
        {parts.map((p, i) =>
          p.kind === 'value' ? (
            <mark key={i} className="cui-live-transcript__value">{p.text}</mark>
          ) : p.kind === 'check' ? (
            <mark key={i} className="cui-live-transcript__check">
              {p.text}
              <span className="cui-visually-hidden"> (check)</span>
            </mark>
          ) : p.kind === 'label' ? (
            <span key={i} className="cui-live-transcript__label">{p.text}</span>
          ) : (
            <React.Fragment key={i}>{p.text}</React.Fragment>
          ),
        )}
        {interim ? (
          <span className="cui-live-transcript__interim" aria-hidden="true">
            {text ? ' ' : ''}
            {interim}
          </span>
        ) : null}
        {listening ? <span className="cui-live-transcript__more" aria-hidden="true">…</span> : null}
      </p>
      <span className="cui-visually-hidden" aria-live="polite" role="status">
        {announced}
      </span>
    </section>
  );
}
