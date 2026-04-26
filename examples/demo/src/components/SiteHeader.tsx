import React from 'react';

type SitePage = 'showcase' | 'playground' | 'docs' | 'efficiency' | 'eval';

const NAV_ITEMS: Array<{ id: SitePage; label: string; href: string }> = [
  { id: 'showcase', label: 'Showcase', href: './showcase.html' },
  { id: 'playground', label: 'Playground', href: './index.html' },
  { id: 'docs', label: 'Docs', href: './docs.html' },
  { id: 'efficiency', label: 'Efficiency', href: './token-efficiency.html' },
];

export function SiteHeader({
  currentPage,
  rightSlot,
  position = 'static',
}: {
  currentPage: SitePage;
  rightSlot?: React.ReactNode;
  position?: 'static' | 'sticky' | 'fixed';
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = NAV_ITEMS.map((item) => {
    const isActive = item.id === currentPage;
    return (
      <a
        key={item.id}
        href={item.href}
        className={`app-header__nav-link${isActive ? ' app-header__nav-link--active' : ''}`}
      >
        {item.label}
      </a>
    );
  });

  const githubLink = (
    <a href="https://github.com/architprasar/md4ai" className="app-header__nav-link">
      GitHub
    </a>
  );

  return (
    <>
      <header
        className="app-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          minHeight: 52,
          padding: '0 1.25rem',
          position,
          top: position === 'static' ? undefined : 0,
          left: position === 'fixed' ? 0 : undefined,
          right: position === 'fixed' ? 0 : undefined,
          zIndex: position === 'static' ? undefined : 100,
          background: position === 'static'
            ? 'color-mix(in srgb, var(--surface) 94%, transparent)'
            : 'color-mix(in srgb, var(--bg) 78%, transparent)',
          backdropFilter: position === 'static' ? undefined : 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          boxShadow: position === 'static' ? 'var(--shadow-xs)' : '0 1px 0 0 color-mix(in srgb, var(--border) 75%, transparent)',
        }}
      >
        <div
          className="app-header__identity"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}
        >
          <div
            className="app-header__logo"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}
          >
            <a
              href="./showcase.html"
              className="app-header__logo-text"
              style={{
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.03em',
              }}
            >
              md4ai
            </a>
            <span
              className="app-header__tagline"
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              rich markdown for AI
            </span>
          </div>

          {/* Desktop nav — hidden on mobile via CSS */}
          <nav className="app-header__nav" aria-label="Primary">
            {navLinks}
            {githubLink}
          </nav>
        </div>

        {/* Desktop actions — hidden on mobile via CSS */}
        <div className="app-header__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {rightSlot}
        </div>

        {/* Hamburger — hidden on desktop via CSS */}
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile dropdown — outside header, positioned below it */}
      <div className={`app-header__dropdown${isOpen ? ' app-header__dropdown--open' : ''}`} aria-hidden={!isOpen}>
        <nav className="app-header__dropdown-nav" aria-label="Mobile primary">
          {navLinks}
          {githubLink}
        </nav>
        {rightSlot && (
          <div className="app-header__dropdown-actions">
            {rightSlot}
          </div>
        )}
      </div>
    </>
  );
}
