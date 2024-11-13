import type { FileInfo } from 'jscodeshift';
import { PACKAGE_CHANGES } from '../config.js';

export function transformTsconfig(file: FileInfo): string | undefined {
  let dirtyFlag = false;

  const tsconfigJson = JSON.parse(file.source);

  // Convert all compilerOptions.types string array values in tsconfig.json to new package names
  if (tsconfigJson.compilerOptions?.types) {
    tsconfigJson.compilerOptions.types = tsconfigJson.compilerOptions.types.map(
      (type: string) => {
        for (const [pattern, { source, packageSource }] of Object.entries(
          PACKAGE_CHANGES
        )) {
          const regex = new RegExp(pattern);
          if (regex.test(type)) {
            dirtyFlag = true;
            return type.replace(regex, packageSource || source);
          }
        }
        return type;
      }
    );
  }

  return dirtyFlag ? JSON.stringify(tsconfigJson, null, 2) : undefined;
}
