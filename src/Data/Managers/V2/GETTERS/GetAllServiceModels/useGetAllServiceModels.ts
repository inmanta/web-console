import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * Return Signature of the useGetAllServiceModels React Query
 */
interface useGetAllServiceModels {
  useOneTime: () => UseQueryResult<ServiceModel[], Error>;
  useContinuous: () => UseQueryResult<ServiceModel[], Error>;
}

/**
 * React Query hook to fetch all the service models available in the given environment.
 *
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {useGetAllServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useOneTime - Fetch the service models with a single query.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useContinuous - Fetch the service models with a recursive query with an interval of 5s.
 */
export const useGetAllServiceModels = (
  environment: string,
): useGetAllServiceModels => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Fetches all service models from the service catalog.
   *
   * @returns {Promise<{ data: ServiceModel[] }>} A promise that resolves to an object containing an array of service models.
   * @throws Will throw an error if the fetch operation fails.
   */
  const fetchServices = async (): Promise<{ data: ServiceModel[] }> => {
    const response = await fetch(`${baseUrl}/lsm/v1/service_catalog`, {
      headers,
    });

    await handleErrors(response, `Failed to fetch Service Models`);

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<ServiceModel[], Error> =>
      useQuery({
        queryKey: ["get_service_models-one_time"],
        queryFn: fetchServices,
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceModel[], Error> =>
      useQuery({
        queryKey: ["get_service_models-continuous"],
        queryFn: fetchServices,
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
