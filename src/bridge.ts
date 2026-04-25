import type { ReactElement } from 'react';

export type BuiltinPattern = 'scalar' | 'array' | 'keyvalue' | 'range';
export type BridgePattern<T = unknown> = BuiltinPattern | ((raw: string) => T);

/**
 * Field-based bridge definition — describe what data you need, the system
 * handles parsing and prompt generation automatically.
 *
 * Each key is a field name, the value is a plain-English description used
 * to generate the LLM prompt.  Fields are always parsed as keyvalue pairs:
 *   @marker[field: "value", field: "value"]
 */
export type BridgeFields = Record<string, string>;

export interface BridgeRenderCtx {
  query: (key: string, params?: unknown) => unknown;
  emit: (event: string, data?: unknown) => void;
}

export interface BridgeDefinition<T = unknown> {
  marker: string;
  pattern: BridgePattern<T>;
  fields?: BridgeFields;
  render: (data: T, ctx: BridgeRenderCtx) => ReactElement | null;
  prompt: string;
  /** @internal */
  _parse: (raw: string) => T;
}

/**
 * Split `str` on `delim` while respecting "quoted strings" — delimiters
 * inside double-quoted sections are treated as literal characters, not
 * as separators.  Backslash-escaped quotes (\") inside a quoted section
 * are passed through as-is.
 */
export function splitKV(str: string, delim: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '\\' && inQuote && i + 1 < str.length) {
      current += ch + str[++i];
    } else if (ch === '"') {
      inQuote = !inQuote;
      current += ch;
    } else if (!inQuote && str.startsWith(delim, i)) {
      parts.push(current);
      current = '';
      i += delim.length - 1;
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Strip surrounding double-quotes and unescape \" sequences. */
export function unquoteKV(val: string): string {
  const t = val.trim();
  if (t.startsWith('"') && t.endsWith('"') && t.length >= 2) {
    return t.slice(1, -1).replace(/\\"/g, '"');
  }
  return t;
}

export const bridgePatterns = {
  scalar: (raw: string) => raw.trim(),
  array: (raw: string) => raw.split(',').map((s) => s.trim()).filter(Boolean),
  keyvalue: (raw: string) => {
    const result: Record<string, string> = {};
    splitKV(raw, ',').forEach((pair) => {
      const colon = pair.indexOf(':');
      if (colon === -1) return;
      result[pair.slice(0, colon).trim()] = unquoteKV(pair.slice(colon + 1));
    });
    return result;
  },
  range: (raw: string) => {
    const match = raw.match(/^(.+?)\s*(?:→|->|to)\s*(.+)$/);
    if (match) return { min: match[1].trim(), max: match[2].trim() };
    return { raw };
  },
} as const;

export function parseBridgeData<T>(pattern: BridgePattern<T>, raw: string): T {
  if (typeof pattern === 'function') return pattern(raw);

  switch (pattern) {
    case 'scalar':
      return bridgePatterns.scalar(raw) as T;

    case 'array':
      return bridgePatterns.array(raw) as T;

    case 'keyvalue':
      return bridgePatterns.keyvalue(raw) as T;

    case 'range':
      return bridgePatterns.range(raw) as T;
  }
}

export interface GetBridgePromptOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  include?: string[] | ((bridge: BridgeDefinition<any>) => boolean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exclude?: string[] | ((bridge: BridgeDefinition<any>) => boolean);
  prefix?: string;
  separator?: string;
}

function matchesBridgeSelector(
  selector: GetBridgePromptOptions['include'] | GetBridgePromptOptions['exclude'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bridge: BridgeDefinition<any>,
): boolean {
  if (!selector) return false;
  if (Array.isArray(selector)) return selector.includes(bridge.marker);
  return selector(bridge);
}

export function getBridgePrompt(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bridges: BridgeDefinition<any>[],
  options: GetBridgePromptOptions = {},
): string {
  const separator = options.separator ?? '\n';
  const selected = bridges.filter((bridge) => {
    const included = options.include ? matchesBridgeSelector(options.include, bridge) : true;
    const excluded = options.exclude ? matchesBridgeSelector(options.exclude, bridge) : false;
    return included && !excluded;
  });

  const prompt = selected.map((bridge) => bridge.prompt).join(separator);
  if (!prompt) return options.prefix ?? '';
  return options.prefix ? `${options.prefix}${separator}${prompt}` : prompt;
}

function promptFromFields(marker: string, fields: BridgeFields): string {
  const fieldList = Object.entries(fields)
    .map(([key, desc]) => `  ${key}: ${desc}`)
    .join('\n');
  const example = Object.keys(fields)
    .map((k) => `${k}: "..."`)
    .join(', ');
  return `Use @${marker}[${example}] to render a ${marker} component.\nFields:\n${fieldList}`;
}

function autoPrompt(marker: string, pattern: BuiltinPattern | Function): string {
  switch (pattern) {
    case 'scalar':   return `Use @${marker}[value] inline. Example: @${marker}[success]`;
    case 'array':    return `Use @${marker}[a, b, c] inline. Example: @${marker}[React, Vue, Angular]`;
    case 'keyvalue': return `Use @${marker}[key: value, key: value] inline. Example: @${marker}[name: Alice, role: Admin]`;
    case 'range':    return `Use @${marker}[low → high] inline. Example: @${marker}[100 → 500]`;
    default:         return `Use @${marker}[data] to render a ${marker} component.`;
  }
}

function isValidMarker(marker: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(marker);
}

/** Bridge defined with explicit fields — parsing is always keyvalue, prompt is auto-generated. */
export function defineBridge<T extends Record<string, string>>(def: {
  marker: string;
  fields: BridgeFields;
  render: (data: T, ctx: BridgeRenderCtx) => ReactElement | null;
}): BridgeDefinition<T>;

/** Bridge defined with an explicit pattern — full control over parsing. */
export function defineBridge<T = string>(def: {
  marker: string;
  pattern: BridgePattern<T>;
  render: (data: T, ctx: BridgeRenderCtx) => ReactElement | null;
  prompt?: string;
  onParseError?: (raw: string, error: unknown) => T;
}): BridgeDefinition<T>;

export function defineBridge<T>(def: {
  marker: string;
  fields?: BridgeFields;
  pattern?: BridgePattern<T>;
  render: (data: T, ctx: BridgeRenderCtx) => ReactElement | null;
  prompt?: string;
  onParseError?: (raw: string, error: unknown) => T;
}): BridgeDefinition<T> {
  if (!isValidMarker(def.marker)) {
    throw new Error(`Invalid bridge marker "${def.marker}". Markers must match /^[a-z][a-z0-9-]*$/.`);
  }

  const pattern: BridgePattern<T> = def.pattern ?? 'keyvalue';
  const prompt = def.fields
    ? promptFromFields(def.marker, def.fields)
    : (def.prompt ?? autoPrompt(def.marker, pattern));

  return {
    marker: def.marker,
    fields: def.fields,
    pattern,
    render: def.render,
    prompt,
    _parse: (raw: string) => {
      try {
        return parseBridgeData(pattern, raw);
      } catch (error) {
        if (def.onParseError) return def.onParseError(raw, error);
        return raw as T;
      }
    },
  };
}
