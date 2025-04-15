import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, PageSize, Parameter, Sort } from "@/Core/Domain";
import { Handlers, Links, Metadata } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { SortKey } from "@/Slices/Parameters/Core/Query";
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
export interface GetParametersResponse extends Result {
  handlers: Handlers;
}

/**
 * Return signature of the useGetParameters React Query hook
 */
interface GetParameters {
  useContinuous: () => UseQueryResult<GetParametersResponse, Error>;
}

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
  const get = useGet()<Result>;

  return {
    useContinuous: (): UseQueryResult<GetParametersResponse, Error> =>
      useQuery({
        queryKey: ["get_parameters-continuous", pageSize, filter, sort, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
