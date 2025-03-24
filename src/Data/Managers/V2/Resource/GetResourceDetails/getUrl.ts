import { Query } from "@/Core";

/**
 * Constructs the URL for fetching resource details based on the provided query parameters.
 *
 * @param id - The id of the resource to fetch details for
 * @returns The constructed URL for fetching resource details
 */
export function getUrl(id: string): string {
  return `/api/v2/resource/${id}`;
}
