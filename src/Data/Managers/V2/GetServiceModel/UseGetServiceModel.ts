import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * React Query hook to fetch the service model
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {object} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the service model with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useContinuous - Fetch the service model with a recursive query with an interval of 5s.
 */
export const useGetServiceModel = (service: string, environment: string) => {
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // /lsm/v1/service_catalog/{service_entity}
  const fetchInstance = async (): Promise<{ data: ServiceModel }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog/${service}`,
      {
        headers,
      },
    );

    handleAuthorization(response);

    if (!response.ok) {
      throw new Error(`"Failed to fetch Service Model for: ${service}`);
    }

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
