/**
 * Constructs the URL for fetching resource facts based on the provided query parameters.
 *
 * @param resourceId - The resource id for fetching resource facts
 * @returns The constructed URL for fetching resource facts
 */
export function getUrl(resourceId: string): string {
  return `/api/v2/resource/${resourceId}/facts`;
}
