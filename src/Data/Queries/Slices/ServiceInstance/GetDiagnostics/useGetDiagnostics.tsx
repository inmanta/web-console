import { useContext } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CustomError, useGet } from "@/Data/Queries";
import { RawDiagnostics } from "@/Slices/Diagnose/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Return Signature of the useGetDiagnostics React Query
 */
interface GetDiagnostics {
  useOneTime: (lookBehind: string) => UseQueryResult<RawDiagnostics, CustomError>;
}

/**
 * React Query hook to fetch a diagnostics for a given instance
 *
 * @param service {string} - the service entity
 * @param instanceId {string} - the instance ID for which the data needs to be fetched.
 *
 * @returns {GetInstance} An object containing the different available queries.
 * @returns {UseQueryResult<ServiceInstanceModel, CustomError>} returns.useOneTime - Fetch the diagnose report with a single query.
 */
export const useGetDiagnostics = (service: string, instanceId: string): GetDiagnostics => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = (lookBehind) =>
    `/lsm/v1/service_inventory/${service}/${instanceId}/diagnose?rejection_lookbehind=${lookBehind}&failure_lookbehind=${lookBehind}`;
  const get = useGet(env)<{ data: RawDiagnostics }>;

  return {
    useOneTime: (lookBehind: string): UseQueryResult<RawDiagnostics, CustomError> =>
      useQuery({
        queryKey: ["get_diagnostics-one_time", service, instanceId, lookBehind, env],
        queryFn: () => get(url(lookBehind)),
        select: (data) => data.data,
      }),
  };
};
