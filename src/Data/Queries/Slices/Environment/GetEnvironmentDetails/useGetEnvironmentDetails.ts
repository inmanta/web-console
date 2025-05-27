import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Environment } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { useGetWithoutEnv, REFETCH_INTERVAL } from "@/Data/Queries";

/**
 * Return Signature of the useGetEnvironmentDetails React Query
 */
interface GetEnvironmentDetails {
  useOneTime: (id: string) => UseQueryResult<Environment, Error>;
  useContinuous: (id: string) => UseQueryResult<Environment, Error>;
}

/**
 * React Query hook for fetching environment details.
 *
 * @returns {GetEnvironmentDetails} An object containing the different available queries.
 * @returns {UseQueryResult<Environment, Error>} returns.useOneTime - Fetch environment details with a single query.
 */
export const useGetEnvironmentDetails = (): GetEnvironmentDetails => {
  const get = useGetWithoutEnv()<{ data: Environment }>;

  const keyFactory = new KeyFactory(keySlices.environment, "get_environment_details");

  return {
    useOneTime: (id: string): UseQueryResult<Environment, Error> =>
      useQuery({
        queryKey: keyFactory.single(id),
        queryFn: () => get(`/api/v2/environment/${id}?details=true`),
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (id: string): UseQueryResult<Environment, Error> =>
      useQuery({
        queryKey: keyFactory.single(id),
        queryFn: () => get(`/api/v2/environment/${id}?details=true`),
        retry: false,
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
