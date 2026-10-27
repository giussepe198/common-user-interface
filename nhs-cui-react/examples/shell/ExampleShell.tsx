import React, { useState } from 'react';
import { ClinicalLocaleProvider } from '@clinical-cui/react';
import type { ClinicalRegion } from '@clinical-cui/react';

export interface ExampleMeta {
  /** Page title, sentence case. */
  title: string;
  /** One or two sentences: what the screen shows and which components it composes. */
  description: string;
  /** desktop: fluid page at 1280 to 1600 px. mobile: one or more 390 x 844 phone frames side by side. */
  kind: 'desktop' | 'mobile';
  /** Regions this example supports; the first is the default. */
  regions: ClinicalRegion[];
  /** Component names used, for the docs index. */
  components: string[];
}

export interface ExampleShellProps {
  meta: ExampleMeta;
  /** Content for the chosen region. */
  children: (region: ClinicalRegion) => React.ReactNode;
}

const REGION_LABEL: Record<ClinicalRegion, string> = { GB: 'UK (NHS)', AU: 'Australia', NZ: 'New Zealand' };

function readInitial<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = new URLSearchParams(window.location.search).get(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    /* no location in some hosts */
  }
  return fallback;
}

/**
 * Docs-only frame around an example: region and theme switches, title and description.
 * Not part of the library. Query string ?region=AU&theme=dark&chrome=0 sets the initial state
 * (chrome=0 hides the toolbar, used for screenshots and the design system showcase).
 */
export function ExampleShell({ meta, children }: ExampleShellProps) {
  const [region, setRegion] = useState<ClinicalRegion>(() => readInitial('region', meta.regions, meta.regions[0]));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readInitial('theme', ['light', 'dark'] as const, document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'));
  const chrome = readInitial('chrome', ['0', '1'] as const, '1') === '1';

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const seg = (on: boolean): React.CSSProperties => ({
    minHeight: 36, padding: '0 12px', border: '1px solid var(--border-strong)', marginLeft: -1,
    background: on ? 'var(--accent-surface)' : 'var(--surface)', color: 'var(--ink)', fontFamily: 'inherit',
    fontSize: 14, fontWeight: on ? 700 : 400, cursor: 'pointer',
  });

  return (
    <div className="cui-root" data-theme={theme} style={{ background: 'var(--surface-sunken)', color: 'var(--ink)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {chrome ? (
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              <a href="index.html" style={{ color: 'var(--accent)' }}>Clinical CUI examples</a> · {meta.kind === 'mobile' ? 'Mobile' : 'Desktop'}
            </div>
            <h1 style={{ margin: '2px 0 4px', fontSize: 20, lineHeight: '26px' }}>{meta.title}</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)', maxWidth: 900 }}>{meta.description}</p>
          </div>
          {meta.regions.length > 1 ? (
            <div role="group" aria-label="Region" style={{ display: 'flex', paddingLeft: 1 }}>
              {meta.regions.map(r => (
                <button key={r} type="button" aria-pressed={r === region} onClick={() => setRegion(r)} style={seg(r === region)}>{REGION_LABEL[r]}</button>
              ))}
            </div>
          ) : null}
          <div role="group" aria-label="Theme" style={{ display: 'flex', paddingLeft: 1 }}>
            {(['light', 'dark'] as const).map(t => (
              <button key={t} type="button" aria-pressed={t === theme} onClick={() => setTheme(t)} style={seg(t === theme)}>{t === 'light' ? 'Light' : 'Dark'}</button>
            ))}
          </div>
        </header>
      ) : null}
      <ClinicalLocaleProvider region={region} key={region}>
        {meta.kind === 'mobile' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, padding: 24, alignItems: 'flex-start' }}>{children(region)}</div>
        ) : (
          <main style={{ padding: 24, maxWidth: 1600 }}>{children(region)}</main>
        )}
      </ClinicalLocaleProvider>
    </div>
  );
}

export interface PhoneFrameProps {
  /** Caption above the frame, e.g. "1. Worklist". */
  caption: string;
  children: React.ReactNode;
}

/** A 390 x 844 phone-sized viewport (no fake status bar). Content scrolls inside it. */
export function PhoneFrame({ caption, children }: PhoneFrameProps) {
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <figcaption style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-muted)' }}>{caption}</figcaption>
      <div style={{ width: 390, height: 844, overflow: 'auto', position: 'relative', background: 'var(--surface-sunken)', border: '1px solid var(--border-strong)', borderRadius: 24, boxShadow: 'var(--shadow-dialog)', transform: 'translateZ(0)' }}>
        {children}
      </div>
    </figure>
  );
}
