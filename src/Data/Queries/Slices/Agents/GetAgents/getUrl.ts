import qs from "qs";
import { Sort } from "@/Core";
import { urlEncodeParams } from "@/Data/Queries";
import { GetAgentsParams } from "./useGetAgents";

/**
 * Constructs a URL for fetching agents
 *
 * @param {GetAgentsParams} params - The query parameters
 * @returns {string} The constructed URL
 */
export function getUrl(params: GetAgentsParams): string {
  const { pageSize, sort, filter, currentPage } = urlEncodeParams<GetAgentsParams>(params);

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
        {
          filter: {
            name: filter.name,
            process_name: filter.process_name,
            status: filter.status,
          },
        },
        { allowDots: true, arrayFormat: "repeat" }
      )}`
      : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";

  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}${currentPage.value ? `&${currentPage.value}` : ""
    }`;
}
