// @ts-nocheck

import { reactRouter } from '@react-router/dev/vite';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const myRemix = reactRouter();

export default defineConfig({
  plugins: [reactRouter(), reactRouter(), myRemix, tsconfigPaths()],
});

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
});

export default defineConfig({
  plugins: [
    reactRouter({
      basename: '/test'
    }),
    tsconfigPaths(),
  ],
});

export default defineConfig({
  plugins: [
    reactRouter({
      future: {
        unstable_optimizeDeps: true
      },
      basename: '/test'
    }),
    tsconfigPaths(),
  ],
});

export default defineConfig({
  plugins: [
    reactRouter({
      future: {
        unstable_optimizeDeps: true
      },
    }),
    tsconfigPaths(),
  ],
});
