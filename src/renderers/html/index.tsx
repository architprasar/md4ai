import React from 'react';
import type { IRNode, RenderContentOptions } from '../../types.js';
import { THEME_KEYS } from '../../types.js';
import { RenderContext, useRenderCtx } from './context.js';
import { ErrorBoundary } from './components/ErrorBoundary.js';
import { Inline } from './components/Inline.js';
import { Callout } from './components/Callout.js';
import { Chart } from './components/Chart.js';
import { Video } from './components/Video.js';
import { Button } from './components/Button.js';
import { InputBlock } from './components/InputBlock.js';
import { KPI } from './components/KPI.js';
import { Card } from './components/Card.js';
import { Layout } from './components/Layout.js';
import { Steps } from './components/Steps.js';
import { Table } from './components/Table.js';

function themeToStyle(theme: RenderContentOptions['theme']): React.CSSProperties {
  if (!theme) return {};
  return Object.fromEntries(
    Object.entries(theme)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [THEME_KEYS[k as keyof typeof THEME_KEYS] ?? `--${k}`, v])
  ) as React.CSSProperties;
}

export function RenderNodes({ nodes }: { nodes: IRNode[] }) {
  return (
    <>
      {nodes.map((n, i) => (
        <ErrorBoundary key={i}>
          <RenderNode node={n} />
        </ErrorBoundary>
      ))}
    </>
  );
}

export function RenderNode({ node }: { node: IRNode }) {
  const { components: C, highlight } = useRenderCtx();

  switch (node.type) {
    case 'paragraph': {
      // A paragraph containing only a single bridge node renders as a block without
      // a <p> wrapper — bridges are block-level UI, not phrasing content.
      if (node.children.length === 1 && node.children[0].type === 'bridge') {
        return <Inline nodes={node.children} />;
      }
      const rendered = <Inline nodes={node.children} />;
      if (C.paragraph) return C.paragraph({ children: rendered });
      return <p className="md4ai-p">{rendered}</p>;
    }

    case 'heading': {
      const rendered = <Inline nodes={node.children} />;
      if (C.heading) return C.heading({ level: node.level, children: rendered });
      const Tag = `h${node.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag className={`md4ai-h md4ai-h${node.level}`}>{rendered}</Tag>;
    }

    case 'code': {
      if (C.code) return C.code({ lang: node.lang, value: node.value });
      const highlighted = highlight ? highlight(node.value, node.lang) : null;
      return (
        <pre className="md4ai-pre">
          {highlighted
            ? <code
                className={node.lang ? `language-${node.lang}` : undefined}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            : <code className={node.lang ? `language-${node.lang}` : undefined}>
                {node.value}
              </code>
          }
        </pre>
      );
    }

    case 'blockquote': {
      const kids = node.children.map((n, i) => <RenderNode key={i} node={n} />);
      if (C.blockquote) return C.blockquote({ children: kids });
      return <blockquote className="md4ai-blockquote">{kids}</blockquote>;
    }

    case 'list': {
      const renderedItems = node.items.map(item =>
        item.map((n, i) => <RenderNode key={i} node={n} />)
      );
      if (C.list) return C.list({ ordered: node.ordered, items: renderedItems });
      const isTask = !!node.checkedItems;
      const Tag = node.ordered ? 'ol' : 'ul';
      const listClass = isTask
        ? 'md4ai-list md4ai-list--task'
        : `md4ai-list md4ai-list--${node.ordered ? 'ordered' : 'unordered'}`;
      return (
        <Tag className={listClass}>
          {renderedItems.map((item, i) => {
            const checked = node.checkedItems?.[i];
            return (
              <li key={i} className={`md4ai-list__item${isTask ? ' md4ai-list__item--task' : ''}`}>
                {isTask && (
                  <input
                    type="checkbox"
                    className="md4ai-list__checkbox"
                    checked={!!checked}
                    readOnly
                    aria-label={checked ? 'Completed' : 'Not completed'}
                  />
                )}
                {item}
              </li>
            );
          })}
        </Tag>
      );
    }

    case 'table': {
      if (C.table) return C.table({ head: node.head, rows: node.rows });
      return <Table head={node.head} rows={node.rows} />;
    }

    case 'thematicBreak':
      if (C.thematicBreak) return C.thematicBreak();
      return <hr className="md4ai-hr" />;

    case 'callout': {
      const kids = node.children.map((n, i) => <RenderNode key={i} node={n} />);
      if (C.callout) return C.callout({ variant: node.variant, children: kids });
      return <Callout variant={node.variant} renderedChildren={kids} />;
    }

    case 'chart': {
      if (C.chart) return C.chart({ chartType: node.chartType, data: node.data });
      return <Chart chartType={node.chartType} data={node.data} />;
    }

    case 'video': {
      if (C.video) return C.video({ src: node.src });
      return <Video src={node.src} />;
    }

    case 'button': {
      if (C.button) return C.button({ label: node.label, href: node.href, variant: node.variant });
      return <Button label={node.label} href={node.href} variant={node.variant} />;
    }

    case 'input': {
      if (C.input) return C.input({ inputType: node.inputType, props: node.props });
      return <InputBlock inputType={node.inputType} props={node.props} />;
    }

    case 'kpi': {
      if (C.kpi) return C.kpi({ label: node.label, value: node.value, change: node.change, period: node.period });
      return <KPI label={node.label} value={node.value} change={node.change} period={node.period} />;
    }

    case 'card': {
      const kids = node.children.map((n, i) => <RenderNode key={i} node={n} />);
      if (C.card) return C.card({ title: node.title, children: kids });
      return <Card title={node.title} renderedChildren={kids} />;
    }

    case 'layout': {
      const cols = node.children.map(col => col.map((n, i) => <RenderNode key={i} node={n} />));
      if (C.layout) return C.layout({ columns: node.columns, children: cols });
      return <Layout columns={node.columns} renderedChildren={cols} />;
    }

    case 'steps': {
      if (C.steps) return C.steps({ items: node.items, presentation: node.presentation });
      return <Steps items={node.items} presentation={node.presentation} />;
    }

    default:
      return null;
  }
}

export function renderContent(nodes: IRNode[], options: RenderContentOptions = {}): React.ReactElement {
  const bridgeCtx = {
    query: (key: string, params?: unknown) => options.store?.[key]?.(params),
    emit: (event: string, data?: unknown) => options.onEvent?.(event, data),
  };

  const ctx = {
    className: options.className,
    theme: options.theme,
    components: options.components ?? {},
    highlight: options.highlight,
    bridges: options.bridges ?? [],
    bridgeCtx,
  };

  const style = themeToStyle(options.theme);
  const cls = ['md4ai-root', options.className].filter(Boolean).join(' ');

  return (
    <RenderContext.Provider value={ctx}>
      <div className={cls} style={Object.keys(style).length ? style : undefined}>
        <RenderNodes nodes={nodes} />
      </div>
    </RenderContext.Provider>
  );
}
