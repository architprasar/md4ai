# Architecture Overview

`md4ai` is a small pipeline with three layers:

## Parsing

`src/parse/` extends markdown into a stable intermediate representation. Plugins normalize callouts, fenced rich blocks, directives, and inline bridges before `rootToIR()` converts the mdast tree into library-owned node types.

## Rendering

`src/renderers/html/` turns IR nodes into React elements. `renderContent()` provides themed default components while still allowing host apps to override individual node renderers.

The package now exposes that split directly:

- `@architprasar/md4ai/core` for parsing, streaming, bridges, and IR types
- `@architprasar/md4ai/react` for `renderContent()`, themes, and renderer override types
- `@architprasar/md4ai` as the compatibility entry that re-exports both

The renderer intentionally separates parsing from presentation:

- Parsing produces plain IR nodes with no React dependency.
- Rendering consumes that IR with theme tokens, component overrides, and bridge context.
- Missing bridge renderers degrade visibly instead of breaking the whole render tree.

## Streaming And Fallbacks

`src/parse/streaming.ts` is a thin lenient wrapper around `parse()`. Before parsing, it auto-closes trailing fenced blocks and open directives so incomplete LLM output remains renderable.

Current fallback behavior is deliberately simple:

- Partial `chart` JSON becomes a `chart` node with `data: null`.
- Partial `video` and `layout` fences still resolve into IR nodes.
- Generic unfinished code fences are closed and preserved as normal code blocks.

This keeps the parser deterministic while letting host apps update the same message repeatedly during token streaming.

## Extension Points

The public extension surface is small on purpose:

- `defineBridge()` adds inline `@marker[data]` tokens with predictable parsing.
- `renderContent(..., { components })` swaps renderer implementations without changing the parser.
- `renderContent(..., { theme })` scopes CSS variable overrides to a single content tree.

## Demo App

`examples/demo/` is a consumer of the library, not the source of truth. It exists for manual QA, examples, and GitHub Pages deployment. Keep reusable library logic in `src/` and avoid letting the demo become the only place behavior is documented.
