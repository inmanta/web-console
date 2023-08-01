export function getResourceIdFromResourceVersionId(
  resourceVersionId: string,
): string {
  const indexOfVersionSeparator = resourceVersionId.lastIndexOf("],");
  return resourceVersionId.substring(0, indexOfVersionSeparator + 1);
}
