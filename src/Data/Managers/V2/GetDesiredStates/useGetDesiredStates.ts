import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DateRange, IntRange, PageSize, Pagination } from "@/Core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  DesiredStateVersion,
  DesiredStateVersionStatus,
} from "@/Slices/DesiredState/Core/Domain";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";
import { getUrl } from "./getUrl";

export interface Filter {
  version?: IntRange.IntRange[];
  date?: DateRange.DateRange[];
  status?: DesiredStateVersionStatus[];
}

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
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<Result, Error>} returns.useOneTime - Fetch the instance with a single query.
 * @returns {UseQueryResult<Result, Error>} returns.useContinuous - Fetch the instance with a recursive query with an interval of 5s.
 */
export const useGetDesiredStates = (environment: string): GetDesiredStates => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchInstance = async (
    pageSize: PageSize.PageSize,
    filter: Filter,
    currentPage: CurrentPage,
  ): Promise<Result> => {
    const response = await fetch(
      baseUrl +
        getUrl({ pageSize, filter, currentPage, kind: "GetDesiredStates" }),
      {
        headers,
      },
    );

    await handleErrors(response, `Failed to fetch desired states`);

    return response.json();
  };

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
        queryFn: () => fetchInstance(pageSize, filter, currentPage),
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
        queryFn: () => fetchInstance(pageSize, filter, currentPage),
        refetchInterval: 5000,
      }),
  };
};
