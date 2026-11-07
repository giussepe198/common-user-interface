# SupportPersonList

The person's carers, nominated support person, guardian, whānau and other support people, with role words from the host, contact details, contact preferences and what each may be told.

## When to use

- The support people screen, the person summary and any decision point that may involve them.

## What you provide

- `people` (`SupportPerson[]`: `name`, `roles` with `legal` for roles with standing under the Act, `relationship`, `members` for a group, `phones`, `email`, `contactPreferences`, `sharing` state and text, `primary`, `ended`).
- Per person, optionally: `notices` (safety notices in words, shown first: "Do not contact" as `danger`, "Do not involve" as `warning`), `details` (more labelled facts), `actions` (the host's commands beside the name, each named for the person) and `content` (more at the end of the card, such as statutory roles with their dates and commands) [suggested].
- `title`, `showEnded`, `onOpen`, `onAdd`, `showSharing` (default true; false where what each person may be told is shown on another screen, so a card never says "not recorded" for sharing recorded elsewhere), `sharingLabels`, `emptyText`, `headingLevel`, `timeZone`, `region`.

```tsx
<SupportPersonList people={links} onOpen={openLink} onAdd={addLink} region="NZ" />
```

## Guidance implemented

Part of the mental health extension. The NHS CUI guidance has no mental health documents, so rules without a CUI guideline ID are this library's own and marked [suggested]. Legal words, order names, value sets and time limits come from the host as props; the control decides no legal or clinical fact.

- One card per related person or group, with relationship and roles (carer, nominated support person, guardian, whānau) in the host's words; legal roles in the legal style (square corners; bar; scale icon) [suggested].
- An ended or revoked nomination stays available with its date and reason; hidden by default with a count [suggested].
- "May be told" through `ConsentIndicator`; nothing recorded reads "Sharing preferences not recorded", never allowed [suggested].
- Contact preferences in words [suggested].
- Safety notices ("Do not contact", "Do not involve") first on the card, in words with a symbol and the inline-start bar; colour never alone [suggested layout]. A `danger` notice leaves the person's numbers as text, never call links.
- Numbers through `patient/TelephoneNumberDisplay` (TID-0015) as `tel:` links.
- G11: te reo Māori words (whānau) and macrons are kept as given.
- Cards in a grid that falls to one column on a narrow container [suggested].

## Do and don't

- Do pass the role words the host uses for its Act (for example "nominated support person" in Victoria [verify]).
- Don't infer what a person may be told from their role; pass the recorded consent.

## Accessibility

- A labelled section; each person has a heading (a button when `onOpen` is given); roles and sharing are words with icons.

## Regional behaviour

- Telephone formats by region; role words differ by jurisdiction and come from the host.
