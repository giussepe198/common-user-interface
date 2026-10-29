import React from 'react';
import { Combobox, type ComboboxProps } from '../../forms/Combobox/Combobox';
import type { FormOption } from '../../forms/utils/formOptions';
import type { SmartFieldKind } from '../utils/smartSearch';
import { smartAnnotateFormOptions, smartFilterFormOptions } from '../utils/smartOptions';

export interface SmartLookupProps extends ComboboxProps {
  /**
   * How the option names compare: 'name' for people (close spellings and similar sounds, "FAMILY, Given" in either
   * order), 'text' for teams, agencies and other names, 'code' for code sets. Default 'text'.
   */
  matchKind?: Extract<SmartFieldKind, 'name' | 'text' | 'code'>;
}

/**
 * Pick one of many [suggested]: the Combobox with the smart search. Static options are ranked (as typed, then within
 * words, then close spellings and similar sounds) and asynchronous ones keep the server's order; both mark what matched,
 * say why a close match matched, and show a warning an option carries (a look-alike name). Recent choices open from the
 * empty box. Give every option a second line (`description`) that tells look-alikes apart: born and record number for
 * people, the service for a team.
 */
export const SmartLookup = React.forwardRef<HTMLInputElement, SmartLookupProps>(function SmartLookup({ matchKind = 'text', filterOptions, loadOptions, ...rest }, ref) {
  const kind = matchKind === 'code' ? 'text' : matchKind;
  const filter = React.useCallback((o: readonly FormOption[], q: string) => smartFilterFormOptions(o, q, kind), [kind]);
  const load = React.useMemo(
    () => (loadOptions ? async (q: string, opts: { signal: AbortSignal }) => smartAnnotateFormOptions(await loadOptions(q, opts), q, kind) : undefined),
    [loadOptions, kind],
  );
  return <Combobox ref={ref} {...rest} filterOptions={filterOptions ?? filter} loadOptions={load} />;
});
