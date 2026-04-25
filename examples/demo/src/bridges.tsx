import React from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import ReactFlow, { Background, Controls, MarkerType, MiniMap, Position } from 'reactflow';
import { defineBridge, splitKV, unquoteKV, B } from '@architprasar/md4ai/core';

type Tone = 'done' | 'active' | 'planned' | 'blocked';

const STATUS_TONES: Record<Tone, { fg: string; bg: string; border: string; glow: string; icon: string }> = {
  done: {
    fg: 'color-mix(in srgb, #22c55e 78%, var(--text))',
    bg: 'color-mix(in srgb, #22c55e 14%, var(--surface))',
    border: 'color-mix(in srgb, #22c55e 28%, var(--border))',
    glow: 'rgba(34, 197, 94, 0.16)',
    icon: '✓',
  },
  active: {
    fg: 'color-mix(in srgb, #60a5fa 82%, var(--text))',
    bg: 'color-mix(in srgb, #3b82f6 14%, var(--surface))',
    border: 'color-mix(in srgb, #60a5fa 26%, var(--border))',
    glow: 'rgba(59, 130, 246, 0.18)',
    icon: '●',
  },
  planned: {
    fg: 'var(--text-muted)',
    bg: 'color-mix(in srgb, var(--surface2) 94%, var(--surface))',
    border: 'var(--border)',
    glow: 'rgba(148, 163, 184, 0.12)',
    icon: '○',
  },
  blocked: {
    fg: 'color-mix(in srgb, #ef4444 82%, var(--text))',
    bg: 'color-mix(in srgb, #ef4444 14%, var(--surface))',
    border: 'color-mix(in srgb, #ef4444 28%, var(--border))',
    glow: 'rgba(239, 68, 68, 0.16)',
    icon: '✕',
  },
};

function getTone(value?: string) {
  const normalized = (value ?? 'planned').trim().toLowerCase() as Tone;
  return STATUS_TONES[normalized] ?? STATUS_TONES.planned;
}



const FlowCard = React.memo(function FlowCard({
  title,
  note,
  nodes,
  edges,
}: FlowBridgeData) {
  const rfNodes = React.useMemo(() => nodes.map((node) => {
    const tone = getTone(node.status);
    return {
      id: node.id,
      position: { x: node.x, y: node.y },
      data: {
        label: (
          <div style={{ display: 'grid', gap: 3 }}>
            <strong style={{ fontSize: 12, lineHeight: 1.2 }}>{node.label}</strong>
            {node.meta ? <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{node.meta}</span> : null}
          </div>
        ),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        borderRadius: 14,
        padding: '10px 12px',
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        color: 'var(--text)',
        fontSize: 12,
        width: 160,
        boxShadow: 'var(--shadow-xs)',
      },
      draggable: false,
      selectable: false,
    };
  }), [nodes]);

  const rfEdges = React.useMemo(() => edges.map((edge) => ({
    ...edge,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: 'var(--border)' },
    animated: false,
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
    labelStyle: { fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 },
  })), [edges]);

  return (
    <span
      className="showcase-bridge showcase-bridge--flow"
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 660,
        margin: '0.55rem 0 1rem',
        padding: '1rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <span style={{ display: 'grid', gap: '0.75rem' }}>
        {(title || note) && (
          <span style={{ display: 'grid', gap: '0.2rem' }}>
            {title && <strong style={{ fontSize: '0.96rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{title}</strong>}
            {note && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{note}</span>}
          </span>
        )}
        <span style={{ height: 280, borderRadius: '0.9rem', overflow: 'hidden', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface2) 80%, var(--surface))' }}>
          <ReactFlow
            nodes={rfNodes as never[]}
            edges={rfEdges as never[]}
            fitView
            minZoom={0.4}
            maxZoom={1.2}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap pannable zoomable nodeStrokeColor={() => 'var(--border)'} nodeColor={() => 'var(--surface2)'} maskColor="rgba(24,24,27,0.06)" />
            <Controls showInteractive={false} position="bottom-right" />
            <Background gap={18} size={1} color="rgba(148,163,184,0.18)" />
          </ReactFlow>
        </span>
      </span>
    </span>
  );
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next));

const MarketChartCard = React.memo(function MarketChartCard({ data }: { data: CandleBridgeData }) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref.current || data.candles.length === 0) return;

    const chart = createChart(ref.current, {
      autoSize: true,
      height: 280,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.12)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.12)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(56, 189, 248, 0.35)' },
        horzLine: { color: 'rgba(56, 189, 248, 0.35)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(148, 163, 184, 0.16)',
      },
      timeScale: {
        borderColor: 'rgba(148, 163, 184, 0.16)',
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeries.setData(data.candles.map((candle) => ({
      time: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    })) as never[]);

    const volumes = data.candles.filter((candle) => candle.volume != null);
    if (volumes.length > 0) {
      const volumeSeries = chart.addHistogramSeries({
        color: 'rgba(56, 189, 248, 0.4)',
        priceScaleId: '',
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.78,
          bottom: 0,
        },
      });
      volumeSeries.setData(volumes.map((candle) => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? 'rgba(34,197,94,0.38)' : 'rgba(239,68,68,0.34)',
      })) as never[]);
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data]);

  const last = data.candles[data.candles.length - 1];

  return (
    <span
      className="showcase-bridge showcase-bridge--candles"
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 760,
        margin: '0.55rem 0 1rem',
        padding: '1rem',
        borderRadius: '1rem',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <span style={{ display: 'grid', gap: '0.8rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'grid', gap: '0.18rem' }}>
            <strong style={{ fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{data.symbol ?? 'Market chart'}</strong>
            {data.thesis && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{data.thesis}</span>}
          </span>
          {last && (
            <span style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center', borderRadius: '999px', border: '1px solid var(--border)', background: 'var(--surface2)', padding: '0.3rem 0.7rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Last close <strong style={{ color: 'var(--text)', fontSize: '0.76rem' }}>${last.close.toFixed(2)}</strong>
            </span>
          )}
        </span>
        {(data.levels?.length ?? 0) > 0 && (
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {data.levels!.map((level) => (
              <span key={level} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.22rem 0.58rem' }}>
                {level}
              </span>
            ))}
          </span>
        )}
        <span ref={ref} style={{ height: 280, borderRadius: '0.85rem', overflow: 'hidden', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface2) 78%, var(--surface))' }} />
      </span>
    </span>
  );
}, (prev, next) => JSON.stringify(prev) === JSON.stringify(next));

export const kpiBridge = defineBridge({
  marker: 'kpi',
  fields: [
    B.string('label').describe('Metric name (e.g., Revenue, Checkout Processor)'),
    B.string('value').describe('Current value (e.g., $167k, 61%)'),
    B.string('change').describe('Change vs baseline with sign (e.g., +18%, -14%)').optional(),
    B.string('period').describe('Comparison period (e.g., QoQ, vs main)').optional(),
  ],
  render: ({ value, label, change, period }) => {
    const isPositive = change?.startsWith('+');
    const isNegative = change?.startsWith('-');
    const changeColor = isPositive
      ? 'color-mix(in srgb, #22c55e 76%, var(--text))'
      : isNegative
        ? 'color-mix(in srgb, #ef4444 80%, var(--text))'
        : 'var(--text-muted)';
    const changeBg = isPositive
      ? 'color-mix(in srgb, #22c55e 14%, var(--surface))'
      : isNegative
        ? 'color-mix(in srgb, #ef4444 14%, var(--surface))'
        : 'color-mix(in srgb, var(--surface2) 92%, var(--surface))';

    return (
      <span
        className="showcase-bridge showcase-bridge--metric"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.95rem',
          padding: '0.8rem 1rem',
          minWidth: 148,
          verticalAlign: 'middle',
          boxShadow: 'var(--shadow-xs)',
          margin: '0.25rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, transparent), transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem', position: 'relative' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label ?? 'Metric'}
          </span>
          {period && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '9999px', padding: '0.05em 0.4em' }}>
              {period}
            </span>
          )}
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', position: 'relative' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.1 }}>
            {value ?? '—'}
          </span>
          {change && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: changeColor,
                background: changeBg,
                borderRadius: '9999px',
                padding: '0.1em 0.45em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.15rem',
              }}
            >
              {isPositive ? '↑' : isNegative ? '↓' : ''}
              {change}
            </span>
          )}
        </span>
      </span>
    );
  },
});

export const sparklineBridge = defineBridge({
  marker: 'sparkline',
  fields: [
    B.list('items', B.string()).describe('Numbers to plot (e.g. 44, 47, 51)'),
  ],
  render: ({ items }) => {
    const values = (items || []).map(Number).filter((n) => !isNaN(n));
    if (values.length < 2) return null;

    const width = 84;
    const height = 30;
    const padding = 2;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const toX = (i: number) => padding + (i / (values.length - 1)) * (width - padding * 2);
    const toY = (v: number) => height - padding - ((v - min) / range) * (height - padding * 2);

    const points = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const trending = last >= prev ? '#22c55e' : '#ef4444';
    const areaPath = `M${toX(0).toFixed(1)},${height} ` +
      values.map((v, i) => `L${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ') +
      ` L${toX(values.length - 1).toFixed(1)},${height} Z`;

    return (
      <span className="showcase-bridge showcase-bridge--sparkline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', verticalAlign: 'middle' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trending} stopOpacity="0.16" />
              <stop offset="100%" stopColor={trending} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#spark-fill)" />
          <polyline points={points} fill="none" stroke={trending} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={toX(values.length - 1)} cy={toY(last)} r="2.5" fill={trending} />
        </svg>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: trending }}>
          {last >= prev ? '↑' : '↓'} {last}
        </span>
      </span>
    );
  },
});

export const timelineBridge = defineBridge({
  marker: 'timeline',
  fields: [
    B.keyvalue('steps').describe('Step: status (done|active|planned|blocked)'),
  ],
  render: ({ steps }) => {
    const entries = Object.entries(steps || {});

    return (
      <span
        className="showcase-bridge showcase-bridge--timeline"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0.95rem',
          padding: '0.75rem 1rem',
          gap: 0,
          verticalAlign: 'middle',
          boxShadow: 'var(--shadow-xs)',
          margin: '0.25rem 0',
          flexWrap: 'wrap',
          maxWidth: '100%',
        }}
      >
        {entries.map(([step, rawStatus], index) => {
          const normalized = (rawStatus.trim().toLowerCase()) as Tone;
          const tone = STATUS_TONES[normalized] ?? STATUS_TONES.planned;
          const isLast = index === entries.length - 1;

          return (
            <React.Fragment key={index}>
              <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: 68 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: tone.bg,
                    color: tone.fg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: `2px solid ${tone.border}`,
                    flexShrink: 0,
                    boxShadow: `0 0 0 4px ${tone.glow}`,
                  }}
                >
                  {tone.icon}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: normalized === 'planned' ? 'var(--text-muted)' : tone.fg, textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step}
                </span>
              </span>
              {!isLast && (
                <span
                  style={{
                    flex: '1 0 16px',
                    height: 2,
                    minWidth: 12,
                    maxWidth: 32,
                    background: normalized === 'done'
                      ? 'color-mix(in srgb, #22c55e 62%, var(--border))'
                      : 'var(--border)',
                    alignSelf: 'flex-start',
                    marginTop: 13,
                    opacity: 0.6,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </span>
    );
  },
});

export const paymentBridge = defineBridge({
  marker: 'payment',
  fields: [
    B.string('amount').describe('Price per month (e.g., $79)'),
    B.string('plan').describe('Plan name (e.g., CodeSentinel Pro)'),
    B.string('desc').describe('One-sentence description of what is included').optional(),
  ],
  render: ({ amount, plan, desc }, { emit }) => {
    return (
      <span
        className="showcase-bridge showcase-bridge--payment"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          overflow: 'hidden',
          width: '100%',
          maxWidth: 360,
          boxShadow: 'var(--shadow)',
          verticalAlign: 'middle',
          margin: '0.5rem 0',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem 0.9rem',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 88%, #0f172a) 0%, color-mix(in srgb, #0ea5e9 70%, #2563eb) 100%)',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgb(255 255 255 / 0.72)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {plan ?? 'Plan'}
            </span>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {amount ?? '—'}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.75, marginLeft: '0.25rem' }}>/mo</span>
            </span>
          </span>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '0.6rem',
              background: 'rgb(255 255 255 / 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </span>
        </span>

        <span style={{ display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem', gap: '1rem' }}>
          {desc && (
            <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              {desc}
            </span>
          )}

          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {['Instant activation', 'Cancel anytime', 'Secure checkout'].map((feature) => (
              <span
                key={feature}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  background: 'color-mix(in srgb, var(--surface2) 90%, var(--surface))',
                  border: '1px solid var(--border)',
                  borderRadius: '9999px',
                  padding: '0.15em 0.55em',
                }}
              >
                ✓ {feature}
              </span>
            ))}
          </span>

          <button
            onClick={() => emit('pay', { amount, plan })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              width: '100%',
              padding: '0.7rem 1rem',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: '0.7rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
              transition: 'opacity 0.15s, transform 0.12s',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = '0.92';
              event.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = '1';
              event.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Pay {amount ?? '—'} securely
          </button>

          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            256-bit SSL encryption · Powered by Stripe
          </span>
        </span>
      </span>
    );
  },
});

export const releaseBridge = defineBridge({
  marker: 'release',
  fields: [
    B.string('name').describe('Package or feature name (e.g., zod v3.22)'),
    B.enum('status', ['live', 'beta', 'planned', 'blocked']).default('planned'),
    B.string('eta').describe('Expected release or current pin (e.g., Stable, Pinned at rc.2)').optional(),
    B.string('owner').describe('Team or person responsible (e.g., Platform)').optional(),
  ],
  render: ({ name, status, eta, owner }) => {
    const normalized = (status ?? 'planned').trim().toLowerCase();
    const tone = normalized === 'live'
      ? {
          fg: 'color-mix(in srgb, #22c55e 76%, var(--text))',
          bg: 'color-mix(in srgb, #22c55e 14%, var(--surface))',
          border: 'color-mix(in srgb, #22c55e 28%, var(--border))',
        }
      : normalized === 'beta'
        ? {
            fg: 'color-mix(in srgb, #60a5fa 80%, var(--text))',
            bg: 'color-mix(in srgb, #3b82f6 14%, var(--surface))',
            border: 'color-mix(in srgb, #60a5fa 24%, var(--border))',
          }
        : normalized === 'blocked'
          ? {
              fg: 'color-mix(in srgb, #ef4444 80%, var(--text))',
              bg: 'color-mix(in srgb, #ef4444 14%, var(--surface))',
              border: 'color-mix(in srgb, #ef4444 26%, var(--border))',
            }
          : {
              fg: 'color-mix(in srgb, #c084fc 78%, var(--text))',
              bg: 'color-mix(in srgb, #a855f7 14%, var(--surface))',
              border: 'color-mix(in srgb, #a855f7 22%, var(--border))',
            };

    return (
      <span
        className="showcase-bridge showcase-bridge--release"
        style={{
          display: 'inline-flex',
          alignItems: 'stretch',
          gap: '0.75rem',
          padding: '0.8rem 0.95rem',
          borderRadius: '0.95rem',
          border: `1px solid ${tone.border}`,
          background: 'color-mix(in srgb, var(--surface) 96%, transparent)',
          boxShadow: 'var(--shadow-xs)',
          verticalAlign: 'middle',
          margin: '0.2rem 0',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 60,
            borderRadius: '0.65rem',
            background: tone.bg,
            color: tone.fg,
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 0.55rem',
          }}
        >
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

export const agentBridge = defineBridge({
  marker: 'agent',
  fields: [
    B.string('name').describe('Agent display name'),
    B.string('role').describe('Agent purpose'),
    B.enum('status', ['done', 'active', 'planned', 'blocked']).default('planned'),
    B.string('latency').optional().describe('Runtime (e.g. 4.2s)'),
    B.list('tools', B.string()).optional().describe('Tools used'),
    B.string('goal').optional().describe('Objective'),
  ],
  render: ({ name, role, status, latency, tools, goal }) => {
    const tone = getTone(status);
    const toolList = tools || [];

    return (
      <span
        className="showcase-bridge showcase-bridge--agent"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 560,
          borderRadius: '1rem',
          border: `1px solid ${tone.border}`,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
          padding: '1rem',
          margin: '0.6rem 0 0.9rem',
        }}
      >
        <span style={{ display: 'grid', gap: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <span
                style={{
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '0.7rem',
                  display: 'grid',
                  placeItems: 'center',
                  background: tone.bg,
                  border: `1px solid ${tone.border}`,
                  color: tone.fg,
                  fontSize: '0.86rem',
                  fontWeight: 800,
                }}
              >
                AI
              </span>
              <span style={{ display: 'grid', gap: '0.18rem' }}>
                <strong style={{ fontSize: '0.98rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{name ?? 'Agent'}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{role ?? 'Autonomous workflow'}</span>
              </span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '999px',
                background: tone.bg,
                border: `1px solid ${tone.border}`,
                color: tone.fg,
                padding: '0.3rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {status ?? 'planned'}
            </span>
          </span>
          {(latency || goal) && (
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {latency && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.2rem 0.55rem' }}>
                  Latency {latency}
                </span>
              )}
              {goal && (
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.2rem 0.55rem' }}>
                  Goal: {goal}
                </span>
              )}
            </span>
          )}
          {toolList.length > 0 && (
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {toolList.map((tool) => (
                <span
                  key={tool}
                  style={{
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    background: 'color-mix(in srgb, var(--surface2) 88%, var(--surface))',
                    color: 'var(--text)',
                    padding: '0.22rem 0.58rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  {tool}
                </span>
              ))}
            </span>
          )}
        </span>
      </span>
    );
  },
});

export const signalBridge = defineBridge({
  marker: 'signal',
  fields: [
    B.string('title').describe('Finding title'),
    B.enum('tone', ['critical', 'warning', 'positive']).default('warning'),
    B.number('score').describe('Risk 0-10'),
    B.string('trend').optional().describe('Status label'),
    B.string('note').optional(),
  ],
  render: ({ title, tone, score, trend, note }) => {
    const palette = tone === 'critical'
      ? {
          fg: 'color-mix(in srgb, #ef4444 82%, var(--text))',
          bg: 'color-mix(in srgb, #ef4444 14%, var(--surface))',
          border: 'color-mix(in srgb, #ef4444 28%, var(--border))',
          halo: 'rgba(239, 68, 68, 0.18)',
        }
      : tone === 'positive'
        ? {
            fg: 'color-mix(in srgb, #22c55e 78%, var(--text))',
            bg: 'color-mix(in srgb, #22c55e 14%, var(--surface))',
            border: 'color-mix(in srgb, #22c55e 26%, var(--border))',
            halo: 'rgba(34, 197, 94, 0.16)',
          }
        : {
            fg: 'color-mix(in srgb, #f59e0b 82%, var(--text))',
            bg: 'color-mix(in srgb, #f59e0b 14%, var(--surface))',
            border: 'color-mix(in srgb, #f59e0b 28%, var(--border))',
            halo: 'rgba(245, 158, 11, 0.18)',
          };

    return (
      <span
        className="showcase-bridge showcase-bridge--signal"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 520,
          margin: '0.55rem 0 0.9rem',
          padding: '0.95rem 1rem',
          borderRadius: '1rem',
          border: `1px solid ${palette.border}`,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <span style={{ display: 'grid', gap: '0.2rem' }}>
              <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{title ?? 'Signal'}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{note ?? 'Decision-ready signal from streamed AI analysis.'}</span>
            </span>
            {score && (
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  minWidth: 56,
                  minHeight: 56,
                  borderRadius: '999px',
                  border: `1px solid ${palette.border}`,
                  background: palette.bg,
                  color: palette.fg,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                }}
              >
                {score}
              </span>
            )}
          </span>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                width: 'fit-content',
                borderRadius: '999px',
                background: palette.bg,
                border: `1px solid ${palette.border}`,
                color: palette.fg,
                padding: '0.28rem 0.65rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Trend {trend}
            </span>
          )}
        </span>
      </span>
    );
  },
});

export const commandBridge = defineBridge({
  marker: 'command',
  fields: [
    B.string('title'),
    B.string('stage').default('Live'),
    B.string('owner').optional(),
    B.list('channels', B.string()).optional(),
    B.string('note').optional(),
  ],
  render: ({ title, stage, owner, channels, note }) => {
    const channelList = channels || [];

    return (
      <span
        className="showcase-bridge showcase-bridge--command"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 620,
          margin: '0.65rem 0 1rem',
          padding: '1rem',
          borderRadius: '1rem',
          border: '1px solid color-mix(in srgb, var(--accent) 22%, var(--border))',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'grid', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {owner ?? 'AI control room'}
              </span>
              <strong style={{ fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{title ?? 'Command surface'}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '999px', padding: '0.28rem 0.7rem', background: 'color-mix(in srgb, #22c55e 16%, var(--surface))', border: '1px solid color-mix(in srgb, #22c55e 28%, var(--border))', color: 'color-mix(in srgb, #22c55e 78%, var(--text))', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {stage ?? 'Live'}
            </span>
          </span>
          {note && (
            <span style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
              {note}
            </span>
          )}
          {channelList.length > 0 && (
            <span style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: '0.6rem' }}>
              {channelList.map((channel, index) => (
                <span
                  key={channel}
                  style={{
                    padding: '0.7rem 0.8rem',
                    borderRadius: '0.8rem',
                    border: '1px solid var(--border)',
                    background: index === 0 ? 'var(--surface2)' : 'color-mix(in srgb, var(--surface2) 72%, var(--surface))',
                    color: 'var(--text)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {channel}
                </span>
              ))}
            </span>
          )}
        </span>
      </span>
    );
  },
});

export const tickerBridge = defineBridge({
  marker: 'ticker',
  fields: [
    B.string('symbol'),
    B.string('price'),
    B.string('move').optional(),
    B.string('volume').optional(),
    B.string('range').optional(),
    B.string('thesis').optional(),
  ],
  render: ({ symbol, price, move, volume, range, thesis }) => {
    const positive = (move ?? '').trim().startsWith('+');
    const negative = (move ?? '').trim().startsWith('-');
    const tone = positive
      ? {
          fg: 'color-mix(in srgb, #22c55e 78%, var(--text))',
          bg: 'color-mix(in srgb, #22c55e 14%, var(--surface))',
          border: 'color-mix(in srgb, #22c55e 24%, var(--border))',
        }
      : negative
        ? {
            fg: 'color-mix(in srgb, #ef4444 80%, var(--text))',
            bg: 'color-mix(in srgb, #ef4444 14%, var(--surface))',
            border: 'color-mix(in srgb, #ef4444 24%, var(--border))',
          }
        : {
            fg: 'var(--text-muted)',
            bg: 'var(--surface2)',
            border: 'var(--border)',
          };

    return (
      <span
        className="showcase-bridge showcase-bridge--ticker"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 560,
          margin: '0.5rem 0 0.9rem',
          padding: '1rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'grid', gap: '0.15rem' }}>
              <strong style={{ fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{symbol ?? 'Ticker'}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{thesis ?? 'Market snapshot'}</span>
            </span>
            {move && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderRadius: '999px',
                  border: `1px solid ${tone.border}`,
                  background: tone.bg,
                  color: tone.fg,
                  padding: '0.28rem 0.68rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                {move}
              </span>
            )}
          </span>
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.55rem' }}>
            <span style={{ border: '1px solid var(--border)', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', background: 'var(--surface2)' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.22rem' }}>Price</span>
              <span style={{ display: 'block', fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>{price ?? '—'}</span>
            </span>
            <span style={{ border: '1px solid var(--border)', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', background: 'var(--surface2)' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.22rem' }}>Volume</span>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{volume ?? '—'}</span>
            </span>
            <span style={{ border: '1px solid var(--border)', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', background: 'var(--surface2)' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.22rem' }}>Day range</span>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{range ?? '—'}</span>
            </span>
          </span>
        </span>
      </span>
    );
  },
});

export const positionBridge = defineBridge({
  marker: 'position',
  fields: [
    B.string('symbol'),
    B.enum('side', ['long', 'short']).default('long'),
    B.string('entry').optional(),
    B.string('target').optional(),
    B.string('stop').optional(),
    B.string('size').optional(),
    B.string('note').optional(),
  ],
  render: ({ symbol, side, entry, target, stop, size, note }) => {
    const isLong = (side ?? '').trim().toLowerCase() !== 'short';
    const tone = isLong
      ? {
          fg: 'color-mix(in srgb, #22c55e 78%, var(--text))',
          bg: 'color-mix(in srgb, #22c55e 14%, var(--surface))',
          border: 'color-mix(in srgb, #22c55e 24%, var(--border))',
        }
      : {
          fg: 'color-mix(in srgb, #ef4444 80%, var(--text))',
          bg: 'color-mix(in srgb, #ef4444 14%, var(--surface))',
          border: 'color-mix(in srgb, #ef4444 24%, var(--border))',
        };

    const fields = [
      ['Entry', entry],
      ['Target', target],
      ['Stop', stop],
      ['Size', size],
    ].filter(([, value]) => value);

    return (
      <span
        className="showcase-bridge showcase-bridge--position"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 560,
          margin: '0.5rem 0 0.9rem',
          padding: '1rem',
          borderRadius: '1rem',
          border: `1px solid ${tone.border}`,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'grid', gap: '0.15rem' }}>
              <strong style={{ fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{symbol ?? 'Position'}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{note ?? 'Portfolio position overview'}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', borderRadius: '999px', border: `1px solid ${tone.border}`, background: tone.bg, color: tone.fg, padding: '0.28rem 0.68rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {isLong ? 'Long' : 'Short'}
            </span>
          </span>
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.55rem' }}>
            {fields.map(([label, value]) => (
              <span key={label} style={{ border: '1px solid var(--border)', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', background: 'var(--surface2)' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.22rem' }}>{label}</span>
                <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>{value}</span>
              </span>
            ))}
          </span>
        </span>
      </span>
    );
  },
});

export const tradeBridge = defineBridge({
  marker: 'trade',
  fields: [
    B.string('action'),
    B.string('window').optional(),
    B.number('confidence').optional(),
    B.enum('status', ['done', 'active', 'planned', 'blocked']).default('planned'),
    B.string('note').optional(),
    B.string('catalyst').optional(),
  ],
  render: ({ action, window, confidence, status, note, catalyst }) => {
    const tone = getTone(status);
    return (
      <span
        className="showcase-bridge showcase-bridge--trade"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 560,
          margin: '0.5rem 0 0.9rem',
          padding: '1rem',
          borderRadius: '1rem',
          border: `1px solid ${tone.border}`,
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'grid', gap: '0.15rem' }}>
              <strong style={{ fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{action ?? 'Trade setup'}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{note ?? 'Decision-ready trade setup'}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', borderRadius: '999px', border: `1px solid ${tone.border}`, background: tone.bg, color: tone.fg, padding: '0.28rem 0.68rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {status ?? 'planned'}
            </span>
          </span>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {window && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.22rem 0.58rem' }}>Window: {window}</span>}
            {confidence && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.22rem 0.58rem' }}>Confidence: {confidence}</span>}
            {catalyst && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface2)', borderRadius: '999px', padding: '0.22rem 0.58rem' }}>Catalyst: {catalyst}</span>}
          </span>
        </span>
      </span>
    );
  },
});

export const candlesBridge = defineBridge({
  marker: 'candles',
  fields: [
    B.string('symbol'),
    B.string('thesis').optional(),
    B.list('levels', B.string()).optional().describe('Label Price (e.g. Support 950)'),
    B.list('candles', B.string()).describe('date:open:high:low:close:volume'),
  ],
  render: ({ symbol, thesis, levels, candles }) => {
    const candleData = (candles || [])
      .map((item) => {
        const [time, open, high, low, close, volume] = item.split(':').map((part) => part.trim());
        return {
          time,
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: volume ? Number(volume) : undefined,
        };
      })
      .filter((item) => item.time && [item.open, item.high, item.low, item.close].every((value) => !Number.isNaN(value)));
 
    return (
      <MarketChartCard
        data={{
          symbol,
          thesis,
          levels,
          candles: candleData,
        }}
      />
    );
  },
});

export const servicemapBridge = defineBridge({
  marker: 'servicemap',
  fields: [
    B.string('title').optional(),
    B.string('note').optional(),
    B.list('nodes', B.string()).describe('id,label,x,y,status,meta'),
    B.list('edges', B.string()).describe('source>target>label'),
  ],
  render: ({ title, note, nodes, edges }) => {
    const flowNodes = (nodes || []).map((item, index) => {
      const [id, label, x, y, status, meta] = item.split(',').map((part) => part.trim());
      return {
        id: id || `node-${index}`,
        label: label || id || `Node ${index + 1}`,
        x: Number(x ?? 0),
        y: Number(y ?? 0),
        status,
        meta,
      };
    }).filter((item) => !Number.isNaN(item.x) && !Number.isNaN(item.y));
 
    const flowEdges = (edges || []).map((item, index) => {
      const [source, target, label] = item.split('>').map((part) => part.trim());
      return {
        id: `edge-${index}-${source}-${target}`,
        source,
        target,
        label,
      };
    }).filter((edge) => edge.source && edge.target);
 
    return <FlowCard title={title} note={note} nodes={flowNodes} edges={flowEdges} />;
  },
});
 
export const pipelineflowBridge = defineBridge({
  marker: 'pipelineflow',
  fields: [
    B.string('title').optional(),
    B.string('note').optional(),
    B.list('stages', B.string()).describe('label,amount,count,status'),
  ],
  render: ({ title, note, stages }) => {
    const stageData = (stages || []).map((item, index) => {
      const [label, amount, count, status] = item.split(',').map((part) => part.trim());
      return {
        id: `stage-${index}`,
        label: label || `Stage ${index + 1}`,
        amount: amount || '—',
        count: count || '—',
        status,
      };
    });
 
    const nodes = stageData.map((stage, index) => ({
      id: stage.id,
      label: stage.label,
      x: index * 220,
      y: 88,
      status: stage.status,
      meta: `${stage.amount} • ${stage.count}`,
    }));
 
    const edges = stageData.slice(0, -1).map((stage, index) => ({
      id: `pipeline-edge-${index}`,
      source: stage.id,
      target: stageData[index + 1]!.id,
      label: index < stageData.length - 1 ? `${Math.max(0, 100 - (index * 14))}%` : undefined,
    }));
 
    return <FlowCard title={title} note={note} nodes={nodes} edges={edges} />;
  },
});

export const gaugeBridge = defineBridge({
  marker: 'gauge',
  fields: [
    B.string('label'),
    B.number('value'),
    B.number('max').default(100),
    B.string('unit').optional(),
    B.number('warn').default(75),
    B.number('crit').default(60),
  ],
  render: ({ label, value, max, unit, warn, crit }) => {
    const numValue = Number(value ?? 0);
    const numMax = Number(max ?? 100);
    const numWarn = Number(warn ?? 75);
    const numCrit = Number(crit ?? 60);
    
    const safeValue = Number.isNaN(numValue) ? 0 : numValue;
    const safeMax = Number.isNaN(numMax) || numMax === 0 ? 100 : numMax;
    const pct = Math.min(99.99, Math.max(0, (safeValue / safeMax) * 100));

    const color = numValue < numCrit
      ? '#ef4444'
      : numValue < numWarn
        ? '#f59e0b'
        : '#22c55e';

    const cx = 70;
    const cy = 74;
    const r = 56;
    const startX = cx - r;
    const startY = cy;

    const theta = Math.PI - (pct / 100) * Math.PI;
    const endX = cx + r * Math.cos(theta);
    const endY = cy - r * Math.sin(theta);

    const trackPath = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${cx + r} ${startY}`;
    const valuePath = pct > 0 ? `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX.toFixed(2)} ${endY.toFixed(2)}` : null;

    return (
      <span
        className="showcase-bridge showcase-bridge--gauge"
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          verticalAlign: 'middle',
          margin: '0.25rem 0.4rem',
          gap: '0.1rem',
        }}
      >
        <svg width={140} height={80} viewBox="0 0 140 80" style={{ overflow: 'visible' }}>
          <path d={trackPath} fill="none" stroke="var(--border)" strokeWidth="9" strokeLinecap="round" />
          {valuePath && (
            <path d={valuePath} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" />
          )}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)" fontFamily="inherit">
            {safeValue}{unit ?? ''}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="inherit">
            {label ?? 'Metric'}
          </text>
          <text x={startX + 2} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="inherit">
            0
          </text>
          <text x={cx + r - 2} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="inherit">
            {safeMax}
          </text>
        </svg>
      </span>
    );
  },
});

export const fileheatBridge = defineBridge({
  marker: 'fileheat',
  fields: [
    B.string('title').optional(),
    B.list('files', B.string()).describe('Format: path:intensity:type'),
  ],
  render: ({ title, files: filesList }) => {
    // Handle both new comma-split list and legacy pipe-split strings
    const rawItems = (filesList || []);
    const items = rawItems.flatMap(item => {
      if (typeof item === 'string' && item.includes('|')) return item.split('|');
      return [item];
    });
 
    const files = items.map(item => {
      const parts = String(item).trim().split(':');
      return { 
        path: parts[0]?.trim() ?? '', 
        intensity: Number(parts[1] ?? 50), 
        type: (parts[2]?.trim() ?? 'modified') as 'added' | 'modified' | 'deleted' 
      };
    }).filter(f => f.path);
 
    if (!files.length) return null;

    const maxIntensity = Math.max(...files.map(f => f.intensity), 1);

    function barColor(type: string, intensity: number) {
      if (type === 'added') return '#22c55e';
      if (type === 'deleted') return '#ef4444';
      if (intensity > 66) return '#f59e0b';
      if (intensity > 33) return '#60a5fa';
      return '#94a3b8';
    }

    return (
      <span
        className="showcase-bridge showcase-bridge--fileheat"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 620,
          margin: '0.55rem 0 1rem',
          padding: '1rem',
          borderRadius: '1rem',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <span style={{ display: 'grid', gap: '0.75rem' }}>
          {title && (
            <strong style={{ fontSize: '0.9rem', letterSpacing: '-0.03em', color: 'var(--text)' }}>{title}</strong>
          )}
          <span style={{ display: 'grid', gap: '0.45rem' }}>
            {files.map((file) => {
              const barPct = (file.intensity / maxIntensity) * 100;
              const color = barColor(file.type, file.intensity);
              const filename = file.path.split('/').pop() ?? file.path;
              const dir = file.path.includes('/') ? file.path.slice(0, file.path.lastIndexOf('/') + 1) : '';

              return (
                <span key={file.path} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'grid', gap: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      {dir && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{dir}</span>}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{filename}</span>
                    </span>
                    <span style={{ height: 6, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                      <span
                        style={{
                          display: 'block',
                          height: '100%',
                          width: `${barPct}%`,
                          background: color,
                          borderRadius: 999,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', minWidth: 24, textAlign: 'right' }}>
                      {file.intensity}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: color,
                        background: `color-mix(in srgb, ${color} 16%, var(--surface))`,
                        border: `1px solid color-mix(in srgb, ${color} 28%, var(--border))`,
                        borderRadius: '999px',
                        padding: '0.1em 0.45em',
                        minWidth: 52,
                        textAlign: 'center',
                      }}
                    >
                      {file.type}
                    </span>
                  </span>
                </span>
              );
            })}
          </span>
        </span>
      </span>
    );
  },
});

export const BRIDGES = [
  kpiBridge,
  sparklineBridge,
  timelineBridge,
  paymentBridge,
  releaseBridge,
  agentBridge,
  signalBridge,
  commandBridge,
  tickerBridge,
  positionBridge,
  tradeBridge,
  candlesBridge,
  servicemapBridge,
  pipelineflowBridge,
  gaugeBridge,
  fileheatBridge,
];
