import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "../../helpers";

/**
 * Interface for the dry run response
 */
interface Result {
  id: string;
  status: string;
}

/**
 * React Query mutation hook to trigger a dry run
 *
 * @returns {UseMutationResult<Result, Error>} The mutation result containing the dry run response
 */
export const useTriggerDryRun = (): UseMutationResult<Result, Error> => {
  const post = usePost()<Result>;

  return useMutation({
    mutationFn: () => post("/api/v2/desiredstate/dryrun"),
  });
};
