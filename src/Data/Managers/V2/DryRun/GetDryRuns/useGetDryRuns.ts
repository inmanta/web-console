import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@/UI/Dependency";
import { REFETCH_INTERVAL, useGet } from "../../helpers";
import { DryRun } from "../GetDryRunReport";

/**
 * Response interface for the dry runs API response
 */
interface Response {
  data: DryRun[];
}

/**
 * Return signature of the useGetDryRuns React Query hook
 */
interface GetDryRuns {
  useContinuous: (version: string) => UseQueryResult<DryRun[], Error>;
}

/**
 * React Query hook to fetch all dry runs
 *
 * @returns {GetDryRuns} An object containing the available queries
 * @returns {UseQueryResult<DryRun[], Error>} returns.useOneTime - Fetch the dry runs with a single query
 */
export const useGetDryRuns = (): GetDryRuns => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useContinuous: (version: string): UseQueryResult<DryRun[], Error> =>
      useQuery({
        queryKey: ["get_dry_runs-continuous", version, env],
        queryFn: () => get(`/api/v2/dryrun/${version}`),
        select: (data) => data.data,
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
