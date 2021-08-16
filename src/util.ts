
export function sanitizeTypeName(typeName: string) {
  const parts = typeName.split('::');
  return parts.map(part => part.substr(0, 1).toUpperCase() + part.substr(1).toLowerCase()).join('');
}