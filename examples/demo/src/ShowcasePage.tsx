import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { parseStreaming } from 'md4ai/core';
import { renderContent, themes } from 'md4ai/react';
import { BRIDGES } from './bridges.js';
import { SHOWCASE_CONTENT } from './showcaseContent.js';
import hljs from 'highlight.js';

const HIGHLIGHT = (code: string, lang: string) => {
  if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
  return hljs.highlightAuto(code).value;
};

const SPEED = 18;
const TICK = 12;
const PILLARS = [
  {
    title: 'Markdown-first by default',
    copy: 'Use markdown that models already produce, then layer in charts, KPIs, callouts, timelines, and richer UI only where it helps.',
  },
  {
    title: 'Streaming-safe rendering',
    copy: 'Render partial responses while tokens arrive, degrade gracefully on malformed blocks, and avoid fragile JSON-only pipelines.',
  },
  {
    title: 'Extensible without lock-in',
    copy: 'Reach for bridges when you need custom product components, but keep the core authoring experience readable as plain text.',
  },
];

const USE_CASES = [
  'AI chat products',
  'Ops and analytics reports',
  'Agent dashboards',
  'Product and roadmap reviews',
];

function useStream(full: string) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const pos = useRef(0);

  const start = useCallback(() => {
    if (ref.current) clearInterval(ref.current);
    pos.current = 0;
    setText('');
    setDone(false);
    ref.current = setInterval(() => {
      pos.current = Math.min(pos.current + SPEED, full.length);
      setText(full.slice(0, pos.current));
      if (pos.current >= full.length) {
        clearInterval(ref.current!);
        ref.current = null;
        setDone(true);
      }
    }, TICK);
  }, [full]);

  useEffect(() => {
    const t = setTimeout(start, 800);
    return () => { clearTimeout(t); if (ref.current) clearInterval(ref.current); };
  }, [start]);

  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return { text, done, replay: start };
}

export default function ShowcasePage() {
  const [isDark, setIsDark] = useState(false);
  const theme = themes.zinc[isDark ? 'dark' : 'light'];
  const { text, done, replay } = useStream(SHOWCASE_CONTENT);

  const cssVars = useMemo(() => ({
    '--bg': theme.bg, '--surface': theme.surface, '--surface2': theme.surface2,
    '--border': theme.border, '--text': theme.text, '--text-muted': theme.textMuted,
    '--accent': theme.accent, '--accent-hover': theme.accentHover,
    '--code-bg': theme.codeBg, '--code-text': theme.codeText,
  } as React.CSSProperties), [theme]);

  const rendered = useMemo(() => {
    if (!text) return null;
    try {
      return renderContent(parseStreaming(text, { bridges: BRIDGES }), {
        highlight: HIGHLIGHT, theme, bridges: BRIDGES,
        onEvent: (event, data) => {
          if (event === 'pay') alert('Payment initiated: ' + JSON.stringify(data));
        },
      });
    } catch { return null; }
  }, [text, theme]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', position: 'relative', overflowX: 'hidden', ...cssVars }}>
      <div
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: 560,
          pointerEvents: 'none',
          background: [
            'radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 26%)',
            'radial-gradient(circle at 86% 10%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 28%)',
            'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--bg)) 0%, transparent 100%)',
          ].join(', '),
        }}
      />
      <nav className="app-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        minHeight: 52,
        padding: '0 1.25rem',
        background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="app-header__identity" style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <div className="app-header__logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="app-header__logo-text" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>md4ai</span>
            <span className="app-header__tagline" style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              letterSpacing: '0.01em',
            }}>rich markdown for AI</span>
          </div>
          <div className="app-header__nav" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem' }}>
            <a href="./showcase.html" style={{
              color: 'var(--text)',
              textDecoration: 'none',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              padding: '0.22rem 0.6rem',
            }}>Showcase</a>
            <a href="./index.html" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Playground</a>
            <a href="./docs.html" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Docs</a>
            <a href="https://github.com/architprasar/md4ai" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>GitHub</a>
          </div>
        </div>
        <div className="app-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="./index.html" className="btn-icon" style={{ textDecoration: 'none' }}>Dev tool →</a>
          <button onClick={() => setIsDark(d => !d)} className="btn-icon">
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>

      <section style={{ position: 'relative', padding: '4.75rem 2rem 3rem' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ animation: 'md4ai-fade-up 0.7s var(--ease, cubic-bezier(0.16, 1, 0.3, 1)) both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'color-mix(in srgb, var(--accent) 10%, var(--surface))',
              border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--border))',
              color: 'var(--accent)', borderRadius: '9999px', padding: '0.25rem 0.85rem',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase' as const, marginBottom: '1.35rem',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'md4ai-pulse 2s infinite' }} />
              Open-source markdown runtime for AI apps
            </div>

            <h1 style={{ fontSize: 'clamp(2.45rem, 6vw, 4.8rem)', fontWeight: 850, letterSpacing: '-0.06em', lineHeight: 0.96, margin: '0 0 1rem', maxWidth: 760 }}>
              Plain markdown in.
              <br />
              Production UI out.
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-muted)', maxWidth: 640, margin: '0 0 1.35rem', lineHeight: 1.72 }}>
              md4ai helps teams render AI responses as polished product surfaces instead of raw chat text. Parse markdown once, stream it safely, and turn it into tables, KPI cards, steps, timelines, charts, callouts, and custom bridges without inventing a new authoring format.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' as const, marginBottom: '1rem' }}>
              <a href="./docs.html" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'var(--accent)', color: 'var(--bg)',
                borderRadius: '0.7rem', padding: '0.72rem 1.15rem',
                fontSize: '0.9rem', fontWeight: 650, textDecoration: 'none',
                boxShadow: isDark ? '0 10px 30px -16px rgb(0 0 0 / 0.65)' : '0 16px 36px -18px rgb(15 23 42 / 0.35)',
              }}>Read the docs</a>
              <a href="./index.html" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '0.7rem',
                padding: '0.72rem 1.15rem', fontSize: '0.9rem',
                fontWeight: 650, textDecoration: 'none',
              }}>Open playground</a>
              <code style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '0.7rem', padding: '0.72rem 0.9rem',
                fontSize: '0.82rem', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace',
              }}>npm install md4ai</code>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' as const }}>
              {['streaming', 'tables', 'kpis', 'steps', 'timelines', 'bridges'].map((item) => (
                <span key={item} style={{
                  border: '1px solid var(--border)',
                  background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
                  color: 'var(--text-muted)',
                  borderRadius: '9999px',
                  padding: '0.32rem 0.78rem',
                  fontSize: '0.74rem',
                  fontWeight: 650,
                  textTransform: 'capitalize',
                }}>{item}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
            border: '1px solid var(--border)',
            borderRadius: '1.25rem',
            padding: '1.1rem',
            boxShadow: isDark
              ? '0 0 0 1px rgb(255 255 255 / 0.03), 0 24px 50px -28px rgb(0 0 0 / 0.85)'
              : '0 24px 54px -34px rgb(15 23 42 / 0.24)',
            animation: 'md4ai-fade-up 0.82s 0.08s var(--ease, cubic-bezier(0.16, 1, 0.3, 1)) both',
          }}>
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gap: '0.3rem' }}>
                <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.03em' }}>Why teams reach for it</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                  md4ai sits between plain markdown renderers and heavy MDX-like setups. It keeps authoring simple while giving AI output enough structure to feel product-ready.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {PILLARS.map((pillar, index) => (
                  <div key={pillar.title} style={{
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    borderRadius: '0.95rem',
                    padding: '0.9rem 0.95rem',
                    animation: `md4ai-fade-up 0.7s ${0.16 + (index * 0.08)}s var(--ease, cubic-bezier(0.16, 1, 0.3, 1)) both`,
                  }}>
                    <strong style={{ display: 'block', fontSize: '0.86rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>{pillar.title}</strong>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55 }}>{pillar.copy}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 2rem 2.5rem' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
          {USE_CASES.map((item, index) => (
            <div key={item} style={{
              border: '1px solid var(--border)',
              background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
              borderRadius: '1rem',
              padding: '1rem 1.05rem',
              animation: `md4ai-fade-up 0.75s ${0.14 + (index * 0.06)}s var(--ease, cubic-bezier(0.16, 1, 0.3, 1)) both`,
            }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
                Use case
              </span>
              <strong style={{ display: 'block', fontSize: '1rem', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{item}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                Good fit when you want LLM output to stay editable as markdown but render like a real interface.
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '9999px', padding: '0.3rem 0.9rem',
          fontSize: '0.75rem', fontWeight: 600,
          color: done ? 'var(--text-muted)' : 'var(--accent)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: done ? '#16a34a' : 'var(--accent)',
            display: 'inline-block',
            animation: done ? 'none' : 'md4ai-pulse 1s infinite',
          }} />
          {done ? 'Response complete' : 'Streaming response…'}
        </div>
        {done && (
          <button onClick={replay} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '9999px', padding: '0.3rem 0.9rem',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer',
          }}>↺ Replay</button>
        )}
      </div>

      <section style={{ padding: '0 2rem 1.4rem' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.88fr) minmax(300px, 0.52fr)', gap: '1rem' }}>
          <div style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            borderRadius: '1.1rem',
            padding: '1rem 1.1rem',
          }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
              What this page is showing
            </span>
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
              The response below is streamed markdown rendered through md4ai. It mixes standard markdown with richer blocks like charts, cards, KPI tiles, tables, steps, timelines, and bridge-powered interactions in the same message flow.
            </p>
          </div>
          <div style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            borderRadius: '1.1rem',
            padding: '1rem 1.1rem',
          }}>
            <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
              Happy path
            </span>
            <code style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' as const }}>
              {`import { parseStreaming } from 'md4ai/core';\nimport { renderContent } from 'md4ai/react';`}
            </code>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '1.25rem', overflow: 'hidden',
          boxShadow: isDark
            ? '0 0 0 1px rgb(255 255 255 / 0.04), 0 24px 48px -12px rgb(0 0 0 / 0.6)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 24px 48px -12px rgb(0 0 0 / 0.1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.75rem 1rem',
            background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              AI response · md4ai renderer
            </span>
          </div>
          <div style={{ padding: '2rem 2.5rem' }}>
            {rendered}
            {!done && (
              <span style={{
                display: 'inline-block', width: 2, height: '1.1em',
                background: 'var(--accent)', marginLeft: 1,
                verticalAlign: 'text-bottom', animation: 'md4ai-blink 1s step-end infinite',
              }} />
            )}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <strong style={{ color: 'var(--text)' }}>md4ai</strong> — MIT License ·{' '}
        <a href="./index.html" style={{ color: 'var(--text-muted)' }}>Open dev tool</a>
      </footer>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes md4ai-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @keyframes md4ai-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes md4ai-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 980px) {
          nav { padding: 0 1rem !important; }
          section > div[style*='grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr)'] { grid-template-columns: 1fr !important; }
          section > div[style*='grid-template-columns: minmax(0, 0.88fr) minmax(300px, 0.52fr)'] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          nav { height: auto !important; padding-top: 0.85rem !important; padding-bottom: 0.85rem !important; align-items: flex-start !important; gap: 0.8rem !important; flex-direction: column !important; }
        }
        .md4ai-root { max-width: 100%; }
        .md4ai-h { font-weight: 700; line-height: 1.25; color: var(--text); margin-bottom: 0.5em; margin-top: 1.75em; letter-spacing: -0.02em; }
        .md4ai-h:first-child { margin-top: 0; }
        .md4ai-h1 { font-size: 1.875rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4em; }
        .md4ai-h2 { font-size: 1.375rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
        .md4ai-h3 { font-size: 1.1rem; }
        .md4ai-h4 { font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
        .md4ai-p { margin-bottom: 1rem; color: var(--text); }
        .md4ai-link { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
        .md4ai-inline-code { font-family: 'JetBrains Mono', monospace; font-size: 0.82em; background: var(--code-bg); color: var(--code-text); padding: 0.15em 0.4em; border-radius: 0.3rem; border: 1px solid var(--border); }
        .md4ai-pre { background: var(--code-bg); border-radius: 0.75rem; padding: 1.1rem 1.3rem; overflow-x: auto; margin-bottom: 1rem; border: 1px solid var(--border); }
        .md4ai-pre code { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; line-height: 1.8; color: var(--text); background: none; }
        .md4ai-blockquote { padding: 0.15rem 0 0.15rem 1rem; margin: 0 0 1rem; color: var(--text-muted); font-style: italic; position: relative; }
        .md4ai-blockquote::before { content: ''; position: absolute; left: 0; top: 0.15em; bottom: 0.15em; width: 2px; border-radius: 9999px; background: color-mix(in srgb, var(--accent) 35%, transparent); }
        .md4ai-list { padding-left: 1.5rem; margin-bottom: 1rem; }
        .md4ai-list__item { margin-bottom: 0.3rem; }
        .md4ai-list--task { list-style: none; padding-left: 0.25rem; }
        .md4ai-list__item--task { display: flex; align-items: baseline; gap: 0.5rem; }
        .md4ai-list__checkbox { flex-shrink: 0; width: 1rem; height: 1rem; accent-color: var(--accent); cursor: default; }
        .md4ai-hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
        .md4ai-table-wrapper { overflow-x: auto; margin-bottom: 1rem; border: 1px solid var(--border); border-radius: 0.75rem; }
        .md4ai-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .md4ai-table th, .md4ai-table td { padding: 0.6rem 1rem; text-align: left; border-bottom: 1px solid var(--border); }
        .md4ai-table th { background: var(--surface2); font-weight: 600; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .md4ai-table tbody tr:last-child td { border-bottom: none; }
        .md4ai-table tbody tr:hover { background: var(--surface2); }
        .md4ai-callout { display: grid; grid-template-columns: 2.25rem 1fr; gap: 0.75rem; align-items: start; border-radius: 0.75rem; padding: 1rem 1.1rem; margin-bottom: 1rem; background: var(--surface); box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04); border: 1px solid transparent; }
        .md4ai-callout--note, .md4ai-callout--info { --callout-color: #3b82f6; --callout-bg: #3b82f6; border-color: color-mix(in srgb, #3b82f6 20%, var(--border)); background: color-mix(in srgb, #3b82f6 5%, var(--surface)); }
        .md4ai-callout--tip { --callout-color: #16a34a; --callout-bg: #22c55e; border-color: color-mix(in srgb, #22c55e 20%, var(--border)); background: color-mix(in srgb, #22c55e 5%, var(--surface)); }
        .md4ai-callout--warning { --callout-color: #d97706; --callout-bg: #f59e0b; border-color: color-mix(in srgb, #f59e0b 20%, var(--border)); background: color-mix(in srgb, #f59e0b 5%, var(--surface)); }
        .md4ai-callout--danger { --callout-color: #dc2626; --callout-bg: #ef4444; border-color: color-mix(in srgb, #ef4444 20%, var(--border)); background: color-mix(in srgb, #ef4444 5%, var(--surface)); }
        .md4ai-callout__badge { width: 2.25rem; height: 2.25rem; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; background: color-mix(in srgb, var(--callout-bg) 15%, var(--surface)); color: var(--callout-color); flex-shrink: 0; }
        .md4ai-callout__content { min-width: 0; }
        .md4ai-callout__label { font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--callout-color); margin-bottom: 0.3rem; line-height: 1; padding-top: 0.6rem; }
        .md4ai-callout__body { color: var(--text); }
        .md4ai-callout__body .md4ai-p:last-child { margin-bottom: 0; }
        .md4ai-callout__body .md4ai-p { font-size: 0.9rem; line-height: 1.65; }
        .md4ai-chart { margin-bottom: 1rem; border-radius: 1rem; padding: 1.25rem; background: var(--surface); box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08); border: 1px solid var(--border); }
        .md4ai-chart--pending { height: 220px; background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%); background-size: 200% 100%; animation: md4ai-shimmer 1.4s infinite; border: 1px solid var(--border); border-radius: 1rem; }
        @keyframes md4ai-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .md4ai-card { border-radius: 1rem; overflow: hidden; margin-bottom: 1rem; background: var(--surface); box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08); border: 1px solid var(--border); }
        .md4ai-card__title { padding: 1rem 1.25rem 0; font-weight: 700; font-size: 0.9rem; color: var(--text); letter-spacing: -0.02em; }
        .md4ai-card__body { padding: 0.75rem 1.25rem 1.25rem; }
        .md4ai-card__body .md4ai-p:last-child { margin-bottom: 0; }
        .md4ai-card__body .md4ai-p { font-size: 0.9rem; }
        .md4ai-layout { display: grid; gap: 1.25rem; margin-bottom: 1rem; }
        .md4ai-layout__col { min-width: 0; }
        .md4ai-button { display: inline-flex; align-items: center; padding: 0.5rem 1.1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: 1px solid transparent; text-decoration: none; margin: 0 0.4rem 0.5rem 0; }
        .md4ai-button--primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
        .md4ai-button--secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
        .md4ai-button--default { background: var(--surface2); color: var(--text); border-color: var(--border); }
        .md4ai-input-wrapper { margin-bottom: 1rem; }
        .md4ai-input-label { display: block; font-size: 0.83rem; font-weight: 500; margin-bottom: 0.45rem; color: var(--text); }
        .md4ai-input { width: 100%; padding: 0.55rem 0.9rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--surface); color: var(--text); font-family: 'Inter', system-ui, sans-serif; font-size: 0.875rem; outline: none; }
        .md4ai-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent); }
        .md4ai-video { margin-bottom: 1rem; border-radius: 1rem; overflow: hidden; border: 1px solid var(--border); }
        .md4ai-video--embed { position: relative; padding-bottom: 56.25%; height: 0; }
        .md4ai-video--embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .md4ai-bridge--unknown { font-family: 'JetBrains Mono', monospace; font-size: 0.82em; color: var(--text-muted); }
        .hljs { background: none !important; }
        .hljs-keyword { color: var(--code-text); }
        .hljs-string, .hljs-attr { color: color-mix(in srgb, var(--accent) 80%, var(--text-muted)); }
        .hljs-number, .hljs-literal { color: var(--accent); }
        .hljs-comment { color: var(--text-muted); font-style: italic; }
      `}</style>
    </div>
  );
}
