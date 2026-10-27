import { useCallback, useId as useReactId, useRef, useState } from 'react';

/** Stable id, optionally overridden by a caller-supplied id. */
export function useId(prefix: string, override?: string): string {
  const id = useReactId().replace(/:/g, '');
  return override ?? `${prefix}-${id}`;
}

/** Controlled/uncontrolled value helper. */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : inner;
  const cb = useRef(onChange);
  cb.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInner(next);
      cb.current?.(next);
    },
    [isControlled],
  );
  return [current, set];
}
