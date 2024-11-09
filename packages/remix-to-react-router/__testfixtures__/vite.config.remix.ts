// @ts-nocheck

import { vitePlugin as remix } from '@remix-run/dev';
import { vitePlugin } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const myRemix = remix({});

export default defineConfig({
  plugins: [remix(), vitePlugin(), myRemix, tsconfigPaths()],
});
