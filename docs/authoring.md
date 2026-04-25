# Bridge Authoring Guide

Bridges are the heart of `md4ai`. They allow you to map custom inline syntax like `@marker[...]` to rich React components. 

---

## The dType Schema API

Instead of plain objects, md4ai uses a fluent **dType** API to define bridge fields. This gives you:
1. **Recursive Parsing**: Lists can contain typed items (e.g., `B.list('scores', B.number())`).
2. **Smart Delimiters**: Lists automatically switch to `|` separators if the items contain commas.
3. **Key Sanitization**: Named fields support quoted or spaced keys for maximum robustness.
4. **AI Guidance**: Descriptions and constraints are automatically baked into the system prompt.

### Basic Example

```tsx
import { defineBridge, B } from '@architprasar/md4ai/core';

export const kpiBridge = defineBridge({
  marker: 'kpi',
  fields: [
    B.string('label').describe('Metric name'),
    B.string('value').describe('Current value'),
    B.enum('trend', ['up', 'down', 'neutral']).default('neutral'),
  ],
  render: ({ label, value, trend }) => (
    <div className={`kpi kpi--${trend}`}>
      <h4>{label}</h4>
      <p>{value}</p>
    </div>
  )
});
```

---

## Hybrid Syntax Rules

Every bridge supports three ways of being invoked by the AI:

1. **Positional**: `@kpi["Revenue", "$167k", up]`
2. **Keyed**: `@kpi[label: "Revenue", value: "$167k", trend: up]`
3. **Hybrid**: `@kpi["Revenue", "$167k", trend: up]`

### The List Container (`|...|`)
If a field is a list (`B.list()`), use `|...|` to wrap it.

- **Simple List**: `@tags[|React, Vue, Angular|]` (uses `,` as separator)
- **Complex List**: `@nodes[|id,Name,0,10|id2,Other,20,50|]` (uses `|` as separator because items contain commas)

### Open Chars Resilience
The parser is "Lenient by Design." It treats characters like `:` and `/` as part of the value unless they are at the top-level of a named field. This allows paths like `src/auth.ts:98` to work natively as "open chars" without mandatory quoting.

---

## Core dTypes

| Type | Description | Recursive? |
|---|---|---|
| `B.string(name)` | A plain string. | Yes (cleaned) |
| `B.number(name)` | Numeric value. | Yes (casted) |
| `B.boolean(name)` | `true`/`false` or `yes`/`no`. | Yes (casted) |
| `B.enum(name, options)` | Restricts AI values. | Yes |
| `B.list(name, type)` | Smart-delimiter list. | **Recursive** |
| `B.keyvalue(name)` | Dictionary / Map. | **Recursive** |

### Field Attributes
Every field supports chainable metadata:
- `.describe(text)`: Base AI instruction.
- `.default(val)`: Fallback value.
- `.optional()`: Marks field as not required.
- `.examples([val1, val2])`: Injects concrete examples into the prompt.
- `.importance('high')`: Flags critical fields to the AI.

---

## Prompt Architecture

md4ai uses a **Two-Tier** prompting system to keep token counts low.

### 1. The Protocol (Tier 1)
Teaches the AI the universal bridge syntax once. Use `getBridgeProtocolPrompt()`.
> Use `@marker[pos0, pos1, key: value, |list|]`. Brackets `[...]` are mandatory. Use `|...|` for lists. No bridges in code blocks.

### 2. The Catalog (Tier 2)
A compressed manifest of your registered bridges. Use `getPrompt({ bridges, mode: 'minimal' })`.
> - kpi: [label, value, trend: up|down|neutral]
> - servicemap: [title, nodes: |node|, edges: |edge|]

To generate these prompts:
```ts
import { getBridgeProtocolPrompt, getPrompt } from '@architprasar/md4ai/core';

// 1. Get the universal protocol rules
const protocol = getBridgeProtocolPrompt();

// 2. Get the component manifest (Catalog)
const catalog = getPrompt({ bridges, mode: 'minimal' });
```
