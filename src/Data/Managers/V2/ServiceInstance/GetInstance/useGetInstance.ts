import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetInstance {
  useOneTime: () => UseQueryResult<ServiceInstanceModel, Error>;
  useContinuous: () => UseQueryResult<ServiceInstanceModel, Error>;
}

/**
 * React Query hook to fetch a single instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the instance with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useContinuous - Fetch the instance with a recursive query with an interval of 5s.
 */
export const useGetInstance = (
  service: string,
  instanceId: string,
): GetInstance => {
  const url = `/lsm/v1/service_inventory/${service}/${instanceId}?include_deployment_progress=true`;
  const get = useGet()<{ data: ServiceInstanceModel }>;

  return {
    useOneTime: (): UseQueryResult<ServiceInstanceModel, Error> =>
      useQuery({
        queryKey: ["get_instance-one_time", service, instanceId],
        queryFn: () => get(url),
        retry: false,
        select: (data): ServiceInstanceModel => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceInstanceModel, Error> =>
      useQuery({
        queryKey: ["get_instance-continuous", service, instanceId],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data): ServiceInstanceModel => data.data,
      }),
  };
};
