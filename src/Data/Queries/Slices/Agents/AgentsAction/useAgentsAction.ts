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
 * The bulk actions that can be applied to all agents at once.
 */
export type AgentsBulkAction =
  | "pause"
  | "unpause"
  | "keep_paused_on_resume"
  | "unpause_on_resume"
  | "remove_all_agent_venvs";

/**
 * Interface for the bulk agents action parameters
 */
interface AgentsActionParams {
  action: AgentsBulkAction;
}

/**
 * React Query hook for applying an action to all agents at once.
 *
 * @returns {UseMutationResult<void, Error, AgentsActionParams, unknown>} - The mutation object from `useMutation` hook.
 */
export const useAgentsAction = (
  options?: UseMutationOptions<void, Error, AgentsActionParams, unknown>
): UseMutationResult<void, Error, AgentsActionParams, unknown> => {
  const client = useQueryClient();

  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<null>;

  return useMutation({
    mutationFn: ({ action }) => post(`/api/v2/agents/${action}`, null),
    mutationKey: ["agents_bulk_action", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getAgentKey.root(), type: "active" });
    },
    ...options,
  });
};
