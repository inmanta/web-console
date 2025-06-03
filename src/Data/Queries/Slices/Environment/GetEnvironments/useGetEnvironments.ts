import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Environment } from "@/Core";
import { REFETCH_INTERVAL, useGetWithoutEnv, KeyFactory, SliceKeys } from "@/Data/Queries";

/**
 * Return Signature of the useGetEnvironments React Query
 */
interface GetEnvironments {
  useOneTime: (hasDetails?: boolean) => UseQueryResult<Environment[], Error>;
  useContinuous: (hasDetails?: boolean) => UseQueryResult<Environment[], Error>;
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
    useOneTime: (hasDetails = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: getEnvironmentsFactory.list([hasDetails]),
        queryFn: () => get(`/api/v2/environment?details=${hasDetails}`),
        retry: false,
        select: (data) => data.data,
      }),

    useContinuous: (hasDetails = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: getEnvironmentsFactory.list([hasDetails]),
        queryFn: () => get(`/api/v2/environment?details=${hasDetails}`),
        retry: false,
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};

export const getEnvironmentsFactory = new KeyFactory(SliceKeys.environment, "get_environments");
