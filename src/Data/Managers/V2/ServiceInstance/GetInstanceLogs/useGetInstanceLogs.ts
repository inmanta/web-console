import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { useGet } from "../../helpers";

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
 *
 * @returns {GetInstanceLogs} An object containing the different available queries.
 * @returns {UseQueryResult<InstanceLog[], Error>} returns.useOneTime - Fetch the logs with a single query.
 * @returns {UseQueryResult<InstanceLog[], Error>} returns.useContinuous - Fetch the logs with a recursive query with an interval of 5s.
 */
export const useGetInstanceLogs = (
  service: string,
  instance: string,
): GetInstanceLogs => {
  const url = `/lsm/v1/service_inventory/${service}/${instance}/log`;
  const get = useGet()<{ data: InstanceLog[] }>;

  return {
    useOneTime: (): UseQueryResult<InstanceLog[], Error> =>
      useQuery({
        queryKey: ["get_instance_logs-one_time", service, instance],
        queryFn: () => get(url),
        select: (data) => data.data,
      }),
    useContinuous: (): UseQueryResult<InstanceLog[], Error> =>
      useQuery({
        queryKey: ["get_instance_logs-continuous", service, instance],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
