import type { API, FileInfo, JSCodeshift } from 'jscodeshift';
import detectLineTerminator from './utils/line-terminator.js';
import detectQuoteStyle from './utils/quote-style.js';
import { transformPackageJson } from './transformers/package-json.js';
import { transformImports } from './transformers/imports.js';
import { transformRemixNames } from './transformers/rename-remix.js';
import { transformRenameServerBuild } from './transformers/rename-server-build.js';
import { transformTsconfig } from './transformers/tsconfig.js';
import { transformFunctionParams } from './transformers/function-params.js';

export default function transformer(file: FileInfo, api: API) {
  // Automates the manual steps from the Remix to React Router upgrade guide
  // https://github.com/remix-run/react-router/blob/dev/docs/upgrading/remix.md

  // Step 2 - Update dependencies in package.json
  // Step 3 - Change scripts in package.json
  if (file.path.endsWith('package.json')) {
    return transformPackageJson(file);
  }

  // Step X - Update compilerOptions.types in tsconfig.json
  if (file.path.endsWith('tsconfig.json')) {
    return transformTsconfig(file);
  }

  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  // Try to detect the original quoting and line terminator before changes are made
  const quote = detectQuoteStyle(j, root) || 'single';
  const lineTerminator = detectLineTerminator(file.source);

  // Step 2 - Update dependencies in code
  // Step 4 - Rename plugin in vite.config
  // Step 6 - Rename components in entry files
  let dirtyFlag = transformImports(j, root);

  // Step X - Update vi.mock("@remix-run/react", () => ...) and import("@remix-run/react")
  dirtyFlag = transformFunctionParams(j, root) || dirtyFlag;

  // Step X - Rename virtual:remix/server-build in server files
  dirtyFlag = transformRenameServerBuild(j, root) || dirtyFlag;

  // Step X - Rename instances of remix to reactRouter in server entry files
  if (file.path.endsWith('entry.server.tsx')) {
    dirtyFlag = transformRemixNames(j, root) || dirtyFlag;
  }

  return dirtyFlag ? root.toSource({ quote, lineTerminator }) : undefined;
}

export const parser = 'tsx';
