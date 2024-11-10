import type {
  API,
  FileInfo,
  ImportDeclaration,
  JSCodeshift,
} from 'jscodeshift';
import detectLineTerminator from './utils/line-terminator.js';
import { sortDependencies, updateDependencies } from './utils/dependencies.js';
import detectQuoteStyle from './utils/quote-style.js';
import type { PackageChange } from './types.js';

const PACKAGE_CHANGES: Record<string, PackageChange> = {
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
  '^@remix-run/(.*)$': {
    source: '@react-router/$1',
  },
};

const SCRIPT_CHANGES: Record<string, string> = {
  dev: 'react-router dev',
  build: 'react-router build',
  start: 'react-router-serve ./build/server/index.js',
  typecheck: 'react-router typegen && tsc',
};

const OLD_SCRIPTS: Record<string, string> = {
  dev: 'remix vite:dev',
  build: 'remix vite:build',
  start: 'remix-serve ./build/server/index.js',
  typecheck: 'tsc',
};

export default function transformer(file: FileInfo, api: API) {
  let dirtyFlag = false;

  // Automates the manual steps from the Remix to React Router upgrade guide
  // https://github.com/remix-run/react-router/blob/dev/docs/upgrading/remix.md

  if (file.path.endsWith('package.json')) {
    const packageJson = JSON.parse(file.source);

    // Step 2 - Update dependencies in package.json
    for (const [pattern, change] of Object.entries(PACKAGE_CHANGES)) {
      const regex = new RegExp(pattern);
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};

      dirtyFlag = updateDependencies(dependencies, regex, change) || dirtyFlag;
      dirtyFlag =
        updateDependencies(devDependencies, regex, change) || dirtyFlag;

      packageJson.dependencies = dependencies;
      packageJson.devDependencies = devDependencies;
    }

    // Step 3 - Change scripts in package.json
    if (packageJson.scripts) {
      for (const [script, newCommand] of Object.entries(SCRIPT_CHANGES)) {
        if (packageJson.scripts[script] === OLD_SCRIPTS[script]) {
          // When updating any typecheck script, make sure the package.json also has an
          // updated react-router "build" script so we don't modify non-remix package.json files.
          if (
            script === 'typecheck' &&
            packageJson.scripts['build'] !== SCRIPT_CHANGES['build']
          ) {
            continue;
          }
          packageJson.scripts[script] = newCommand;
          dirtyFlag = true;
        }
      }
    }

    // Before returning the updated package.json, sort the dependencies and devDependencies.
    packageJson.dependencies = sortDependencies(packageJson.dependencies);
    packageJson.devDependencies = sortDependencies(packageJson.devDependencies);

    return dirtyFlag ? JSON.stringify(packageJson, null, 2) : undefined;
  }

  // Step 2 - Update dependencies in code
  // Step 4 - Rename plugin in vite.config
  // Step 6 - Rename components in entry files
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  // Try to maintain the original quoting and line terminator before changes are made
  const quote = detectQuoteStyle(j, root) || 'single';
  const lineTerminator = detectLineTerminator(file.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    const importDeclaration = path.node;
    const importPackage = importDeclaration.source.value;

    // Check if the import package matches any pattern in the PACKAGE_CHANGES
    for (const [pattern, { source, imports }] of Object.entries(
      PACKAGE_CHANGES
    )) {
      const regex = new RegExp(pattern);
      if (typeof importPackage === 'string' && regex.test(importPackage)) {
        const newpackage = importPackage.replace(regex, source);
        const newImports: Record<string, ImportDeclaration> = {};

        // Iterate over each specifier in the import declaration
        if (importDeclaration.specifiers) {
          importDeclaration.specifiers.forEach((specifier) => {
            if (
              imports &&
              j.ImportSpecifier.check(specifier) &&
              imports[specifier.imported.name]
            ) {
              const oldName = specifier.imported.name;
              const newImport = imports[oldName];
              const newName = newImport?.name || oldName;
              const newSource = newImport?.source || newpackage;

              // Create a new import declaration if it doesn't exist
              if (!newImports[newSource]) {
                newImports[newSource] = j.importDeclaration(
                  [],
                  j.stringLiteral(newSource)
                );
              }

              // Add the specifier to the new import declaration
              const newSpecifier = j.importSpecifier(
                j.identifier(newName),
                !newImport?.removeAlias &&
                  specifier.local &&
                  specifier.local.name &&
                  specifier.local?.name !== specifier.imported.name
                  ? j.identifier(specifier.local.name)
                  : null
              );

              newImports[newSource].specifiers?.push(newSpecifier);

              // Update all occurrences of the old specifier in the code
              // keeping any existing aliases unless explicitly removed
              if (newName && oldName !== newName) {
                const hasAlias =
                  specifier.local?.name &&
                  specifier.local?.name !== specifier.imported.name;
                const aliasedOldName = hasAlias
                  ? specifier.local?.name
                  : oldName;
                const updatedName =
                  (hasAlias &&
                    !newImport?.removeAlias &&
                    specifier.local?.name) ||
                  newName;
                root
                  .find(j.Identifier, { name: aliasedOldName })
                  .forEach((idPath) => {
                    idPath.node.name = updatedName;
                  });
              }

              dirtyFlag = true;
            } else {
              // Create a new import declaration if it doesn't exist
              if (!newImports[newpackage]) {
                newImports[newpackage] = j.importDeclaration(
                  [],
                  j.stringLiteral(newpackage)
                );
              }

              // Add the specifier to the new import declaration
              newImports[newpackage].specifiers?.push(specifier);
              newImports[newpackage].importKind = importDeclaration.importKind;

              dirtyFlag = true;
            }
          });
        }

        // Preserve comments from the original import declaration
        const comments = importDeclaration.comments;

        // Replace the original import declaration with the new ones
        const newImportDeclarations = Object.values(newImports);
        if (
          comments &&
          newImportDeclarations.length > 0 &&
          newImportDeclarations[0]
        ) {
          newImportDeclarations[0].comments = comments;
        }

        path.replace(...newImportDeclarations);

        break;
      }
    }
  });

  // Step 8 - Rename instances of remix to reactRouter in server entry files
  if (file.path.endsWith('entry.server.tsx')) {
    root.find(j.Identifier, { name: 'remixContext' }).forEach((path) => {
      path.node.name = 'reactRouterContext';
      dirtyFlag = true;
    });
  }

  return dirtyFlag ? root.toSource({ quote, lineTerminator }) : undefined;
}

export const parser = 'tsx';
