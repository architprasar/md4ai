import type { BridgeDefinition } from './bridge.js';
import { getBridgePrompt, getBridgeProtocolPrompt, type GetBridgePromptOptions } from './bridge.js';

export const builtinPromptTopics = [
  'callouts',
  'charts',
  'steps',
  'kpi',
  'cards',
  'layout',
  'buttons',
  'inputs',
  'video',
  'tables',
] as const;

export type BuiltinPromptTopic = (typeof builtinPromptTopics)[number];
export type PromptMode = 'minimal' | 'standard' | 'withExamples';

type TopicPromptConfig = {
  minimal: string;
  standard: string;
  example?: string;
};

const BUILTIN_PROMPTS: Record<BuiltinPromptTopic, TopicPromptConfig> = {
  callouts: {
    minimal: 'For emphasis, use GitHub-style callouts like > [!NOTE], > [!TIP], > [!WARNING], > [!DANGER], or > [!INFO].',
    standard: 'Use GitHub-style callouts for emphasis and recommendations: > [!NOTE], > [!TIP], > [!WARNING], > [!DANGER], or > [!INFO].',
    example: '> [!NOTE]\n> Important context here.',
  },
  charts: {
    minimal: 'For charts, use ```chart blocks with JSON config.',
    standard: 'Use ```chart fenced blocks with JSON config for bar, line, pie, doughnut, or radar charts.',
    example: '```chart\n{\n  "type": "bar",\n  "labels": ["North", "South"],\n  "datasets": [{ "label": "Revenue", "data": [142, 98] }]\n}\n```',
  },
  steps: {
    minimal: 'For workflows or plans, use ```steps or ```timeline blocks with statuses like done, active, planned, or blocked.',
    standard: 'Use ```steps or ```timeline fenced blocks for workflows and plans. Use statuses: done, active, planned, blocked.',
    example: '```steps\n- [done] Gather requirements\n- [active] Build parser support\n  Accept partial syntax during streaming\n- [planned] Ship docs\n```',
  },
  kpi: {
    minimal: 'For headline metrics, use @kpi["label", "value", change: "...", period: "..."].',
    standard: 'Use @kpi["label", "value", change: "...", period: "..."] for headline metrics and stat cards. Keep labels short.',
    example: '@kpi["Revenue", "$167k", change: "+18%", period: "QoQ"]',
  },
  cards: {
    minimal: 'For highlighted summaries, use @card["title"] followed by content.',
    standard: 'Use @card["title"] followed by a content block for highlights, focused action items, or recommendations.',
    example: '@card["Immediate action"]\nSchedule a follow-up with the South region team.',
  },
  layout: {
    minimal: 'For side-by-side summaries, use ```layout columns=2 blocks with --- separators.',
    standard: 'Use ```layout columns=2 fenced blocks with --- separators to create multi-column summaries.',
    example: '```layout columns=2\n### Strengths\n- Clear enterprise pull\n\n---\n\n### Risks\n- Mobile parity is slipping\n```',
  },
  buttons: {
    minimal: 'For actions, use @button["label", href: "...", variant: "primary|secondary|default"].',
    standard: 'Use @button["label", href: "...", variant: "primary|secondary|default"] for call-to-action buttons.',
    example: '@button["Export report", href: "#", variant: "primary"]',
  },
  inputs: {
    minimal: 'For follow-up fields, use @input["label", type: "text", placeholder: "..."].',
    standard: 'Use @input["label", type: "text", placeholder: "..."] for lightweight prompt fields and follow-ups.',
    example: '@input["Follow-up", type: "text", placeholder: "Ask a deeper question..."]',
  },
  video: {
    minimal: 'For video embeds, use ```video fenced blocks with a video URL.',
    standard: 'Use ```video fenced blocks with a video URL. YouTube and Vimeo links render as embeds; other URLs render as native video.',
    example: '```video\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n```',
  },
  tables: {
    minimal: 'For comparisons and summaries, use normal markdown tables.',
    standard: 'Use standard markdown tables for comparisons, reports, and summaries; md4ai enhances their presentation automatically.',
    example: '| Metric | Value |\n| --- | --- |\n| Revenue | $167k |\n| Change | +18% |',
  },
};

export interface GetPromptOptions {
  bridges?: BridgeDefinition<any>[];
  includeBuiltins?: BuiltinPromptTopic[] | ((topic: BuiltinPromptTopic) => boolean);
  excludeBuiltins?: BuiltinPromptTopic[] | ((topic: BuiltinPromptTopic) => boolean);
  includeBridges?: GetBridgePromptOptions['include'];
  excludeBridges?: GetBridgePromptOptions['exclude'];
  includeBaseInstruction?: boolean;
  includeBridgePrompts?: boolean;
  separator?: string;
  prefix?: string;
  mode?: PromptMode;
}

function matchesTopicSelector(
  selector: GetPromptOptions['includeBuiltins'] | GetPromptOptions['excludeBuiltins'],
  topic: BuiltinPromptTopic,
): boolean {
  if (!selector) return false;
  if (Array.isArray(selector)) return selector.includes(topic);
  return selector(topic);
}

function getBaseInstruction(mode: PromptMode): string {
  if (mode === 'minimal') {
    return 'Write normal markdown by default. Use md4ai syntax only when it clearly improves the response. If unsure, fall back to plain markdown. Never invent unsupported directives or markers.';
  }
  if (mode === 'withExamples') {
    return 'Write standard markdown by default. When richer presentation clearly improves the answer, you may use md4ai markdown extensions instead of JSON or JSX. If unsure about syntax, fall back to plain markdown rather than inventing unsupported directives or markers. Follow the examples exactly when using md4ai syntax.';
  }
  return 'Write standard markdown by default. When richer presentation helps, you may use md4ai markdown extensions instead of JSON or JSX. If unsure about syntax, fall back to plain markdown rather than inventing unsupported directives or markers.';
}

function getTopicPrompt(topic: BuiltinPromptTopic, mode: PromptMode): string {
  const config = BUILTIN_PROMPTS[topic];
  if (mode === 'withExamples') {
    return [config.standard, config.example ? `Example:\n${config.example}` : ''].filter(Boolean).join('\n');
  }
  return config[mode];
}

export function getPrompt(options: GetPromptOptions = {}): string {
  const separator = options.separator ?? '\n';
  const mode = options.mode ?? 'standard';
  const sections: string[] = [];

  if (options.prefix) sections.push(options.prefix);

  if (options.includeBaseInstruction !== false) {
    sections.push(getBaseInstruction(mode));
  }

  const selectedBuiltins = builtinPromptTopics.filter((topic) => {
    const included = options.includeBuiltins ? matchesTopicSelector(options.includeBuiltins, topic) : true;
    const excluded = options.excludeBuiltins ? matchesTopicSelector(options.excludeBuiltins, topic) : false;
    return included && !excluded;
  });

  if (selectedBuiltins.length) {
    sections.push(selectedBuiltins.map((topic) => getTopicPrompt(topic, mode)).join(separator));
  }

  if (options.includeBridgePrompts !== false && options.bridges?.length) {
    // Tier 1: Protocol (Universal Rules)
    sections.push(getBridgeProtocolPrompt());

    // Tier 2: Catalog (Component-specific definitions)
    const bridgePrompt = getBridgePrompt(options.bridges, {
      include: options.includeBridges,
      exclude: options.excludeBridges,
      separator,
    });
    if (bridgePrompt) sections.push(bridgePrompt);
  }

  return sections.filter(Boolean).join(separator);
}
