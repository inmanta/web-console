import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, IntRange, PageSize, Pagination } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@/Slices/DesiredState/Core/Domain";
import { CustomError, useGet } from "../../helpers";
import { getUrl } from "./getUrl";

/**
 * interface of filter object for desired states
 */
interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
}

/**
 * interface of Result of the useGetDesiredStates React Query
 */
interface Result {
  data: DesiredStateVersion[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

interface QueryData extends Result {
  handlers: Pagination.Handlers;
}
export interface GetDesiredStatesParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  currentPage: CurrentPage;
}

/**
 * Return Signature of the useGetDesiredStates React Query
 */
interface GetDesiredStates {
  useOneTime: (
    pageSize: PageSize.PageSize,
    filter: Filter,
    currentPage: CurrentPage
  ) => UseQueryResult<QueryData, CustomError>;
  useContinuous: (
    pageSize: PageSize.PageSize,
    filter: Filter,
    currentPage: CurrentPage
  ) => UseQueryResult<QueryData, CustomError>;
}

/**
 * React Query hook to fetch a list of desired States
 *
 * @returns {GetDesiredStates} An object containing the available queries.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useOneTime - Fetch the desired states with a single query.
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch the desired states with a recurrent query with an interval of 5s.
 */
export const useGetDesiredStates = (): GetDesiredStates => {
  const get = useGet()<Result>;

  return {
    useOneTime: (
      pageSize: PageSize.PageSize,
      filter: Filter,
      currentPage: CurrentPage
    ): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: ["get_desired_states-one_time", pageSize, filter, currentPage],
        queryFn: () => get(getUrl({ pageSize, filter, currentPage })),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (
      pageSize: PageSize.PageSize,
      filter: Filter,
      currentPage: CurrentPage
    ): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: ["get_desired_states-continuous", pageSize, filter, currentPage],
        queryFn: () => get(getUrl({ pageSize, filter, currentPage })),
        refetchInterval: 5000,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
