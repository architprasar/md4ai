import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import type { Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import type { ParseOptions, IRNode } from '../types.js';
import calloutsPlugin from './plugins/callouts.js';
import fenceBlocksPlugin from './plugins/fenceBlocks.js';
import directivesPlugin from './plugins/directives.js';
import { inlineBridgesPlugin } from './plugins/inlineBridges.js';
import { rootToIR } from './toIR.js';

/**
 * Private-use Unicode sentinel used to temporarily replace colons inside
 * @marker[...] bracket content before the markdown is handed to unified.
 *
 * remark-directive runs as a micromark extension at parse time and turns
 * :word sequences into textDirective nodes, which fragments paragraphs that
 * contain @marker[field:value|...:type] data and prevents inlineBridgesPlugin
 * from ever seeing the complete @marker[...] text node.
 *
 * Strategy:
 *  1. escapeBridgeColons()  — replaces colons inside brackets with \uE001
 *  2. processor.parse()     — remark-directive sees no :word tokens to eat
 *  3. restoreBridgeColons() — colons restored in AST text nodes
 *  4. processor.runSync()   — inlineBridgesPlugin now matches the full token
 */
const COLON_SENTINEL = '\uE001';
const SENTINEL_RE = new RegExp(COLON_SENTINEL, 'g');

/** Replace colons inside @marker[...] brackets with the sentinel character. */
function escapeBridgeColons(markdown: string): string {
  return markdown.replace(/@[a-z][a-z0-9-]*\[([^\]]*)\]/g, (full, inner: string) => {
    const openBracket = full.indexOf('[');
    return (
      full.slice(0, openBracket + 1) +
      inner.replace(/:/g, COLON_SENTINEL) +
      ']'
    );
  });
}

/** Restore the sentinel back to colons in all text nodes of the AST. */
function restoreBridgeColons(tree: Root): void {
  visit(tree, 'text', (node: Text) => {
    if (node.value.includes(COLON_SENTINEL)) {
      node.value = node.value.replace(SENTINEL_RE, ':');
    }
  });
}

export function parse(markdown: string, options: ParseOptions = {}): IRNode[] {
  const { gfm = true, bridges = [] } = options;

  // Pre-process: hide colons inside @marker[...] from remark-directive's
  // micromark tokeniser, which would otherwise split :word sequences into
  // textDirective nodes and prevent the bridge regex from matching the
  // complete @marker[...] span.
  const escaped = bridges.length > 0 ? escapeBridgeColons(markdown) : markdown;

  const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(calloutsPlugin)
    .use(fenceBlocksPlugin)
    .use(directivesPlugin);

  if (gfm) processor.use(remarkGfm);
  if (bridges.length > 0) processor.use(inlineBridgesPlugin(bridges));

  const tree = processor.parse(escaped);

  // Post-parse / pre-transform: restore colons so that inlineBridgesPlugin
  // (which runs during runSync) sees the real @marker[key:value] text.
  if (bridges.length > 0) restoreBridgeColons(tree as Root);

  processor.runSync(tree);

  return rootToIR(tree as Root, bridges);
}
