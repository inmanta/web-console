import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination } from "@/Core";
import { Resource } from "@/Core/Domain";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { DependencyContext } from "@/UI/Dependency";
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
  useContinuous: () => UseQueryResult<QueryResponse, Error>;
}

/**
 * React Query hook to fetch resources from a specific desired state version
 *
 * @returns {GetVersionResources} An object containing the available queries.
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useContinuous - Fetch the resources with a recurrent query with an interval of 5s.
 */
export const useGetVersionResources = ({
  version,
  pageSize,
  filter,
  sort,
  currentPage,
}: GetVersionResourcesParams): GetVersionResources => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;
  const url = getUrl({
    version,
    pageSize,
    filter,
    sort,
    currentPage,
  });
  return {
    useContinuous: (): UseQueryResult<QueryResponse, Error> =>
      useQuery({
        queryKey: [
          "get_version_resources-continuous",
          version,
          pageSize,
          filter,
          sort,
          currentPage,
          env,
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
