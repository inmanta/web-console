import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";
import { useFetchHelpers } from "@inmanta/web-console-core/Queries/Helpers/useFetchHelpers";
import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";

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

    await handleErrors(response, { method: "GET", path: "/api/v2/health" });

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
