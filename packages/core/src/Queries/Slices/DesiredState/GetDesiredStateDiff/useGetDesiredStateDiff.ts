import { useContext } from "react";
import { UseQueryResult, keepPreviousData, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Diff } from "@inmanta/web-console-core/Domain";
import { useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

/**
 * Interface for the API response containing the diff data
 */
interface Result {
  data: Diff.Resource[];
}

/**
 * The diff between two model versions, with the model versions it compares, so a diff kept on
 * screen while another one loads still says which model versions it is about.
 */
export interface ModelVersionDiff extends Diff.Identifiers {
  /** The resources of the diff and their changes. */
  resources: Diff.Resource[];
}

/**
 * Return signature of the useGetDesiredStateDiff React Query hook
 */
interface GetDesiredStateDiff {
  useOneTime: (from: string, to: string) => UseQueryResult<ModelVersionDiff, Error>;
}

/**
 * React Query hook to fetch the diff between two model versions. While the diff of other model
 * versions loads, it keeps returning the previous diff, marked with isPlaceholderData.
 *
 * @returns {GetDesiredStateDiff} An object containing the available queries.
 * @returns {UseQueryResult<ModelVersionDiff, Error>} returns.useOneTime - Fetch the diff with a single query.
 */
export const useGetDesiredStateDiff = (): GetDesiredStateDiff => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Result>;

  return {
    useOneTime: (from: string, to: string): UseQueryResult<ModelVersionDiff, Error> =>
      useQuery({
        queryKey: getDesiredStateDiffKey.single(from, [to, env]),
        queryFn: async () => {
          const response = await get(getUrl(from, to));

          return { from, to, resources: response.data };
        },
        placeholderData: keepPreviousData,
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

export const getDesiredStateDiffKey = new KeyFactory(
  SliceKeys.desiredState,
  "get_desired_state_diff"
);
