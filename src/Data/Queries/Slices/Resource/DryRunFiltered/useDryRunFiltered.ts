import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ResourceActionFilter } from "@/Core";
import { usePost } from "@/Data/Queries/Helpers";
import { getDryRunsKey } from "@/Data/Queries/Slices/DryRun";
import { DependencyContext } from "@/UI/Dependency";
import { StartedDryRun } from "./types";

/**
 * Request body for the dryrun_filtered endpoint.
 */
interface Body {
  filter: ResourceActionFilter;
}

/**
 * The new dry run as the dryrun_filtered endpoint returns it: its id, and the model version the
 * server resolved the filter to, named like the fields of a dry run report.
 */
interface DryRunFilteredResponse {
  id: string;
  model: number;
}

/**
 * React Query hook for starting a dry run on the resources matching a filter.
 *
 * The server runs a dry run on a single model version, so the filter either sets one with
 * modelVersion or instanceVersion, or sets isOrphan: false for the active model version. It
 * resolves to the new dry run's id and model version, which locate its report. On success it
 * invalidates the dry run lists so the new report shows up in the Compliance Check page, then
 * calls the caller's own onSuccess once the lists include the new dry run.
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDryRunFiltered = (
  options?: UseMutationOptions<StartedDryRun, Error, ResourceActionFilter>
): UseMutationResult<StartedDryRun, Error, ResourceActionFilter> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: async (filter) => {
      const { data }: { data: DryRunFilteredResponse } = await post("/api/v2/dryrun_filtered", {
        filter,
      });

      return { id: data.id, modelVersion: data.model };
    },
    mutationKey: ["dryrun_filtered", env],
    ...options,
    onSuccess: async (...args) => {
      // Waits for the open lists to include the new dry run, so the caller can select it right away.
      await client.invalidateQueries({ queryKey: getDryRunsKey.root() });

      return options?.onSuccess?.(...args);
    },
  });
};
