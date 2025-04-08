import qs from "qs";
import { GetResourcesParams } from "./useGetResources";

/**
 * Constructs a URL for fetching resources with filtering, sorting, and pagination
 *
 * @param {Query.SubQuery<"GetResources">} query - The query parameters
 * @returns {string} The constructed URL
 */
export const getUrl = ({ filter, pageSize, sort, currentPage }: GetResourcesParams): string => {
  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              agent: filter.agent,
              status: filter.status,
              resource_type: filter.type,
              resource_id_value: filter.value,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/resource?deploy_summary=True&limit=${pageSize.value}${filterParam}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
};
