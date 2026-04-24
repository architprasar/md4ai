import React from 'react';
import { defineBridge } from 'md4ai/core';

// ── @status[value] ────────────────────────────────────────────────────────────
// Simple colored pill — already in App.tsx, kept here for co-location

// ── @kpi[value: $167k, label: East Revenue, change: +18%, period: QoQ] ───────
// Full metric card: large value, label, trend arrow, period badge

export const kpiBridge = defineBridge<Record<string, string>>({
  marker: 'kpi',
  pattern: 'keyvalue',
  prompt: 'Use @kpi[value: X, label: Y, change: +Z%, period: P] to show a metric. Example: @kpi[value: $167k, label: Revenue, change: +18%, period: QoQ]',
  render: ({ value, label, change, period }) => {
    const isPositive = change?.startsWith('+');
    const isNegative = change?.startsWith('-');
    const changeColor = isPositive ? '#16a34a' : isNegative ? '#dc2626' : 'var(--text-muted)';
    const changeBg = isPositive ? '#dcfce7' : isNegative ? '#fee2e2' : 'var(--surface2)';

    return (
      <span style={{
        display: 'inline-flex', flexDirection: 'column',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '0.75rem', padding: '0.75rem 1rem',
        minWidth: 140, verticalAlign: 'middle',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        margin: '0.25rem 0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label ?? 'Metric'}
          </span>
          {period && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '9999px', padding: '0.05em 0.4em' }}>
              {period}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>
            {value ?? '—'}
          </span>
          {change && (
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, color: changeColor,
              background: changeBg, borderRadius: '9999px',
              padding: '0.1em 0.45em', display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
            }}>
              {isPositive ? '↑' : isNegative ? '↓' : ''}
              {change}
            </span>
          )}
        </span>
      </span>
    );
  },
});

// ── @sparkline[44, 47, 51, 48, 61, 58] ───────────────────────────────────────
// Inline SVG sparkline — renders a tiny line chart directly in prose

export const sparklineBridge = defineBridge<string[]>({
  marker: 'sparkline',
  pattern: 'array',
  prompt: 'Use @sparkline[n1, n2, n3, ...] to show a mini trend line inline. Example: @sparkline[44, 47, 51, 48, 61, 58]',
  render: (items) => {
    const values = items.map(Number).filter((n) => !isNaN(n));
    if (values.length < 2) return null;

    const W = 80, H = 28, PAD = 2;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const toX = (i: number) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

    const points = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const trending = last >= prev ? '#16a34a' : '#dc2626';

    // Area fill path
    const areaPath = `M${toX(0).toFixed(1)},${H} ` +
      values.map((v, i) => `L${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ') +
      ` L${toX(values.length - 1).toFixed(1)},${H} Z`;

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', verticalAlign: 'middle' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trending} stopOpacity="0.15" />
              <stop offset="100%" stopColor={trending} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#spark-fill)" />
          <polyline
            points={points}
            fill="none"
            stroke={trending}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Last point dot */}
          <circle
            cx={toX(values.length - 1)}
            cy={toY(last)}
            r="2.5"
            fill={trending}
          />
        </svg>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: trending }}>
          {last >= prev ? '↑' : '↓'} {last}
        </span>
      </span>
    );
  },
});

// ── @timeline[Discovery: done, Design: done, Build: active, Launch: planned] ──
// Horizontal stepper showing project stages with status coloring

type TimelineStatus = 'done' | 'active' | 'planned' | 'blocked';

const STEP_CONFIG: Record<TimelineStatus, { color: string; bg: string; icon: string }> = {
  done:    { color: '#16a34a', bg: '#dcfce7', icon: '✓' },
  active:  { color: '#2563eb', bg: '#dbeafe', icon: '●' },
  planned: { color: '#71717a', bg: '#f4f4f5', icon: '○' },
  blocked: { color: '#dc2626', bg: '#fee2e2', icon: '✕' },
};

export const timelineBridge = defineBridge<Record<string, string>>({
  marker: 'timeline',
  pattern: 'keyvalue',
  prompt: 'Use @timeline[Step: status, Step: status] to show a project timeline. Status is done/active/planned/blocked. Example: @timeline[Discovery: done, Design: active, Build: planned]',
  render: (steps) => {
    const entries = Object.entries(steps);

    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '0.75rem', padding: '0.65rem 1rem',
        gap: 0, verticalAlign: 'middle',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        margin: '0.25rem 0', flexWrap: 'wrap',
        maxWidth: '100%',
      }}>
        {entries.map(([step, rawStatus], i) => {
          const status = (rawStatus.trim().toLowerCase()) as TimelineStatus;
          const cfg = STEP_CONFIG[status] ?? STEP_CONFIG.planned;
          const isLast = i === entries.length - 1;

          return (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: 64 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: cfg.bg, color: cfg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  border: `2px solid ${cfg.color}`,
                  flexShrink: 0,
                }}>
                  {cfg.icon}
                </span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, color: status === 'planned' ? 'var(--text-muted)' : cfg.color,
                  textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {step}
                </span>
              </span>
              {!isLast && (
                <span style={{
                  flex: '1 0 16px', height: 2, minWidth: 12, maxWidth: 32,
                  background: cfg.color === STEP_CONFIG.done.color ? '#16a34a' : 'var(--border)',
                  alignSelf: 'flex-start', marginTop: 13, opacity: 0.5,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </span>
    );
  },
});

// ── @payment[amount: $49, plan: Pro Monthly, desc: Unlimited usage + priority support] ──
// Checkout card — amount, plan name, description, pay button, secure badge

export const paymentBridge = defineBridge<Record<string, string>>({
  marker: 'payment',
  pattern: 'keyvalue',
  prompt: 'Use @payment[amount: $X, plan: Name, desc: Description] to show a payment card. Example: @payment[amount: $49, plan: Pro Monthly, desc: Unlimited usage and priority support]',
  render: ({ amount, plan, desc }, { emit }) => {
    return (
      <span style={{
        display: 'inline-flex', flexDirection: 'column',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '1rem', overflow: 'hidden',
        width: '100%', maxWidth: 360,
        boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.08), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        verticalAlign: 'middle', margin: '0.5rem 0',
      }}>

        {/* Header band */}
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem 0.9rem',
          background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 75%, #7c3aed) 100%)',
        }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgb(255 255 255 / 0.7)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {plan ?? 'Plan'}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {amount ?? '—'}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.75, marginLeft: '0.25rem' }}>/mo</span>
            </span>
          </span>
          {/* Credit card icon */}
          <span style={{
            width: 44, height: 44, borderRadius: '0.6rem',
            background: 'rgb(255 255 255 / 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
          </span>
        </span>

        {/* Body */}
        <span style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem', gap: '1rem' }}>

          {/* Description */}
          {desc && (
            <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {desc}
            </span>
          )}

          {/* Feature pills */}
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {['Instant activation', 'Cancel anytime', 'Secure checkout'].map((f) => (
              <span key={f} style={{
                fontSize: '0.68rem', fontWeight: 500,
                color: 'var(--text-muted)', background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '9999px', padding: '0.15em 0.55em',
              }}>
                ✓ {f}
              </span>
            ))}
          </span>

          {/* Pay button */}
          <button
            onClick={() => emit('pay', { amount, plan })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              width: '100%', padding: '0.65rem 1rem',
              background: 'var(--accent)', color: 'var(--bg)',
              border: 'none', borderRadius: '0.6rem',
              fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.01em',
              cursor: 'pointer',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.15)',
              transition: 'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Pay {amount ?? ''} securely
          </button>

          {/* Secure note */}
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            256-bit SSL encryption · Powered by Stripe
          </span>
        </span>
      </span>
    );
  },
});

export const releaseBridge = defineBridge<Record<string, string>>({
  marker: 'release',
  pattern: 'keyvalue',
  prompt: 'Use @release[name: Feature, status: beta, eta: Jul 2026, owner: Platform] to show a small release badge card inline.',
  render: ({ name, status, eta, owner }) => {
    const normalized = (status ?? 'planned').trim().toLowerCase();
    const tone = normalized === 'live'
      ? { fg: '#166534', bg: '#dcfce7', border: '#86efac' }
      : normalized === 'beta'
        ? { fg: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' }
        : normalized === 'blocked'
          ? { fg: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' }
          : { fg: '#6b21a8', bg: '#f3e8ff', border: '#d8b4fe' };

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'stretch',
        gap: '0.75rem',
        padding: '0.75rem 0.9rem',
        borderRadius: '0.9rem',
        border: `1px solid ${tone.border}`,
        background: 'var(--surface)',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        verticalAlign: 'middle',
        margin: '0.2rem 0',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 58,
          borderRadius: '0.65rem',
          background: tone.bg,
          color: tone.fg,
          fontSize: '0.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '0 0.55rem',
        }}>
          {normalized}
        </span>
        <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.16rem' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {name ?? 'Release'}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            {[owner ? `Owner: ${owner}` : null, eta ? `ETA: ${eta}` : null].filter(Boolean).join(' · ') || 'Tracked in roadmap'}
          </span>
        </span>
      </span>
    );
  },
});

export const BRIDGES = [kpiBridge, sparklineBridge, timelineBridge, paymentBridge, releaseBridge];
