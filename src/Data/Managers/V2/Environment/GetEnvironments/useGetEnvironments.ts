import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Environment } from "@/Core";
import { useGetWithoutEnv } from "../../helpers";

/**
 * Return Signature of the useGetEnvironments React Query
 */
interface GetEnvironments {
  useOneTime: (details?: boolean) => UseQueryResult<Environment[], Error>;
  useContinuous: (details?: boolean) => UseQueryResult<Environment[], Error>;
}

/**
 * React Query hook for fetching environments.
 *
 * @returns {GetEnvironments} An object containing the different available queries.
 * @returns {UseQueryResult<Environment[], Error>} returns.useOneTime - Fetch environments with a single query.
 * @returns {UseQueryResult<Environment[], Error>} returns.useContinuous - Fetch environments with continuous polling.
 */
export const useGetEnvironments = (): GetEnvironments => {
  const get = useGetWithoutEnv()<{ data: Environment[] }>;

  return {
    useOneTime: (details = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: ["get_environments-one_time", details],
        queryFn: () => get(`/api/v2/environment?details=${details}`),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (details = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: ["get_environments-continuous", details],
        queryFn: () => get(`/api/v2/environment?details=${details}`),
        retry: false,
        select: (data) => data.data,
        refetchInterval: 5000,
      }),
  };
};
