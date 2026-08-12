import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { useFetchHelpers } from "@/Data/Queries/Helpers/useFetchHelpers";
import { PrimaryBaseUrlManager } from "@/UI";

/**
 * Return Signature of the useGetHealth React Query
 */
interface GetHealth {
  useContinuous: () => UseQueryResult<boolean, Error>;
}

/**
 * React Query hook for polling the server health endpoint.
 * Does not require authentication. Only the response status matters, the body is ignored.
 *
 * @returns {GetHealth} An object containing the different available queries.
 * @returns {UseQueryResult<boolean, Error>} returns.useContinuous - Poll the health endpoint every REFETCH_INTERVAL.
 */
export const useGetHealth = (): GetHealth => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const getHealth = async (): Promise<boolean> => {
    const baseUrlManager = new PrimaryBaseUrlManager(
      globalThis.location.origin,
      globalThis.location.pathname
    );
    const response = await fetch(`${baseUrlManager.getBaseUrl()}/api/v2/health`, {
      headers: createHeaders(),
    });

    await handleErrors(response);

    return true;
  };

  return {
    useContinuous: (): UseQueryResult<boolean, Error> =>
      useQuery({
        queryKey: getHealthKey.root(),
        queryFn: getHealth,
        retry: false,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};

export const getHealthKey = new KeyFactory(SliceKeys.server, "get_health");
