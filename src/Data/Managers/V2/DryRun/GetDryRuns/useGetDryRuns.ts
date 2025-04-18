import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL, useGet } from "../../helpers";
import { DryRun } from "../GetDryRunReport";

interface Response {
  data: DryRun[];
}

/**
 * Return signature of the useGetDryRunReport React Query hook
 */
interface GetDryRunReport {
  useContinuous: (version: string) => UseQueryResult<DryRun[], Error>;
}

/**
 * React Query hook to fetch details of a specific resource
 *
 * @returns {GetDryRunReport} An object containing the available queries
 * @returns {UseQueryResult<Resource.Details, Error>} returns.useOneTime - Fetch the resource details with a single query
 */
export const useGetDryRuns = (): GetDryRunReport => {
  const get = useGet()<Response>;

  return {
    useContinuous: (version: string): UseQueryResult<DryRun[], Error> =>
      useQuery({
        queryKey: ["get_dry_runs-continuous", version],
        queryFn: () => get(`/api/v2/dryrun/${version}`),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
