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
  const [showNav, setShowNav] = useState(false);

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

  const closeNav = () => setShowNav(false);

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

      <div className="docs-mobile-nav">
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>
          {DOCS_NAV.find(s => s.id === active || s.children?.some(c => c.id === active))?.label ?? 'Documentation'}
        </span>
        <button className="menu-toggle" onClick={() => setShowNav(!showNav)}>
          {showNav ? '✕' : '☰'}
        </button>
      </div>

      <div style={{ display: 'flex', paddingTop: 52 }}>
        <aside className={`docs-sidebar${showNav ? ' docs-sidebar--open' : ''}`}>
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
                <a href={`#${section.id}`} onClick={closeNav} style={{
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
                        onClick={closeNav}
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

        <main className="docs-main">
          <DocsHeroSection />
          <GettingStartedSection docsTheme={docsTheme} />
          <PromptingSection />
          <SyntaxSection docsTheme={docsTheme} />
          <BridgesSection docsTheme={docsTheme} />
          <ReferenceSections />
        </main>
      </div>


    </div>
  );
}
