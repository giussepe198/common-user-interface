# SensitiveCharacteristicInput

The variations of sex characteristics or sexual orientation (NZ: sexual identity) question with the exact national wording and codes, opt-in and marked "Sensitive".

## When to use

- Only where the service has a purpose for collecting it and the host has enabled it (`enabled`). It renders nothing otherwise.
- Not for sex recorded at birth or gender: use `SexGenderInput`.

## What you provide

- `topic`: "variations-of-sex-characteristics" or "sexual-orientation"; `enabled`; `region` (or the provider).
- `value`/`onChange({ code, detail? } | null)` or `defaultValue`; `administration` ("self" or "interviewer"); `purpose`; `questionSet` to substitute a local set; `error`.

```tsx
<SensitiveCharacteristicInput enabled={settings.collectSexualOrientation} topic="sexual-orientation" value={so} onChange={setSo} purpose="Asked to tailor screening. You do not have to answer." />
```

## Guidance implemented

- ABS 2020 (AU) [M]: "Were you born with a variation of sex characteristics (sometimes called 'intersex' or 'DSD')?" Yes 1/Y, No 2/N, Don't know 3/U, Prefer not to answer 4/Z; interviewer wording without brackets as the allowable alternative.
- ABS 2020 (AU) [M]: "How do you describe your sexual orientation?" Straight (heterosexual) 1/S, Gay or lesbian 2/G, Bisexual 3/B, I use a different term (please specify) 4/T with a write-in, Don't know 5/U, Prefer not to answer 6/Z; recommended age 15 and over (shown).
- ABS [M]: one response only; no assumptions; never answer for another person.
- Stats NZ VSC v1.0.0 (NZ) [M]: "Were you born with a variation of sex characteristics (otherwise known as an intersex variation)?" Yes 1, No 2, Don't know 4, Prefer not to say 5 (coded as Refused to answer [suggested mapping]).
- Stats NZ SCSI v1.0 (NZ) [M]: "Which of the following options best describes how you think of yourself?" with example 2 options; codes 01, 02, 03, 09 (with "please state"), 44, 55 [suggested mapping of the example options]; not by proxy; age 15 and over.
- The ABS alternative options (Asexual, Pansexual, Queer, Gay and Lesbian split) have no published codes [UNCERTAIN] and are not offered; supply a `questionSet` if you have codes.
- Opt-in rendering, "Sensitive" marker, "Clear answer" and no pre-fill are [suggested].

## Do and don't

- Do explain why you ask and that the person need not answer.
- Do prefer self-completion (Stats NZ recommends it for sensitive questions).
- Don't ask by proxy or record from appearance.

## Accessibility

- `fieldset` and `legend` with the exact question; the sensitivity note is linked with `aria-describedby`; radios with visible labels; arrow keys move within the group.

## Regional behaviour

- AU: ABS 2020 standard. NZ: Stats NZ 2021 VSC and 2019 sexual identity standards, labelled "Sexual identity". GB: no value set in the notes; renders nothing unless `questionSet` is given.
- Sources: G12 section 7.
