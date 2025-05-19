import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, PageSize, Parameter, Sort } from "@/Core/Domain";
import { Handlers, Links, Metadata } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { SortKey } from "@/Slices/Parameters/Core/Query";
import { DependencyContext } from "@/UI/Dependency";
import { useGet, REFETCH_INTERVAL } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering parameters
 */
interface Filter {
  name?: string[];
  source?: string[];
  updated?: DateRange.Type[];
}

/**
 * Result interface for the parameters API response
 */
interface Result {
  data: Parameter[];
  links: Links;
  metadata: Metadata;
}

/**
 * Extended interface that includes pagination handlers for the resource response
 */
export interface GetParametersResponse extends Result {
  handlers: Handlers;
}

/**
 * Return signature of the useGetParameters React Query hook
 */
interface GetParameters {
  useContinuous: () => UseQueryResult<GetParametersResponse, Error>;
}

/**
 * Interface for parameters required to fetch parameters
 */
export interface GetParametersParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  sort?: Sort.Sort<SortKey>;
  currentPage: CurrentPage;
}

/**
 * React Query hook to fetch parameters
 *
 * @returns {GetParameters} An object containing the available queries
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useOneTime - Fetch the parameters with a single query
 * @returns {UseQueryResult<QueryResponse, Error>} returns.useContinuous - Fetch the parameters with a recurrent query with an interval of 5s
 */
export const useGetParameters = (params: GetParametersParams): GetParameters => {
  const { pageSize, filter, sort, currentPage } = params;
  const url = getUrl({
    pageSize,
    filter,
    sort,
    currentPage: currentPage || { kind: "CurrentPage", value: "" },
  });
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useContinuous: (): UseQueryResult<GetParametersResponse, Error> =>
      useQuery({
        queryKey: ["get_parameters-continuous", pageSize, filter, sort, currentPage, env],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
