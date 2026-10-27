import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DryRunContext, ResourceActionFilter } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { getRequiredResponseBody, usePost } from "@inmanta/web-console-core/Queries/Helpers";
import { getDryRunsKey } from "@inmanta/web-console-core/Queries/Slices/DryRun";
import { StartedDryRun } from "./types";

/**
 * What a filtered dry run is started with: the filter of the resources it covers, and the context
 * stored with it for its report. Without a context (null or left out), it gets none.
 */
interface DryRunFilteredRequest {
  filter: ResourceActionFilter;
  context?: DryRunContext | null;
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
 * modelVersion or instanceVersion, or sets isOrphan: false for the active model version. The
 * context is stored with the dry run and comes back with its report. It resolves to the new dry
 * run's id and model version, which locate its report. On success it invalidates the dry run lists
 * so the new report shows up in the Compliance Check page, then calls the caller's own onSuccess
 * once the lists include the new dry run.
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useDryRunFiltered = (
  options?: UseMutationOptions<StartedDryRun, Error, DryRunFilteredRequest>
): UseMutationResult<StartedDryRun, Error, DryRunFilteredRequest> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<DryRunFilteredRequest, { data: DryRunFilteredResponse }>;

  return useMutation({
    mutationFn: async (request) => {
      const { data } = getRequiredResponseBody(await post("/api/v2/dryrun_filtered", request));

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
