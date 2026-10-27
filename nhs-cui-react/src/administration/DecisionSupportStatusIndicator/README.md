# DecisionSupportStatusIndicator

Compact indicator showing whether decision support is fully running, expanding to the list of decision support services and their states.

## When to use

- In the application header or toolbar, to communicate decision support capability at all times.

## What you provide

- `services` (`{ id, name, state: 'running' | 'notRunning' | 'unavailable', since }`), or an explicit `state`.
- Optional `changedSinceViewed`, `notification` (change pop-up), `onOpenHelp`, `onConfigure`, `expanded` or `defaultExpanded`.

```tsx
<DecisionSupportStatusIndicator
  services={services}
  changedSinceViewed={!viewed}
  notification={change && { key: change.id, dateTime: change.at, message: change.text }}
  onOpenHelp={id => openHelp(id)}
/>
```

## Guidance implemented

- 2.1.1: short title "Decision Support" with the chevron inside the same box; neutral colour when fully running, attention colour plus warning symbol when not, and a change icon when changed since last viewed (three states); optional flashing.
- 2.1.1: pop-up near the title with date and 24-hour time and the change text, fading after 5 to 10 seconds.
- 2.1.2: services listed alphabetically; running in bold with a green tick, not running in bold with a red cross, not available in grey regular text; no checkboxes.
- 2.1.2: tooltip "This service has been unavailable since 12-Jan-2007; 10:42"; selecting a service opens Help at that service; Help link; configure link; vertical scroll for long lists.

## Do and don't

- Do clear `changedSinceViewed` once the user has opened the list.
- Don't rely on the colour of the box alone; state is also given by the symbol and text.
- [suggested] Flashing is off by default, slower than 3 per second, and disabled for reduced motion. The state word shown beside each service is [suggested].

## Accessibility

- The box is a button with `aria-expanded`; its accessible name includes the overall state.
- Each service includes its full tooltip text for screen readers; Esc closes the list and returns focus.

## Regional behaviour

No differences between GB, AU and NZ: the decision support and Nil by Mouth guidance has no AU or NZ counterpart in G10 or G11. Dates and times use the shared formats.
