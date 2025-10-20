import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'node20',
  shims: false,
  splitting: false,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
