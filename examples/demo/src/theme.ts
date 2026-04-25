import { useEffect, useState } from 'react';
import type React from 'react';

const COLOR_MODE_KEY = 'md4ai-demo-color-mode';

type ColorMode = 'light' | 'dark';

export function tokensToCSSVars(tokens: Record<string, string | undefined>): React.CSSProperties {
  return {
    '--bg': tokens.bg,
    '--surface': tokens.surface,
    '--surface2': tokens.surface2,
    '--border': tokens.border,
    '--text': tokens.text,
    '--text-muted': tokens.textMuted,
    '--accent': tokens.accent,
    '--accent-hover': tokens.accentHover,
    '--code-bg': tokens.codeBg,
    '--code-text': tokens.codeText,
    '--font': tokens.font,
    '--mono': tokens.mono,
  } as React.CSSProperties;
}

export function demoChromeVars(isDark: boolean): React.CSSProperties {
  return {
    '--shadow-xs': isDark
      ? '0 1px 2px 0 rgb(0 0 0 / 0.38), 0 0 0 1px rgb(255 255 255 / 0.03)'
      : '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.03)',
    '--shadow-sm': isDark
      ? '0 8px 24px -18px rgb(0 0 0 / 0.7), 0 1px 2px 0 rgb(0 0 0 / 0.4)'
      : '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    '--shadow': isDark
      ? '0 18px 38px -24px rgb(0 0 0 / 0.78), 0 8px 18px -16px rgb(0 0 0 / 0.55)'
      : '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  } as React.CSSProperties;
}

export function useStoredColorMode(defaultMode: ColorMode = 'light') {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultMode === 'dark';
    const stored = window.localStorage.getItem(COLOR_MODE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return defaultMode === 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mode: ColorMode = isDark ? 'dark' : 'light';
    window.localStorage.setItem(COLOR_MODE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
  }, [isDark]);

  return [isDark, setIsDark] as const;
}
