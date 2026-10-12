import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getDryRunsKey, usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { ResourceActionFilter } from "../ResourceActionFilter";

/**
 * Request body for the dryrun_filtered endpoint.
 */
interface Body {
  filter: ResourceActionFilter;
}

/**
 * React Query hook for starting a dry run on the resources matching a filter.
 *
 * The server runs a dry run on a single model version, so the filter either sets one with
 * modelVersion or instanceVersion, or sets isOrphan: false for the active model version. On
 * success it invalidates the dry run lists so the new report shows up in the Compliance Check
 * page, then calls the caller's own onSuccess.
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDryRunFiltered = (
  options?: UseMutationOptions<void, Error, ResourceActionFilter>
): UseMutationResult<void, Error, ResourceActionFilter> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: (filter) => post("/api/v2/dryrun_filtered", { filter }),
    mutationKey: ["dryrun_filtered", env],
    ...options,
    onSuccess: (...args) => {
      client.invalidateQueries({ queryKey: getDryRunsKey.root() });
      options?.onSuccess?.(...args);
    },
  });
};
