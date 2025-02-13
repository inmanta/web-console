import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, IntRange, PageSize, Pagination } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  DesiredStateVersion,
  DesiredStateVersionStatus,
} from "@/Slices/DesiredState/Core/Domain";
import { useGet } from "../../helpers";
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

/**
 * Return Signature of the useGetDesiredStates React Query
 */
interface GetDesiredStates {
  useOneTime: (
    pageSize: PageSize.PageSize,
    filter: Filter,
    currentPage: CurrentPage,
  ) => UseQueryResult<Result, Error>;
  useContinuous: (
    pageSize: PageSize.PageSize,
    filter: Filter,
    currentPage: CurrentPage,
  ) => UseQueryResult<Result, Error>;
}

/**
 * React Query hook to fetch a list of desired States
 *
 * @returns {GetDesiredStates} An object containing the available queries.
 * @returns {UseQueryResult<Result, Error>} returns.useOneTime - Fetch the desired states with a single query.
 * @returns {UseQueryResult<Result, Error>} returns.useContinuous - Fetch the desired states with a recurrent query with an interval of 5s.
 */
export const useGetDesiredStates = (): GetDesiredStates => {
  const get = useGet()<Result>;

  return {
    useOneTime: (
      pageSize: PageSize.PageSize,
      filter: Filter,
      currentPage: CurrentPage,
    ): UseQueryResult<Result, Error> =>
      useQuery({
        queryKey: [
          "get_desired_states-one_time",
          pageSize,
          filter,
          currentPage,
        ],
        queryFn: () =>
          get(
            getUrl({ pageSize, filter, currentPage, kind: "GetDesiredStates" }),
          ),
        retry: false,
      }),
    useContinuous: (
      pageSize: PageSize.PageSize,
      filter: Filter,
      currentPage: CurrentPage,
    ): UseQueryResult<Result, Error> =>
      useQuery({
        queryKey: [
          "get_desired_states-continuous",
          pageSize,
          filter,
          currentPage,
        ],
        queryFn: () =>
          get(
            getUrl({ pageSize, filter, currentPage, kind: "GetDesiredStates" }),
          ),
        refetchInterval: 5000,
      }),
  };
};
