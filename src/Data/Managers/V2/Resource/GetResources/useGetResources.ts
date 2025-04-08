import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Resource, Sort } from "@/Core/Domain";
import { Handlers, Links } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { useGet } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering resources
 */
interface Filter {
  agent?: string[];
  status?: string[];
  type?: string[];
  value?: string[];
}

/**
 * Result interface for the resources API response
 */
interface Result {
  data: Resource.Resource[];
  links: Links;
  metadata: Resource.Metadata;
}
export interface GetResourcesResponse extends Result {
  handlers: Handlers;
}

/**
 * Return signature of the useGetResources React Query hook
 */
interface GetResources {
  useOneTime: () => UseQueryResult<GetResourcesResponse, Error>;
  useContinuous: () => UseQueryResult<GetResourcesResponse, Error>;
}

export interface GetResourcesParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  sort?: Sort.Type<Resource.SortKey>;
  currentPage: CurrentPage;
}

/**
 * React Query hook to fetch resources
 *
 * @returns {GetResources} An object containing the available queries
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useOneTime - Fetch the resources with a single query
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useContinuous - Fetch the resources with a recurrent query with an interval of 5s
 */
export const useGetResources = (params: GetResourcesParams): GetResources => {
  const { pageSize, filter, sort, currentPage } = params;
  const url = getUrl({
    pageSize,
    filter,
    sort,
    currentPage: currentPage || { kind: "CurrentPage", value: "" },
  });
  const get = useGet()<Result>;

  return {
    useOneTime: (): UseQueryResult<GetResourcesResponse, Error> =>
      useQuery({
        queryKey: ["get_resources-one_time", pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<GetResourcesResponse, Error> =>
      useQuery({
        queryKey: ["get_resources-continuous", pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: 5000,
      }),
  };
};
