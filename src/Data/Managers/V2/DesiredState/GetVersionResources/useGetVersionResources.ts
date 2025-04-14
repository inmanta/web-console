import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core";
import { Resource } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { REFETCH_INTERVAL, useGet } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for the API response containing the resources data
 */
interface Result {
  data: Resource.FromVersion[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

/**
 * interface of Data that the useGetVersionResources React Query returns if successful
 */
interface QueryResponse extends Result {
  handlers: Pagination.Handlers;
}

/**
 * Interface for the parameters of the useGetVersionResources React Query hook
 */
export interface GetVersionResourcesParams {
  version: string;
  pageSize: PageSize.PageSize;
  filter?: Record<string, unknown>;
  sort?: { name: string; order: "asc" | "desc" };
  currentPage: CurrentPage;
}

/**
 * Return signature of the useGetVersionResources React Query hook
 */
interface GetVersionResources {
  useOneTime: () => UseQueryResult<QueryResponse, Error>;
  useContinuous: () => UseQueryResult<QueryResponse, Error>;
}

/**
 * React Query hook to fetch resources from a specific desired state version
 *
 * @returns {GetVersionResources} An object containing the available queries.
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useOneTime - Fetch the resources with a single query.
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useContinuous - Fetch the resources with a recurrent query with an interval of 5s.
 */
export const useGetVersionResources = ({
  version,
  pageSize,
  filter,
  sort,
  currentPage,
}: GetVersionResourcesParams): GetVersionResources => {
  const get = useGet()<Result>;
  const url = getUrl({
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  });
  return {
    useOneTime: (): UseQueryResult<QueryResponse, Error> =>
      useQuery({
        queryKey: ["get_version_resources-one_time", version, pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<QueryResponse, Error> =>
      useQuery({
        queryKey: [
          "get_version_resources-continuous",
          version,
          pageSize,
          filter,
          sort,
          currentPage,
        ],
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
