import qs from "qs";
import { Sort } from "@/Core";
import { urlEncodeParams } from "@/Data/Queries";
import { GetAgentsInfiniteParams, GetAgentsParams } from "./useGetAgents";

/**
 * Constructs a URL for fetching agents.
 *
 * Supports both cursor-based infinite scroll and standard paginated requests.
 * When a cursor is provided it takes precedence over any currentPage value in params.
 *
 * @param {GetAgentsParams | GetAgentsInfiniteParams} params - The query parameters.
 * @param {PageSize.PageSize} params.pageSize - The number of agents to fetch per page.
 * @param {Filter} [params.filter] - Optional filter criteria (name, process_name, status).
 * @param {Sort.Sort} [params.sort] - Optional sort field and direction.
 * @param {CurrentPage} [params.currentPage] - Current page cursor, only present on GetAgentsParams.
 * @param {string} [cursor] - Explicit start cursor for infinite scroll pagination.
 *   When provided, appended as `&start={cursor}`, overriding any currentPage value.
 * @returns {string} The constructed API URL.
 *
 * @example
 * // Standard paginated request
 * getUrl({ pageSize: { kind: "PageSize", value: "20" }, currentPage: { kind: "CurrentPage", value: "" } })
 * // → "/api/v2/agents?limit=20"
 *
 * @example
 * // Infinite scroll — second page
 * getUrl({ pageSize: { kind: "PageSize", value: "20" } }, "some-agent-name")
 * // → "/api/v2/agents?limit=20&start=some-agent-name"
 */

export function getUrl(params: GetAgentsParams | GetAgentsInfiniteParams, cursor?: string): string {
  const { pageSize, sort, filter } = urlEncodeParams<GetAgentsParams | GetAgentsInfiniteParams>(
    params
  );

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
          {
            filter: { name: filter.name, process_name: filter.process_name, status: filter.status },
          },
          { allowDots: true, arrayFormat: "repeat" }
        )}`
      : "";
  const sortParam = sort ? `&sort=${Sort.serialize(sort)}` : "";

  let cursorParam = "";
  if (cursor) {
    cursorParam = `&start=${cursor}`;
  } else if ("currentPage" in params && params.currentPage.value) {
    cursorParam = `&${params.currentPage.value}`;
  }

  return `/api/v2/agents?limit=${pageSize.value}${filterParam}${sortParam}${cursorParam}`;
}
