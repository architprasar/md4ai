import { unquoteKV } from './bridge.js';

/**
 * High-performance, single-pass lexer for the Hybrid Bridge Syntax.
 * Handles commas, pipe-lists (|...|), and quoted strings while being
 * resilient to unclosed containers (essential for streaming).
 */
export function splitHybrid(str: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  let inPipe = false;
  let i = 0;

  while (i < str.length) {
    const ch = str[i];

    // Handle backslash escaping inside quotes or pipes
    if (ch === '\\' && (inQuote || inPipe) && i + 1 < str.length) {
      current += ch + str[++i];
    } 
    // Toggle quotes
    else if (ch === '"') {
      inQuote = !inQuote;
      current += ch;
    } 
    // Toggle pipes (only outside quotes)
    else if (ch === '|' && !inQuote) {
      if (!inPipe) {
        inPipe = true;
      } else {
        // Only close if it's likely the end of the container:
        // followed by a comma, or end of string.
        // This allows internal | to be used as separators.
        const next = str[i + 1];
        if (!next || next === ',') {
          inPipe = false;
        }
      }
      current += ch;
    } 
    // Delimiter (only outside all containers)
    else if (ch === ',' && !inQuote && !inPipe) {
      parts.push(current.trim());
      current = '';
    } 
    else {
      current += ch;
    }
    i++;
  }

  // Always push the remaining buffer (graceful recovery for unclosed containers)
  parts.push(current.trim());

  // Filter out empty parts caused by leading/trailing or double commas
  return parts.filter(p => p !== '');
}

/**
 * Removes pipe containers |...| from a string.
 */
export function unpipe(val: string): string {
  const t = val.trim();
  if (t.startsWith('|') && t.endsWith('|') && t.length >= 2) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Fully cleans a token: unquotes and unpipes.
 */
export function cleanToken(val: string): string {
  return unquoteKV(unpipe(val));
}
