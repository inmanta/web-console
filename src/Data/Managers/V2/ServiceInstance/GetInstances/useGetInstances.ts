import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Pagination, ServiceInstanceModelWithTargetStates } from "@/Core";
import { Handlers } from "@/Core/Domain/Pagination/Pagination";
import { ServiceInstanceParams } from "@/Core/Domain/ServiceInstanceParams";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
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
  useContinuous: () => UseQueryResult<HookResponse, CustomError>;
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
  const keyFactory = new KeyFactory(keySlices.serviceInstance, "get_instance");

  const filterArray = filter ? Object.values(filter) : [];
  const sortArray = sort ? [sort.name, sort.order] : [];

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: keyFactory.list([
          serviceName,
          ...filterArray,
          ...sortArray,
          pageSize,
          currentPage,
          env,
        ]),
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => ({
          ...data,
          handlers: getPaginationHandlers(data.links, data.metadata),
        }),
      }),
  };
};
