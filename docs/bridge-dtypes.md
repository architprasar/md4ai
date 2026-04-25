# Bridge Data Types (dTypes)

dTypes are structured schema definitions for Bridge fields. Instead of plain-text descriptions, dTypes provide the parser with validation rules, casting logic, and precise AI prompting instructions.

---

## The Vision: Hybrid Syntax

dTypes enable a hybrid positional/keyed syntax for bridges:

```
@marker[pos0, pos1, key: value, |list, item|]
```

- **Positional**: Maps to fields based on their index in the `fields` array.
- **Named**: Maps to fields by key (e.g., `key: value`).
- **Lists**: Uses the `|...|` container to allow nested commas. **Mandatory for multi-item lists** to prevent comma-clashing with top-level bridge fields. (e.g., `@marker[|a, b|, c]` is 2 fields; `@marker[a, b, c]` is 3 fields).

---

## Core dType Classes

Each dType is a class or factory that produces a schema object.

### `B.string()`
A plain string field.
- **`.max(n)`**: Injects "Max N characters" into the AI prompt.
- **`.match(regex)`**: Runtime validation.
- **`.prompt(hint)`**: Custom instruction for the AI (e.g., "Be enthusiastic").

### `B.number()`
Casts the raw string to a JavaScript number.
- **`.min(n) / .max(n)`**: Constrains the AI and validates the output.
- **`.int()`**: Forces integer parsing.

### `B.enum(values: string[])`
The most powerful tool for AI reliability.
- **Prompt**: Injects "Must be one of: [values]" into the system prompt.
- **Validation**: Reverts to default if the AI hallucinates a non-existent status.

### `B.list(itemType)`
Handles the `|...|` list syntax.
- **`.separator(char)`**: Defaults to `,`.
- **Parsing**: Automatically splits and casts items based on `itemType`.

### `B.keyvalue()`
Handles nested key-value pairs (dictionaries).
- **Format**: `|key: value, key: value|`
- **Parsing**: Casts to a JavaScript `Record<string, string>`.
- **Prompt**: Injects "Format: |key:value, key:value|" instructions.

### `B.boolean()`
Handles `true`/`false`, `yes`/`no`, or `1`/`0`.

---

## Schema Attributes

Every dType supports these chainable methods:

| Method | Description |
|---|---|
| `.describe(text)` | The base description for the AI. |
| `.default(val)` | Fallback if the field is missing or invalid. |
| `.optional()` | Marks the field as not required. |
| `.examples(list)` | Provides concrete examples for the AI prompt. |
| `.format(template)` | Injects "Format: [template]" instructions. |
| `.tone(type)` | Guidance: `concise` (under 5 words), `technical`, etc. |
| `.importance(lvl)` | `high` (prefixed with REQUIRED) or `low`. |
| `.prompt(text)` | Overrides all auto-generated instructions for this field. |

---

## Token Optimization (Prompt Shrinkage)

To keep context windows clean, `getPrompt()` follows a hierarchy of brevity:

1. **Self-Explanatory**: If a field is named `title`, `count`, `src`, or `href`, and has no `.describe()`, the prompt only includes the name.
2. **Implicit Types**: `B.number()` adds `(num)`, `B.boolean()` adds `(bool)`.
3. **Explicit Override**: `.prompt()` suppresses all other metadata for that field to allow hand-tuned, ultra-short instructions.

---

## Example: Advanced Bridge Definition

```tsx
import { defineBridge, B } from '@architprasar/md4ai/core';

const kpiBridge = defineBridge({
  marker: 'kpi',
  fields: [
    B.string('label').describe('Metric name'),
    B.string('value').describe('Metric value'),
    B.enum('trend', ['up', 'down', 'neutral']).default('neutral'),
    B.list('tags', B.string()).optional(),
    B.keyvalue('meta').optional()
  ],
  render: ({ label, value, trend, tags, meta }) => {
    // fields are still accessible via an object in render
  }
});
```

### Supported Syntax based on this schema:
- **Positional**: `@kpi["Revenue", "$167k"]`
- **Mixed**: `@kpi["Revenue", "$167k", trend: up]`
- **Full Hybrid**: `@kpi["Revenue", "$167k", |SaaS, Q1|, trend: up]`

---

## AI Prompt Architecture: Protocol & Catalog

To minimize token usage, md4ai uses a two-tier prompting strategy:

### Tier 1: The Bridge Protocol (Universal Rules)
This is a one-time instruction that teaches the AI the universal syntax for all bridges. Use `getBridgeProtocolPrompt()`.

> ### Universal Bridge Syntax (@marker)
> Use @marker[data] to insert rich components. Brackets `[...]` are ALWAYS mandatory.
> 1. **Fields**: You can use positional arguments, named keys, or a mix of both.
>    - Positional: @marker["Value 1", "Value 2"]
>    - Named: @marker[key1: "Value 1", key2: "Value 2"]
>    - Hybrid: @marker["Value 1", key2: "Value 2"]
> 2. **Lists**: Wrap multi-item lists in pipes to avoid comma clashing: @marker[|a, b, c|].
> 3. **Smart Delimiters**: Inside |...|, use `|` as a separator if items contain commas (e.g., @marker[|id,label|id2,label|]).
> 4. **Spacing**: Ensure a space precedes the `@` symbol if it is mid-sentence.
> 5. **No-Code**: NEVER emit bridges inside markdown code blocks or backticks.

### Tier 2: The Component Catalog (Component-specific)
A compressed manifest of available markers and their expected fields. Use `getPrompt({ mode: 'minimal' })`.

```
- kpi: [label, value, change?, period?]
- release: [name, status: live|beta|planned|blocked, owner?]
- servicemap: [title, nodes: |node|, edges: |edge|]
```

---

## Updated Prompt Generation Logic

The `dType` system enables a "Compressed" mode for `getPrompt()`:

1. **Protocol Block**: Explains the positional/keyed/list hybrid syntax.
2. **Catalog Block**: A single line for each bridge: `marker: [positional_fields, optional_fields?, typed_fields: enum|values]`.

This reduces the prompt cost of a bridge from ~60 tokens to **~12 tokens**.

---

## Positional Mapping Rules

1.  **Lexer**: Split the `@marker[...]` payload by `,` while respecting `|...|` and `"..."`.
2.  **Assignment**:
    - If an item matches `key: value`, assign to the field with that name.
    - Otherwise, assign to the next available field in the `fields` array that hasn't been filled yet.
    - If a field in the array is marked `.optional()` and a positional argument doesn't match its type, it can be skipped (future-proofing).

---

## Parser Reliability & Performance

The `Hybrid Lexer` is designed for high-performance production environments.

### 1. Performance: O(n) Linear Scan
The lexer uses a single-pass state machine (Iterative Scanning). It does not use expensive backtracking regex or recursive descent. It can process large bridge payloads (e.g. 10kb of data) in sub-millisecond time.

### 2. Safety: Zero-Throw Guarantee
The parser is "Lenient by Design." It will never throw an exception, regardless of how malformed the AI output is.
- **Unclosed Pipes**: If `@marker[|a, b]` is encountered, the parser treats everything after `|` as the first item of the list.
- **Unclosed Quotes**: Same as pipes; the quote remains open until the end of the string.
- **Missing Keys**: `@marker[key:]` results in an empty string value for that key.

### 3. Streaming-Safe
Because it is a single-pass scanner, it can be called on every chunk of a streaming response. Partial markers at the very end of a stream are handled gracefully by the `parseStreaming` engine.


