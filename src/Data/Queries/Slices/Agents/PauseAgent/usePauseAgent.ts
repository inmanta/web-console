import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getAgentKey } from "../GetAgents/useGetAgents";

/**
 * Interface for pausing/resuming agents parameters
 */
interface PauseAgentParams {
  name: string;
  action: "pause" | "unpause" | "keep_paused_on_resume" | "unpause_on_resume";
}

/**
 * React Query hook for pausing/resuming agent .
 *
 * @returns {UseMutationResult<void, Error, ConfigUpdate, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePauseAgent = (
  options?: UseMutationOptions<void, Error, PauseAgentParams, unknown>
): UseMutationResult<void, Error, PauseAgentParams, unknown> => {
  const client = useQueryClient();

  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<null>;

  return useMutation({
    mutationFn: ({ name, action }) =>
      post(`/api/v2/agent/${encodeURIComponent(name)}/${action}`, null),
    mutationKey: ["pause_agent", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getAgentKey.root(), type: "active" });
    },
    ...options,
  });
};
