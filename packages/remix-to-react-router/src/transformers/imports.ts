import type { Collection, ImportDeclaration, JSCodeshift } from 'jscodeshift';
import { PACKAGE_CHANGES } from '../config.js';

export function transformImports(
  j: JSCodeshift,
  root: Collection<any>
): boolean {
  let dirtyFlag = false;

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

  return dirtyFlag;
}
