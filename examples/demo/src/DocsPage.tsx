import React, { useEffect, useMemo, useState } from 'react';
import { themes } from '@architprasar/md4ai/react';
import { SiteBackdrop } from './components/SiteBackdrop.js';
import { SiteHeader } from './components/SiteHeader.js';
import { DOCS_NAV, DocsHeroSection, GettingStartedSection, PromptingSection, SyntaxSection, BridgesSection, ReferenceSections } from './docs/sections.js';
import { demoChromeVars, tokensToCSSVars, useStoredColorMode } from './theme.js';

const SIDEBAR_W = 240;

export default function DocsPage() {
  const [isDark, setIsDark] = useStoredColorMode('dark');
  const [active, setActive] = useState('getting-started');

  const flatNavIds = useMemo(
    () => DOCS_NAV.flatMap((section) => [section.id, ...(section.children?.map((child) => child.id) ?? [])]),
    []
  );

  const docsTheme = useMemo(
    () => themes.zinc[isDark ? 'dark' : 'light'],
    [isDark]
  );

  const cssVars = useMemo(
    () => ({
      ...tokensToCSSVars(docsTheme),
      ...demoChromeVars(isDark),
    }),
    [docsTheme, isDark]
  );

  useEffect(() => {
    const updateActive = () => {
      const headings = flatNavIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

      let current = headings[0]?.id ?? 'getting-started';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 120) current = heading.id;
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
      <SiteBackdrop />
      <SiteHeader
        currentPage="docs"
        position="fixed"
        rightSlot={
          <>
            <code className="playground-intro__code" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>npm install @architprasar/md4ai</code>
            <button onClick={() => setIsDark((d) => !d)} className="btn-icon">
              {isDark ? 'Light' : 'Dark'}
            </button>
          </>
        }
      />

      <div style={{ display: 'flex', paddingTop: 52 }}>
        <aside style={{
          position: 'fixed', top: 52, bottom: 0, left: 0, width: SIDEBAR_W, overflowY: 'auto',
          borderRight: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
          padding: '1.1rem 0.85rem 1.5rem',
        }}>
          {DOCS_NAV.map((section) => {
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
                <a href={`#${section.id}`} style={{
                  display: 'block', padding: '0.42rem 0.9rem',
                  fontSize: '0.82rem', fontWeight: sectionActive ? 700 : 600,
                  color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.01em',
                }}>{section.label}</a>
                {section.children && (
                  <div style={{ display: 'grid', gap: '0.15rem', marginTop: '0.1rem', padding: '0.1rem 0.35rem 0.35rem' }}>
                    {section.children.map((child) => (
                      <a
                        key={child.id}
                        href={`#${child.id}`}
                        style={{
                          display: 'block', padding: '0.38rem 0.55rem 0.38rem 1rem',
                          fontSize: '0.77rem', fontWeight: active === child.id ? 700 : 500,
                          color: active === child.id ? 'var(--text)' : 'var(--text-muted)',
                          textDecoration: 'none', borderRadius: '0.7rem',
                          background: active === child.id ? 'var(--surface)' : 'transparent',
                          boxShadow: active === child.id ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
                          border: active === child.id ? '1px solid var(--border)' : '1px solid transparent',
                          position: 'relative',
                        }}
                      >
                        <span style={{
                          position: 'absolute', left: '0.45rem', top: '50%', width: 5, height: 5,
                          marginTop: -2.5, borderRadius: '50%',
                          background: active === child.id ? 'var(--accent)' : 'var(--border)',
                        }} />
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        <main style={{ marginLeft: SIDEBAR_W, flex: 1, maxWidth: 740, padding: '3rem 3rem 8rem', minWidth: 0, position: 'relative' }}>
          <DocsHeroSection />
          <GettingStartedSection docsTheme={docsTheme} />
          <PromptingSection />
          <SyntaxSection docsTheme={docsTheme} />
          <BridgesSection docsTheme={docsTheme} />
          <ReferenceSections />
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
