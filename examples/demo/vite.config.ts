import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@architprasar/md4ai/core': resolve(__dirname, '../../src/core.ts'),
      '@architprasar/md4ai/react': resolve(__dirname, '../../src/react.ts'),
      '@architprasar/md4ai': resolve(__dirname, '../../src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        showcase: resolve(__dirname, 'showcase.html'),
        docs: resolve(__dirname, 'docs.html'),
        efficiency: resolve(__dirname, 'token-efficiency.html'),
      },
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          const repoSrc = resolve(__dirname, '../../src').replace(/\\/g, '/');

          if (normalized.includes('/node_modules/react/') || normalized.includes('/node_modules/react-dom/')) {
            return 'react-vendor';
          }

          if (normalized.includes('/node_modules/highlight.js/')) {
            return 'highlight';
          }

          if (normalized.includes('/node_modules/chart.js/')) {
            return 'chart';
          }

          if (
            normalized.includes('/node_modules/unified/') ||
            normalized.includes('/node_modules/remark-') ||
            normalized.includes('/node_modules/unist-') ||
            normalized.includes('/node_modules/mdast-') ||
            normalized.includes('/node_modules/micromark/')
          ) {
            return 'markdown-engine';
          }

          if (normalized.startsWith(repoSrc)) {
            if (
              normalized.includes('/src/parse/') ||
              normalized.endsWith('/src/core.ts')
            ) {
              return 'md4ai-core';
            }

            if (
              normalized.includes('/src/renderers/') ||
              normalized.endsWith('/src/react.ts') ||
              normalized.endsWith('/src/themes.ts') ||
              normalized.endsWith('/src/bridge.ts') ||
              normalized.endsWith('/src/types.ts')
            ) {
              return 'md4ai-react';
            }
          }
        },
      },
    },
  },
}));
