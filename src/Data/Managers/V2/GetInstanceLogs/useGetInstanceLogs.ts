import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Return Signature of the useGetInstanceLogs React Query
 */
interface GetInstanceLogs {
  useOneTime: () => UseQueryResult<InstanceLog[], Error>;
  useContinuous: () => UseQueryResult<InstanceLog[], Error>;
}

/**
 * React Query hook to fetch a the history logs for an instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetInstanceLogs} An object containing the different available queries.
 * @returns {UseQueryResult<InstanceLog[], Error>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseQueryResult<InstanceLog[], Error>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInstanceLogs = (
  service: string,
  instance: string,
  environment: string,
): GetInstanceLogs => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchInstance = async (): Promise<{ data: InstanceLog[] }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instance}/log`,
      {
        headers,
      },
    );

    await handleErrors(response, `Failed to fetch logs for: ${instance}`);

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
