import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Config } from "@/Core";
import { useGet } from "../../helpers/useQueries";

/**
 * Return Signature of the useGetServiceConfig React Query
 */
interface GetServiceConfig {
  useOneTime: () => UseQueryResult<Config, Error>;
}

/**
 * React Query hook to fetch the service config
 *
 * @param service {string} - the service entity
 *
 * @returns {GetServiceConfig} An object containing the different available queries.
 * @returns {UseQueryResult<Config, Error>} returns.useOneTime - Fetch the service config with a single query.
 */
export const useGetServiceConfig = (service: string): GetServiceConfig => {
  const get = useGet()<{ data: Config }>;

  return {
    useOneTime: (): UseQueryResult<Config, Error> =>
      useQuery({
        queryKey: ["get_service_config-one_time", service],
        queryFn: () => get(`/lsm/v1/service_catalog/${service}/config`),
        retry: false,
        select: (data) => data.data,
      }),
  };
};
