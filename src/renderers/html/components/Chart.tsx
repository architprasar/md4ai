import { useEffect, useRef, useMemo } from 'react';

interface ChartData {
  chartType: string;
  labels?: string[];
  data?: number[];
  datasets?: Array<{ label?: string; data: number[]; backgroundColor?: string | string[] }>;
  [key: string]: unknown;
}

interface ChartInstance {
  data: { labels: unknown[]; datasets: unknown[] };
  update(mode?: string): void;
  destroy(): void;
}

interface Props {
  chartType: string;
  data: unknown;
}

export function Chart({ chartType, data }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);
  // Keep latest data accessible inside effects without triggering recreation
  const dataRef = useRef<ChartData | null>(null);

  const d = data as ChartData | null;
  dataRef.current = d;

  // Stable serialized key — changes only when chart content actually changes
  const dataKey = useMemo(
    () => (d ? JSON.stringify({ labels: d.labels, datasets: d.datasets ?? d.data }) : null),
    [data], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Effect 1: create (or recreate on type change) ─────────────────────────
  // Runs when chartType changes OR when data first becomes available (null → valid).
  // Does NOT depend on data object reference so it never re-runs mid-stream.
  useEffect(() => {
    if (!dataKey) return; // no valid data yet — stay as skeleton
    let destroyed = false;

    async function create() {
      // @ts-ignore — chart.js is an optional peer dependency
      const { Chart: ChartJS, registerables } = await import('chart.js');
      ChartJS.register(...registerables);

      if (destroyed || !canvasRef.current) return;

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const current = dataRef.current;
      if (!current) return;

      const style = getComputedStyle(canvasRef.current);
      const textColor = style.getPropertyValue('--text').trim() || '#212529';
      const mutedColor = style.getPropertyValue('--text-muted').trim() || '#6c757d';
      const borderColor = style.getPropertyValue('--border').trim() || '#e9ecef';
      const accentColor = style.getPropertyValue('--accent').trim() || '#2563eb';
      const surfaceColor = style.getPropertyValue('--surface').trim() || '#ffffff';
      const datasets = (current.datasets ?? [{ label: 'Value', data: current.data ?? [] }]).map((dataset) => {
        if (dataset.backgroundColor) return dataset;
        return {
          ...dataset,
          backgroundColor: accentColor,
          borderColor: accentColor,
          pointBackgroundColor: accentColor,
          pointBorderColor: surfaceColor,
          pointHoverBackgroundColor: accentColor,
          pointHoverBorderColor: surfaceColor,
          borderWidth: chartType === 'line' ? 2 : 1,
          tension: chartType === 'line' ? 0.35 : undefined,
          fill: false,
        };
      });

      chartRef.current = new ChartJS(canvasRef.current, {
        type: chartType as 'bar' | 'line' | 'pie' | 'doughnut',
        data: { labels: current.labels ?? [], datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: textColor,
          plugins: {
            legend: { labels: { color: textColor } },
            tooltip: {
              backgroundColor: surfaceColor,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor,
              borderWidth: 1,
              displayColors: true,
            },
          },
          scales: {
            x: { ticks: { color: mutedColor }, grid: { color: borderColor }, border: { color: borderColor } },
            y: { ticks: { color: mutedColor }, grid: { color: borderColor }, border: { color: borderColor } },
          },
        },
      }) as unknown as ChartInstance;
    }

    create().catch(console.error);

    return () => {
      destroyed = true;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [chartType, dataKey !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: update data in-place (no animation) ─────────────────────────
  // Runs whenever actual chart content changes, but never destroys the chart.
  useEffect(() => {
    if (!chartRef.current || !d) return;
    const style = canvasRef.current ? getComputedStyle(canvasRef.current) : null;
    const accentColor = style?.getPropertyValue('--accent').trim() || '#2563eb';
    const surfaceColor = style?.getPropertyValue('--surface').trim() || '#ffffff';
    const datasets = (d.datasets ?? [{ label: 'Value', data: d.data ?? [] }]).map((dataset) => {
      if (dataset.backgroundColor) return dataset;
      return {
        ...dataset,
        backgroundColor: accentColor,
        borderColor: accentColor,
        pointBackgroundColor: accentColor,
        pointBorderColor: surfaceColor,
        pointHoverBackgroundColor: accentColor,
        pointHoverBorderColor: surfaceColor,
        borderWidth: chartType === 'line' ? 2 : 1,
        tension: chartType === 'line' ? 0.35 : undefined,
        fill: false,
      };
    });
    chartRef.current.data = { labels: d.labels ?? [], datasets };
    chartRef.current.update('none');
  }, [chartType, dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) {
    return (
      <div className="md4ai-chart md4ai-chart--pending" style={{ position: 'relative', height: '280px' }} />
    );
  }

  return (
    <div className="md4ai-chart" style={{ position: 'relative', height: '280px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
