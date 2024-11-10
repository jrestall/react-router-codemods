import type { Collection, JSCodeshift } from 'jscodeshift';

/**
 * As Recast is not preserving original quoting, we try to detect it.
 * See https://github.com/benjamn/recast/issues/171
 * and https://github.com/facebook/jscodeshift/issues/143
 * @return 'double', 'single' or null
 */
export default function detectQuoteStyle(j: JSCodeshift, ast: Collection<any>) {
  let doubles = 0;
  let singles = 0;

  ast.find(j.ImportDeclaration).forEach((p) => {
    // The raw value is from the original babel source
    // @ts-expect-error
    const quote = p.value.source?.extra?.raw[0];
    if (quote === '"') {
      doubles += 1;
    }
    if (quote === "'") {
      singles += 1;
    }
  });

  if (doubles === singles) {
    return null;
  }
  return doubles > singles ? 'double' : 'single';
}
