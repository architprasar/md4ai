# Bridges Guide

Bridges are the extension layer for inline, host-owned UI.

## Good bridge payloads

Use small, stable payloads the model can emit reliably:

- `@status[healthy]`
- `@user[usr_123]`
- `@kpi[label: Revenue, value: $167k, change: +18%]`

Avoid asking the model to emit large nested payloads or final authoritative business data.

## Parsing Helpers

`md4ai` exports `parseBridgeData()` for the built-in bridge patterns:

```ts
import { parseBridgeData } from '@architprasar/md4ai/core';

parseBridgeData('scalar', 'healthy');
parseBridgeData('array', 'East, North, APAC');
parseBridgeData('keyvalue', 'label: Revenue, value: $167k');
parseBridgeData('range', '100 -> 500');
```

## Safe Custom Parsing

If your bridge needs custom parsing, prefer a forgiving parser or pair it with `onParseError`.

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
  onParseError: (raw) => ({ raw, done: 0, total: 0, pct: 0 }),
  render: ({ pct }) => <span>{pct}%</span>,
});
```

If parsing still fails without `onParseError`, md4ai falls back to the raw bridge payload. If the bridge renderer throws, md4ai falls back to visible `@marker[data]` text.

## Recommended Built-in Patterns

- `scalar` for statuses, IDs, and labels
- `array` for tags, markets, or simple lists
- `keyvalue` for small structured payloads
- `range` for low/high or min/max signals
