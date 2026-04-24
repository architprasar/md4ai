# md4ai

**Rich markdown for AI.** Drop md4ai into your AI chat UI and responses automatically render as charts, callouts, cards, KPI metrics, timelines, and more — no prompt engineering, no JSON, just markdown.

```
npm install md4ai
```

> **Peer deps:** `react >=18`, `react-dom >=18`  
> **Optional:** `chart.js >=4` — only needed if you use chart fences

---

## The problem

AI models output markdown natively. But standard markdown renderers give you headings and bullet points. Your users get a wall of text when the AI could be showing them a bar chart, a KPI card, a status timeline.

The usual fix is prompt engineering — coerce the AI into outputting JSON, parse it, render it. It breaks constantly. The AI forgets the schema, nests things wrong, adds a sentence before the JSON block.

md4ai takes a different approach: **extend markdown itself.** The AI writes markdown. md4ai renders it as rich UI. No JSON. No custom formats. No prompt gymnastics.

---

## Quickstart

```tsx
import { parse, renderContent } from 'md4ai';

function AIMessage({ content }: { content: string }) {
  return renderContent(parse(content));
}
```

For streaming responses — call on the full accumulated text every chunk:

```tsx
import { parseStreaming, renderContent } from 'md4ai';

function StreamingMessage({ text }: { text: string }) {
  // Safe mid-stream — unclosed fences render as placeholders, never throw
  return renderContent(parseStreaming(text));
}
```

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
import { defineBridge } from 'md4ai';

const statusBridge = defineBridge({
  marker: 'status',
  pattern: 'scalar',                 // matches @status[value]
  render: (value) => (
    <span className={`badge badge--${value}`}>{value}</span>
  ),
});
```

### Register it

Pass the same `bridges` array to both `parse` and `renderContent`:

```tsx
const bridges = [statusBridge];

const nodes = parse(markdown, { bridges });
const ui = renderContent(nodes, { bridges });
```

### System prompt hint

Each bridge auto-generates a hint for the AI:

```ts
statusBridge.prompt
// → 'Use @status[value] inline. Example: @status[success]'

// Auto-build your full system prompt:
const systemPrompt = bridges.map(b => b.prompt).join('\n');
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

---

## Themes

Four built-in themes, each with light and dark variants. All use the same CSS variable system as shadcn — plug straight into your existing shadcn app.

```tsx
import { renderContent, themes } from 'md4ai';
import type { ThemeName } from 'md4ai';

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
import type { ComponentOverrides } from 'md4ai';

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

All overridable keys: `paragraph` `heading` `code` `blockquote` `list` `table` `thematicBreak` `callout` `chart` `video` `button` `input` `card` `layout`

---

## API reference

### `parse(markdown, options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `gfm` | `boolean` | `true` | GFM — tables, task lists, strikethrough |
| `bridges` | `BridgeDefinition[]` | `[]` | Registers `@marker` tokens for the parser |

Returns `IRNode[]` — plain serializable JSON, framework-agnostic.

### `parseStreaming(markdown, options?)`

Same signature as `parse`. Lenient about unclosed blocks at the end of the string — safe to call on every streaming chunk. Partial fences render as animated skeleton placeholders.

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

### `defineBridge(options)`

| Option | Type | Description |
|--------|------|-------------|
| `marker` | `string` | The `@marker` name — lowercase, letters and hyphens only |
| `pattern` | `'scalar' \| 'array' \| 'keyvalue' \| 'range' \| (raw) => T` | How to parse the `[data]` content |
| `render` | `(data: T, ctx: BridgeRenderCtx) => ReactElement \| null` | Renders the component |
| `prompt` | `string` | Overrides the auto-generated AI system prompt hint |

### `themes`

```ts
import { themes } from 'md4ai';
// themes.zinc.light | themes.zinc.dark
// themes.violet.light | themes.violet.dark
// themes.rose.light | themes.rose.dark
// themes.blue.light | themes.blue.dark
```

---

## License

MIT
