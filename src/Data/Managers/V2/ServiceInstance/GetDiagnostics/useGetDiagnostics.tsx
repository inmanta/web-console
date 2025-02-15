import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { RawDiagnostics } from "@/Slices/Diagnose/Core/Domain";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetDiagnostics React Query
 */
interface GetDiagnostics {
  useOneTime: (lookBehind: string) => UseQueryResult<RawDiagnostics, Error>;
}

/**
 * React Query hook to fetch a diagnostics for a given instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, Error>} returns.useOneTime - Fetch the diagnose report with a single query.
 */
export const useGetDiagnostics = (
  service: string,
  instanceId: string,
): GetDiagnostics => {
  const url = (lookBehind) =>
    `/lsm/v1/service_inventory/${service}/${instanceId}/diagnose?rejection_lookbehind=${lookBehind}&failure_lookbehind=${lookBehind}`;
  const get = useGet()<{ data: RawDiagnostics }>;

  return {
    useOneTime: (lookBehind: string): UseQueryResult<RawDiagnostics, Error> =>
      useQuery({
        queryKey: ["get_diagnostics-one_time", service, instanceId, lookBehind],
        queryFn: () => get(url(lookBehind)),
        retry: false,
        select: (data) => data.data,
      }),
  };
};
