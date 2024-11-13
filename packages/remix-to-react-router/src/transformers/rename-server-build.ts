import type { Collection, JSCodeshift } from 'jscodeshift';

export function transformRenameServerBuild(
  j: JSCodeshift,
  root: Collection<any>
) {
  let dirtyFlag = false;

  // Change the string "virtual:remix/server-build" to "virtual:react-router/server-build"
  root
    .find(j.StringLiteral, { value: 'virtual:remix/server-build' })
    .forEach((path) => {
      path.node.value = 'virtual:react-router/server-build';
      dirtyFlag = true;
    });

  return dirtyFlag;
}
