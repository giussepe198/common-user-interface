# LabelledValue

A label and value pair in label text and data text styles, used inside the patient banners and for any read-only identification item.

## When to use

- Showing a single identification item such as "Born 14-Jul-1945 (81y)" or "NHS No. 999 000 0018".
- Building custom banner sections that must follow the banner label rules.

## What you provide

- `label` (no colon), `value` (text or elements), optional `definition` for a tooltip, `onOpenRecord` to make the value a button, `layout` "inline" or "stacked".

```tsx
<LabelledValue label="Born" value="14-Jul-1945 (81y)" definition="The patient's date of birth" />
<LabelledValue label="Mobile" value={null} />   {/* shows "Mobile Not Known" */}
```

## Guidance implemented

- PAB-0019, MPB-0022 [M]: an empty value, or a value of "?" or "-", shows "Not Known" (or `unknownText`) after the label.
- PAB-0042, MPB-0039 [M]: no colon; a trailing colon in `label` is removed.
- PAB-0044..0046, MPB-0041..0043 [M]: label in small muted label style, value in larger semibold data style.
- PAB-0047, MPB-0044 [R]: `definition` gives a tooltip that opens on hover and on keyboard focus.
- PAB-0048 [R]: `onOpenRecord` makes the value a button with the tooltip "Click here to open this section of the record.".
- Unknown values are shown in italic regular weight so missing data is visible at a glance [suggested].

## Do and don't

- Do pass `null` for missing data.
- Don't put a colon or other punctuation in labels.
- Don't use it for editable fields.

## Accessibility

- The definition term is focusable, linked to its tooltip with `aria-describedby`, and closes with Esc.
- The open-record control is a real `button`.

## Regional behaviour

- Not region-dependent. Regional components pass their own labels (for example "IHI", "NHI", "Sex recorded at birth").
