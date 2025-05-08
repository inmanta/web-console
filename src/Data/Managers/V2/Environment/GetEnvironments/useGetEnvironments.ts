import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Environment } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { REFETCH_INTERVAL, useGetWithoutEnv } from "../../helpers";

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
  const { environmentHandler } = useContext(DependencyContext);
  const get = useGetWithoutEnv()<{ data: Environment[] }>;

  return {
    useOneTime: (hasDetails = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: ["get_environments-one_time", hasDetails],
        queryFn: () => get(`/api/v2/environment?details=${hasDetails}`),
        retry: false,
        select: (data) => {
          environmentHandler.setAllEnvironments(data.data);
          return data.data;
        },
      }),

    useContinuous: (hasDetails = false): UseQueryResult<Environment[], Error> =>
      useQuery({
        queryKey: ["get_environments-continuous", hasDetails],
        queryFn: () => get(`/api/v2/environment?details=${hasDetails}`),
        retry: false,
        select: (data) => {
          environmentHandler.setAllEnvironments(data.data);
          return data.data;
        },
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
