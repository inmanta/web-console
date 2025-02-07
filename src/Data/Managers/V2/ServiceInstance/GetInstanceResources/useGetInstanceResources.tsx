import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceResourceModel } from "@/Core";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetInstanceResources React Query
 */
interface getInstanceResources {
  useOneTime: () => UseQueryResult<InstanceResourceModel[], Error>;
  useContinuous: () => UseQueryResult<InstanceResourceModel[], Error>;
}

/**
 * React Query hook to fetch the resources for given service instance
 *
 * @param {string} id - the service instance id
 * @param {string} serviceName - the service name
 * @param {string} version - the version of service instance
 *
 * @returns {getInstanceResources} An object containing the different available queries.
 * @returns {UseQueryResult<InstanceResourceModel[], Error>} returns.useOneTime - Fetch the service instance resources ies as a single query.
 * @returns {UseQueryResult<InstanceResourceModel[], Error>} returns.useContinuous - Fetch the service instance resources with a recursive query with an interval of 5s.
 */
export const useGetInstanceResources = (
  id: string,
  service_entity: string,
  version: string,
): getInstanceResources => {
  const url = `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`;
  const get = useGet()<{ data: InstanceResourceModel[] }>;

  return {
    useOneTime: (): UseQueryResult<InstanceResourceModel[], Error> =>
      useQuery({
        queryKey: ["get_instance_resources-one_time", id],
        queryFn: () => get(url),
        retry: false,
      }),
    useContinuous: (): UseQueryResult<InstanceResourceModel[], Error> =>
      useQuery({
        queryKey: ["get_instance_resources-continuous", id],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data): InstanceResourceModel[] => data.data,
        retry: false,
      }),
  };
};
