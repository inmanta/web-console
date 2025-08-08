import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, IntRange, PageSize, Pagination } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { CustomError, REFETCH_INTERVAL, useGet, getPaginationHandlers } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@/Slices/DesiredState/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { getDesiredStatesUrl } from "./getDesiredStatesUrl";

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

/**
 * interface of Data that the useGetDesiredStates React Query returns if successful
 */
interface QueryData extends Result {
  handlers: Pagination.Handlers;
}

/**
 * interface of Params of the useGetDesiredStates React Query
 */
export interface GetDesiredStatesParams {
  pageSize: PageSize.PageSize;
  filter: Filter;
  currentPage: CurrentPage;
}

/**
 * Return Signature of the useGetDesiredStates React Query
 */
interface GetDesiredStates {
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
 * @returns {UseQueryResult<QueryData, CustomError>} returns.useContinuous - Fetch the desired states with a recurrent query with an interval of 5s.
 */
export const useGetDesiredStates = (): GetDesiredStates => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useContinuous: (
      pageSize: PageSize.PageSize,
      filter: Filter,
      currentPage: CurrentPage
    ): UseQueryResult<QueryData, CustomError> =>
      useQuery({
        queryKey: getDesiredStatesKey.list([pageSize, ...Object.values(filter), currentPage, env]),
        queryFn: () => get(getDesiredStatesUrl({ pageSize, filter, currentPage })),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};

export const getDesiredStatesKey = new KeyFactory(SliceKeys.desiredState, "get_desired_state");
