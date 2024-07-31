import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModel {
  useOneTime: () => UseQueryResult<ServiceModel, Error>;
  useContinuous: () => UseQueryResult<ServiceModel, Error>;
}

/**
 * React Query hook to fetch the service model
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetServiceModel} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel, Error>} returns.useOneTime - Fetch the service model with a single query.
 * @returns {UseQueryResult<ServiceModel, Error>} returns.useContinuous - Fetch the service model with a recursive query with an interval of 5s.
 */
export const useGetServiceModel = (
  service: string,
  environment: string,
): GetServiceModel => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchInstance = async (): Promise<{ data: ServiceModel }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog/${service}`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch Service Model for: ${service}`,
    );

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<ServiceModel, Error> =>
      useQuery({
        queryKey: ["get_service_model-one_time", service],
        queryFn: fetchInstance,
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel, Error> =>
      useQuery({
        queryKey: ["get_service_model-continuous", service],
        queryFn: fetchInstance,
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
