
/**
 * convert the type name to a TypeScript class name by camel-casing and removing `::`
 *
 * @param typeName the name of the resource type
 * @returns the name to use as class name
 */
export function sanitizeTypeName(typeName: string) {
  const parts = typeName.split('::');
  return parts.map(part => part.substr(0, 1).toUpperCase() + part.substr(1).toLowerCase()).join('');
}

/**
 * convert the type name to a file name by kebap-casing and removing `::`
 *
 * @param typeName the name of the resource type
 * @returns the name to use as file name
 */
export function sanitizeFileName(typeName: string) {
  return `${typeName.replace(/::/g, '-').toLowerCase()}.ts`;
}