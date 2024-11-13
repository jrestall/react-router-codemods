import type { PackageChange } from './types.js';

export const PACKAGE_CHANGES: Record<string, PackageChange> = {
  '^@remix-run/react$': {
    source: 'react-router',
    imports: {
      RemixBrowser: {
        name: 'HydratedRouter',
        source: 'react-router/dom',
      },
      RemixServer: { name: 'ServerRouter' },
    },
    packageRemoved: true,
  },
  '^@remix-run/testing$': {
    source: 'react-router',
    imports: {
      createRemixStub: { name: 'createRoutesStub' },
    },
    packageRemoved: true,
  },
  '^@remix-run/server-runtime$': {
    source: 'react-router',
    packageRemoved: true,
  },
  '^@remix-run/router$': {
    source: 'react-router',
    packageRemoved: true,
  },
  '^@remix-run/dev$': {
    source: '@react-router/dev',
    imports: {
      vitePlugin: {
        name: 'reactRouter',
        source: '@react-router/dev/vite',
        removeAlias: true,
      },
    },
  },
  '^@remix-run/route-config$': {
    source: '@react-router/dev/routes',
    packageRemoved: true,
  },
  '^@remix-run/routes-option-adapter$': {
    source: '@react-router/remix-routes-option-adapter',
  },
  '^@remix-run/cloudflare$': {
    source: 'react-router',
    imports: {
      createWorkersKVSessionStorage: { source: '@react-router/cloudflare' },
      createPagesFunctionHandlerParams: { source: '@react-router/cloudflare' },
      GetLoadContextFunction: { source: '@react-router/cloudflare' },
      RequestHandler: { source: '@react-router/cloudflare' },
      createPagesFunctionHandler: { source: '@react-router/cloudflare' },
      createRequestHandler: { source: '@react-router/cloudflare' },
    },
    packageSource: '@react-router/cloudflare',
  },
  '^@remix-run/node$': {
    source: 'react-router',
    imports: {
      createFileSessionStorage: { source: '@react-router/node' },
      createReadableStreamFromReadable: { source: '@react-router/node' },
      readableStreamToString: { source: '@react-router/node' },
      writeAsyncIterableToWritable: { source: '@react-router/node' },
      writeReadableStreamToWritable: { source: '@react-router/node' },
    },
    packageSource: '@react-router/node',
  },
  '^@remix-run/architect$': {
    source: 'react-router',
    imports: {
      createFileSessionStorage: { source: '@react-router/architect' },
      createArcTableSessionStorage: { source: '@react-router/architect' },
      GetLoadContextFunction: { source: '@react-router/architect' },
      RequestHandler: { source: '@react-router/architect' },
      createRequestHandler: { source: '@react-router/architect' },
    },
    packageSource: '@react-router/architect',
  },
  '^@remix-run/(?!eslint-config)(.*)$': {
    source: '@react-router/$1',
  },
  '^react-router-dom$': {
    source: 'react-router',
    packageRemoved: true,
  },
};
