import { useContext } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Diagnostics } from "@inmanta/web-console-core/Domain/Diagnostics";
import { CustomError, useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * Return Signature of the useGetDiagnostics React Query
 */
interface GetDiagnostics {
  useOneTime: (lookBehind: string) => UseQueryResult<Diagnostics, CustomError>;
}

/**
 * React Query hook to fetch a diagnostics for a given instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetDiagnostics} An object containing the different available queries.
 * @returns {UseQueryResult<Diagnostics, CustomError>} returns.useOneTime - Fetch the diagnose report with a single query.
 */
export const useGetDiagnostics = (service: string, instanceId: string): GetDiagnostics => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = (lookBehind) =>
    `/lsm/v1/service_inventory/${service}/${instanceId}/diagnose?rejection_lookbehind=${lookBehind}&failure_lookbehind=${lookBehind}`;
  const get = useGet(env)<{ data: Diagnostics }>;

  return {
    useOneTime: (lookBehind: string): UseQueryResult<Diagnostics, CustomError> =>
      useQuery({
        queryKey: getDiagnosticsKey.single(instanceId, [{ service }, { lookBehind }, env]),
        queryFn: () => get(url(lookBehind)),
        select: (data) => data.data,
      }),
  };
};

export const getDiagnosticsKey = new KeyFactory(SliceKeys.serviceInstance, "get_diagnostics");
