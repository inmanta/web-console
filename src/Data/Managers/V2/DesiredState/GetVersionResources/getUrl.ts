import qs from "qs";
import { urlEncodeParams } from "../../helpers";
import { GetVersionResourcesParams } from "./useGetVersionResources";

/**
 * Constructs the URL for fetching resources from a specific desired state version
 *
 * @param query - The query parameters containing version, pagination, filter, and sort information
 * @returns The constructed URL for fetching the resources
 */
export function getUrl(params: GetVersionResourcesParams): string {
  const { version, filter, sort, pageSize, currentPage } =
    urlEncodeParams<GetVersionResourcesParams>(params);

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: {
              agent: filter.agent,
              resource_id_value: filter.value,
              resource_type: filter.type,
            },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/desiredstate/${version}?limit=${pageSize.value}${filterParam}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
}
