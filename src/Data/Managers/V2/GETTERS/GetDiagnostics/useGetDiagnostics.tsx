import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { RawDiagnostics } from "@/Slices/Diagnose/Core/Domain";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

/**
 * Return Signature of the useGetDiagnostics React Query
 */
interface GetDiagnostics {
  useOneTime: (version: string) => UseQueryResult<RawDiagnostics, Error>;
  useContinuous: (version: string) => UseQueryResult<RawDiagnostics, Error>;
}

/**
 * React Query hook to fetch a diagnostics for a given instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 * @param environment {string} - the environment in which the instance belongs
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the instance with a single query.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useContinuous - Fetch the instance with a recursive query with an interval of 5s.
 */
export const useGetDiagnostics = (
  service: string,
  instanceId: string,
  environment: string,
): GetDiagnostics => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchDiagnostics = async (
    lookBehind: string,
  ): Promise<{ data: RawDiagnostics }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instanceId}/diagnose?rejection_lookbehind=${lookBehind}&failure_lookbehind=${lookBehind}`,
      {
        headers,
      },
    );

    await handleErrors(
      response,
      `Failed to fetch instance for id: ${instanceId}`,
    );

    return response.json();
  };

  return {
    useOneTime: (version: string): UseQueryResult<RawDiagnostics, Error> =>
      useQuery({
        queryKey: ["get_diagnostics-one_time", service, instanceId, version],
        queryFn: () => fetchDiagnostics(version),
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: (version: string): UseQueryResult<RawDiagnostics, Error> =>
      useQuery({
        queryKey: ["get_diagnostics-continuous", service, instanceId, version],
        queryFn: () => fetchDiagnostics(version),
        retry: false,
        select: (data) => data.data,
        refetchInterval: 5000,
      }),
  };
};
