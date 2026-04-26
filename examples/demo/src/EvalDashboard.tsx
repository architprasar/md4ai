import React, { useState, useEffect } from 'react';
import { parse } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

interface LatestRun {
  runId: string;
  timestamp: string;
  models: string[];
}

export function EvalDashboard() {
  const [latestRun, setLatestRun] = useState<LatestRun | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/test-results/latest-run.json');
        if (!res.ok) throw new Error('No evaluation runs found yet.');
        const info: LatestRun = await res.json();
        setLatestRun(info);

        const modelResults = await Promise.all(
          info.models.map(async (modelId) => {
            const slug = modelId.replace(/\//g, '--');
            const r = await fetch(`/test-results/${info.runId}/${slug}/raw.json`);
            if (!r.ok) return null;
            return r.json();
          })
        );
        setResults(modelResults.filter(Boolean));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !results.length) {
    return <div className="eval-status">Loading latest results...</div>;
  }

  if (error && !results.length) {
    return <div className="eval-status eval-status--error">
      <h3>No Live Data</h3>
      <p>{error}</p>
      <p className="hint">Run <code>npm run eval:quick</code> to generate results.</p>
    </div>;
  }

  return (
    <div className="eval-dashboard">
      <header className="eval-dashboard__header">
        <div className="eval-dashboard__title">
          <span className="badge">Live Evaluation</span>
          <h1>NVIDIA NIM Model Benchmarks</h1>
          <p>Run ID: <code>{latestRun?.runId}</code> • Updated: {latestRun ? new Date(latestRun.timestamp).toLocaleTimeString() : '-'}</p>
        </div>
      </header>

      <div className="eval-grid">
        {results.length === 0 ? (
          <div className="eval-status">Waiting for the first model to complete...</div>
        ) : (
          results.sort((a, b) => (b.aggregate?.avgOutputSavingPct ?? 0) - (a.aggregate?.avgOutputSavingPct ?? 0)).map((res) => (
            <ModelCard key={res.model.id} result={res} />
          ))
        )}
      </div>
    </div>
  );
}

function ModelCard({ result }: { result: any }) {
  const { model, aggregate } = result;

  // Build a summary string for md4ai to render
  const syntaxSaving = parseFloat(aggregate.avgOutputSavingPct || 0);
  
  const summaryMarkdown = `
@kpi["Syntax Efficiency", "${syntaxSaving > 0 ? '+' : ''}${syntaxSaving}%", change: "${syntaxSaving > 0 ? 'smaller' : 'larger'}", period: "payload vs JSON"]

\`\`\`chart
{
  "type": "bar",
  "labels": ["Syntax tokens", "JSON equivalent"],
  "datasets": [
    { "label": "Tokens", "data": [${aggregate.md4ai.bridgeOnly}, ${aggregate.json.output}] }
  ]
}
\`\`\`
`;

  const rendered = renderContent(parse(summaryMarkdown, { bridges: BRIDGES }), { bridges: BRIDGES });

  return (
    <div className="model-card">
      <div className="model-card__header">
        <h3>{model.id}</h3>
        <span className="model-size">{model.sizeB ? `${model.sizeB}B` : 'Cloud'}</span>
      </div>
      <div className="model-card__body">
        {rendered}
      </div>
    </div>
  );
}
