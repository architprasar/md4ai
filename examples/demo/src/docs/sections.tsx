import React from 'react';
import { Callout, Code, H2, H3, IC, InteractiveDemo, P, PromptBuilderDemo, PromptRecipeCards, Table, type DocsTheme } from './ui.js';
import { getPrompt } from '@architprasar/md4ai/core';
import { BRIDGES } from '../bridges.js';

export const DOCS_NAV: { label: string; id: string; children?: { label: string; id: string }[] }[] = [
  { label: 'Getting Started', id: 'getting-started' },
  { label: 'Quickstart', id: 'quickstart' },
  { label: 'Interactive Demos', id: 'interactive-demos' },
  {
    label: 'Prompting', id: 'prompting',
    children: [
      { label: 'getPrompt', id: 'get-prompt' },
      { label: 'Bridge Prompts', id: 'bridge-prompt' },
    ],
  },
  {
    label: 'Syntax', id: 'syntax',
    children: [
      { label: 'Callouts', id: 'callouts' },
      { label: 'Charts', id: 'charts' },
      { label: 'Steps', id: 'steps' },
      { label: 'KPI Metrics', id: 'kpi-metrics' },
      { label: 'Cards', id: 'cards' },
      { label: 'Layout', id: 'layout' },
      { label: 'Buttons', id: 'buttons' },
      { label: 'Inputs', id: 'inputs' },
      { label: 'Video', id: 'video' },
      { label: 'Task Lists', id: 'task-lists' },
      { label: 'Tables', id: 'tables' },
    ],
  },
  {
    label: 'Bridge System', id: 'bridges',
    children: [
      { label: 'Live Bridge Demo', id: 'bridge-demo' },
      { label: 'Define', id: 'bridge-define' },
      { label: 'Fields', id: 'bridge-fields' },
      { label: 'Patterns', id: 'bridge-patterns' },
      { label: 'Register', id: 'bridge-register' },
      { label: 'Host Data', id: 'bridge-host' },
    ],
  },
  { label: 'Themes', id: 'themes' },
  { label: 'Highlighting', id: 'highlighting' },
  { label: 'Overrides', id: 'overrides' },
  { label: 'Streaming', id: 'streaming' },
  { label: 'API Reference', id: 'api' },
  { label: 'Why not MDX?', id: 'vs-mdx' },
];

const LIVE_DEMOS = {
  callouts: `> [!NOTE]
> East region leads this month with the strongest expansion pipeline.

> [!TIP]
> Reuse the same structure for recommendations and next steps.

> [!WARNING]
> Mobile parity slipped because API work landed later than planned.`,
  charts: `\`\`\`chart
{
  "type": "bar",
  "labels": ["North", "South", "East", "West"],
  "datasets": [
    {
      "label": "Pipeline coverage",
      "data": [124, 91, 147, 109],
      "backgroundColor": ["#7c3aed", "#7c3aed", "#7c3aed", "#7c3aed"]
    }
  ]
}
\`\`\``,
  steps: `\`\`\`steps
- [done] Confirm the roadmap theme set
- [active] Ship the AI workspace beta
  Design partner rollout starts this week.
- [planned] Publish the mobile recovery plan
- [planned] Finalize the launch narrative
\`\`\`

\`\`\`timeline
Discovery | done
Implementation | active | Core renderer work is already in review
QA | planned
Launch | planned
\`\`\``,
  kpis: `@kpi["Quarterly Revenue", "$2.48M", change: "+14%", period: "QoQ"]
@kpi["Net Retention", "112%", change: "+3 pts", period: "YoY"]
@kpi["Launch Confidence", "78%", change: "-4 pts", period: "30 days"]`,
  cards: `@card["Immediate action"]
Prioritize the mobile parity recovery plan before adding new roadmap scope.
@card["Leadership note"]
Reporting foundations are the dependency for three separate launches.`,
  layout: `\`\`\`layout columns=2
### Strengths
- AI workspace demand is strong
- Reporting APIs are unblocking multiple teams

---

### Risks
- Mobile parity is slipping
- Export job reliability still needs follow-up
\`\`\``,
  buttons: `@button["Export roadmap brief", href: "#", variant: "primary"]
@button["Open delivery review", href: "#", variant: "secondary"]
@button["Download CSV", href: "#", variant: "default"]

@input["Follow-up", type: "text", placeholder: "Ask for a deeper breakdown..."]`,
  video: `\`\`\`video
https://www.youtube.com/watch?v=dQw4w9WgXcQ
\`\`\``,
  tasks: `- [x] Lock roadmap themes
- [x] Confirm design partner cohort
- [ ] Publish mobile recovery milestones
- [ ] Review launch confidence with engineering leads`,
  tables: `| Theme | Owner | Confidence | Status |
| --- | --- | --- | --- |
| AI Workspace | Product + AI | 82% | On track |
| Reporting Foundations | Platform | 76% | Active |
| Mobile Parity | Mobile | 61% | At risk |
| Total | Product Org | 78% | Stable |`,
  bridge: `The next release is @release["Agent Inbox", beta, eta: "July 2026", owner: "Core UX"].
 
If launch confidence drops, mark it as @release["Mobile parity", blocked, eta: TBD, owner: Mobile].`,
};

const ROADMAP_DEMO = `## Product Review

@kpi["Launch confidence", "78%", change: "-4 pts", period: "This month"]
@kpi["Critical risks", "3", change: "+1", period: "Current"]

\`\`\`steps
- [done] Lock roadmap themes
- [active] Ship AI workspace beta
  Design partner rollout starts this week.
- [planned] Publish mobile recovery plan
\`\`\`

| Theme | Owner | Status |
| --- | --- | --- |
| AI Workspace | Product + AI | On track |
| Mobile Parity | Mobile | At risk |
| Admin Controls | Platform | Healthy |`;

export function DocsHeroSection() {
  return (
    <>
      <section className="playground-intro" style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '1rem' }}>
        <div className="playground-intro__copy">
          <span className="playground-intro__eyebrow">Docs</span>
          <h1>Build rich AI response UIs without forcing models to emit JSON.</h1>
          <p>Use the parser from <IC>@architprasar/md4ai/core</IC>, render with <IC>@architprasar/md4ai/react</IC>, and keep your app in plain markdown all the way through streaming.</p>
          <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <a href="./showcase.html" className="btn-icon btn-icon--active" style={{ textDecoration: 'none' }}>Open live demo</a>
            <a href="./index.html" className="btn-icon" style={{ textDecoration: 'none' }}>Open playground</a>
            <a href="https://github.com/architprasar/md4ai" className="btn-icon" style={{ textDecoration: 'none' }}>GitHub</a>
          </div>
          <Code>{`import { parse, parseStreaming, defineBridge, B } from '@architprasar/md4ai/core';
import { renderContent, themes } from '@architprasar/md4ai/react';`}</Code>
        </div>
        <div className="playground-intro__meta">
          {[
            ['Runtime-first', 'Stream markdown directly from your model without converting everything into JSON first.'],
            ['Composable UI', 'Mix plain markdown with KPIs, charts, steps, tables, cards, and your own bridge components.'],
            ['Production-ready', 'Graceful fallback behavior keeps partial or malformed content from breaking the message UI.'],
          ].map(([title, copy]) => (
            <div key={title} className="playground-stat">
              <strong>{title}</strong>
              <span>{copy}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sample-rail" style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '1rem' }}>
        {[
          ['Start here', 'Read the quickstart and then edit the live examples below.'],
          ['Best for', 'Chat UIs, dashboards, agent tools, reports, and internal ops surfaces.'],
          ['Core split', '`@architprasar/md4ai/core` parses and `@architprasar/md4ai/react` renders with shared bridges.'],
        ].map(([title, copy]) => (
          <div key={title} className="sample-chip" style={{ minWidth: 0, flex: 1, cursor: 'default' }}>
            <span className="sample-chip__label">{title}</span>
            <span className="sample-chip__description">{copy}</span>
          </div>
        ))}
      </section>
    </>
  );
}

export function GettingStartedSection({ docsTheme }: { docsTheme: DocsTheme }) {
  return (
    <>
      <H2 id="getting-started">Getting Started</H2>
      <P>md4ai extends markdown syntax so AI responses automatically render as rich UI components — charts, callouts, KPI cards, payment forms, and more. No prompt engineering, no JSON schemas. The AI writes markdown; md4ai renders it.</P>
      <P>Standard markdown always works as expected. Extensions are additive and degrade to readable plain text without a renderer.</P>
      <Code>{`npm install @architprasar/md4ai
# peer deps
npm install react react-dom
# optional — only needed for chart fences
npm install chart.js`}</Code>

      <H2 id="quickstart">Quickstart</H2>
      <Code>{`import { parse, defineBridge, B } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

function AIMessage({ content }: { content: string }) {
  return renderContent(parse(content));
}`}</Code>
      <P>For streaming responses, call <IC>parseStreaming</IC> on the full accumulated text every chunk. Unclosed fences render as animated skeletons — never throw.</P>
      <Code>{`import { parseStreaming } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

function StreamingMessage({ text }: { text: string }) {
  return renderContent(parseStreaming(text));
}`}</Code>
      <Callout type="tip">
        Both <IC>parse</IC> and <IC>parseStreaming</IC> return the same <IC>IRNode[]</IC> type and accept the same options. The only difference is leniency with unclosed blocks.
      </Callout>
      <Table
        head={['Start here', 'Why it matters']}
        rows={[
          ['<a href="./showcase.html">Showcase demo</a>', 'See a finished AI response rendered with charts, tables, KPIs, and timelines'],
          ['<a href="./index.html">Playground</a>', 'Paste your own markdown or switch between realistic presets'],
          ['<code>@architprasar/md4ai/core</code>', 'Parser, streaming, bridges, and IR types without renderer coupling'],
          ['<code>@architprasar/md4ai/react</code>', 'Renderer, themes, and component override surface for React apps'],
        ]}
      />
      <H2 id="interactive-demos">Interactive Demos</H2>
      <P>These blocks are editable. Change the markdown on the left and watch the preview update on the right using the same parser and renderer you would use in an app.</P>
      <InteractiveDemo
        title="Roadmap and reporting primitives"
        description="Try KPI blocks, steps, and tables together in a realistic product-review message."
        initial={ROADMAP_DEMO}
        theme={docsTheme}
      />
    </>
  );
}

export function SyntaxSection({ docsTheme }: { docsTheme: DocsTheme }) {
  return (
    <>
      <H2 id="syntax">Syntax Reference</H2>
      <P>All standard markdown is supported — headings, bold, italic, links, images, blockquotes, tables, code blocks, horizontal rules, and GFM task lists. The following extensions are added on top.</P>

      <H3 id="callouts">Callouts</H3>
      <P>GitHub-style alert syntax — the AI already knows this from its training data on GitHub READMEs.</P>
      <Code>{`> [!NOTE]
> East region leads with $167k, up 18% QoQ.

> [!TIP]
> APAC shows the strongest growth trajectory.

> [!WARNING]
> South region is down 7%. Churn is accelerating.

> [!DANGER]
> Pipeline coverage for Q2 is critically thin.

> [!INFO]
> This variant is identical to NOTE in style.`}</Code>
      <Table head={['Variant', 'Color', 'Use for']} rows={[
        ['<code>NOTE</code>', 'Blue', 'Neutral information, context'],
        ['<code>INFO</code>', 'Blue', 'Identical to NOTE'],
        ['<code>TIP</code>', 'Green', 'Recommendations, best practices'],
        ['<code>WARNING</code>', 'Amber', 'Caution, watch out'],
        ['<code>DANGER</code>', 'Red', 'Critical issues, blockers'],
      ]} />
      <InteractiveDemo title="Live callout demo" description="Edit GitHub-style alert markdown and watch md4ai render the richer callout UI." initial={LIVE_DEMOS.callouts} theme={docsTheme} minHeight={210} />

      <H3 id="charts">Charts</H3>
      <P>Fenced code block with <IC>chart</IC> lang. Uses Chart.js under the hood — install it separately. During streaming, an animated shimmer skeleton placeholder renders until the JSON is complete.</P>
      <Code>{LIVE_DEMOS.charts}</Code>
      <P>Supported types: <IC>bar</IC> <IC>line</IC> <IC>pie</IC> <IC>doughnut</IC> <IC>radar</IC></P>
      <Callout type="note">chart.js must be installed separately: <IC>npm install chart.js</IC>. If it is missing, chart fences render as a skeleton placeholder.</Callout>
      <InteractiveDemo title="Live chart demo" description="Paste different datasets or switch the chart type to see how the fence renders." initial={LIVE_DEMOS.charts} theme={docsTheme} minHeight={260} />

      <H3 id="steps">Steps and Timelines</H3>
      <P>Use <IC>steps</IC> or <IC>timeline</IC> fences for AI-generated workflows, plans, and progress reports.</P>
      <Code>{LIVE_DEMOS.steps}</Code>
      <P>Accepted forms include <IC>[done] Title</IC>, <IC>Title [done]</IC>, <IC>done: Title</IC>, <IC>Title: planned</IC>, and <IC>Title | active | detail</IC>.</P>
      <InteractiveDemo title="Live steps and timeline demo" description="Try the forgiving status formats and see how partial plans still render cleanly." initial={LIVE_DEMOS.steps} theme={docsTheme} minHeight={280} />

      <H3 id="kpi-metrics">KPI Metrics</H3>
      <P>Use <IC>@kpi</IC> for a first-class metric card.</P>
      <Code>{LIVE_DEMOS.kpis}</Code>
      <InteractiveDemo title="Live KPI demo" description="Tune labels, values, deltas, and periods to see how the metric cards adapt." initial={LIVE_DEMOS.kpis} theme={docsTheme} minHeight={220} />

      <H3 id="cards">Cards</H3>
      <Code>{LIVE_DEMOS.cards}</Code>
      <InteractiveDemo title="Live card demo" description="Good for action summaries, highlights, and concise AI-generated recommendations." initial={LIVE_DEMOS.cards} theme={docsTheme} minHeight={220} />

      <H3 id="layout">Multi-column Layout</H3>
      <P>Sections are separated by <IC>---</IC> within the fence. Defaults to 2 columns.</P>
      <Code>{LIVE_DEMOS.layout}</Code>
      <InteractiveDemo title="Live layout demo" description="Turn one markdown block into a balanced multi-column summary section." initial={LIVE_DEMOS.layout} theme={docsTheme} minHeight={250} />

      <H3 id="buttons">Buttons</H3>
      <Code>{`@button["Export Report", href: "#", variant: "primary"]
@button["Build Forecast", href: "/forecast", variant: "secondary"]
@button["Download CSV", href: "/export", variant: "default"]`}</Code>
      <Table head={['Variant', 'Style']} rows={[
        ['<code>primary</code>', 'Accent fill'],
        ['<code>secondary</code>', 'Surface with border'],
        ['<code>default</code>', 'Surface2 with border'],
      ]} />
      <InteractiveDemo title="Live buttons and input demo" description="Test action bars and lightweight form prompts inside the same markdown response." initial={LIVE_DEMOS.buttons} theme={docsTheme} minHeight={230} />

      <H3 id="inputs">Inputs</H3>
      <Code>{`@input["Follow-up", type: "text", placeholder: "Ask a follow-up..."]
@input["Work email", type: "email", placeholder: "you@company.com"]`}</Code>

      <H3 id="video">Video Embeds</H3>
      <P>YouTube and Vimeo URLs become responsive 16:9 iframes. Any other URL renders a native <IC>{`<video>`}</IC> element.</P>
      <Code>{LIVE_DEMOS.video}</Code>
      <InteractiveDemo title="Live video demo" description="Swap in a YouTube, Vimeo, or direct video URL to see the renderer choose the right player." initial={LIVE_DEMOS.video} theme={docsTheme} minHeight={180} />

      <H3 id="task-lists">Task Lists</H3>
      <P>Standard GFM syntax — rendered with visual checkboxes.</P>
      <Code>{LIVE_DEMOS.tasks}</Code>
      <InteractiveDemo title="Live task list demo" description="Useful for operational checklists, launch criteria, and agent follow-up work." initial={LIVE_DEMOS.tasks} theme={docsTheme} minHeight={190} />

      <H3 id="tables">Tables</H3>
      <P>Standard GFM tables are supported directly. The built-in renderer improves them for report-style content.</P>
      <Code>{LIVE_DEMOS.tables}</Code>
      <Table head={['Built-in behavior', 'What it helps with']} rows={[
        ['Numeric alignment', 'Revenue, deltas, rates, and percentages scan faster'],
        ['Compact spacing', 'Wide analytics tables stay readable without custom styling'],
        ['Summary row emphasis', 'Totals and averages stand out in model-generated reports'],
        ['Status and delta highlighting', 'Positive/negative movement is easier to spot at a glance'],
        ['Horizontal overflow handling', 'Tables remain usable on smaller screens'],
      ]} />
      <InteractiveDemo title="Live table demo" description="Edit analytics-style tables and watch numeric alignment and summary-row emphasis kick in." initial={LIVE_DEMOS.tables} theme={docsTheme} minHeight={220} />
    </>
  );
}

export function BridgesSection({ docsTheme }: { docsTheme: DocsTheme }) {
  return (
    <>
      <H2 id="bridges">Bridge System</H2>
      <P>Bridges let anyone map a custom <IC>@marker[data]</IC> inline syntax to any React component.</P>
      <Callout type="tip">
        <IC>@</IC> only fires as a bridge marker when followed by <IC>word[</IC>. Bare mentions like <IC>@john</IC> and emails like <IC>user@company.com</IC> are never matched.
      </Callout>
 
      <H3 id="bridge-demo">Live bridge demo</H3>
      <P>The docs demo includes a custom bridge called <IC>release</IC>.</P>
      <Table head={['Piece', 'Example']} rows={[
        ['Marker syntax', '<code>@release["Agent Inbox", beta, eta: "July 2026", owner: "Core UX"]</code>'],
        ['Schema', '<code>[B.string("name"), B.enum("status", [...]), ...]</code>'],
        ['Best use', 'Roadmap chips, launch badges, release summaries, ownership metadata'],
      ]} />
      <Code>{`import { defineBridge, B } from '@architprasar/md4ai/core';
 
const releaseBridge = defineBridge({
  marker: 'release',
  fields: [
    B.string('name').describe('Feature name'),
    B.enum('status', ['live', 'beta', 'planned', 'blocked']).default('planned'),
    B.string('eta').optional(),
    B.string('owner').optional(),
  ],
  render: ({ name, status, eta, owner }) => (
    <ReleaseBadge name={name} status={status} eta={eta} owner={owner} />
  ),
});`}</Code>
      <InteractiveDemo title="Live bridge demo" description="This docs page ships a demo-only @release[...] bridge so you can edit the marker syntax and preview the custom component immediately." initial={LIVE_DEMOS.bridge} theme={docsTheme} minHeight={220} />
 
      <H3 id="bridge-define">Define a bridge</H3>
      <P>Use <IC>defineBridge</IC> to create a new component. Use <IC>fields</IC> to declare your schema with the <IC>B</IC> factory.</P>
      <Code>{`import { defineBridge, B } from '@architprasar/md4ai/core';
  
const statusBridge = defineBridge({
  marker: 'status',
  fields: [
    B.string('value').describe('Current state'),
  ],
  render: ({ value }) => (
    <span className={\`badge badge--\${value}\`}>{value}</span>
  ),
});`}</Code>
  
      <H3 id="bridge-fields">Positional Mapping</H3>
      <P>The order of fields in the array defines the positional arguments. AI can use shorthand or named keys.</P>
      <Code>{`// Define: [B.string('label'), B.string('value')]
// AI uses: @kpi["Revenue", "$167k"]
// Or: @kpi[label: "Revenue", value: "$167k"]`}</Code>
 
      <H3 id="bridge-patterns">Recursive Field Parsing</H3>
      <P>dTypes recursively parse their contents. A <IC>B.list</IC> of <IC>B.number</IC> will correctly cast every item.</P>
      <Code>{`@sparkline[|38, 41, 45, 49|]`}</Code>

      <H3 id="bridge-patterns-2">Smart Delimiters</H3>
      <P>Lists within <IC>|...|</IC> automatically detect the best delimiter. Use <IC>|</IC> as a separator if items contain commas.</P>
      <Code>{`@servicemap[nodes: |node1,Label,0,0|node2,Other,10,10|]`}</Code>
 
      <H3 id="bridge-register">Register with parse and renderContent</H3>
      <P>Pass the same <IC>bridges</IC> array to both.</P>
      <Code>{`import { parse } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';
 
const bridges = [statusBridge, kpiBridge, timelineBridge];
const nodes = parse(markdown, { bridges });
const ui = renderContent(nodes, { bridges });`}</Code>
 
      <H3 id="bridge-prompt">AI system prompt hints</H3>
      <P>md4ai uses a two-tier prompting system (**Protocol & Catalog**) to save tokens.</P>
      <Code>{`import { getBridgeProtocolPrompt, getPrompt } from '@architprasar/md4ai/core';
 
// Tier 1: The universal bridge syntax rules
const protocol = getBridgeProtocolPrompt();
 
// Tier 2: The manifest of markers and fields
const catalog = getPrompt({ bridges, mode: 'minimal' });`}</Code>
 
      <H3 id="bridge-host">Host data and events</H3>
      <P>Bridges can pull live data from your app and emit events back.</P>
      <Code>{`renderContent(nodes, {
  bridges,
  store: {
    stock: ({ symbol }) => myStore.getPrice(symbol),
    inventory: ({ sku }) => api.getStock(sku),
  },
  onEvent: (event, data) => {
    if (event === 'pay') stripe.redirectToCheckout(data);
  },
});`}</Code>
    </>
  );
}

export function PromptingSection() {
  const recipes = [
    {
      title: 'Reporting prompt',
      description: 'For KPI-heavy updates, analytics summaries, and business reviews.',
      prompt: getPrompt({
        mode: 'minimal',
        bridges: BRIDGES,
        prefix: 'Write a concise reporting update in markdown.',
        includeBuiltins: ['callouts', 'kpi', 'tables', 'steps', 'charts'],
        includeBridges: ['status', 'sparkline'],
      }),
    },
    {
      title: 'Roadmap prompt',
      description: 'For product planning, milestones, risks, and launch sequencing.',
      prompt: getPrompt({
        mode: 'standard',
        bridges: BRIDGES,
        prefix: 'Write a product roadmap update in markdown.',
        includeBuiltins: ['callouts', 'kpi', 'tables', 'steps', 'layout'],
        includeBridges: ['release', 'status'],
      }),
    },
    {
      title: 'Commerce prompt',
      description: 'For pricing flows, checkout messaging, and conversion-oriented responses.',
      prompt: getPrompt({
        mode: 'withExamples',
        bridges: BRIDGES,
        prefix: 'Write a commerce-friendly response in markdown.',
        includeBuiltins: ['buttons', 'cards', 'callouts', 'inputs'],
        includeBridges: ['payment', 'status'],
      }),
    },
    {
      title: 'Support/chat prompt',
      description: 'For support copilots, incident summaries, and guided follow-ups.',
      prompt: getPrompt({
        mode: 'standard',
        bridges: BRIDGES,
        prefix: 'Write a support response in markdown.',
        includeBuiltins: ['callouts', 'steps', 'buttons', 'inputs'],
        includeBridges: ['status'],
      }),
    },
  ];

  return (
    <>
      <H2 id="prompting">Prompting</H2>
      <P>md4ai includes a prompt-building layer so you can teach the model about built-in md4ai syntax and your custom bridges without hand-writing long system-prompt snippets.</P>
      <P>It also helps keep prompts smaller than schema-heavy UI instructions. In many real product flows, compact markdown directives are cheaper and easier for models than custom nested JSON output.</P>
      <PromptRecipeCards recipes={recipes} />

      <H3 id="get-prompt">getPrompt()</H3>
      <P>Use <IC>getPrompt()</IC> when you want a full md4ai-aware prompt. It can include the base instruction, selected built-in syntax guidance, selected bridge hints, and one of three reliability/token tradeoff modes.</P>
      <Code>{`import { getPrompt } from '@architprasar/md4ai/core';

const systemPrompt = getPrompt({
  mode: 'standard',
  bridges,
  prefix: 'Write markdown and use md4ai syntax when it helps:',
});

const productReviewPrompt = getPrompt({
  mode: 'minimal',
  bridges,
  includeBuiltins: ['callouts', 'kpi', 'tables', 'steps'],
  includeBridges: ['release', 'status'],
});`}</Code>
      <Table
        head={['Option', 'What it does']}
        rows={[
          ['<code>mode</code>', '<code>minimal</code>, <code>standard</code>, or <code>withExamples</code> depending on token budget and reliability needs'],
          ['<code>bridges</code>', 'Adds prompt hints from registered bridges'],
          ['<code>includeBuiltins</code>', 'Select only some built-in md4ai syntax topics'],
          ['<code>excludeBuiltins</code>', 'Remove some built-in topics from the generated prompt'],
          ['<code>includeBridges</code>', 'Select only some bridge prompts by marker'],
          ['<code>excludeBridges</code>', 'Exclude some bridge prompts by marker'],
          ['<code>includeBaseInstruction</code>', 'Toggle the general “write markdown by default” guidance'],
          ['<code>prefix</code>', 'Prepends your own intro line before generated guidance'],
        ]}
      />

      <Callout type="tip">
        Use <IC>minimal</IC> when token savings matter most, <IC>standard</IC> as the default production mode, and <IC>withExamples</IC> when you need the strongest syntax correctness for more complex UI output.
      </Callout>

      <PromptBuilderDemo />

      <H3 id="bridge-prompt">Bridge prompts</H3>
      <P>Every bridge still exposes its own <IC>prompt</IC>, and <IC>getBridgePrompt()</IC> remains available when you only want the bridge-specific portion without the built-in md4ai syntax guidance.</P>
      <Code>{`import { getBridgePrompt } from '@architprasar/md4ai/core';

statusBridge.prompt
// → 'Use @status[value] inline. Example: @status[success]'

const checkoutOnlyPrompt = getBridgePrompt(bridges, {
  include: ['payment', 'status'],
});`}</Code>
    </>
  );
}

export function ReferenceSections() {
  return (
    <>
      <H2 id="themes">Themes</H2>
      <P>Four built-in themes, each with light and dark variants. All use the same CSS variable names as shadcn.</P>
      <Code>{`import { renderContent, themes } from '@architprasar/md4ai/react';

renderContent(nodes, { theme: themes.violet.dark });`}</Code>
      <Table head={['Token', 'CSS variable', 'Description']} rows={[
        ['<code>accent</code>', '<code>--accent</code>', 'Primary action color'],
        ['<code>bg</code>', '<code>--bg</code>', 'Page background'],
        ['<code>surface</code>', '<code>--surface</code>', 'Card/component background'],
        ['<code>text</code>', '<code>--text</code>', 'Primary text'],
        ['<code>codeBg</code>', '<code>--code-bg</code>', 'Code block background'],
      ]} />

      <H2 id="highlighting">Syntax Highlighting</H2>
      <P>The library does not bundle a highlighter to stay lightweight.</P>
      <Code>{`import hljs from 'highlight.js/lib/core';
import ts from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('ts', ts);
hljs.registerLanguage('json', json);

renderContent(nodes, {
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlight(code, { language: 'ts' }).value;
  },
});`}</Code>

      <H2 id="overrides">Component Overrides</H2>
      <P>Replace any built-in renderer with your own component via the <IC>components</IC> option.</P>
      <Code>{`renderContent(nodes, {
  components: {
    chart: ({ chartType, data }) => <MyChart type={chartType} data={data} />,
    callout: ({ variant, children }) => <Alert variant={variant}>{children}</Alert>,
  },
});`}</Code>

      <H2 id="streaming">Streaming</H2>
      <P><IC>parseStreaming</IC> is a lenient wrapper around <IC>parse</IC>.</P>
      <Code>{`import { parseStreaming } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

let accumulated = ';
for await (const chunk of stream) {
  accumulated += chunk;
  const nodes = parseStreaming(accumulated, { bridges });
  setUI(renderContent(nodes, { bridges, theme }));
}`}</Code>
      <Table head={['Node', 'Mid-stream behavior']} rows={[
        ['Paragraph, heading, list', 'Renders as-is — partial text is fine'],
        ['<code>chart</code> fence', 'Animated shimmer skeleton until JSON is valid'],
        ['<code>steps</code>, <code>timeline</code> fence', 'Partial lines render immediately'],
        ['<code>@bridge[data]</code>', 'Renders when the closing <code>]</code> arrives'],
      ]} />

      <H2 id="api">API Reference</H2>
      <H3>parse(markdown, options?)</H3>
      <Table head={['Option', 'Type', 'Default', 'Description']} rows={[
        ['<code>gfm</code>', '<code>boolean</code>', '<code>true</code>', 'Enable GFM — tables, task lists, strikethrough'],
        ['<code>bridges</code>', '<code>BridgeDefinition[]</code>', '<code>[]</code>', 'Registers @marker tokens for the parser'],
      ]} />
      <P>Returns <IC>IRNode[]</IC> — plain serializable JSON, framework-agnostic intermediate representation.</P>
      <H3>parseStreaming(markdown, options?)</H3>
      <P>Same signature and return type as <IC>parse</IC>. Safe to call on every streaming chunk.</P>
      <H3>renderContent(nodes, options?)</H3>
      <Table head={['Option', 'Type', 'Description']} rows={[
        ['<code>theme</code>', '<code>ThemeTokens</code>', 'CSS variable overrides scoped to the root wrapper'],
        ['<code>highlight</code>', '<code>(code, lang) => string | null</code>', 'Syntax highlighter for code blocks'],
        ['<code>components</code>', '<code>ComponentOverrides</code>', 'Replace built-in node renderers'],
        ['<code>bridges</code>', '<code>BridgeDefinition[]</code>', 'Registered bridge renderers'],
      ]} />
      <H3>defineBridge(options)</H3>
      <Table head={['Option', 'Type', 'Description']} rows={[
        ['<code>marker</code>', '<code>string</code>', 'The @marker name — lowercase letters and hyphens'],
        ['<code>fields</code>', '<code>BridgeField[]</code>', 'Fluent array of dTypes (e.g. [B.string("id")])'],
        ['<code>render</code>', '<code>(data: T, ctx: BridgeRenderCtx) => ReactElement | null</code>', 'Renders the component'],
        ['<code>prompt</code>', '<code>string</code>', 'Overrides the auto-generated AI system prompt hint'],
        ['<code>onParseError</code>', '<code>(raw, error) => T</code>', 'Safe fallback when a custom parser throws'],
      ]} />

      <H2 id="vs-mdx">Why not MDX?</H2>
      <P>MDX is the right tool when humans author content at build time. md4ai is the right tool when AI generates content at runtime.</P>
      <Table head={['', 'MDX', '@architprasar/md4ai']} rows={[
        ['Requires build step', '✗ Yes', '✓ Pure runtime'],
        ['AI must write JSX', '✗ Yes — breaks constantly', '✓ Plain markdown'],
        ['Streaming support', '✗ No', '✓ Yes'],
        ['Custom components', 'Import in file', 'defineBridge + one prompt line'],
        ['Readable without renderer', '✗ No', '✓ Degrades to plain text'],
      ]} />
      <Callout type="warning">
        MDX requires the AI to write valid JSX — import statements, component names, prop syntax — and any mistake causes a parse error.
      </Callout>
    </>
  );
}
