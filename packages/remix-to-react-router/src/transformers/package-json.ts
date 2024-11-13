import type { FileInfo } from 'jscodeshift';
import { PACKAGE_CHANGES } from '../config.js';
import { updateDependencies, sortDependencies } from '../utils/dependencies.js';

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

export function transformPackageJson(file: FileInfo): string | undefined {
  let dirtyFlag = false;

  const packageJson = JSON.parse(file.source);

  // Step 2 - Update dependencies in package.json
  for (const [pattern, change] of Object.entries(PACKAGE_CHANGES)) {
    const regex = new RegExp(pattern);

    const dependencies = packageJson.dependencies;
    dirtyFlag = updateDependencies(dependencies, regex, change) || dirtyFlag;

    const devDependencies = packageJson.devDependencies;
    dirtyFlag = updateDependencies(devDependencies, regex, change) || dirtyFlag;
  }

  // Add "react-router" dependency if it doesn't exist and we've updated a remix dependency
  if (dirtyFlag && !packageJson.dependencies['react-router']) {
    packageJson.dependencies['react-router'] = '^7.0.0';
    dirtyFlag = true;
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
