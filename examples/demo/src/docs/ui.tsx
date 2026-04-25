import React, { useMemo, useState } from 'react';
import { builtinPromptTopics, getPrompt, parseStreaming } from '@architprasar/md4ai/core';
import type { PromptMode } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';
import { BRIDGES } from '../bridges.js';

export type DocsTheme = Record<string, string>;

export function Code({ children }: { children: string; lang?: string }) {
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
        fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', margin: 0,
      }}>
        <code>{children.trim()}</code>
      </pre>
      <button onClick={copy} style={{
        position: 'absolute', top: '0.6rem', right: '0.6rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '0.4rem', padding: '0.2rem 0.55rem',
        fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
        cursor: 'pointer', fontFamily: 'inherit',
      }}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  );
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em',
      color: 'var(--text)', marginTop: '3rem', marginBottom: '0.75rem',
      paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)', scrollMarginTop: 72,
    }}>
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} style={{
      fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.015em',
      color: 'var(--text)', marginTop: '2rem', marginBottom: '0.5rem', scrollMarginTop: 72,
    }}>
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.9rem', fontSize: '0.9rem' }}>{children}</p>;
}

export function IC({ children }: { children: string }) {
  return (
    <code style={{
      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8em',
      background: 'var(--surface2)', color: 'var(--accent)',
      padding: '0.1em 0.35em', borderRadius: '0.3rem', border: '1px solid var(--border)',
    }}>{children}</code>
  );
}

export function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.25rem', border: '1px solid var(--border)', borderRadius: '0.65rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{
                padding: '0.55rem 1rem', textAlign: 'left', background: 'var(--surface2)',
                fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)',
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

export function Callout({ type, children }: { type: 'note' | 'tip' | 'warning'; children: React.ReactNode }) {
  const cfg = {
    note: { color: '#3b82f6', bg: '#3b82f6', label: 'Note' },
    tip: { color: '#16a34a', bg: '#22c55e', label: 'Tip' },
    warning: { color: '#d97706', bg: '#f59e0b', label: 'Warning' },
  }[type];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2rem 1fr', gap: '0.65rem',
      alignItems: 'start', borderRadius: '0.65rem', padding: '0.85rem 1rem', marginBottom: '1rem',
      background: `color-mix(in srgb, ${cfg.bg} 8%, var(--surface))`,
      border: `1px solid color-mix(in srgb, ${cfg.bg} 22%, var(--border))`,
    }}>
      <span style={{
        width: '2rem', height: '2rem', borderRadius: '0.4rem',
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

export function InteractiveDemo({
  title,
  description,
  initial,
  theme,
  minHeight = 300,
}: {
  title: string;
  description: string;
  initial: string;
  theme: DocsTheme;
  minHeight?: number;
}) {
  const [source, setSource] = useState(initial);

  const rendered = useMemo(() => {
    try {
      return renderContent(parseStreaming(source, { bridges: BRIDGES }), { bridges: BRIDGES, theme });
    } catch {
      return (
        <div style={{
          border: '1px solid #fca5a5', background: '#fff1f2', color: '#9f1239',
          borderRadius: '0.7rem', padding: '0.9rem 1rem', fontSize: '0.84rem',
        }}>
          This example did not parse cleanly. Keep editing and the preview will recover automatically.
        </div>
      );
    }
  }, [source, theme]);

  return (
    <section className="docs-demo" style={{
      border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '1rem',
      overflow: 'hidden', marginBottom: '1.4rem', boxShadow: '0 18px 40px -30px rgb(15 23 42 / 0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', padding: '0.95rem 1.05rem', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%, var(--surface) 100%)',
      }}>
        <div>
          <strong style={{ display: 'block', fontSize: '0.92rem', letterSpacing: '-0.02em', marginBottom: '0.15rem' }}>{title}</strong>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55 }}>{description}</span>
        </div>
        <button onClick={() => setSource(initial)} className="btn-icon">Reset</button>
      </div>
      <div className="docs-demo__grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' }}>
        <div className="docs-demo__editor" style={{ borderRight: '1px solid var(--border)', minWidth: 0 }}>
          <div style={{
            height: 34, display: 'flex', alignItems: 'center', padding: '0 0.95rem',
            borderBottom: '1px solid var(--border)', background: 'var(--surface2)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
          }}>
            Markdown input
          </div>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            style={{
              width: '100%', minHeight, border: 'none', outline: 'none', resize: 'vertical',
              padding: '1rem', background: 'var(--surface)', color: 'var(--text)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', lineHeight: 1.7,
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            height: 34, display: 'flex', alignItems: 'center', padding: '0 0.95rem',
            borderBottom: '1px solid var(--border)', background: 'var(--surface2)',
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)',
          }}>
            Rendered preview
          </div>
          <div style={{ padding: '1.15rem', overflowX: 'auto' }}>{rendered}</div>
        </div>
      </div>
    </section>
  );
}

export function PromptRecipeCards({
  recipes,
}: {
  recipes: Array<{ title: string; description: string; prompt: string }>;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.4rem' }}>
      {recipes.map((recipe) => (
        <div key={recipe.title} style={{
          border: '1px solid var(--border)',
          borderRadius: '0.95rem',
          background: 'var(--surface)',
          padding: '1rem',
          boxShadow: '0 18px 40px -30px rgb(15 23 42 / 0.2)',
        }}>
          <strong style={{ display: 'block', fontSize: '0.92rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{recipe.title}</strong>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55, marginBottom: '0.8rem' }}>{recipe.description}</span>
          <button
            className="btn-icon"
            onClick={() => {
              navigator.clipboard.writeText(recipe.prompt);
              setCopied(recipe.title);
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            {copied === recipe.title ? '✓ Copied' : 'Copy recipe'}
          </button>
        </div>
      ))}
    </div>
  );
}

export function PromptBuilderDemo() {
  const bridgeMarkers = BRIDGES.map((bridge) => bridge.marker);
  const [selectedBuiltins, setSelectedBuiltins] = useState<string[]>(['callouts', 'kpi', 'tables', 'steps']);
  const [selectedBridges, setSelectedBridges] = useState<string[]>(['status', 'release']);
  const [includeBaseInstruction, setIncludeBaseInstruction] = useState(true);
  const [prefix, setPrefix] = useState('Write markdown and use md4ai syntax when it helps:');
  const [mode, setMode] = useState<PromptMode>('standard');

  const prompt = useMemo(() => getPrompt({
    bridges: BRIDGES,
    prefix: prefix.trim() || undefined,
    mode,
    includeBaseInstruction,
    includeBuiltins: selectedBuiltins as (typeof builtinPromptTopics)[number][],
    includeBridges: selectedBridges,
  }), [includeBaseInstruction, mode, prefix, selectedBridges, selectedBuiltins]);

  const toggle = (items: string[], value: string, setItems: (next: string[]) => void) => {
    setItems(items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
  };

  return (
    <section className="docs-demo" style={{
      border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '1rem',
      overflow: 'hidden', marginBottom: '1.4rem', boxShadow: '0 18px 40px -30px rgb(15 23 42 / 0.2)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', padding: '0.95rem 1.05rem', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 4%, var(--surface)) 0%, var(--surface) 100%)',
      }}>
        <div>
          <strong style={{ display: 'block', fontSize: '0.92rem', letterSpacing: '-0.02em', marginBottom: '0.15rem' }}>Interactive prompt builder</strong>
          <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55 }}>Select built-in md4ai syntax topics and bridges, then copy the generated prompt string.</span>
        </div>
        <button className="btn-icon" onClick={() => navigator.clipboard.writeText(prompt)}>Copy prompt</button>
      </div>
      <div className="docs-demo__grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 0.9fr) minmax(0, 1.1fr)' }}>
        <div className="docs-demo__editor" style={{ borderRight: '1px solid var(--border)', minWidth: 0, padding: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
            Prefix
          </label>
          <input
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            style={{
              width: '100%', marginBottom: '1rem', padding: '0.65rem 0.8rem',
              border: '1px solid var(--border)', borderRadius: '0.65rem',
              background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem',
            }}
          />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Mode</div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {(['minimal', 'standard', 'withExamples'] as PromptMode[]).map((value) => {
                const active = mode === value;
                return (
                  <button
                    key={value}
                    className="btn-icon"
                    onClick={() => setMode(value)}
                    style={{
                      background: active ? 'var(--surface2)' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--text-muted)',
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--text)' }}>
            <input type="checkbox" checked={includeBaseInstruction} onChange={() => setIncludeBaseInstruction((v) => !v)} />
            Include base instruction
          </label>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Built-in topics</div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {builtinPromptTopics.map((topic) => {
                const active = selectedBuiltins.includes(topic);
                return (
                  <button
                    key={topic}
                    className="btn-icon"
                    onClick={() => toggle(selectedBuiltins, topic, setSelectedBuiltins)}
                    style={{
                      background: active ? 'var(--surface2)' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--text-muted)',
                      borderColor: active ? 'var(--border)' : 'var(--border)',
                    }}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Bridge prompts</div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {bridgeMarkers.map((marker) => {
                const active = selectedBridges.includes(marker);
                return (
                  <button
                    key={marker}
                    className="btn-icon"
                    onClick={() => toggle(selectedBridges, marker, setSelectedBridges)}
                    style={{
                      background: active ? 'var(--surface2)' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--text-muted)',
                      borderColor: active ? 'var(--border)' : 'var(--border)',
                    }}
                  >
                    {marker}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ minWidth: 0, padding: '1rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>Generated prompt</div>
          <pre style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '0.75rem', padding: '1rem', overflowX: 'auto',
            whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
            lineHeight: 1.7, color: 'var(--text)', margin: 0,
          }}>
            {prompt}
          </pre>
        </div>
      </div>
    </section>
  );
}
