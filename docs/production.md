# Production Integration Guide

This guide focuses on the operational side of `md4ai`: how to stream safely, layer in app theming, swap renderers, and keep bridge integrations predictable in production.

## Streaming

Use `parseStreaming()` on the full accumulated response text every time a new chunk arrives:

```tsx
import { parseStreaming } from '@architprasar/md4ai/core';
import { renderContent } from '@architprasar/md4ai/react';

function AssistantMessage({ text }: { text: string }) {
  return renderContent(parseStreaming(text));
}
```

What it guarantees today:

- Unclosed backtick fences are auto-closed before parsing.
- Unclosed `:::card`-style directives are auto-closed before parsing.
- Incomplete `chart` fences resolve to a `chart` node with `data: null` so the UI can stay mounted.
- Partial `video` and `layout` fences still parse into renderable nodes instead of throwing.

Recommended app pattern:

- Keep one source of truth for the full assistant message text.
- Re-parse the full string on each chunk instead of trying to patch IR nodes manually.
- Treat `parseStreaming()` output as transient UI state and re-run `parse()` on the final settled message if you need a canonical stored representation.

## Theming

`renderContent()` scopes theme tokens to the wrapper it returns, so the safest production path is to derive your app shell and `md4ai` from the same token object:

```tsx
import { renderContent, themes } from '@architprasar/md4ai/react';

const theme = themes.blue.dark;

export function Message({ nodes }: { nodes: ReturnType<typeof parseStreaming> }) {
  return (
    <section
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font,
      }}
    >
      {renderContent(nodes, { theme })}
    </section>
  );
}
```

Guidelines:

- Prefer passing a complete preset such as `themes.zinc.light` or `themes.blue.dark` for consistent color pairs.
- Use partial overrides only for deliberate brand deltas.
- If your host app already defines matching CSS variables, pass only the tokens you need to override locally.

## Custom Components

`components` lets you replace specific renderers without changing parsing:

```tsx
renderContent(nodes, {
  components: {
    callout: ({ variant, children }) => (
      <Alert tone={variant}>{children}</Alert>
    ),
    chart: ({ chartType, data }) => (
      <MyChart type={chartType} data={data} />
    ),
  },
});
```

A few practical boundaries help keep this maintainable:

- Use component overrides for presentation and host-specific wiring.
- Leave markdown-to-IR decisions in `parse()` and `parseStreaming()`.
- Keep overrides tolerant of partial streaming data, especially `chart`, which may receive `data: null`.

## Bridges

Bridges are the right layer when the AI should author structured inline intent but the app owns the real data and behavior.

```tsx
const userBridge = defineBridge({
  marker: 'user',
  pattern: 'scalar',
  render: (id, { query, emit }) => {
    const user = query('userById', { id });
    return (
      <button onClick={() => emit('open-user', { id })}>
        {(user as { name?: string } | undefined)?.name ?? id}
      </button>
    );
  },
});
```

Production recommendations:

- Register the same `bridges` array with both `parse()` and `renderContent()`.
- Keep bridge payloads small and stable, like IDs, status values, or compact key/value metadata.
- Resolve live data inside `query()` instead of asking the model to emit final business values.
- Treat `emit()` as UI intent, then validate on the app side before performing side effects.
- Keep marker names lowercase and predictable. `defineBridge()` rejects invalid names early.
- For custom bridge parsers, either keep the parser tolerant or provide `onParseError` so bad model output degrades gracefully.
- If a bridge renderer can fail due to missing host data, let it fail closed; md4ai will surface the original token instead of crashing the whole tree.

## Fallback Expectations

There are two useful fallback layers to design around:

1. Parsing fallback: malformed rich blocks should still produce stable IR when possible, especially during streaming.
2. Rendering fallback: if a bridge renderer is missing at render time, the inline source token is shown as plain visible text rather than crashing the tree.

That means a good host integration should:

- Be comfortable rendering partially complete content.
- Avoid assuming every `chart` node has finalized data.
- Avoid assuming every bridge token will have a matching renderer in every environment.

## Validation

When changing production-facing behavior, validate both of these:

```bash
npm run typecheck
npm test
```

If the change affects host app styling or rich block presentation, also check the demo locally with `npm run dev`.
