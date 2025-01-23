import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * Return Signature of the useGetServiceModel React Query
 */
interface GetServiceModels {
  useOneTime: () => UseQueryResult<ServiceModel[], Error>;
  useContinuous: () => UseQueryResult<ServiceModel[], Error>;
}

/**
 * React Query hook to fetch the service models
 *
 * @param environment {string} - the environment in which the services belongs
 *
 * @returns {GetServiceModels} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useOneTime - Fetch the service models with a single query.
 * @returns {UseQueryResult<ServiceModel[], Error>} returns.useContinuous - Fetch the service models with an interval of 5s.
 */
export const useGetServiceModels = (environment: string): GetServiceModels => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchServices = async (): Promise<{ data: ServiceModel[] }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog?instance_summary=True`,
      {
        headers,
      },
    );

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
