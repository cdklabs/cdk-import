import * as Case from 'case';

/**
 * convert the type name to a TypeScript class name by camel-casing and removing `::`
 *
 * @param typeName the name of the resource type
 * @returns the name to use as class name
 */
export function sanitizeTypeName(typeName: string) {
  const parts = typeName.split('::');
  const lastParts = [parts[parts.length - 1]];
  if (lastParts[0].toUpperCase() === 'MODULE') {
    lastParts.unshift(parts[parts.length - 2]);
  }

  return lastParts.map(p => Case.pascal(p)).join('');
}
