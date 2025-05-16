/**
 * Extracts the base resource ID from a resource version ID by removing the version suffix.
 *
 * @param resourceVersionId - The full resource version ID with format "resourceId,v=number"
 * @returns The base resource ID without the version suffix
 */
export function getResourceIdFromResourceVersionId(
  resourceVersionId: string,
): string {
  return resourceVersionId.replace(/,v=[0-9]+$/, "");
}
