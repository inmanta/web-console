import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PageSize, Pagination, Sort } from "@/Core/Domain";
import { Handlers, Links } from "@/Core/Domain/Pagination/Pagination";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { Fact } from "@/Slices/Facts/Core/Domain";
import { SortKey } from "@/Slices/Facts/Core/Query";
import { useGet, REFETCH_INTERVAL } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * Interface for filtering facts
 */
interface Filter {
  name?: string[];
  resource_id?: string[];
}

/**
 * Interface for the API response containing the facts data
 */
interface Result {
  data: Fact[];
  links?: Links;
  metadata: Pagination.Metadata;
}

/**
 * Interface for the response after processing
 */
interface GetFactsResponse extends Result {
  handlers: Handlers;
}

/**
 * Parameters for the useGetFacts hook
 */
export interface GetFactsParams {
  pageSize: PageSize.PageSize;
  filter?: Filter;
  sort?: Sort.Sort<SortKey>;
  currentPage: CurrentPage;
}

/**
 * Return signature of the useGetFacts React Query hook
 */
interface GetFacts {
  useContinuous: () => UseQueryResult<GetFactsResponse, Error>;
}

/**
 * React Query hook to fetch facts
 *
 * @param {GetFactsParams} params - The parameters for the query
 * @returns {GetFacts} An object containing the available queries

 * @returns {UseQueryResult<GetFactsResponse, Error>} returns.useContinuous - Fetch the facts with a recurrent query with an interval of 5s
 */
export const useGetFacts = (params: GetFactsParams): GetFacts => {
  const get = useGet()<Result>;

  return {
    useContinuous: (): UseQueryResult<GetFactsResponse, Error> =>
      useQuery({
        queryKey: ["get_facts-one_time", ...Array.from(Object.values(params))],
        queryFn: () => get(getUrl(params)),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
