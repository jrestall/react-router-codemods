// @ts-nocheck

import { vitePlugin } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [vitePlugin(), tsconfigPaths()],
});
