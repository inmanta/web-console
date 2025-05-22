import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Config } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, useGet } from "@/Data/Queries/Helpers";

/**
 * Return Signature of the useGetInstanceConfig React Query
 */
interface GetInstanceConfig {
  useOneTime: () => UseQueryResult<Config, CustomError>;
}

/**
 * React Query hook to fetch the configuration for an instance
 *
 * @param {string} service - the service entity
 * @param {string} id - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstanceConfig} An object containing the different available queries.
 * @returns {UseQueryResult<Config, CustomError>} returns.useOneTime - Fetch the logs with a single query.
 */
export const useGetInstanceConfig = (service: string, id: string): GetInstanceConfig => {
  const url = `/lsm/v1/service_inventory/${service}/${id}/config`;
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: Config }>;

  return {
    useOneTime: (): UseQueryResult<Config, CustomError> =>
      useQuery({
        queryKey: ["get_instance_config-one_time", service, id, env],
        queryFn: () => get(url),
        select: (data) => data.data,
      }),
  };
};
