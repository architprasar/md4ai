# md4ai

**Rich markdown for AI.** Drop md4ai into your AI chat UI and responses automatically render as charts, callouts, cards, KPI metrics, timelines, and more — no prompt engineering, no JSON, just markdown.

```
npm install @architprasar/md4ai
```

> **Peer deps:** `react >=18`, `react-dom >=18`  
> **Optional:** `chart.js >=4` — only needed if you use chart fences

---

## The problem

AI models output markdown natively. But standard markdown renderers give you headings and bullet points. Your users get a wall of text when the AI could be showing them a bar chart, a KPI card, a status timeline.

The usual fix is prompt engineering — coerce the AI into outputting JSON, parse it, render it. It breaks constantly. The AI forgets the schema, nests things wrong, adds a sentence before the JSON block.

md4ai takes a different approach: **extend markdown itself.** The AI writes markdown. md4ai renders it as rich UI. No JSON. No custom formats. No prompt gymnastics.

Another practical advantage: this often saves tokens compared to custom JSON UI schemas. Markdown plus compact directives like `::kpi{...}` or `@release[...]` is usually smaller than nested `type/props/content` JSON, and it also reduces repair-cost tokens from malformed structured output.

## Bridge System (AI-Native Components)

Instead of complex JSON schemas, `md4ai` uses a **dType Schema API** to define component interfaces. 

- **Automatic Casting**: Converts raw strings to `number`, `boolean`, `Array`, or `Record`.
- **Hybrid Syntax**: AI can use positional arguments, named keys, or a mix of both.
- **Recursive Parsing**: Lists and Key-Values recursively parse their children.
- **Smart Delimiters**: Lists automatically detect the best separator (`|` or `,`).

### Example: Defining a Bridge

```tsx
import { defineBridge, B } from '@architprasar/md4ai/core';

const kpiBridge = defineBridge({
  marker: 'kpi',
  fields: [
    B.string('label').describe('The metric name'),
    B.string('value').describe('Current value'),
    B.number('change').optional(),
  ],
  render: ({ label, value, change }) => (
    <div className="kpi-card">
      <h4>{label}</h4>
      <strong>{value}</strong>
      {change && <span>{change > 0 ? '+' : ''}{change}%</span>}
    </div>
  )
});
```

### AI Output Examples

The model can emit any of these; the parser handles them all:

- **Positional**: `@kpi["Revenue", "$1.2M", 14]`
- **Named**: `@kpi[label: "Revenue", value: "$1.2M", change: 14]`
- **Hybrid**: `@kpi["Revenue", "$1.2M", change: 14]`
- **Complex Lists**: `@sparkline[|10, 20, 15, 30, 25|]`

## Two-Tier Prompting

Keep your system prompts small by separating the universal protocol from the component manifest.

```ts
import { getBridgeProtocolPrompt, getPrompt } from '@architprasar/md4ai/core';

// 1. The universal bridge syntax rules
const protocol = getBridgeProtocolPrompt();

// 2. The manifest of markers and fields (Catalog)
const catalog = getPrompt({ bridges, mode: 'minimal' });
```

---

## Quickstart

```tsx
import { parse } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

function AIMessage({ content }: { content: string }) {
  return renderContent(parse(content));
}
```

For streaming responses — call on the full accumulated text every chunk:

```tsx
import { parseStreaming } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

function StreamingMessage({ text }: { text: string }) {
  // Safe mid-stream — unclosed fences render as placeholders, never throw
  return renderContent(parseStreaming(text));
}
```

If you want a clearer package boundary, use subpath imports:

```tsx
import { parse, parseStreaming, defineBridge } from '@architprasar/md4ai/core';
import { renderContent, themes } from '@architprasar/md4ai/react';
```

`md4ai` still re-exports the full API for backwards compatibility, but `@architprasar/md4ai/core` and `@architprasar/md4ai/react` make the parser/renderer split explicit.

---

## Repository layout

- `src/` — parser, IR, themes, bridges, and React renderer
- `examples/demo/` — playground, docs page, and GitHub Pages demo
- `test/` — parser and streaming regression tests
- `docs/` — contributor-facing architecture notes

---

## Development

```bash
npm ci
npm --prefix examples/demo ci
npm run typecheck
npm test
npm run dev
```

- `npm run typecheck` validates the library source with TypeScript
- `npm test` rebuilds the package and runs the Node-based regression suite
- `npm run dev` starts the example app for manual QA
- `npm run build:demo` builds the Pages-ready demo bundle

Contributor workflow and review expectations live in [`CONTRIBUTING.md`](./CONTRIBUTING.md). A short system view of the parser and renderer pipeline lives in [`docs/architecture.md`](./docs/architecture.md). Production integration guidance for streaming, theming, bridges, and component overrides lives in [`docs/production.md`](./docs/production.md).

---

## Extended syntax

All standard markdown works exactly as expected. md4ai adds these on top — every extension is valid plain text if md4ai isn't present.

### Callouts

GitHub-style alerts — the AI already knows this syntax from its training data.

```markdown
> [!NOTE]
> East region leads with $167k, up 18% QoQ.

> [!TIP]
> APAC shows the strongest growth trajectory. Invest now.

> [!WARNING]
> South region is down 7%. Churn is accelerating.

> [!DANGER]
> Pipeline coverage for Q2 is critically thin.
```

Variants: `NOTE` `INFO` `TIP` `WARNING` `DANGER`

---

### Charts

Fenced code block with `chart` lang. Uses Chart.js under the hood — install it separately.

````markdown
```chart
{
  "type": "bar",
  "labels": ["North", "South", "East", "West", "APAC"],
  "datasets": [
    { "label": "Q1 Revenue ($k)", "data": [142, 98, 167, 121, 89] },
    { "label": "Q4 Revenue ($k)", "data": [128, 105, 141, 110, 74] }
  ]
}
```
````

Supported types: `bar` `line` `pie` `doughnut` `radar`

During streaming, an animated skeleton placeholder renders until the JSON is complete — no raw JSON flash.

---

### Steps and timelines

Use a fenced workflow block for AI-generated plans, checklists, and project updates. Both `steps` and `timeline` render the same first-class component.

````markdown
```steps
- [done] Gather requirements
  Confirm success criteria and edge cases
- [active] Build parser support
  Accept partial syntax during streaming
- [planned] Add docs and demo examples
```
````

Accepted formats are intentionally forgiving: `[done] Title`, `Title [done]`, `done: Title`, `Title: planned`, and `Title | active | extra detail` all work. Lines without a recognized status fall back to `planned`.

---

### KPI metrics

Use a leaf directive for a single headline metric. It stays readable in plain text and is easy for LLMs to emit consistently.

```markdown
::kpi{label="Revenue" value="$167k" change="+18%" period="QoQ"}
::kpi{label="Net Retention" value="108%" change="+4 pts" period="YoY"}
::kpi{label="South Region" value="$98k" change="-7%" period="QoQ"}
```

`label` and `value` are the core fields. `change` and `period` are optional.

---

### Cards

```markdown
:::card{title="Immediate action"}
Schedule a call with South region AEs. Pull exit survey data first.
:::
```

---

### Multi-column layout

````markdown
```layout columns=2
### What's Working
- Enterprise motion in East is repeatable
- APAC partner channel gaining traction

---

### What Needs Attention
- South SMB retention — churn is accelerating
- West pipeline coverage is thin
```
````

---

### Buttons

```markdown
::button[Export Report]{href="#" variant="primary"}
::button[Build Forecast]{href="#" variant="secondary"}
```

Variants: `primary` `secondary` `default`

> **Note:** remark-directive attribute syntax uses spaces between attributes, not commas.

---

### Inputs

```markdown
::input{type="text" placeholder="Ask a follow-up..." label="Follow-up"}
```

---

### Video embeds

````markdown
```video
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
````

YouTube and Vimeo URLs become responsive iframes. Any other URL renders as a native `<video>` element.

---

### Task lists

Standard GFM syntax — rendered with visual checkboxes.

```markdown
- [x] Pull Q1 revenue data from CRM
- [x] Identify top churned accounts
- [ ] Schedule South region review call
- [ ] Draft Q2 forecast model
```

---

### Inline bridges

md4ai ships 16 ready-made bridge markers for AI product surfaces. Use any of them by adding the corresponding bridge definition to your `BRIDGES` array. See [`docs/bridges.md`](./docs/bridges.md) for the full field reference.

**General purpose**

```markdown
@kpi["Revenue", "$167k", change: +18%, period: QoQ]
 
@sparkline[|38, 41, 45, 49, 58, 62, 71|]
 
@timeline[|Discovery: done, Design: done, Build: active, Launch: planned|]
 
@release["zod v3.22", status: beta, eta: "Pinned at rc.2", owner: Platform]
 
@gauge["Checkout Processor", 61, max: 100, unit: %, warn: 75, crit: 65]
 
@signal["SQL injection", tone: critical, score: 9.4, trend: new, note: "Parameterized query required."]
 
@fileheat["47 files", |src/checkout/processor.ts:98:modified, src/auth/session.ts:71:added|]
 
@payment["$79", "CodeSentinel Pro", desc: "Automatic merge blocking and auto-fix PRs."]
```

**AI agent surfaces**

```markdown
@agent[name: CodeSentinel, role: Security Reviewer, status: done, latency: 4.2s, tools: AST Analysis|Semgrep, goal: Block insecure merges]

@command[title: Ops Console, stage: Live, owner: AI Ops, channels: PagerDuty|Slack, note: All clear.]
```

**Trading / market data**

```markdown
@ticker[symbol: NVDA, price: $984.22, move: +3.8%, volume: 42.1M, range: 952-991]

@position[symbol: NVDA, side: long, entry: $902, target: $1025, stop: $864, size: 7.5%]

@trade[action: Buy on pullback, window: next 2 sessions, confidence: 78, status: active]

@candles[symbol: NVDA; thesis: Support holding at $952; candles: 2026-04-21:910:956:905:948:36|2026-04-22:948:972:941:966:41]
```

**Architecture / infra**

```markdown
@servicemap[title: Checkout graph; nodes: api,API Layer,0,80,active|validator,Validator,220,0,done; edges: api>validator>validate]

@pipelineflow[title: Q2 Pipeline; stages: Sourced,$2.8M,182,done|Qualified,$1.7M,96,active|Proposal,$740k,41,planned]
```

Bridge markers that use semicolons as field delimiters (`candles`, `servicemap`, `pipelineflow`) do so because their values contain commas internally. See [`docs/bridges.md`](./docs/bridges.md) for all fields and formats.

---

### Tables

Standard GFM tables work out of the box. The built-in HTML renderer adds analytics-friendly defaults without changing markdown syntax: mostly numeric columns are right-aligned, dense tables tighten spacing automatically, summary rows like `Total` and `Average` are emphasized, and simple status/delta values get clearer visual treatment.

```markdown
| Region | Revenue | Change | Status |
| --- | --- | --- | --- |
| East | $167k | +18% | On track |
| South | $98k | -7% | At risk |
| APAC | $89k | +20% | Healthy |
| Total | $354k | +11% | Stable |
```

This keeps AI-generated report tables readable on mobile and desktop, even when the model only emits plain markdown.

---

## Bridge system

Bridges let anyone map a custom `@marker[data]` inline syntax to any React component. The AI learns it from a single example in the system prompt. Publish bridges as `md4ai-bridge-*` npm packages to share with the ecosystem.

### Syntax

```
The build is @status[passing] with @num[142] tests.

Top markets this quarter: @tags[East, North, APAC]

@kpi[value: $167k, label: East Revenue, change: +18%, period: QoQ]

Project status: @timeline[Discovery: done, Design: done, Build: active, Launch: planned]
```

`@` only fires when followed by `word[` — bare mentions like `@john` and emails like `user@company.com` are never matched.

---

### Define a bridge
 
```tsx
import { defineBridge, B } from '@architprasar/md4ai/core';
 
// Use B.type() to define a fluent, positional-aware schema
const releaseBridge = defineBridge({
  marker: 'release',
  fields: [
    B.string('name').describe('Package name (e.g., zod)'),
    B.enum('status', ['live', 'beta', 'planned']).default('planned'),
  ],
  render: ({ name, status }) => (
    <ReleaseBadge name={name} status={status} />
  ),
});
```
 
`defineBridge()` now accepts an array of **dTypes**. The order in the array defines the positional arguments.
 
### Prompt generation
 
md4ai uses a two-tier prompting system (**Protocol & Catalog**) to save tokens.
- **Protocol**: One-time rules for universal bridge syntax (brackets, lists, spacing).
- **Catalog**: A compressed manifest of available markers and their fields.
 
Use `getBridgeProtocolPrompt()` to get the Tier 1 instructions, and the system handles the rest.

### Register it

Pass the same `bridges` array to both `parse` and `renderContent`:

```tsx
const bridges = [statusBridge];

const nodes = parse(markdown, { bridges });
const ui = renderContent(nodes, { bridges });
```

### System prompt hint

Use `getPrompt()` when you want a full md4ai-aware prompt that includes built-in syntax guidance plus optional bridge hints. Use `getBridgePrompt()` when you only want the bridge-specific portion:

```ts
import { getPrompt, getBridgePrompt } from '@architprasar/md4ai/core';

statusBridge.prompt
// → 'Use @status[value] inline. Example: @status[success]'

const systemPrompt = getPrompt({
  bridges,
  prefix: 'Write markdown and use md4ai syntax when it helps:',
});

const analyticsPrompt = getPrompt({
  bridges,
  includeBuiltins: ['callouts', 'charts', 'kpi', 'tables'],
  includeBridges: ['status'],
});

const bridgeOnlyPrompt = getBridgePrompt(bridges, {
  include: ['payment', 'status'],
});
```

`getPrompt()` supports three modes:

- `minimal` — smallest useful prompt, with strong fallback guidance and no long examples
- `standard` — recommended default for most production surfaces
- `withExamples` — higher-token mode with canonical examples for better syntax reliability

Example:

```ts
const minimalPrompt = getPrompt({
  mode: 'minimal',
  includeBuiltins: ['kpi', 'tables', 'steps'],
});

const standardPrompt = getPrompt({
  mode: 'standard',
  bridges,
  includeBuiltins: ['callouts', 'kpi', 'tables', 'steps'],
});

const examplePrompt = getPrompt({
  mode: 'withExamples',
  bridges,
  includeBuiltins: ['steps', 'kpi', 'buttons'],
  includeBridges: ['payment'],
});
```

---

### Built-in patterns

| Pattern | Markdown | Parsed as |
|---------|----------|-----------|
| `scalar` | `@badge[success]` | `"success"` |
| `array` | `@tags[React, Vue, Angular]` | `["React", "Vue", "Angular"]` |
| `keyvalue` | `@kpi[value: $167k, label: Revenue]` | `{ value: "$167k", label: "Revenue" }` |
| `range` | `@range[100 → 500]` | `{ min: "100", max: "500" }` |

For custom parsing, pass a function:

```ts
defineBridge({
  marker: 'progress',
  pattern: (raw) => {
    const [done, total] = raw.split('/').map(Number);
    return { done, total, pct: Math.round((done / total) * 100) };
  },
  render: ({ done, total, pct }) => (
    <div className="progress-bar">
      <div style={{ width: `${pct}%` }} />
      <span>{done}/{total}</span>
    </div>
  ),
});
```

If you want to reuse the built-in parsers directly in your own helpers, `parseBridgeData()` is exported:

```ts
import { parseBridgeData } from '@architprasar/md4ai/core';

const tags = parseBridgeData('array', 'React, Vue, Angular');
// → ['React', 'Vue', 'Angular']
```

For stricter custom parsing with a safe fallback:

```ts
const progressBridge = defineBridge({
  marker: 'progress',
  pattern: (raw) => {
    const [done, total] = raw.split('/').map(Number);
    if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) {
      throw new Error('Invalid progress payload');
    }
    return { done, total, pct: Math.round((done / total) * 100) };
  },
  onParseError: (raw) => ({ done: 0, total: 0, pct: 0, raw }),
  render: ({ pct }) => <span>{pct}%</span>,
});
```

---

### Host data and events

Bridges can pull live data from your app and emit events back — the AI writes identifiers, your app resolves them.

```tsx
renderContent(nodes, {
  bridges,

  store: {
    stock: ({ symbol }) => myStore.getPrice(symbol),
    inventory: ({ sku, warehouse }) => api.getStock(sku, warehouse),
  },

  onEvent: (event, data) => {
    if (event === 'buy') api.post('/orders', data);
  },
});
```

Inside the bridge:

```tsx
defineBridge({
  marker: 'stock',
  pattern: 'scalar',
  render: (symbol, { query, emit }) => {
    const price = query('stock', { symbol });
    return (
      <StockCard
        symbol={symbol as string}
        price={price as number}
        onBuy={() => emit('buy', { symbol })}
      />
    );
  },
});
```

The markdown never contains real prices. The AI writes `@stock[AAPL]` — your store resolves it at render time.

If a bridge renderer throws at render time, md4ai falls back to showing the original `@marker[data]` token instead of breaking the message tree.

---

## Themes

Four built-in themes, each with light and dark variants. All use the same CSS variable system as shadcn — plug straight into your existing shadcn app.

```tsx
import { renderContent, themes } from '@architprasar/md4ai/react';
import type { ThemeName } from '@architprasar/md4ai/react';

renderContent(nodes, {
  theme: themes.violet.dark,
});
```

Available themes: `zinc` `violet` `rose` `blue`

### Apply to the app shell too

Use `tokensToCSSVars` to apply the same tokens as CSS variables on your root element — both the shell and the renderer inherit the same theme with zero duplication:

```tsx
function tokensToCSSVars(tokens: Record<string, string | undefined>) {
  return {
    '--bg':           tokens.bg,
    '--surface':      tokens.surface,
    '--accent':       tokens.accent,
    '--text':         tokens.text,
    // ...
  } as React.CSSProperties;
}

const theme = themes[themeName][isDark ? 'dark' : 'light'];

<div style={tokensToCSSVars(theme)}>
  {renderContent(nodes, { theme })}
</div>
```

### Custom theme

Pass any subset — unset tokens fall back to the CSS variables already on the page:

```tsx
renderContent(nodes, {
  theme: {
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    codeBg: '#1e1e2e',
  },
});
```

---

## Syntax highlighting

The library doesn't bundle a highlighter — pass any highlighter via the `highlight` option:

```tsx
import hljs from 'highlight.js';

renderContent(nodes, {
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});
```

Works with highlight.js, Shiki, Prism, lowlight — anything that returns an HTML string.

---

## Custom component overrides

Replace any built-in renderer with your own component:

```tsx
import type { ComponentOverrides } from '@architprasar/md4ai/react';

renderContent(nodes, {
  components: {
    // Leaf nodes receive raw props
    chart: ({ chartType, data }) => <MyChart type={chartType} data={data} />,
    video: ({ src }) => <MyPlayer src={src} />,

    // Container nodes receive pre-rendered children
    callout: ({ variant, children }) => (
      <Alert variant={variant}>{children}</Alert>
    ),
    card: ({ title, children }) => (
      <Card><CardHeader>{title}</CardHeader><CardBody>{children}</CardBody></Card>
    ),
  },
});
```

All overridable keys: `paragraph` `heading` `code` `blockquote` `list` `table` `thematicBreak` `callout` `chart` `video` `button` `input` `card` `layout` `steps`

---

## API reference

### `parse(markdown, options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gfm` | `boolean` | `true` | GFM — tables, task lists, strikethrough |
| `bridges` | `BridgeDefinition[]` | `[]` | Registers `@marker` tokens for the parser |

Returns `IRNode[]` — plain serializable JSON, framework-agnostic.

### `parseStreaming(markdown, options?)`

Same signature as `parse`. Lenient about unclosed blocks at the end of the string — safe to call on every streaming chunk. Partial `steps` fences render immediately, with unfinished or unknown statuses falling back to `planned`.

See [`docs/production.md`](./docs/production.md) for integration guidance around streaming updates and fallback expectations.

### `renderContent(nodes, options?)`

| Option | Type | Description |
|--------|------|-------------|
| `theme` | `ThemeTokens` | CSS variable overrides scoped to the root wrapper |
| `highlight` | `(code, lang) => string \| null` | Syntax highlighter for code blocks |
| `components` | `ComponentOverrides` | Replace built-in renderers |
| `bridges` | `BridgeDefinition[]` | Registered bridge renderers |
| `store` | `Record<string, (params?) => unknown>` | Data resolvers for bridge `query()` |
| `onEvent` | `(event, data?) => void` | Handler for bridge `emit()` |
| `className` | `string` | Extra class on the root wrapper |

See [`docs/production.md`](./docs/production.md) for production patterns using `theme`, `components`, `store`, and `onEvent` together.

### `defineBridge(options)`

| Option | Type | Description |
|--------|------|-------------|
| `marker` | `string` | The `@marker` name — lowercase, letters and hyphens only |
| `fields` | `BridgeField[]` | Fluent array of dTypes (e.g. `[B.string('id'), B.number('val')]`) |
| `render` | `(data: T, ctx: BridgeRenderCtx) => ReactElement \| null` | Renders the component |
| `prompt` | `string` | Overrides the auto-generated AI system prompt hint |
| `onParseError` | `(raw, error) => T` | Safe fallback when a custom parser throws |

### `themes`

```ts
import { themes } from '@architprasar/md4ai/react';
// themes.zinc.light | themes.zinc.dark
// themes.violet.light | themes.violet.dark
// themes.rose.light | themes.rose.dark
// themes.blue.light | themes.blue.dark
```

---

## License

MIT
