import React, { useMemo, useState } from 'react';
import { themes } from '@architprasar/md4ai/react';
import { SiteBackdrop } from './components/SiteBackdrop.js';
import { SiteHeader } from './components/SiteHeader.js';
import { demoChromeVars, tokensToCSSVars, useStoredColorMode } from './theme.js';

const EXAMPLES = [
  {
    title: 'KPI card',
    json: `{
  "type": "kpi",
  "label": "Revenue",
  "value": "$167k",
  "change": "+18%",
  "period": "QoQ"
}`,
    markdown: `::kpi{label="Revenue" value="$167k" change="+18%" period="QoQ"}`,
    takeaway: 'Compact directive removes repeated keys and wrapper overhead.',
  },
  {
    title: 'Roadmap release badge',
    json: `{
  "type": "release",
  "name": "Agent Inbox",
  "status": "beta",
  "eta": "July 2026",
  "owner": "Core UX"
}`,
    markdown: `@release[name: Agent Inbox, status: beta, eta: July 2026, owner: Core UX]`,
    takeaway: 'Bridge markers stay short while still carrying UI-ready metadata.',
  },
  {
    title: 'Action block',
    json: `{
  "type": "action_group",
  "items": [
    { "type": "button", "label": "Export report", "variant": "primary", "href": "#" },
    { "type": "button", "label": "Open review", "variant": "secondary", "href": "/review" }
  ]
}`,
    markdown: `::button[Export report]{href="#" variant="primary"}
::button[Open review]{href="/review" variant="secondary"}`,
    takeaway: 'Repeated UI elements stay readable without nested arrays and wrappers.',
  },
  {
    title: 'Mixed report section',
    json: `{
  "type": "report_section",
  "title": "Q2 Summary",
  "items": [
    { "type": "callout", "variant": "note", "content": "East region leads growth." },
    { "type": "kpi", "label": "Revenue", "value": "$167k", "change": "+18%" },
    { "type": "table", "head": ["Region", "Status"], "rows": [["East", "On track"], ["South", "At risk"]] }
  ]
}`,
    markdown: `## Q2 Summary

> [!NOTE]
> East region leads growth.

::kpi{label="Revenue" value="$167k" change="+18%"}

| Region | Status |
| --- | --- |
| East | On track |
| South | At risk |`,
    takeaway: 'The biggest savings come when prose and structured UI live in one response.',
  },
];

export default function TokenEfficiencyPage() {
  const [isDark, setIsDark] = useStoredColorMode();
  const theme = themes.zinc[isDark ? 'dark' : 'light'];
  const cssVars = useMemo(() => ({
    ...tokensToCSSVars(theme),
    ...demoChromeVars(isDark),
  }), [theme, isDark]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative', overflowX: 'hidden', ...cssVars }}>
      <SiteBackdrop height={520} />
      <SiteHeader
        currentPage="efficiency"
        position="sticky"
        rightSlot={(
          <button onClick={() => setIsDark((d) => !d)} className="btn-icon">
            {isDark ? 'Light' : 'Dark'}
          </button>
        )}
      />

      <main style={{ position: 'relative', padding: '4rem 1.5rem 5rem' }}>
        <section style={{ maxWidth: 1120, margin: '0 auto 2rem' }}>
          <span className="playground-intro__eyebrow">Efficiency</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 0.98, letterSpacing: '-0.06em', marginBottom: '1rem', maxWidth: 840 }}>
            Often helps reduce output tokens compared with custom UI JSON.
          </h1>
          <p style={{ maxWidth: 760, color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: 1.75, marginBottom: '1.2rem' }}>
            md4ai is not just easier to prompt than schema-heavy UI JSON. In many real response shapes it is also smaller. Compact markdown directives reduce repeated keys, wrapper objects, and repair-cost retries when models drift from strict JSON schemas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
            {[
              ['Where it wins', 'KPI grids, roadmap updates, action blocks, and mixed prose + UI responses.'],
              ['Why it wins', 'Less nesting, less punctuation, fewer repeated keys like type/props/content/items.'],
              ['Important nuance', 'It often helps reduce output tokens, but it is not universally smaller than every custom protocol.'],
            ].map(([title, copy]) => (
              <div key={title} className="playground-stat">
                <strong>{title}</strong>
                <span>{copy}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1120, margin: '0 auto 2rem' }}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {EXAMPLES.map((example) => (
              <div key={example.title} style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 18px 40px -30px rgb(15 23 42 / 0.2)',
              }}>
                <div style={{ padding: '1rem 1.1rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%, var(--surface) 100%)' }}>
                  <strong style={{ display: 'block', fontSize: '1rem', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>{example.title}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{example.takeaway}</span>
                </div>
                <div className="docs-demo__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div className="docs-demo__editor" style={{ borderRight: '1px solid var(--border)', minWidth: 0 }}>
                    <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 0.95rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Custom JSON
                    </div>
                    <pre style={{ margin: 0, padding: '1rem', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.79rem', lineHeight: 1.7, color: 'var(--text)', background: 'var(--surface)' }}>{example.json}</pre>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ height: 34, display: 'flex', alignItems: 'center', padding: '0 0.95rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      md4ai markdown
                    </div>
                    <pre style={{ margin: 0, padding: '1rem', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.79rem', lineHeight: 1.7, color: 'var(--text)', background: 'var(--surface)' }}>{example.markdown}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <style>{`
        @media (max-width: 768px) {
          .docs-demo__grid { grid-template-columns: 1fr !important; }
          .docs-demo__editor { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
