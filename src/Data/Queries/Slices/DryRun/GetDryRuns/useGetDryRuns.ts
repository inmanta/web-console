import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { REFETCH_INTERVAL, useGet } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
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
        queryKey: getDryRunsKey.list([{ version }, env]),
        queryFn: () => get(`/api/v2/dryrun/${version}`),
        select: (data) => data.data,
        refetchInterval: (query) => (query.state.error ? false : REFETCH_INTERVAL),
      }),
  };
};

export const getDryRunsKey = new KeyFactory(SliceKeys.dryRun, "get_dry_runs");
