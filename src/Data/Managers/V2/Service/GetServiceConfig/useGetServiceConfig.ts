import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Config } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, useGet } from "../../helpers";

/**
 * Return Signature of the useGetServiceConfig React Query
 */
interface GetServiceConfig {
  useOneTime: () => UseQueryResult<Config, CustomError>;
}

/**
 * React Query hook to fetch the service config
 *
 * @param service {string} - the service entity
 *
 * @returns {GetServiceConfig} An object containing the different available queries.
 * @returns {UseQueryResult<Config, CustomError>} returns.useOneTime - Fetch the service config with a single query.
 */
export const useGetServiceConfig = (service: string): GetServiceConfig => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: Config }>;
  const keyFactory = new KeyFactory(keySlices.service, "get_service_config");

  return {
    useOneTime: (): UseQueryResult<Config, CustomError> =>
      useQuery({
        queryKey: keyFactory.single(service, [env]),
        queryFn: () => get(`/lsm/v1/service_catalog/${service}/config`),
        select: (data) => data.data,
      }),
  };
};
