/**
 * My Health Record (AU) access states and wording (G12 section 2). Pure data, no React.
 * Sources:
 *  https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-your-record
 *  https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/restrict-access-to-documents-in-your-record
 *  https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/manage-your-record/privacy-and-access/my-health-record-suspension
 *  https://www.digitalhealth.gov.au/initiatives-and-programs/my-health-record/profile-and-settings/cancelling-a-record
 *  https://developer.digitalhealth.gov.au/node/7260 (PCEHR_CIS_019048, PCEHR_CIS_017941, PCEHR_CIS_019116)
 *  https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/my-health-record/my-health-record-emergency-access-function
 *  https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/health-service-providers/my-health-record/using-the-my-health-record-system
 */

/**
 * Access state of a person's My Health Record for this organisation.
 * - not-checked: the system has not looked yet.
 * - no-record: no record exists (B2B "PCEHR not found", 5101).
 * - available: access granted (general access documents visible).
 * - access-code-required: the person set a Record Access Code (B2B accessCodeRequired "WithCode", 5102).
 * - restricted-documents: access granted; some documents are restricted and need the Limited Document Access Code.
 * - emergency-access: access gained with the emergency access function (5 days).
 * - suspended: the record is suspended; only emergency access can view it.
 * - cancelled: the person cancelled the record; it is permanently deleted.
 * - not-authorised: the gateway refused this organisation or user (5104).
 * - not-connected: this system or organisation is not connected to My Health Record.
 * - unavailable: the service could not be reached.
 */
export type MyHealthRecordAccessState =
  | 'not-checked'
  | 'no-record'
  | 'available'
  | 'access-code-required'
  | 'restricted-documents'
  | 'emergency-access'
  | 'suspended'
  | 'cancelled'
  | 'not-authorised'
  | 'not-connected'
  | 'unavailable';

/** Tone of a state: drives the icon and text style, never colour alone. */
export type MyHealthRecordTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Display text for each state: short status (banner) and an explanation (expanded panel). */
export interface MyHealthRecordStateText {
  status: string;
  detail: string;
  tone: MyHealthRecordTone;
}

/** The product name as published by ADHA. */
export const MY_HEALTH_RECORD_NAME = 'My Health Record';

/**
 * Wording per state. Status lines are library text [suggested] built on the ADHA and OAIC descriptions quoted in the
 * detail lines; override any of them with the component's `texts` prop.
 */
export const MY_HEALTH_RECORD_STATE_TEXT: Record<MyHealthRecordAccessState, MyHealthRecordStateText> = {
  'not-checked': { status: 'Not checked', detail: 'The system has not checked whether this person has a My Health Record.', tone: 'neutral' },
  'no-record': { status: 'No record found', detail: 'No My Health Record was found for this person.', tone: 'neutral' },
  available: { status: 'Record available', detail: 'Documents set to general access can be viewed.', tone: 'success' },
  'access-code-required': {
    status: 'Access code required',
    detail:
      'The person has set a record access code. You cannot view the record unless they give you the code. You can still upload documents.',
    tone: 'warning',
  },
  'restricted-documents': {
    status: 'Some documents restricted',
    detail:
      'The person has restricted some documents. Restricted documents can be viewed only with their limited document access code.',
    tone: 'info',
  },
  'emergency-access': {
    status: 'Emergency access',
    detail:
      'Viewed with the emergency access function. Access includes restricted documents, lasts 5 days, and is recorded in the access history.',
    tone: 'danger',
  },
  suspended: {
    status: 'Record suspended',
    detail: 'The record is suspended. Healthcare providers cannot access it, except in an emergency. Documents are not being added.',
    tone: 'warning',
  },
  cancelled: {
    status: 'Record cancelled',
    detail: 'The person cancelled their My Health Record. The information was permanently deleted and no one can view it.',
    tone: 'neutral',
  },
  'not-authorised': { status: 'Not authorised', detail: 'You are not authorised to access this record.', tone: 'warning' },
  'not-connected': {
    status: 'Not connected',
    detail: 'This system is not connected to My Health Record. Check the record another way if you need it.',
    tone: 'neutral',
  },
  unavailable: { status: 'Unavailable', detail: 'My Health Record could not be reached. Try again later.', tone: 'warning' },
};

/** Access code rules: RAC and LDAC are 4 to 8 characters, and the two codes cannot be the same (ADHA). */
export const MY_HEALTH_RECORD_ACCESS_CODE = { minLength: 4, maxLength: 8 } as const;

/** Emergency access lasts 5 days, then access reverts to the person's settings (OAIC; ADHA fact sheets). */
export const MY_HEALTH_RECORD_EMERGENCY_ACCESS_DAYS = 5;

/** Statutory grounds for emergency access (My Health Records Act 2012 s 64, as stated by OAIC). */
export type MyHealthRecordEmergencyGround = 'individual' | 'public';

/**
 * Emergency access wording. `declaration` is the text the ADHA developer guide says must be shown, copied as published
 * [UNCERTAIN: it ends "or to public health" while OAIC states the ground as "public health or safety"; override if
 * ADHA confirms other wording]. Grounds and exclusions are from OAIC.
 */
export const MY_HEALTH_RECORD_EMERGENCY_TEXT = {
  title: 'Emergency access',
  declaration:
    "By selecting Emergency Access you are declaring that access to this My Health Record is necessary to lessen or prevent a serious threat to an individual's life, health or safety, or to public health.",
  conditionsTitle: 'Conditions of emergency access',
  conditions: [
    "Use it only when access is necessary to lessen or prevent a serious threat to an individual's life, health or safety and it is unreasonable or impracticable to get the person's consent, or when it is necessary to lessen or prevent a serious threat to public health or safety.",
    "Do not use it to view your own or a family member's record, to demonstrate the function, to check whether restricted documents exist, or because an access code was forgotten.",
    'Access lasts 5 days and includes restricted documents. Documents the person removed are not available.',
  ],
  grounds: [
    {
      value: 'individual' as MyHealthRecordEmergencyGround,
      label: "Serious threat to an individual's life, health or safety, and consent cannot reasonably or practicably be obtained",
    },
    { value: 'public' as MyHealthRecordEmergencyGround, label: 'Serious threat to public health or public safety' },
  ],
  reasonLabel: 'Circumstances, and why consent could not be obtained',
  acknowledgement:
    "I understand that this access is recorded in the person's access history, the System Operator is notified, the person may be notified, and my use will be audited.",
  confirm: 'Confirm emergency access',
} as const;

/** Notice that some content may be missing because of the person's choices [suggested, MHR-05]. */
export const MY_HEALTH_RECORD_INCOMPLETE_NOTICE =
  'The person can restrict or remove documents, so the record may not hold everything. Absence of a document does not mean it does not exist.';

/** Shown when the person has asked that a document not be uploaded (OAIC: "must do as they ask"). */
export const MY_HEALTH_RECORD_DO_NOT_UPLOAD_TEXT = 'Do not upload: the person asked that this not be uploaded to My Health Record';
