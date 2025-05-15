import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Diff } from "@/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { useGet } from "../../helpers";

/**
 * Interface for the API response containing the diff data
 */
interface Result {
  data: Diff.Resource[];
}

/**
 * Return signature of the useGetDesiredStateDiff React Query hook
 */
interface GetDesiredStateDiff {
  useOneTime: (from: string, to: string) => UseQueryResult<Diff.Resource[], Error>;
}

/**
 * React Query hook to fetch the diff between two desired states
 *
 * @returns {GetDesiredStateDiff} An object containing the available queries.
 * @returns {UseQueryResult<Diff.Resource[], Error>} returns.useOneTime - Fetch the diff with a single query.
 */
export const useGetDesiredStateDiff = (): GetDesiredStateDiff => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useOneTime: (from: string, to: string): UseQueryResult<Diff.Resource[], Error> =>
      useQuery({
        queryKey: ["get_desired_state_diff-one_time", from, to, env],
        queryFn: () => get(getUrl(from, to)),
        select: (data) => data.data,
      }),
  };
};

/**
 * Constructs the URL for fetching the diff between two desired states
 *
 * @param query - The query parameters containing the from and to versions
 * @returns The constructed URL for fetching the diff
 */
export function getUrl(from: string, to: string): string {
  return `/api/v2/desiredstate/diff/${from}/${to}`;
}
