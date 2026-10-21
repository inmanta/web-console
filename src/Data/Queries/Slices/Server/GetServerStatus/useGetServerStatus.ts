import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { ServerStatus } from "@/Core";
import { CustomError, REFETCH_INTERVAL, useGetWithoutEnv } from "@/Data/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";

/**
 * Return Signature of the useGetServerStatus React Query
 */
interface GetServerStatus {
  useOneTime: () => UseQueryResult<ServerStatus, CustomError>;
  useContinuous: () => UseQueryResult<ServerStatus, CustomError>;
}

/**
 * React Query hook for fetching server status.
 *
 * @returns {GetServerStatus} An object containing the different available queries.
 * @returns {UseQueryResult<ServerStatus, CustomError>} returns.useOneTime - Fetch server status with a single query.
 * @returns {UseQueryResult<ServerStatus, CustomError>} returns.useContinuous - Fetch server status with continuous polling.
 */
export const useGetServerStatus = (): GetServerStatus => {
  const get = useGetWithoutEnv()<{ data: ServerStatus }>;

  return {
    useOneTime: (): UseQueryResult<ServerStatus, CustomError> =>
      useQuery({
        queryKey: getServerStatusKey.root(),
        queryFn: () => get("/api/v1/serverstatus"),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (): UseQueryResult<ServerStatus, CustomError> =>
      useQuery({
        queryKey: getServerStatusKey.root(),
        queryFn: () => get("/api/v1/serverstatus"),
        retry: false,
        select: (data) => data.data,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
  };
};

export const getServerStatusKey = new KeyFactory(SliceKeys.server, "get_server_status");
