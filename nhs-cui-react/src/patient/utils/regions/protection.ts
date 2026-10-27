/**
 * HISO 10046:2024 protection flags (2.2.7 name, 3.9 address, 5.4 contact; G12 section 3). Pure data.
 * The standard defines the flags ("held 'in confidence'") but no UI behaviour; the defaults below are [suggested].
 * Source: https://tewhatuora.govt.nz/assets/Publications/HISO-Standards/hiso-10046-2024-Consumer-health-identity-standard.pdf
 */

/** What a protection flag covers. */
export type ProtectedItemKind = 'name' | 'address' | 'contact';

/** How a protected value is shown: "indicator" shows it with a "protected" marker; "masked" hides it until revealed. */
export type ProtectedDisplayMode = 'indicator' | 'masked';

/** Default display per kind [suggested]: the name is needed to identify the patient; address and contact are hidden. */
export const PROTECTED_DEFAULT_DISPLAY: Record<ProtectedItemKind, ProtectedDisplayMode> = {
  name: 'indicator',
  address: 'masked',
  contact: 'masked',
};

/** Indicator text per kind [suggested]. */
export const PROTECTED_INDICATOR_TEXT: Record<ProtectedItemKind, string> = {
  name: 'Name protected',
  address: 'Address protected',
  contact: 'Contact details protected',
};

/** HISO 10046 field labels and value domains, for the flag input. */
export const HISO_PROTECTION_FLAGS: Record<ProtectedItemKind, { label: string; definition: string; yes: string; no: string }> = {
  name: {
    label: 'Name protection flag',
    definition: "This indicator denotes that the person's name information is to be held 'in confidence'",
    yes: 'Protected',
    no: 'Not Protected',
  },
  address: {
    label: 'Address protected flag',
    definition: "This indicator denotes that the person's address information is to be held 'in confidence'",
    yes: 'Yes, Protected',
    no: 'No, Not Protected',
  },
  contact: {
    label: 'Contact protected flag',
    definition: "This indicator denotes that the person's contact information is to be held 'in confidence'",
    yes: 'Protected',
    no: 'Not Protected',
  },
};

/** Explanation shown with the flag input: set to 1 "if the person indicates they have a reason to not share" it (HISO 10046). */
export const PROTECTION_FLAG_HINT: Record<ProtectedItemKind, string> = {
  name: 'Set this if the person says they have a reason not to share this name.',
  address: 'Set this if the person says they have a reason not to share this address.',
  contact: 'Set this if the person says they have a reason not to share these contact details.',
};
