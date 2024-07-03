import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServiceInstanceModel } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetInstance {
  useOneTime: () => UseQueryResult<ServiceInstanceModel, Error>;
  useContinuous: () => UseQueryResult<ServiceInstanceModel, Error>;
}

/**
 * React Query hook to fetch a single instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {object} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the instance with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useContinuous - Fetch the instance with a recursive query with an interval of 5s.
 */
export const useGetInstance = (
  service: string,
  instanceId: string,
  environment: string,
): GetInstance => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // /lsm/v1/service_inventory/{service_entity}/{service_id}
  const fetchInstance = async (): Promise<{ data: ServiceInstanceModel }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instanceId}`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch instance for id: ${instanceId}`,
    );

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<ServiceInstanceModel, Error> =>
      useQuery({
        queryKey: ["get_instance-one_time", service, instanceId],
        queryFn: fetchInstance,
        retry: false,
        select: (data): ServiceInstanceModel => data.data,
      }),
    useContinuous: (): UseQueryResult<ServiceInstanceModel, Error> =>
      useQuery({
        queryKey: ["get_instance-continuous", service, instanceId],
        queryFn: fetchInstance,
        refetchInterval: 5000,
        select: (data): ServiceInstanceModel => data.data,
      }),
  };
};
