import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * React Query hook to fetch a the history logs for an instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {object} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInstanceLogs = (
  service: string,
  instance: string,
  environment: string,
) => {
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // /lsm/v1/service_inventory/{service_entity}/{service_id}/log
  const fetchInstance = async (): Promise<{ data: InstanceLog[] }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instance}/log`,
      {
        headers,
      },
    );

    handleAuthorization(response);

    if (!response.ok) {
      throw new Error("Failed to fetch instance logs");
    }

    return response.json();
  };

  return {
    useOneTime: (): UseQueryResult<InstanceLog[], Error> =>
      useQuery({
        queryKey: ["get_instance_logs-one_time", service, instance],
        queryFn: fetchInstance,
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<InstanceLog[], Error> =>
      useQuery({
        queryKey: ["get_instance_logs-continuous", service, instance],
        queryFn: fetchInstance,
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
