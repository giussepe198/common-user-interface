import React from 'react';

/** Where and how sheets below a SheetContainerProvider render, unless a sheet's own props say otherwise. */
export interface SheetContainerSettings {
  /**
   * Render sheets in a portal (true) or in place (false). Default true. A sheet's own `portal` prop wins.
   */
  portal?: boolean;
  /**
   * Element that portalled sheets render into, instead of a `.cui-root` element appended to document.body, e.g. a
   * phone frame or a documentation card. A sheet's own `container` prop wins. The sheet layer is `position: fixed`,
   * so give the container (or an ancestor) a `transform` or `contain: layout` to keep the layer inside it [suggested].
   */
  container?: HTMLElement | null;
  /**
   * Move focus into a sheet that is already open when it first renders. Default true. Set false on documentation
   * and preview pages so the page does not load with a focus ring inside a sheet; sheets opened later still take
   * focus. A sheet's own `autoFocus` prop wins.
   */
  autoFocus?: boolean;
}

export interface SheetContainerProviderProps extends SheetContainerSettings {
  children?: React.ReactNode;
}

const SheetContainerContext = React.createContext<SheetContainerSettings>({});

/**
 * Sets where every touch sheet below it renders (BottomSheet, FullScreenSheet, and the sheets inside
 * HoldToConfirmButton, NotGivenSheet, PatientDetailsSheet, DoseAdministrationFlow, MobileMedicationsList,
 * DictationReview and others) [suggested]. Use it once in a host that embeds mobile screens, such as a phone frame,
 * instead of passing `portal` or `container` to each control. Props on an individual sheet still win; nested
 * providers override only the settings they give.
 */
export function SheetContainerProvider({ children, ...settings }: SheetContainerProviderProps) {
  const parent = React.useContext(SheetContainerContext);
  const { portal, container, autoFocus } = settings;
  const value = React.useMemo<SheetContainerSettings>(
    () => ({
      portal: portal ?? parent.portal,
      container: container !== undefined ? container : parent.container,
      autoFocus: autoFocus ?? parent.autoFocus,
    }),
    [portal, container, autoFocus, parent.portal, parent.container, parent.autoFocus],
  );
  return <SheetContainerContext.Provider value={value}>{children}</SheetContainerContext.Provider>;
}

/** The sheet settings from the nearest SheetContainerProvider (empty object when there is none). */
export function useSheetContainer(): SheetContainerSettings {
  return React.useContext(SheetContainerContext);
}
