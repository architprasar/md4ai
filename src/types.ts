import type { ReactElement } from 'react';
import type { BridgeDefinition } from './bridge.js';

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'inlineCode'; value: string }
  | { type: 'link'; href: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'break' }
  | { type: 'bridge'; marker: string; raw: string; data: unknown };

export type CalloutVariant = 'note' | 'warning' | 'tip' | 'danger' | 'info';
export type StepStatus = 'done' | 'active' | 'planned' | 'blocked';
export type StepsPresentation = 'steps' | 'timeline';

export interface StepItem {
  title: string;
  status: StepStatus;
  description?: string;
}

export type IRNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: 'code'; lang: string; value: string }
  | { type: 'blockquote'; children: IRNode[] }
  | { type: 'list'; ordered: boolean; items: IRNode[][]; checkedItems?: (boolean | null)[] }
  | { type: 'table'; head: InlineNode[][]; rows: InlineNode[][][] }
  | { type: 'thematicBreak' }
  | { type: 'callout'; variant: CalloutVariant; children: IRNode[] }
  | { type: 'chart'; chartType: string; data: unknown }
  | { type: 'video'; src: string }
  | { type: 'button'; label: string; href?: string; variant?: string }
  | { type: 'input'; inputType: string; props: Record<string, string> }
  | { type: 'kpi'; label: string; value: string; change?: string; period?: string }
  | { type: 'layout'; columns: number; children: IRNode[][] }
  | { type: 'card'; title?: string; children: IRNode[] }
  | { type: 'steps'; items: StepItem[]; presentation: StepsPresentation };

/**
 * Override renderers for specific node types.
 * Nodes with nested content receive pre-rendered children as ReactElement[],
 * so you can wrap without dealing with IR internals.
 */
export interface ComponentOverrides {
  paragraph?: (props: { children: ReactElement }) => ReactElement | null;
  heading?: (props: { level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactElement }) => ReactElement | null;
  code?: (props: { lang: string; value: string }) => ReactElement | null;
  blockquote?: (props: { children: ReactElement[] }) => ReactElement | null;
  list?: (props: { ordered: boolean; items: ReactElement[][] }) => ReactElement | null;
  table?: (props: { head: InlineNode[][]; rows: InlineNode[][][] }) => ReactElement | null;
  thematicBreak?: () => ReactElement | null;
  callout?: (props: { variant: CalloutVariant; children: ReactElement[] }) => ReactElement | null;
  chart?: (props: { chartType: string; data: unknown }) => ReactElement | null;
  video?: (props: { src: string }) => ReactElement | null;
  button?: (props: { label: string; href?: string; variant?: string }) => ReactElement | null;
  input?: (props: { inputType: string; props: Record<string, string> }) => ReactElement | null;
  kpi?: (props: { label: string; value: string; change?: string; period?: string }) => ReactElement | null;
  card?: (props: { title?: string; children: ReactElement[] }) => ReactElement | null;
  layout?: (props: { columns: number; children: ReactElement[][] }) => ReactElement | null;
  steps?: (props: { items: StepItem[]; presentation: StepsPresentation }) => ReactElement | null;
}

export interface ParseOptions {
  /** Enable GFM (tables, task lists, strikethrough). Default: true */
  gfm?: boolean;
  /** Registered bridges — teaches the parser which @marker[data] tokens to recognize */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bridges?: BridgeDefinition<any>[];
}

/** Single source of truth: theme key → CSS custom property name */
export const THEME_KEYS = {
  accent: '--accent',
  accentHover: '--accent-hover',
  text: '--text',
  textMuted: '--text-muted',
  surface: '--surface',
  surface2: '--surface2',
  bg: '--bg',
  border: '--border',
  codeBg: '--code-bg',
  codeText: '--code-text',
  font: '--font',
  mono: '--mono',
} as const;

export type ThemeTokenKey = keyof typeof THEME_KEYS;

export interface RenderContentOptions {
  /** Extra CSS class on the root wrapper element */
  className?: string;
  /**
   * Optional syntax highlighter. Called with (code, lang), should return an HTML string.
   * Return null/undefined to fall back to plain text rendering.
   */
  highlight?: (code: string, lang: string) => string | null | undefined;
  /**
   * CSS variable overrides scoped to the root wrapper.
   * Keys map to the library's CSS custom properties.
   */
  theme?: Partial<Record<ThemeTokenKey, string>>;
  /** Replace specific node renderers with your own components */
  components?: ComponentOverrides;
  /** Registered bridges — maps @marker[data] tokens to components at render time */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bridges?: BridgeDefinition<any>[];
  /** Provide data to bridge render functions via query(key, params) */
  store?: Record<string, (params?: unknown) => unknown>;
  /** Handle events emitted by bridge components */
  onEvent?: (event: string, data?: unknown) => void;
}

/**
 * @deprecated Use RenderContentOptions.
 */
export type RenderHTMLOptions = RenderContentOptions;
