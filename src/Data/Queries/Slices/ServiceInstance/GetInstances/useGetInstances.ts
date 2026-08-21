import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { Pagination, ServiceInstanceModelWithTargetStates } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { ServiceInstanceParams } from "@/Core/Domain/ServiceInstanceParams";
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

  /**
   * Whether the query is allowed to run. Defaults to true.
   */
  enabled?: boolean;
}

/**
 * Return Signature of the useGetInstances React Query
 */
interface GetInstance {
  useContinuous: (options?: UseContinuousOptions) => UseQueryResult<HookResponse, CustomError>;
}

/**
 * React Query hook to fetch all instances for given service entity.
 *
 * @param {string} serviceName  - the service entity serviceName
 * @param {string} instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch the instances with a recurrent query with an interval of 5s.
 */
export const useGetInstances = (
  serviceName: string,
  params: ServiceInstanceParams
): GetInstance => {
  const { filter, sort, pageSize, currentPage } = params;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const url = getUrl({
    name: serviceName,
    sort,
    filter,
    pageSize,
    currentPage,
  });
  const get = useGet(env)<ResponseBody>;

  const filterArray = filter ? Object.values(filter) : [];
  const sortArray = sort ? [sort.name, sort.order] : [];

  return {
    useContinuous: (options): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: getInstanceKey.list([
          serviceName,
          ...filterArray,
          ...sortArray,
          pageSize,
          currentPage,
          env,
        ]),
        queryFn: () => get(url),
        enabled: options?.enabled ?? true,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
        placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
      }),
  };
};
