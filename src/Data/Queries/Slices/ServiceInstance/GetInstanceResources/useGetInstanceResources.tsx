import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceResourceModel } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { CustomError, useGet, REFETCH_INTERVAL } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Return Signature of the useGetInstanceResources React Query
 */
interface getInstanceResources {
  useContinuous: () => UseQueryResult<InstanceResourceModel[], CustomError>;
}

/**
 * React Query hook to fetch the resources for given service instance
 *
 * @param {string} id - the service instance id
 * @param {string} serviceName - the service name
 * @param {string} version - the version of service instance
 *
 * @returns {getInstanceResources} An object containing the different available queries.
 * @returns {UseQueryResult<InstanceResourceModel[], CustomError>} returns.useContinuous - Fetch the service instance resources with a recursive query with an interval of 5s.
 */
export const useGetInstanceResources = (
  id: string,
  service_entity: string,
  version: string
): getInstanceResources => {
  const url = `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: InstanceResourceModel[] }>;
  const keyFactory = new KeyFactory(keySlices.serviceInstance, "get_instance_resources");

  return {
    useContinuous: (): UseQueryResult<InstanceResourceModel[], CustomError> =>
      useQuery({
        queryKey: keyFactory.single(id, [version, service_entity, env]),
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data): InstanceResourceModel[] => data.data,
      }),
  };
};
