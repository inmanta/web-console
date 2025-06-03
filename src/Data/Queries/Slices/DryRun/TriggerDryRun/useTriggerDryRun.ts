import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getDryRunsFactory } from "../GetDryRuns";

/**
 * React Query hook for triggering a dry run
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const useTriggerDryRun = (
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<void>;

  return useMutation({
    mutationFn: (version) => post(`/api/v2/dryrun/${version}`),
    mutationKey: ["trigger_dry_run", env],
    ...options,
    onSuccess: () => {
      // Refetch the dry run queries
      client.refetchQueries({
        queryKey: getDryRunsFactory.root(),
      });
    },
  });
};
