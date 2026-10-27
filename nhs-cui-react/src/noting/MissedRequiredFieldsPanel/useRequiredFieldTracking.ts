import React from 'react';
import { computeMissedRequired } from '../utils/formState';

/** A field registered for required-field tracking. */
export interface TrackedRequiredField {
  /** Element id of the field (or of its fieldset). */
  id: string;
  /** Label shown in the missed list. */
  label: string;
  /** Form section heading for grouping (CNA-1210). */
  section?: string;
  /** Defaults to true. */
  required?: boolean;
  /** Whether the field has no value now. */
  empty: boolean;
  /** Tab-order position. Defaults to the array index. */
  order?: number;
}

/** A missed field as listed by `MissedRequiredFieldsPanel`. */
export interface MissedRequiredField {
  id: string;
  label: string;
  section?: string;
}

export interface RequiredFieldTracking {
  /** Ids of missed fields in tab order. */
  missedIds: string[];
  /** Missed fields with labels and sections, ready for `MissedRequiredFieldsPanel`. */
  missedItems: MissedRequiredField[];
  /** Whether a given field is currently missed (pass to the field's `missed` prop). */
  isMissed: (id: string) => boolean;
  /** Call when a field gains focus (or use `formProps`). */
  onFieldFocus: (id: string) => void;
  /** Spread on the form element: focus anywhere inside a tracked field updates the state. */
  formProps: { onFocus: React.FocusEventHandler<HTMLElement> };
  /**
   * Call on Save or Submit: marks every empty required field as missed, whether or not the user has reached it, and
   * returns those fields in tab order (empty array when the form is complete). Fields stop being missed once filled.
   * [suggested] Use the returned list to decide whether to save; the hook never blocks by itself.
   */
  markAllMissed: () => MissedRequiredField[];
  /** Forget how far the user has got (e.g. after reset), including a previous `markAllMissed`. */
  reset: () => void;
}

/**
 * Reactive missed-required-field tracking (CNA-1140..1150): a required field is "missed" when it is
 * empty and focus has moved to a field later in the tab order. It stops being missed once filled.
 * Never blocks the user or forces completion before moving on. On Save, `markAllMissed()` marks every empty required
 * field as missed and returns them.
 */
export function useRequiredFieldTracking(fields: readonly TrackedRequiredField[]): RequiredFieldTracking {
  const [reached, setReached] = React.useState(-Infinity);
  const normalised = fields.map((f, i) => ({ id: f.id, label: f.label, section: f.section, required: f.required ?? true, empty: f.empty, order: f.order ?? i }));
  const orderById = new Map(normalised.map((f) => [f.id, f.order] as const));
  const orderRef = React.useRef(orderById);
  orderRef.current = orderById;
  const fieldsRef = React.useRef(normalised);
  fieldsRef.current = normalised;

  const missedIds = computeMissedRequired(normalised, reached);
  const missedSet = new Set(missedIds);
  const toItems = (list: typeof normalised, ids: string[]): MissedRequiredField[] =>
    ids.map((id) => {
      const f = list.find((x) => x.id === id)!;
      return { id: f.id, label: f.label, section: f.section };
    });
  const missedItems = toItems(normalised, missedIds);

  const markAllMissed = React.useCallback((): MissedRequiredField[] => {
    setReached(Infinity);
    const list = fieldsRef.current;
    return toItems(list, computeMissedRequired(list, Infinity));
  }, []);

  const onFieldFocus = React.useCallback((id: string) => {
    const order = orderRef.current.get(id);
    if (order != null) setReached((r) => Math.max(r, order));
  }, []);

  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== e.currentTarget) {
        if (el.id && orderRef.current.has(el.id)) {
          onFieldFocus(el.id);
          return;
        }
        el = el.parentElement;
      }
    },
    [onFieldFocus],
  );

  return {
    missedIds,
    missedItems,
    isMissed: (id) => missedSet.has(id),
    onFieldFocus,
    formProps: { onFocus },
    markAllMissed,
    reset: () => setReached(-Infinity),
  };
}
