// @ts-nocheck

import { reactRouter } from '@react-router/dev/vite';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const myRemix = reactRouter({});

export default defineConfig({
  plugins: [reactRouter(), reactRouter(), myRemix, tsconfigPaths()],
});