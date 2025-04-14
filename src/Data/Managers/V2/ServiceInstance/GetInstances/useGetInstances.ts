import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Pagination, ServiceInstanceModelWithTargetStates } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { ServiceInstanceParams } from "@/Core/Domain/ServiceInstanceParams";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";
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
 * Return Signature of the useGetInstances React Query
 */
interface GetInstance {
  useOneTime: () => UseQueryResult<HookResponse, CustomError>;
  useContinuous: () => UseQueryResult<HookResponse, CustomError>;
}

/**
 * React Query hook to fetch all instances for given service entity.
 *
 * @param {string} serviceName  - the service entity serviceName
 * @param {string} instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useOneTime - Fetch the instances with a single query.
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch the instances with a recurrent query with an interval of 5s.
 */
export const useGetInstances = (
  serviceName: string,
  params: ServiceInstanceParams
): GetInstance => {
  const { filter, sort, pageSize, currentPage } = params;

  const url = getUrl({
    name: serviceName,
    sort,
    filter,
    pageSize,
    currentPage,
  });
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: ["get_instances-one_time", serviceName, filter, sort, pageSize, currentPage],
        queryFn: () => get(url),
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: ["get_instances-continuous", serviceName, filter, sort, pageSize, currentPage],
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
