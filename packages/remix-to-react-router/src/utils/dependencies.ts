import { PackageChange } from '../types.js';

export function sortDependencies(
  dependencies: Record<string, string>
): Record<string, string> {
  if (!dependencies) return dependencies;
  return Object.fromEntries(Object.entries(dependencies || {}).sort());
}

export function updateDependencies(
  dependencies: Record<string, string>,
  regex: RegExp,
  packageChange: PackageChange
): boolean {
  let dirtyFlag = false;
  if (!dependencies) return dirtyFlag;
  for (const [oldPackage, version] of Object.entries(dependencies)) {
    if (regex.test(oldPackage)) {
      if (!packageChange.packageRemoved) {
        const newPackageName = oldPackage.replace(
          regex,
          packageChange.packageSource || packageChange.source
        );
        // Set the version to ^7.0.0 if the current version is semver compatible
        if (/^\^?\d+\.\d+\.\d+/.test(version)) {
          dependencies[newPackageName] = '^7.0.0';
        } else {
          dependencies[newPackageName] = version;
        }
      }

      delete dependencies[oldPackage];
      dirtyFlag = true;
    }
  }
  return dirtyFlag;
}
