import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DependencyContext } from "@/UI";
import { usePost } from "@/Data/Queries";

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
        queryKey: ["get_dry_runs-continuous"],
      });
      client.refetchQueries({
        queryKey: ["get_dry_run_report-one_time"],
      });
    },
  });
};
