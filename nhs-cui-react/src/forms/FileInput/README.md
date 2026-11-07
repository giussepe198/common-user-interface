# FileInput

Choose files with a button or by dropping them on the area; lists the chosen files and says why any were turned down.

## When to use
- Attaching documents or images to a form. The control only chooses files: uploading, scanning and storage belong to the host.

## What you provide
- Put it in a `FormField` (its label names the button). `value` and `onChange(files)` or `defaultValue`, `accept` (native format, e.g. ".pdf,image/*") with `acceptText` in plain words, `multiple`, `maxSizeBytes`, `maxFiles`, `onReject(rejections)`.

```tsx
<FormField label="Referral letter" prompt="One file">
  <FileInput accept=".pdf" acceptText="PDF" maxSizeBytes={20 * 1024 * 1024} onChange={setFiles} />
</FormField>
```

## Guidance implemented
- [suggested] A real button is the primary way in; dropping is an extra for pointers. The drop area shows "Release to add" while a file is over it.
- [suggested] Turned-down files are listed with the reason in words (type, size, count) and an icon, and reported to the host.
- [suggested] Chosen files are listed with name and size and a remove button; changes are announced politely.

## Regional behaviour
None.

## Do and don't
- Do say the allowed types and the size limit in `acceptText` and `maxSizeBytes`.
- Don't treat the file as safe because it matched `accept`: the host must still scan it.

## Accessibility
- The button is named by FormField's label and described by the drop hint and limits. `aria-labelledby` [suggested] names it by the label and its own words together ("Logo Choose file"), so the action is in the name. The native file input is hidden from the tab order and from screen readers.
- Remove buttons name the file ("Remove letter.pdf"); 44px targets on coarse pointers.
