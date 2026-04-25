import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { parse, parseStreaming } from '@architprasar/md4ai/core';
import { renderContent, themes } from '@architprasar/md4ai/react';
import type { ThemeName } from '@architprasar/md4ai/react';
import { SAMPLE_CONTENTS } from './sampleContent.js';
import { BRIDGES } from './bridges.js';
import { SiteHeader } from './components/SiteHeader.js';
import { demoChromeVars, tokensToCSSVars, useStoredColorMode } from './theme.js';
import { highlightCode } from './highlight.js';

// Theme accent colors for the dot picker
const THEME_DOTS: Record<ThemeName, { light: string; dark: string }> = {
  zinc:   { light: '#18181b', dark: '#e4e4e7' },
  violet: { light: '#7c3aed', dark: '#a78bfa' },
  rose:   { light: '#e11d48', dark: '#fb7185' },
  blue:   { light: '#2563eb', dark: '#60a5fa' },
};

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function App() {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_CONTENTS[0].id);
  const [source, setSource] = useState(SAMPLE_CONTENTS[0].content);
  const [isDark, setIsDark] = useStoredColorMode();
  const [themeName, setThemeName] = useState<ThemeName>('zinc');
  const [dragging, setDragging] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isStreaming = streamingText !== null;
  const activeSample = SAMPLE_CONTENTS.find((sample) => sample.id === selectedSample) ?? SAMPLE_CONTENTS[0];

  // Active theme tokens
  const themeTokens = themes[themeName][isDark ? 'dark' : 'light'];
  const cssVars = {
    ...tokensToCSSVars(themeTokens as Record<string, string | undefined>),
    ...demoChromeVars(isDark),
  };

  const stopStream = useCallback(() => {
    if (streamRef.current) clearInterval(streamRef.current);
    streamRef.current = null;
    setStreamingText(null);
  }, []);

  const startStream = useCallback(() => {
    if (streamRef.current) clearInterval(streamRef.current);
    const full = source;
    let pos = 0;
    setStreamingText('');
    streamRef.current = setInterval(() => {
      pos = Math.min(pos + 8, full.length);
      setStreamingText(full.slice(0, pos));
      if (pos >= full.length) {
        clearInterval(streamRef.current!);
        streamRef.current = null;
        setStreamingText(null);
      }
    }, 16);
  }, [source]);

  useEffect(() => () => { if (streamRef.current) clearInterval(streamRef.current); }, []);

  const loadSample = useCallback((sampleId: typeof SAMPLE_CONTENTS[number]['id']) => {
    const sample = SAMPLE_CONTENTS.find((item) => item.id === sampleId);
    if (!sample) return;
    stopStream();
    setSelectedSample(sampleId);
    setSource(sample.content);
  }, [stopStream]);

  const debouncedSource = useDebounced(source, 150);

  const rendered = useMemo(() => {
    const text = isStreaming ? (streamingText ?? '') : debouncedSource;
    const parser = isStreaming ? parseStreaming : parse;
    try {
      const ir = parser(text, { bridges: BRIDGES });
      return renderContent(ir, { highlight: highlightCode, theme: themeTokens, bridges: BRIDGES });
    } catch (e) {
      return <pre style={{ color: 'red' }}>{String(e)}</pre>;
    }
  }, [debouncedSource, streamingText, isStreaming, themeTokens]);

  const onMouseDown = useCallback(() => setDragging(true), []);
  const onMouseUp = useCallback(() => setDragging(false), []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.max(20, Math.min(80, pct)));
  }, [dragging]);

  return (
    <div className="app" style={cssVars} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <SiteHeader
        currentPage="playground"
        rightSlot={
          <>
          <div className="theme-picker" role="group" aria-label="Choose theme">
            {(Object.keys(themes) as ThemeName[]).map(name => (
              <button
                key={name}
                type="button"
                className={`theme-dot${themeName === name ? ' theme-dot--active' : ''}`}
                style={{ background: THEME_DOTS[name][isDark ? 'dark' : 'light'] }}
                onClick={() => setThemeName(name)}
                title={themes[name].label}
                aria-label={`${themes[name].label} theme`}
                aria-pressed={themeName === name}
              />
            ))}
          </div>
          <button
            type="button"
            className={`btn-icon${isStreaming ? ' btn-icon--active' : ''}`}
            onClick={isStreaming ? stopStream : startStream}
            title={isStreaming ? 'Stop stream simulation' : 'Simulate streaming render'}
          >
            {isStreaming ? '⏹ Stop' : '▶ Stream'}
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsDark(d => !d)}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
          </>
        }
      />

      <section className="playground-intro">
        <div className="playground-intro__copy">
          <span className="playground-intro__eyebrow">Playground</span>
          <h1>Test real markdown workflows before you wire md4ai into your app.</h1>
          <p>
            Switch between realistic samples, stream partial responses, and compare source markdown
            with the rendered output side by side.
          </p>
          <div className="playground-intro__code">import {'{ parse }'} from '@architprasar/md4ai/core' + import {'{ renderContent }'} from '@architprasar/md4ai/react'</div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.95rem' }}>
            <a href="./token-efficiency.html" className="btn-icon" style={{ textDecoration: 'none' }}>See token efficiency</a>
          </div>
        </div>
        <div className="playground-intro__meta">
          <div className="playground-stat">
            <strong>{SAMPLE_CONTENTS.length}</strong>
            <span>copy-ready scenarios</span>
          </div>
          <div className="playground-stat">
            <strong>Streaming-safe</strong>
            <span>handles partial blocks without blowing up</span>
          </div>
          <div className="playground-stat">
            <strong>Extensible</strong>
            <span>bridges, themes, and renderer overrides</span>
          </div>
          <div className="playground-stat">
            <strong>Often smaller than UI JSON</strong>
            <span>compact directives can reduce schema overhead and retry cost</span>
          </div>
        </div>
      </section>

      <section className="sample-rail" aria-label="Sample scenarios">
        {SAMPLE_CONTENTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className={`sample-chip${sample.id === selectedSample ? ' sample-chip--active' : ''}`}
            onClick={() => loadSample(sample.id)}
          >
            <span className="sample-chip__label">{sample.label}</span>
            <span className="sample-chip__description">{sample.description}</span>
          </button>
        ))}
      </section>

      <div className="app-body" ref={containerRef}>
        <div className="pane pane--editor" style={{ width: `${splitPct}%` }}>
          <div className="pane__header">
            <span>Markdown</span>
            <span className="pane__badge">{activeSample.label.toLowerCase()}</span>
          </div>
          <textarea
            className="editor"
            value={source}
            onChange={e => setSource(e.target.value)}
            spellCheck={false}
            aria-label="Markdown source editor"
          />
        </div>

        <div
          className={`divider${dragging ? ' divider--active' : ''}`}
          onMouseDown={onMouseDown}
          role="separator"
          aria-label="Resize panels"
        />

        <div className="pane pane--preview" style={{ width: `${100 - splitPct}%` }}>
          <div className="pane__header">
            <span>Preview</span>
            <span className="pane__badge">{isStreaming ? 'streaming' : themes[themeName].label.toLowerCase()}</span>
          </div>
          <div className="preview">
            {rendered}
          </div>
        </div>
      </div>
    </div>
  );
}
