import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Config } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

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
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetServiceConfig} An object containing the different available queries.
 * @returns {UseQueryResult<Config, Error>} returns.useOneTime - Fetch the service model with a single query.
 * @returns {UseQueryResult<Config, Error>} returns.useContinuous - Fetch the service model with a recursive query with an interval of 5s.
 */
export const useGetServiceConfig = (
  service: string,
  environment: string,
): GetServiceConfig => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchInstance = async (): Promise<{ data: Config }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog/${service}/config`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch Service Config for: ${service}`,
    );

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<Config, Error> =>
      useQuery({
        queryKey: ["get_service_config-one_time", service],
        queryFn: fetchInstance,
        retry: false,
        select: (data) => data.data,
      }),
  };
};
