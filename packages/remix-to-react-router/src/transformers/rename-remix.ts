import type { Collection, JSCodeshift } from 'jscodeshift';

export function transformRemixNames(j: JSCodeshift, root: Collection<any>) {
  let dirtyFlag = false;
  root.find(j.Identifier, { name: 'remixContext' }).forEach((path) => {
    path.node.name = 'reactRouterContext';
    dirtyFlag = true;
  });

  return dirtyFlag;
}
