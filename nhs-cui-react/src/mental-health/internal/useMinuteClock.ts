import React from 'react';
import { toDate } from '../../core';
import type { DateLike } from '../../core';

/**
 * "Now" for countdowns: the supplied value, or the clock re-read once a minute. Nothing animates; the text simply
 * changes. Area-internal.
 */
export function useMinuteClock(fixed: DateLike | undefined): Date {
  const [tick, setTick] = React.useState(() => new Date());
  React.useEffect(() => {
    if (fixed !== undefined) return;
    const t = setInterval(() => setTick(new Date()), 60_000);
    return () => clearInterval(t);
  }, [fixed]);
  return toDate(fixed ?? null) ?? tick;
}
