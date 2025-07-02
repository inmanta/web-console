import qs from "qs";
import { urlEncodeParams } from "@/Data/Queries";
import { GetDiscoveredResourcesParams } from "./useGetDiscoveredResources";

/**
 * Constructs a URL for fetching discovered resources
 *
 * @param {GetDiscoveredResourcesParams} params - The query parameters
 * @returns {string} The constructed URL
 */
export const getUrl = (params: GetDiscoveredResourcesParams): string => {
  const encodedParams = urlEncodeParams<GetDiscoveredResourcesParams>(params);

  const { filter, sort, pageSize, currentPage } = encodedParams;
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              discovered_resource_id: filter.discovered_resource_id,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/discovered?limit=${pageSize.value}${filterParam}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
};
