import { useContext } from "react";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseQueryResult,
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { Pagination, ServiceInstanceModelWithTargetStates } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import {
  ServiceInstanceInfiniteParams,
  ServiceInstanceParams,
} from "@/Core/Domain/ServiceInstanceParams";
import { CustomError, useGet, REFETCH_INTERVAL, getPaginationHandlers } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { getInstanceKey } from "../GetInstance";
import { getUrl } from "./getUrl";

interface ResponseBody {
  data: ServiceInstanceModelWithTargetStates[];
  links?: Pagination.Links;
  metadata: Pagination.Metadata;
}

interface HookResponse {
  data: ServiceInstanceModelWithTargetStates[];
  handlers: Handlers;
  metadata: Pagination.Metadata;
}

/**
 * Options for the useContinuous query.
 */
interface UseContinuousOptions {
  /**
   * Keep the previous data visible while the next query loads (e.g. after a filter or page change),
   * avoiding a flash to the loading state. Suited to a paginated table, but not to a typeahead where
   * the previous results should clear on every keystroke.
   */
  keepPreviousData?: boolean;
}

/**
 * Options for the useInfiniteScroll query.
 */
interface UseInfiniteScrollOptions {
  /**
   * Whether the query is allowed to run. Defaults to true.
   */
  enabled?: boolean;
}

/**
 * Return Signature of the useGetInstances React Query
 */
interface GetInstance {
  useContinuous: (
    params: ServiceInstanceParams,
    options?: UseContinuousOptions
  ) => UseQueryResult<HookResponse, CustomError>;
  useInfiniteScroll: (
    params: ServiceInstanceInfiniteParams,
    options?: UseInfiniteScrollOptions
  ) => UseInfiniteQueryResult<InfiniteData<ResponseBody>, CustomError>;
}

/**
 * React Query hook to fetch all instances for a given service entity. Each query variant takes its
 * own params, so useInfiniteScroll (which manages its own cursor) is not forced to pass a currentPage.
 *
 * @param {string} serviceName - the service entity name
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch the instances with a recurrent query with an interval of 5s.
 * @returns {UseInfiniteQueryResult<InfiniteData<ResponseBody>, CustomError>} returns.useInfiniteScroll - Fetch the instances page by page (cursor-based), for a typeahead that loads more on scroll.
 */
export const useGetInstances = (serviceName: string): GetInstance => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;

  const select = (data: ResponseBody): HookResponse => ({
    ...data,
    handlers: getPaginationHandlers(data.links, data.metadata),
  });

  return {
    useContinuous: (params, options): UseQueryResult<HookResponse, CustomError> => {
      const { filter, sort, pageSize, currentPage } = params;
      const filterArray = filter ? Object.values(filter) : [];
      const sortArray = sort ? [sort.name, sort.order] : [];

      return useQuery({
        queryKey: getInstanceKey.list([
          serviceName,
          ...filterArray,
          ...sortArray,
          pageSize,
          currentPage,
          env,
        ]),
        queryFn: () => get(getUrl({ name: serviceName, sort, filter, pageSize, currentPage })),
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select,
        placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
      });
    },
    useInfiniteScroll: (
      params,
      options
    ): UseInfiniteQueryResult<InfiniteData<ResponseBody>, CustomError> => {
      const { filter, sort, pageSize } = params;
      const filterArray = filter ? Object.values(filter) : [];
      const sortArray = sort ? [sort.name, sort.order] : [];

      return useInfiniteQuery({
        // Distinct from the useContinuous key: an infinite query caches an InfiniteData<pages> shape,
        // so it must not share a cache entry with the plain useContinuous query.
        queryKey: getInstanceKey.list([
          "infinite",
          serviceName,
          ...filterArray,
          ...sortArray,
          pageSize,
          env,
        ]),
        queryFn: ({ pageParam }) =>
          get(
            getUrl({
              name: serviceName,
              sort,
              filter,
              pageSize,
              currentPage: { kind: "CurrentPage", value: pageParam },
            })
          ),
        initialPageParam: "",
        enabled: options?.enabled ?? true,
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) =>
          getPaginationHandlers(lastPage.links, lastPage.metadata).next || undefined,
      });
    },
  };
};
