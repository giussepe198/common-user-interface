# PatientNameInput

Labelled fields for entering a patient's Title, Family Name, Given Name, Middle name(s), Suffix and Known as, in a fixed order.

## When to use

- Registering or editing a patient's name.
- Use `layout="inline"` only when vertical space is tight (NID-0051).

## What you provide

- `value`/`onChange` (controlled) or `defaultValue`, `layout`, `fields` to show a subset, `required`, `errors` per field, label/prompt/tooltip overrides.

```tsx
<PatientNameInput
  value={name}
  onChange={setName}
  fields={['title', 'familyName', 'givenName', 'preferredName']}
/>
```

## Guidance implemented

- NID-0014..0046 [M/R]: maximum lengths (Title 35, Family Name 40, Given Name 35, Middle name(s) 100, Suffix 35, Known as 35) and widths (Title at least 4 characters, others 14 characters, minimum 8).
- NID-0016, NID-0017, NID-0019 [R]: Title drop-down with Mr, Mrs, Ms, Dr, Rev, Sir, Lady, Lord, Dame, Other...; choosing "Other..." moves focus to a free-text box.
- NID-0020, NID-0026, NID-0032, NID-0037, NID-0042 [M]: free-text boxes for the other fields.
- NID-0025 [R]: Family Name is changed to upper case when the field is left; typing keeps whatever case was used.
- NID-0031 [R]: Given Name first letters are capitalised when the field is left.
- NID-0047..0051 [M/R]: InForm (default) stacks fields with labels to the left and boxes aligned on their left edge; InLine wraps only between whole fields; field order never changes.
- NID-0052..0054 [M/R]: every field has a visible `<label for>` with the recommended wording.
- NID-0055..0059, NID-0062..0064 [R/M]: prompts such as "e.g. SMITH" and "e.g. John", italic and lighter than data, removed as soon as typing starts.
- NID-0060, NID-0061 [R]: tooltips from the guide on every field ("Known as" wording corrected).

Where the source documents disagree (the safer option is used):

- Family Name maximum length: the full guide says 35, the QIG and PDS say 40. 40 is used so that no PDS name is ever truncated (NID-0011).
- Minimum data set: section 2.2.10 says Family Name and Given Name, section 2.2 adds Title. Family Name and Given Name are required by default; Title is optional because forcing a title encourages made-up values for patients who have none (children, for example). Change with `required`.

[suggested] additions:

- Required fields show "(required)" after the label and an error after the field is left empty: "Enter the family name".
- Middle name(s) uses a 14-character box: the guide's optimal width (7) is smaller than its minimum (8).
- The Title "Other..." box is labelled "Title other" for assistive technology.

## Do and don't

- Do keep the field order.
- Do accept any case while typing.
- Don't add a separate "Middle initial" or merge Title into Given Name.

## Accessibility

- Each input is linked to its label; required fields set `aria-required`; errors use `aria-invalid`, `aria-describedby` and `role="alert"`.
- Native `select` for Title keeps keyboard and screen reader behaviour standard.

## Regional behaviour

- GB: unchanged: NHS CUI labels and lengths, family name upper-cased on leaving the field (NID-0025).
- AU: labels "Family name", "Given name", "Middle name(s)", "Preferred name"; 40 characters per name ([UNCERTAIN] METeOR length). Names are kept in the case the person gives; upper case is a display transform only (METeOR 613331). Hyphens are kept without spaces.
- NZ: HISO 10046 labels "Family name", "Given name", "Other given name(s)" and lengths (title 10, given 50, other given 100, family 100, suffix 5); case kept as given.
- AU and NZ: "This person has only one name" records a single name in the family name field and removes the given-name requirement (METeOR 613331, HISO 10046) [suggested control].
- All regions: NFC normalisation on leaving a field; macrons, apostrophes, ʻokina and other diacritics are accepted (G11 2.3, 11.1).
- Not built: name usage type (METeOR, [UNCERTAIN] codes), NZ name source codes and name protection flag.
