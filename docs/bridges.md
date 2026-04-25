# Bridge Reference

Bridges are inline components written directly in markdown. The AI emits a compact `@marker[...]` token; md4ai renders it as a rich UI card.

### Hybrid Syntax
Every bridge supports positional arguments (defined by their schema order) and named arguments for optional overrides.

```markdown
@kpi["Revenue", "$167k", change: +18%, period: QoQ]
```

---

## General purpose

### `@kpi` — Metric card

```markdown
@kpi["Revenue", "$167k", change: +18%, period: QoQ]
@kpi["Net Retention", "108%", change: "+4 pts"]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `label` | `string` | Metric name |
| 1 | `value` | `string` | Current value |
| - | `change` | `string` | Delta: `+18%`, `-7%` |
| - | `period` | `string` | Context: `QoQ`, `YoY` |

---

### `@sparkline` — Inline trend line

```markdown
Checkout p95: @sparkline[|38, 41, 45, 49, 58, 62, 71|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `items` | `list` | Numbers to plot |

---

### `@timeline` — Step timeline

```markdown
@timeline[|Discovery: done, Design: done, Build: active, Launch: planned|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `steps` | `keyvalue` | `Step: status` pairs |

---

### `@release` — Release badge

```markdown
@release["zod v3.22", beta, eta: "rc.2", owner: Archit]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `name` | `string` | Package name |
| 1 | `status` | `enum` | `live` `beta` `planned` `blocked` |
| - | `eta` | `string` | Expected release |
| - | `owner` | `string` | Responsible team |

---

### `@gauge` — Arc gauge

```markdown
@gauge["Checkout", 61, max: 100, unit: %]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `label` | `string` | Metric name |
| 1 | `value` | `number` | Current value |
| 2 | `max` | `number` | Scale maximum (default 100) |
| - | `unit` | `string` | Suffix (`%`, `ms`) |

---

### `@signal` — Risk / decision signal

```markdown
@signal["SQL injection", critical, score: 9.4, note: "Parameterized query required."]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `title` | `string` | Finding title |
| 1 | `tone` | `enum` | `critical` `warning` `positive` |
| 2 | `score` | `number` | Risk 0–10 |
| - | `trend` | `string` | `new` `resolved` `recurring` |

---

### `@fileheat` — File heatmap

```markdown
@fileheat["47 files", |src/auth.ts:98:modified, src/utils.ts:42:added|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `title` | `string` | Label |
| 1 | `files` | `list` | Entries: `path:intensity:type` |

---

### `@payment` — Upgrade card

```markdown
@payment["$79", "Pro Plan", desc: "Automatic merge blocking"]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `amount` | `string` | Price |
| 1 | `plan` | `string` | Plan name |
| - | `desc` | `string` | Description |

---

## AI agent surfaces

### `@agent` — Agent run card

```markdown
@agent["CodeSentinel", "Security Reviewer", done, tools: |AST, Semgrep|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `name` | `string` | Display name |
| 1 | `role` | `string` | Purpose |
| 2 | `status` | `enum` | `done` `active` `planned` `blocked` |

---

### `@command` — Control-room

```markdown
@command["Ops Console", Live, channels: |PagerDuty, Slack|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `title` | `string` | Surface name |
| 1 | `stage` | `string` | Current stage label |
| - | `channels` | `list` | Notification channels |

---

## Trading / market data

### `@ticker` — Market ticker

```markdown
@ticker["NVDA", "$984.22", move: "+3.8%", volume: 42.1M]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `symbol` | `string` | Ticker symbol |
| 1 | `price` | `string` | Last price |

---

### `@position` — Portfolio position

```markdown
@position["NVDA", long, entry: "$902", size: "7.5%"]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `symbol` | `string` | Ticker symbol |
| 1 | `side` | `enum` | `long` `short` |

---

### `@trade` — Trade decision

```markdown
@trade["Buy on pullback", window: "2 sessions", status: active]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `action` | `string` | Decision |
| 1 | `status` | `enum` | `done` `active` `planned` `blocked` |

---

### `@candles` — Candlestick chart

```markdown
@candles["NVDA", thesis: "Support at $952", levels: |Support 952, Pivot 968|, candles: |2026-04-21:910:956:905:948:36|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `symbol` | `string` | Ticker symbol |
| - | `candles` | `list` | Entries: `date:open:high:low:close:volume` |

---

## Architecture / infra

### `@servicemap` — Dependency graph

```markdown
@servicemap["Checkout v3", nodes: |api,API,0,80,active| , edges: |api>validator>validate|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `title` | `string` | Graph title |
| - | `nodes` | `list` | `id,label,x,y,status,meta` |
| - | `edges` | `list` | `source>target>label` |

---

### `@pipelineflow` — Revenue board

```markdown
@pipelineflow["Q2 Pipeline", stages: |Sourced,$2.8M,182,done|]
```

| Pos | Field | Type | Description |
|---|---|---|---|
| 0 | `title` | `string` | Board title |
| - | `stages` | `list` | `label,amount,count,status` |
