import React, { useMemo, useState, useEffect } from 'react';
import { parseStreaming } from 'md4ai/core';
import { renderContent } from 'md4ai/react';
import { BRIDGES } from './bridges.js';

// ── Shared tokens ─────────────────────────────────────────────────────────────

const SIDEBAR_W = 240;

const NAV: { label: string; id: string; children?: { label: string; id: string }[] }[] = [
  { label: 'Getting Started', id: 'getting-started' },
  { label: 'Quickstart', id: 'quickstart' },
  { label: 'Interactive Demos', id: 'interactive-demos' },
  {
    label: 'Syntax', id: 'syntax',
    children: [
      { label: 'Callouts', id: 'callouts' },
      { label: 'Charts', id: 'charts' },
      { label: 'Steps', id: 'steps' },
      { label: 'KPI Metrics', id: 'kpi-metrics' },
      { label: 'Cards', id: 'cards' },
      { label: 'Layout', id: 'layout' },
      { label: 'Buttons', id: 'buttons' },
      { label: 'Inputs', id: 'inputs' },
      { label: 'Video', id: 'video' },
      { label: 'Task Lists', id: 'task-lists' },
      { label: 'Tables', id: 'tables' },
    ],
  },
  {
    label: 'Bridge System', id: 'bridges',
    children: [
      { label: 'Live Bridge Demo', id: 'bridge-demo' },
      { label: 'Define', id: 'bridge-define' },
      { label: 'Patterns', id: 'bridge-patterns' },
      { label: 'Register', id: 'bridge-register' },
      { label: 'AI Prompt', id: 'bridge-prompt' },
      { label: 'Host Data', id: 'bridge-host' },
    ],
  },
  { label: 'Themes', id: 'themes' },
  { label: 'Highlighting', id: 'highlighting' },
  { label: 'Overrides', id: 'overrides' },
  { label: 'Streaming', id: 'streaming' },
  { label: 'API Reference', id: 'api' },
  { label: 'Why not MDX?', id: 'vs-mdx' },
];

const LIVE_DEMOS = {
  callouts: `> [!NOTE]
> East region leads this month with the strongest expansion pipeline.

> [!TIP]
> Reuse the same structure for recommendations and next steps.

> [!WARNING]
> Mobile parity slipped because API work landed later than planned.`,
  charts: `\`\`\`chart
{
  "type": "bar",
  "labels": ["North", "South", "East", "West"],
  "datasets": [
    {
      "label": "Pipeline coverage",
      "data": [124, 91, 147, 109],
      "backgroundColor": ["#7c3aed", "#7c3aed", "#7c3aed", "#7c3aed"]
    }
  ]
}
\`\`\``,
  steps: `\`\`\`steps
- [done] Confirm the roadmap theme set
- [active] Ship the AI workspace beta
  Design partner rollout starts this week.
- [planned] Publish the mobile recovery plan
- [planned] Finalize the launch narrative
\`\`\`

\`\`\`timeline
Discovery | done
Implementation | active | Core renderer work is already in review
QA | planned
Launch | planned
\`\`\``,
  kpis: `::kpi{label="Quarterly Revenue" value="$2.48M" change="+14%" period="QoQ"}
::kpi{label="Net Retention" value="112%" change="+3 pts" period="YoY"}
::kpi{label="Launch Confidence" value="78%" change="-4 pts" period="30 days"}`,
  cards: `:::card{title="Immediate action"}
Prioritize the mobile parity recovery plan before adding new roadmap scope.
:::

:::card{title="Leadership note"}
Reporting foundations are the dependency for three separate launches.
:::`,
  layout: `\`\`\`layout columns=2
### Strengths
- AI workspace demand is strong
- Reporting APIs are unblocking multiple teams

---

### Risks
- Mobile parity is slipping
- Export job reliability still needs follow-up
\`\`\``,
  buttons: `::button[Export roadmap brief]{href="#" variant="primary"}
::button[Open delivery review]{href="#" variant="secondary"}
::button[Download CSV]{href="#" variant="default"}

::input{type="text" placeholder="Ask for a deeper breakdown..." label="Follow-up"}`,
  video: `\`\`\`video
https://www.youtube.com/watch?v=dQw4w9WgXcQ
\`\`\``,
  tasks: `- [x] Lock roadmap themes
- [x] Confirm design partner cohort
- [ ] Publish mobile recovery milestones
- [ ] Review launch confidence with engineering leads`,
  tables: `| Theme | Owner | Confidence | Status |
| --- | --- | --- | --- |
| AI Workspace | Product + AI | 82% | On track |
| Reporting Foundations | Platform | 76% | Active |
| Mobile Parity | Mobile | 61% | At risk |
| Total | Product Org | 78% | Stable |`,
  bridge: `The next release is @release[name: Agent Inbox, status: beta, eta: July 2026, owner: Core UX].

If launch confidence drops, mark it as @release[name: Mobile parity, status: blocked, eta: TBD, owner: Mobile].`,
};

// ── Code block ────────────────────────────────────────────────────────────────

function Code({ children, lang = '' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
      <pre style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: '0.65rem', padding: '1rem 1.25rem',
        overflowX: 'auto', fontSize: '0.82rem', lineHeight: 1.8,
        fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)',
        margin: 0,
      }}>
        <code>{children.trim()}</code>
      </pre>
      <button onClick={copy} style={{
        position: 'absolute', top: '0.6rem', right: '0.6rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '0.4rem', padding: '0.2rem 0.55rem',
        fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

// ── Inline helpers ────────────────────────────────────────────────────────────

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em',
      color: 'var(--text)', marginTop: '3rem', marginBottom: '0.75rem',
      paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)',
      scrollMarginTop: 72,
    }}>
      {children}
    </h2>
  );
}

function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} style={{
      fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.015em',
      color: 'var(--text)', marginTop: '2rem', marginBottom: '0.5rem',
      scrollMarginTop: 72,
    }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.9rem', fontSize: '0.9rem' }}>{children}</p>;
}

function IC({ children }: { children: string }) {
  return (
    <code style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8em',
      background: 'var(--surface2)', color: 'var(--accent)',
      padding: '0.1em 0.35em', borderRadius: '0.3rem',
      border: '1px solid var(--border)',
    }}>{children}</code>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.25rem', border: '1px solid var(--border)', borderRadius: '0.65rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{
                padding: '0.55rem 1rem', textAlign: 'left',
                background: 'var(--surface2)', fontWeight: 600,
                fontSize: '0.75rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '0.55rem 1rem', color: 'var(--text)', verticalAlign: 'top' }}>
                  <span dangerouslySetInnerHTML={{ __html: cell }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ type, children }: { type: 'note' | 'tip' | 'warning'; children: React.ReactNode }) {
  const cfg = {
    note:    { color: '#3b82f6', bg: '#3b82f6', label: 'Note' },
    tip:     { color: '#16a34a', bg: '#22c55e', label: 'Tip' },
    warning: { color: '#d97706', bg: '#f59e0b', label: 'Warning' },
  }[type];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2rem 1fr', gap: '0.65rem',
      alignItems: 'start', borderRadius: '0.65rem', padding: '0.85rem 1rem',
      marginBottom: '1rem',
      background: `color-mix(in srgb, ${cfg.bg} 8%, var(--surface))`,
      border: `1px solid color-mix(in srgb, ${cfg.bg} 22%, var(--border))`,
    }}>
      <span style={{
        width: '2rem', height: '2rem', borderRadius: '0.4rem', flexShrink: 0,
        background: `color-mix(in srgb, ${cfg.bg} 18%, var(--surface))`,
        color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 800,
      }}>{cfg.label[0]}</span>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: cfg.color, marginBottom: '0.25rem', paddingTop: '0.45rem' }}>{cfg.label}</div>
        <div style={{ fontSize: '0.87rem', color: 'var(--text)', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}

function InteractiveDemo({
  title,
  description,
  initial,
  theme,
  minHeight = 300,
}: {
  title: string;
  description: string;
  initial: string;
  theme: Record<string, string>;
  minHeight?: number;
}) {
  const [source, setSource] = useState(initial);

  const rendered = useMemo(() => {
    try {
      return renderContent(parseStreaming(source, { bridges: BRIDGES }), {
        bridges: BRIDGES,
        theme,
      });
    } catch {
      return (
        <div style={{
          border: '1px solid #fca5a5',
          background: '#fff1f2',
          color: '#9f1239',
          borderRadius: '0.7rem',
          padding: '0.9rem 1rem',
          fontSize: '0.84rem',
        }}>
          This example did not parse cleanly. Keep editing and the preview will recover automatically.
        </div>
      );
    }
  }, [source, theme]);

  return (
    <section className="docs-demo" style={{
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      borderRadius: '1rem',
      overflow: 'hidden',
      marginBottom: '1.4rem',
      boxShadow: '0 18px 40px -30px rgb(15 23 42 / 0.2)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.95rem 1.05rem',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%, var(--surface) 100%)',
      }}>
        <div>
          <strong style={{ display: 'block', fontSize: '0.92rem', letterSpacing: '-0.02em', marginBottom: '0.15rem' }}>{title}</strong>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55 }}>{description}</span>
        </div>
        <button
          onClick={() => setSource(initial)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Reset
        </button>
      </div>
      <div className="docs-demo__grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' }}>
        <div className="docs-demo__editor" style={{ borderRight: '1px solid var(--border)', minWidth: 0 }}>
          <div style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.95rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface2)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            Markdown input
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              padding: '1rem',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              lineHeight: 1.7,
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            height: 34,
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.95rem',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface2)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
          }}>
            Rendered preview
          </div>
          <div style={{ padding: '1.15rem', overflowX: 'auto' }}>
            {rendered}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [isDark, setIsDark] = useState(false);
  const [active, setActive] = useState('getting-started');
  const flatNavIds = NAV.flatMap((section) => [section.id, ...(section.children?.map((child) => child.id) ?? [])]);

  const bg       = isDark ? '#09090b' : '#ffffff';
  const surface  = isDark ? '#0c0c0f' : '#ffffff';
  const surface2 = isDark ? '#18181b' : '#f4f4f5';
  const border   = isDark ? '#27272a' : '#e4e4e7';
  const text     = isDark ? '#fafafa' : '#09090b';
  const muted    = isDark ? '#a1a1aa' : '#71717a';
  const accent   = isDark ? '#e4e4e7' : '#18181b';
  const codeBg   = isDark ? '#18181b' : '#f4f4f5';
  const codeText = isDark ? '#f4f4f5' : '#18181b';

  const cssVars = {
    '--bg': bg, '--surface': surface, '--surface2': surface2,
    '--border': border, '--text': text, '--text-muted': muted,
    '--accent': accent, '--code-bg': codeBg, '--code-text': codeText,
  } as React.CSSProperties;

  const docsTheme = {
    bg,
    surface,
    surface2,
    border,
    text,
    textMuted: muted,
    accent,
    accentHover: accent,
    codeBg,
    codeText,
    font: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  };

  const roadmapDemo = `## Product Review

::kpi{label="Launch confidence" value="78%" change="-4 pts" period="This month"}
::kpi{label="Critical risks" value="3" change="+1" period="Current"}

\`\`\`steps
- [done] Lock roadmap themes
- [active] Ship AI workspace beta
  Design partner rollout starts this week.
- [planned] Publish mobile recovery plan
\`\`\`

| Theme | Owner | Status |
| --- | --- | --- |
| AI Workspace | Product + AI | On track |
| Mobile Parity | Mobile | At risk |
| Admin Controls | Platform | Healthy |`;

  useEffect(() => {
    const updateActive = () => {
      const headings = flatNavIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      let current = headings[0]?.id ?? 'getting-started';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 120) {
          current = heading.id;
        }
      }
      setActive(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [flatNavIds]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative', overflowX: 'hidden', ...cssVars }}>
      <div style={{
        position: 'absolute',
        inset: '0 0 auto',
        height: 520,
        pointerEvents: 'none',
        background: [
          'radial-gradient(circle at 12% 14%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 26%)',
          'radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 26%)',
          'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--bg)) 0%, transparent 100%)',
        ].join(', '),
      }} />

      {/* Top nav */}
      <header className="app-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: `color-mix(in srgb, var(--bg) 85%, transparent)`,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="app-header__identity">
          <div className="app-header__logo">
            <a href="./showcase.html" className="app-header__logo-text" style={{ textDecoration: 'none' }}>md4ai</a>
            <span className="app-header__tagline">rich markdown for AI</span>
          </div>
          <nav className="app-header__nav" style={{ gap: '1rem' }}>
            {[['showcase.html', 'Showcase'], ['index.html', 'Playground'], ['docs.html', 'Docs']].map(([href, label]) => (
              <a key={href} href={`./${href}`} style={{
                fontSize: '0.83rem', fontWeight: href === 'docs.html' ? 600 : 500,
                color: href === 'docs.html' ? 'var(--text)' : 'var(--text-muted)',
                textDecoration: 'none',
                background: href === 'docs.html' ? 'var(--surface2)' : 'transparent',
                border: href === 'docs.html' ? '1px solid var(--border)' : '1px solid transparent',
                borderRadius: '9999px',
                padding: '0.22rem 0.6rem',
              }}>{label}</a>
            ))}
            <a href="https://github.com/architprasar/md4ai" style={{
              fontSize: '0.83rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}>GitHub</a>
          </nav>
        </div>
        <div className="app-header__actions">
          <code className="playground-intro__code" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>npm install md4ai</code>
          <button onClick={() => setIsDark(d => !d)} className="btn-icon">
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', paddingTop: 52 }}>

        {/* Sidebar */}
        <aside style={{
          position: 'fixed', top: 52, bottom: 0, left: 0,
          width: SIDEBAR_W, overflowY: 'auto',
          borderRight: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
          padding: '1.1rem 0.85rem 1.5rem',
        }}>
          {NAV.map(section => {
            const sectionActive = active === section.id || Boolean(section.children?.some((child) => child.id === active));
            return (
            <div key={section.id} style={{
              marginBottom: '0.5rem',
              border: '1px solid',
              borderColor: sectionActive ? 'color-mix(in srgb, var(--accent) 16%, var(--border))' : 'transparent',
              borderRadius: '0.95rem',
              background: sectionActive ? 'color-mix(in srgb, var(--accent) 4%, var(--surface))' : 'transparent',
              padding: '0.3rem 0',
            }}>
              <a
                href={`#${section.id}`}
                style={{
                  display: 'block', padding: '0.42rem 0.9rem',
                  fontSize: '0.82rem', fontWeight: sectionActive ? 700 : 600,
                  color: sectionActive ? 'var(--text)' : 'var(--text)',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                }}
              >{section.label}</a>
              {section.children && (
                <div style={{
                  display: 'grid',
                  gap: '0.15rem',
                  marginTop: '0.1rem',
                  padding: '0.1rem 0.35rem 0.35rem',
                }}>
              {section.children.map(child => (
                <a
                  key={child.id}
                  href={`#${child.id}`}
                  style={{
                    display: 'block',
                    padding: '0.38rem 0.55rem 0.38rem 1rem',
                    fontSize: '0.77rem',
                    fontWeight: active === child.id ? 700 : 500,
                    color: active === child.id ? 'var(--text)' : 'var(--text-muted)',
                    textDecoration: 'none',
                    borderRadius: '0.7rem',
                    background: active === child.id ? 'var(--surface)' : 'transparent',
                    boxShadow: active === child.id ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                    border: active === child.id ? '1px solid var(--border)' : '1px solid transparent',
                    position: 'relative',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: '0.45rem',
                    top: '50%',
                    width: 5,
                    height: 5,
                    marginTop: -2.5,
                    borderRadius: '50%',
                    background: active === child.id ? 'var(--accent)' : 'var(--border)',
                  }} />
                  {child.label}
                </a>
              ))}
                </div>
              )}
            </div>
          )})}
        </aside>

        {/* Content */}
        <main style={{
          marginLeft: SIDEBAR_W,
          flex: 1, maxWidth: 740,
          padding: '3rem 3rem 8rem',
          minWidth: 0,
          position: 'relative',
        }}>

          <section className="playground-intro" style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '1rem' }}>
            <div className="playground-intro__copy">
              <span className="playground-intro__eyebrow">Docs</span>
              <h1>Build rich AI response UIs without forcing models to emit JSON.</h1>
              <p>Use the parser from <IC>md4ai/core</IC>, render with <IC>md4ai/react</IC>, and keep your app in plain markdown all the way through streaming.</p>
              <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <a href="./showcase.html" className="btn-icon btn-icon--active" style={{ textDecoration: 'none' }}>Open live demo</a>
                <a href="./index.html" className="btn-icon" style={{ textDecoration: 'none' }}>Open playground</a>
                <a href="https://github.com/architprasar/md4ai" className="btn-icon" style={{ textDecoration: 'none' }}>GitHub</a>
              </div>
              <Code lang="tsx">{`import { parse, parseStreaming, defineBridge } from 'md4ai/core';
import { renderContent, themes } from 'md4ai/react';`}</Code>
            </div>
            <div className="playground-intro__meta">
              {[
                ['Runtime-first', 'Stream markdown directly from your model without converting everything into JSON first.'],
                ['Composable UI', 'Mix plain markdown with KPIs, charts, steps, tables, cards, and your own bridge components.'],
                ['Production-ready', 'Graceful fallback behavior keeps partial or malformed content from breaking the message UI.'],
              ].map(([title, copy]) => (
                <div key={title} className="playground-stat">
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sample-rail" style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '1rem' }}>
            {[
              ['Start here', 'Read the quickstart and then edit the live examples below.'],
              ['Best for', 'Chat UIs, dashboards, agent tools, reports, and internal ops surfaces.'],
              ['Core split', '`md4ai/core` parses and `md4ai/react` renders with shared bridges.'],
            ].map(([title, copy]) => (
              <div key={title} className="sample-chip" style={{ minWidth: 0, flex: 1, cursor: 'default' }}>
                <span className="sample-chip__label">{title}</span>
                <span className="sample-chip__description">{copy}</span>
              </div>
            ))}
          </section>

          {/* ── Getting Started ── */}
          <H2 id="getting-started">Getting Started</H2>
          <P>md4ai extends markdown syntax so AI responses automatically render as rich UI components — charts, callouts, KPI cards, payment forms, and more. No prompt engineering, no JSON schemas. The AI writes markdown; md4ai renders it.</P>
          <P>Standard markdown always works as expected. Extensions are additive and degrade to readable plain text without a renderer.</P>

          <Code>{`npm install md4ai
# peer deps
npm install react react-dom
# optional — only needed for chart fences
npm install chart.js`}</Code>

          {/* ── Quickstart ── */}
          <H2 id="quickstart">Quickstart</H2>
          <Code lang="tsx">{`import { parse } from 'md4ai/core';
import { renderContent } from 'md4ai/react';

function AIMessage({ content }: { content: string }) {
  return renderContent(parse(content));
}`}</Code>

          <P>For streaming responses, call <IC>parseStreaming</IC> on the full accumulated text every chunk. Unclosed fences render as animated skeletons — never throw.</P>
          <Code lang="tsx">{`import { parseStreaming } from 'md4ai/core';
import { renderContent } from 'md4ai/react';

function StreamingMessage({ text }: { text: string }) {
  return renderContent(parseStreaming(text));
}`}</Code>

          <Callout type="tip">
            Both <IC>parse</IC> and <IC>parseStreaming</IC> return the same <IC>IRNode[]</IC> type and accept the same options. The only difference is leniency with unclosed blocks.
          </Callout>

          <Table
            head={['Start here', 'Why it matters']}
            rows={[
              ['<a href="./showcase.html">Showcase demo</a>', 'See a finished AI response rendered with charts, tables, KPIs, and timelines'],
              ['<a href="./index.html">Playground</a>', 'Paste your own markdown or switch between realistic presets'],
              ['<code>md4ai/core</code>', 'Parser, streaming, bridges, and IR types without renderer coupling'],
              ['<code>md4ai/react</code>', 'Renderer, themes, and component override surface for React apps'],
            ]}
          />

          <H2 id="interactive-demos">Interactive Demos</H2>
          <P>These blocks are editable. Change the markdown on the left and watch the preview update on the right using the same parser and renderer you would use in an app.</P>

          <InteractiveDemo
            title="Roadmap and reporting primitives"
            description="Try KPI blocks, steps, and tables together in a realistic product-review message."
            initial={roadmapDemo}
            theme={docsTheme}
          />

          {/* ── Syntax ── */}
          <H2 id="syntax">Syntax Reference</H2>
          <P>All standard markdown is supported — headings, bold, italic, links, images, blockquotes, tables, code blocks, horizontal rules, and GFM task lists. The following extensions are added on top.</P>

          <H3 id="callouts">Callouts</H3>
          <P>GitHub-style alert syntax — the AI already knows this from its training data on GitHub READMEs.</P>
          <Code>{`> [!NOTE]
> East region leads with $167k, up 18% QoQ.

> [!TIP]
> APAC shows the strongest growth trajectory.

> [!WARNING]
> South region is down 7%. Churn is accelerating.

> [!DANGER]
> Pipeline coverage for Q2 is critically thin.

> [!INFO]
> This variant is identical to NOTE in style.`}</Code>
          <Table
            head={['Variant', 'Color', 'Use for']}
            rows={[
              ['<code>NOTE</code>', 'Blue', 'Neutral information, context'],
              ['<code>INFO</code>', 'Blue', 'Identical to NOTE'],
              ['<code>TIP</code>', 'Green', 'Recommendations, best practices'],
              ['<code>WARNING</code>', 'Amber', 'Caution, watch out'],
              ['<code>DANGER</code>', 'Red', 'Critical issues, blockers'],
            ]}
          />
          <InteractiveDemo
            title="Live callout demo"
            description="Edit GitHub-style alert markdown and watch md4ai render the richer callout UI."
            initial={LIVE_DEMOS.callouts}
            theme={docsTheme}
            minHeight={210}
          />

          <H3 id="charts">Charts</H3>
          <P>Fenced code block with <IC>chart</IC> lang. Uses Chart.js under the hood — install it separately. During streaming, an animated skeleton placeholder renders until the JSON is complete (no raw JSON flash).</P>
          <Code>{`\`\`\`chart
{
  "type": "bar",
  "labels": ["North", "South", "East", "West"],
  "datasets": [
    {
      "label": "Q1 Revenue ($k)",
      "data": [142, 98, 167, 121],
      "backgroundColor": ["#7c3aed","#7c3aed","#7c3aed","#7c3aed"]
    }
  ]
}
\`\`\``}</Code>
          <P>Supported types: <IC>bar</IC> <IC>line</IC> <IC>pie</IC> <IC>doughnut</IC> <IC>radar</IC></P>
          <Callout type="note">chart.js must be installed separately: <IC>npm install chart.js</IC>. If it is missing, chart fences render as a skeleton placeholder.</Callout>
          <InteractiveDemo
            title="Live chart demo"
            description="Paste different datasets or switch the chart type to see how the fence renders."
            initial={LIVE_DEMOS.charts}
            theme={docsTheme}
            minHeight={260}
          />

          <H3 id="steps">Steps and Timelines</H3>
          <P>Use <IC>steps</IC> or <IC>timeline</IC> fences for AI-generated workflows, plans, and progress reports. The parser accepts a few forgiving formats so models do not need to memorize a rigid schema.</P>
          <Code>{`\`\`\`steps
- [done] Gather requirements
  Confirm success criteria and edge cases
- [active] Build parser support
  Accept partial syntax during streaming
- [planned] Add docs and demo examples
\`\`\`

\`\`\`timeline
Discovery | done
Implementation | active | Parser and renderer are in progress
QA | planned
Launch: planned
\`\`\``}</Code>
          <P>Accepted forms include <IC>[done] Title</IC>, <IC>Title [done]</IC>, <IC>done: Title</IC>, <IC>Title: planned</IC>, and <IC>Title | active | detail</IC>. If a status is missing or malformed, the step still renders as <IC>planned</IC>.</P>
          <InteractiveDemo
            title="Live steps and timeline demo"
            description="Try the forgiving status formats and see how partial plans still render cleanly."
            initial={LIVE_DEMOS.steps}
            theme={docsTheme}
            minHeight={280}
          />

          <H3 id="kpi-metrics">KPI Metrics</H3>
          <P>Use <IC>::kpi</IC> for a first-class metric block. It is compact enough for model output, but still readable as plain text when rendered as raw markdown.</P>
          <Code>{`::kpi{label="Revenue" value="$167k" change="+18%" period="QoQ"}
::kpi{label="Net Retention" value="108%" change="+4 pts" period="YoY"}
::kpi{label="South Region" value="$98k" change="-7%" period="QoQ"}`}</Code>
          <P><IC>label</IC> and <IC>value</IC> are the main fields. <IC>change</IC> and <IC>period</IC> are optional metadata rendered as trend and badge UI.</P>
          <InteractiveDemo
            title="Live KPI demo"
            description="Tune labels, values, deltas, and periods to see how the metric cards adapt."
            initial={LIVE_DEMOS.kpis}
            theme={docsTheme}
            minHeight={220}
          />

          <H3 id="cards">Cards</H3>
          <Code>{`:::card{title="Immediate action"}
Schedule a call with South region AEs. Pull exit survey data first.
:::

:::card{title="This quarter"}
Allocate 2 APAC AE headcount. East momentum is self-sustaining.
:::`}</Code>
          <InteractiveDemo
            title="Live card demo"
            description="Good for action summaries, highlights, and concise AI-generated recommendations."
            initial={LIVE_DEMOS.cards}
            theme={docsTheme}
            minHeight={220}
          />

          <H3 id="layout">Multi-column Layout</H3>
          <P>Sections are separated by <IC>---</IC> within the fence. Defaults to 2 columns.</P>
          <Code>{`\`\`\`layout columns=2
### What's Working
- Enterprise motion in East is repeatable
- APAC partner channel gaining traction

---

### What Needs Attention
- South SMB churn accelerating
- West pipeline coverage thin
\`\`\``}</Code>
          <InteractiveDemo
            title="Live layout demo"
            description="Turn one markdown block into a balanced multi-column summary section."
            initial={LIVE_DEMOS.layout}
            theme={docsTheme}
            minHeight={250}
          />

          <H3 id="buttons">Buttons</H3>
          <Code>{`::button[Export Report]{href="#" variant="primary"}
::button[Build Forecast]{href="/forecast" variant="secondary"}
::button[Download CSV]{href="/export" variant="default"}`}</Code>
          <Table
            head={['Variant', 'Style']}
            rows={[
              ['<code>primary</code>', 'Accent fill'],
              ['<code>secondary</code>', 'Surface with border'],
              ['<code>default</code>', 'Surface2 with border'],
            ]}
          />
          <InteractiveDemo
            title="Live buttons and input demo"
            description="Test action bars and lightweight form prompts inside the same markdown response."
            initial={LIVE_DEMOS.buttons}
            theme={docsTheme}
            minHeight={230}
          />

          <H3 id="inputs">Inputs</H3>
          <Code>{`::input{type="text" placeholder="Ask a follow-up..." label="Follow-up"}
::input{type="email" placeholder="you@company.com" label="Work email"}`}</Code>

          <H3 id="video">Video Embeds</H3>
          <P>YouTube and Vimeo URLs become responsive 16:9 iframes. Any other URL renders a native <IC>{`<video>`}</IC> element.</P>
          <Code>{`\`\`\`video
https://www.youtube.com/watch?v=dQw4w9WgXcQ
\`\`\``}</Code>
          <InteractiveDemo
            title="Live video demo"
            description="Swap in a YouTube, Vimeo, or direct video URL to see the renderer choose the right player."
            initial={LIVE_DEMOS.video}
            theme={docsTheme}
            minHeight={180}
          />

          <H3 id="task-lists">Task Lists</H3>
          <P>Standard GFM syntax — rendered with visual checkboxes.</P>
          <Code>{`- [x] Pull Q1 revenue data from CRM
- [x] Identify top churned accounts
- [ ] Schedule South region review call
- [ ] Draft Q2 forecast model`}</Code>
          <InteractiveDemo
            title="Live task list demo"
            description="Useful for operational checklists, launch criteria, and agent follow-up work."
            initial={LIVE_DEMOS.tasks}
            theme={docsTheme}
            minHeight={190}
          />

          <H3 id="tables">Tables</H3>
          <P>Standard GFM tables are supported directly. The built-in renderer improves them for report-style content by right-aligning mostly numeric columns, tightening dense layouts, emphasizing summary rows like <IC>Total</IC> and <IC>Average</IC>, and giving simple status or delta cells stronger visual cues.</P>
          <Code>{`| Region | Revenue | Change | Status |
| --- | --- | --- | --- |
| East | $167k | +18% | On track |
| South | $98k | -7% | At risk |
| APAC | $89k | +20% | Healthy |
| Total | $354k | +11% | Stable |`}</Code>
          <Table
            head={['Built-in behavior', 'What it helps with']}
            rows={[
              ['Numeric alignment', 'Revenue, deltas, rates, and percentages scan faster'],
              ['Compact spacing', 'Wide analytics tables stay readable without custom styling'],
              ['Summary row emphasis', 'Totals and averages stand out in model-generated reports'],
              ['Status and delta highlighting', 'Positive/negative movement is easier to spot at a glance'],
              ['Horizontal overflow handling', 'Tables remain usable on smaller screens'],
            ]}
          />
          <InteractiveDemo
            title="Live table demo"
            description="Edit analytics-style tables and watch numeric alignment and summary-row emphasis kick in."
            initial={LIVE_DEMOS.tables}
            theme={docsTheme}
            minHeight={220}
          />

          {/* ── Bridges ── */}
          <H2 id="bridges">Bridge System</H2>
          <P>Bridges let anyone map a custom <IC>@marker[data]</IC> inline syntax to any React component. The AI learns it from a single example in the system prompt. Publish as <IC>md4ai-bridge-*</IC> npm packages to share with the community.</P>

          <Callout type="tip">
            <IC>@</IC> only fires as a bridge marker when followed by <IC>word[</IC>. Bare mentions like <IC>@john</IC> and emails like <IC>user@company.com</IC> are never matched — the bracket requirement is the disambiguator.
          </Callout>

          <H3 id="bridge-demo">Live bridge demo</H3>
          <P>The docs demo includes a custom bridge called <IC>release</IC>. It renders roadmap-style badges from a compact inline marker, which is a good example of how teams can teach md4ai about product-specific components.</P>
          <Table
            head={['Piece', 'Example']}
            rows={[
              ['Marker syntax', '<code>@release[name: Agent Inbox, status: beta, eta: July 2026, owner: Core UX]</code>'],
              ['Pattern', '<code>keyvalue</code>'],
              ['Best use', 'Roadmap chips, launch badges, release summaries, ownership metadata'],
            ]}
          />
          <Code lang="tsx">{`const releaseBridge = defineBridge({
  marker: 'release',
  pattern: 'keyvalue',
  render: ({ name, status, eta, owner }) => (
    <ReleaseBadge
      name={name}
      status={status}
      eta={eta}
      owner={owner}
    />
  ),
});`}</Code>
          <InteractiveDemo
            title="Live bridge demo"
            description="This docs page ships a demo-only @release[...] bridge so you can edit the marker syntax and preview the custom component immediately."
            initial={LIVE_DEMOS.bridge}
            theme={docsTheme}
            minHeight={220}
          />

          <H3 id="bridge-define">Define a bridge</H3>
          <Code lang="tsx">{`import { defineBridge } from 'md4ai/core';

const statusBridge = defineBridge({
  marker: 'status',           // matches @status[...]
  pattern: 'scalar',          // how to parse the [data] content
  render: (value) => (
    <span className={\`badge badge--\${value}\`}>{value}</span>
  ),
});`}</Code>

          <H3 id="bridge-patterns">Built-in patterns</H3>
          <Table
            head={['Pattern', 'Markdown', 'Parsed as']}
            rows={[
              ['<code>scalar</code>', '<code>@badge[success]</code>', '<code>"success"</code>'],
              ['<code>array</code>', '<code>@tags[React, Vue, Angular]</code>', '<code>["React", "Vue", "Angular"]</code>'],
              ['<code>keyvalue</code>', '<code>@kpi[value: $167k, label: Revenue]</code>', '<code>{ value: "$167k", label: "Revenue" }</code>'],
              ['<code>range</code>', '<code>@range[100 → 500]</code>', '<code>{ min: "100", max: "500" }</code>'],
            ]}
          />
          <P>For custom parsing, pass a function instead of a pattern string:</P>
          <Code lang="ts">{`defineBridge({
  marker: 'progress',
  pattern: (raw) => {
    const [done, total] = raw.split('/').map(Number);
    return { done, total, pct: Math.round((done / total) * 100) };
  },
  render: ({ done, total, pct }) => (
    <div className="progress">
      <div style={{ width: \`\${pct}%\` }} />
      <span>{done}/{total}</span>
    </div>
  ),
});`}</Code>

          <H3 id="bridge-register">Register with parse and renderContent</H3>
          <P>Pass the same <IC>bridges</IC> array to both — the parser recognizes the markers, the renderer calls the right component.</P>
          <Code lang="tsx">{`import { parse } from 'md4ai/core';
import { renderContent } from 'md4ai/react';

const bridges = [statusBridge, kpiBridge, timelineBridge];

const nodes = parse(markdown, { bridges });
const ui = renderContent(nodes, { bridges });`}</Code>

          <H3 id="bridge-prompt">AI system prompt hints</H3>
          <P>Each bridge auto-generates its hint. Build your full system prompt from the array — never write it by hand.</P>
          <Code lang="ts">{`statusBridge.prompt
// → 'Use @status[value] inline. Example: @status[success]'

const systemPrompt = \`
You are a helpful assistant.

\${bridges.map(b => b.prompt).join('\\n')}
\`;`}</Code>

          <H3 id="bridge-host">Host data and events</H3>
          <P>Bridges can pull live data from your app and emit events back. The AI writes identifiers; your store resolves them at render time.</P>
          <Code lang="tsx">{`renderContent(nodes, {
  bridges,

  // Data resolvers — AI writes @stock[AAPL], your store fetches the price
  store: {
    stock: ({ symbol }) => myStore.getPrice(symbol),
    inventory: ({ sku }) => api.getStock(sku),
  },

  // Event handlers — bridge components emit, your app handles
  onEvent: (event, data) => {
    if (event === 'pay')   stripe.redirectToCheckout(data);
    if (event === 'buy')   api.post('/orders', data);
    if (event === 'share') navigator.share(data);
  },
});`}</Code>
          <P>Inside the bridge, access these via <IC>ctx.query</IC> and <IC>ctx.emit</IC>:</P>
          <Code lang="tsx">{`defineBridge({
  marker: 'stock',
  pattern: 'scalar',
  render: (symbol, { query, emit }) => {
    const price = query('stock', { symbol }) as number;
    return (
      <StockCard
        symbol={symbol as string}
        price={price}
        onBuy={() => emit('buy', { symbol, qty: 1 })}
      />
    );
  },
});`}</Code>

          {/* ── Themes ── */}
          <H2 id="themes">Themes</H2>
          <P>Four built-in themes, each with light and dark variants. All use the same CSS variable names as shadcn — plug straight into an existing shadcn app.</P>
          <Code lang="tsx">{`import { renderContent, themes } from 'md4ai/react';

// Use a preset
renderContent(nodes, { theme: themes.violet.dark });

// Available presets
themes.zinc.light   themes.zinc.dark
themes.violet.light themes.violet.dark
themes.rose.light   themes.rose.dark
themes.blue.light   themes.blue.dark`}</Code>

          <P>Apply the same tokens to your app shell so both inherit one source of truth:</P>
          <Code lang="tsx">{`function tokensToCSSVars(tokens: Record<string, string | undefined>) {
  return {
    '--bg': tokens.bg, '--surface': tokens.surface,
    '--accent': tokens.accent, '--text': tokens.text,
    // ...
  } as React.CSSProperties;
}

const theme = themes[themeName][isDark ? 'dark' : 'light'];

<div style={tokensToCSSVars(theme)}>
  {renderContent(nodes, { theme })}
</div>`}</Code>

          <P>Pass any subset of tokens to override — unset tokens fall back to whatever CSS variables are already on the page:</P>
          <Table
            head={['Token', 'CSS variable', 'Description']}
            rows={[
              ['<code>accent</code>', '<code>--accent</code>', 'Primary action color'],
              ['<code>accentHover</code>', '<code>--accent-hover</code>', 'Hover state of accent'],
              ['<code>bg</code>', '<code>--bg</code>', 'Page background'],
              ['<code>surface</code>', '<code>--surface</code>', 'Card/component background'],
              ['<code>surface2</code>', '<code>--surface2</code>', 'Subtle surface, header bands'],
              ['<code>border</code>', '<code>--border</code>', 'All border colors'],
              ['<code>text</code>', '<code>--text</code>', 'Primary text'],
              ['<code>textMuted</code>', '<code>--text-muted</code>', 'Secondary/label text'],
              ['<code>codeBg</code>', '<code>--code-bg</code>', 'Code block background'],
              ['<code>codeText</code>', '<code>--code-text</code>', 'Inline code color'],
              ['<code>font</code>', '<code>--font</code>', 'Body font stack'],
              ['<code>mono</code>', '<code>--mono</code>', 'Monospace font stack'],
            ]}
          />

          {/* ── Highlighting ── */}
          <H2 id="highlighting">Syntax Highlighting</H2>
          <P>The library does not bundle a highlighter to stay lightweight. Pass any highlighter via the <IC>highlight</IC> option — it receives <IC>(code, lang)</IC> and returns an HTML string or <IC>null</IC> to fall back to plain text.</P>
          <Code lang="tsx">{`import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

renderContent(nodes, {
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});`}</Code>
          <P>Works with any highlighter that returns HTML: highlight.js, Shiki, Prism, lowlight.</P>

          {/* ── Overrides ── */}
          <H2 id="overrides">Component Overrides</H2>
          <P>Replace any built-in renderer with your own component via the <IC>components</IC> option. Container nodes receive pre-rendered children as <IC>ReactElement[]</IC>.</P>
          <Code lang="tsx">{`import type { ComponentOverrides } from 'md4ai/react';

renderContent(nodes, {
  components: {
    // Leaf nodes — receive raw props
    chart: ({ chartType, data }) => (
      <MyChart type={chartType} data={data} />
    ),
    video: ({ src }) => <MyPlayer src={src} />,
    button: ({ label, href, variant }) => (
      <MyButton href={href} variant={variant}>{label}</MyButton>
    ),

    // Container nodes — receive pre-rendered children
    callout: ({ variant, children }) => (
      <Alert variant={variant}>{children}</Alert>
    ),
    card: ({ title, children }) => (
      <Card><CardHeader>{title}</CardHeader><CardBody>{children}</CardBody></Card>
    ),
    code: ({ lang, value }) => (
      <SyntaxHighlighter language={lang}>{value}</SyntaxHighlighter>
    ),
    steps: ({ items, presentation }) => (
      <MyStepper items={items} variant={presentation} />
    ),
  },
});`}</Code>
          <P>All overridable keys: <IC>paragraph</IC> <IC>heading</IC> <IC>code</IC> <IC>blockquote</IC> <IC>list</IC> <IC>table</IC> <IC>thematicBreak</IC> <IC>callout</IC> <IC>chart</IC> <IC>video</IC> <IC>button</IC> <IC>input</IC> <IC>kpi</IC> <IC>card</IC> <IC>layout</IC> <IC>steps</IC></P>

          {/* ── Streaming ── */}
          <H2 id="streaming">Streaming</H2>
          <P><IC>parseStreaming</IC> is a lenient wrapper around <IC>parse</IC>. It detects unclosed fenced blocks at the end of the string and auto-closes them before parsing. Call it on the full accumulated text on every chunk.</P>
          <Code lang="tsx">{`import { parseStreaming } from 'md4ai/core';
import { renderContent } from 'md4ai/react';

// Typical usage in an AI chat UI
let accumulated = '';

for await (const chunk of stream) {
  accumulated += chunk;
  const nodes = parseStreaming(accumulated, { bridges });
  setUI(renderContent(nodes, { bridges, theme }));
}`}</Code>
          <P>Streaming behavior by node type:</P>
          <Table
            head={['Node', 'Mid-stream behavior']}
            rows={[
              ['Paragraph, heading, list', 'Renders as-is — partial text is fine'],
              ['<code>chart</code> fence', 'Animated shimmer skeleton until JSON is valid'],
              ['<code>steps</code>, <code>timeline</code> fence', 'Partial lines render immediately; incomplete statuses fall back to <code>planned</code>'],
              ['<code>video</code> fence', 'Nothing until URL is complete'],
              ['<code>card</code>, <code>layout</code> directive', 'Renders with whatever content has arrived'],
              ['<code>@bridge[data]</code>', 'Renders when the closing <code>]</code> arrives'],
            ]}
          />

          {/* ── API ── */}
          <H2 id="api">API Reference</H2>

          <H3>parse(markdown, options?)</H3>
          <Table
            head={['Option', 'Type', 'Default', 'Description']}
            rows={[
              ['<code>gfm</code>', '<code>boolean</code>', '<code>true</code>', 'Enable GFM — tables, task lists, strikethrough'],
              ['<code>bridges</code>', '<code>BridgeDefinition[]</code>', '<code>[]</code>', 'Registers @marker tokens for the parser to recognize'],
            ]}
          />
          <P>Returns <IC>IRNode[]</IC> — plain serializable JSON, framework-agnostic intermediate representation.</P>

          <H3>parseStreaming(markdown, options?)</H3>
          <P>Same signature and return type as <IC>parse</IC>. Lenient about unclosed blocks at the end of the string. Safe to call on every streaming chunk.</P>

          <H3>renderContent(nodes, options?)</H3>
          <Table
            head={['Option', 'Type', 'Description']}
            rows={[
              ['<code>theme</code>', '<code>ThemeTokens</code>', 'CSS variable overrides scoped to the root wrapper'],
              ['<code>highlight</code>', '<code>(code, lang) => string | null</code>', 'Syntax highlighter for code blocks'],
              ['<code>components</code>', '<code>ComponentOverrides</code>', 'Replace built-in node renderers'],
              ['<code>bridges</code>', '<code>BridgeDefinition[]</code>', 'Registered bridge renderers'],
              ['<code>store</code>', '<code>Record&lt;string, (params?) => unknown&gt;</code>', 'Data resolvers for bridge query()'],
              ['<code>onEvent</code>', '<code>(event, data?) => void</code>', 'Handler for bridge emit()'],
              ['<code>className</code>', '<code>string</code>', 'Extra class on the root wrapper div'],
            ]}
          />

          <H3>defineBridge(options)</H3>
          <Table
            head={['Option', 'Type', 'Description']}
            rows={[
              ['<code>marker</code>', '<code>string</code>', 'The @marker name — lowercase letters and hyphens'],
              ['<code>pattern</code>', '<code>"scalar" | "array" | "keyvalue" | "range" | (raw) => T</code>', 'How to parse the [data] content'],
              ['<code>render</code>', '<code>(data: T, ctx: BridgeRenderCtx) => ReactElement | null</code>', 'Renders the component'],
              ['<code>prompt</code>', '<code>string</code>', 'Optional — overrides the auto-generated AI system prompt hint'],
            ]}
          />

          {/* ── VS MDX ── */}
          <H2 id="vs-mdx">Why not MDX?</H2>
          <P>MDX is the right tool when humans author content at build time. md4ai is the right tool when AI generates content at runtime.</P>
          <Table
            head={['', 'MDX', 'md4ai']}
            rows={[
              ['Requires build step', '✗ Yes', '✓ Pure runtime'],
              ['AI must write JSX', '✗ Yes — breaks constantly', '✓ Plain markdown'],
              ['Streaming support', '✗ No', '✓ Yes'],
              ['Custom components', 'Import in file', 'defineBridge + one prompt line'],
              ['Readable without renderer', '✗ No', '✓ Degrades to plain text'],
              ['Works in any React app', 'Needs bundler config', '✓ Drop-in'],
              ['AI error rate', 'High — JSX is brittle', 'Low — markdown is familiar'],
            ]}
          />

          <Callout type="warning">
            MDX requires the AI to write valid JSX — import statements, component names, prop syntax — and any mistake causes a parse error. md4ai only requires standard markdown plus a few simple patterns the AI already knows.
          </Callout>

        </main>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; background: var(--bg); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 9999px; }
        a { color: var(--accent); }
        @media (max-width: 768px) {
          aside { display: none; }
          main { margin-left: 0 !important; padding: 2rem 1.25rem 4rem !important; }
          .docs-demo__grid { grid-template-columns: 1fr !important; }
          .docs-demo__editor { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
