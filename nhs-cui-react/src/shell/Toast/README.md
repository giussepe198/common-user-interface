# Toast

Short message that appears at the edge of the screen; `ToastProvider` holds the stack and its live regions and `useToast()` shows them.

## When to use

- Passing confirmation of something the person just did ("Letter sent to the GP").
- An error the person must see that is not tied to a field (it stays until dismissed).
- Never the only place a clinical fact or a field error is shown: use Message on the page [suggested].
- For an undo window on phones use the touch area's UndoToast.

## What you provide

- `<ToastProvider regionLabel duration max dismissLabel bottomOffset>` once near the root.
- `const toast = useToast(); toast.show({ tone, title, description?, action?, duration?, id? })`, `toast.dismiss(id)`, `toast.clear()`.
- `Toast` alone: `tone`, `title`, `description`, `action`, `onDismiss`, `dismissLabel`, `toneLabel`.

```tsx
const toast = useToast();
toast.show({ tone: 'success', title: 'Letter sent to the GP' });
toast.show({ tone: 'error', title: 'Letter not sent', description: 'The mail service did not answer.' });
```

## Guidance implemented

- Errors and warnings never leave by themselves; the person dismisses them [suggested, WCAG 2.2.1].
- Info and success leave after `duration` (default 6 s) and pause while the pointer or focus is on the stack [suggested].
- Meaning by icon, words and colour together; screen readers hear the tone word first ("Error: Letter not sent").
- At most `max` toasts; the oldest info or success toast goes first, errors are never dropped [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English.

## Do and don't

- Do keep the title under about eight words.
- Do raise the stack above a phone tab bar with `bottomOffset={64}` in AppShell layouts with `mobileTabs`.
- Don't put patient identifiers in toasts.

## Accessibility

- A named `region` ("Notifications") holds two persistent live regions: `role="alert"` for errors and warnings, `role="status"` for the rest, so announcements are not lost.
- Dismiss buttons are named; Esc dismisses the focused toast; reduced motion cuts the entrance.
