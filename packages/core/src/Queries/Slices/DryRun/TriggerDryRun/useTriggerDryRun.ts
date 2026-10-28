import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { usePost } from "@inmanta/web-console-core/Queries/Helpers";
import { getDryRunsKey } from "../GetDryRuns";

/**
 * React Query hook for starting a dry run on a whole model version.
 * It resolves to the id of the new dry run. On success it invalidates the dry run lists, then calls
 * the caller's own onSuccess once the lists include the new dry run.
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useTriggerDryRun = (
  options?: UseMutationOptions<string, Error, string>
): UseMutationResult<string, Error, string> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env, { expectResponseBody: true })<void, { data: string }>;

  return useMutation({
    mutationFn: async (version) => {
      const { data } = await post(`/api/v2/dryrun/${version}`);

      return data;
    },
    mutationKey: ["trigger_dry_run", env],
    ...options,
    onSuccess: async (...args) => {
      // Waits for the open lists to include the new dry run, so the caller can select it right away.
      await client.invalidateQueries({ queryKey: getDryRunsKey.root() });

      return options?.onSuccess?.(...args);
    },
  });
};
