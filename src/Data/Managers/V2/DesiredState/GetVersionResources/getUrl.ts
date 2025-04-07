import qs from "qs";
import { GetVersionResourcesParams } from "./useGetVersionResources";

/**
 * Constructs the URL for fetching resources from a specific desired state version
 *
 * @param query - The query parameters containing version, pagination, filter, and sort information
 * @returns The constructed URL for fetching the resources
 */
export function getUrl({
  version,
  pageSize,
  filter,
  sort,
  currentPage,
}: GetVersionResourcesParams): string {
  const filterParam = filter
    ? `&${qs.stringify({ filter }, { allowDots: true, arrayFormat: "repeat" })}`
    : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  const paginationParam = currentPage.value ? `&${currentPage.value}` : "";

  return `/api/v2/desiredstate/${version}?limit=${pageSize.value}${filterParam}${sortParam}${paginationParam}`;
}
