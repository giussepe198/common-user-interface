import React from 'react';

const DATE_RE = /((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?\d{2}-[A-Z][a-z]{2}-\d{4}(?: (?:Approx )?\d{2}:\d{2}(?::\d{2})?)?|\b[A-Z][a-z]{2}-\d{4}\b/g;

/**
 * Renders message text with each CUI date (and attached time) kept on one line, so a date never
 * breaks at its hyphens. Internal helper for prompts, notices and error messages.
 */
export function NoWrapDates({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  DATE_RE.lastIndex = 0;
  while ((m = DATE_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<span key={m.index} className="cui-nowrap">{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
