import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServerStatus } from "@/Core";
import { REFETCH_INTERVAL, useGetWithoutEnv } from "../../helpers";

/**
 * Return Signature of the useGetServerStatus React Query
 */
interface GetServerStatus {
  useOneTime: () => UseQueryResult<ServerStatus, Error>;
  useContinuous: () => UseQueryResult<ServerStatus, Error>;
}

/**
 * React Query hook for fetching server status.
 *
 * @returns {GetServerStatus} An object containing the different available queries.
 * @returns {UseQueryResult<ServerStatus, Error>} returns.useOneTime - Fetch server status with a single query.
 * @returns {UseQueryResult<ServerStatus, Error>} returns.useContinuous - Fetch server status with continuous polling.
 */
export const useGetServerStatus = (): GetServerStatus => {
  const get = useGetWithoutEnv()<{ data: ServerStatus }>;

  return {
    useOneTime: (): UseQueryResult<ServerStatus, Error> =>
      useQuery({
        queryKey: ["get_server_status-one_time"],
        queryFn: () => get("/api/v1/serverstatus"),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (): UseQueryResult<ServerStatus, Error> =>
      useQuery({
        queryKey: ["get_server_status-continuous"],
        queryFn: () => get("/api/v1/serverstatus"),
        retry: false,
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
