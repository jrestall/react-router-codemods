import type { ASTPath, Collection, JSCodeshift } from 'jscodeshift';

export function transformViteConfig(j: JSCodeshift, root: Collection<any>) {
  let dirtyFlag = false;

  // Find the reactRouter call expression and remove the future config property
  root
    .find(j.CallExpression, { callee: { name: 'reactRouter' } })
    .forEach((path: ASTPath<any>) => {
      // Get the react router config object
      const configObject = path.node.arguments[0];
      if (configObject && configObject.type === 'ObjectExpression') {
        const futurePropertyIndex = configObject.properties.findIndex(
          (prop: any) => prop.key.name === 'future'
        );
        if (futurePropertyIndex !== -1) {
          configObject.properties.splice(futurePropertyIndex, 1);
          dirtyFlag = true;
        }

        // If the object is empty after removing the future property, remove the object entirely
        if (configObject.properties.length === 0) {
          path.node.arguments = [];
          dirtyFlag = true;
        }
      }
    });

  return dirtyFlag;
}
