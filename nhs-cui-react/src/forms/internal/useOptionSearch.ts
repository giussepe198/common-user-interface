import React from 'react';
import { filterFormOptions, type FormOption } from '../utils/formOptions';

/** Consumer-supplied asynchronous options. Abort work when `signal` fires (a newer request superseded it). */
export type FormOptionLoader = (query: string, options: { signal: AbortSignal }) => Promise<FormOption[]>;

export type OptionSearchStatus = 'idle' | 'pending' | 'done' | 'error';

export interface OptionSearchConfig {
  options?: readonly FormOption[];
  loadOptions?: FormOptionLoader;
  /** Matching for static options. Default `filterFormOptions`. */
  filter?: (options: readonly FormOption[], query: string) => FormOption[];
  minChars: number;
  debounceMs: number;
  busyDelayMs: number;
  noMatchesText: string;
}

/**
 * Internal: filtering for a static list, or debounced requests for an async one where responses that arrive out of
 * order are ignored (the same rule as TerminologySearch, Matching 2.3.1). Produces the polite announcement of the
 * result count.
 */
export function useOptionSearch(cfg: OptionSearchConfig) {
  const [results, setResults] = React.useState<FormOption[]>([]);
  const [status, setStatus] = React.useState<OptionSearchStatus>('idle');
  const [busy, setBusy] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const seq = React.useRef(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const busyRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cfgRef = React.useRef(cfg);
  cfgRef.current = cfg;

  const announce = (n: number) => setAnnouncement(n ? `${n} ${n === 1 ? 'option' : 'options'} available` : cfgRef.current.noMatchesText);

  const cancel = React.useCallback(() => {
    clearTimeout(debounceRef.current);
    clearTimeout(busyRef.current);
    abortRef.current?.abort();
    abortRef.current = null;
    seq.current++;
    setBusy(false);
  }, []);

  React.useEffect(() => cancel, [cancel]);

  const run = React.useCallback((query: string) => {
    const c = cfgRef.current;
    if (!c.loadOptions) return;
    clearTimeout(busyRef.current);
    abortRef.current?.abort();
    const ticket = ++seq.current;
    const controller = new AbortController();
    abortRef.current = controller;
    busyRef.current = setTimeout(() => {
      if (seq.current === ticket) {
        setBusy(true);
        setAnnouncement('Searching');
      }
    }, c.busyDelayMs);
    c.loadOptions(query, { signal: controller.signal }).then(
      (res) => {
        if (seq.current !== ticket) return;
        clearTimeout(busyRef.current);
        setBusy(false);
        setResults(res);
        setStatus('done');
        announce(res.length);
      },
      () => {
        if (controller.signal.aborted || seq.current !== ticket) return;
        clearTimeout(busyRef.current);
        setBusy(false);
        setResults([]);
        setStatus('error');
        setAnnouncement('Options could not be loaded');
      },
    );
  }, []);

  /** Update the results for the typed text. Returns false when the text is too short to search. */
  const lastQuery = React.useRef<string | null>(null);
  const search = React.useCallback(
    (query: string): boolean => {
      lastQuery.current = query;
      const c = cfgRef.current;
      const enough = query.trim().length >= c.minChars;
      if (!c.loadOptions) {
        const res = (c.filter ?? filterFormOptions)(c.options ?? [], enough ? query : '');
        setResults(res);
        setStatus('done');
        announce(res.length);
        return true;
      }
      clearTimeout(debounceRef.current);
      if (!enough) {
        cancel();
        setResults([]);
        setStatus('idle');
        setAnnouncement('');
        return false;
      }
      setStatus('pending');
      if (c.debounceMs <= 0) run(query);
      else debounceRef.current = setTimeout(() => run(query), c.debounceMs);
      return true;
    },
    [cancel, run],
  );

  // Static options that arrive or change after the user has typed (loaded from a server) are filtered again for the
  // same text, so a list never says "nothing matches" because it was searched before its options came.
  const staticOptions = cfg.loadOptions ? undefined : cfg.options;
  React.useEffect(() => {
    if (staticOptions === undefined || lastQuery.current === null) return;
    const c = cfgRef.current;
    const query = lastQuery.current;
    const res = filterFormOptions(staticOptions, query.trim().length >= c.minChars ? query : '');
    setResults(res);
    setStatus('done');
  }, [staticOptions]);

  return { results, status, busy, announcement, search, cancel, setAnnouncement };
}
