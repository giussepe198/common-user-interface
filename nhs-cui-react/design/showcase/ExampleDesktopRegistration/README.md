# ExampleDesktopRegistration

Updating a patient record: name, date of birth, sex and gender, region identifiers (NHS number; IHI, URN, Medicare with valid to date and DVA; NHI with dormant handling), address lookup and telephone, with the AU and NZ questions shown only in their region. The patient banner above previews the record as it is typed.

## Components used

- PatientBanner
- PatientNameInput
- DateInput
- PartialDateOfBirthInput
- SexGenderInput
- PatientIdentifierInput
- DvaNumberInput
- AddressInput
- TelephoneNumberInput
- IndigenousStatusInput
- MyHealthRecordStatus
- EthnicityInput
- MaoriDescentInput
- IwiInput
- ProtectionFlagInput

## Source

`examples/desktop-registration.tsx` in the package. Open `docs/site/desktop-registration.html` locally to switch region (GB, AU, NZ) and theme.
