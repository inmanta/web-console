import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "../../Helpers/Pagination/getPaginationHandlers";
import { useGet, REFETCH_INTERVAL } from "../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering discovered resources
 */
export interface DiscoveredResourceFilter {
  type?: string;
  name?: string;
  state?: string;
  environment?: string;
}

export interface DiscoveredResource {
  discovered_resource_id: string;
  managed_resource_uri: string | null;
  discovery_resource_uri: string | null;
  values: unknown;
}

export type SortKey = "discovered_resource_id";

export interface Filter {
  name?: string[];
  discovered_resource_id?: string[];
}

/**
 * Interface for parameters required to fetch discovered resources
 */
export interface GetDiscoveredResourcesParams {
  /** Optional filter criteria for resources */
  filter?: Filter;
  pageSize: PageSize.PageSize;
  currentPage: CurrentPage;
  sort?: {
    name: string;
    order: "asc" | "desc";
  };
}

/**
 * Interface for the raw API response body containing resource data and pagination info
 */
interface ResponseBody {
  data: DiscoveredResource[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * Extended interface that includes pagination handlers for the resource response
 */
export interface DiscoveredResourceResponse extends ResponseBody {
  handlers: Pagination.Handlers;
}

/**
 * Return signature of the useGetDiscoveredResources React Query hook
 */
interface GetDiscoveredResources {
  useContinuous: () => UseQueryResult<DiscoveredResourceResponse, Error>;
}

/**
 * React Query hook to fetch discovered resources
 *
 * @returns {GetDiscoveredResources} An object containing the available queries
 * @returns {UseQueryResult<DiscoveredResourceResponse, Error>} returns.useContinuous - Fetch the discovered resources with a recurrent query with an interval of 5s
 */
export const useGetDiscoveredResources = (
  params: GetDiscoveredResourcesParams
): GetDiscoveredResources => {
  const get = useGet()<ResponseBody>;

  return {
    useContinuous: (): UseQueryResult<DiscoveredResourceResponse, Error> =>
      useQuery({
        queryKey: [
          "get_discovered_resources-continuous",
          params.currentPage,
          params.sort,
          params.pageSize,
          params.filter,
        ],
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
