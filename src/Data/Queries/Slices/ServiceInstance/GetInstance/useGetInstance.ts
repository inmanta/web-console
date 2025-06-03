import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL, KeyFactory, SliceKeys } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetInstance {
  useOneTime: () => UseQueryResult<ServiceInstanceModel, CustomError>;
  useContinuous: () => UseQueryResult<ServiceInstanceModel, CustomError>;
}

/**
 * React Query hook to fetch a single instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, CustomError>} returns.useOneTime - Fetch the instance with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, CustomError>} returns.useContinuous - Fetch the instance with a recursive query with an interval of 5s.
 */
export const useGetInstance = (service: string, instanceId: string): GetInstance => {
  const url = `/lsm/v1/service_inventory/${service}/${instanceId}?include_deployment_progress=true`;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: ServiceInstanceModel }>;

  return {
    useOneTime: (): UseQueryResult<ServiceInstanceModel, CustomError> =>
      useQuery({
        queryKey: getInstanceFactory.single(instanceId, [service, env]),
        queryFn: () => get(url),
        select: (data): ServiceInstanceModel => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceInstanceModel, CustomError> =>
      useQuery({
        queryKey: getInstanceFactory.single(instanceId, [service, env]),
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data): ServiceInstanceModel => data.data,
      }),
  };
};

export const getInstanceFactory = new KeyFactory(SliceKeys.serviceInstance, "get_instance");
