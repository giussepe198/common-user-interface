# AppShell

Application frame for every clinical screen: skip link, environment banner, top bar, collapsible side navigation, sticky patient banner slot and the main region.

## When to use

- Once per app, around every signed-in page (workspace, platform console).
- Not for sign-in pages or the consumer portal.

## What you provide

- `navigation`: SideNav props (`groups`, `current`, `onSelect`, `label`, `header`); the shell renders it inline, as an icon rail (`navCollapsed`, `defaultNavCollapsed`, `onNavCollapsedChange`) or in a drawer.
- Top bar slots: `brand` (organisation) and `brandCompact` (its phone form, e.g. the mark alone), `context` (working context switcher), `search`, `actions`, `help`, `account` (MenuButtons).
- `environmentBanner`: a string such as "Demo: synthetic data only" (shown with the warning icon and words) or a node.
- `notices`: service notices under the environment banner and above the top bar (offline, read-only, maintenance).
- `contextBar`: a strip at the top of the content column, above the patient banner (an emergency access notice for the whole record).
- `patientBanner` (the patient area's PatientBanner) and `patientBannerCompact` (MobilePatientHeader) for phones.
- `mobileTabs`: MobileTabBar props for the phone tab bar. With `mobileMoreTab` the shell adds a last "More" tab (`labels.moreTab`) that opens the navigation drawer, keeps at most four of your tabs before it, and drops the top bar's menu button on phones.
- `mainId` (default "main"), `labels` (skip link, navigation buttons, drawer title), `contentPadding`.

```tsx
<AppShell
  environmentBanner="Demo: synthetic data only"
  brand={<strong>Riverside Mental Health</strong>}
  context={<ContextSwitcher />}
  help={<MenuButton label="Help" iconOnly icon="help" items={helpItems} />}
  account={<MenuButton label="Ana Silva" align="end" items={accountItems} />}
  navigation={{ groups, current: 'caseload', onSelect: go }}
  patientBanner={<PatientBanner {...patient} />}
  patientBannerCompact={<MobilePatientHeader {...patient} />}
  mobileTabs={{ items: MOBILE_RECORD_TABS, current: 'summary', onSelect: go }}
>
  <PageHeader title="Caseload" />
</AppShell>
```

## Guidance implemented

- PAB-0009 [M]: the patient banner sits at the top of the content, below the title bar and global navigation, and stays in view (sticky) while the page scrolls.
- [suggested] Responsive by container width, not viewport: from 900 px the side navigation is inline and can collapse to a 48 px icon rail; under 900 px it becomes a drawer opened from the top bar; under 600 px the phone tab bar and the compact patient banner (when given) appear. No horizontal page scroll at 320 px.
- WCAG 2.4.1 [M]: a skip link is the first focus stop and targets the main landmark (focusable with `tabIndex=-1`).
- The working context is always shown; on phones it takes its own line instead of being hidden [suggested].
- On phones the main destinations are one tap away in the tab bar and everything else is behind More, so the top bar keeps only the organisation, the context, help and the account [suggested].
- The environment banner is not dismissible and says its meaning in words, with the warning icon [suggested].

## Regional behaviour

- None: every word is supplied by the consumer or has an overridable default in UK, AU and NZ English. Te reo Māori labels keep their macrons and can carry `lang="mi"` where the control offers it.

## Do and don't

- Do render one AppShell per page and put the page's PageHeader first in `children`.
- Do pass a compact patient banner for phone layouts so identity is never squeezed out.
- Don't render overlays with `portal={false}` inside the shell: the shell root is a size container, which traps fixed layers. Dialog, Drawer and the touch sheets portal by default.
- Don't put clinical information in the top bar.

## Accessibility

- Landmarks: one `header` (banner) for the top bar, `nav` for the side navigation, `main` for the content.
- The navigation buttons say what they do ("Open navigation", "Collapse navigation") and report `aria-expanded`.
- The navigation drawer is a modal Drawer: focus moves in, Esc closes, focus returns to the menu button, and global shortcuts do not fire behind it.
- Targets are 44 px on coarse pointers.
