import type {
  JSCodeshift,
  Collection,
  ASTPath,
  CallExpression,
} from 'jscodeshift';
import { PACKAGE_CHANGES } from '../config.js';

export function transformFunctionParams(
  j: JSCodeshift,
  root: Collection<any>
): boolean {
  let dirtyFlag = false;

  // Helper function to replace package names
  const replacePackageName = (name: string): string => {
    for (const [pattern, { source, packageSource }] of Object.entries(
      PACKAGE_CHANGES
    )) {
      const regex = new RegExp(pattern);
      if (regex.test(name)) {
        dirtyFlag = true;
        return name.replace(regex, packageSource || source);
      }
    }
    return name;
  };

  // Transform the first string arg of specified functions
  const transformFunction = (path: ASTPath<CallExpression>) => {
    const arg = path.node.arguments[0];
    if (arg && arg.type === 'StringLiteral') {
      arg.value = replacePackageName(arg.value);
    }
  };

  // Transform vi.mock calls
  root
    .find(j.CallExpression, {
      callee: { object: { name: 'vi' }, property: { name: 'mock' } },
    })
    .forEach(transformFunction);

  // Transform dynamic imports
  root
    .find(j.CallExpression, { callee: { type: 'Import' } })
    .forEach(transformFunction);

  return dirtyFlag;
}
