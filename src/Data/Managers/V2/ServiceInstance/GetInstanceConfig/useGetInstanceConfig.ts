import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Config } from "@/Core";
import { CustomError, useGet, REFETCH_INTERVAL } from "../../helpers";

/**
 * Return Signature of the useGetInstanceConfig React Query
 */
interface GetInstanceConfig {
  useOneTime: () => UseQueryResult<Config, CustomError>;
  useContinuous: () => UseQueryResult<Config, CustomError>;
}

/**
 * React Query hook to fetch the configuration for an instance
 *
 * @param {string} service - the service entity
 * @param {string} id - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstanceConfig} An object containing the different available queries.
 * @returns {UseQueryResult<Config, CustomError>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseQueryResult<Config, CustomError>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInstanceConfig = (service: string, id: string): GetInstanceConfig => {
  const url = `/lsm/v1/service_inventory/${service}/${id}/config`;
  const get = useGet()<{ data: Config }>;

  return {
    useOneTime: (): UseQueryResult<Config, CustomError> =>
      useQuery({
        queryKey: ["get_instance_config-one_time", service, id],
        queryFn: () => get(url),
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<Config, CustomError> =>
      useQuery({
        queryKey: ["get_instance_config-continuous", service, id],
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data.data,
      }),
  };
};
